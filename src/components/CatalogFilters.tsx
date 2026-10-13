"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, m } from "motion/react";
import { Check, ChevronDown, Filter, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { ProductCategory, ProductTag, UsageProfile } from "@/types/product";
import { DEFAULT_VISIBLE_TAGS, filterTaxonomies } from "@/lib/catalog/taxonomies";

interface CatalogFiltersProps {
  categories: ProductCategory[];
  tags: ProductTag[];
  usages: UsageProfile[];
  placement?: "toolbar" | "sidebar";
}

export default function CatalogFilters({ categories, tags, usages, placement = "toolbar" }: CatalogFiltersProps) {
  const router = useRouter();
  const current = useSearchParams();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(current.get("q") ?? "");
  const [filterQuery, setFilterQuery] = useState("");
  const [showAllTags, setShowAllTags] = useState(false);
  const firstSearchRender = useRef(true);

  const navigate = (update: (params: URLSearchParams) => void, replace = false) => {
    const params = new URLSearchParams(current.toString());
    params.delete("after");
    update(params);
    const href = params.size ? `/tienda?${params.toString()}` : "/tienda";
    if (replace) router.replace(href, { scroll: false }); else router.push(href, { scroll: false });
  };

  const setSingle = (key: string, value: string) => navigate((params) => {
    if (value) params.set(key, value); else params.delete(key);
  });

  const toggle = (key: string, value: string) => navigate((params) => {
    const selected = new Set(params.getAll(key));
    if (selected.has(value)) selected.delete(value); else selected.add(value);
    params.delete(key);
    selected.forEach((entry) => params.append(key, entry));
  });

  useEffect(() => {
    if (firstSearchRender.current) {
      firstSearchRender.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      const normalized = query.trim();
      if (normalized === (current.get("q") ?? "")) return;
      navigate((params) => {
        if (normalized) params.set("q", normalized); else params.delete("q");
      }, true);
    }, 300);
    return () => window.clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const normalized = query.trim();
    navigate((params) => {
      if (normalized) params.set("q", normalized); else params.delete("q");
    });
  };

  const selectedCategories = current.getAll("categoria");
  const selectedTags = current.getAll("etiqueta");
  const selectedUsages = current.getAll("uso");
  const activeCount = selectedCategories.length + selectedTags.length + selectedUsages.length
    + ["q", "precioMin", "precioMax", "stock", "oferta"].filter((key) => current.has(key)).length;

  const categoryRows = useMemo(() => filterTaxonomies(categories, filterQuery, selectedCategories).map((category) => ({
    category,
    depth: category.parent?.node ? 1 : 0,
  })), [categories, filterQuery, selectedCategories]);

  const matchingTags = useMemo(() => filterTaxonomies(tags, filterQuery, selectedTags), [tags, filterQuery, selectedTags]);
  const visibleTagLimit = Math.max(DEFAULT_VISIBLE_TAGS, selectedTags.length);
  const visibleTags = filterQuery || showAllTags ? matchingTags : matchingTags.slice(0, visibleTagLimit);
  const hiddenTagCount = Math.max(0, matchingTags.length - visibleTagLimit);
  const hasTaxonomyMatches = categoryRows.length > 0 || matchingTags.length > 0;

  const clearAll = () => {
    setQuery("");
    setFilterQuery("");
    setShowAllTags(false);
    router.push("/tienda", { scroll: false });
  };

  const taxonomySearch = <div className="filter-search-wrap">
    <Search size={15}/>
    <input value={filterQuery} onChange={(event) => { setFilterQuery(event.target.value); setShowAllTags(false); }} placeholder="Buscar categoría o etiqueta" aria-label="Buscar categoría o etiqueta"/>
    {filterQuery ? <button type="button" onClick={() => setFilterQuery("")} className="focus-ring" aria-label="Limpiar búsqueda de filtros"><X size={14}/></button> : null}
  </div>;

  const controls = <div className="filter-controls">
    {taxonomySearch}
    {filterQuery && !hasTaxonomyMatches ? <div className="filter-no-results"><Search size={17}/><p><strong>Sin coincidencias</strong><span>Prueba con otra categoría o etiqueta.</span></p></div> : null}

    {categoryRows.length ? <fieldset><legend className="filter-title">Categorías <span>{categoryRows.length}</span></legend><div className="mt-3 space-y-1.5">{categoryRows.map(({ category, depth }) => {
      const checked = selectedCategories.includes(category.slug);
      return <button key={category.id} type="button" onClick={() => toggle("categoria", category.slug)} aria-pressed={checked} className={`filter-option ${checked ? "filter-option-active" : ""}`} style={{ paddingLeft: `${.7 + depth * 1.05}rem` }}><span className="filter-check">{checked ? <Check size={12}/> : null}</span><span className="min-w-0 flex-1 truncate text-left">{category.name}</span><span className="filter-count">{category.count ?? 0}</span></button>;
    })}</div></fieldset> : null}

    {usages.length ? <fieldset><legend className="filter-title">¿Para qué la necesitas?</legend><div className="mt-3 flex flex-wrap gap-2">{usages.map((usage) => {
      const checked = selectedUsages.includes(usage.id);
      return <button type="button" key={usage.id} onClick={() => toggle("uso", usage.id)} aria-pressed={checked} title={usage.description} className={`filter-chip ${checked ? "filter-chip-active" : ""}`}>{usage.label}</button>;
    })}</div></fieldset> : null}

    {visibleTags.length ? <fieldset><legend className="filter-title">Etiquetas <span>{matchingTags.length}</span></legend><div className="mt-3 flex flex-wrap gap-2">{visibleTags.map((tag) => {
      const checked = selectedTags.includes(tag.slug);
      return <button type="button" key={tag.id} onClick={() => toggle("etiqueta", tag.slug)} aria-pressed={checked} className={`filter-chip ${checked ? "filter-chip-active" : ""}`}>{tag.name}<span className="opacity-55">{tag.count ?? 0}</span></button>;
    })}</div>{!filterQuery && (hiddenTagCount > 0 || showAllTags) ? <button type="button" className="filter-expand focus-ring" onClick={() => setShowAllTags((value) => !value)}>{showAllTags ? "Ver menos" : `Ver ${hiddenTagCount} más`}<ChevronDown size={14} className={showAllTags ? "rotate-180" : ""}/></button> : null}</fieldset> : null}

    <fieldset><legend className="filter-title">Rango de precio</legend><div className="mt-3 grid grid-cols-2 gap-2"><label className="price-field"><span>Desde</span><input type="number" min="0" defaultValue={current.get("precioMin") ?? ""} onBlur={(event) => setSingle("precioMin", event.target.value)} placeholder="S/ 0"/></label><label className="price-field"><span>Hasta</span><input type="number" min="0" defaultValue={current.get("precioMax") ?? ""} onBlur={(event) => setSingle("precioMax", event.target.value)} placeholder="S/ 9999"/></label></div></fieldset>

    <fieldset><legend className="filter-title">Disponibilidad</legend><div className="mt-3 grid gap-2"><label className="select-shell"><select value={current.get("stock") ?? ""} onChange={(event) => setSingle("stock", event.target.value)}><option value="">Todo el catálogo</option><option value="in-stock">Disponible</option><option value="out-of-stock">Agotado</option></select><ChevronDown size={15}/></label><button type="button" onClick={() => setSingle("oferta", current.get("oferta") === "1" ? "" : "1")} aria-pressed={current.get("oferta") === "1"} className={`filter-option ${current.get("oferta") === "1" ? "filter-option-active" : ""}`}><span className="filter-check">{current.get("oferta") === "1" ? <Check size={12}/> : null}</span>Solo ofertas</button></div></fieldset>
  </div>;

  if (placement === "sidebar") return <aside className="catalog-sidebar" aria-label="Filtros del catálogo"><div className="catalog-sidebar-head"><div className="flex items-center justify-between"><div><p className="eyebrow">Encuentra tu componente</p><h2 className="mt-1 text-lg font-bold">Filtros</h2></div>{activeCount ? <span className="filter-badge">{activeCount}</span> : null}</div></div><div className="catalog-sidebar-scroll">{controls}{activeCount ? <button type="button" onClick={clearAll} className="btn-secondary focus-ring mt-7 w-full"><X size={15}/>Limpiar filtros</button> : null}</div></aside>;

  return <>
    <div className="catalog-toolbar">
      <form onSubmit={submit} className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cyan-300/70" size={18}/><input name="q" className="field h-12 pl-11" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busca por nombre, marca o SKU…" aria-label="Buscar en catálogo"/>{query ? <button type="button" onClick={() => setQuery("")} className="focus-ring absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 hover:text-white" aria-label="Borrar búsqueda"><X size={16}/></button> : null}</form>
      <label className="select-shell min-w-48"><select value={current.get("orden") ?? "featured"} onChange={(event) => setSingle("orden", event.target.value)} aria-label="Ordenar productos"><option value="featured">Recomendados</option><option value="newest">Más recientes</option><option value="price-asc">Menor precio</option><option value="price-desc">Mayor precio</option><option value="name">Nombre A–Z</option></select><ChevronDown size={15}/></label>
      <button type="button" onClick={() => setOpen(true)} className="catalog-mobile-filter focus-ring"><SlidersHorizontal size={18}/>Filtros{activeCount ? <span className="filter-badge">{activeCount}</span> : null}</button>
    </div>

    {activeCount ? <div className="active-filters"><span className="active-filters-label"><Filter size={13}/>Filtros activos</span>{[...selectedCategories.map((value) => ({ key: "categoria", value, label: categories.find((item) => item.slug === value)?.name ?? value })), ...selectedTags.map((value) => ({ key: "etiqueta", value, label: tags.find((item) => item.slug === value)?.name ?? value })), ...selectedUsages.map((value) => ({ key: "uso", value, label: usages.find((item) => item.id === value)?.label ?? value }))].map((chip) => <button type="button" key={`${chip.key}-${chip.value}`} onClick={() => toggle(chip.key, chip.value)} className="active-filter">{chip.label}<X size={13}/></button>)}{current.get("q") ? <button type="button" onClick={() => setQuery("")} className="active-filter">“{current.get("q")}”<X size={13}/></button> : null}<button type="button" onClick={clearAll} className="active-filters-clear">Limpiar todo</button></div> : null}

    <AnimatePresence>{open ? <m.div className="fixed inset-0 z-[80] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><button className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} aria-label="Cerrar filtros"/><m.aside initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 260 }} className="catalog-filter-sheet"><div className="catalog-filter-sheet-head"><div><p className="eyebrow">Afina tu búsqueda</p><h2 className="mt-1 text-xl font-bold">Filtros del catálogo</h2></div><button type="button" onClick={() => setOpen(false)} className="focus-ring rounded-xl border border-white/10 p-2" aria-label="Cerrar filtros"><X/></button></div><div className="catalog-filter-sheet-scroll">{controls}{activeCount ? <button type="button" onClick={clearAll} className="btn-secondary focus-ring mt-7 w-full"><X size={15}/>Limpiar filtros</button> : null}</div><div className="catalog-filter-sheet-footer"><button type="button" onClick={() => setOpen(false)} className="btn-primary focus-ring w-full"><Sparkles size={17}/>Ver resultados</button></div></m.aside></m.div> : null}</AnimatePresence>
  </>;
}
