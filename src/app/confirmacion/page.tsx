import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Clock, Mail, PackageCheck, RefreshCw } from "lucide-react";
import ClearCartOnMount from "@/components/ClearCartOnMount";
import { callStore } from "@/lib/checkout/backend";
import type { OrderStatus } from "@/lib/checkout/schema";

export const metadata: Metadata = { title: "Estado del pedido" };

type Params = { numero?: string; metodo?: string; pedido?: string; clave?: string };
type Outcome = "paid" | "pending" | "review" | "failed" | "unknown";

const SUPPORT = "Puedes seguir el pedido en Mi cuenta. Si necesitas ayuda, escríbenos a contacto.nexopc@gmail.com.";

async function loadOrder(pedido?: string, clave?: string): Promise<OrderStatus | null> {
  if (!pedido || !clave || !/^\d{1,12}$/.test(pedido) || !/^wc_order_[A-Za-z0-9]{6,40}$/.test(clave)) return null;
  try {
    const reply = await callStore(`checkout/status?order=${pedido}&key=${encodeURIComponent(clave)}`);
    return reply?.status === 200 ? (reply.data as OrderStatus) : null;
  } catch (cause) {
    console.error("[Confirmación] No se pudo consultar el pedido:", cause);
    return null;
  }
}

function outcomeOf(order: OrderStatus | null): Outcome {
  if (!order) return "unknown";
  if (order.paid) return "paid";
  // MP deja la order en action_required/waiting_retry cuando rechazan la tarjeta: no hubo cobro.
  if (order.status === "pending") return order.mpStatusDetail === "waiting_retry" ? "failed" : "pending";
  if (order.status === "on-hold") return "review";
  if (order.status === "failed" || order.status === "cancelled") return "failed";
  return "unknown";
}

const copy: Record<Outcome, { eyebrow: string; title: string; text: string }> = {
  paid: { eyebrow: "Pago aprobado", title: "¡Gracias por tu compra!", text: "Mercado Pago confirmó tu pago. Ahora preparamos tu pedido y te contactaremos para coordinar la entrega." },
  pending: { eyebrow: "Pago en proceso", title: "Estamos esperando la confirmación", text: "Mercado Pago todavía no confirma el pago. Si ya pagaste, puede tardar unos minutos. Tu carrito sigue guardado." },
  review: { eyebrow: "Pago en revisión", title: "Recibimos tu pago", text: "Revisaremos el pedido antes de confirmarlo y te escribiremos si necesitamos algo más." },
  failed: { eyebrow: "Pago no completado", title: "El pago no se realizó", text: "Mercado Pago no aprobó el pago y no se hizo ningún cobro. Tu carrito sigue guardado para que lo intentes de nuevo con otra tarjeta o forma de pago." },
  unknown: { eyebrow: "Pedido", title: "No pudimos consultar tu pedido", text: "Si pagaste con Mercado Pago, te confirmaremos el pago por correo. Si tienes dudas, escríbenos." },
};

function Steps() {
  return (
    <nav className="checkout-steps justify-center" aria-label="Progreso de compra">
      <span className="complete">1 <b>Carrito</b></span>
      <span className="complete">2 <b>Datos</b></span>
      <span className="active">3 <b>Confirmación</b></span>
    </nav>
  );
}

function Card({ icon, eyebrow, title, children, actions }: { icon: ReactNode; eyebrow: string; title: string; children: ReactNode; actions: ReactNode }) {
  return (
    <div className="experience-state">
      <div className="experience-state-card panel">
        <Steps />
        {icon}
        <p className="eyebrow mt-5">{eyebrow}</p>
        <h1 className="font-display mt-3 text-4xl font-bold">{title}</h1>
        {children}
        <div className="mt-7 flex flex-wrap justify-center gap-3">{actions}</div>
      </div>
    </div>
  );
}

export default async function Confirmacion({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;

  // Retorno desde Mercado Pago: el estado se consulta al backend, no se toma de la URL.
  if (params.pedido || params.clave) {
    const order = await loadOrder(params.pedido, params.clave);
    const outcome = outcomeOf(order);
    const text = copy[outcome];
    const icon =
      outcome === "paid" ? <CheckCircle2 className="mx-auto mt-8 text-emerald-300" size={48} /> :
      outcome === "failed" || outcome === "unknown" ? <AlertCircle className="mx-auto mt-8 text-rose-300" size={48} /> :
      <Clock className="mx-auto mt-8 text-orange-300" size={48} />;
    const refreshHref = `/confirmacion?pedido=${encodeURIComponent(params.pedido ?? "")}&clave=${encodeURIComponent(params.clave ?? "")}`;

    return (
      <Card
        icon={icon}
        eyebrow={text.eyebrow}
        title={text.title}
        actions={
          outcome === "paid" || outcome === "review" ? (
            <><Link href="/tienda" className="btn-primary focus-ring">Seguir explorando</Link><Link href="/cuenta" className="btn-secondary focus-ring">Ver mis pedidos</Link></>
          ) : outcome === "pending" ? (
            <><Link href={refreshHref} prefetch={false} className="btn-primary focus-ring"><RefreshCw size={17} />Actualizar estado</Link><Link href="/carrito" className="btn-secondary focus-ring">Ver carrito</Link></>
          ) : (
            <><Link href="/checkout" className="btn-primary focus-ring">Intentar de nuevo</Link><Link href="/carrito" className="btn-secondary focus-ring">Ver carrito</Link></>
          )
        }
      >
        {outcome === "paid" || outcome === "review" ? <ClearCartOnMount /> : null}
        {order ? <p className="mt-4 text-slate-400">Pedido <strong className="text-white">#{order.orderNumber}</strong></p> : null}
        <div className="mt-7 rounded-xl bg-white/[.035] p-4 text-left text-sm leading-6 text-slate-300">
          <div className="flex gap-3"><PackageCheck className="shrink-0 text-orange-300" size={19} /><p>{text.text}</p></div>
          <div className="mt-3 flex gap-3"><Mail className="shrink-0 text-cyan-300" size={19} /><p>{SUPPORT}</p></div>
        </div>
      </Card>
    );
  }

  // Transferencia y contraentrega: el pedido queda registrado y se coordina después.
  const transfer = params.metodo === "bacs";
  const numero = /^\d{1,12}$/.test(String(params.numero)) ? params.numero : "confirmado";
  return (
    <Card
      icon={<CheckCircle2 className="mx-auto mt-8 text-emerald-300" size={48} />}
      eyebrow="Pedido registrado"
      title="Tu solicitud está en marcha"
      actions={<><Link href="/tienda" className="btn-primary focus-ring">Seguir explorando</Link><Link href="/cuenta" className="btn-secondary focus-ring">Ver mis pedidos</Link></>}
    >
      <p className="mt-4 text-slate-400">Pedido <strong className="text-white">#{numero}</strong>. Ahora coordinaremos contigo los siguientes pasos.</p>
      <div className="mt-7 rounded-xl bg-white/[.035] p-4 text-left text-sm leading-6 text-slate-300">
        <div className="flex gap-3"><PackageCheck className="shrink-0 text-orange-300" size={19} /><p>{transfer ? "Te enviaremos las indicaciones para completar la transferencia y confirmar el pedido." : "Te contactaremos para coordinar la entrega y el pago contraentrega."}</p></div>
        <div className="mt-3 flex gap-3"><Mail className="shrink-0 text-cyan-300" size={19} /><p>{SUPPORT}</p></div>
      </div>
    </Card>
  );
}
