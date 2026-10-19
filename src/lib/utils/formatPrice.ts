import { isPriceRange, parsePriceValue } from "@/lib/utils/price";

export function formatPrice(price?: string | null): string {
  const num = parsePriceValue(price);
  if (num === null) return "Precio por confirmar";

  const formatted = `S/ ${num.toFixed(2)}`;
  return isPriceRange(price) ? `Desde ${formatted}` : formatted;
}
