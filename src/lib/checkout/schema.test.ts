import { describe, expect, it } from "vitest";
import { isMercadoPagoCheckoutUrl, orderSchema } from "./schema";
const valid={items:[{productId:1,quantity:1}],paymentMethod:"bacs",customer:{firstName:"Kevin",lastName:"Ventura",email:"kevin@example.com",phone:"999999999",address1:"Av. Test 123",city:"Trujillo",region:"LAL",postcode:"13001"}};
describe("orderSchema",()=>{it("acepta un pedido pendiente válido",()=>expect(orderSchema.safeParse(valid).success).toBe(true));it("rechaza cantidades inválidas",()=>expect(orderSchema.safeParse({...valid,items:[{productId:1,quantity:0}]}).success).toBe(false));
  it("exige un código de región válido", () => {
    expect(orderSchema.safeParse({ ...valid, customer: { ...valid.customer, region: "La Libertad" } }).success).toBe(false);
    expect(orderSchema.safeParse({ ...valid, customer: { ...valid.customer, region: "LMA" } }).success).toBe(true);
  });
  it("acepta el código postal vacío u omitido, pero solo con números", () => {
    expect(orderSchema.safeParse({ ...valid, customer: { ...valid.customer, postcode: "" } }).success).toBe(true);
    const withoutPostcode: Partial<typeof valid.customer> = { ...valid.customer };
    delete withoutPostcode.postcode;
    expect(orderSchema.safeParse({ ...valid, customer: withoutPostcode }).success).toBe(true);
    expect(orderSchema.safeParse({ ...valid, customer: { ...valid.customer, postcode: "13-001" } }).success).toBe(false);
  });
});

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
