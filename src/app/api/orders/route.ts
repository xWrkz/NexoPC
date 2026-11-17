import { NextResponse } from "next/server";
import { isMercadoPagoCheckoutUrl, orderSchema, OrderResponse, PaymentMethod } from "@/lib/checkout/schema";
import { callStore } from "@/lib/checkout/backend";
import { readSession } from "@/lib/account/session";
import { clientIp, createRateLimiter, fieldErrors, isForeignOrigin, isJsonRequest, readBody } from "@/lib/http/request";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 32 * 1024;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 10;
const SERVICE_UNAVAILABLE = "El servicio de pedidos no está disponible en este momento.";
const SESSION_REQUIRED = "Inicia sesión para completar tu compra.";
const GENERIC_FAILURE = "No pudimos conectar con el servidor de la tienda. Inténtalo nuevamente en unos minutos.";

const isRateLimited = createRateLimiter(RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);

const error = (message: string, errors?: Record<string, string[]>, status = 400) =>
  NextResponse.json<OrderResponse>({ ok: false, message, errors }, { status });
const sessionRequired = () => NextResponse.json<OrderResponse>({ ok: false, message: SESSION_REQUIRED, loginRequired: true }, { status: 401 });

type BackendOrder = { orderId?: number; orderNumber?: string; status?: string; paymentMethod?: PaymentMethod; checkoutUrl?: string | null };
type BackendError = { code?: string; message?: string; data?: { fields?: Record<string, string[]> } };

export async function POST(request: Request) {
  if (isForeignOrigin(request)) {
    return error("Solicitud no válida.", undefined, 403);
  }
  if (!isJsonRequest(request)) {
    return error("No pudimos leer los datos del pedido.", undefined, 415);
  }

  // Solo compran clientes con cuenta: el pedido queda en su historial.
  const session = await readSession();
  if (!session) return sessionRequired();

  const rawBody = await readBody(request, MAX_BODY_BYTES);
  if (rawBody === null) {
    return error("El pedido es demasiado grande.", undefined, 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return error("No pudimos leer los datos del pedido.");
  }

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return error("Revisa los campos marcados antes de continuar.", fieldErrors(parsed.error.issues, "customer"), 422);
  }

  const ip = clientIp(request);
  if (isRateLimited(ip)) {
    return error("Recibimos demasiados intentos. Espera unos minutos antes de volver a intentarlo.", undefined, 429);
  }

  try {
    // WordPress vuelve a validar productos, precios y stock con datos del catálogo, nunca con los del navegador.
    const reply = await callStore("checkout", { method: "POST", body: parsed.data, clientIp: ip, session });
    if (!reply) return error(SERVICE_UNAVAILABLE, undefined, 503);

    if (reply.status === 201) {
      const order = (reply.data ?? {}) as BackendOrder;
      const isMercadoPago = parsed.data.paymentMethod === "mercadopago";
      if (!order.orderId || !order.orderNumber || (isMercadoPago && !isMercadoPagoCheckoutUrl(order.checkoutUrl))) {
        console.error("[Orders API] Respuesta inesperada del backend:", { hasOrder: Boolean(order.orderId), method: parsed.data.paymentMethod });
        return error(GENERIC_FAILURE, undefined, 502);
      }
      return NextResponse.json<OrderResponse>(
        {
          ok: true,
          orderId: order.orderId,
          orderNumber: order.orderNumber,
          status: order.status ?? "pending",
          paymentMethod: parsed.data.paymentMethod,
          ...(isMercadoPago ? { checkoutUrl: order.checkoutUrl as string } : {}),
          message: isMercadoPago ? "Te llevamos a Mercado Pago para completar el pago." : "Tu pedido fue registrado correctamente.",
        },
        { status: 201 }
      );
    }

    const failure = (reply.data ?? {}) as BackendError;
    if (reply.status === 401 && failure.code === "nexopc_session_invalid") return sessionRequired();
    // 409 (stock o precio), 422 (validación) y 503 traen mensajes pensados para el cliente.
    if ([409, 422].includes(reply.status) && failure.message) {
      return error(failure.message, failure.data?.fields, reply.status);
    }
    if (reply.status === 503) return error(failure.message || SERVICE_UNAVAILABLE, undefined, 503);
    console.error("[Orders API] El backend rechazó el pedido:", { status: reply.status });
    return error(GENERIC_FAILURE, undefined, 502);
  } catch (cause) {
    console.error("[Orders API] Error al conectar con el backend:", cause);
    return error(GENERIC_FAILURE, undefined, 502);
  }
}
