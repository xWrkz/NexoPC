"use client";

import { useBuilderStore } from "@/store/builderStore";
import { useCartStore } from "@/store/cartStore";

export default function ArmaTuPC() {
  const { seleccion, errores, getTotal, reset } = useBuilderStore();
  const addItem = useCartStore((s: any) => s.addItem);

  const handleAgregarAlCarrito = () => {
    if (errores.length > 0) {
      alert("Corrige los errores de compatibilidad antes de continuar.");
      return;
    }
    addItem({
      id: `custom-build-${Date.now()}`,
      productId: 0,
      name: "PC Personalizada NexoPC",
      price: getTotal(),
      quantity: 1,
      isCustomBuild: true,
    });
    alert("¡PC añadida al carrito!");
    reset();
  };

  return (
    <main className="min-h-screen bg-gray-950 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Arma tu PC</h1>
        {/* Aquí irían los pasos de selección */}
        {errores.length > 0 && (
          <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 mb-6">
            <h3 className="text-red-400 font-bold mb-2">⚠️ Errores de compatibilidad</h3>
            <ul className="text-red-300 text-sm list-disc list-inside">
              {errores.map((e: string, i: number) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        )}
        <div className="bg-gray-900 rounded-lg p-6">
          <p className="text-white text-2xl font-bold">Total: S/ {getTotal().toFixed(2)}</p>
          <button
            onClick={handleAgregarAlCarrito}
            disabled={errores.length > 0}
            className="mt-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg transition"
          >
            Añadir al carrito
          </button>
        </div>
      </div>
    </main>
  );
}
