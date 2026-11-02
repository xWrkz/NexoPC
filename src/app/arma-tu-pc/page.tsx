import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { getAllBuilderProducts, getCatalog } from "@/lib/catalog/products";
import PcBuilder from "@/components/PcBuilder";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Arma tu PC", description: "Elige tus piezas paso a paso y revisa su compatibilidad antes de decidir." };

export default async function ArmaTuPC() {
  const allProducts = await getAllBuilderProducts();
  const products = allProducts.length ? allProducts : (await getCatalog()).products;

  return (
    <div className="mx-auto max-w-[90rem] px-4 py-8 sm:px-6 sm:py-10">
      <div className="max-w-4xl">
        <p className="eyebrow">Configurador NexoPC</p>
        <h1 className="font-display mt-2 text-3xl font-bold leading-tight sm:text-4xl">Tu PC, construida como un sistema.</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          Empieza por tu objetivo o entra directamente a las piezas. Te avisamos qué encaja, qué choca y qué falta confirmar.
        </p>
      </div>
      {!products.length ? (
        <div className="catalog-state mt-10 border-rose-400/20">
          <AlertTriangle className="text-rose-300" />
          <h2>No pudimos abrir el armador</h2>
          <p>No se encontraron componentes en el catálogo.</p>
          <Link className="btn-secondary" href="/arma-tu-pc">
            <RefreshCw size={16} />
            Volver a intentar
          </Link>
        </div>
      ) : (
        <div className="mt-6">
          <PcBuilder products={products} />
        </div>
      )}
    </div>
  );
}
