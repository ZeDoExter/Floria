import { apiClient } from './client';

export interface ProductSummary {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  imageUrl?: string;
  categoryId?: string;
  categoryName?: string;
}

export interface ProductDetail extends ProductSummary {
  category?: {
    id: string;
    name: string;
    description?: string;
  };
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
  basePrice: Number(product.basePrice ?? 0),
  categoryId: product.categoryId ?? product.category?.id,
  categoryName: product.category?.name ?? product.categoryName
});

const normalizeProductDetail = (product: any): ProductDetail => ({
  ...normalizeProductSummary(product),
  category: product.category
    ? {
        id: product.category.id,
        name: product.category.name,
        description: product.category.description ?? undefined
      }
    : undefined,
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
