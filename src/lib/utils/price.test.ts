import { describe, expect, it } from "vitest";
import { getPriceValue } from "./price";
describe("getPriceValue",()=>{it("convierte precios de WooCommerce a números",()=>expect(getPriceValue("S/ 1,499.90")).toBe(1499.9));it("devuelve cero para precios ausentes",()=>expect(getPriceValue()).toBe(0));});
