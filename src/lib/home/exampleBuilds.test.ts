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
  it.each(exampleBuilds)("$title pasa el validador sin errores", ({ parts }) => {
    expect(validarCompatibilidad(parts).errors).toEqual([]);
  });

  it("el armado de estudio funciona sin GPU ni cooler", () => {
    const study = exampleBuilds.find((build) => build.id === "study")!;
    expect(validarCompatibilidad(study.parts)).toEqual({ errors: [], warnings: [], estimatedPower: 65 });
    expect(getBuildChips(study.parts)).toEqual(["AM5", "DDR5 32 GB", "1 TB NVMe", "650 W"]);
  });
});
