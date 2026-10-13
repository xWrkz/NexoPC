import { describe, expect, it } from "vitest";
import { canAddToCart, getPriceValue, hasValidPrice, parsePriceValue } from "./price";

describe("precios del catálogo", () => {
  it("convierte precios de WooCommerce a números", () => expect(getPriceValue("S/ 1,499.90")).toBe(1499.9));
  it("distingue precios válidos de valores por confirmar", () => {
    expect(parsePriceValue("S/ 499.00")).toBe(499);
    expect(parsePriceValue()).toBeNull();
    expect(hasValidPrice("S/ 0.00")).toBe(false);
    expect(hasValidPrice("S/ 499.00")).toBe(true);
  });
  it("mantiene cero como valor numérico seguro para cálculos", () => expect(getPriceValue()).toBe(0));
  it("impide comprar sin precio, stock o variante seleccionada", () => {
    expect(canAddToCart()).toBe(false);
    expect(canAddToCart("S/ 250", { requiresSelection: true, hasSelection: false })).toBe(false);
    expect(canAddToCart("S/ 250", { requiresSelection: true, hasSelection: true })).toBe(true);
    expect(canAddToCart("S/ 250", { available: false })).toBe(false);
  });
});
