export function parsePriceValue(price?: string | null): number | null {
  if (!price) return null;
  const cleaned = price.replace(/&nbsp;|,/g, "");
  const match = cleaned.match(/\d+(?:\.\d+)?/);
  if (!match) return null;
  const value = Number(match[0]);
  return Number.isFinite(value) && value > 0 ? value : null;
}

export function isPriceRange(price?: string | null): boolean {
  if (!price) return false;
  const matches = price.replace(/&nbsp;|,/g, "").match(/\d+(?:\.\d+)?/g);
  return Boolean(matches && matches.length > 1 && Number(matches[0]) !== Number(matches[1]));
}

export function hasValidPrice(price?: string | null) {
  return parsePriceValue(price) !== null;
}

export function canAddToCart(price?: string | null, options: { available?: boolean; requiresSelection?: boolean; hasSelection?: boolean } = {}) {
  const { available = true, requiresSelection = false, hasSelection = true } = options;
  return available && hasValidPrice(price) && (!requiresSelection || hasSelection);
}

export function getPriceValue(price?: string | null) {
  return parsePriceValue(price) ?? 0;
}

