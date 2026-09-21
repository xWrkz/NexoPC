import { Product, Variation } from "./product";

export interface CartItem {
  id: string;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variationId?: number;
  isCustomBuild?: boolean;
}
