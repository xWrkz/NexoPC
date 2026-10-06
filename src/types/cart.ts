export interface CartItem {
  id: string;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variationId?: number;
  category?: string;
  buildId?: string;
  buildName?: string;
}
