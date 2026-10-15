"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { AlertCircle, Banknote, CheckCircle2, CreditCard, LoaderCircle, ShieldCheck, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils/formatPrice";

type Form = { firstName: string; lastName: string; email: string; phone: string; address1: string; city: string; region: string; postcode: string; notes: string };
const initial: Form = { firstName: "", lastName: "", email: "", phone: "", address1: "", city: "", region: "La Libertad", postcode: "", notes: "" };
const fieldMeta: Partial<Record<keyof Form, { autoComplete: string; required?: boolean }>> = {
  firstName: { autoComplete: "given-name", required: true }, lastName: { autoComplete: "family-name", required: true },
  email: { autoComplete: "email", required: true }, phone: { autoComplete: "tel", required: true },
  address1: { autoComplete: "street-address", required: true }, city: { autoComplete: "address-level2", required: true },
  region: { autoComplete: "address-level1", required: true }, postcode: { autoComplete: "postal-code" },
};

export default function Checkout() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const [form, setForm] = useState(initial);
  const [method, setMethod] = useState<"bacs" | "cod" | "culqi">("bacs");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const hasPendingPrices = items.some((item) => !Number.isFinite(item.price) || item.price <= 0);
  const methods = [
    { value: "bacs" as const, Icon: Banknote, title: "Transferencia bancaria", text: "Reservamos tu pedido y te enviamos las indicaciones para completar el pago." },
    { value: "cod" as const, Icon: Truck, title: "Pago contraentrega", text: "Coordinamos contigo la entrega y el pago después de registrar la solicitud." },
    { value: "culqi" as const, Icon: CreditCard, title: "Pago digital · próximamente", text: "Esta opción todavía no está disponible." },
  ];

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setMessage(""); setErrors({});
    if (method === "culqi") { setMessage("El pago digital aún no está disponible. Elige transferencia o pago contraentrega."); return; }
    if (!items.length) { setMessage("Tu carrito está vacío."); return; }
    if (hasPendingPrices) { setMessage("Hay productos sin precio confirmado. Revísalos en el carrito antes de continuar."); return; }
    setLoading(true);
    try {
      const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentMethod: method, customer: form, items: items.map(({ productId, variationId, quantity }) => ({ productId, variationId, quantity })) }) });
      const data = await response.json();
      if (!response.ok || !data.ok) { setMessage(data.message ?? "No pudimos registrar el pedido. Revisa los datos e inténtalo de nuevo."); setErrors(data.errors ?? {}); return; }
      clearCart(); router.push(`/confirmacion?numero=${encodeURIComponent(data.orderNumber)}&metodo=${data.paymentMethod}`);
    } catch { setMessage("No pudimos conectarnos con el servidor. Tu carrito sigue guardado para que lo intentes de nuevo."); }
    finally { setLoading(false); }
  };

  const field = (key: keyof Form, label: string, type = "text") => {
    const errorId = `${key}-error`; const meta = fieldMeta[key];
    return <label className="checkout-field" htmlFor={key}><span>{label}{meta?.required ? <em aria-hidden="true">*</em> : null}</span><input id={key} name={key} type={type} required={meta?.required} autoComplete={meta?.autoComplete} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} className={`field ${errors[key]?.length ? "border-rose-400" : ""}`} aria-invalid={Boolean(errors[key]?.length)} aria-describedby={errors[key]?.length ? errorId : undefined}/>{errors[key]?.[0] ? <small id={errorId} role="alert">{errors[key][0]}</small> : null}</label>;
  };

  if (!items.length) return <main className="experience-state"><div className="experience-state-card"><p className="eyebrow">Checkout</p><h1 className="font-display mt-3 text-4xl font-bold">No hay productos por confirmar</h1><p className="mt-3 text-slate-400">Añade componentes al carrito antes de continuar.</p><Link className="btn-primary focus-ring mt-6" href="/tienda">Ir al catálogo</Link></div></main>;

  return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
    <nav className="checkout-steps" aria-label="Progreso de compra"><Link href="/carrito" className="complete">1 <b>Carrito</b></Link><span className="active">2 <b>Datos</b></span><span>3 <b>Confirmación</b></span></nav>
    <div className="mt-8 max-w-2xl"><p className="eyebrow">Datos y entrega</p><h1 className="font-display mt-3 text-4xl font-bold sm:text-5xl">Confirma tu pedido</h1><p className="mt-3 text-slate-400">Completa tus datos y elige cómo deseas coordinar el pago.</p></div>
    <div className="commerce-note mt-6 max-w-2xl"><ShieldCheck size={19}/>Tus datos se usarán únicamente para coordinar este pedido y su entrega.</div>
    <form onSubmit={submit} className="mt-7 grid gap-7 lg:grid-cols-[1.15fr_.85fr]">
      <div className="space-y-6">
        <section className="panel checkout-section"><div className="checkout-section-head"><span>01</span><div><h2>Tus datos</h2><p>Información para comunicarnos contigo.</p></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2">{field("firstName", "Nombres")}{field("lastName", "Apellidos")}{field("email", "Correo electrónico", "email")}{field("phone", "Teléfono", "tel")}</div></section>
        <section className="panel checkout-section"><div className="checkout-section-head"><span>02</span><div><h2>Entrega</h2><p>Dirección donde deseas recibir el pedido.</p></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2">{field("address1", "Dirección")}</div>{field("city", "Ciudad")}{field("region", "Región")}{field("postcode", "Código postal o distrito")}</div><label className="checkout-field mt-4" htmlFor="notes"><span>Nota para el pedido <i>Opcional</i></span><textarea id="notes" name="notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} rows={3} className="field resize-y" placeholder="Referencia, horario preferido u otra indicación."/></label></section>
        <section className="panel checkout-section"><div className="checkout-section-head"><span>03</span><div><h2>Forma de pago</h2><p>Elige cómo prefieres continuar.</p></div></div><div className="mt-5 grid gap-3">{methods.map(({ value, Icon, title, text }) => { const active = method === value; return <button type="button" key={value} onClick={() => setMethod(value)} aria-pressed={active} className={`payment-method focus-ring ${active ? "payment-method-active" : ""}`}><Icon size={20}/><span><strong>{title}</strong><small>{text}</small></span>{active ? <CheckCircle2 className="ml-auto text-orange-300" size={18}/> : null}</button>; })}</div></section>
      </div>
      <aside className="panel order-summary"><p className="eyebrow">Resumen del pedido</p><div className="mt-5 max-h-80 space-y-2.5 overflow-auto pr-1">
          {items.map((item) => (
            <div className="order-summary-line flex items-center gap-3 py-1" key={item.id}>
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-slate-800/80">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain p-1"
                    sizes="44px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-slate-500">
                    PC
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-xs font-medium text-slate-200" title={item.name}>
                  <span className="font-bold text-orange-400">{item.quantity}×</span> {item.name}
                </p>
                {item.category ? (
                  <span className="block text-[10px] uppercase tracking-wider text-slate-500">
                    {item.category}
                  </span>
                ) : null}
              </div>
              <strong className="shrink-0 text-xs font-bold text-slate-100">
                {formatPrice(String(item.price * item.quantity))}
              </strong>
            </div>
          ))}
        </div><div className="mt-5 flex justify-between gap-4 border-t border-white/8 pt-4"><span className="font-bold">Total estimado</span><span className="price text-2xl">{formatPrice(String(getTotal()))}</span></div>{message ? <div className="commerce-warning" role="alert"><AlertCircle size={17}/>{message}</div> : null}<button disabled={loading || hasPendingPrices} className="btn-primary focus-ring mt-5 w-full disabled:cursor-not-allowed disabled:opacity-55">{loading ? <><LoaderCircle className="animate-spin" size={18}/>Registrando pedido…</> : method === "culqi" ? <><CreditCard size={18}/>Consultar disponibilidad</> : <><CheckCircle2 size={18}/>Registrar pedido</>}</button><p className="mt-3 text-center text-xs leading-5 text-slate-500">Revisaremos disponibilidad y datos antes de confirmar la atención.</p></aside>
    </form>
  </main>;
}
