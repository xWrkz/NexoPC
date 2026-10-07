"use client";

import Image from "next/image";
import { RefreshCw } from "lucide-react";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="grid min-h-[65vh] place-items-center px-6"><div className="catalog-state max-w-xl"><Image src="/brand/icon-mark.webp" width={100} height={66} alt="" className="h-auto w-24 opacity-70"/><h1 className="text-2xl font-black">Algo interrumpió la conexión</h1><p>No mostramos información de reemplazo porque queremos que siempre veas precios y productos reales. Inténtalo nuevamente.</p><button type="button" onClick={reset} className="btn-primary focus-ring"><RefreshCw size={16}/>Volver a intentar</button></div></div>;
}
