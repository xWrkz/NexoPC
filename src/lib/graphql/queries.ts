import { gql } from "@apollo/client";

export const PRODUCT_FIELDS = gql`
  fragment ProductFields on Product {
    id databaseId name slug sku description shortDescription
    image { sourceUrl altText }
    galleryImages(first: 8) { nodes { sourceUrl altText } }
    productCategories { nodes { id name slug } }
    attributes { nodes { name label options visible variation } }
    ... on SimpleProduct { price regularPrice salePrice stockStatus stockQuantity }
    ... on VariableProduct {
      price regularPrice salePrice stockStatus stockQuantity
      variations(first: 30) { nodes { id databaseId name price regularPrice stockStatus image { sourceUrl altText } } }
    }
  }
`;

export const GET_PRODUCTS = gql`
  ${PRODUCT_FIELDS}
  query GetProducts($first: Int = 48, $after: String) {
    products(first: $first, after: $after) {
      nodes { ...ProductFields }
      pageInfo { hasNextPage endCursor }
    }
    productCategories(first: 50) { nodes { id name slug } }
  }
`;

export const GET_PRODUCT_BY_SLUG = gql`
  ${PRODUCT_FIELDS}
  query GetProductBySlug($slug: ID!) { product(id: $slug, idType: SLUG) { ...ProductFields } }
`;
