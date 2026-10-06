import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Wrench } from "lucide-react";
import { getProducts } from "@/lib/catalog/products";
import ProductCard from "@/components/ProductCard";
import HeroExperience from "@/components/HeroExperience";
import UseCaseExplorer from "@/components/UseCaseExplorer";

export const dynamic = "force-dynamic";

const benefits = [
  { icon: ShieldCheck, title: "Compatibilidad asistida", text: "Te avisamos antes de elegir una combinación que no tiene sentido." },
  { icon: Wrench, title: "Ensamblaje experto", text: "Tu equipo llega listo para encender, trabajar y jugar." },
  { icon: Sparkles, title: "Acompañamiento real", text: "Configuramos contigo una PC según tu presupuesto y objetivo." },
];

export default async function Home() {
  const products = await getProducts();
  return <div className="overflow-hidden"><HeroExperience /><section className="mx-auto max-w-7xl px-6 py-20"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow">Elige tu próximo upgrade</p><h2 className="font-display mt-3 text-4xl font-bold">Componentes destacados</h2></div><Link href="/tienda" className="group flex items-center gap-2 text-sm font-bold text-orange-300">Ver toda la tienda <ArrowRight size={16} className="transition group-hover:translate-x-1" /></Link></div><div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.slice(0, 4).map((product, index) => <ProductCard key={product.id} product={product} priority={index < 2} />)}</div></section><UseCaseExplorer /><section className="mx-auto max-w-7xl px-6 pb-20"><div className="grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 md:grid-cols-3">{benefits.map(({ icon: Icon, title, text }) => <div className="bg-[#0b0f19] p-7" key={title}><Icon className="text-orange-300" size={25} /><h3 className="mt-5 text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{text}</p></div>)}</div></section><section className="mx-auto max-w-7xl px-6 pb-8"><div className="relative overflow-hidden rounded-3xl border border-orange-400/20 bg-gradient-to-br from-orange-500/20 via-[#161221] to-cyan-500/10 p-8 sm:p-12"><div className="absolute -right-20 -top-20 size-72 rounded-full bg-orange-400/15 blur-3xl" /><div className="relative max-w-2xl"><p className="eyebrow">Tu build, a tu ritmo</p><h2 className="font-display mt-3 text-4xl font-bold sm:text-5xl">Deja de adivinar si las piezas encajan.</h2><p className="mt-5 text-slate-300">El armador de NexoPC organiza cada decisión, estima tu potencia y explica claramente lo que falta por validar.</p><Link href="/arma-tu-pc" className="btn-primary focus-ring mt-7">Empezar mi configuración <ArrowRight size={17} /></Link></div></div></section></div>;
}
