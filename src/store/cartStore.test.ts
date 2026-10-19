import { beforeEach, describe, expect, it } from "vitest";
import { useCartStore } from "./cartStore";

describe("cartStore", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it("agrupa el mismo producto y limita la cantidad en addItem y updateQuantity", () => {
    const item = { id: "cpu", productId: 1, name: "CPU", price: 500, quantity: 15 };
    useCartStore.getState().addItem(item);
    useCartStore.getState().addItem(item);
    expect(useCartStore.getState().items[0].quantity).toBe(20);
    useCartStore.getState().updateQuantity("cpu", 99);
    expect(useCartStore.getState().items[0].quantity).toBe(20);
    expect(useCartStore.getState().getTotal()).toBe(10000);
  });

  it("rechaza productos sin precio comercial válido", () => {
    useCartStore.getState().addItem({ id: "sin-precio", productId: 2, name: "Por confirmar", price: 0, quantity: 1 });
    expect(useCartStore.getState().items).toEqual([]);
  });

  it("elimina un grupo de componentes completo por su buildId", () => {
    useCartStore.getState().addItem({ id: "cpu-1", productId: 1, name: "CPU", price: 500, quantity: 1, buildId: "build-1" });
    useCartStore.getState().addItem({ id: "gpu-1", productId: 2, name: "GPU", price: 1200, quantity: 1, buildId: "build-1" });
    useCartStore.getState().addItem({ id: "mouse", productId: 3, name: "Mouse", price: 80, quantity: 1 });

    expect(useCartStore.getState().items.length).toBe(3);
    useCartStore.getState().removeBuild("build-1");
    expect(useCartStore.getState().items.length).toBe(1);
    expect(useCartStore.getState().items[0].id).toBe("mouse");
  });
});
