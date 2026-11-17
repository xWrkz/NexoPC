"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState, useSyncExternalStore } from "react";
import { AlertCircle, Banknote, CheckCircle2, CreditCard, LoaderCircle, ShieldCheck, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils/formatPrice";
import { isMercadoPagoCheckoutUrl, type PaymentMethod } from "@/lib/checkout/schema";
import type { Customer } from "@/lib/account/schema";
import { DEFAULT_REGION, PE_REGIONS, regionCode } from "@/lib/checkout/regions";

type Form = { firstName: string; lastName: string; email: string; phone: string; address1: string; city: string; region: string; postcode: string; notes: string };
const initial: Form = { firstName: "", lastName: "", email: "", phone: "", address1: "", city: "", region: DEFAULT_REGION, postcode: "", notes: "" };
const fieldMeta: Partial<Record<keyof Form, { autoComplete: string; required?: boolean }>> = {
  firstName: { autoComplete: "given-name", required: true }, lastName: { autoComplete: "family-name", required: true },
  email: { autoComplete: "email", required: true }, phone: { autoComplete: "tel", required: true },
  address1: { autoComplete: "street-address", required: true }, city: { autoComplete: "address-level2", required: true },
  region: { autoComplete: "address-level1", required: true }, postcode: { autoComplete: "postal-code" },
};

const fromCustomer = (customer: Customer | null): Form => customer ? {
  ...initial,
  firstName: customer.firstName, lastName: customer.lastName, email: customer.email, phone: customer.phone,
  address1: customer.address1, city: customer.city, region: regionCode(customer.region) || initial.region, postcode: customer.postcode,
} : initial;

/** `customer`: cliente con sesión (la página ya exige sesión); sus datos precargan el formulario. */
export default function CheckoutForm({ customer }: { customer: Customer | null }) {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const mounted = useSyncExternalStore(() => () => undefined, () => true, () => false);
  const safeItems = mounted ? items : [];
  const [form, setForm] = useState(() => fromCustomer(customer));
  const [method, setMethod] = useState<PaymentMethod>("mercadopago");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const hasPendingPrices = safeItems.some((item) => !Number.isFinite(item.price) || item.price <= 0);
  const methods = [
    { value: "mercadopago" as const, Icon: CreditCard, title: "Mercado Pago", text: "Paga con tarjeta, Yape o tu cuenta Mercado Pago en su página segura." },
    { value: "bacs" as const, Icon: Banknote, title: "Transferencia bancaria", text: "Reservamos tu pedido y te enviamos las indicaciones para completar el pago." },
    { value: "cod" as const, Icon: Truck, title: "Pago contraentrega", text: "Coordinamos contigo la entrega y el pago después de registrar la solicitud." },
  ];

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setMessage(""); setErrors({});
    if (!safeItems.length) { setMessage("Tu carrito está vacío."); return; }
    if (hasPendingPrices) { setMessage("Hay productos sin precio confirmado. Revísalos en el carrito antes de continuar."); return; }
    setLoading(true);
    let redirecting = false;
    try {
      const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentMethod: method, customer: form, items: safeItems.map(({ productId, variationId, quantity }) => ({ productId, variationId, quantity })) }) });
      const data = await response.json();
      if (data.loginRequired) { router.push("/ingresar?siguiente=/checkout&sesion=expirada"); return; }
      if (!response.ok || !data.ok) {
        const itemErr = data.errors?.items?.[0];
        setMessage(itemErr || data.message || "No pudimos registrar el pedido. Revisa los datos e inténtalo de nuevo.");
        setErrors(data.errors ?? {});
        return;
      }
      if (data.paymentMethod === "mercadopago") {
        // El carrito se conserva hasta que el backend confirme el pago al volver.
        if (!isMercadoPagoCheckoutUrl(data.checkoutUrl)) { setMessage("No pudimos iniciar el pago. Inténtalo nuevamente."); return; }
        redirecting = true; window.location.assign(data.checkoutUrl); return;
      }
      clearCart(); router.push(`/confirmacion?numero=${encodeURIComponent(data.orderNumber)}&metodo=${data.paymentMethod}`);
    } catch { setMessage("No pudimos conectarnos con el servidor. Tu carrito sigue guardado para que lo intentes de nuevo."); }
    finally { if (!redirecting) setLoading(false); }
  };

  const field = (key: keyof Form, label: React.ReactNode, type = "text") => {
    const errorId = `${key}-error`; const meta = fieldMeta[key];
    return <label className="checkout-field" htmlFor={key}><span>{label}{meta?.required ? <em aria-hidden="true">*</em> : null}</span><input id={key} name={key} type={type} required={meta?.required} readOnly={key === "email" && Boolean(customer?.email)} autoComplete={meta?.autoComplete} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} className={`field ${errors[key]?.length ? "border-rose-400" : ""}`} aria-invalid={Boolean(errors[key]?.length)} aria-describedby={errors[key]?.length ? errorId : undefined}/>{errors[key]?.[0] ? <small id={errorId} role="alert">{errors[key][0]}</small> : null}</label>;
  };

  if (!safeItems.length) return <main className="experience-state"><div className="experience-state-card"><p className="eyebrow">Checkout</p><h1 className="font-display mt-3 text-4xl font-bold">No hay productos por confirmar</h1><p className="mt-3 text-slate-400">Añade componentes al carrito antes de continuar.</p><Link className="btn-primary focus-ring mt-6" href="/tienda">Ir al catálogo</Link></div></main>;

  return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
    <nav className="checkout-steps" aria-label="Progreso de compra"><Link href="/carrito" className="complete">1 <b>Carrito</b></Link><span className="active">2 <b>Datos</b></span><span>3 <b>Confirmación</b></span></nav>
    <div className="mt-8 max-w-2xl"><p className="eyebrow">Datos y entrega</p><h1 className="font-display mt-3 text-4xl font-bold sm:text-5xl">Confirma tu pedido</h1><p className="mt-3 text-slate-400">Completa tus datos y elige cómo deseas coordinar el pago.</p></div>
    <div className="commerce-note mt-6 max-w-2xl"><ShieldCheck size={19}/>Tus datos se usarán únicamente para coordinar este pedido y su entrega.</div>
    <form onSubmit={submit} className="mt-7 grid gap-7 lg:grid-cols-[1.15fr_.85fr]">
      <div className="space-y-6">
        <section className="panel checkout-section"><div className="checkout-section-head"><span>01</span><div><h2>Tus datos</h2><p>Información para comunicarnos contigo.</p></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2">{field("firstName", "Nombres")}{field("lastName", "Apellidos")}<div>{field("email", "Correo electrónico", "email")}{customer?.email ? <i className="mt-1 block text-xs not-italic text-slate-500">Es el correo de tu cuenta.</i> : null}</div>{field("phone", "Teléfono", "tel")}</div></section>
        <section className="panel checkout-section"><div className="checkout-section-head"><span>02</span><div><h2>Entrega</h2><p>Dirección donde deseas recibir el pedido.</p></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2">{field("address1", "Dirección")}</div>{field("city", "Distrito")}<label className="checkout-field" htmlFor="region"><span>Región<em aria-hidden="true">*</em></span><select id="region" name="region" required autoComplete="address-level1" value={form.region} onChange={(event) => setForm({ ...form, region: event.target.value })} className={`field ${errors.region?.length ? "border-rose-400" : ""}`} aria-invalid={Boolean(errors.region?.length)} aria-describedby={errors.region?.length ? "region-error" : undefined}>{PE_REGIONS.map((region) => <option key={region.code} value={region.code}>{region.name}</option>)}</select>{errors.region?.[0] ? <small id="region-error" role="alert">{errors.region[0]}</small> : null}</label>{field("postcode", <>Código postal <i>Opcional</i></>)}</div><label className="checkout-field mt-4" htmlFor="notes"><span>Nota para el pedido <i>Opcional</i></span><textarea id="notes" name="notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} rows={3} className="field resize-y" placeholder="Referencia, horario preferido u otra indicación."/></label></section>
        <section className="panel checkout-section"><div className="checkout-section-head"><span>03</span><div><h2>Forma de pago</h2><p>Elige cómo prefieres continuar.</p></div></div><div className="mt-5 grid gap-3">{methods.map(({ value, Icon, title, text }) => { const active = method === value; return <button type="button" key={value} onClick={() => setMethod(value)} aria-pressed={active} className={`payment-method focus-ring ${active ? "payment-method-active" : ""}`}><Icon size={20}/><span><strong>{title}</strong><small>{text}</small></span>{active ? <CheckCircle2 className="ml-auto text-orange-300" size={18}/> : null}</button>; })}</div></section>
      </div>
      <aside className="panel order-summary"><p className="eyebrow">Resumen del pedido</p><div className="mt-5 max-h-80 space-y-2.5 overflow-auto pr-1">
          {safeItems.map((item) => (
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
                  <span className="block text-xs uppercase tracking-wider text-slate-500">
                    {item.category}
                  </span>
                ) : null}
              </div>
              <strong className="shrink-0 text-xs font-bold text-slate-100">
                {formatPrice(String(item.price * item.quantity))}
              </strong>
            </div>
          ))}
        </div><div className="mt-5 flex justify-between gap-4 border-t border-white/8 pt-4"><span className="font-bold">Total estimado</span><span className="price text-2xl">{formatPrice(String(getTotal()))}</span></div>{message ? <div className="commerce-warning" role="alert"><AlertCircle size={17}/>{message}</div> : null}<button disabled={loading || hasPendingPrices} className="btn-primary focus-ring mt-5 w-full disabled:cursor-not-allowed disabled:opacity-55">{loading ? <><LoaderCircle className="animate-spin" size={18}/>{method === "mercadopago" ? "Conectando con Mercado Pago…" : "Registrando pedido…"}</> : method === "mercadopago" ? <><CreditCard size={18}/>Pagar con Mercado Pago</> : <><CheckCircle2 size={18}/>Registrar pedido</>}</button><p className="mt-3 text-center text-xs leading-5 text-slate-500">{method === "mercadopago" ? "Te llevaremos a Mercado Pago para pagar. Tu carrito se vacía cuando el pago se confirme." : "Revisaremos disponibilidad y datos antes de confirmar la atención."}</p></aside>
    </form>
  </main>;
}
