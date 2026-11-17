import type { Metadata } from "next";
import { Check } from "lucide-react";
import LoginForm from "@/components/LoginForm";
import { safeNext } from "@/lib/account/schema";

export const metadata: Metadata = {
  title: "Ingresar",
  description: "Ingresa a tu cuenta NexoPC para comprar y revisar tus pedidos.",
};

const perks = [
  "Compra con tus datos ya completados.",
  "Revisa el estado y el detalle de todos tus pedidos.",
];

type Params = { siguiente?: string; sesion?: string };

export default async function LoginPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const next = safeNext(params.siguiente);
  const toCheckout = next.startsWith("/checkout");

  return <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[.85fr_1.15fr] lg:items-start lg:py-20">
    <div className="lg:pt-6">
      <p className="eyebrow">Tu cuenta NexoPC</p>
      <h1 className="font-display mt-3 text-4xl font-bold sm:text-5xl">{toCheckout ? "Ingresa para comprar" : "Ingresa a tu cuenta"}</h1>
      <p className="mt-4 max-w-md leading-7 text-slate-400">{toCheckout ? "Tu carrito sigue guardado. Ingresa o crea tu cuenta y continúas justo donde lo dejaste." : "Accede a tus pedidos y compra más rápido."}</p>
      <ul className="mt-8 space-y-3">{perks.map((perk) => <li key={perk} className="flex items-start gap-3 text-sm text-slate-300"><Check size={18} className="mt-0.5 shrink-0 text-emerald-400"/>{perk}</li>)}</ul>
    </div>
    <LoginForm next={next} expired={params.sesion === "expirada"}/>
  </div>;
}
