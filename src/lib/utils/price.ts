export function getPriceValue(price?: string) {
  return Number(price?.replace(/&nbsp;|S\/|,/g, "").replace(/[^0-9.]/g, "")) || 0;
}
