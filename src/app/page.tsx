import Link from "next/link";
import { ArrowRight, BookOpen, BriefcaseBusiness, CheckCircle2, Code2, Cpu, Gamepad2, Palette, ShieldCheck, Sparkles, UserPlus, Wrench } from "lucide-react";
import { getCatalog } from "@/lib/catalog/products";
import { isHiddenCatalogTaxonomy } from "@/lib/catalog/taxonomies";
import { exampleBuilds, getHeroChecks, getHeroPieces, heroBuild } from "@/lib/home/exampleBuilds";
import { validarCompatibilidad } from "@/lib/compatibility/rules";
import CategoryIsometricIcon from "@/components/CategoryIsometricIcon";
import BuildCard from "@/components/home/BuildCard";
import HeroBuild from "@/components/home/HeroBuild";
import Reveal from "@/components/home/Reveal";

export const dynamic = "force-dynamic";

const useCases = [
  { use: "first-pc", icon: Sparkles, label: "Mi primera PC" },
  { use: "study", icon: BookOpen, label: "Estudiar" },
  { use: "work", icon: BriefcaseBusiness, label: "Trabajar" },
  { use: "programming", icon: Code2, label: "Programar" },
  { use: "creation", icon: Palette, label: "Crear" },
  { use: "gaming", icon: Gamepad2, label: "Jugar" },
];

const benefits = [
  { icon: ShieldCheck, title: "Compatibilidad revisada", text: "Socket, memoria, largo de la GPU y potencia de la fuente: te decimos qué encaja y qué falta confirmar." },
  { icon: Wrench, title: "Ensamblaje acompañado", text: "Arma una PC completa sin dominar todas las especificaciones. Avanzas pieza por pieza." },
  { icon: Cpu, title: "Componentes con propósito", text: "Eliges según lo que vas a hacer, no según una lista de siglas." },
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

function SectionHeader({ eyebrow, title, text, href, linkLabel }: { eyebrow: string; title: string; text?: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="font-display mt-2 text-3xl font-bold sm:text-4xl">{title}</h2>
        {text ? <p className="mt-3 text-sm leading-6 text-slate-400 sm:text-base">{text}</p> : null}
      </div>
      {href ? <Link href={href} className="home-link focus-ring">{linkLabel} <ArrowRight size={16} /></Link> : null}
    </div>
  );
}

export default async function Home() {
  const catalog = await getCatalog();
  const rawCategories = catalog.categories.filter((category) => (category.count ?? 0) > 0 && !isHiddenCatalogTaxonomy(category));
  const categories = (rawCategories.length > 0 ? rawCategories : fallbackCategories).slice(0, 8);
  const heroPieces = getHeroPieces(heroBuild);
  const heroChecks = getHeroChecks(heroBuild);
  const { estimatedPower } = validarCompatibilidad(heroBuild);

  return (
    <div>
      <section className="home-hero">
        <div className="tech-grid absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.02fr_.98fr] lg:items-center lg:gap-10 lg:py-20">
          <div className="min-w-0">
            <p className="hero-tag"><span className="hero-tag-dot" aria-hidden="true" />Componentes y PCs a medida · Trujillo</p>
            <h1 className="font-display mt-5 max-w-2xl text-[2.35rem] font-bold leading-[1.04] text-balance sm:text-6xl">
              Tu próxima PC, <span className="text-orange-400">sin complicaciones.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
              No necesitas saberlo todo sobre hardware. Revisamos que cada pieza encaje con la siguiente y te guiamos según lo que vas a hacer.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/arma-tu-pc?modo=guiado" className="btn-primary focus-ring">Ayúdame a elegir <ArrowRight size={17} /></Link>
              <Link href="/tienda" className="btn-secondary focus-ring">Ver componentes</Link>
            </div>
            <div className="mt-9">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-slate-500">¿Para qué la necesitas?</p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {useCases.map(({ use, icon: Icon, label }) => (
                  <Link key={use} href={`/arma-tu-pc?modo=guiado&uso=${use}`} className="hero-usecase focus-ring">
                    <Icon size={16} />{label}
                  </Link>
                ))}
              </div>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
              {["Compatibilidad revisada", "Asesoría en Trujillo", "Sin tecnicismos"].map((item) => (
                <li key={item} className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400" />{item}</li>
              ))}
            </ul>
          </div>

          <HeroBuild pieces={heroPieces} checks={heroChecks} estimatedPower={estimatedPower} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <Reveal>
          <SectionHeader eyebrow="Armados por uso" title="Empieza por lo que vas a hacer" text="Tres configuraciones de referencia, validadas con las mismas reglas del armador. Úsalas como punto de partida y cámbialas a tu gusto." href="/tienda" linkLabel="Ver toda la tienda" />
        </Reveal>
        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {exampleBuilds.map((build, index) => (
            <Reveal key={build.id} delay={index * 0.08} className="flex">
              <BuildCard build={build} index={index} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-24">
        <Reveal>
          <SectionHeader eyebrow="Categorías" title="O ve directo a la pieza" href="/tienda" linkLabel="Ver catálogo" />
        </Reveal>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {categories.map((category, index) => (
            <Reveal key={category.id} delay={index * 0.04} className="flex">
              <Link href={`/tienda?categoria=${encodeURIComponent(category.slug)}`} className="home-category group focus-ring">
                <span className="home-category-index">{String(index + 1).padStart(2, "0")}</span>
                <span className="home-category-art"><CategoryIsometricIcon slug={category.slug} name={category.name} size={58} priority={false} /></span>
                <span className="min-w-0">
                  <strong>{category.name}</strong>
                  <small>{category.count ? `${category.count} ${category.count === 1 ? "producto" : "productos"}` : "Ver productos"}</small>
                </span>
                <ArrowRight size={16} className="home-category-arrow" />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-white/[.06] bg-white/[.015]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 md:gap-10 md:py-16">
          {benefits.map(({ icon: Icon, title, text }, index) => (
            <Reveal key={title} delay={index * 0.08}>
              <div className="flex gap-4">
                <span className="home-benefit-icon"><Icon size={20} /></span>
                <div>
                  <h3 className="font-semibold text-slate-100">{title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-slate-400">{text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-16 sm:px-6 sm:py-24 md:grid-cols-2">
        <Reveal className="flex">
          <div className="home-cta">
            <p className="eyebrow">Arma tu PC</p>
            <h2 className="font-display mt-2 text-2xl font-bold sm:text-3xl">La primera PC no tiene por qué ser complicada.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">Elige un objetivo, define tu presupuesto y avanza pieza por pieza con explicaciones claras.</p>
            <Link href="/arma-tu-pc?modo=guiado" className="btn-primary focus-ring">Empezar con ayuda <ArrowRight size={17} /></Link>
          </div>
        </Reveal>
        <Reveal delay={0.08} className="flex">
          <div className="home-cta">
            <p className="eyebrow">Tu cuenta</p>
            <h2 className="font-display mt-2 text-2xl font-bold sm:text-3xl">Regístrate y te atendemos más rápido.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">Crea tu cuenta con tu correo, celular y DNI para recibir asesoría y agilizar tus pedidos.</p>
            <Link href="/registro" className="btn-secondary focus-ring"><UserPlus size={17} />Crear cuenta</Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
