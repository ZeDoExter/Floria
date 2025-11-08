import { apiClient } from './client';

export type StoreKey = 'flagship' | 'weekend-market';

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export const fetchCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get('/categories');
  return (response.data as any[]).map((category) => ({
    ...category,
    description: category.description ?? undefined
  }));
};

const withAuth = (token?: string) =>
  token
    ? {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    : {};

export const createCategory = async (
  input: Pick<Category, 'name' | 'description'>,
  token?: string
): Promise<Category> => {
  const response = await apiClient.post('/categories', input, withAuth(token));
  return response.data;
};

export interface CreateProductInput {
  name: string;
  description?: string;
  basePrice: number;
  imageUrl?: string;
  categoryId: string;
  storeKey?: StoreKey;
}

export const createProduct = async (input: CreateProductInput, token?: string) => {
  const response = await apiClient.post('/products', input, withAuth(token));
  return response.data;
};

export interface CreateOptionGroupInput {
  productId: string;
  name: string;
  description?: string;
  isRequired: boolean;
  minSelect: number;
  maxSelect: number;
}

export const createOptionGroup = async (input: CreateOptionGroupInput, token?: string) => {
  const response = await apiClient.post('/option-groups', input, withAuth(token));
  return response.data;
};

export interface CreateOptionInput {
  optionGroupId: string;
  name: string;
  description?: string;
  priceModifier: number;
}

export const createOption = async (input: CreateOptionInput, token?: string) => {
  const response = await apiClient.post('/options', input, withAuth(token));
  return response.data;
};
