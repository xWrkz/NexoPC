import type { Metadata } from "next";
import { FileCheck2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Términos y Condiciones — NexoPC",
  description: "Condiciones comerciales de reserva de pedidos, confirmación de stock, pagos y entregas en NexoPC.",
};

export default function TerminosPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="eyebrow">Condiciones comerciales</p>
      <h1 className="font-display mt-3 text-4xl font-bold sm:text-5xl">Términos y condiciones</h1>
      <p className="mt-4 text-slate-400 leading-7">
        Revisa los términos aplicables al uso del catálogo, el armador de PC y el registro de pedidos en NexoPC.
      </p>

      <div className="panel mt-8 space-y-6 p-6 sm:p-8 text-sm leading-7 text-slate-300">
        <div className="flex items-center gap-3 text-orange-300 font-bold">
          <FileCheck2 size={18} />
          <span>Transparencia en precios, stock y compatibilidad</span>
        </div>
        <section>
          <h2 className="text-base font-bold text-white">1. Registro y confirmación de pedidos</h2>
          <p className="mt-2 text-slate-400">
            Al enviar el formulario de checkout, tu pedido queda registrado en estado de reserva pendiente de confirmación. Nuestro equipo verifica el stock físico y se comunica contigo para coordinar el pago y la entrega.
          </p>
        </section>
        <section>
          <h2 className="text-base font-bold text-white">2. Precios y moneda</h2>
          <p className="mt-2 text-slate-400">
            Todos los precios publicados en el catálogo están expresados en Soles (PEN, S/). Los productos marcados como “Precio por confirmar” requieren cotización previa antes de poder añadirse al carrito.
          </p>
        </section>
        <section>
          <h2 className="text-base font-bold text-white">3. Validación de compatibilidad</h2>
          <p className="mt-2 text-slate-400">
            El armador de PC verifica automáticamente las reglas técnicas principales documentadas en cada ficha. Antes del despacho o ensamblaje, un técnico de NexoPC revisa nuevamente la compatibilidad física completa.
          </p>
        </section>
        <section>
          <h2 className="text-base font-bold text-white">4. Límites de compra y disponibilidad</h2>
          <p className="mt-2 text-slate-400">
            Los pedidos en línea admiten un máximo de 20 unidades por producto, sujeto al stock disponible en almacén al momento de la validación.
          </p>
        </section>
      </div>
    </main>
  );
}

