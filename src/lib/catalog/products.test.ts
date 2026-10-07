import { afterEach, describe, expect, it, vi } from "vitest";
import { buildCatalogWhere, isDemoMode } from "@/lib/catalog/config";

describe("catálogo real", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("jamás activa productos demo en producción", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true");
    expect(isDemoMode()).toBe(false);
  });

  it("solo permite demo cuando desarrollo lo solicita explícitamente", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true");
    expect(isDemoMode()).toBe(true);
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "false");
    expect(isDemoMode()).toBe(false);
  });

  it("serializa filtros combinados para el servidor", () => {
    expect(buildCatalogWhere({
      query: "  test  ",
      categories: ["procesadores", "memoria-ram"],
      tags: ["oferta-especial"],
      usages: ["study"],
      availability: "in-stock",
      onSale: true,
      minPrice: 50,
      maxPrice: 2000,
      sort: "price-asc",
    })).toEqual({
      search: "test",
      categoryIn: ["procesadores", "memoria-ram"],
      tagIn: ["oferta-especial", "estudio", "estudiantes"],
      stockStatus: "IN_STOCK",
      onSale: true,
      minPrice: 50,
      maxPrice: 2000,
      orderby: [{ field: "PRICE", order: "ASC" }],
    });
  });
});
