"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";

interface Props {
  id: string;
  productId: number;
  name: string;
  price: number;
  image?: string;
}

export default function AddToCartButton({ id, productId, name, price, image }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({ id, productId, name, price, quantity: 1, image });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      onClick={handleAdd}
      className={`w-full font-bold py-4 rounded-lg transition ${added
        ? "bg-green-600 text-white"
        : "bg-orange-500 hover:bg-orange-600 text-white"
        }`}
    >
      {added ? "✅ Añadido al carrito" : "Añadir al carrito"}
    </button>
  );
}