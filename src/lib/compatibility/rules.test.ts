import { describe, expect, it } from "vitest";
import { BuilderCategory, ComponentePC, ComponentSpecs, validarCompatibilidad } from "./rules";

const base = { cpu: null, motherboard: null, ram: null, gpu: null, storage: null, psu: null, case: null, cooler: null } as const;

describe("validarCompatibilidad", () => {
  it("bloquea sockets incompatibles", () => {
    const result = validarCompatibilidad({
      ...base,
      cpu: { id: "cpu", productId: 1, categoria: "cpu", nombre: "CPU", precio: 1, specs: { socketId: 2 } },
      motherboard: { id: "board", productId: 2, categoria: "motherboard", nombre: "Board", precio: 1, specs: { socketId: 3 } },
    });
    expect(result.errors[0]).toContain("socket");
  });

  it("detecta incompatibilidad de memoria entre CPU y RAM", () => {
    const result = validarCompatibilidad({
      ...base,
      cpu: { id: "cpu", productId: 1, categoria: "cpu", nombre: "Ryzen 5 5600X", precio: 1, specs: { socketId: 1, memoryTypeId: 1 } },
      ram: { id: "ram", productId: 3, categoria: "ram", nombre: "DDR5 16GB", precio: 1, specs: { memoryTypeId: 2 } },
    });
    expect(result.errors[0]).toContain("memoria RAM");
  });

  const item = (categoria: BuilderCategory, specs: ComponentSpecs): ComponentePC => ({ id: categoria, productId: 1, categoria, nombre: categoria, precio: 0, specs });

  it("acepta DDR4 y DDR5 en procesadores que soportan ambas", () => {
    const cpu = item("cpu", { socketId: 3, supportedMemoryTypeIds: [1, 2] });
    expect(validarCompatibilidad({ ...base, cpu, ram: item("ram", { memoryTypeId: 1 }) }).errors).toEqual([]);
    expect(validarCompatibilidad({ ...base, cpu, ram: item("ram", { memoryTypeId: 2 }) }).errors).toEqual([]);
  });

  it("bloquea más módulos de RAM que ranuras en la placa", () => {
    const result = validarCompatibilidad({ ...base, ram: item("ram", { memoryTypeId: 2, modules: 4 }), motherboard: item("motherboard", { ramSlots: 2, supportedMemoryTypeIds: [2] }) });
    expect(result.errors[0]).toContain("4 módulos");
  });

  it("avisa si el procesador no tiene gráficos integrados y falta GPU", () => {
    const cpu = item("cpu", { integratedGraphics: false });
    expect(validarCompatibilidad({ ...base, cpu }).warnings.join()).toContain("gráficos integrados");
    expect(validarCompatibilidad({ ...base, cpu, gpu: item("gpu", {}) }).warnings.join()).not.toContain("gráficos integrados");
  });

  it("avisa si el procesador no incluye disipador y no hay refrigeración", () => {
    expect(validarCompatibilidad({ ...base, cpu: item("cpu", { coolerIncluded: false }) }).warnings.join()).toContain("disipador");
  });

  it("bloquea refrigeración sin soporte para el socket", () => {
    const result = validarCompatibilidad({ ...base, cpu: item("cpu", { socketId: 4 }), cooler: item("cooler", { coolerType: "aire", supportedSocketIds: [1, 2, 3] }) });
    expect(result.errors[0]).toContain("socket");
  });

  it("bloquea disipadores más altos que el gabinete", () => {
    const result = validarCompatibilidad({ ...base, case: item("case", { maxCoolerHeightMm: 150 }), cooler: item("cooler", { coolerType: "aire", coolerHeightMm: 157 }) });
    expect(result.errors[0]).toContain("157 mm");
  });

  it("bloquea radiadores que no caben en el gabinete", () => {
    const result = validarCompatibilidad({ ...base, case: item("case", { maxRadiatorMm: 240 }), cooler: item("cooler", { coolerType: "liquido", radiatorMm: 360 }) });
    expect(result.errors[0]).toContain("360 mm");
  });

  it("no compara altura de disipador en refrigeración líquida", () => {
    const result = validarCompatibilidad({ ...base, case: item("case", { maxCoolerHeightMm: 150, maxRadiatorMm: 360 }), cooler: item("cooler", { coolerType: "liquido", radiatorMm: 240 }) });
    expect(result.errors).toEqual([]);
  });

  it("avisa cuando el TDP del procesador supera el declarado por la refrigeración", () => {
    const result = validarCompatibilidad({ ...base, cpu: item("cpu", { socketId: 2, tdpWatts: 170 }), cooler: item("cooler", { coolerType: "aire", supportedSocketIds: [2], maxTdpWatts: 150 }) });
    expect(result.warnings.join()).toContain("170 W");
  });

  it("bloquea fuentes por debajo del consumo estimado", () => {
    const result = validarCompatibilidad({ ...base, cpu: item("cpu", { tdpWatts: 125 }), gpu: item("gpu", { tdpWatts: 300 }), psu: item("psu", { continuousWatts: 400 }) });
    expect(result.errors.join()).toContain("425 W");
  });

  it("advierte cuando faltan especificaciones", () => {
    const result = validarCompatibilidad({
      ...base,
      cpu: { id: "cpu", productId: 1, categoria: "cpu", nombre: "CPU", precio: 1, specs: {} },
      motherboard: { id: "board", productId: 2, categoria: "motherboard", nombre: "Board", precio: 1, specs: {} },
    });
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});
