"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { AlertTriangle, Check, CheckCircle2, ChevronRight, CircleHelp, Cpu, Gauge, HardDrive, Info, MemoryStick, MonitorCog, PackageOpen, Plus, RotateCcw, Search, ShieldAlert, Sparkles, X, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { Product } from "@/types/product";
import { BuilderCategory, ComponentePC } from "@/lib/compatibility/rules";
import { useBuilderStore } from "@/store/builderStore";
import { useCartStore } from "@/store/cartStore";
import { getPriceValue } from "@/lib/utils/price";
import { formatPrice } from "@/lib/utils/formatPrice";
import ProductPlaceholder from "@/components/ProductPlaceholder";

const steps: Array<{ key: BuilderCategory; label: string; short: string; help: string; aliases: string[]; icon: typeof Cpu }> = [
  { key: "cpu", label: "Procesador", short: "CPU", help: "Ejecuta las tareas principales del equipo.", aliases: ["procesadores", "procesador", "cpu"], icon: Cpu },
  { key: "motherboard", label: "Placa madre", short: "Placa", help: "Conecta y coordina todos los componentes.", aliases: ["placas-madre", "placa-madre", "motherboards"], icon: MonitorCog },
  { key: "ram", label: "Memoria RAM", short: "RAM", help: "Mantiene abiertas tus aplicaciones y tareas.", aliases: ["memoria-ram", "memorias-ram", "ram"], icon: MemoryStick },
  { key: "gpu", label: "Tarjeta gráfica", short: "GPU", help: "Procesa imagen, video, diseño y juegos.", aliases: ["tarjetas-graficas", "tarjeta-grafica", "gpu"], icon: Gauge },
  { key: "storage", label: "Almacenamiento", short: "Disco", help: "Guarda el sistema, programas y archivos.", aliases: ["almacenamiento", "discos", "ssd", "discos-duros"], icon: HardDrive },
  { key: "psu", label: "Fuente de poder", short: "Fuente", help: "Entrega energía estable a todo el equipo.", aliases: ["fuentes-de-poder", "fuente-de-poder", "psu"], icon: Zap },
  { key: "case", label: "Gabinete", short: "Gabinete", help: "Protege las piezas y define el espacio disponible.", aliases: ["gabinetes", "gabinete", "cases", "chasis"], icon: PackageOpen },
];

const goals = [
  { id: "first-pc", label: "Mi primera PC" }, { id: "study", label: "Estudio" }, { id: "work", label: "Trabajo" },
  { id: "programming", label: "Programación" }, { id: "creation", label: "Diseño y creación" }, { id: "gaming", label: "Gaming" },
];

const attributeAliases: Record<string, string[]> = {
  socket: ["socket", "zócalo", "zocalo"], ram: ["tipo de ram", "memoria", "ddr"], tdp: ["tdp", "consumo"],
  format: ["formato", "factor de forma"], gpuLength: ["longitud gpu", "longitud máxima", "longitud maxima"], watts: ["vatios", "watt", "potencia"],
};

function normalize(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim(); }
function attribute(product: Product, names: string[]) { const match = product.attributes?.nodes.find((item) => names.some((name) => normalize(item.label || item.name).includes(normalize(name)))); return match?.options[0]; }
function numeric(value?: string) { if (!value) return undefined; const parsed = Number(value.replace(/[^0-9.,]/g, "").replace(",", ".")); return Number.isFinite(parsed) ? parsed : undefined; }
function productCategory(product: Product) {
  const slugs = [...(product.productCategories?.nodes.map((item) => item.slug) ?? []), ...(product.productTags?.nodes.map((item) => item.slug) ?? [])];
  return steps.find((step) => step.aliases.some((alias) => slugs.includes(alias)))?.key;
}
function toComponent(product: Product, category: BuilderCategory): ComponentePC {
  return { id: product.id, productId: product.databaseId, categoria: category, nombre: product.name, precio: getPriceValue(product.price), image: product.image?.sourceUrl, specs: { socket: attribute(product, attributeAliases.socket)?.toUpperCase(), tipoRAM: attribute(product, attributeAliases.ram)?.toUpperCase(), tdp: numeric(attribute(product, attributeAliases.tdp)), formato: attribute(product, attributeAliases.format)?.toUpperCase(), longitudGPU: numeric(attribute(product, attributeAliases.gpuLength)), vatios: numeric(attribute(product, attributeAliases.watts)) } };
}

