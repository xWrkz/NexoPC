export interface ProductImage {
  sourceUrl: string;
  altText: string;
}

export interface ProductCategory {
  id: string;
  databaseId?: number;
  name: string;
  slug: string;
  count?: number | null;
  parent?: { node: Pick<ProductCategory, "id" | "slug" | "name"> } | null;
  children?: { nodes: ProductCategory[] };
}

export interface ProductTag {
  id: string;
  databaseId?: number;
  name: string;
  slug: string;
  count?: number | null;
}

export interface ProductAttribute {
  name: string;
  label?: string;
  options: string[];
  visible?: boolean;
  variation?: boolean;
}

export interface Variation {
  id: string;
  databaseId: number;
  name: string;
  price: string;
  regularPrice?: string;
  stockStatus: string;
  image?: ProductImage | null;
  attributes?: ProductAttribute[];
}

export interface Product {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  sku?: string;
  description?: string;
  shortDescription?: string;
  image: ProductImage | null;
  galleryImages?: { nodes: ProductImage[] };
  productCategories?: { nodes: ProductCategory[] };
  productTags?: { nodes: ProductTag[] };
  attributes?: { nodes: ProductAttribute[] };
  price?: string;
  regularPrice?: string;
  salePrice?: string;
  stockStatus?: string;
  stockQuantity?: number | null;
  variations?: { nodes: Variation[] };
}

export interface CatalogFilters {
  query?: string;
  categories?: string[];
  tags?: string[];
  usages?: string[];
  availability?: "all" | "in-stock" | "out-of-stock";
  onSale?: boolean;
  sort?: "featured" | "price-asc" | "price-desc" | "name" | "newest";
  minPrice?: number;
  maxPrice?: number;
}

export type CatalogStatus = "success" | "empty" | "error";

export interface CatalogResult {
  products: Product[];
  categories: ProductCategory[];
  tags: ProductTag[];
  pageInfo: { hasNextPage: boolean; endCursor?: string | null };
  status: CatalogStatus;
  error?: string;
  source: "catalog" | "demo";
}

export type CatalogPage = CatalogResult;

export interface UsageProfile {
  id: "first-pc" | "study" | "work" | "programming" | "creation" | "gaming" | "upgrade";
  label: string;
  description: string;
  tagSlugs: string[];
}
