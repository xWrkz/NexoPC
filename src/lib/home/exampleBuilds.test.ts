import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { validarCompatibilidad } from "@/lib/compatibility/rules";
import { exampleBuilds, getBuildChips, getHeroChecks, getHeroPieces, HERO_PIECE_ORDER, heroBuild } from "./exampleBuilds";

describe("armado del hero", () => {
  it("pasa el validador real sin errores ni avisos", () => {
    expect(validarCompatibilidad(heroBuild)).toEqual({ errors: [], warnings: [], estimatedPower: 210 });
  });

  it("muestra seis chequeos aprobados con los valores reales del armado", () => {
    const checks = getHeroChecks(heroBuild);
    expect(checks).toHaveLength(6);
    expect(checks.every((check) => check.ok)).toBe(true);
    const text = checks.map((check) => check.detail).join(" ");
    for (const value of ["AM5", "DDR5", "228", "388", "156", "174", "650", "550", "210"]) expect(text).toContain(value);
  });

  it("marca el chequeo de GPU cuando la tarjeta no cabe en el gabinete", () => {
    const broken = { ...heroBuild, case: { ...heroBuild.case!, specs: { ...heroBuild.case!.specs, maxGpuLengthMm: 200 } } };
    const checks = getHeroChecks(broken);
    expect(checks.find((check) => check.id === "gpu")?.ok).toBe(false);
    expect(checks.filter((check) => !check.ok)).toHaveLength(1);
  });

  it("marca el chequeo de fuente cuando falta potencia", () => {
    const broken = { ...heroBuild, psu: { ...heroBuild.psu!, specs: { continuousWatts: 400 } } };
    expect(getHeroChecks(broken).find((check) => check.id === "psu")?.ok).toBe(false);
  });

  it("ordena ocho piezas únicas con su ícono en disco", () => {
    expect(new Set(HERO_PIECE_ORDER).size).toBe(8);
    const pieces = getHeroPieces();
    expect(pieces).toHaveLength(8);
    for (const piece of pieces) expect(existsSync(path.join(process.cwd(), "public", piece.icon))).toBe(true);
  });
});

describe("armados por uso", () => {
  it("son tres configuraciones distintas con piezas del catálogo", () => {
    const signatures = exampleBuilds.map((build) => JSON.stringify(build.slugs));
    expect(new Set(signatures).size).toBe(3);
    for (const build of exampleBuilds) {
      const slugs = Object.values(build.slugs).filter(Boolean);
      expect(slugs.length).toBeGreaterThanOrEqual(7);
    }
  });

  it("el armado de estudio no lleva tarjeta gráfica", () => {
    expect(exampleBuilds.find((build) => build.id === "study")!.slugs.gpu).toBeNull();
  });

  it("los chips salen de los datos del armado", () => {
    expect(getBuildChips(heroBuild)).toEqual(["AM5", "DDR5", "GPU 228 mm", "650 W"]);
    expect(getBuildChips({ ...heroBuild, gpu: null })).toEqual(["AM5", "DDR5", "Gráficos integrados", "650 W"]);
  });
});
