import { describe, expect, it } from "vitest";
import { canCheckPayment, formatOrderDate, orderStatus } from "./orders";

const order = (status: string, paymentMethod = "mercadopago", mpStatusDetail = "") => ({ status, paymentMethod, mpStatusDetail });

describe("orderStatus", () => {
  it("traduce los estados de WooCommerce", () => {
    expect(orderStatus(order("processing"))).toEqual({ label: "Pagado · en preparación", tone: "ok" });
    expect(orderStatus(order("pending"))).toEqual({ label: "Pendiente de pago", tone: "warn" });
    expect(orderStatus(order("cancelled")).tone).toBe("muted");
    expect(orderStatus(order("algo-raro")).label).toBe("En proceso");
  });

  it("distingue la tarjeta rechazada y la coordinación manual", () => {
    expect(orderStatus(order("pending", "mercadopago", "waiting_retry"))).toEqual({ label: "Pago rechazado", tone: "bad" });
    expect(orderStatus(order("on-hold", "bacs")).label).toBe("Por coordinar");
    expect(orderStatus(order("on-hold", "mercadopago")).label).toBe("Pago en revisión");
  });
});

describe("canCheckPayment", () => {
  it("solo ofrece consultar pagos de Mercado Pago pendientes", () => {
    expect(canCheckPayment(order("pending"))).toBe(true);
    expect(canCheckPayment(order("pending", "mercadopago", "waiting_retry"))).toBe(false);
    expect(canCheckPayment(order("pending", "bacs"))).toBe(false);
    expect(canCheckPayment(order("processing"))).toBe(false);
  });
});

describe("formatOrderDate", () => {
  it("muestra la hora de Lima y tolera fechas vacías", () => {
    expect(formatOrderDate("2026-11-17T18:25:24+00:00")).toMatch(/17.*nov.*2026.*01:25/i);
    expect(formatOrderDate(null)).toBe("");
    expect(formatOrderDate("no-es-fecha")).toBe("");
  });
});
