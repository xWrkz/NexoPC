import { gql } from "@apollo/client";

export const PRODUCT_FIELDS = gql`
  fragment ProductFields on Product {
    id databaseId name slug sku description shortDescription
    image { sourceUrl altText }
    galleryImages(first: 8) { nodes { sourceUrl altText } }
    productCategories { nodes { id databaseId name slug count parent { node { id name slug } } } }
    productTags { nodes { id databaseId name slug count } }
    ... on ProductWithAttributes {
      attributes { nodes { name label options visible variation } }
    }
    ... on SimpleProduct {
      price regularPrice salePrice stockStatus stockQuantity
      nexopcHardware { componentTypeSlug componentTypeName socketId memoryTypeId formFactorId storageInterfaceId storageInterfaceSlug supportedMemoryTypeIds supportedStorageInterfaceIds supportedFormFactorIds tdpWatts capacityGb gpuMemoryGb gpuLengthMm gpuSlots recommendedPsuWatts maxGpuLengthMm maxCoolerHeightMm bays25 bays35 continuousWatts m2Slots sataPorts }
    }
    ... on VariableProduct {
      price regularPrice salePrice stockStatus stockQuantity
      nexopcHardware { componentTypeSlug componentTypeName socketId memoryTypeId formFactorId storageInterfaceId storageInterfaceSlug supportedMemoryTypeIds supportedStorageInterfaceIds supportedFormFactorIds tdpWatts capacityGb gpuMemoryGb gpuLengthMm gpuSlots recommendedPsuWatts maxGpuLengthMm maxCoolerHeightMm bays25 bays35 continuousWatts m2Slots sataPorts }
      variations(first: 30) { nodes { id databaseId name price regularPrice stockStatus image { sourceUrl altText } } }
    }
  }
`;

export const GET_PRODUCTS = gql`
  ${PRODUCT_FIELDS}
  query GetProducts($first: Int = 24, $after: String, $where: RootQueryToProductConnectionWhereArgs) {
    products(first: $first, after: $after, where: $where) {
      nodes { ...ProductFields }
      pageInfo { hasNextPage endCursor }
    }
    productCategories(first: 100, where: { hideEmpty: false }) {
      nodes {
        id databaseId name slug count
        parent { node { id name slug } }
        children(first: 50) { nodes { id databaseId name slug count } }
      }
    }
    productTags(first: 100, where: { hideEmpty: false }) {
      nodes { id databaseId name slug count }
    }
  }
`;

export const GET_PRODUCT_BY_SLUG = gql`
  ${PRODUCT_FIELDS}
  query GetProductBySlug($slug: ID!) { product(id: $slug, idType: SLUG) { ...ProductFields } }
`;
