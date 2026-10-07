"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, m } from "motion/react";
import { Check, ChevronDown, Filter, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { ProductCategory, ProductTag, UsageProfile } from "@/types/product";

interface CatalogFiltersProps {
  categories: ProductCategory[];
  tags: ProductTag[];
  usages: UsageProfile[];
}

export default function CatalogFilters({ categories, tags, usages }: CatalogFiltersProps) {
  const router = useRouter();
  const current = useSearchParams();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(current.get("q") ?? "");
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

  const categoryRows = useMemo(() => {
    const roots = categories.filter((category) => !category.parent?.node);
    const seen = new Set<string>();
    const rows: Array<{ category: ProductCategory; depth: number }> = [];
    roots.forEach((root) => {
      if (!seen.has(root.id)) rows.push({ category: root, depth: 0 });
      seen.add(root.id);
      (root.children?.nodes ?? categories.filter((category) => category.parent?.node.slug === root.slug)).forEach((child) => {
        if (!seen.has(child.id)) rows.push({ category: child, depth: 1 });
        seen.add(child.id);
      });
    });
    categories.filter((category) => !seen.has(category.id)).forEach((category) => rows.push({ category, depth: category.parent ? 1 : 0 }));
    return rows;
  }, [categories]);

  const selectedCategories = current.getAll("categoria");
  const selectedTags = current.getAll("etiqueta");
  const selectedUsages = current.getAll("uso");
  const activeCount = selectedCategories.length + selectedTags.length + selectedUsages.length
    + ["q", "precioMin", "precioMax", "stock", "oferta"].filter((key) => current.has(key)).length;

  const controls = <div className="space-y-7">
    {categoryRows.length ? <fieldset><legend className="filter-title">Categorías</legend><div className="mt-3 space-y-1.5">{categoryRows.map(({ category, depth }) => {
      const checked = selectedCategories.includes(category.slug);
      return <button key={category.id} type="button" onClick={() => toggle("categoria", category.slug)} aria-pressed={checked} className={`filter-option ${checked ? "filter-option-active" : ""}`} style={{ paddingLeft: `${.7 + depth * 1.05}rem` }}><span className="filter-check">{checked ? <Check size={12}/> : null}</span><span className="min-w-0 flex-1 truncate text-left">{category.name}</span><span className="filter-count">{category.count ?? 0}</span></button>;
    })}</div></fieldset> : null}

    {usages.length ? <fieldset><legend className="filter-title">¿Para qué la necesitas?</legend><div className="mt-3 flex flex-wrap gap-2">{usages.map((usage) => {
      const checked = selectedUsages.includes(usage.id);
      return <button type="button" key={usage.id} onClick={() => toggle("uso", usage.id)} aria-pressed={checked} title={usage.description} className={`filter-chip ${checked ? "filter-chip-active" : ""}`}>{usage.label}</button>;
    })}</div></fieldset> : null}

    {tags.length ? <fieldset><legend className="filter-title">Etiquetas</legend><div className="mt-3 flex flex-wrap gap-2">{tags.map((tag) => {
      const checked = selectedTags.includes(tag.slug);
      return <button type="button" key={tag.id} onClick={() => toggle("etiqueta", tag.slug)} aria-pressed={checked} className={`filter-chip ${checked ? "filter-chip-active" : ""}`}>{tag.name}<span className="opacity-55">{tag.count ?? 0}</span></button>;
    })}</div></fieldset> : null}

    <fieldset><legend className="filter-title">Rango de precio</legend><div className="mt-3 grid grid-cols-2 gap-2"><label className="price-field"><span>Desde</span><input type="number" min="0" defaultValue={current.get("precioMin") ?? ""} onBlur={(event) => setSingle("precioMin", event.target.value)} placeholder="S/ 0"/></label><label className="price-field"><span>Hasta</span><input type="number" min="0" defaultValue={current.get("precioMax") ?? ""} onBlur={(event) => setSingle("precioMax", event.target.value)} placeholder="S/ 9999"/></label></div></fieldset>

    <fieldset><legend className="filter-title">Disponibilidad</legend><div className="mt-3 grid gap-2"><label className="select-shell"><select value={current.get("stock") ?? ""} onChange={(event) => setSingle("stock", event.target.value)}><option value="">Todo el catálogo</option><option value="in-stock">Disponible</option><option value="out-of-stock">Agotado</option></select><ChevronDown size={15}/></label><button type="button" onClick={() => setSingle("oferta", current.get("oferta") === "1" ? "" : "1")} aria-pressed={current.get("oferta") === "1"} className={`filter-option ${current.get("oferta") === "1" ? "filter-option-active" : ""}`}><span className="filter-check">{current.get("oferta") === "1" ? <Check size={12}/> : null}</span>Solo ofertas</button></div></fieldset>
  </div>;

  return <>
    <div className="catalog-toolbar">
      <form onSubmit={submit} className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cyan-300/70" size={18}/><input name="q" className="field h-12 pl-11" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busca por parte del nombre o SKU…" aria-label="Buscar en catálogo"/>{query ? <button type="button" onClick={() => setQuery("")} className="focus-ring absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 hover:text-white" aria-label="Borrar búsqueda"><X size={16}/></button> : null}</form>
      <label className="select-shell min-w-48"><select value={current.get("orden") ?? "featured"} onChange={(event) => setSingle("orden", event.target.value)} aria-label="Ordenar productos"><option value="featured">Recomendados</option><option value="newest">Más recientes</option><option value="price-asc">Menor precio</option><option value="price-desc">Mayor precio</option><option value="name">Nombre A–Z</option></select><ChevronDown size={15}/></label>
      <button type="button" onClick={() => setOpen(true)} className="btn-secondary focus-ring lg:hidden"><SlidersHorizontal size={18}/>Filtros{activeCount ? <span className="filter-badge">{activeCount}</span> : null}</button>
    </div>

    {activeCount ? <div className="mt-4 flex flex-wrap items-center gap-2"><span className="mr-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500"><Filter size={13}/>Activos</span>{[...selectedCategories.map((value) => ({ key: "categoria", value, label: categories.find((item) => item.slug === value)?.name ?? value })), ...selectedTags.map((value) => ({ key: "etiqueta", value, label: tags.find((item) => item.slug === value)?.name ?? value })), ...selectedUsages.map((value) => ({ key: "uso", value, label: usages.find((item) => item.id === value)?.label ?? value }))].map((chip) => <button type="button" key={`${chip.key}-${chip.value}`} onClick={() => toggle(chip.key, chip.value)} className="active-filter">{chip.label}<X size={13}/></button>)}{current.get("q") ? <button type="button" onClick={() => setQuery("")} className="active-filter">“{current.get("q")}”<X size={13}/></button> : null}<button type="button" onClick={() => { setQuery(""); router.push("/tienda", { scroll: false }); }} className="ml-1 text-xs font-bold text-orange-300 hover:text-orange-200">Limpiar todo</button></div> : null}

    <AnimatePresence>{open ? <m.div className="fixed inset-0 z-[80] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><button className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} aria-label="Cerrar filtros"/><m.aside initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 260 }} className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-auto rounded-t-3xl border-t border-cyan-300/20 bg-[#090d16] p-5"><div className="mb-6 flex items-center justify-between"><div><p className="eyebrow">Afina tu búsqueda</p><h2 className="mt-1 text-xl font-bold">Filtros del catálogo</h2></div><button type="button" onClick={() => setOpen(false)} className="focus-ring rounded-xl border border-white/10 p-2"><X/></button></div>{controls}<button type="button" onClick={() => setOpen(false)} className="btn-primary focus-ring sticky bottom-2 mt-7 w-full"><Sparkles size={17}/>Ver resultados</button></m.aside></m.div> : null}</AnimatePresence>

    <aside className="catalog-sidebar hidden lg:block"><div className="mb-6 flex items-center justify-between"><div><p className="eyebrow">Explora mejor</p><h2 className="mt-1 text-lg font-bold">Filtrar componentes</h2></div>{activeCount ? <span className="filter-badge">{activeCount}</span> : null}</div>{controls}{activeCount ? <button type="button" onClick={() => { setQuery(""); router.push("/tienda", { scroll: false }); }} className="btn-secondary focus-ring mt-7 w-full"><X size={15}/>Limpiar filtros</button> : null}</aside>
  </>;
}
