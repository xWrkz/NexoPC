import Link from "next/link";
import { AlertTriangle, ArrowRight, BookOpen, BriefcaseBusiness, CheckCircle2, Code2, Cpu, Gamepad2, Palette, ShieldCheck, Sparkles, UserPlus, Wrench } from "lucide-react";
import { getCatalog, getFeaturedProducts } from "@/lib/catalog/products";
import ProductCard from "@/components/ProductCard";
import CategoryIsometricIcon from "@/components/CategoryIsometricIcon";
import { isHiddenCatalogTaxonomy } from "@/lib/catalog/taxonomies";

export const dynamic = "force-dynamic";

const useCases = [
  { use: "first-pc", icon: Sparkles, label: "Mi primera PC", text: "Te guiamos sin tecnicismos" },
  { use: "study", icon: BookOpen, label: "Estudiar", text: "Clases, videollamadas y proyectos" },
  { use: "work", icon: BriefcaseBusiness, label: "Trabajar", text: "Oficina y trabajo remoto" },
  { use: "programming", icon: Code2, label: "Programar", text: "Compilar, probar y virtualizar" },
  { use: "creation", icon: Palette, label: "Crear", text: "Edición, diseño y render" },
  { use: "gaming", icon: Gamepad2, label: "Jugar", text: "Fluidez y espacio para mejorar" },
];

const benefits = [
  { icon: ShieldCheck, title: "Compatibilidad revisada", text: "Te decimos qué encaja, qué no y qué falta confirmar antes de comprar." },
  { icon: Wrench, title: "Ensamblaje acompañado", text: "Arma una PC completa sin dominar todas las especificaciones." },
  { icon: Cpu, title: "Componentes con propósito", text: "Elige según lo que vas a hacer, no según una lista de siglas." },
];

const fallbackCategories = [
  { id: "cat-procesadores", name: "Procesadores", slug: "procesadores", count: null },
  { id: "cat-gpu", name: "Tarjetas Gráficas", slug: "tarjetas-graficas", count: null },
  { id: "cat-placas", name: "Placas Madre", slug: "placas-madre", count: null },
  { id: "cat-ram", name: "Memoria RAM", slug: "memoria-ram", count: null },
  { id: "cat-almacenamiento", name: "Almacenamiento", slug: "almacenamiento", count: null },
  { id: "cat-fuentes", name: "Fuentes de Poder", slug: "fuentes-de-poder", count: null },
  { id: "cat-gabinetes", name: "Gabinetes", slug: "gabinetes", count: null },
  { id: "cat-refrigeracion", name: "Refrigeración", slug: "refrigeracion", count: null },
];

function SectionHeader({ eyebrow, title, href, linkLabel }: { eyebrow: string; title: string; href?: string; linkLabel?: string }) {
  return <div className="flex flex-wrap items-end justify-between gap-4">
    <div><p className="eyebrow">{eyebrow}</p><h2 className="font-display mt-2 text-2xl font-bold sm:text-3xl">{title}</h2></div>
    {href ? <Link href={href} className="home-link focus-ring">{linkLabel} <ArrowRight size={16}/></Link> : null}
  </div>;
}

