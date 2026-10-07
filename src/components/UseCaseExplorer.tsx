"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, BriefcaseBusiness, Code2, Gamepad2, Palette, Sparkles } from "lucide-react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { useState } from "react";

const modes = [
  { id: "first-pc", label: "Primera PC", icon: Sparkles, title: "Empieza con una guía, no con una lista de siglas.", text: "Te ayudamos a convertir tu presupuesto y tus necesidades en decisiones comprensibles.", chips: ["Paso a paso", "Presupuesto claro", "Sin adivinar"] },
  { id: "study", label: "Estudio", icon: BookOpen, title: "Una herramienta que acompaña tus clases y proyectos.", text: "Prioriza fluidez, videollamadas, investigación y las aplicaciones que realmente utilizas.", chips: ["Clases", "Multitarea", "Proyectos"] },
  { id: "work", label: "Trabajo", icon: BriefcaseBusiness, title: "Rendimiento estable para todos los días.", text: "Encuentra equilibrio para oficina, trabajo remoto y tareas profesionales exigentes.", chips: ["Productividad", "Home office", "Confiabilidad"] },
  { id: "programming", label: "Programación", icon: Code2, title: "Más espacio para compilar, probar y construir.", text: "Busca memoria, procesador y almacenamiento adecuados para tu flujo de desarrollo.", chips: ["Desarrollo", "Compilación", "Virtualización"] },
  { id: "creation", label: "Creación", icon: Palette, title: "Convierte cada idea en tiempo bien aprovechado.", text: "Equilibra procesador, memoria y gráficos para edición, diseño y render.", chips: ["Edición", "Render", "Diseño 3D"] },
  { id: "gaming", label: "Gaming", icon: Gamepad2, title: "Juega hoy y deja espacio para tu próximo upgrade.", text: "Construye alrededor de la resolución, fluidez y títulos que realmente disfrutas.", chips: ["FPS", "Calidad visual", "Upgrade"] },
];

export default function UseCaseExplorer() {
  const [active, setActive] = useState("first-pc");
  const selected = modes.find((mode) => mode.id === active) ?? modes[0];
  const reduce = useReducedMotion();
  const Icon = selected.icon;
  return <section className="mx-auto max-w-7xl px-6 pb-20"><div className="use-case-shell"><div className="use-case-nav"><p className="eyebrow">Empieza por ti</p><h2 className="font-display mt-3 text-4xl font-bold">¿Qué quieres hacer con tu próxima PC?</h2><p className="mt-4 text-sm leading-6 text-slate-400">No hace falta empezar por un procesador. Elige tu objetivo y te llevamos al siguiente paso.</p><div className="mt-7 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">{modes.map((mode) => { const ModeIcon = mode.icon; const selectedMode = mode.id === active; return <button key={mode.id} aria-pressed={selectedMode} onClick={() => setActive(mode.id)} className={`use-case-button focus-ring ${selectedMode ? "use-case-button-active" : ""}`}><ModeIcon size={17}/>{mode.label}<ArrowRight size={15} className="ml-auto"/></button>; })}</div></div><div className="use-case-stage"><div className="tech-grid absolute inset-0 opacity-40"/><AnimatePresence mode="wait"><m.div key={selected.id} initial={reduce ? { opacity: 0 } : { opacity: 0, x: 26, filter: "blur(8px)" }} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }} exit={reduce ? { opacity: 0 } : { opacity: 0, x: -20 }} transition={{ duration: .38 }} className="relative z-10"><div className="use-case-icon"><Icon size={26}/><span className="orbital-ring absolute -inset-3 rounded-full border border-dashed border-cyan-300/20"/></div><h3 className="font-display mt-8 max-w-2xl text-4xl font-bold leading-tight">{selected.title}</h3><p className="mt-4 max-w-xl leading-7 text-slate-300">{selected.text}</p><div className="mt-7 flex flex-wrap gap-2">{selected.chips.map((chip, index) => <m.span key={chip} initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .14 + index * .07 }} className="signal-chip">{chip}</m.span>)}</div><Link href={`/arma-tu-pc?modo=guiado&uso=${selected.id}`} className="btn-primary focus-ring mt-8">Guiarme con este objetivo <ArrowRight size={17}/></Link></m.div></AnimatePresence><div className="absolute -right-24 -top-20 size-80 rounded-full bg-orange-500/12 blur-3xl"/></div></div></section>;
}
