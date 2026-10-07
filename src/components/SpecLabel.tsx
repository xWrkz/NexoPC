"use client";

import { CircleHelp } from "lucide-react";

const explanations: Record<string, string> = {
  socket: "Conexión física entre el procesador y la placa madre. Ambos deben utilizar el mismo socket.",
  tdp: "Referencia del calor y consumo que genera el componente; ayuda a elegir refrigeración y fuente.",
  ddr: "Generación de la memoria RAM. La memoria y la placa madre deben usar el mismo tipo.",
  frecuencia: "Velocidad de operación declarada por el fabricante, normalmente expresada en MHz o GHz.",
  vram: "Memoria propia de la tarjeta gráfica, utilizada para imágenes, video, diseño y juegos.",
};

export default function SpecLabel({ label }: { label: string }) {
  const normalized = label.toLowerCase();
  const explanation = Object.entries(explanations).find(([key]) => normalized.includes(key))?.[1];
  return <span className="group/spec relative inline-flex items-center gap-1.5">{label}{explanation ? <><button type="button" className="focus-ring rounded-full text-slate-600 hover:text-cyan-300" aria-label={`Explicación de ${label}`}><CircleHelp size={14}/></button><span role="tooltip" className="spec-tooltip">{explanation}</span></> : null}</span>;
}
