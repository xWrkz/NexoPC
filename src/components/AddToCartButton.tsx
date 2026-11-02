"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Cpu, LifeBuoy, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { Product } from "@/types/product";
import { canAddToCart, getPriceValue, hasValidPrice } from "@/lib/utils/price";
import { formatPrice } from "@/lib/utils/formatPrice";

export default function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const variations = product.variations?.nodes ?? [];
  const [variationId, setVariationId] = useState<number | undefined>();
  const selected = variations.find((item) => item.databaseId === variationId);
  const unavailable = product.stockStatus === "OUT_OF_STOCK" || selected?.stockStatus === "OUT_OF_STOCK";
  const currentPrice = selected?.price ?? (variations.length ? undefined : product.price);
  const priced = hasValidPrice(currentPrice);
  const missingVariation = variations.length > 0 && !selected;
  const maxQty = Math.min(20, product.stockQuantity && product.stockQuantity > 0 ? product.stockQuantity : 20);
  const purchasable = canAddToCart(currentPrice, { available: !unavailable, requiresSelection: variations.length > 0, hasSelection: Boolean(selected) });
  const builderHref = product.nexopcHardware ? `/arma-tu-pc?pieza=${encodeURIComponent(product.slug)}` : null;

  const add = () => {
    if (!purchasable) return;
    addItem({
      id: selected ? `${product.id}-${selected.databaseId}` : product.id,
      productId: product.databaseId,
      variationId: selected?.databaseId,
      name: selected ? `${product.name} · ${selected.name}` : product.name,
      price: getPriceValue(currentPrice),
      quantity: Math.min(maxQty, quantity),
      image: selected?.image?.sourceUrl ?? product.image?.sourceUrl,
      category: product.productCategories?.nodes[0]?.name,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };
  const buttonLabel = unavailable ? "Producto agotado" : missingVariation ? "Elige una opción" : !priced ? "Precio por confirmar" : added ? <><Check size={19}/>Añadido al carrito</> : <><ShoppingBag size={19}/>Añadir · {formatPrice(currentPrice)}</>;

  if (!variations.length && !priced) {
    return (
      <div className="grid gap-3">
        {builderHref ? (
          <Link href={builderHref} className="btn-primary focus-ring w-full py-4">
            <Cpu size={18} />
            Usar en mi PC
          </Link>
        ) : null}
        <Link href="/soporte" className="btn-secondary focus-ring w-full">
          <LifeBuoy size={17} />
          Consultar por este producto
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid items-end gap-4 sm:grid-cols-[1fr_auto]">
        {variations.length ? (
          <label className="grid gap-2 text-sm font-semibold text-slate-200">
            Configuración
            <select value={variationId ?? ""} onChange={(event) => setVariationId(event.target.value ? Number(event.target.value) : undefined)} className="field" required>
              <option value="">Elige una opción</option>
              {variations.map((item) => (
                <option value={item.databaseId} key={item.databaseId}>
                  {item.name} · {formatPrice(item.price)} {item.stockStatus === "OUT_OF_STOCK" ? "(agotado)" : ""}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <p className="text-xs text-slate-400">
            {product.stockQuantity && product.stockQuantity > 0 ? `Hasta ${maxQty} unidades disponibles.` : "Elige cuántas unidades necesitas."}
          </p>
        )}
        <div className="grid gap-2 text-sm font-semibold text-slate-200">
          Cantidad
          <div className="quantity-control">
            <button type="button" className="focus-ring disabled:opacity-35" disabled={quantity <= 1} onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Reducir cantidad">
              <Minus size={16} />
            </button>
            <span aria-live="polite">{quantity}</span>
            <button type="button" className="focus-ring disabled:opacity-35" disabled={quantity >= maxQty} onClick={() => setQuantity(Math.min(maxQty, quantity + 1))} aria-label="Aumentar cantidad">
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
      <button type="button" onClick={add} disabled={!purchasable} className="btn-primary focus-ring w-full py-4 disabled:cursor-not-allowed disabled:opacity-45">
        {buttonLabel}
      </button>
      {builderHref ? (
        <Link href={builderHref} className="btn-secondary focus-ring w-full">
          <Cpu size={17} />
          Usar en mi PC
        </Link>
      ) : null}
    </div>
  );
}
