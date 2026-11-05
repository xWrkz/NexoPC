// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const SECRET = "s".repeat(40);
const valid = {
  firstName: "Kevin",
  lastName: "Ventura",
  email: "kevin@example.com",
  phone: "987 654 321",
  dni: "12345678",
  password: "clave1234",
  acceptTerms: true,
};

let ipCounter = 0;
const registerRequest = (body: unknown, headers: Record<string, string> = {}) =>
  new Request("http://localhost/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": `10.0.0.${++ipCounter}`, ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

describe("POST /api/register", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_WORDPRESS_URL = "https://wp.test";
    process.env.NEXOPC_SIGNUP_SECRET = SECRET;
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.NEXT_PUBLIC_WORDPRESS_URL;
    delete process.env.NEXOPC_SIGNUP_SECRET;
  });

  it("crea la cuenta enviando el secreto, la IP del cliente y el celular normalizado", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true, customerId: 5 }), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(registerRequest(valid, { "x-forwarded-for": "1.1.1.1, 200.1.2.3" }));
    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({ ok: true });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://wp.test/wp-json/nexopc/v1/customers/register");
    expect(init.headers["X-NexoPC-Signup-Secret"]).toBe(SECRET);
    expect(init.headers["X-NexoPC-Client-IP"]).toBe("200.1.2.3");
    expect(JSON.parse(init.body).phone).toBe("987654321");
  });

  it("devuelve errores por campo sin llamar al backend", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(registerRequest({ ...valid, dni: "123" }));
    expect(response.status).toBe(422);
    expect((await response.json()).errors.dni).toBeDefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("transmite el aviso de correo duplicado del backend", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ code: "nexopc_signup_error", message: "Ya existe una cuenta con este correo.", data: { status: 409, fields: { email: ["Ya existe una cuenta con este correo."] } } }), { status: 409 })));
    const response = await POST(registerRequest(valid));
    expect(response.status).toBe(409);
    expect((await response.json()).errors.email[0]).toMatch(/correo/);
  });

  it("no expone errores internos del backend", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: "SQL error interno" }), { status: 500 })));
    const response = await POST(registerRequest(valid));
    expect(response.status).toBe(502);
    expect(JSON.stringify(await response.json())).not.toContain("SQL");
  });

  it("responde 503 si falta el secreto compartido", async () => {
    delete process.env.NEXOPC_SIGNUP_SECRET;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect((await POST(registerRequest(valid))).status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("finge éxito ante el campo trampa sin crear nada", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(registerRequest({ ...valid, website: "https://spam.test" }));
    expect(response.status).toBe(201);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rechaza orígenes ajenos", async () => {
    expect((await POST(registerRequest(valid, { origin: "https://evil.test" }))).status).toBe(403);
  });

  it("limita los intentos por IP", async () => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async () => new Response("{}", { status: 201 })));
    const headers = { "x-forwarded-for": "203.0.113.9" };
    for (let i = 0; i < 5; i++) expect((await POST(registerRequest(valid, headers))).status).toBe(201);
    expect((await POST(registerRequest(valid, headers))).status).toBe(429);
  });
});
