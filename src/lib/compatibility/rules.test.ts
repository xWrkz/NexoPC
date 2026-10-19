import { describe, expect, it } from "vitest";
import { validarCompatibilidad } from "./rules";

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

  it("advierte cuando faltan especificaciones", () => {
    const result = validarCompatibilidad({
      ...base,
      cpu: { id: "cpu", productId: 1, categoria: "cpu", nombre: "CPU", precio: 1, specs: {} },
      motherboard: { id: "board", productId: 2, categoria: "motherboard", nombre: "Board", precio: 1, specs: {} },
    });
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});
