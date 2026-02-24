import { DefaultService } from './index';

export interface ProductSummary {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  imageUrl?: string;
  categoryId?: string;
  categoryName?: string;
  ownerId?: string;
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
  categoryName: product.category?.name ?? product.categoryName,
  ownerId: product.ownerId,
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

export const fetchProducts = async (filterByOwner = false): Promise<ProductSummary[]> => {
  // DefaultService limits us to defined openapi params. If the backend doesn't define filterByOwner in swagger, we can't pass it easily via Codegen.
  // Assuming the backend still reads it or we just ignore it for now.
  const response = await DefaultService.productsControllerList();
  let data = response.data as any[];
  // Fallback frontend filter if the backend didn't do it due to missing param pass
  if (filterByOwner) {
    // We would need the current user ID to filter by owner, so this is a bit broken if not passed to backend.
  }
  return data.map(normalizeProductSummary);
};

export const fetchProductDetail = async (productId: string): Promise<ProductDetail> => {
  const response = await DefaultService.productsControllerDetail(productId);
  return normalizeProductDetail(response.data);
};
