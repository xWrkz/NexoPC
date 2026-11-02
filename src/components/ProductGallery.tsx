"use client";

import Image from "next/image";
import { AnimatePresence, m } from "motion/react";
import { useState } from "react";
import { ProductImage } from "@/types/product";
import ProductPlaceholder from "@/components/ProductPlaceholder";

export default function ProductGallery({ name, images, category }: { name: string; images: ProductImage[]; category?: { slug: string; name: string } }) {
  const [active, setActive] = useState(0);
  const selected = images[active];
  return <div className="min-w-0"><div className="product-gallery-stage"><AnimatePresence mode="wait">{selected ? <m.div key={selected.sourceUrl} initial={{ opacity: 0, scale: .98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: .18 }} className="media-tile"><Image src={selected.sourceUrl} alt={selected.altText || name} fill priority className="object-contain p-6 sm:p-10" sizes="(max-width: 1024px) 100vw, 54vw"/></m.div> : <ProductPlaceholder name={name} category={category}/>}</AnimatePresence></div>{images.length > 1 ? <div className="mt-3 flex gap-3 overflow-x-auto pb-1">{images.map((image, index) => <button type="button" onClick={() => setActive(index)} aria-label={`Ver imagen ${index + 1} de ${name}`} aria-pressed={active === index} className={`product-thumb focus-ring ${active === index ? "product-thumb-active" : ""}`} key={`${image.sourceUrl}-${index}`}><Image src={image.sourceUrl} alt="" fill sizes="80px" className="object-contain p-1"/></button>)}</div> : null}</div>;
}
