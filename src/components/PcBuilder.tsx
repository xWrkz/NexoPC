"use client";

import { AlertTriangle, CheckCircle2, Cpu, Info, Plus, RotateCcw, ShieldAlert, Sparkles, Zap } from "lucide-react";
import { Product } from "@/types/product";
import { getPriceValue } from "@/lib/utils/price";
import { BuilderCategory, ComponentePC } from "@/lib/compatibility/rules";
import { useBuilderStore } from "@/store/builderStore";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils/formatPrice";

const steps: { key: BuilderCategory; label: string; match: string[] }[] = [
  { key: "cpu", label: "Procesador", match: ["procesador", "cpu"] },
  { key: "motherboard", label: "Placa madre", match: ["placa", "motherboard", "board"] },
  { key: "ram", label: "Memoria RAM", match: ["ram", "memoria"] },
  { key: "gpu", label: "Tarjeta gráfica", match: ["gráfica", "grafica", "gpu", "video"] },
  { key: "storage", label: "Almacenamiento", match: ["almacenamiento", "storage", "disco", "ssd", "hdd"] },
  { key: "psu", label: "Fuente de poder", match: ["fuente", "poder", "psu"] },
  { key: "case", label: "Gabinete", match: ["gabinete", "case", "chasis"] },
];

const attributeValue = (attributes: Product["attributes"], names: string[]) => attributes?.nodes.find((item) => names.some((name) => item.name.toLowerCase().includes(name) || item.label?.toLowerCase().includes(name)))?.options[0];
const numericValue = (input?: string) => Number(input?.match(/[\d.]+/)?.[0]) || undefined;

function toComponent(product: Product, category: BuilderCategory): ComponentePC {
  return { id: product.id, productId: product.databaseId, categoria: category, nombre: product.name, precio: getPriceValue(product.price), image: product.image?.sourceUrl, specs: { socket: attributeValue(product.attributes, ["socket"]), tipoRAM: attributeValue(product.attributes, ["ram"]), tdp: numericValue(attributeValue(product.attributes, ["tdp", "consumo"])), formato: attributeValue(product.attributes, ["formato", "factor"]), longitudGPU: numericValue(attributeValue(product.attributes, ["longitud", "length"])), vatios: numericValue(attributeValue(product.attributes, ["vatios", "watt", "potencia"])) } };
}

