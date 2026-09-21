export interface Product {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  image: {
    sourceUrl: string;
    altText: string;
  } | null;
  price?: string;
  regularPrice?: string;
  stockStatus?: string;
  variations?: {
    nodes: Variation[];
  };
}

export interface Variation {
  id: string;
  databaseId: number;
  name: string;
  price: string;
  stockStatus: string;
}