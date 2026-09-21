"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";

export default function Carrito() {
    const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
    const total = getTotal();

    if (items.length === 0) {
        return (
            <main className="min-h-screen bg-gray-950 py-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-3xl font-bold text-white mb-4">Tu carrito está vacío</h1>
                    <p className="text-gray-400 mb-8">Añade componentes o arma tu PC personalizada.</p>
                    <Link
                        href="/tienda"
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg transition inline-block"
                    >
                        Ir a la tienda
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-950 py-12 px-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">Tu carrito</h1>

                <div className="space-y-4 mb-8">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-center gap-4"
                        >
                            {item.image && (
                                <div className="relative w-20 h-20 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                                </div>
                            )}
                            <div className="flex-1">
                                <h3 className="text-white font-semibold">{item.name}</h3>
                                <p className="text-orange-500 font-bold">S/ {item.price.toFixed(2)}</p>
                            </div>
                            <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                                className="w-16 bg-gray-800 text-white text-center rounded px-2 py-1"
                            />
                            <button
                                onClick={() => removeItem(item.id)}
                                className="text-red-500 hover:text-red-400 font-bold"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
                    <div className="flex justify-between text-white text-xl font-bold">
                        <span>Total:</span>
                        <span className="text-orange-500">S/ {total.toFixed(2)}</span>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={clearCart}
                        className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition"
                    >
                        Vaciar carrito
                    </button>
                    <Link
                        href="/checkout"
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition text-center"
                    >
                        Ir al checkout
                    </Link>
                </div>
            </div>
        </main>
    );
}