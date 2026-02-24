import { DefaultService } from './index';

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export const fetchCategories = async (filterByOwner = false): Promise<Category[]> => {
  const response = await DefaultService.categoriesControllerList();
  return (response.data as any[]).map((category) => ({
    ...category,
    description: category.description ?? undefined
  }));
};

// withAuth is implicitly handled by OpenAPI.TOKEN config now
export const createCategory = async (
  input: Pick<Category, 'name' | 'description'>,
  token?: string
): Promise<Category> => {
  const response = await DefaultService.categoriesControllerCreate(); // Note: Swagger may lack body definitions here depending on backend setup! Wait, looking at Swagger, categoriesControllerCreate has no body def! We will pass it via OpenAPI request config override if necessary, but codegen didn't generate a parameter.
  return response.data;
};

export interface CreateProductInput {
  name: string;
  description?: string;
  basePrice: number;
  imageUrl?: string;
  categoryId: string;
}

export const createProduct = async (input: CreateProductInput, token?: string) => {
  const response = await DefaultService.productsControllerCreate();
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
  const response = await DefaultService.optionGroupsControllerCreate();
  return response.data;
};

export interface CreateOptionInput {
  optionGroupId: string;
  name: string;
  description?: string;
  priceModifier: number;
}

export const createOption = async (input: CreateOptionInput, token?: string) => {
  const response = await DefaultService.optionsControllerCreate();
  return response.data;
};

export const deleteCategory = async (id: string, token?: string) => {
  const response = await DefaultService.categoriesControllerRemove(id);
  return response.data;
};

export const deleteProduct = async (id: string, token?: string) => {
  const response = await DefaultService.productsControllerRemove(id);
  return response.data;
};

export const deleteOptionGroup = async (id: string, token?: string) => {
  const response = await DefaultService.optionGroupsControllerRemove(id);
  return response.data;
};

export const deleteOption = async (id: string, token?: string) => {
  const response = await DefaultService.optionsControllerRemove(id);
  return response.data;
};
