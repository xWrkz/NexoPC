import { describe, expect, it } from "vitest";
import { DEFAULT_VISIBLE_TAGS, filterTaxonomies, isHiddenCatalogTaxonomy, normalizeFilterText, prepareTaxonomies } from "@/lib/catalog/taxonomies";

const values = [
  { name: "Tarjetas Gráficas", slug: "tarjetas-graficas", count: 12 },
  { name: "Procesadores", slug: "procesadores", count: 8 },
  { name: "Periféricos", slug: "perifericos", count: 0 },
  { name: "Memoria RAM", slug: "memoria-ram", count: 3 },
];

describe("taxonomías del catálogo", () => {
  it("normaliza tildes, espacios y mayúsculas", () => {
    expect(normalizeFilterText("  GRÁFICAS  ")).toBe("graficas");
  });

  it("filtra sin distinguir tildes y conserva seleccionados", () => {
    expect(filterTaxonomies(values, "graficas").map((item) => item.slug)).toEqual(["tarjetas-graficas"]);
    expect(filterTaxonomies(values, "memoria", ["procesadores"]).map((item) => item.slug)).toEqual(["procesadores", "memoria-ram"]);
  });

  it("oculta conteos en cero salvo que estén seleccionados", () => {
    expect(prepareTaxonomies(values).map((item) => item.slug)).not.toContain("perifericos");
    expect(prepareTaxonomies(values, ["perifericos"])[0].slug).toBe("perifericos");
  });

  it("define ocho etiquetas visibles y excluye categorías internas", () => {
    expect(DEFAULT_VISIBLE_TAGS).toBe(8);
    expect(isHiddenCatalogTaxonomy({ name: "Uncategorized", slug: "uncategorized" })).toBe(true);
    expect(isHiddenCatalogTaxonomy({ name: "Procesadores", slug: "procesadores" })).toBe(false);
  });
});
