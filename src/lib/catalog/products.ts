import { getClient } from "@/lib/apollo/apollo-client";
import { GET_PRODUCT_BY_SLUG, GET_PRODUCTS } from "@/lib/graphql/queries";
import { Product } from "@/types/product";

const demoProducts: Product[] = [
  {
    id: "demo-cpu-amd-ryzen-5-7600",
    databaseId: 1001,
    name: "AMD Ryzen 5 7600",
    slug: "amd-ryzen-5-7600",
    shortDescription: "Procesador de 6 núcleos para una PC gamer equilibrada.",
    image: null,
    price: "S/ 899.00",
    regularPrice: "S/ 949.00",
    stockStatus: "IN_STOCK",
  },
  {
    id: "demo-ram-kingston-fury",
    databaseId: 1002,
    name: "Kingston Fury Beast RGB",
    slug: "kingston-fury-beast-rgb",
    shortDescription: "Memoria DDR5 disponible en distintas capacidades.",
    image: null,
    price: "S/ 329.00",
    regularPrice: "S/ 329.00",
    stockStatus: "IN_STOCK",
    variations: {
      nodes: [
        { id: "demo-ram-16gb", databaseId: 1101, name: "16 GB", price: "S/ 329.00", stockStatus: "IN_STOCK" },
        { id: "demo-ram-32gb", databaseId: 1102, name: "32 GB", price: "S/ 569.00", stockStatus: "IN_STOCK" },
      ],
    },
  },
  {
    id: "demo-gpu-rtx-4060",
    databaseId: 1003,
    name: "GeForce RTX 4060 8 GB",
    slug: "geforce-rtx-4060-8gb",
    shortDescription: "Tarjeta gráfica para jugar en 1080p con ray tracing.",
    image: null,
    price: "S/ 1,499.00",
    regularPrice: "S/ 1,499.00",
    stockStatus: "OUT_OF_STOCK",
  },
];

export function isDemoMode() {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true" || !process.env.NEXT_PUBLIC_GRAPHQL_URL;
}

export async function getProducts(): Promise<Product[]> {
  if (isDemoMode()) return demoProducts;

  try {
    const { data } = await getClient().query({ query: GET_PRODUCTS });
    const catalogData = data as { products?: { nodes?: Product[] } };
    return catalogData.products?.nodes || [];
  } catch (error) {
    console.error("Error al obtener productos desde WooCommerce:", error);
    return demoProducts;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (isDemoMode()) return demoProducts.find((product) => product.slug === slug) || null;

  try {
    const { data } = await getClient().query({
      query: GET_PRODUCT_BY_SLUG,
      variables: { slug },
    });
    const productData = data as { product?: Product | null };
    return productData.product || null;
  } catch (error) {
    console.error("Error al obtener el producto desde WooCommerce:", error);
    return demoProducts.find((product) => product.slug === slug) || null;
  }
}
