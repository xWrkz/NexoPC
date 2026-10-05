"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { Variation } from "@/types/product";

interface Props {
  id: string;
  productId: number;
  name: string;
  price: number;
  image?: string;
  stockStatus?: string;
  variations?: Variation[];
}

export default function AddToCartButton({ id, productId, name, price, image, stockStatus, variations = [] }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const [selectedVariationId, setSelectedVariationId] = useState(variations[0]?.databaseId);
  const selectedVariation = variations.find((variation) => variation.databaseId === selectedVariationId);
  const currentPrice = selectedVariation?.price
    ? parseFloat(selectedVariation.price.replace(/[^0-9.]/g, ""))
    : price;
  const unavailable = stockStatus === "OUT_OF_STOCK" || selectedVariation?.stockStatus === "OUT_OF_STOCK";

  const handleAdd = () => {
    if (unavailable) return;
    addItem({
      id: selectedVariation ? `${id}-${selectedVariation.databaseId}` : id,
      productId,
      variationId: selectedVariation?.databaseId,
      name: selectedVariation ? `${name} - ${selectedVariation.name}` : name,
      price: currentPrice,
      quantity: 1,
      image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-4">
      {variations.length > 0 && (
        <label className="block text-sm text-gray-300">
          Variante
          <select
            value={selectedVariationId}
            onChange={(event) => setSelectedVariationId(Number(event.target.value))}
            className="mt-2 w-full rounded-lg bg-gray-800 px-4 py-3 text-white"
          >
            {variations.map((variation) => (
              <option key={variation.databaseId} value={variation.databaseId}>
                {variation.name} — {variation.price}
              </option>
            ))}
          </select>
        </label>
      )}
      <button
        onClick={handleAdd}
        disabled={unavailable}
        className={`w-full font-bold py-4 rounded-lg transition ${unavailable
          ? "bg-gray-700 text-gray-400 cursor-not-allowed"
          : added
        ? "bg-green-600 text-white"
        : "bg-orange-500 hover:bg-orange-600 text-white"
        }`}
      >
        {unavailable ? "Agotado" : added ? "✅ Añadido al carrito" : "Añadir al carrito"}
      </button>
    </div>
  );
}
