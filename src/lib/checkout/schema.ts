import { z } from "zod";
export const MAX_ORDER_LINES = 50;
export const PAYMENT_METHODS = ["bacs", "cod", "mercadopago"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
const text =z.string().trim().min(2, "Completa este campo.").max(120, "El valor es demasiado largo.");
export const orderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        variationId: z.number().int().positive().optional(),
        quantity: z.number().int().min(1).max(20, "Máximo 20 unidades por producto."),
      })
    )
    .min(1, "Tu carrito está vacío.")
    .max(MAX_ORDER_LINES, `Tu pedido no puede tener más de ${MAX_ORDER_LINES} productos distintos.`),
  paymentMethod: z.enum(PAYMENT_METHODS),
  customer: z.object({
    firstName: text,
    lastName: text,
    email: z.string().trim().email("Ingresa un correo válido."),
    phone: z
      .string()
      .trim()
      .min(7, "Ingresa un teléfono válido.")
      .max(25)
      .regex(/^[0-9+\-\s()]{7,25}$/, "Ingresa un teléfono válido."),
    address1: text,
    city: text,
    region: text,
    postcode: z.string().trim().min(3, "Completa el código postal o distrito.").max(60, "El código postal o distrito es demasiado largo."),
    notes: z.string().trim().max(500).optional(),
  }),
});
export type OrderRequest = z.infer<typeof orderSchema>;
export type OrderResponse =
  | { ok: true; orderId: number; orderNumber: string; status: string; paymentMethod: PaymentMethod; checkoutUrl?: string; message: string }
  | { ok: false; message: string; errors?: Record<string, string[]> };

/** Estado que la página de confirmación muestra tras volver de Mercado Pago. */
export type OrderStatus = { orderNumber: string; status: string; paymentMethod: string; paid: boolean; total: string; mpStatus?: string; mpStatusDetail?: string };

/** Solo se redirige a dominios de Mercado Pago, nunca a una URL arbitraria. */
export function isMercadoPagoCheckoutUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && /(^|\.)mercadopago\.com(\.[a-z]{2})?$/.test(url.hostname);
  } catch {
    return false;
  }
}
