"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import { RotateCcw, ShieldCheck } from "lucide-react";
import { animate, m, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import type { BuilderCategory } from "@/lib/compatibility/rules";
import type { HeroCheck, HeroPiece } from "@/lib/home/exampleBuilds";

const BASE = 0.25;
const STEP = 0.32;
const DUR = 0.55;
const ease = [0.22, 1, 0.36, 1] as const;

// Posición final (porcentaje del escenario) y punto de entrada (px) de cada pieza.
const placement: Record<BuilderCategory, { left: number; top: number; width: number; from: [number, number, number]; z: number }> = {
  case: { left: 50, top: 46, width: 46, from: [90, 40, 0.8], z: 1 },
  motherboard: { left: 18, top: 34, width: 56, from: [-90, 60, 0.8], z: 2 },
  cpu: { left: 38, top: 30, width: 20, from: [0, -90, 0.6], z: 4 },
  ram: { left: 53, top: 22, width: 26, from: [90, -30, 0.7], z: 3 },
  gpu: { left: 28, top: 58, width: 46, from: [0, 100, 0.8], z: 5 },
  cooler: { left: 36, top: 6, width: 26, from: [0, -110, 0.7], z: 6 },
  storage: { left: 6, top: 58, width: 22, from: [-80, 40, 0.7], z: 3 },
  psu: { left: 4, top: 74, width: 30, from: [-70, 90, 0.8], z: 4 },
};

// Cada chequeo se enciende cuando aterriza la pieza que lo completa.
const checkPiece: Record<string, BuilderCategory> = { socket: "cpu", memory: "ram", gpu: "gpu", cooler: "cooler", psu: "psu", power: "psu" };

type PieceCustom = { index: number; from: [number, number, number]; reduce: boolean };
type CheckCustom = { at: number; reduce: boolean };

const pieceVariants = {
  hidden: ({ from }: PieceCustom) => ({ opacity: 0, x: from[0], y: from[1], scale: from[2] }),
  visible: ({ index, reduce }: PieceCustom) => ({
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: reduce ? { duration: 0 } : { delay: BASE + index * STEP, duration: DUR, ease },
  }),
};

const checkVariants = {
  hidden: { opacity: 0.35 },
  visible: ({ at, reduce }: CheckCustom) => ({ opacity: 1, transition: reduce ? { duration: 0 } : { delay: at, duration: 0.3 } }),
};

const tickVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: ({ at, reduce }: CheckCustom) => ({ pathLength: 1, opacity: 1, transition: reduce ? { duration: 0 } : { delay: at, duration: 0.35, ease: "easeOut" as const } }),
};

function PowerCounter({ value, at, reduce }: { value: number; at: number; reduce: boolean }) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (current) => Math.round(current));
  useEffect(() => {
    if (reduce) {
      motionValue.set(value);
      return;
    }
    const controls = animate(motionValue, value, { delay: at, duration: 0.8, ease: "easeOut" });
    return () => controls.stop();
  }, [motionValue, value, at, reduce]);
  return <m.span>{rounded}</m.span>;
}

export default function HeroBuild({ pieces, checks, estimatedPower }: { pieces: HeroPiece[]; checks: HeroCheck[]; estimatedPower: number }) {
  const reduce = useReducedMotion() ?? false;
  const [replayKey, setReplayKey] = useState(0);
  const [done, setDone] = useState(false);
  // Con menos movimiento las piezas aparecen en su sitio. `mounted` evita un desajuste de hidratación:
  // useReducedMotion() es false en el servidor y solo se conoce en el cliente.
  const mounted = useSyncExternalStore(() => () => undefined, () => true, () => false);
  const idle = done || (mounted && reduce);
  const landing = new Map(pieces.map((piece, index) => [piece.key, BASE + index * STEP + DUR]));
  const lastIndex = pieces.length - 1;
  const checkTime = (check: HeroCheck) => (landing.get(checkPiece[check.id] ?? "psu") ?? 0) + (check.id === "power" ? 0.2 : 0);
  const finishAt = Math.max(...checks.map(checkTime)) + 0.9;

  const replay = () => {
    setDone(false);
    setReplayKey((key) => key + 1);
  };

  return (
    <div className="hero-rig" key={replayKey}>
      <m.div
        className={`hero-stage ${idle ? "hero-stage-idle" : ""}`}
        data-testid="hero-stage"
        initial="hidden"
        animate="visible"
        aria-label="Vista explosionada de una PC compatible"
        role="img"
      >
        <div className="hero-stage-glow" aria-hidden="true" />
        {pieces.map((piece, index) => {
          const spot = placement[piece.key];
          return (
            <m.div
              key={piece.key}
              className="hero-piece"
              style={{ left: `${spot.left}%`, top: `${spot.top}%`, width: `${spot.width}%`, zIndex: spot.z }}
              variants={pieceVariants}
              custom={{ index, from: spot.from, reduce } satisfies PieceCustom}
              onAnimationComplete={index === lastIndex ? () => setDone(true) : undefined}
            >
              <div className="hero-piece-float" style={{ "--i": index } as React.CSSProperties}>
                <Image src={piece.icon} alt="" width={509} height={350} unoptimized priority={index < 3} draggable={false} />
              </div>
            </m.div>
          );
        })}
      </m.div>

      <div className="hero-checks">
        <div className="hero-checks-head">
          <m.span className="hero-checks-badge" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={reduce ? { duration: 0 } : { delay: finishAt - 0.6, duration: 0.35 }}>
            <ShieldCheck size={15} />
            Compatible
          </m.span>
          <strong>Revisión del armado</strong>
          <small>Validado con las mismas reglas del armador.</small>
        </div>
        <m.ul className="hero-checks-list" aria-label="Verificación de compatibilidad" initial="hidden" animate="visible">
          {checks.map((check) => {
            const at = checkTime(check);
            const custom: CheckCustom = { at, reduce };
            return (
              <m.li key={check.id} className="hero-check" data-ok={check.ok} variants={checkVariants} custom={custom}>
                <span className="hero-check-icon" aria-hidden="true">
                  <m.svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <m.path d="M5 12.5l4.5 4.5L19 7" variants={tickVariants} custom={custom} />
                  </m.svg>
                </span>
                <span className="hero-check-label">{check.label}</span>
                <span className="hero-check-detail">
                  {check.id === "power" ? <>~<PowerCounter value={estimatedPower} at={at} reduce={reduce} /> W</> : check.detail}
                </span>
                <span className="sr-only">{check.ok ? "correcto" : "revisar"}</span>
              </m.li>
            );
          })}
        </m.ul>
        <button type="button" onClick={replay} className="hero-replay focus-ring" aria-label="Volver a armar la PC de ejemplo">
          <RotateCcw size={14} />
          Volver a armar
        </button>
      </div>
    </div>
  );
}
