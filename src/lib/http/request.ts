// Utilidades compartidas por las rutas API públicas (pedidos, registro).

// Traefik añade la IP real del cliente al final de X-Forwarded-For.
export const clientIp = (request: Request) =>
  request.headers.get("x-forwarded-for")?.split(",").pop()?.trim() || null;

export function isForeignOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host !== host;
  } catch {
    return true;
  }
}

export const isJsonRequest = (request: Request) =>
  Boolean(request.headers.get("content-type")?.toLowerCase().startsWith("application/json"));

/** Lee el cuerpo sin superar `maxBytes`, aunque el cliente no declare Content-Length. */
export async function readBody(request: Request, maxBytes: number) {
  if (Number(request.headers.get("content-length") ?? 0) > maxBytes) return null;
  if (!request.body) return "";

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) return text + decoder.decode();
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      return null;
    }
    text += decoder.decode(value, { stream: true });
  }
}

/** Límite en memoria por IP. Suficiente para una sola instancia del frontend. */
export function createRateLimiter(max: number, windowMs: number) {
  const attempts = new Map<string, { count: number; resetAt: number }>();
  return (ip: string | null) => {
    if (!ip) return false;
    const now = Date.now();
    for (const [key, entry] of attempts) {
      if (entry.resetAt <= now) attempts.delete(key);
    }
    const entry = attempts.get(ip);
    if (!entry) {
      attempts.set(ip, { count: 1, resetAt: now + windowMs });
      return false;
    }
    entry.count += 1;
    return entry.count > max;
  };
}

export const fieldErrors = (issues: { path: PropertyKey[]; message: string }[], nestedRoot?: string) => {
  const fields: Record<string, string[]> = {};
  for (const issue of issues) {
    const key = String(nestedRoot && issue.path[0] === nestedRoot ? issue.path[1] ?? nestedRoot : issue.path[0] ?? "form");
    if (!fields[key]) fields[key] = [issue.message];
  }
  return fields;
};
