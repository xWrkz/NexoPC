import { BuilderCategory, CompatibilityResult, ComponentePC, validarCompatibilidad } from "@/lib/compatibility/rules";
import { toComponent } from "@/lib/builder/component";
import { BuildParts, ExampleBuild } from "@/lib/home/exampleBuilds";
import { Product } from "@/types/product";

export type ResolvedBuild = ExampleBuild & {
  parts: BuildParts;
  /** Suma de las piezas con precio. */
  total: number;
  /** Piezas sin precio publicado. */
  pending: number;
  /** Categorías cuyo producto no llegó del catálogo: sin ellas la compatibilidad no se puede afirmar. */
  missing: BuilderCategory[];
  compatibility: CompatibilityResult;
  /** Abre el armador con estas piezas ya cargadas. */
  href: string;
};

const categories: BuilderCategory[] = ["cpu", "motherboard", "ram", "gpu", "storage", "psu", "case", "cooler"];

function placeholder(category: BuilderCategory, slug: string): ComponentePC {
  return { id: `pending-${slug}`, productId: 0, categoria: category, nombre: slug.replace(/-/g, " "), precio: 0, specs: {} };
}

/** Arma la configuración con las fichas reales. Es pura para poder probarla sin backend. */
export function resolveBuild(build: ExampleBuild, products: Product[]): ResolvedBuild {
  const parts = {} as BuildParts;
  const missing: BuilderCategory[] = [];
  for (const category of categories) {
    const slug = build.slugs[category];
    if (!slug) { parts[category] = null; continue; }
    const product = products.find((item) => item.slug === slug);
    if (!product) missing.push(category);
    parts[category] = product ? toComponent(product, category) : placeholder(category, slug);
  }
  const selected = Object.values(parts).filter((part): part is ComponentePC => Boolean(part));
  const slugs = categories.map((category) => build.slugs[category]).filter(Boolean);
  return {
    ...build,
    parts,
    total: selected.reduce((sum, part) => sum + part.precio, 0),
    pending: selected.filter((part) => part.precio <= 0).length,
    missing,
    compatibility: validarCompatibilidad(parts),
    href: `/arma-tu-pc?armado=${slugs.join(",")}`,
  };
}
