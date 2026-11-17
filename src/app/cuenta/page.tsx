import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertCircle, PackageOpen, RefreshCw } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import { loadCustomer, loadOrders, readSession } from "@/lib/account/session";
import { canCheckPayment, formatOrderDate, orderStatus } from "@/lib/account/orders";
import type { AccountOrder, Customer } from "@/lib/account/schema";
import { formatPrice } from "@/lib/utils/formatPrice";

export const metadata: Metadata = { title: "Mi cuenta", robots: { index: false } };

const LOGIN = "/ingresar?siguiente=/cuenta";

function Profile({ customer }: { customer: Customer }) {
  const address = [customer.address1, customer.city, customer.region].filter(Boolean).join(", ");
  const rows = [
    ["Nombre", `${customer.firstName} ${customer.lastName}`.trim()],
    ["Correo", customer.email],
    ["Celular", customer.phone || "—"],
    ["Última dirección de entrega", address || "Se guardará con tu primera compra"],
  ];
  return <aside className="panel account-profile">
    <p className="eyebrow">Tus datos</p>
    <dl className="mt-4">{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    <p className="mt-5 text-xs leading-5 text-slate-500">¿Necesitas cambiar tu correo o recuperar tu contraseña? Escríbenos a contacto.nexopc@gmail.com.</p>
  </aside>;
}

function OrderCard({ order }: { order: AccountOrder }) {
  const status = orderStatus(order);
  return <article className="account-order">
    <header>
      <div>
        <h3>Pedido #{order.number}</h3>
        <p>{formatOrderDate(order.createdAt)}</p>
      </div>
      <span className="order-status" data-tone={status.tone}>{status.label}</span>
    </header>
    <ul>{order.items.map((item, index) => <li key={`${order.id}-${index}`}>
      <span className="account-order-thumb">{item.image ? <Image src={item.image} alt="" fill sizes="44px" className="object-contain p-1"/> : null}</span>
      <span className="min-w-0 flex-1">{item.slug ? <Link href={`/producto/${item.slug}`} className="hover:text-white hover:underline">{item.name}</Link> : item.name}<small>{item.quantity} {item.quantity === 1 ? "unidad" : "unidades"}</small></span>
      <strong>{formatPrice(item.total)}</strong>
    </li>)}</ul>
    <footer>
      <span>{order.paymentMethodTitle}</span>
      {canCheckPayment(order) ? <Link href={`/confirmacion?pedido=${order.id}&clave=${encodeURIComponent(order.orderKey)}`} prefetch={false} className="account-order-action"><RefreshCw size={14}/>Consultar pago</Link> : null}
      <span className="account-order-total">Total <b>{formatPrice(order.total)}</b></span>
    </footer>
  </article>;
}

export default async function AccountPage() {
  const session = await readSession();
  if (!session) redirect(LOGIN);

  const [customer, orders] = await Promise.all([loadCustomer(session), loadOrders(session)]);
  if (customer.status === "expired" || orders.status === "expired") redirect(`${LOGIN}&sesion=expirada`);

  if (customer.status !== "ok") {
    return <main className="experience-state"><div className="experience-state-card panel"><AlertCircle className="mx-auto text-rose-300" size={44}/><h1 className="font-display mt-4 text-3xl font-bold">No pudimos cargar tu cuenta</h1><p className="mt-3 text-slate-400">Inténtalo nuevamente en unos minutos.</p><Link href="/cuenta" prefetch={false} className="btn-primary focus-ring mt-6"><RefreshCw size={17}/>Reintentar</Link></div></main>;
  }

  return <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div>
        <p className="eyebrow">Mi cuenta</p>
        <h1 className="font-display mt-3 text-4xl font-bold sm:text-5xl">Hola, {customer.data.firstName.split(" ")[0] || "cliente"}</h1>
        <p className="mt-2 text-slate-400">{customer.data.email}</p>
      </div>
      <LogoutButton/>
    </div>

    <div className="mt-9 grid gap-7 lg:grid-cols-[.7fr_1.3fr] lg:items-start">
      <Profile customer={customer.data}/>
      <section aria-labelledby="orders-title">
        <div className="flex items-baseline justify-between gap-4"><h2 id="orders-title" className="font-display text-2xl font-bold">Mis pedidos</h2>{orders.status === "ok" && orders.data.length ? <span className="font-mono text-xs uppercase tracking-widest text-slate-500">{orders.data.length} {orders.data.length === 1 ? "pedido" : "pedidos"}</span> : null}</div>
        {orders.status !== "ok" ? (
          <div className="commerce-warning mt-4" role="alert"><AlertCircle size={17}/>No pudimos cargar tus pedidos. Recarga la página en unos minutos.</div>
        ) : orders.data.length === 0 ? (
          <div className="panel account-empty mt-4"><PackageOpen size={32} className="text-orange-300"/><p className="font-bold">Aún no tienes pedidos</p><p className="text-sm text-slate-400">Cuando compres, aquí verás el estado y el detalle de cada pedido.</p><Link href="/tienda" className="btn-primary focus-ring mt-2">Ver componentes</Link></div>
        ) : (
          <div className="mt-4 grid gap-4">{orders.data.map((order) => <OrderCard key={order.id} order={order}/>)}</div>
        )}
      </section>
    </div>
  </main>;
}
