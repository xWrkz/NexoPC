export interface ProductImage {
  sourceUrl: string;
  altText: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
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
  category?: string;
  availability?: "all" | "in-stock";
  sort?: "featured" | "price-asc" | "price-desc" | "name";
  minPrice?: number;
  maxPrice?: number;
}

export interface CatalogPage {
  products: Product[];
  categories: ProductCategory[];
  pageInfo: { hasNextPage: boolean; endCursor?: string | null };
}
