import { NextResponse } from "next/server";
import { orderSchema, OrderResponse } from "@/lib/checkout/schema";

export const runtime = "nodejs";

type WooProduct = {
  id: number;
  type?: string;
  status?: string;
  purchasable?: boolean;
  price: string;
  stock_status: string;
  stock_quantity: number | null;
  manage_stock: boolean;
  name: string;
};

const MAX_BODY_BYTES = 32 * 1024;
const WOO_TIMEOUT_MS = 10_000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 10;
const SERVICE_UNAVAILABLE = "El servicio de pedidos no está disponible en este momento.";
const GENERIC_FAILURE = "No pudimos procesar tu solicitud en este momento.";
const UNAVAILABLE_PRODUCT = "Uno de los productos de tu pedido ya no está disponible.";

class ProductUnavailableError extends Error {}

const attempts = new Map<string, { count: number; resetAt: number }>();

const error = (message: string, errors?: Record<string, string[]>, status = 400) =>
  NextResponse.json<OrderResponse>({ ok: false, message, errors }, { status });

const config = () => {
  const url = process.env.WORDPRESS_URL || process.env.NEXT_PUBLIC_WORDPRESS_URL;
  const key = process.env.WC_CONSUMER_KEY;
  const secret = process.env.WC_CONSUMER_SECRET;

  if (!url || !key || !secret) {
    console.error("[Orders API] Credenciales de WooCommerce incompletas:", {
      hasUrl: Boolean(url),
      hasConsumerKey: Boolean(key),
      hasConsumerSecret: Boolean(secret),
    });
    return null;
  }

  return {
    url: url.replace(/\/$/, ""),
    auth: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`,
  };
};

async function woo(path: string, init: RequestInit = {}) {
  const settings = config();
  if (!settings) {
    throw new Error(SERVICE_UNAVAILABLE);
  }

  const response = await fetch(`${settings.url}/wp-json/wc/v3/${path}`, {
    ...init,
    headers: {
      Authorization: settings.auth,
      "Content-Type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(WOO_TIMEOUT_MS),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    console.error("[Orders API] WooCommerce rechazó la solicitud:", { path, status: response.status, code: data?.code, message: data?.message });
    if (response.status === 404) throw new ProductUnavailableError(UNAVAILABLE_PRODUCT);
    throw new Error(GENERIC_FAILURE);
  }
  return data;
}

// Traefik añade la IP real del cliente al final de X-Forwarded-For.
const clientIp = (request: Request) =>
  request.headers.get("x-forwarded-for")?.split(",").pop()?.trim() || null;

function isRateLimited(ip: string | null) {
  if (!ip) return false;
  const now = Date.now();
  for (const [key, entry] of attempts) {
    if (entry.resetAt <= now) attempts.delete(key);
  }
  const entry = attempts.get(ip);
  if (!entry) {
    attempts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

function isForeignOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host !== host;
  } catch {
    return true;
  }
}

async function readBody(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) return null;
  if (!request.body) return "";

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) return text + decoder.decode();
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      return null;
    }
    text += decoder.decode(value, { stream: true });
  }
}

const fieldErrors = (issues: { path: PropertyKey[]; message: string }[]) => {
  const fields: Record<string, string[]> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] === "customer" ? issue.path[1] ?? "customer" : issue.path[0] ?? "form");
    if (!fields[key]) fields[key] = [issue.message];
  }
  return fields;
};

export async function POST(request: Request) {
  if (isForeignOrigin(request)) {
    return error("Solicitud no válida.", undefined, 403);
  }
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return error("No pudimos leer los datos del pedido.", undefined, 415);
  }

  const rawBody = await readBody(request);
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
    return error("Revisa los campos marcados antes de continuar.", fieldErrors(parsed.error.issues), 422);
  }

  if (isRateLimited(clientIp(request))) {
    return error("Recibimos demasiados intentos. Espera unos minutos antes de volver a intentarlo.", undefined, 429);
  }

  try {
    const aggregatedMap = new Map<string, { productId: number; variationId?: number; quantity: number }>();
    for (const item of parsed.data.items) {
      const key = `${item.productId}:${item.variationId ?? 0}`;
      const existing = aggregatedMap.get(key);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        aggregatedMap.set(key, { ...item });
      }
    }

    const uniqueItems = Array.from(aggregatedMap.values());
    for (const item of uniqueItems) {
      if (item.quantity > 20) {
        return error("No puedes solicitar más de 20 unidades de un mismo producto.", { items: ["No puedes solicitar más de 20 unidades de un mismo producto."] }, 422);
      }
    }

    const fetchedProducts = await Promise.all(
      uniqueItems.map(async (item) => {
        const path = item.variationId
          ? `products/${item.productId}/variations/${item.variationId}`
          : `products/${item.productId}`;
        const product = (await woo(path)) as WooProduct;
        const parent = item.variationId ? ((await woo(`products/${item.productId}`)) as WooProduct) : product;
        return { item, product, parent };
      })
    );

    const items = [];
    for (const { item, product, parent } of fetchedProducts) {
      if (parent.status !== "publish" || product.status !== "publish") {
        return error(UNAVAILABLE_PRODUCT, undefined, 409);
      }

      if (!item.variationId && product.type === "variable") {
        return error(`Selecciona una variante válida para ${product.name}.`, undefined, 422);
      }

      if (product.stock_status !== "instock") {
        return error(`${product.name} ya no está disponible.`, undefined, 409);
      }

      if (product.purchasable !== true || !(Number(product.price) > 0)) {
        return error(`${product.name} no tiene un precio confirmado.`, undefined, 409);
      }

      if (product.manage_stock && product.stock_quantity !== null && product.stock_quantity < item.quantity) {
        return error(`Solo quedan ${product.stock_quantity} unidades de ${product.name}.`, undefined, 409);
      }

      items.push({
        product_id: item.productId,
        ...(item.variationId ? { variation_id: item.variationId } : {}),
        quantity: item.quantity,
      });
    }

    const { customer, paymentMethod } = parsed.data;
    const order = (await woo("orders", {
      method: "POST",
      body: JSON.stringify({
        payment_method: paymentMethod,
        payment_method_title:
          paymentMethod === "bacs" ? "Transferencia bancaria" : "Pago contraentrega",
        set_paid: false,
        status: "on-hold",
        billing: {
          first_name: customer.firstName,
          last_name: customer.lastName,
          email: customer.email,
          phone: customer.phone,
          address_1: customer.address1,
          city: customer.city,
          state: customer.region,
          postcode: customer.postcode,
          country: "PE",
        },
        shipping: {
          first_name: customer.firstName,
          last_name: customer.lastName,
          address_1: customer.address1,
          city: customer.city,
          state: customer.region,
          postcode: customer.postcode,
          country: "PE",
        },
        customer_note: customer.notes ?? "",
        line_items: items,
      }),
    })) as { id: number; number: string; status: string };

    return NextResponse.json<OrderResponse>(
      {
        ok: true,
        orderId: order.id,
        orderNumber: order.number,
        status: order.status,
        paymentMethod,
        message: "Tu pedido fue registrado correctamente.",
      },
      { status: 201 }
    );
  } catch (cause) {
    console.error("[Orders API] Error al registrar pedido:", cause);
    if (cause instanceof ProductUnavailableError) {
      return error(cause.message, undefined, 409);
    }
    if (cause instanceof Error && cause.message === SERVICE_UNAVAILABLE) {
      return error(SERVICE_UNAVAILABLE, undefined, 503);
    }
    return error("No pudimos conectar con el servidor de la tienda. Inténtalo nuevamente en unos minutos.", undefined, 502);
  }
}
