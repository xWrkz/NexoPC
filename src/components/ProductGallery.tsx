"use client";

import Image from "next/image";
import { AnimatePresence, m } from "motion/react";
import { useState } from "react";
import { ProductImage } from "@/types/product";
import ProductPlaceholder from "@/components/ProductPlaceholder";

export default function ProductGallery({ name, images }: { name: string; images: ProductImage[] }) {
  const [active, setActive] = useState(0);
  const selected = images[active];
  return <div><div className="product-gallery-stage"><div className="tech-grid absolute inset-0 opacity-40"/><AnimatePresence mode="wait">{selected ? <m.div key={selected.sourceUrl} initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.03 }} className="absolute inset-0"><Image src={selected.sourceUrl} alt={selected.altText || name} fill priority className="object-contain p-8 sm:p-12" sizes="(max-width: 1024px) 100vw, 54vw"/></m.div> : <ProductPlaceholder name={name}/>}</AnimatePresence><span className="orbital-ring product-gallery-orbit"/></div>{images.length > 1 ? <div className="mt-3 flex gap-3 overflow-auto pb-1">{images.map((image, index) => <button type="button" onClick={() => setActive(index)} aria-label={`Ver imagen ${index + 1} de ${name}`} aria-pressed={active === index} className={`focus-ring relative size-20 shrink-0 overflow-hidden rounded-xl border bg-slate-950 ${active === index ? "border-orange-400" : "border-white/10"}`} key={`${image.sourceUrl}-${index}`}><Image src={image.sourceUrl} alt="" fill className="object-contain p-1"/></button>)}</div> : null}</div>;
}
