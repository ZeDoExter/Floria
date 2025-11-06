import { apiClient } from './client';

export interface ProductSummary {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  imageUrl?: string;
}

export interface ProductDetail extends ProductSummary {
  optionGroups: Array<{
    id: string;
    name: string;
    description?: string;
    isRequired: boolean;
    minSelect: number;
    maxSelect: number;
    options: Array<{
      id: string;
      name: string;
      description?: string;
      priceModifier: number;
    }>;
  }>;
}

export const fetchProducts = async () => {
  const response = await apiClient.get<{ products: ProductSummary[] }>('/products');
  return response.data.products;
};

export const fetchProductDetail = async (productId: string) => {
  const response = await apiClient.get<{ product: ProductDetail }>(`/products/${productId}`);
  return response.data.product;
};
