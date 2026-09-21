"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";

export default function Checkout() {
  const { items, getTotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);

  const handlePago = async () => {
    setLoading(true);
    try {
      // 1. Abrir modal de Culqi (sandbox)
      // 2. Recibir token
      // 3. Enviar token + datos del carrito a /api/orders
      // 4. Crear orden en WooCommerce
      // 5. Redirigir a página de confirmación
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <p className="text-white text-xl">Total: S/ {getTotal().toFixed(2)}</p>
        </div>
        <button
          onClick={handlePago}
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-lg"
        >
          {loading ? "Procesando..." : "Pagar con Culqi"}
        </button>
      </div>
    </main>
  );
}
