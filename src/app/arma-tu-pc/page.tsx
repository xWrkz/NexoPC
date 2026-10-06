import { getProducts } from "@/lib/catalog/products";
import PcBuilder from "@/components/PcBuilder";
export const dynamic="force-dynamic";
export default async function ArmaTuPC(){const products=await getProducts();return <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16"><div className="max-w-3xl"><p className="eyebrow">Configurador NexoPC</p><h1 className="font-display mt-3 text-5xl font-bold sm:text-6xl">Arma una PC que trabaja como un solo sistema.</h1><p className="mt-4 text-lg leading-7 text-slate-400">Selecciona piezas reales del catálogo. Te mostramos los conflictos comprobados y te advertimos cuando falte información técnica para confirmar una combinación.</p></div><div className="mt-10"><PcBuilder products={products}/></div></div>;}
