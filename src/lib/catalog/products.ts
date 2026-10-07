import { getClient } from "@/lib/apollo/apollo-client";
import { GET_PRODUCT_BY_SLUG, GET_PRODUCTS } from "@/lib/graphql/queries";
import {
  CatalogFilters,
  CatalogResult,
  Product,
  ProductCategory,
  ProductTag,
} from "@/types/product";
import { getPriceValue } from "@/lib/utils/price";
import { activeUsageTags, buildCatalogWhere, isDemoMode } from "@/lib/catalog/config";

export { buildCatalogWhere, isDemoMode, usageProfiles } from "@/lib/catalog/config";

const demoCategories: ProductCategory[] = [
  { id: "cat-cpu", name: "Procesadores", slug: "procesadores", count: 1 },
  { id: "cat-ram", name: "Memoria RAM", slug: "memoria-ram", count: 1 },
];

const demoTags: ProductTag[] = [
  { id: "tag-study", name: "Estudio", slug: "estudio", count: 1 },
  { id: "tag-gaming", name: "Gaming", slug: "gaming", count: 1 },
];

const demoProducts: Product[] = [
  { id: "demo-cpu", databaseId: 1001, name: "Procesador de demostración", slug: "procesador-demo", sku: "DEMO-CPU", image: null, price: "S/ 899.00", stockStatus: "IN_STOCK", productCategories: { nodes: [demoCategories[0]] }, productTags: { nodes: [demoTags[1]] }, nexopcHardware: { componentTypeSlug: "procesador", componentTypeName: "Procesador", socketId: 2, tdpWatts: 65 } },
  { id: "demo-ram", databaseId: 1002, name: "Memoria de demostración", slug: "memoria-demo", sku: "DEMO-RAM", image: null, price: "S/ 329.00", stockStatus: "IN_STOCK", productCategories: { nodes: [demoCategories[1]] }, productTags: { nodes: [demoTags[0]] }, nexopcHardware: { componentTypeSlug: "memoria_ram", componentTypeName: "Memoria RAM", memoryTypeId: 2, capacityGb: 16 } },
];

export class CatalogSourceError extends Error {
  constructor(message = "No pudimos conectar con el catálogo en este momento.") {
    super(message);
    this.name = "CatalogSourceError";
  }
}

function filterDemoProducts(products: Product[], filters: CatalogFilters = {}) {
  const tags = new Set([...(filters.tags ?? []), ...activeUsageTags(filters)]);
  return products.filter((product) => {
    const search = filters.query?.trim().toLowerCase();
    const value = getPriceValue(product.price);
    const productCategories = product.productCategories?.nodes.map((item) => item.slug) ?? [];
    const productTags = product.productTags?.nodes.map((item) => item.slug) ?? [];
    return (!search || `${product.name} ${product.sku ?? ""}`.toLowerCase().includes(search))
      && (!(filters.categories?.length) || filters.categories.some((slug) => productCategories.includes(slug)))
      && (!tags.size || [...tags].some((slug) => productTags.includes(slug)))
      && (filters.availability !== "in-stock" || product.stockStatus === "IN_STOCK")
      && (filters.availability !== "out-of-stock" || product.stockStatus === "OUT_OF_STOCK")
      && (!filters.onSale || getPriceValue(product.regularPrice) > value)
      && (filters.minPrice === undefined || value >= filters.minPrice)
      && (filters.maxPrice === undefined || value <= filters.maxPrice);
  }).sort((a, b) => filters.sort === "price-asc"
    ? getPriceValue(a.price) - getPriceValue(b.price)
    : filters.sort === "price-desc"
      ? getPriceValue(b.price) - getPriceValue(a.price)
      : filters.sort === "name"
        ? a.name.localeCompare(b.name)
        : 0);
}

const emptyPageInfo = { hasNextPage: false, endCursor: null };

export async function getCatalog(filters: CatalogFilters = {}, after?: string | null): Promise<CatalogResult> {
  if (isDemoMode()) {
    const products = filterDemoProducts(demoProducts, filters);
    return { products, categories: demoCategories, tags: demoTags, pageInfo: emptyPageInfo, status: products.length ? "success" : "empty", source: "demo" };
  }

  if (!process.env.NEXT_PUBLIC_GRAPHQL_URL) {
    return { products: [], categories: [], tags: [], pageInfo: emptyPageInfo, status: "error", source: "catalog", error: "El catálogo no está configurado. Inténtalo nuevamente más tarde." };
  }

  try {
    const { data } = await getClient().query({
      query: GET_PRODUCTS,
      variables: { first: 24, after, where: buildCatalogWhere(filters) },
      fetchPolicy: "no-cache",
    });
    const result = data as {
      products?: { nodes?: Product[]; pageInfo?: CatalogResult["pageInfo"] };
      productCategories?: { nodes?: ProductCategory[] };
      productTags?: { nodes?: ProductTag[] };
    };
    const products = result.products?.nodes ?? [];
    return {
      products,
      categories: result.productCategories?.nodes ?? [],
      tags: result.productTags?.nodes ?? [],
      pageInfo: result.products?.pageInfo ?? emptyPageInfo,
      status: products.length ? "success" : "empty",
      source: "catalog",
    };
  } catch (error) {
    console.error("Catalog query failed", error);
    return { products: [], categories: [], tags: [], pageInfo: emptyPageInfo, status: "error", source: "catalog", error: "No pudimos cargar el catálogo. Revisa tu conexión e inténtalo otra vez." };
  }
}

export async function getProducts() {
  const result = await getCatalog();
  if (result.status === "error") throw new CatalogSourceError(result.error);
  return result.products;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (isDemoMode()) return demoProducts.find((product) => product.slug === slug) ?? null;
  if (!process.env.NEXT_PUBLIC_GRAPHQL_URL) throw new CatalogSourceError("El catálogo no está configurado.");
  try {
    const { data } = await getClient().query({ query: GET_PRODUCT_BY_SLUG, variables: { slug }, fetchPolicy: "no-cache" });
    return (data as { product?: Product }).product ?? null;
  } catch (error) {
    console.error("Product query failed", error);
    throw new CatalogSourceError();
  }
}
