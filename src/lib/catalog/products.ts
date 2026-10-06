import { getClient } from "@/lib/apollo/apollo-client";
import { GET_PRODUCT_BY_SLUG, GET_PRODUCTS } from "@/lib/graphql/queries";
import { CatalogFilters, CatalogPage, Product, ProductCategory } from "@/types/product";
import { getPriceValue } from "@/lib/utils/price";

const demoCategories: ProductCategory[] = [
  { id: "cat-cpu", name: "Procesadores", slug: "procesadores" },
  { id: "cat-ram", name: "Memoria RAM", slug: "memoria-ram" },
  { id: "cat-gpu", name: "Tarjetas gráficas", slug: "tarjetas-graficas" },
  { id: "cat-psu", name: "Fuentes de poder", slug: "fuentes-de-poder" },
];

const demoProducts: Product[] = [
  { id: "demo-cpu-amd-ryzen-5-7600", databaseId: 1001, name: "AMD Ryzen 5 7600", slug: "amd-ryzen-5-7600", sku: "RYZ-7600", shortDescription: "Procesador de 6 núcleos para una PC gamer equilibrada.", image: null, price: "S/ 899.00", regularPrice: "S/ 949.00", salePrice: "S/ 899.00", stockStatus: "IN_STOCK", stockQuantity: 8, productCategories: { nodes: [demoCategories[0]] }, attributes: { nodes: [{ name: "Socket", options: ["AM5"] }, { name: "TDP", options: ["65W"] }] } },
  { id: "demo-ram-kingston-fury", databaseId: 1002, name: "Kingston Fury Beast RGB", slug: "kingston-fury-beast-rgb", sku: "KF-5600", shortDescription: "Memoria DDR5 disponible en distintas capacidades.", image: null, price: "S/ 329.00", regularPrice: "S/ 369.00", salePrice: "S/ 329.00", stockStatus: "IN_STOCK", stockQuantity: 12, productCategories: { nodes: [demoCategories[1]] }, attributes: { nodes: [{ name: "Tipo de RAM", options: ["DDR5"] }] }, variations: { nodes: [{ id: "demo-ram-16gb", databaseId: 1101, name: "16 GB", price: "S/ 329.00", stockStatus: "IN_STOCK" }, { id: "demo-ram-32gb", databaseId: 1102, name: "32 GB", price: "S/ 569.00", stockStatus: "IN_STOCK" }] } },
  { id: "demo-gpu-rtx-4060", databaseId: 1003, name: "GeForce RTX 4060 8 GB", slug: "geforce-rtx-4060-8gb", sku: "RTX4060-8G", shortDescription: "Tarjeta gráfica para jugar en 1080p con ray tracing.", image: null, price: "S/ 1,499.00", regularPrice: "S/ 1,499.00", stockStatus: "OUT_OF_STOCK", stockQuantity: 0, productCategories: { nodes: [demoCategories[2]] }, attributes: { nodes: [{ name: "TDP", options: ["115W"] }, { name: "Longitud GPU", options: ["250mm"] }] } },
];

export function isDemoMode() { return process.env.NEXT_PUBLIC_DEMO_MODE === "true" || !process.env.NEXT_PUBLIC_GRAPHQL_URL; }
function filterProducts(products: Product[], filters: CatalogFilters = {}) {
  return products.filter((product) => {
    const search = filters.query?.trim().toLowerCase();
    const category = product.productCategories?.nodes.some((item) => item.slug === filters.category);
    const value = getPriceValue(product.price);
    return (!search || `${product.name} ${product.sku ?? ""}`.toLowerCase().includes(search)) &&
      (!filters.category || category) &&
      (filters.availability !== "in-stock" || product.stockStatus === "IN_STOCK") &&
      (!filters.minPrice || value >= filters.minPrice) && (!filters.maxPrice || value <= filters.maxPrice);
  }).sort((a, b) => filters.sort === "price-asc" ? getPriceValue(a.price) - getPriceValue(b.price) : filters.sort === "price-desc" ? getPriceValue(b.price) - getPriceValue(a.price) : filters.sort === "name" ? a.name.localeCompare(b.name) : 0);
}

export async function getCatalog(filters: CatalogFilters = {}, after?: string | null): Promise<CatalogPage> {
  if (isDemoMode()) return { products: filterProducts(demoProducts, filters), categories: demoCategories, pageInfo: { hasNextPage: false, endCursor: null } };
  try {
    const { data } = await getClient().query({ query: GET_PRODUCTS, variables: { first: 48, after }, fetchPolicy: "no-cache" });
    const result = data as { products?: { nodes?: Product[]; pageInfo?: CatalogPage["pageInfo"] }; productCategories?: { nodes?: ProductCategory[] } };
    return { products: filterProducts(result.products?.nodes ?? [], filters), categories: result.productCategories?.nodes ?? [], pageInfo: result.products?.pageInfo ?? { hasNextPage: false, endCursor: null } };
  } catch { return { products: filterProducts(demoProducts, filters), categories: demoCategories, pageInfo: { hasNextPage: false, endCursor: null } }; }
}

export async function getProducts() { return (await getCatalog()).products; }
export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (isDemoMode()) return demoProducts.find((product) => product.slug === slug) ?? null;
  try { const { data } = await getClient().query({ query: GET_PRODUCT_BY_SLUG, variables: { slug }, fetchPolicy: "no-cache" }); return (data as { product?: Product }).product ?? null; }
  catch { return demoProducts.find((product) => product.slug === slug) ?? null; }
}
