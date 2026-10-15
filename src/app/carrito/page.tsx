"use client";

import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Minus, PackageOpen, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils/formatPrice";

export default function Carrito() {
  const { items, removeItem, removeBuild, updateQuantity, getTotal, clearCart } = useCartStore();
  const grouped = items.reduce<Record<string, typeof items>>((groups, item) => {
    const key = item.buildId ?? "individual";
    (groups[key] ??= []).push(item);
    return groups;
  }, {});
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const hasPendingPrices = items.some((item) => !Number.isFinite(item.price) || item.price <= 0);

  if (!items.length) return <main className="experience-state"><div className="experience-state-card"><PackageOpen className="mx-auto text-orange-300" size={44}/><p className="eyebrow mt-5">Carrito</p><h1 className="font-display mt-3 text-4xl font-bold">Tu carrito está vacío</h1><p className="mx-auto mt-3 max-w-md text-slate-400">Explora componentes o crea una configuración guiada para empezar.</p><div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/tienda" className="btn-primary focus-ring">Ver componentes <ArrowRight size={16}/></Link><Link href="/arma-tu-pc" className="btn-secondary focus-ring">Armar mi PC</Link></div></div></main>;

  return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
    <nav className="checkout-steps" aria-label="Progreso de compra"><span className="active">1 <b>Carrito</b></span><span>2 <b>Datos</b></span><span>3 <b>Confirmación</b></span></nav>
    <div className="mt-8 max-w-2xl"><p className="eyebrow">Revisa tu selección</p><h1 className="font-display mt-3 text-4xl font-bold sm:text-5xl">Tu carrito</h1><p className="mt-3 text-slate-400">Comprueba las piezas y cantidades antes de continuar.</p></div>
    <div className="mt-9 grid gap-7 lg:grid-cols-[1.25fr_.75fr]">
      <div className="space-y-5">{Object.entries(grouped).map(([group, groupItems]) => <section className="panel overflow-hidden" key={group}>
        {group !== "individual" ? (
          <div className="flex items-center justify-between border-b border-white/8 bg-orange-400/5 px-5 py-3 text-sm font-bold text-orange-200">
            <div className="flex items-center gap-2">
              <PackageOpen size={16} className="text-orange-400 shrink-0" />
              <span>{groupItems[0]?.buildName ?? "Configuración NexoPC"} · {groupItems.length} piezas</span>
            </div>
            <button
              type="button"
              onClick={() => {
                const name = groupItems[0]?.buildName ?? "esta configuración";
                if (window.confirm(`¿Quitar todas las ${groupItems.length} piezas de ${name} del carrito?`)) {
                  removeBuild(group);
                }
              }}
              className="flex items-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20 hover:text-rose-200 focus-ring"
              title="Quitar todas las piezas de este grupo"
              aria-label={`Quitar grupo ${groupItems[0]?.buildName ?? "Configuración"}`}
            >
              <Trash2 size={13} />
              <span>Quitar grupo</span>
            </button>
          </div>
        ) : null}
        <div>{groupItems.map((item) => <article className="cart-line" key={item.id}>
          {item.image ? <div className="cart-line-media"><Image src={item.image} alt={item.name} fill className="object-contain p-2" sizes="80px"/></div> : <div className="cart-line-media cart-line-placeholder">NexoPC</div>}
          <div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{item.category ?? "Componente"}</p><h2 className="mt-1 font-bold text-slate-100">{item.name}</h2><p className={`mt-2 text-lg font-extrabold ${item.price > 0 ? "text-orange-200" : "text-amber-200"}`}>{formatPrice(String(item.price))}</p>
            <div className="mt-3 flex items-center justify-between gap-3"><div className="quantity-control"><button type="button" onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="focus-ring" aria-label={`Reducir ${item.name}`}><Minus size={14}/></button><span aria-label={`Cantidad ${item.quantity}`}>{item.quantity}</span><button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="focus-ring" aria-label={`Aumentar ${item.name}`}><Plus size={14}/></button></div><button type="button" onClick={() => { if (window.confirm(`¿Quitar ${item.name} del carrito?`)) removeItem(item.id); }} className="cart-remove focus-ring" aria-label={`Quitar ${item.name}`}><Trash2 size={17}/><span>Quitar</span></button></div>
          </div>
        </article>)}</div>
      </section>)}</div>
      <aside className="panel order-summary">
        <p className="eyebrow">Resumen</p><div className="mt-5 flex justify-between text-sm text-slate-400"><span>{itemCount} {itemCount === 1 ? "artículo" : "artículos"}</span><span>Moneda: PEN</span></div>
        <div className="mt-4 flex items-end justify-between gap-4 border-t border-white/8 pt-4"><span className="font-bold">Total estimado</span><span className="price text-3xl">{formatPrice(String(getTotal()))}</span></div>
        {hasPendingPrices ? <div className="commerce-warning"><AlertTriangle size={17}/><span><strong>Hay precios pendientes.</strong> Quita esos productos y consúltalos desde su ficha antes de continuar.</span></div> : <p className="commerce-note"><ShieldCheck size={16}/>Confirmaremos disponibilidad y total al registrar el pedido.</p>}
        {hasPendingPrices ? <Link href="/tienda" className="btn-secondary focus-ring mt-5 w-full">Volver al catálogo <ArrowRight size={17}/></Link> : <Link href="/checkout" className="btn-primary focus-ring mt-5 w-full">Continuar con mis datos <ArrowRight size={17}/></Link>}
        <button type="button" onClick={() => { if (window.confirm("¿Vaciar todo el carrito?")) clearCart(); }} className="focus-ring mt-3 w-full rounded-lg py-2 text-sm font-bold text-slate-500 hover:text-rose-300">Vaciar carrito</button>
      </aside>
    </div>
  </main>;
}
