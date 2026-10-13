export const DEFAULT_VISIBLE_TAGS = 8;

type TaxonomyItem = {
  name: string;
  slug: string;
  count?: number | null;
};

export function normalizeFilterText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .trim();
}

export function prepareTaxonomies<T extends TaxonomyItem>(items: T[], selectedSlugs: string[] = []) {
  const selected = new Set(selectedSlugs);
  return items
    .filter((item) => (item.count ?? 0) > 0 || selected.has(item.slug))
    .sort((a, b) => {
      const selectionOrder = Number(selected.has(b.slug)) - Number(selected.has(a.slug));
      if (selectionOrder) return selectionOrder;
      const countOrder = (b.count ?? 0) - (a.count ?? 0);
      return countOrder || a.name.localeCompare(b.name, "es", { sensitivity: "base" });
    });
}

export function filterTaxonomies<T extends TaxonomyItem>(items: T[], query: string, selectedSlugs: string[] = []) {
  const prepared = prepareTaxonomies(items, selectedSlugs);
  const normalized = normalizeFilterText(query);
  if (!normalized) return prepared;
  const selected = new Set(selectedSlugs);
  return prepared.filter((item) => selected.has(item.slug)
    || normalizeFilterText(`${item.name} ${item.slug}`).includes(normalized));
}

export function isHiddenCatalogTaxonomy(item: TaxonomyItem) {
  const value = normalizeFilterText(`${item.name} ${item.slug}`);
  return value.includes("uncategorized") || value.includes("sin categoria");
}