export default function PcBuilder({ products }: { products: Product[] }) {
  const params = useSearchParams();
  const reduce = useReducedMotion();
  const initialMode = params.get("modo") === "guiado" ? "guided" : "advanced";
  const initialGoal = params.get("uso") ?? "first-pc";
  const [mode, setMode] = useState<"guided" | "advanced">(initialMode);
  const [goal, setGoal] = useState(initialGoal);
  const [budget, setBudget] = useState<number | undefined>();
  const [activeCategory, setActiveCategory] = useState<BuilderCategory | null>(null);
  const [search, setSearch] = useState("");
  const { seleccion, result, setComponente, getTotal, reset } = useBuilderStore();
  const addItem = useCartStore((state) => state.addItem);
  const selected = Object.values(seleccion).filter(Boolean) as ComponentePC[];
  const progress = Math.round((selected.length / steps.length) * 100);
  const total = getTotal();
  const optionsByCategory = useMemo(() => Object.fromEntries(steps.map((step) => [step.key, products.filter((product) => productCategory(product) === step.key)])) as Record<BuilderCategory, Product[]>, [products]);
  const activeStep = steps.find((step) => step.key === activeCategory);
  const options = activeCategory ? optionsByCategory[activeCategory].filter((product) => `${product.name} ${product.sku ?? ""}`.toLowerCase().includes(search.toLowerCase())) : [];
  const unclassified = products.filter((product) => !productCategory(product)).length;

  const choose = (product: Product) => {
    if (!activeCategory) return;
    setComponente(activeCategory, toComponent(product, activeCategory));
    const next = steps.find((step) => !seleccion[step.key] && step.key !== activeCategory);
    setActiveCategory(next?.key ?? null);
    setSearch("");
  };
  const addBuild = () => {
    if (!selected.length || result.errors.length) return;
    const buildId = `build-${Date.now()}`;
    selected.forEach((item) => addItem({ id: `${buildId}-${item.id}`, productId: item.productId, name: item.nombre, price: item.precio, quantity: 1, image: item.image, category: item.categoria, buildId, buildName: "PC personalizada NexoPC" }));
    reset();
  };
  const resetBuild = () => { if (!selected.length || window.confirm("¿Quieres quitar todas las piezas seleccionadas?")) reset(); };

  return <div className="builder-shell"><div className="builder-modebar"><div><p className="eyebrow">Elige cómo avanzar</p><h2 className="mt-1 text-xl font-bold">Tú decides cuánto acompañamiento necesitas</h2></div><div className="builder-mode-switch" role="group" aria-label="Modo del armador"><button type="button" onClick={() => setMode("guided")} aria-pressed={mode === "guided"} className={mode === "guided" ? "active" : ""}><Sparkles size={16}/>Guíame paso a paso</button><button type="button" onClick={() => setMode("advanced")} aria-pressed={mode === "advanced"} className={mode === "advanced" ? "active" : ""}><Cpu size={16}/>Sé qué componentes quiero</button></div></div>

    <AnimatePresence initial={false}>{mode === "guided" ? <m.section initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="builder-guide"><div><p className="filter-title">1. ¿Cuál es tu objetivo principal?</p><div className="mt-3 flex flex-wrap gap-2">{goals.map((item) => <button type="button" key={item.id} onClick={() => setGoal(item.id)} className={`filter-chip ${goal === item.id ? "filter-chip-active" : ""}`}>{item.label}</button>)}</div></div><label className="builder-budget"><span>2. Presupuesto aproximado</span><div><span>S/</span><input type="number" min="0" step="100" value={budget ?? ""} onChange={(event) => setBudget(event.target.value ? Number(event.target.value) : undefined)} placeholder="Ej. 3000"/></div><small>Lo usaremos como referencia; no ocultaremos piezas por precio.</small></label></m.section> : null}</AnimatePresence>

    <div className="builder-workspace"><aside className="builder-steps"><div className="mb-4 flex items-center justify-between"><span className="text-xs font-black uppercase tracking-[.16em] text-slate-500">Componentes</span><strong className="text-sm text-cyan-200">{selected.length}/7</strong></div>{steps.map((step, index) => { const current = seleccion[step.key]; const available = optionsByCategory[step.key].length; const Icon = step.icon; return <button type="button" key={step.key} onClick={() => setActiveCategory(step.key)} className={`builder-step focus-ring ${current ? "builder-step-complete" : ""} ${activeCategory === step.key ? "builder-step-active" : ""}`}><span className="builder-step-number">{current ? <Check size={14}/> : index + 1}</span><Icon size={17}/><span className="min-w-0 flex-1 text-left"><strong>{step.label}</strong><small>{current ? current.nombre : available ? `${available} ${available === 1 ? "opción" : "opciones"}` : "Sin clasificar aún"}</small></span><ChevronRight size={15}/></button>; })}{unclassified ? <p className="mt-4 flex gap-2 rounded-xl border border-amber-300/12 bg-amber-300/5 p-3 text-[11px] leading-5 text-amber-100/70"><Info size={14} className="mt-0.5 shrink-0"/>{unclassified} {unclassified === 1 ? "producto necesita" : "productos necesitan"} una categoría compatible para aparecer aquí.</p> : null}</aside>

      <section className="builder-stage"><div className="builder-stage-header"><div><p className="eyebrow">Nexo Assembly Core</p><h2 className="font-display mt-2 text-3xl font-bold">Tu equipo toma forma aquí.</h2></div><div className="builder-progress-ring" style={{ "--progress": `${progress * 3.6}deg` } as React.CSSProperties}><span>{progress}%</span></div></div><div className="pc-chassis"><div className="tech-grid absolute inset-0 opacity-50"/><span className="pc-energy-line"/><Image src="/brand/icon-mark.webp" width={110} height={73} alt="" className="pc-brand-mark"/><div className="pc-slot-grid">{steps.map((step, index) => { const item = seleccion[step.key]; const Icon = step.icon; return <m.button type="button" layout key={step.key} onClick={() => setActiveCategory(step.key)} className={`pc-slot focus-ring ${item ? "pc-slot-filled" : ""}`} initial={false} animate={item && !reduce ? { scale: [1, 1.06, 1] } : {}} transition={{ duration: .45 }}><span className="pc-slot-icon"><Icon size={18}/></span><span><small>{step.short}</small><strong>{item ? item.nombre : "Pendiente"}</strong></span>{item ? <CheckCircle2 size={16} className="ml-auto text-emerald-300"/> : <Plus size={15} className="ml-auto text-slate-600"/>}<span className="pc-slot-order">0{index + 1}</span></m.button>; })}</div></div><div className="builder-stage-tip"><CircleHelp size={17}/><span><strong>{mode === "guided" ? `Modo guiado: ${goals.find((item) => item.id === goal)?.label}` : "Modo avanzado"}.</strong> Selecciona cualquier módulo del gabinete para explorar piezas reales.</span></div></section>

      <aside className="builder-summary"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Tu configuración</p><h2 className="font-display mt-2 text-3xl font-bold">{selected.length}/7 piezas</h2></div><div className="builder-summary-icon"><Cpu size={21}/></div></div><div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/8"><m.div className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-300 to-cyan-300" animate={{ width: `${progress}%` }}/></div><div className="mt-6 max-h-56 space-y-2 overflow-auto pr-1">{selected.length ? selected.map((item) => <div key={item.categoria} className="builder-summary-item"><span className="min-w-0 truncate">{item.nombre}</span><strong>{formatPrice(String(item.precio))}</strong></div>) : <div className="builder-empty"><Sparkles size={18}/>Elige un módulo del gabinete para comenzar.</div>}</div><div className="builder-power"><span><Zap size={16}/>Consumo estimado</span><strong>{result.estimatedPower ? `${result.estimatedPower} W` : "—"}</strong><small>{result.estimatedPower ? "Referencia basada en la información disponible." : "Aparecerá cuando selecciones componentes con consumo registrado."}</small></div>{result.errors.length ? <div className="builder-alert builder-alert-error"><p><ShieldAlert size={16}/>Incompatibilidad comprobada</p><ul>{result.errors.map((error) => <li key={error}>{error}</li>)}</ul></div> : null}{result.warnings.length ? <div className="builder-alert builder-alert-warning"><p><AlertTriangle size={16}/>Información por confirmar</p><ul>{result.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></div> : null}<div className="mt-6 border-t border-white/8 pt-5"><div className="flex items-end justify-between"><span className="font-bold text-slate-300">Total estimado</span><span className="price text-2xl">S/ {total.toFixed(2)}</span></div>{budget ? <div className={`mt-2 text-right text-xs font-bold ${total > budget ? "text-amber-300" : "text-slate-500"}`}>{total > budget ? `Supera tu referencia por S/ ${(total - budget).toFixed(2)}` : `Restan S/ ${(budget - total).toFixed(2)} de tu referencia`}</div> : null}<button onClick={addBuild} disabled={!selected.length || Boolean(result.errors.length)} className="btn-primary focus-ring mt-5 w-full disabled:cursor-not-allowed disabled:opacity-40"><Plus size={18}/>Añadir configuración</button><button onClick={resetBuild} className="focus-ring mt-3 flex w-full items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-white"><RotateCcw size={15}/>Reiniciar selección</button></div></aside>
    </div>

    <AnimatePresence>{activeStep ? <m.div className="fixed inset-0 z-[90]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><button className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setActiveCategory(null)} aria-label="Cerrar selector"/><m.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 260 }} className="component-drawer"><div className="component-drawer-head"><div><p className="eyebrow">Paso {steps.findIndex((step) => step.key === activeStep.key) + 1}</p><h2 className="font-display mt-1 text-3xl font-bold">Elige {activeStep.label.toLowerCase()}</h2><p className="mt-2 text-sm text-slate-400">{activeStep.help}</p></div><button type="button" onClick={() => setActiveCategory(null)} className="focus-ring rounded-xl border border-white/10 p-2"><X/></button></div><div className="relative mt-6"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-300/60" size={16}/><input className="field pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Buscar ${activeStep.label.toLowerCase()}…`}/></div><div className="mt-5 grid gap-3 pb-10">{options.length ? options.map((product) => { const selectedProduct = seleccion[activeStep.key]?.id === product.id; return <button type="button" key={product.id} onClick={() => choose(product)} className={`component-choice focus-ring ${selectedProduct ? "component-choice-selected" : ""}`}><div className="component-choice-media">{product.image ? <Image src={product.image.sourceUrl} alt="" fill className="object-contain p-2"/> : <ProductPlaceholder name={product.name} compact/>}</div><div className="min-w-0 flex-1 text-left"><span className="text-xs font-bold text-slate-500">{product.sku ? `SKU ${product.sku}` : activeStep.label}</span><h3 className="mt-1 truncate font-bold">{product.name}</h3><p className="mt-2 text-lg font-black text-orange-300">{formatPrice(product.price)}</p></div><span className={`component-choice-action ${selectedProduct ? "bg-emerald-400 text-slate-950" : ""}`}>{selectedProduct ? <Check size={17}/> : <Plus size={17}/>}</span></button>; }) : <div className="catalog-state"><PackageOpen className="text-slate-500"/><h2>No hay opciones clasificadas</h2><p>Los productos aparecerán aquí cuando tengan la categoría correspondiente en el catálogo.</p></div>}</div></m.aside></m.div> : null}</AnimatePresence>
  </div>;
}
