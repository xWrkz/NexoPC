import { NextResponse } from "next/server";
import { registerSchema, RegisterResponse } from "@/lib/account/schema";
import { clientIp, createRateLimiter, fieldErrors, isForeignOrigin, isJsonRequest, readBody } from "@/lib/http/request";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 8 * 1024;
const BACKEND_TIMEOUT_MS = 10_000;
const SUCCESS_MESSAGE = "Tu cuenta fue creada correctamente.";
const UNAVAILABLE = "El registro no está disponible en este momento. Inténtalo más tarde.";

const isRateLimited = createRateLimiter(5, 10 * 60 * 1000);

const reply = (body: RegisterResponse, status: number) => NextResponse.json<RegisterResponse>(body, { status });
const error = (message: string, status: number, errors?: Record<string, string[]>) => reply({ ok: false, message, errors }, status);

const backendConfig = () => {
  const url = process.env.WORDPRESS_URL || process.env.NEXT_PUBLIC_WORDPRESS_URL;
  const secret = process.env.NEXOPC_SIGNUP_SECRET;
  if (!url || !secret || secret.length < 32) {
    console.error("[Register API] Configuración incompleta:", { hasUrl: Boolean(url), hasSecret: Boolean(secret) });
    return null;
  }
  return { url: url.replace(/\/$/, ""), secret };
};

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

  // Campo trampa invisible: respondemos como si todo fuera bien para no orientar al bot.
  if (body && typeof body === "object" && typeof (body as { website?: unknown }).website === "string" && (body as { website: string }).website.trim()) {
    return reply({ ok: true, message: SUCCESS_MESSAGE }, 201);
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return error("Revisa los campos marcados.", 422, fieldErrors(parsed.error.issues));

  const ip = clientIp(request);
  if (isRateLimited(ip)) return error("Recibimos demasiados intentos. Espera unos minutos antes de volver a intentarlo.", 429);

  const config = backendConfig();
  if (!config) return error(UNAVAILABLE, 503);

  try {
    const response = await fetch(`${config.url}/wp-json/nexopc/v1/customers/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-NexoPC-Signup-Secret": config.secret,
        ...(ip ? { "X-NexoPC-Client-IP": ip } : {}),
      },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
      signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
    });
    const data = (await response.json().catch(() => null)) as { message?: string; data?: { fields?: Record<string, string[]> } } | null;

    if (response.ok) return reply({ ok: true, message: SUCCESS_MESSAGE }, 201);

    // 409 (duplicado), 422 (validación) y 429 traen mensajes pensados para el cliente.
    if ([409, 422, 429].includes(response.status) && data?.message) {
      return error(data.message, response.status, data.data?.fields);
    }
    console.error("[Register API] El backend rechazó el registro:", { status: response.status });
    return error(response.status === 503 ? UNAVAILABLE : "No pudimos crear tu cuenta. Inténtalo nuevamente.", response.status === 503 ? 503 : 502);
  } catch (cause) {
    console.error("[Register API] Error al conectar con el backend:", cause);
    return error("No pudimos conectar con el servidor. Inténtalo nuevamente en unos minutos.", 502);
  }
}
