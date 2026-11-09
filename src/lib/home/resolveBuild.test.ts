import { describe, expect, it } from "vitest";
import { resolveBuild } from "./resolveBuild";
import { exampleBuilds } from "./exampleBuilds";
import { Product } from "@/types/product";

const categoryOf: Record<string, string> = { cpu: "procesadores", motherboard: "placas-madre", ram: "memoria-ram", gpu: "tarjetas-graficas", storage: "almacenamiento", psu: "fuentes-de-poder", case: "gabinetes", cooler: "refrigeracion" };

function product(slug: string, category: string, price: string | undefined): Product {
  return { id: slug, databaseId: 1, name: slug, slug, price, productCategories: { nodes: [{ id: category, name: category, slug: category }] } } as unknown as Product;
}

const gaming = exampleBuilds.find((build) => build.id === "gaming")!;
const all = Object.entries(gaming.slugs).flatMap(([category, slug]) => (slug ? [product(slug, categoryOf[category], "S/&nbsp;1,000.00")] : []));

describe("resolveBuild", () => {
  it("suma los precios de las piezas y arma el enlace al armador", () => {
    const build = resolveBuild(gaming, all);
    expect(build.total).toBe(8000);
    expect(build.pending).toBe(0);
    expect(build.missing).toEqual([]);
    expect(build.href).toBe(`/arma-tu-pc?armado=${Object.values(gaming.slugs).join(",")}`);
  });

  it("cuenta las piezas sin precio sin sumarlas", () => {
    const products = all.map((item, index) => (index === 0 ? { ...item, price: undefined } : item));
    const build = resolveBuild(gaming, products);
    expect(build.total).toBe(7000);
    expect(build.pending).toBe(1);
  });

  it("marca las piezas que no llegaron del catálogo", () => {
    const build = resolveBuild(gaming, all.filter((item) => item.slug !== gaming.slugs.gpu));
    expect(build.missing).toEqual(["gpu"]);
    expect(build.parts.gpu?.precio).toBe(0);
  });
});
