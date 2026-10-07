import Link from "next/link";
import { AlertTriangle, ArrowRight, Layers3, PackageSearch, RefreshCw, Sparkles } from "lucide-react";
import { getCatalog, usageProfiles } from "@/lib/catalog/products";
import ProductCard from "@/components/ProductCard";
import CatalogFilters from "@/components/CatalogFilters";

export const dynamic = "force-dynamic";

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

function paramsToUrl(params: SearchParams, after: string) {
  const next = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (key === "after" || value === undefined) return;
    (Array.isArray(value) ? value : [value]).forEach((entry) => next.append(key, entry));
  });
  next.set("after", after);
  return `/tienda?${next.toString()}`;
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

  const visibleCategories = catalog.categories.filter((category) => category.slug !== "uncategorized" && category.name.toLowerCase() !== "uncategorized");
  const availableTagSlugs = new Set(catalog.tags.map((tag) => tag.slug));
  const availableUsages = usageProfiles.filter((profile) => profile.tagSlugs.some((slug) => availableTagSlugs.has(slug)));

  return <div className="catalog-page mx-auto max-w-[90rem] px-4 py-10 sm:px-6 sm:py-14">
    <div className="catalog-intro">
      <div><p className="eyebrow">Catálogo NexoPC</p><h1 className="font-display mt-3 max-w-4xl text-4xl font-bold sm:text-5xl">La pieza correcta,<br className="hidden sm:block"/> sin perderte entre especificaciones.</h1><p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">Compara componentes reales con una guía clara de compatibilidad, precio y disponibilidad.</p></div>
      <Link className="catalog-builder-cta focus-ring" href="/arma-tu-pc"><Sparkles size={19}/><span><strong>¿Es tu primera PC?</strong><small>Te guiamos pieza por pieza</small></span><ArrowRight size={18}/></Link>
    </div>

    {visibleCategories.length ? <div className="catalog-quick-categories" aria-label="Categorías rápidas"><span className="catalog-quick-label"><Layers3 size={15}/>Explorar</span>{visibleCategories.slice(0, 7).map((category) => <Link key={category.id} className="catalog-quick-category focus-ring" href={`/tienda?categoria=${encodeURIComponent(category.slug)}`}>{category.name}<small>{category.count ?? 0}</small></Link>)}</div> : null}

    <div className="mt-8"><CatalogFilters placement="toolbar" categories={visibleCategories} tags={catalog.tags} usages={availableUsages}/></div>

    <div className="catalog-results-layout mt-7">
      <CatalogFilters placement="sidebar" categories={visibleCategories} tags={catalog.tags} usages={availableUsages}/>
      <section aria-live="polite">
        <div className="catalog-results-head"><div><p className="eyebrow">Selección disponible</p><p className="mt-1 text-sm text-slate-400"><strong className="text-white">{catalog.products.length}</strong> {catalog.products.length === 1 ? "resultado encontrado" : "resultados encontrados"}</p></div>{catalog.source === "demo" ? <span className="catalog-demo-badge">Entorno de demostración local</span> : null}</div>

        {catalog.status === "error" ? <div className="catalog-state border-rose-400/20"><AlertTriangle className="text-rose-300" size={34}/><h2>No pudimos abrir el catálogo</h2><p>{catalog.error}</p><Link className="btn-secondary focus-ring" href="/tienda"><RefreshCw size={16}/>Volver a intentar</Link></div> : catalog.products.length ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{catalog.products.map((product, index) => <ProductCard key={product.id} product={product} priority={index < 2}/>)}</div> : <div className="catalog-state"><PackageSearch className="text-orange-300" size={36}/><h2>No encontramos componentes con esa combinación</h2><p>Prueba quitar un filtro, ampliar el precio o buscar con menos palabras.</p><Link className="btn-secondary focus-ring" href="/tienda">Restablecer catálogo</Link></div>}

        {catalog.pageInfo.hasNextPage && catalog.pageInfo.endCursor ? <div className="mt-10 text-center"><Link className="btn-secondary focus-ring" href={paramsToUrl(params, catalog.pageInfo.endCursor)}>Siguiente página <ArrowRight size={16}/></Link></div> : null}
      </section>
    </div>
  </div>;
}
