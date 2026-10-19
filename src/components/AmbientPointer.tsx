"use client";

import { m, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useEffect } from "react";

export default function AmbientPointer() {
  const reduce = useReducedMotion();
  const x = useMotionValue(-400);
  const y = useMotionValue(-400);
  const smoothX = useSpring(x, { stiffness: 95, damping: 24, mass: 0.5 });
  const smoothY = useSpring(y, { stiffness: 95, damping: 24, mass: 0.5 });
  useEffect(() => {
    if (reduce || window.matchMedia("(pointer: coarse)").matches) return;
    const move = (event: PointerEvent) => {
      x.set(event.clientX - 230);
      y.set(event.clientY - 230);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [x, y, reduce]);
  if (reduce) return null;
  return <m.div aria-hidden className="ambient-pointer" style={{ x: smoothX, y: smoothY }} />;
}
