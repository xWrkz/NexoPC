import { describe, expect, it } from "vitest";
import { canAddToCart, getPriceValue, hasValidPrice, isPriceRange, parsePriceValue } from "./price";
import { formatPrice } from "./formatPrice";

describe("precios del catálogo", () => {
  it("convierte precios de WooCommerce a números", () => expect(getPriceValue("S/ 1,499.90")).toBe(1499.9));
  it("maneja rangos de precios de productos variables sin concatenar montos", () => {
    expect(parsePriceValue("S/ 150.00 - S/ 250.00")).toBe(150);
    expect(parsePriceValue("S/ 150 - S/ 250")).toBe(150);
    expect(hasValidPrice("S/ 150.00 - S/ 250.00")).toBe(true);
    expect(isPriceRange("S/ 150.00 - S/ 250.00")).toBe(true);
    expect(formatPrice("S/ 150.00 - S/ 250.00")).toBe("Desde S/ 150.00");
  });
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
