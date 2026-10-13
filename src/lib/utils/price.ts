export function parsePriceValue(price?: string) {
  if (!price) return null;
  const value = Number(price.replace(/&nbsp;|S\/|,/g, "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(value) && value > 0 ? value : null;
}

export function hasValidPrice(price?: string) {
  return parsePriceValue(price) !== null;
}

export function canAddToCart(price?: string, options: { available?: boolean; requiresSelection?: boolean; hasSelection?: boolean } = {}) {
  const { available = true, requiresSelection = false, hasSelection = true } = options;
  return available && hasValidPrice(price) && (!requiresSelection || hasSelection);
}

export function getPriceValue(price?: string) {
  return parsePriceValue(price) ?? 0;
}
