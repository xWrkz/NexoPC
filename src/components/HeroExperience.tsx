import Link from "next/link";
import { ArrowRight, BookOpen, BriefcaseBusiness, Check, CheckCircle2, Code2, Gamepad2, Palette, Sparkles } from "lucide-react";
import CategoryIsometricIcon from "@/components/CategoryIsometricIcon";

const audiences = [
  { label: "Mi primera PC", icon: Sparkles, use: "first-pc" },
  { label: "Estudiar", icon: BookOpen, use: "study" },
  { label: "Trabajar", icon: BriefcaseBusiness, use: "work" },
  { label: "Programar", icon: Code2, use: "programming" },
  { label: "Crear", icon: Palette, use: "creation" },
  { label: "Jugar", icon: Gamepad2, use: "gaming" },
];

const checks = [
  { slug: "procesadores", title: "Procesador y placa", detail: "Mismo socket y memoria admitida" },
  { slug: "memoria-ram", title: "Memoria RAM", detail: "Tipo DDR y ranuras libres" },
  { slug: "tarjetas-graficas", title: "Tarjeta gráfica", detail: "Largo disponible en el gabinete" },
  { slug: "refrigeracion", title: "Refrigeración", detail: "Socket, altura, radiador y TDP" },
  { slug: "fuentes-de-poder", title: "Fuente de poder", detail: "Potencia frente al consumo estimado" },
];

export default function HeroExperience() {
  return <section className="hero-forge relative isolate overflow-hidden"><div className="tech-grid absolute inset-0 -z-10"/><div className="noise"/><div className="circuit-line circuit-line-one"/><div className="circuit-line circuit-line-two"/>
    <div className="mx-auto grid max-w-[90rem] grid-cols-[minmax(0,1fr)] items-center gap-12 px-4 py-14 sm:px-6 lg:min-h-[680px] lg:grid-cols-[minmax(0,1.12fr)_minmax(0,.88fr)] lg:py-20"><div className="hero-enter relative z-10 min-w-0"><div className="hero-kicker"><span className="pulse-dot size-2 rounded-full bg-cyan-300"/>Tecnología que encaja contigo</div><h1 className="font-display mt-6 max-w-4xl text-[2.6rem] font-bold leading-[1] text-balance text-white sm:text-6xl lg:text-[4rem]"><span className="block">Tu próxima PC empieza</span><span className="hero-gradient block">con una buena decisión.</span></h1><p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">No necesitas saberlo todo sobre hardware. Explora componentes reales o deja que te guiemos según lo que estudias, haces y disfrutas.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/arma-tu-pc?modo=guiado" className="btn-primary focus-ring"><Sparkles size={18}/>Ayúdame a elegir <ArrowRight size={17}/></Link><Link href="/tienda" className="btn-secondary focus-ring">Explorar componentes</Link></div><div className="mt-9"><p className="text-xs font-bold uppercase tracking-[.16em] text-slate-400">¿Para qué la necesitas?</p><div className="mt-3 flex flex-wrap gap-2">{audiences.map(({ label, icon: Icon, use }) => <Link key={use} href={`/arma-tu-pc?modo=guiado&uso=${use}`} className="audience-pill focus-ring"><Icon size={14}/>{label}</Link>)}</div></div><div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-400">{["Compatibilidad revisada", "Asesoría en Trujillo", "Sin tecnicismos"].map((item) => <span key={item} className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400"/>{item}</span>)}</div></div>

      <div className="hero-enter hero-enter-late relative mx-auto w-full min-w-0 max-w-xl"><div className="absolute -inset-16 rounded-full bg-orange-500/12 blur-3xl"/><div className="forge-console"><p className="eyebrow">Arma tu PC</p><h2 className="font-display mt-2 text-2xl font-bold text-white">Revisamos lo que suele fallar</h2><ul className="forge-checks">{checks.map(({ slug, title, detail }) => <li key={slug}><CategoryIsometricIcon slug={slug} name={title} size={30}/><span className="min-w-0 flex-1"><strong>{title}</strong><small>{detail}</small></span><Check size={17} className="shrink-0 text-emerald-300" aria-hidden/></li>)}</ul><Link href="/arma-tu-pc" className="forge-action focus-ring">Probar el armador <ArrowRight size={17}/></Link></div></div>
    </div>
  </section>;
}
