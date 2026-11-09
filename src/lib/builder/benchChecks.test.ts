import { describe, expect, it } from "vitest";
import { emptySelection } from "@/store/builderStore";
import { heroBuild } from "@/lib/home/exampleBuilds";
import { benchLayout, getBenchChecks } from "./benchChecks";

const stateOf = (parts: typeof heroBuild, id: string) => getBenchChecks(parts).find((check) => check.id === id)?.state;

describe("conexiones del plano", () => {
  it("las ocho bahías aparecen una sola vez", () => {
    expect(new Set(benchLayout).size).toBe(8);
  });

  it("sin piezas todo queda pendiente, nunca aprobado", () => {
    expect(getBenchChecks(emptySelection).every((check) => check.state === "pending")).toBe(true);
  });

  it("un armado completo y compatible aprueba todas las conexiones", () => {
    expect(getBenchChecks(heroBuild).every((check) => check.state === "ok")).toBe(true);
  });

  it("el socket queda pendiente hasta tener CPU y placa", () => {
    expect(stateOf({ ...emptySelection, cpu: heroBuild.cpu }, "socket")).toBe("pending");
    expect(stateOf({ ...emptySelection, cpu: heroBuild.cpu, motherboard: heroBuild.motherboard }, "socket")).toBe("ok");
  });

  it("marca la GPU que no cabe en el gabinete", () => {
    const broken = { ...heroBuild, case: { ...heroBuild.case!, specs: { ...heroBuild.case!.specs, maxGpuLengthMm: 200 } } };
    expect(stateOf(broken, "gpu")).toBe("fail");
  });

  it("sin GPU dedicada acepta los gráficos integrados del CPU", () => {
    const check = getBenchChecks({ ...heroBuild, gpu: null }).find((item) => item.id === "gpu");
    expect(check).toMatchObject({ state: "ok", detail: "Gráficos integrados" });
  });
});
