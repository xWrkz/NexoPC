"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { useEffect, useState } from "react";

export default function Header() {
    const itemCount = useCartStore((s) => s.getItemCount());
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <Link href="/" className="text-2xl font-bold text-white">
                    Nexo<span className="text-orange-500">PC</span>
                </Link>

                <nav className="hidden md:flex gap-8">
                    <Link href="/" className="text-gray-300 hover:text-orange-500 transition">
                        Inicio
                    </Link>
                    <Link href="/tienda" className="text-gray-300 hover:text-orange-500 transition">
                        Tienda
                    </Link>
                    <Link href="/arma-tu-pc" className="text-gray-300 hover:text-orange-500 transition">
                        Arma tu PC
                    </Link>
                </nav>

                <Link
                    href="/carrito"
                    className="relative bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                    🛒 Carrito
                    {mounted && itemCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                            {itemCount}
                        </span>
                    )}
                </Link>
            </div>
        </header>
    );
}