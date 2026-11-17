// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const jar = vi.hoisted(() => ({ current: null as null | ReturnType<typeof import("@/test/cookieJar").createCookieJar> }));
vi.mock("next/headers", async () => {
  const { createCookieJar } = await import("@/test/cookieJar");
  jar.current = createCookieJar();
  return { cookies: jar.current.cookies };
});

const SECRET = "s".repeat(40);
const SESSION = `12.${"T".repeat(43)}`;
let ipCounter = 0;
const loginRequest = (body: unknown, headers: Record<string, string> = {}) =>
  new Request("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": `10.1.0.${++ipCounter}`, ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
const backendReplies = (status: number, body: unknown) => {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    jar.current?.values.clear();
    process.env.NEXT_PUBLIC_WORDPRESS_URL = "https://wp.test";
    process.env.NEXOPC_SIGNUP_SECRET = SECRET;
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    delete process.env.NEXT_PUBLIC_WORDPRESS_URL;
    delete process.env.NEXOPC_SIGNUP_SECRET;
  });

  it("inicia sesión y guarda el token solo en una cookie HttpOnly", async () => {
    const fetchMock = backendReplies(200, { session: SESSION, expiresAt: new Date(Date.now() + 3600_000).toISOString(), customer: { firstName: "Kevin" } });
    const response = await POST(loginRequest({ email: " Kevin@Example.com ", password: "clave1234" }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ ok: true, firstName: "Kevin" });
    expect(JSON.stringify(body)).not.toContain(SESSION);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://wp.test/wp-json/nexopc/v1/customers/login");
    expect(init.headers["X-NexoPC-Store-Secret"]).toBe(SECRET);
    expect(JSON.parse(init.body)).toEqual({ email: "kevin@example.com", password: "clave1234" });

    const session = jar.current!.values.get("nexopc_session");
    expect(session?.value).toBe(SESSION);
    expect(session?.options).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/" });
    expect(session?.options?.maxAge).toBeLessThanOrEqual(3600);
    expect(jar.current!.values.get("nexopc_cuenta")).toMatchObject({ value: "1", options: { httpOnly: false } });
  });

  it("responde con un mensaje genérico ante credenciales incorrectas", async () => {
    backendReplies(401, { code: "nexopc_login_failed", message: "Correo o contraseña incorrectos.", data: { status: 401 } });
    const response = await POST(loginRequest({ email: "kevin@example.com", password: "mala" }));
    expect(response.status).toBe(401);
    expect((await response.json()).message).toBe("Correo o contraseña incorrectos.");
    expect(jar.current!.values.size).toBe(0);
  });

  it("no confunde un secreto rechazado con credenciales incorrectas", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    backendReplies(401, { code: "rest_forbidden", message: "No autorizado.", data: { status: 401 } });
    const response = await POST(loginRequest({ email: "kevin@example.com", password: "clave1234" }));
    expect(response.status).toBe(502);
  });

  it("no acepta un token con formato inesperado del backend", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    backendReplies(200, { session: "12.<script>", customer: {} });
    const response = await POST(loginRequest({ email: "kevin@example.com", password: "clave1234" }));
    expect(response.status).toBe(502);
    expect(jar.current!.values.size).toBe(0);
  });

  it("valida los campos sin llamar al backend", async () => {
    const fetchMock = backendReplies(200, {});
    const response = await POST(loginRequest({ email: "no-es-correo", password: "" }));
    expect(response.status).toBe(422);
    const body = await response.json();
    expect(body.errors.email).toBeDefined();
    expect(body.errors.password).toBeDefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("transmite el límite de intentos del backend", async () => {
    backendReplies(429, { code: "nexopc_account_error", message: "Recibimos demasiados intentos.", data: { status: 429 } });
    const response = await POST(loginRequest({ email: "kevin@example.com", password: "clave1234" }));
    expect(response.status).toBe(429);
  });

  it("rechaza orígenes ajenos", async () => {
    const fetchMock = backendReplies(200, {});
    const response = await POST(loginRequest({ email: "kevin@example.com", password: "clave1234" }, { origin: "https://evil.example" }));
    expect(response.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("responde 503 sin configuración del backend", async () => {
    delete process.env.NEXOPC_SIGNUP_SECRET;
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const response = await POST(loginRequest({ email: "kevin@example.com", password: "clave1234" }));
    expect(response.status).toBe(503);
  });
});
