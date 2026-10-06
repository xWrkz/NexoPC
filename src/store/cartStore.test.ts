import { beforeEach, describe, expect, it } from "vitest";
import { useCartStore } from "./cartStore";

describe("cartStore", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it("agrupa el mismo producto y limita la cantidad", () => {
    const item = { id: "cpu", productId: 1, name: "CPU", price: 500, quantity: 1 };
    useCartStore.getState().addItem(item);
    useCartStore.getState().addItem(item);
    useCartStore.getState().updateQuantity("cpu", 99);
    expect(useCartStore.getState().items[0].quantity).toBe(20);
    expect(useCartStore.getState().getTotal()).toBe(10000);
  });
});
