// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const requestBody = {
  items: [{ productId: 11, quantity: 2 }],
  paymentMethod: "bacs",
  customer: { firstName: "Kevin", lastName: "Ventura", email: "kevin@example.com", phone: "999999999", address1: "Av. Test 123", city: "Trujillo", region: "La Libertad", postcode: "13001" },
};

const product = { id: 11, name: "CPU", status: "publish", purchasable: true, stock_status: "instock", stock_quantity: 3, manage_stock: true, price: "500" };

const orderRequest = (body: unknown, headers: Record<string, string> = {}) =>
  new Request("http://localhost/api/orders", { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: typeof body === "string" ? body : JSON.stringify(body) });

const configureWoo = () => {
  process.env.NEXT_PUBLIC_WORDPRESS_URL = "https://woo.test";
  process.env.WC_CONSUMER_KEY = "key";
  process.env.WC_CONSUMER_SECRET = "secret";
};

describe("POST /api/orders", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.NEXT_PUBLIC_WORDPRESS_URL;
    delete process.env.WC_CONSUMER_KEY;
    delete process.env.WC_CONSUMER_SECRET;
  });

  it("crea un pedido pendiente solo después de comprobar producto y stock", async () => {
    configureWoo();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(product), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 90, number: "90", status: "on-hold" }), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(orderRequest(requestBody));
    expect(response.status).toBe(201);
    expect((await response.json()).ok).toBe(true);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).set_paid).toBe(false);
  });

  it("detiene el pedido cuando no hay stock", async () => {
    configureWoo();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ ...product, stock_status: "outofstock", stock_quantity: 0 }), { status: 200 })));
    const response = await POST(orderRequest(requestBody));
    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({ ok: false });
  });

  it("suma cantidades de líneas duplicadas del mismo producto para impedir sobrepasar el stock", async () => {
    configureWoo();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ ...product, stock_quantity: 1 }), { status: 200 })));
    const duplicateLinesBody = {
      ...requestBody,
      items: [
        { productId: 11, quantity: 1 },
        { productId: 11, quantity: 1 },
      ],
    };
    const response = await POST(orderRequest(duplicateLinesBody));
    expect(response.status).toBe(409);
    expect((await response.json()).message).toContain("Solo quedan 1 unidades");
  });

  it.each([
    ["no publicado", { status: "draft" }],
    ["no comprable", { purchasable: false }],
    ["sin precio", { price: "" }],
  ])("no crea el pedido con un producto %s", async (_, overrides) => {
    configureWoo();
    const fetchMock = vi.fn().mockImplementation(async () => new Response(JSON.stringify({ ...product, ...overrides }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(orderRequest(requestBody));
    expect(response.status).toBe(409);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("no crea el pedido si la variación pertenece a un producto no publicado", async () => {
    configureWoo();
    const fetchMock = vi.fn().mockImplementation(async (url: string) => new Response(JSON.stringify(url.includes("/variations/") ? product : { ...product, status: "private" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(orderRequest({ ...requestBody, items: [{ productId: 11, variationId: 12, quantity: 1 }] }));
    expect(response.status).toBe(409);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("no expone el mensaje interno de WooCommerce", async () => {
    configureWoo();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ code: "woocommerce_rest_cannot_view", message: "Lo sentimos, no puedes ver recursos." }), { status: 401 })));
    const response = await POST(orderRequest(requestBody));
    expect(response.status).toBe(502);
    expect((await response.json()).message).not.toContain("recursos");
  });

  it("indica que el producto ya no está disponible cuando WooCommerce responde 404", async () => {
    configureWoo();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ code: "woocommerce_rest_product_invalid_id", message: "Invalid ID." }), { status: 404 })));
    const response = await POST(orderRequest(requestBody));
    expect(response.status).toBe(409);
    expect((await response.json()).message).toContain("ya no está disponible");
  });

  it("devuelve los errores por campo que usa el checkout", async () => {
    const response = await POST(orderRequest({ ...requestBody, customer: { ...requestBody.customer, phone: "llamar luego" } }));
    expect(response.status).toBe(422);
    expect((await response.json()).errors.phone).toEqual(["Ingresa un teléfono válido."]);
  });

  it("rechaza pedidos con demasiadas líneas sin consultar WooCommerce", async () => {
    configureWoo();
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
