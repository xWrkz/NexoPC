import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Wrench } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Garantía — NexoPC",
  description: "Conoce la cobertura de garantía por defectos de fábrica, trazabilidad por número de serie y proceso de atención en NexoPC.",
};

export default function GarantiaPage() {
  const steps = [
    {
      title: "1. Cobertura por defecto de fabricación",
      text: "Todos nuestros componentes nuevos cuentan con garantía oficial contra defectos de fábrica desde la fecha de entrega registrada en tu comprobante o pedido.",
    },
    {
      title: "2. Registro por número de serie",
      text: "Cada componente principal se vincula mediante su número de serie físico para agilizar la validación de garantía sin trámites innecesarios.",
    },
    {
      title: "3. Diagnóstico técnico transparente",
      text: "Nuestro equipo técnico evalúa el componente en laboratorio para confirmar el fallo de origen y gestionar el cambio o nota de crédito según disponibilidad.",
    },
    {
      title: "4. Exclusiones estándar",
      text: "La garantía no cubre daños físicos por golpes, humedad, cortocircuitos por fuentes externas no reguladas, manipulación de sellos de serie o modificaciones fuera de especificación.",
    },
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="eyebrow">Respaldo postventa</p>
      <h1 className="font-display mt-3 text-4xl font-bold sm:text-5xl">Política de garantía</h1>
      <p className="mt-4 max-w-2xl text-slate-400 leading-7">
        Respaldamos tu inversión con productos originales, trazabilidad por serie y revisión técnica directa.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {steps.map((item) => (
          <article key={item.title} className="panel p-6">
            <div className="flex items-center gap-2 text-orange-300 font-bold text-sm">
              <CheckCircle2 size={17} />
              <span>Respaldo NexoPC</span>
            </div>
            <h2 className="mt-3 text-lg font-bold text-white">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">{item.text}</p>
          </article>
        ))}
      </div>

      <section className="panel mt-8 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <Wrench className="text-cyan-300 shrink-0 mt-1" size={22} />
          <div>
            <h2 className="text-lg font-bold text-white">¿Necesitas iniciar una solicitud de garantía?</h2>
            <p className="mt-1 text-sm text-slate-400">
              Ten a la mano tu número de pedido y escríbenos desde nuestra página de soporte.
            </p>
          </div>
        </div>
        <Link href="/soporte" className="btn-secondary focus-ring shrink-0">
          Contactar a soporte <ArrowRight size={16} />
        </Link>
      </section>
    </main>
  );
}

