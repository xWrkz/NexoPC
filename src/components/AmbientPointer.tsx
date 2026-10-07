"use client";

import { m, useMotionValue, useSpring } from "motion/react";
import { useEffect } from "react";

export default function AmbientPointer() {
  const x = useMotionValue(-400);
  const y = useMotionValue(-400);
  const smoothX = useSpring(x, { stiffness: 95, damping: 24, mass: .5 });
  const smoothY = useSpring(y, { stiffness: 95, damping: 24, mass: .5 });
  useEffect(() => {
    const move = (event: PointerEvent) => { x.set(event.clientX - 230); y.set(event.clientY - 230); };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [x, y]);
  return <m.div aria-hidden className="ambient-pointer" style={{ x: smoothX, y: smoothY }}/>
}
