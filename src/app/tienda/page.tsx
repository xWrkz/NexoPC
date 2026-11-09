import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, ArrowRight, PackageSearch, RefreshCw, Sparkles } from "lucide-react";
import { getCatalog, usageProfiles } from "@/lib/catalog/products";
import ProductCard from "@/components/ProductCard";
import CatalogFilters from "@/components/CatalogFilters";
import { isHiddenCatalogTaxonomy, prepareTaxonomies } from "@/lib/catalog/taxonomies";
import { hasValidPrice } from "@/lib/utils/price";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Componentes", description: "Compara procesadores, placas, memorias, tarjetas gráficas y más con fichas claras." };

type SearchParams = Record<string, string | string[] | undefined>;

function values(params: SearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value : value ? [value] : [];
}

function one(params: SearchParams, key: string) {
  return values(params, key)[0];
}

function numberParam(params: SearchParams, key: string) {
  const value = Number(one(params, key));
  return Number.isFinite(value) && value >= 0 ? value : undefined;
}

function paramsToUrl(params: SearchParams, after?: string) {
  const next = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (key === "after" || value === undefined) return;
    (Array.isArray(value) ? value : [value]).forEach((entry) => next.append(key, entry));
  });
  if (after) next.set("after", after);
  return next.size ? `/tienda?${next.toString()}` : "/tienda";
}

export default async function Tienda({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const catalog = await getCatalog({
    query: one(params, "q"),
    categories: values(params, "categoria"),
    tags: values(params, "etiqueta"),
    usages: values(params, "uso"),
    availability: one(params, "stock") === "in-stock" ? "in-stock" : one(params, "stock") === "out-of-stock" ? "out-of-stock" : "all",
    onSale: one(params, "oferta") === "1",
    sort: (one(params, "orden") as "featured" | "price-asc" | "price-desc" | "name" | "newest") ?? "featured",
    minPrice: numberParam(params, "precioMin"),
    maxPrice: numberParam(params, "precioMax"),
  }, one(params, "after"));

  const visibleCategories = prepareTaxonomies(
    catalog.categories.filter((category) => !isHiddenCatalogTaxonomy(category)),
    values(params, "categoria"),
  );
  const visibleTags = prepareTaxonomies(catalog.tags, values(params, "etiqueta"));
  const availableTagSlugs = new Set(visibleTags.map((tag) => tag.slug));
  const availableUsages = usageProfiles.filter((profile) => profile.tagSlugs.some((slug) => availableTagSlugs.has(slug)));
  const selectedCategories = values(params, "categoria");
  const activeCategory = selectedCategories.length === 1 ? visibleCategories.find((category) => category.slug === selectedCategories[0]) : undefined;
  const page = one(params, "after");
  // Filtrar u ordenar por precio no sirve si el catálogo visible todavía no tiene precios.
  const hasPrices = catalog.status !== "success" || catalog.products.some((product) => hasValidPrice(product.price)) || ["precioMin", "precioMax", "oferta"].some((key) => one(params, key));
  const onlyCategoryFilter = Object.keys(params).every((key) => ["categoria", "orden", "after"].includes(key));
  const total = activeCategory && onlyCategoryFilter ? activeCategory.count ?? undefined : undefined;
  const count = catalog.products.length;
  const resultsLabel = total !== undefined ? `${total} ${total === 1 ? "componente encontrado" : "componentes encontrados"}`
    : page ? `${count} ${count === 1 ? "componente más" : "componentes más"}`
      : catalog.pageInfo.hasNextPage ? `Más de ${count} componentes encontrados`
        : `${count} ${count === 1 ? "componente encontrado" : "componentes encontrados"}`;

  return <div className="catalog-page mx-auto max-w-[90rem] px-4 py-10 sm:px-6 sm:py-14">
    <div className="catalog-intro">
      <div><p className="eyebrow">Catálogo NexoPC</p><h1 className="font-display mt-3 max-w-4xl text-4xl uppercase leading-[.95] sm:text-5xl">{activeCategory?.name ?? "La pieza correcta, sin perderte entre especificaciones."}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Compara componentes reales con fichas claras y compatibilidad revisada.</p></div>
      <Link className="catalog-builder-cta focus-ring" href="/arma-tu-pc"><Sparkles size={19}/><span><strong>¿Es tu primera PC?</strong><small>Te guiamos pieza por pieza</small></span><ArrowRight size={18}/></Link>
    </div>

    {visibleCategories.length ? <nav className="catalog-quick-categories" aria-label="Categorías"><Link className={`catalog-quick-category focus-ring ${selectedCategories.length ? "" : "catalog-quick-category-active"}`} aria-current={selectedCategories.length ? undefined : "page"} href="/tienda">Todos</Link>{visibleCategories.slice(0, 8).map((category) => <Link key={category.id} className={`catalog-quick-category focus-ring ${activeCategory?.id === category.id ? "catalog-quick-category-active" : ""}`} aria-current={activeCategory?.id === category.id ? "page" : undefined} href={`/tienda?categoria=${encodeURIComponent(category.slug)}`}>{category.name}<small>{category.count ?? 0}</small></Link>)}</nav> : null}

    <div className="mt-5"><CatalogFilters placement="toolbar" categories={visibleCategories} tags={visibleTags} usages={availableUsages} hasPrices={hasPrices}/></div>

    <div className="catalog-results-layout mt-5">
      <CatalogFilters placement="sidebar" categories={visibleCategories} tags={visibleTags} usages={availableUsages} hasPrices={hasPrices}/>
      <section aria-label="Resultados">
        <div className="catalog-results-head"><p className="text-sm font-semibold text-slate-300" role="status">{resultsLabel}</p>{catalog.source === "demo" ? <span className="catalog-demo-badge">Datos de demostración</span> : null}</div>

        {catalog.status === "error" ? <div className="catalog-state border-rose-400/20"><AlertTriangle className="text-rose-300" size={34}/><h2>No pudimos cargar los componentes</h2><p>{catalog.error}</p><Link className="btn-secondary focus-ring" href="/tienda"><RefreshCw size={16}/>Intentar de nuevo</Link></div> : catalog.products.length ? <div className="parts-grid grid-cols-2 xl:grid-cols-3 min-[85rem]:grid-cols-4">{catalog.products.map((product, index) => <ProductCard key={product.id} product={product} priority={index < 2}/>)}</div> : <div className="catalog-state"><PackageSearch className="text-orange-300" size={36}/><h2>No hay resultados para estos filtros</h2><p>Quita algún filtro, amplía el rango de precio o prueba otra búsqueda.</p><Link className="btn-secondary focus-ring" href="/tienda">Limpiar filtros</Link></div>}

        {page || (catalog.pageInfo.hasNextPage && catalog.pageInfo.endCursor) ? <div className="mt-10 flex flex-wrap justify-center gap-3">{page ? <Link className="btn-secondary focus-ring" href={paramsToUrl(params)}><ArrowLeft size={16}/>Primera página</Link> : null}{catalog.pageInfo.hasNextPage && catalog.pageInfo.endCursor ? <Link className="btn-secondary focus-ring" href={paramsToUrl(params, catalog.pageInfo.endCursor)}>Siguiente página <ArrowRight size={16}/></Link> : null}</div> : null}
      </section>
    </div>
  </div>;
}
