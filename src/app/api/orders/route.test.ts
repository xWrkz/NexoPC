// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const requestBody = {
  items: [{ productId: 11, quantity: 2 }],
  paymentMethod: "bacs",
  customer: { firstName: "Kevin", lastName: "Ventura", email: "kevin@example.com", phone: "999999999", address1: "Av. Test 123", city: "Trujillo", region: "La Libertad", postcode: "13001" },
};

const SECRET = "s".repeat(40);
const created = { ok: true, orderId: 90, orderNumber: "90", orderKey: "wc_order_abc123", status: "on-hold", paymentMethod: "bacs", checkoutUrl: null };

const orderRequest = (body: unknown, headers: Record<string, string> = {}) =>
  new Request("http://localhost/api/orders", { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: typeof body === "string" ? body : JSON.stringify(body) });

const configureBackend = () => {
  process.env.NEXT_PUBLIC_WORDPRESS_URL = "https://woo.test";
  process.env.NEXOPC_SIGNUP_SECRET = SECRET;
};

const backendReplies = (status: number, body: unknown) => {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

describe("POST /api/orders", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.NEXT_PUBLIC_WORDPRESS_URL;
    delete process.env.NEXOPC_SIGNUP_SECRET;
  });

  it("registra el pedido en el backend con el secreto compartido y sin usar precios del navegador", async () => {
    configureBackend();
    const fetchMock = backendReplies(201, created);
    const response = await POST(orderRequest({ ...requestBody, items: [{ productId: 11, quantity: 2, price: 1 }] }, { "X-Forwarded-For": "203.0.113.50" }));
    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({ ok: true, orderNumber: "90", paymentMethod: "bacs" });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://woo.test/wp-json/nexopc/v1/checkout");
    expect(init.headers["X-NexoPC-Store-Secret"]).toBe(SECRET);
    expect(init.headers["X-NexoPC-Client-IP"]).toBe("203.0.113.50");
    expect(JSON.parse(init.body).items).toEqual([{ productId: 11, quantity: 2 }]);
  });

  it("devuelve la URL de pago de Mercado Pago", async () => {
    configureBackend();
    const checkoutUrl = "https://www.mercadopago.com.pe/checkout/v1/redirect?order_id=ORDTST01";
    backendReplies(201, { ...created, status: "pending", paymentMethod: "mercadopago", checkoutUrl });
    const response = await POST(orderRequest({ ...requestBody, paymentMethod: "mercadopago" }));
    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({ ok: true, paymentMethod: "mercadopago", checkoutUrl });
  });

  it("no redirige a URLs de pago ajenas a Mercado Pago", async () => {
    configureBackend();
    backendReplies(201, { ...created, paymentMethod: "mercadopago", checkoutUrl: "https://mercadopago.com.evil.example/pay" });
    const response = await POST(orderRequest({ ...requestBody, paymentMethod: "mercadopago" }));
    expect(response.status).toBe(502);
    expect(await response.json()).not.toHaveProperty("checkoutUrl");
  });

  it("transmite los mensajes de stock del backend", async () => {
    configureBackend();
    backendReplies(409, { code: "nexopc_checkout_error", message: "Solo quedan 1 unidades de CPU.", data: { status: 409 } });
    const response = await POST(orderRequest(requestBody));
    expect(response.status).toBe(409);
    expect((await response.json()).message).toContain("Solo quedan 1 unidades");
  });

  it("transmite los errores por campo del backend", async () => {
    configureBackend();
    backendReplies(422, { code: "nexopc_checkout_error", message: "Revisa los campos marcados antes de continuar.", data: { status: 422, fields: { email: ["Ingresa un correo válido."] } } });
    const response = await POST(orderRequest(requestBody));
    expect(response.status).toBe(422);
    expect((await response.json()).errors).toEqual({ email: ["Ingresa un correo válido."] });
  });

  it("no expone mensajes internos del backend", async () => {
    configureBackend();
    backendReplies(500, { code: "internal", message: "Fatal error en wp-includes/class-wpdb.php" });
    const response = await POST(orderRequest(requestBody));
    expect(response.status).toBe(502);
    expect((await response.json()).message).not.toContain("wpdb");
  });

  it("responde 503 si falta la configuración del backend", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(orderRequest(requestBody));
    expect(response.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("acepta solo los métodos de pago conocidos", async () => {
    const response = await POST(orderRequest({ ...requestBody, paymentMethod: "culqi" }));
    expect(response.status).toBe(422);
  });

  it("devuelve los errores por campo que usa el checkout", async () => {
    const response = await POST(orderRequest({ ...requestBody, customer: { ...requestBody.customer, phone: "llamar luego" } }));
    expect(response.status).toBe(422);
    expect((await response.json()).errors.phone).toEqual(["Ingresa un teléfono válido."]);
  });

  it("rechaza pedidos con demasiadas líneas sin consultar el backend", async () => {
    configureBackend();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const items = Array.from({ length: 51 }, (_, index) => ({ productId: index + 1, quantity: 1 }));
    const response = await POST(orderRequest({ ...requestBody, items }));
    expect(response.status).toBe(422);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rechaza cuerpos demasiado grandes aunque no declaren su tamaño", async () => {
    const response = await POST(orderRequest("x".repeat(33 * 1024)));
    expect(response.status).toBe(413);
  });

  it("rechaza contenido que no sea JSON", async () => {
    const response = await POST(new Request("http://localhost/api/orders", { method: "POST", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(requestBody) }));
    expect(response.status).toBe(415);
  });

  it("rechaza orígenes ajenos y acepta el propio detrás del proxy", async () => {
    const foreign = await POST(orderRequest(requestBody, { Origin: "https://evil.example", "X-Forwarded-Host": "nexopc.wrkz.net" }));
    expect(foreign.status).toBe(403);
    const own = await POST(orderRequest(requestBody, { Origin: "https://nexopc.wrkz.net", "X-Forwarded-Host": "nexopc.wrkz.net" }));
    expect(own.status).toBe(503);
  });

  it("limita los intentos por IP usando la dirección añadida por el proxy", async () => {
    const send = (forwardedFor: string) => POST(orderRequest(requestBody, { "X-Forwarded-For": forwardedFor }));
    for (let attempt = 0; attempt < 10; attempt += 1) {
      expect((await send(`1.1.1.${attempt}, 203.0.113.9`)).status).toBe(503);
    }
    expect((await send("1.1.1.99, 203.0.113.9")).status).toBe(429);
    expect((await send("203.0.113.10")).status).toBe(503);
  });

  it("no consume intentos con formularios incompletos", async () => {
    const invalid = { ...requestBody, customer: { ...requestBody.customer, phone: "x" } };
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const response = await POST(orderRequest(invalid, { "X-Forwarded-For": "203.0.113.20" }));
      expect(response.status).toBe(422);
    }
  });
});
