import type { Metadata } from "next";
import { Check } from "lucide-react";
import RegisterForm from "@/components/RegisterForm";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Regístrate en NexoPC para recibir asesoría y agilizar tus pedidos.",
};

const perks = [
  "Te identificamos al instante cuando nos escribas o hagas un pedido.",
  "Asesoría personalizada para elegir o armar tu PC.",
];

export default function RegisterPage() {
  return <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[.85fr_1.15fr] lg:items-start lg:py-20">
    <div className="lg:pt-6">
      <p className="eyebrow">Tu cuenta NexoPC</p>
      <h1 className="font-display mt-3 text-4xl font-bold sm:text-5xl">Crea tu cuenta</h1>
      <p className="mt-4 max-w-md leading-7 text-slate-400">Regístrate una vez y te acompañamos en cada compra, desde el primer componente hasta tu PC completa.</p>
      <ul className="mt-8 space-y-3">{perks.map((perk) => <li key={perk} className="flex items-start gap-3 text-sm text-slate-300"><Check size={18} className="mt-0.5 shrink-0 text-emerald-400"/>{perk}</li>)}</ul>
      <p className="mt-8 max-w-md text-xs leading-5 text-slate-500">Usamos tu DNI y celular solo para identificarte en tus pedidos y comunicarnos contigo. No los compartimos con terceros.</p>
    </div>
    <RegisterForm/>
  </div>;
}
