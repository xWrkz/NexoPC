import type { AccountOrder } from "@/lib/account/schema";

export type StatusTone = "ok" | "warn" | "bad" | "muted";

/** Estado del pedido en palabras del cliente (WooCommerce usa claves en inglés). */
export function orderStatus(order: Pick<AccountOrder, "status" | "paymentMethod" | "mpStatusDetail">): { label: string; tone: StatusTone } {
  switch (order.status) {
    case "pending":
      return order.mpStatusDetail === "waiting_retry" ? { label: "Pago rechazado", tone: "bad" } : { label: "Pendiente de pago", tone: "warn" };
    case "on-hold":
      return order.paymentMethod === "mercadopago" ? { label: "Pago en revisión", tone: "warn" } : { label: "Por coordinar", tone: "warn" };
    case "processing":
      return { label: "Pagado · en preparación", tone: "ok" };
    case "completed":
      return { label: "Completado", tone: "ok" };
    case "cancelled":
      return { label: "Cancelado", tone: "muted" };
    case "refunded":
      return { label: "Reembolsado", tone: "muted" };
    case "failed":
      return { label: "Pago fallido", tone: "bad" };
    default:
      return { label: "En proceso", tone: "muted" };
  }
}

/** El cliente puede consultar el pago en curso solo en pedidos de Mercado Pago aún sin confirmar. */
export const canCheckPayment = (order: Pick<AccountOrder, "status" | "paymentMethod" | "mpStatusDetail">) =>
  order.paymentMethod === "mercadopago" && order.status === "pending" && order.mpStatusDetail !== "waiting_retry";

const dateFormat = new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "America/Lima" });

export function formatOrderDate(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : dateFormat.format(date);
}
