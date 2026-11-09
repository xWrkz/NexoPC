"use client";

import { m } from "motion/react";
import type { ReactNode } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Desliza el bloque al entrar en pantalla (una sola vez). No lo oculta: si la
 * animación no corre, el contenido sigue visible.
 */
export default function Reveal({ children, className, delay = 0, y = 10 }: { children: ReactNode; className?: string; delay?: number; y?: number }) {
  return (
    <m.div
      className={`reveal ${className ?? ""}`}
      initial={{ y }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      transition={{ duration: 0.55, delay, ease }}
    >
      {children}
    </m.div>
  );
}
