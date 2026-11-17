"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cartStore";

/** Vacía el carrito cuando el pago ya fue confirmado por el backend. */
export default function ClearCartOnMount() {
  useEffect(() => {
    useCartStore.getState().clearCart();
  }, []);
  return null;
}
