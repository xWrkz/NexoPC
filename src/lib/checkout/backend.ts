// Llamadas servidor a servidor con el backend de WordPress para el checkout.
// El secreto compartido nunca sale del servidor Next.js.

const BACKEND_TIMEOUT_MS = 20_000;

export const storeBackend = () => {
  const url = process.env.WORDPRESS_URL || process.env.NEXT_PUBLIC_WORDPRESS_URL;
  const secret = process.env.NEXOPC_SIGNUP_SECRET;
  if (!url || !secret || secret.length < 32) {
    console.error("[Checkout] Configuración del backend incompleta:", { hasUrl: Boolean(url), hasSecret: Boolean(secret) });
    return null;
  }
  return { url: url.replace(/\/$/, ""), secret };
};

export type BackendReply = { status: number; data: Record<string, unknown> | null };

export async function callStore(path: string, init: { method?: string; body?: unknown; clientIp?: string | null } = {}): Promise<BackendReply | null> {
  const backend = storeBackend();
  if (!backend) return null;
  const response = await fetch(`${backend.url}/wp-json/nexopc/v1/${path}`, {
    method: init.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      "X-NexoPC-Store-Secret": backend.secret,
      ...(init.clientIp ? { "X-NexoPC-Client-IP": init.clientIp } : {}),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
    signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
  });
  const data = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  return { status: response.status, data };
}
