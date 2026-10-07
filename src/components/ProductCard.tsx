"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, ShoppingBag, Sparkles } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useState } from "react";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils/formatPrice";
import { getPriceValue } from "@/lib/utils/price";
import { useCartStore } from "@/store/cartStore";
import ProductPlaceholder from "@/components/ProductPlaceholder";

const usageNames: Record<string, string> = { estudio: "Ideal para estudiar", estudiantes: "Ideal para estudiar", trabajo: "Para productividad", productividad: "Para productividad", programacion: "Para desarrollar", desarrollo: "Para desarrollar", gaming: "Para jugar", juegos: "Para jugar", creacion: "Para crear", diseno: "Para diseño" };

export default function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);
  const stock = product.stockStatus === "IN_STOCK";
  const category = product.productCategories?.nodes[0]?.name ?? "Hardware";
  const sale = getPriceValue(product.regularPrice) > getPriceValue(product.price);
  const hasVariations = Boolean(product.variations?.nodes.length);
  const usage = product.productTags?.nodes.map((tag) => usageNames[tag.slug]).find(Boolean);
  const quickAdd = () => {
    if (!stock || hasVariations) return;
    addItem({ id: product.id, productId: product.databaseId, name: product.name, price: getPriceValue(product.price), quantity: 1, image: product.image?.sourceUrl, category });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  return <m.article initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .15 }} transition={{ duration: .42 }} className="product-card group"><Link href={`/producto/${product.slug}`} className="focus-ring block"><div className="product-card-media">{product.image ? <Image src={product.image.sourceUrl} alt={product.image.altText || product.name} fill priority={priority} sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 33vw" className="object-contain p-6 transition duration-500 group-hover:scale-[1.045]"/> : <ProductPlaceholder name={product.name} compact priority={priority}/>}<div className="absolute left-3 top-3 flex max-w-[calc(100%-1.5rem)] flex-wrap gap-2"><span className="product-badge truncate">{category}</span>{sale ? <span className="product-badge product-badge-sale">Oferta</span> : null}</div><span className={`product-stock ${stock ? "product-stock-in" : "product-stock-out"}`}>{stock ? <Check size={12}/> : null}{stock ? "Disponible" : "Agotado"}</span>{usage ? <span className="product-usage"><Sparkles size={11}/>{usage}</span> : null}</div><div className="product-card-copy"><div className="flex items-start justify-between gap-3"><div><h3 className="min-h-11 text-[.93rem] font-bold leading-5 text-slate-100 transition group-hover:text-orange-200">{product.name}</h3>{product.sku ? <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-600">SKU {product.sku}</p> : null}</div><ArrowUpRight size={18} className="mt-0.5 shrink-0 text-slate-500 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-300"/></div><div className="mt-5 flex items-end justify-between gap-3"><div><p className="product-price">{formatPrice(product.price)}</p>{sale ? <p className="mt-1 text-xs text-slate-500 line-through">{formatPrice(product.regularPrice)}</p> : null}</div><span className="product-detail-link">Ver detalle</span></div></div></Link><div className="flex items-center justify-between border-t border-white/8 px-5 py-3"><span className="text-[11px] text-slate-500">{hasVariations ? "Elige una variante" : stock ? "Compra rápida" : "Sin disponibilidad"}</span><button onClick={quickAdd} disabled={!stock || hasVariations} className={`quick-add focus-ring ${added ? "quick-add-success" : ""}`} aria-label={hasVariations ? "Selecciona una variante en el detalle" : `Agregar ${product.name} al carrito`}><AnimatePresence mode="wait">{added ? <m.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Check size={17}/></m.span> : <m.span key="bag" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><ShoppingBag size={17}/></m.span>}</AnimatePresence></button></div></m.article>;
}
