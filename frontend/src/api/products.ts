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

const normalizeProductSummary = (product: any): ProductSummary => ({
  ...product,
  basePrice: Number(product.basePrice ?? 0)
});

const normalizeProductDetail = (product: any): ProductDetail => ({
  ...normalizeProductSummary(product),
  optionGroups: (product.optionGroups ?? []).map((group: any) => ({
    ...group,
    options: (group.options ?? []).map((option: any) => ({
      ...option,
      priceModifier: Number(option.priceModifier ?? 0)
    }))
  }))
});

export const fetchProducts = async () => {
  const response = await apiClient.get('/products');
  return (response.data as any[]).map(normalizeProductSummary);
};

export const fetchProductDetail = async (productId: string) => {
  const response = await apiClient.get(`/products/${productId}`);
  return normalizeProductDetail(response.data);
};
