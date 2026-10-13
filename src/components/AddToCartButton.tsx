"use client";

import { useState } from "react";
import { Check, CircleHelp, Minus, Plus, ShoppingBag } from "lucide-react";
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
  const purchasable = canAddToCart(currentPrice, { available: !unavailable, requiresSelection: variations.length > 0, hasSelection: Boolean(selected) });

  const add = () => {
    if (!purchasable) return;
    addItem({ id: selected ? `${product.id}-${selected.databaseId}` : product.id, productId: product.databaseId, variationId: selected?.databaseId, name: selected ? `${product.name} · ${selected.name}` : product.name, price: getPriceValue(currentPrice), quantity, image: selected?.image?.sourceUrl ?? product.image?.sourceUrl, category: product.productCategories?.nodes[0]?.name });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };
  const buttonLabel = unavailable ? "Producto agotado" : missingVariation ? "Elige una opción" : !priced ? "Precio por confirmar" : added ? <><Check size={19}/>Añadido al carrito</> : <><ShoppingBag size={19}/>Añadir · {formatPrice(currentPrice)}</>;

  return <div className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
      <label className="grid gap-2 text-sm font-semibold text-slate-200">{variations.length ? "Configuración" : "Cantidad"}{variations.length ? <select value={variationId ?? ""} onChange={(event) => setVariationId(event.target.value ? Number(event.target.value) : undefined)} className="field" required><option value="">Elige una opción</option>{variations.map((item) => <option value={item.databaseId} key={item.databaseId}>{item.name} · {formatPrice(item.price)} {item.stockStatus === "OUT_OF_STOCK" ? "(agotado)" : ""}</option>)}</select> : <span className="text-xs font-normal text-slate-500">Elige cuántas unidades necesitas.</span>}</label>
      <div className="grid gap-2 text-sm font-semibold text-slate-200">Cantidad<div className="quantity-control"><button type="button" className="focus-ring" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Reducir cantidad"><Minus size={16}/></button><span>{quantity}</span><button type="button" className="focus-ring" onClick={() => setQuantity(quantity + 1)} aria-label="Aumentar cantidad"><Plus size={16}/></button></div></div>
    </div>
    {!missingVariation && !priced ? <p className="price-help"><CircleHelp size={16}/>Solicita la confirmación del precio antes de añadir este producto al pedido.</p> : null}
    <button type="button" onClick={add} disabled={!purchasable} className="btn-primary focus-ring w-full py-4 disabled:cursor-not-allowed disabled:opacity-45">{buttonLabel}</button>
  </div>;
}
