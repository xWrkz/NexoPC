import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Mail, MapPin, MessageSquare, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Soporte y Contacto — NexoPC",
  description: "Comunícate con el equipo técnico de NexoPC en Trujillo para asesoría de compatibilidad, estado de pedidos y soporte postventa.",
};

export default function SoportePage() {
  const channels = [
    {
      Icon: MessageSquare,
      title: "Asesoría de compatibilidad",
      detail: "Validamos cada pieza de tu ensamble antes de coordinar el pago y despacho.",
      meta: "Atención personalizada",
    },
    {
      Icon: Mail,
      title: "Correo de atención",
      detail: "Escríbenos con tu número de pedido o consulta técnica para darte seguimiento directo.",
      meta: "soporte@nexopc.pe",
    },
    {
      Icon: MapPin,
      title: "Cobertura de atención",
      detail: "Entregas coordinadas en Trujillo y envíos asegurados a nivel nacional.",
      meta: "Trujillo, La Libertad — Perú",
    },
    {
      Icon: Clock,
      title: "Horario de atención",
      detail: "Lunes a sábado de 9:00 a. m. a 7:00 p. m.",
      meta: "Respuesta ágil en horario hábil",
    },
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="eyebrow">Centro de ayuda</p>
      <h1 className="font-display mt-3 text-4xl font-bold sm:text-5xl">Soporte y contacto NexoPC</h1>
      <p className="mt-4 max-w-2xl text-slate-400 leading-7">
        Te acompañamos desde la elección de tus componentes hasta la configuración final y soporte postventa.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {channels.map(({ Icon, title, detail, meta }) => (
          <article key={title} className="panel p-6">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/15 text-orange-300">
              <Icon size={20} />
            </div>
            <h2 className="mt-4 text-lg font-bold text-white">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">{detail}</p>
            <p className="mt-4 text-xs font-extrabold uppercase tracking-wider text-cyan-300">{meta}</p>
          </article>
        ))}
      </div>

      <section className="panel mt-8 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <ShieldCheck className="text-orange-300 shrink-0 mt-1" size={24} />
          <div>
            <h2 className="text-lg font-bold text-white">¿Dudas sobre qué componentes elegir?</h2>
            <p className="mt-1 text-sm text-slate-400">
              Usa nuestro armador guiado para verificar sockets, memoria RAM, espacio de gabinete y potencia de fuente automáticamente.
            </p>
          </div>
        </div>
        <Link href="/arma-tu-pc?modo=guiado" className="btn-primary focus-ring shrink-0">
          Ir al armador guiado <ArrowRight size={16} />
        </Link>
      </section>
    </main>
  );
}

