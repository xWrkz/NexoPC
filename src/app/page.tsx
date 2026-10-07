import Link from "next/link";
import { AlertTriangle, ArrowRight, Layers3, ShieldCheck, Sparkles, Wrench } from "lucide-react";
import { getCatalog } from "@/lib/catalog/products";
import ProductCard from "@/components/ProductCard";
import HeroExperience from "@/components/HeroExperience";
import UseCaseExplorer from "@/components/UseCaseExplorer";

export const dynamic = "force-dynamic";

const benefits = [
  { icon: ShieldCheck, title: "Compatibilidad asistida", text: "Te explicamos qué encaja, qué no y qué información falta por confirmar." },
  { icon: Wrench, title: "Ensamblaje acompañado", text: "Construye una PC completa sin tener que dominar todas las especificaciones." },
  { icon: Sparkles, title: "Una elección con propósito", text: "Estudio, trabajo, creación o gaming: empieza por lo que necesitas hacer." },
];

export default async function Home() {
  const catalog = await getCatalog();
  return <div className="overflow-hidden"><HeroExperience products={catalog.products.slice(0, 3)}/>
    {catalog.categories.length ? <section className="mx-auto max-w-7xl px-6 pt-18"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow">Rutas rápidas</p><h2 className="font-display mt-3 text-4xl font-bold">Explora el catálogo a tu manera.</h2></div><Link href="/tienda" className="group flex items-center gap-2 text-sm font-bold text-cyan-200">Ver todas las opciones <ArrowRight size={16} className="transition group-hover:translate-x-1"/></Link></div><div className="category-rail mt-8">{catalog.categories.filter((category) => (category.count ?? 0) > 0).slice(0, 8).map((category, index) => <Link href={`/tienda?categoria=${category.slug}`} className="category-beacon focus-ring" key={category.id}><span className="category-beacon-number">0{index + 1}</span><Layers3 size={22}/><strong>{category.name}</strong><small>{category.count} {category.count === 1 ? "producto" : "productos"}</small><ArrowRight className="ml-auto" size={17}/></Link>)}</div></section> : null}

    <section className="mx-auto max-w-7xl px-6 py-20"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow">Disponible ahora</p><h2 className="font-display mt-3 text-4xl font-bold">Componentes reales del catálogo</h2><p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">Precios y disponibilidad consultados directamente desde nuestro catálogo.</p></div><Link href="/tienda" className="group flex items-center gap-2 text-sm font-bold text-orange-300">Ver toda la tienda <ArrowRight size={16} className="transition group-hover:translate-x-1"/></Link></div>{catalog.status === "error" ? <div className="catalog-state mt-8 border-rose-400/20"><AlertTriangle className="text-rose-300"/><h2>El catálogo no respondió</h2><p>{catalog.error}</p><Link href="/tienda" className="btn-secondary">Volver a intentar</Link></div> : catalog.products.length ? <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{catalog.products.slice(0, 4).map((product, index) => <ProductCard key={product.id} product={product} priority={index < 2}/>)}</div> : <div className="catalog-state mt-8"><Sparkles className="text-orange-300"/><h2>Estamos preparando el catálogo</h2><p>Muy pronto encontrarás aquí los componentes disponibles.</p></div>}</section>

    <UseCaseExplorer/>
    <section className="mx-auto max-w-7xl px-6 pb-20"><div className="benefit-grid">{benefits.map(({ icon: Icon, title, text }, index) => <div className="benefit-card" key={title}><span className="benefit-index">0{index + 1}</span><Icon className="text-orange-300" size={25}/><h3>{title}</h3><p>{text}</p></div>)}</div></section>
    <section className="mx-auto max-w-7xl px-6 pb-8"><div className="builder-banner"><div className="circuit-line circuit-line-three"/><div className="relative max-w-2xl"><p className="eyebrow">Tu build, a tu ritmo</p><h2 className="font-display mt-3 text-4xl font-bold sm:text-5xl">La primera PC no tiene por qué sentirse complicada.</h2><p className="mt-5 leading-7 text-slate-300">Elige un objetivo, define tu presupuesto y avanza pieza por pieza con explicaciones claras.</p><Link href="/arma-tu-pc?modo=guiado" className="btn-primary focus-ring mt-7">Empezar con ayuda <ArrowRight size={17}/></Link></div></div></section>
  </div>;
}
