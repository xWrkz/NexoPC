import Link from "next/link";
import { AlertTriangle, ArrowRight, ShieldCheck, Sparkles, Wrench } from "lucide-react";
import { getCatalog, getFeaturedProducts } from "@/lib/catalog/products";
import ProductCard from "@/components/ProductCard";
import HeroExperience from "@/components/HeroExperience";
import UseCaseExplorer from "@/components/UseCaseExplorer";
import CategoryIsometricIcon from "@/components/CategoryIsometricIcon";
import { isHiddenCatalogTaxonomy } from "@/lib/catalog/taxonomies";

export const dynamic = "force-dynamic";

const benefits = [
  { icon: ShieldCheck, title: "Compatibilidad asistida", text: "Te explicamos qué encaja, qué no y qué información falta por confirmar." },
  { icon: Wrench, title: "Ensamblaje acompañado", text: "Construye una PC completa sin tener que dominar todas las especificaciones." },
  { icon: Sparkles, title: "Una elección con propósito", text: "Estudio, trabajo, creación o gaming: empieza por lo que necesitas hacer." },
];

const fallbackCategories = [
  { id: "cat-almacenamiento", name: "Almacenamiento", slug: "almacenamiento", count: null },
  { id: "cat-fuentes", name: "Fuentes de Poder", slug: "fuentes-de-poder", count: null },
  { id: "cat-gabinetes", name: "Gabinetes", slug: "gabinetes", count: null },
  { id: "cat-ram", name: "Memoria RAM", slug: "memoria-ram", count: null },
  { id: "cat-placas", name: "Placas Madre", slug: "placas-madre", count: null },
  { id: "cat-procesadores", name: "Procesadores", slug: "procesadores", count: null },
  { id: "cat-gpu", name: "Tarjetas Gráficas", slug: "tarjetas-graficas", count: null },
  { id: "cat-refrigeracion", name: "Refrigeración", slug: "refrigeracion", count: null },
];

export default async function Home() {
  const [catalog, featured] = await Promise.all([getCatalog(), getFeaturedProducts()]);
  const rawCategories = catalog.categories.filter((category) => (category.count ?? 0) > 0 && !isHiddenCatalogTaxonomy(category));
  const visibleCategories = rawCategories.length > 0 ? rawCategories : fallbackCategories;
  const featuredProducts = featured.length ? featured : catalog.products.slice(0, 4);
  return <div className="overflow-hidden"><HeroExperience/>
    <section className="storefront-section mx-auto max-w-7xl px-4 sm:px-6"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow">Explora por categoría</p><h2 className="font-display mt-3 text-3xl font-bold sm:text-4xl">Empieza por la pieza que necesitas.</h2></div><Link href="/tienda" className="group flex items-center gap-2 text-sm font-bold text-cyan-200">Ver todo el catálogo <ArrowRight size={16} className="transition group-hover:translate-x-1"/></Link></div><div className="category-grid mt-7">{visibleCategories.slice(0, 8).map((category, index) => <Link href={`/tienda?categoria=${encodeURIComponent(category.slug)}`} className="category-beacon group focus-ring" key={category.id}><div className="category-beacon-stage"><CategoryIsometricIcon slug={category.slug} name={category.name} size={64} priority={index < 4} /></div><div className="category-beacon-footer"><strong>{category.name}</strong><div className="category-beacon-meta"><small>{category.count ? `${category.count} ${category.count === 1 ? "producto" : "productos"}` : "Ver productos"}</small><ArrowRight className="category-beacon-arrow" size={16}/></div></div></Link>)}</div></section>

    <section className="storefront-section mx-auto max-w-7xl px-4 pt-0 sm:px-6"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow">Selección NexoPC</p><h2 className="font-display mt-3 text-3xl font-bold sm:text-4xl">Componentes destacados</h2></div><Link href="/tienda" className="group flex items-center gap-2 text-sm font-bold text-orange-300">Ver toda la tienda <ArrowRight size={16} className="transition group-hover:translate-x-1"/></Link></div>{catalog.status === "error" && !featuredProducts.length ? <div className="catalog-state mt-8 border-rose-400/20"><AlertTriangle className="text-rose-300"/><h2>No pudimos cargar los componentes</h2><p>{catalog.error}</p><Link href="/tienda" className="btn-secondary">Intentar de nuevo</Link></div> : featuredProducts.length ? <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{featuredProducts.map((product, index) => <ProductCard key={product.id} product={product} priority={index < 2}/>)}</div> : <div className="catalog-state mt-8"><Sparkles className="text-orange-300"/><h2>Aún no hay componentes disponibles</h2><p>Vuelve pronto para descubrir nuevas opciones.</p></div>}</section>

    <UseCaseExplorer/>
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6"><div className="benefit-grid">{benefits.map(({ icon: Icon, title, text }) => <div className="benefit-card" key={title}><Icon className="text-orange-300" size={25}/><h3>{title}</h3><p>{text}</p></div>)}</div></section>
    <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6"><div className="builder-banner"><div className="circuit-line circuit-line-three"/><div className="relative max-w-2xl"><p className="eyebrow">Tu build, a tu ritmo</p><h2 className="font-display mt-3 text-4xl font-bold sm:text-5xl">La primera PC no tiene por qué sentirse complicada.</h2><p className="mt-5 leading-7 text-slate-300">Elige un objetivo, define tu presupuesto y avanza pieza por pieza con explicaciones claras.</p><Link href="/arma-tu-pc?modo=guiado" className="btn-primary focus-ring mt-7">Empezar con ayuda <ArrowRight size={17}/></Link></div></div></section>
  </div>;
}
