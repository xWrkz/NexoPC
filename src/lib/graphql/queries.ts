import { gql } from "@apollo/client";

export const GET_PRODUCTS = gql`
  query GetProducts {
    products(first: 20) {
      nodes {
        id
        databaseId
        name
        slug
        image {
          sourceUrl
          altText
        }
        ... on SimpleProduct {
          price
          regularPrice
          stockStatus
        }
        ... on VariableProduct {
          price
          regularPrice
          stockStatus
          variations(first: 10) {
            nodes {
              id
              databaseId
              name
              price
              stockStatus
            }
          }
        }
      }
    }
  }
`;

export const GET_PRODUCT_BY_SLUG = gql`
  query GetProductBySlug($slug: ID!) {
    product(id: $slug, idType: SLUG) {
      id
      databaseId
      name
      slug
      description
      shortDescription
      image {
        sourceUrl
        altText
      }
      ... on SimpleProduct {
        price
        regularPrice
        stockStatus
      }
      ... on VariableProduct {
        price
        regularPrice
        stockStatus
        variations(first: 20) {
          nodes {
            id
            databaseId
            name
            price
            stockStatus
          }
        }
      }
    }
  }
`;

export const GET_PRODUCTS_BY_CATEGORY = gql`
  query GetProductsByCategory($category: String!) {
    products(first: 20, where: { category: $category }) {
      nodes {
        id
        databaseId
        name
        slug
        image {
          sourceUrl
          altText
        }
        ... on SimpleProduct {
          price
          stockStatus
        }
        ... on VariableProduct {
          price
          stockStatus
        }
      }
    }
  }
`;