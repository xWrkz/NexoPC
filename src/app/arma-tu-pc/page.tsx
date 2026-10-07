import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { getCatalog } from "@/lib/catalog/products";
import PcBuilder from "@/components/PcBuilder";

export const dynamic = "force-dynamic";

export default async function ArmaTuPC() {
  const catalog = await getCatalog();
  return <div className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6 sm:py-16"><div className="max-w-4xl"><p className="eyebrow">Configurador NexoPC</p><h1 className="font-display mt-3 text-5xl font-bold sm:text-6xl">Tu PC, construida como un sistema.</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-slate-400">Empieza por tu objetivo o entra directamente a las piezas. Usamos componentes reales y distinguimos entre compatibilidad confirmada, conflicto e información pendiente.</p></div>{catalog.status === "error" ? <div className="catalog-state mt-10 border-rose-400/20"><AlertTriangle className="text-rose-300"/><h2>No pudimos abrir el armador</h2><p>{catalog.error}</p><Link className="btn-secondary" href="/arma-tu-pc"><RefreshCw size={16}/>Volver a intentar</Link></div> : <div className="mt-10"><PcBuilder products={catalog.products}/></div>}</div>;
}
