"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, BriefcaseBusiness, CheckCircle2, Code2, Gamepad2, Palette, Sparkles } from "lucide-react";
import { m, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils/formatPrice";

const audiences = [
  { label: "Mi primera PC", icon: Sparkles, use: "first-pc" },
  { label: "Estudiar", icon: BookOpen, use: "study" },
  { label: "Trabajar", icon: BriefcaseBusiness, use: "work" },
  { label: "Programar", icon: Code2, use: "programming" },
  { label: "Crear", icon: Palette, use: "creation" },
  { label: "Jugar", icon: Gamepad2, use: "gaming" },
];

export default function HeroExperience({ products }: { products: Product[] }) {
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 110, damping: 20 });
  const springY = useSpring(pointerY, { stiffness: 110, damping: 20 });
  const visualX = useTransform(springX, [-.5, .5], reduceMotion ? [0, 0] : [-14, 14]);
  const visualY = useTransform(springY, [-.5, .5], reduceMotion ? [0, 0] : [-10, 10]);
  const glowX = useTransform(springX, [-.5, .5], ["22%", "72%"]);
  const glowY = useTransform(springY, [-.5, .5], ["20%", "68%"]);
  const featured = products.find((product) => product.image && !/demostraci[oó]n|^test$/i.test(product.name));
  const move = (event: React.PointerEvent<HTMLElement>) => {
    if (reduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width - .5);
    pointerY.set((event.clientY - rect.top) / rect.height - .5);
  };

  return <section onPointerMove={move} onPointerLeave={() => { pointerX.set(0); pointerY.set(0); }} className="hero-forge relative isolate overflow-hidden"><div className="tech-grid absolute inset-0 -z-10"/><div className="noise"/><m.div className="hero-pointer-glow" style={{ left: glowX, top: glowY }}/><div className="circuit-line circuit-line-one"/><div className="circuit-line circuit-line-two"/>
    <div className="mx-auto grid min-h-[720px] max-w-[90rem] items-center gap-14 px-6 py-20 lg:grid-cols-[1.02fr_.98fr] lg:py-24"><div className="relative z-10"><m.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="hero-kicker"><span className="pulse-dot size-2 rounded-full bg-cyan-300"/>Tecnología que encaja contigo</m.div><h1 className="font-display mt-6 max-w-4xl text-5xl font-bold leading-[.96] text-white sm:text-6xl lg:text-[4.65rem]"><m.span initial={{ opacity: 0, y: 28, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: .65, ease: [.16, 1, .3, 1] }} className="block">Tu próxima PC empieza</m.span><m.span initial={{ opacity: 0, y: 28, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: .65, delay: .13, ease: [.16, 1, .3, 1] }} className="hero-gradient block">con una buena decisión.</m.span></h1><m.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .38 }} className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">No necesitas saberlo todo sobre hardware. Explora componentes reales o deja que te guiemos según lo que estudias, haces y disfrutas.</m.p><m.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .5 }} className="mt-9 flex flex-wrap gap-3"><Link href="/arma-tu-pc?modo=guiado" className="btn-primary focus-ring"><Sparkles size={18}/>Ayúdame a elegir <ArrowRight size={17}/></Link><Link href="/tienda" className="btn-secondary focus-ring">Explorar componentes</Link></m.div><m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .66 }} className="mt-10"><p className="text-xs font-bold uppercase tracking-[.16em] text-slate-500">¿Para qué la necesitas?</p><div className="mt-3 flex flex-wrap gap-2">{audiences.map(({ label, icon: Icon, use }, index) => <m.div key={use} initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .7 + index * .06 }}><Link href={`/arma-tu-pc?modo=guiado&uso=${use}`} className="audience-pill focus-ring"><Icon size={14}/>{label}</Link></m.div>)}</div></m.div><m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .82 }} className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-400">{["Precios en soles", "Asesoría en Trujillo", "Disponibilidad actualizada"].map((item) => <span key={item} className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400"/>{item}</span>)}</m.div></div>

      <m.div style={{ x: visualX, y: visualY }} initial={{ opacity: 0, scale: .93, rotateY: -8 }} animate={{ opacity: 1, scale: 1, rotateY: 0 }} transition={{ duration: .85, delay: .18, ease: [.16, 1, .3, 1] }} className="relative mx-auto w-full max-w-xl [perspective:1200px]"><div className="absolute -inset-16 rounded-full bg-orange-500/16 blur-3xl"/><div className="forge-console"><div className="forge-console-top"><span>Nexo Selection System</span><span className="flex items-center gap-2 text-emerald-300"><i className="pulse-dot size-2 rounded-full bg-emerald-400"/>Guía disponible</span></div><div className="forge-product-stage"><div className="scan-line absolute inset-x-0 top-0 z-20 h-px bg-cyan-200/70"/><span className="orbital-ring forge-orbit"/><span className="orbital-ring-reverse forge-orbit forge-orbit-two"/>{featured?.image ? <Image src={featured.image.sourceUrl} alt={featured.image.altText || featured.name} fill priority sizes="(max-width: 1024px) 90vw, 45vw" className="z-10 object-contain p-12 drop-shadow-[0_24px_45px_rgba(0,0,0,.5)]"/> : <Image src="/brand/icon-mark.webp" width={256} height={169} alt="Isotipo NexoPC" priority className="relative z-10 object-contain drop-shadow-[0_0_45px_rgba(255,106,0,.25)]"/>}<m.span animate={reduceMotion ? {} : { y: [0, -6, 0], rotate: [-1, 1, -1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="forge-float-label"><Sparkles size={13}/>Selección inteligente</m.span></div><div className="forge-readout">{featured ? <><div><small>Selección destacada</small><strong>{featured.name}</strong></div><div className="text-right"><small>Desde</small><strong className="text-orange-300">{formatPrice(featured.price)}</strong></div></> : <><div><small>Empieza por lo que haces</small><strong>Estudia, crea, trabaja o juega.</strong></div><div className="text-right"><small>Sin adivinar</small><strong className="text-cyan-200">Paso a paso</strong></div></>}</div><div className="forge-signals">{["ESTUDIO", "TRABAJO", "CREACIÓN", "GAMING"].map((signal, index) => <m.span key={signal} animate={reduceMotion ? {} : { opacity: [.45, 1, .45] }} transition={{ duration: 2.2, delay: index * .3, repeat: Infinity }}>{signal}</m.span>)}</div></div><m.div animate={reduceMotion ? {} : { y: [0, -6, 0] }} transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }} className="forge-helper"><Sparkles size={15} className="text-cyan-300"/><span><strong>No adivines.</strong> Construye con una guía clara.</span></m.div></m.div>
    </div>
  </section>;
}
