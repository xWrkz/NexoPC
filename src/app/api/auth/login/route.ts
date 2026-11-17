import { NextResponse } from "next/server";
import { loginSchema, LoginResponse } from "@/lib/account/schema";
import { isSessionValue, startSession } from "@/lib/account/session";
import { callStore } from "@/lib/checkout/backend";
import { clientIp, createRateLimiter, fieldErrors, isForeignOrigin, isJsonRequest, readBody } from "@/lib/http/request";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 4 * 1024;
const UNAVAILABLE = "El inicio de sesión no está disponible en este momento. Inténtalo más tarde.";

const isRateLimited = createRateLimiter(10, 10 * 60 * 1000);

const error = (message: string, status: number, errors?: Record<string, string[]>) =>
  NextResponse.json<LoginResponse>({ ok: false, message, errors }, { status });

type BackendLogin = { session?: string; expiresAt?: string; customer?: { firstName?: string } };

export async function POST(request: Request) {
  if (isForeignOrigin(request)) return error("Solicitud no válida.", 403);
  if (!isJsonRequest(request)) return error("No pudimos leer tus datos.", 415);

  const rawBody = await readBody(request, MAX_BODY_BYTES);
  if (rawBody === null) return error("Los datos enviados son demasiado grandes.", 413);

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return error("No pudimos leer tus datos.", 400);
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return error("Revisa los campos marcados.", 422, fieldErrors(parsed.error.issues));

  const ip = clientIp(request);
  if (isRateLimited(ip)) return error("Recibimos demasiados intentos. Espera unos minutos antes de volver a intentarlo.", 429);

  try {
    const reply = await callStore("customers/login", { method: "POST", body: parsed.data, clientIp: ip });
    if (!reply) return error(UNAVAILABLE, 503);

    const data = (reply.data ?? {}) as BackendLogin & { message?: string };
    if (reply.status === 200 && isSessionValue(data.session)) {
      await startSession(data.session, data.expiresAt);
      return NextResponse.json<LoginResponse>({ ok: true, firstName: data.customer?.firstName ?? "" });
    }
    if (reply.status === 401 && (reply.data as { code?: string } | null)?.code === "nexopc_login_failed") {
      return error("Correo o contraseña incorrectos.", 401);
    }
    if ([422, 429].includes(reply.status) && data.message) return error(data.message, reply.status);
    console.error("[Login API] Respuesta inesperada del backend:", { status: reply.status });
    return error(reply.status === 503 ? UNAVAILABLE : "No pudimos iniciar sesión. Inténtalo nuevamente.", reply.status === 503 ? 503 : 502);
  } catch (cause) {
    console.error("[Login API] Error al conectar con el backend:", cause);
    return error("No pudimos conectar con el servidor. Inténtalo nuevamente en unos minutos.", 502);
  }
}
