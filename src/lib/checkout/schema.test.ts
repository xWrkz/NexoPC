import { describe, expect, it } from "vitest";
import { isMercadoPagoCheckoutUrl, orderSchema } from "./schema";
const valid={items:[{productId:1,quantity:1}],paymentMethod:"bacs",customer:{firstName:"Kevin",lastName:"Ventura",email:"kevin@example.com",phone:"999999999",address1:"Av. Test 123",city:"Trujillo",region:"La Libertad",postcode:"13001"}};
describe("orderSchema",()=>{it("acepta un pedido pendiente válido",()=>expect(orderSchema.safeParse(valid).success).toBe(true));it("rechaza cantidades inválidas",()=>expect(orderSchema.safeParse({...valid,items:[{productId:1,quantity:0}]}).success).toBe(false));});

describe("isMercadoPagoCheckoutUrl", () => {
  it.each([
    "https://www.mercadopago.com.pe/checkout/v1/redirect?order_id=ORDTST01",
    "https://mercadopago.com/checkout",
  ])("acepta %s", (url) => expect(isMercadoPagoCheckoutUrl(url)).toBe(true));

  it.each([
    "http://www.mercadopago.com.pe/checkout",
    "https://mercadopago.com.pe.evil.example/checkout",
    "https://evilmercadopago.com/checkout",
    "javascript:alert(1)",
    null,
  ])("rechaza %s", (url) => expect(isMercadoPagoCheckoutUrl(url)).toBe(false));
});
