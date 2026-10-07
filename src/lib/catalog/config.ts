import { CatalogFilters, UsageProfile } from "@/types/product";

export const usageProfiles: UsageProfile[] = [
  { id: "first-pc", label: "Mi primera PC", description: "Una selección clara y equilibrada para empezar sin complicaciones.", tagSlugs: ["primera-pc", "principiantes"] },
  { id: "study", label: "Estudio", description: "Equipos ágiles para clases, investigación y herramientas académicas.", tagSlugs: ["estudio", "estudiantes"] },
  { id: "work", label: "Trabajo", description: "Rendimiento estable para oficina, multitarea y trabajo remoto.", tagSlugs: ["trabajo", "productividad", "oficina"] },
  { id: "programming", label: "Programación", description: "Memoria y procesamiento para desarrollar, compilar y virtualizar.", tagSlugs: ["programacion", "desarrollo"] },
  { id: "creation", label: "Diseño y creación", description: "Potencia para edición, modelado, render y contenido digital.", tagSlugs: ["diseno", "creacion", "edicion"] },
  { id: "gaming", label: "Gaming", description: "Componentes orientados a fluidez, gráficos y futuras mejoras.", tagSlugs: ["gaming", "juegos"] },
  { id: "upgrade", label: "Mejorar mi PC", description: "Encuentra una pieza concreta para actualizar tu equipo actual.", tagSlugs: ["upgrade", "actualizacion"] },
];

export function isDemoMode() {
  return process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}

export function activeUsageTags(filters: CatalogFilters) {
  const selected = new Set(filters.usages ?? []);
  return usageProfiles.filter((profile) => selected.has(profile.id)).flatMap((profile) => profile.tagSlugs);
}

export function buildCatalogWhere(filters: CatalogFilters) {
  const tags = [...new Set([...(filters.tags ?? []), ...activeUsageTags(filters)])];
  const orderby = filters.sort === "price-asc" ? [{ field: "PRICE", order: "ASC" }]
    : filters.sort === "price-desc" ? [{ field: "PRICE", order: "DESC" }]
      : filters.sort === "name" ? [{ field: "NAME", order: "ASC" }]
        : filters.sort === "newest" ? [{ field: "DATE", order: "DESC" }]
          : [{ field: "MENU_ORDER", order: "ASC" }];

  return {
    ...(filters.query?.trim() ? { search: filters.query.trim() } : {}),
    ...(filters.categories?.length ? { categoryIn: filters.categories } : {}),
    ...(tags.length ? { tagIn: tags } : {}),
    ...(filters.availability === "in-stock" ? { stockStatus: "IN_STOCK" } : {}),
    ...(filters.availability === "out-of-stock" ? { stockStatus: "OUT_OF_STOCK" } : {}),
    ...(filters.onSale ? { onSale: true } : {}),
    ...(filters.minPrice !== undefined ? { minPrice: filters.minPrice } : {}),
    ...(filters.maxPrice !== undefined ? { maxPrice: filters.maxPrice } : {}),
    orderby,
  };
}
