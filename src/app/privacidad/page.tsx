import type { Metadata } from "next";
import { Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Privacidad — NexoPC",
  description: "Información sobre el tratamiento y protección de datos personales en NexoPC conforme a la normativa peruana.",
};

export default function PrivacidadPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="eyebrow">Protección de datos</p>
      <h1 className="font-display mt-3 text-4xl font-bold sm:text-5xl">Política de privacidad</h1>
      <p className="mt-4 text-slate-400 leading-7">
        En NexoPC respetamos tu privacidad y protegemos tus datos personales conforme a la Ley N.° 29733 (Ley de Protección de Datos Personales del Perú).
      </p>

      <div className="panel mt-8 space-y-6 p-6 sm:p-8 text-sm leading-7 text-slate-300">
        <div className="flex items-center gap-3 text-cyan-300 font-bold">
          <Lock size={18} />
          <span>Uso exclusivo para la atención de tu pedido</span>
        </div>
        <section>
          <h2 className="text-base font-bold text-white">1. Datos que recopilamos</h2>
          <p className="mt-2 text-slate-400">
            Al registrar un pedido recopilamos únicamente los datos necesarios para coordinar la venta y entrega: nombres y apellidos, correo electrónico, teléfono de contacto y dirección de envío.
          </p>
        </section>
        <section>
          <h2 className="text-base font-bold text-white">2. Finalidad del tratamiento</h2>
          <p className="mt-2 text-slate-400">
            Utilizamos tu información para confirmar el stock de tu pedido, coordinar el método de pago elegido, gestionar el despacho y mantener el registro de garantía de tus componentes.
          </p>
        </section>
        <section>
          <h2 className="text-base font-bold text-white">3. Almacenamiento local del carrito y armador</h2>
          <p className="mt-2 text-slate-400">
            Tu navegador guarda localmente las piezas seleccionadas en el carrito y en el armador de PC para que no pierdas tu avance al navegar. Puedes vaciarlos en cualquier momento desde la interfaz.
          </p>
        </section>
        <section>
          <h2 className="text-base font-bold text-white">4. Derechos ARCO</h2>
          <p className="mt-2 text-slate-400">
            Puedes solicitar el acceso, rectificación, cancelación u oposición sobre tus datos personales escribiéndonos a través de nuestros canales oficiales de soporte.
          </p>
        </section>
      </div>
    </main>
  );
}

