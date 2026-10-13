export function formatPrice(price?: string): string {
    if (!price) return "Precio por confirmar";

    const cleaned = price
        .replace(/&nbsp;/g, "")
        .replace(/S\//g, "")
        .replace(/,/g, "")
        .replace(/[^0-9.]/g, "")
        .trim();

    const num = parseFloat(cleaned);
    if (isNaN(num) || num <= 0) return "Precio por confirmar";

    return `S/ ${num.toFixed(2)}`;
}
