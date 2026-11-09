import { BuilderCategory } from "@/lib/compatibility/rules";
import { BuildParts, getHeroChecks } from "@/lib/home/exampleBuilds";

export type BenchCheckState = "ok" | "fail" | "pending";
export type BenchCheck = { id: string; label: string; detail: string; state: BenchCheckState };

/** Orden de las bahías en el plano: aproxima la disposición física dentro del gabinete. */
export const benchLayout: BuilderCategory[] = ["cpu", "cooler", "ram", "motherboard", "storage", "gpu", "psu", "case"];

// Piezas sin las cuales cada conexión no se puede afirmar todavía.
const requires: Record<string, BuilderCategory[]> = {
  socket: ["cpu", "motherboard"],
  memory: ["ram", "motherboard"],
  gpu: ["gpu", "case"],
  cooler: ["cooler", "case"],
  psu: ["psu", "cpu"],
  power: ["cpu"],
};

/**
 * Conexiones del plano. Usa los mismos chequeos que el hero (y por lo tanto el validador real),
 * pero una conexión queda pendiente mientras falte alguna de sus piezas: sin ellas, "sin errores"
 * no significa "compatible".
 */
export function getBenchChecks(parts: BuildParts): BenchCheck[] {
  return getHeroChecks(parts).map((check) => {
    const missing = (requires[check.id] ?? []).some((key) => !parts[key]);
    // Sin GPU dedicada la referencia de potencia es solo el CPU.
    const detail = check.id === "psu" && !parts.gpu && parts.psu ? `${parts.psu.specs.continuousWatts ?? "—"} W · sin GPU` : check.detail;
    if (check.id === "gpu" && !parts.gpu && parts.cpu?.specs.integratedGraphics) return { id: check.id, label: check.label, detail: "Gráficos integrados", state: "ok" };
    return { id: check.id, label: check.label, detail, state: missing ? "pending" : check.ok ? "ok" : "fail" };
  });
}
