import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@/types/cart";

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  removeBuild: (buildId: string) => void;
  getTotal: () => number;
  getItemCount: () => number;
}

const clampQuantity = (qty: number) => Math.min(20, Math.max(1, Math.floor(Number.isFinite(qty) ? qty : 1)));

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          if (!Number.isFinite(item.price) || item.price <= 0) return state;
          const safeQty = clampQuantity(item.quantity);
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: clampQuantity(i.quantity + safeQty) } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: safeQty }] };
        }),
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      updateQuantity: (id, qty) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity: clampQuantity(qty) } : i)),
        })),
      clearCart: () => set({ items: [] }),
      removeBuild: (buildId) => set((state) => ({ items: state.items.filter((i) => i.buildId !== buildId) })),
      getTotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "nexopc-cart" }
  )
);