export default function PcBuilder({ products }: { products: Product[] }) {
  const { seleccion, result, setComponente, getTotal, reset } = useBuilderStore();
  const addItem = useCartStore((state) => state.addItem);
  const selected = Object.values(seleccion).filter(Boolean) as ComponentePC[];
  const progress = Math.round((selected.length / steps.length) * 100);
  const addBuild = () => {
    if (!selected.length || result.errors.length) return;
    const buildId = `build-${Date.now()}`;
    selected.forEach((item) => addItem({ id: `${buildId}-${item.id}`, productId: item.productId, name: item.nombre, price: item.precio, quantity: 1, image: item.image, category: item.categoria, buildId, buildName: "PC personalizada NexoPC" }));
    reset();
  };

  return <div className="grid gap-7 lg:grid-cols-[1.25fr_.75fr]">
    <div className="space-y-3">
      {steps.map(({ key, label, match }, index) => {
        const options = products.filter((product) => product.productCategories?.nodes.some((category) => match.some((term) => category.name.toLowerCase().includes(term) || category.slug.toLowerCase().includes(term))));
        const current = seleccion[key];
        const unavailable = options.length === 0;
        return <section key={key} className={`panel overflow-hidden transition ${current ? "border-emerald-400/25" : ""}`}>
          <div className="flex items-center justify-between gap-4 p-4 sm:p-5">
            <div className="flex items-center gap-3"><span className={`grid size-8 place-items-center rounded-lg text-xs font-black ${current ? "bg-emerald-400 text-slate-950" : "bg-white/8 text-slate-400"}`}>{current ? <CheckCircle2 size={16} /> : index + 1}</span><div><h2 className="font-bold">{label}</h2><p className="text-xs text-slate-500">{current ? current.nombre : unavailable ? "Opciones próximamente" : `${options.length} ${options.length === 1 ? "opción disponible" : "opciones disponibles"}`}</p></div></div>
            {current ? <button onClick={() => setComponente(key, null)} className="focus-ring text-xs font-bold text-slate-400 hover:text-rose-300">Quitar</button> : unavailable ? <span className="rounded-full border border-white/10 bg-white/[.035] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Próximamente</span> : null}
          </div>
          <div className="border-t border-white/8 px-4 py-3 sm:px-5"><label className="sr-only" htmlFor={`builder-${key}`}>Seleccionar {label}</label><select id={`builder-${key}`} disabled={unavailable} className="field py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-45" value={current?.id ?? ""} onChange={(event) => { const selectedProduct = products.find((product) => product.id === event.target.value); setComponente(key, selectedProduct ? toComponent(selectedProduct, key) : null); }}><option value="">{unavailable ? "Aún no disponible" : `Elegir ${label.toLowerCase()}`}</option>{options.map((product) => <option value={product.id} key={product.id}>{product.name} · {formatPrice(product.price)}</option>)}</select>{unavailable ? <p className="mt-2 flex items-center gap-1.5 text-xs leading-5 text-slate-500"><Info size={13} />Esta selección estará disponible cuando incorporemos más opciones al catálogo.</p> : null}</div>
        </section>;
      })}
    </div>
    <aside className="panel h-fit p-5 lg:sticky lg:top-24"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Tu configuración</p><h2 className="font-display mt-2 text-3xl font-bold">{selected.length}/7 piezas</h2></div><div className="grid size-10 place-items-center rounded-xl border border-orange-300/20 bg-orange-400/8"><Cpu className="text-orange-300" size={20} /></div></div><div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-200 transition-all duration-500" style={{ width: `${progress}%` }} /></div><p className="mt-2 text-xs text-slate-500">{progress === 0 ? "Empieza con la pieza que ya tienes decidida." : `${progress}% de tu configuración seleccionada.`}</p>
      <div className="mt-6 space-y-2">{selected.length ? selected.map((item) => <div key={item.categoria} className="flex justify-between gap-3 rounded-xl bg-white/[.035] px-3 py-2.5 text-sm"><span className="min-w-0 truncate text-slate-300">{item.nombre}</span><span className="shrink-0 font-bold">{formatPrice(String(item.precio))}</span></div>) : <div className="rounded-xl border border-dashed border-white/15 p-4 text-sm leading-6 text-slate-500"><Sparkles size={17} className="mb-2 text-orange-300" />Elige componentes a la izquierda. Te mostraremos una guía clara mientras construyes tu equipo.</div>}</div>
      <div className="mt-5 rounded-xl border border-orange-300/15 bg-orange-400/5 p-4"><div className="flex items-center gap-2 text-sm font-bold text-orange-200"><Zap size={16} />Consumo estimado</div><p className="mt-1 text-2xl font-bold">{result.estimatedPower ? `${result.estimatedPower} W` : "—"}</p><p className="mt-1 text-xs leading-5 text-slate-400">{result.estimatedPower ? "Estimación orientativa según las piezas que elegiste." : "Aparecerá al seleccionar procesador o tarjeta gráfica."}</p></div>
      {result.errors.length ? <div className="mt-4 rounded-xl border border-rose-400/25 bg-rose-500/8 p-4"><p className="flex items-center gap-2 text-sm font-bold text-rose-200"><ShieldAlert size={16} />Incompatibilidades detectadas</p><ul className="mt-2 space-y-1 text-xs leading-5 text-rose-100">{result.errors.map((error) => <li key={error}>• {error}</li>)}</ul></div> : null}
      {result.warnings.length ? <div className="mt-4 rounded-xl border border-amber-400/25 bg-amber-400/8 p-4"><p className="flex items-center gap-2 text-sm font-bold text-amber-200"><AlertTriangle size={16} />Información por confirmar</p><ul className="mt-2 space-y-1 text-xs leading-5 text-amber-100">{result.warnings.map((warning) => <li key={warning}>• {warning}</li>)}</ul></div> : null}
      <div className="mt-6 border-t border-white/8 pt-5"><div className="flex justify-between"><span className="font-bold text-slate-300">Total estimado</span><span className="price text-2xl">S/ {getTotal().toFixed(2)}</span></div><button onClick={addBuild} disabled={!selected.length || Boolean(result.errors.length)} className="btn-primary focus-ring mt-5 w-full disabled:cursor-not-allowed disabled:opacity-45"><Plus size={18} />Añadir configuración al carrito</button><button onClick={reset} className="focus-ring mt-3 flex w-full items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-white"><RotateCcw size={15} />Reiniciar selección</button></div>
    </aside>
  </div>;
}
