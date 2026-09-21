export function formatPrice(price?: string): string {
    if (!price) return "Consultar";

    const cleaned = price
        .replace(/&nbsp;/g, "")
        .replace(/S\//g, "")
        .replace(/,/g, "")
        .replace(/[^0-9.]/g, "")
        .trim();

    const num = parseFloat(cleaned);
    if (isNaN(num)) return "Consultar";

    return `S/ ${num.toFixed(2)}`;
}