export default async function Home() {
  const [catalog, featured] = await Promise.all([getCatalog(), getFeaturedProducts()]);
  const rawCategories = catalog.categories.filter((category) => (category.count ?? 0) > 0 && !isHiddenCatalogTaxonomy(category));
  const categories = (rawCategories.length > 0 ? rawCategories : fallbackCategories).slice(0, 8);
  const featuredProducts = featured.length ? featured : catalog.products.slice(0, 4);

  return <div>
    <section className="home-hero">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_.9fr] lg:gap-16 lg:py-24">
        <div className="min-w-0">
          <p className="home-tag">Componentes y PCs a medida · Trujillo</p>
          <h1 className="font-display mt-5 max-w-2xl text-[2.5rem] font-bold leading-[1.05] text-balance sm:text-6xl">Tu próxima PC, <span className="text-orange-400">sin complicaciones.</span></h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">No necesitas saberlo todo sobre hardware. Explora componentes reales o deja que te guiemos según lo que vas a hacer.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/arma-tu-pc?modo=guiado" className="btn-primary focus-ring">Ayúdame a elegir <ArrowRight size={17}/></Link>
            <Link href="/tienda" className="btn-secondary focus-ring">Ver componentes</Link>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
            {["Compatibilidad revisada", "Asesoría en Trujillo", "Sin tecnicismos"].map((item) => <li key={item} className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400"/>{item}</li>)}
          </ul>
        </div>

        <div className="home-usecases">
          <p className="text-sm font-semibold text-slate-300">¿Para qué la necesitas?</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {useCases.map(({ use, icon: Icon, label, text }) => <Link key={use} href={`/arma-tu-pc?modo=guiado&uso=${use}`} className="home-usecase focus-ring">
              <span className="home-usecase-icon"><Icon size={18}/></span>
              <span className="min-w-0"><strong>{label}</strong><small>{text}</small></span>
            </Link>)}
          </div>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
      <SectionHeader eyebrow="Categorías" title="Empieza por la pieza que necesitas" href="/tienda" linkLabel="Ver catálogo"/>
      <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
        {categories.map((category, index) => <Link key={category.id} href={`/tienda?categoria=${encodeURIComponent(category.slug)}`} className="home-category focus-ring">
          <CategoryIsometricIcon slug={category.slug} name={category.name} size={44} priority={index < 4}/>
          <span className="min-w-0"><strong>{category.name}</strong><small>{category.count ? `${category.count} ${category.count === 1 ? "producto" : "productos"}` : "Ver productos"}</small></span>
        </Link>)}
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 sm:pb-20">
      <SectionHeader eyebrow="Selección NexoPC" title="Componentes destacados" href="/tienda" linkLabel="Ver toda la tienda"/>
      {catalog.status === "error" && !featuredProducts.length
        ? <div className="catalog-state mt-7 border-rose-400/20"><AlertTriangle className="text-rose-300"/><h2>No pudimos cargar los componentes</h2><p>{catalog.error}</p><Link href="/tienda" className="btn-secondary">Intentar de nuevo</Link></div>
        : featuredProducts.length
          ? <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{featuredProducts.map((product, index) => <ProductCard key={product.id} product={product} priority={index < 2}/>)}</div>
          : <div className="catalog-state mt-7"><Sparkles className="text-orange-300"/><h2>Aún no hay componentes disponibles</h2><p>Vuelve pronto para descubrir nuevas opciones.</p></div>}
    </section>

    <section className="border-y border-white/[.06] bg-white/[.015]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 md:gap-10 md:py-14">
        {benefits.map(({ icon: Icon, title, text }) => <div key={title} className="flex gap-4">
          <span className="home-benefit-icon"><Icon size={20}/></span>
          <div><h3 className="font-semibold text-slate-100">{title}</h3><p className="mt-1.5 text-sm leading-6 text-slate-400">{text}</p></div>
        </div>)}
      </div>
    </section>

    <section className="mx-auto grid max-w-7xl gap-4 px-4 py-14 sm:px-6 sm:py-20 md:grid-cols-2">
      <div className="home-cta">
        <p className="eyebrow">Arma tu PC</p>
        <h2 className="font-display mt-2 text-2xl font-bold sm:text-3xl">La primera PC no tiene por qué ser complicada.</h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">Elige un objetivo, define tu presupuesto y avanza pieza por pieza con explicaciones claras.</p>
        <Link href="/arma-tu-pc?modo=guiado" className="btn-primary focus-ring mt-6">Empezar con ayuda <ArrowRight size={17}/></Link>
      </div>
      <div className="home-cta">
        <p className="eyebrow">Tu cuenta</p>
        <h2 className="font-display mt-2 text-2xl font-bold sm:text-3xl">Regístrate y te atendemos más rápido.</h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">Crea tu cuenta con tu correo, celular y DNI para recibir asesoría y agilizar tus pedidos.</p>
        <Link href="/registro" className="btn-secondary focus-ring mt-6"><UserPlus size={17}/>Crear cuenta</Link>
      </div>
    </section>
  </div>;
}
