// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const requestBody = {
  items: [{ productId: 11, quantity: 2 }],
  paymentMethod: "bacs",
  customer: { firstName: "Kevin", lastName: "Ventura", email: "kevin@example.com", phone: "999999999", address1: "Av. Test 123", city: "Trujillo", region: "La Libertad", postcode: "13001" },
};

describe("POST /api/orders", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.NEXT_PUBLIC_WORDPRESS_URL;
    delete process.env.WC_CONSUMER_KEY;
    delete process.env.WC_CONSUMER_SECRET;
  });

  it("crea un pedido pendiente solo después de comprobar producto y stock", async () => {
    process.env.NEXT_PUBLIC_WORDPRESS_URL = "https://woo.test";
    process.env.WC_CONSUMER_KEY = "key";
    process.env.WC_CONSUMER_SECRET = "secret";
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 11, name: "CPU", stock_status: "instock", stock_quantity: 3, manage_stock: true, price: "500" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 90, number: "90", status: "on-hold" }), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(new Request("http://localhost/api/orders", { method: "POST", body: JSON.stringify(requestBody) }));
    expect(response.status).toBe(201);
    expect((await response.json()).ok).toBe(true);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).set_paid).toBe(false);
  });

  it("detiene el pedido cuando no hay stock", async () => {
    process.env.NEXT_PUBLIC_WORDPRESS_URL = "https://woo.test";
    process.env.WC_CONSUMER_KEY = "key";
    process.env.WC_CONSUMER_SECRET = "secret";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 11, name: "CPU", stock_status: "outofstock", stock_quantity: 0, manage_stock: true }), { status: 200 })));
    const response = await POST(new Request("http://localhost/api/orders", { method: "POST", body: JSON.stringify(requestBody) }));
    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({ ok: false });
  });
});
