import { OpenAPI } from './core/OpenAPI';
import { request as __request } from './core/request';

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  imageUrl?: string;
  categoryId: string;
}

export interface Option {
  id: string;
  optionGroupId: string;
  name: string;
  description?: string;
  priceModifier: number;
}

export interface OptionGroup {
  id: string;
  productId: string;
  name: string;
  description?: string;
  isRequired: boolean;
  minSelect: number;
  maxSelect: number;
  options: Option[];
}

export interface CatalogData {
  categories: Category[];
  products: Product[];
  optionGroups: OptionGroup[];
  options: Option[];
}

const unwrapData = <T>(response: any): T => {
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data as T;
  }
  return response as T;
};

const toNumber = (value: unknown): number => Number(value ?? 0);

export const fetchCategories = async (filterByOwner = false): Promise<Category[]> => {
  const response = await __request(OpenAPI, {
    method: 'GET',
    url: '/categories',
    query: filterByOwner ? { filterByOwner: true } : undefined
  });

  const categories = unwrapData<any[]>(response) ?? [];
  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    description: category.description ?? undefined
  }));
};

export const fetchCatalogData = async (): Promise<CatalogData> => {
  const [categoriesResponse, productsResponse] = await Promise.all([
    __request(OpenAPI, { method: 'GET', url: '/categories', query: { filterByOwner: true } }),
    __request(OpenAPI, { method: 'GET', url: '/products', query: { filterByOwner: true } })
  ]);

  const categoriesRaw = unwrapData<any[]>(categoriesResponse) ?? [];
  const productsRaw = unwrapData<any[]>(productsResponse) ?? [];

  const categories: Category[] = categoriesRaw.map((category) => ({
    id: category.id,
    name: category.name,
    description: category.description ?? undefined
  }));

  const products: Product[] = productsRaw.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description ?? undefined,
    basePrice: toNumber(product.basePrice),
    imageUrl: product.imageUrl ?? undefined,
    categoryId: product.categoryId ?? product.category?.id
  }));

  const optionGroups: OptionGroup[] = [];
  const options: Option[] = [];

  for (const product of productsRaw) {
    const groups = Array.isArray(product.optionGroups) ? product.optionGroups : [];
    for (const group of groups) {
      const mappedOptions: Option[] = (Array.isArray(group.options) ? group.options : []).map((option: any) => ({
        id: option.id,
        optionGroupId: option.optionGroupId ?? group.id,
        name: option.name,
        description: option.description ?? undefined,
        priceModifier: toNumber(option.priceModifier)
      }));

      optionGroups.push({
        id: group.id,
        productId: group.productId ?? product.id,
        name: group.name,
        description: group.description ?? undefined,
        isRequired: Boolean(group.isRequired),
        minSelect: Number(group.minSelect ?? 0),
        maxSelect: Number(group.maxSelect ?? 0),
        options: mappedOptions
      });

      options.push(...mappedOptions);
    }
  }

  return { categories, products, optionGroups, options };
};

export const createCategory = async (input: Pick<Category, 'name' | 'description'>): Promise<Category> => {
  const response = await __request(OpenAPI, {
    method: 'POST',
    url: '/categories',
    body: input,
    mediaType: 'application/json'
  });

  const category = unwrapData<any>(response);
  return {
    id: category.id,
    name: category.name,
    description: category.description ?? undefined
  };
};

export const updateCategory = async (id: string, input: Pick<Category, 'name' | 'description'>): Promise<Category> => {
  const response = await __request(OpenAPI, {
    method: 'PUT',
    url: '/categories/{id}',
    path: { id },
    body: input,
    mediaType: 'application/json'
  });

  const category = unwrapData<any>(response);
  return {
    id: category.id,
    name: category.name,
    description: category.description ?? undefined
  };
};

export interface UpsertProductInput {
  name: string;
  description?: string;
  basePrice: number;
  imageUrl?: string;
  categoryId: string;
}

export const createProduct = async (input: UpsertProductInput): Promise<Product> => {
  const response = await __request(OpenAPI, {
    method: 'POST',
    url: '/products',
    body: input,
    mediaType: 'application/json'
  });

  const product = unwrapData<any>(response);
  return {
    id: product.id,
    name: product.name,
    description: product.description ?? undefined,
    basePrice: toNumber(product.basePrice),
    imageUrl: product.imageUrl ?? undefined,
    categoryId: product.categoryId ?? product.category?.id
  };
};

export const updateProduct = async (id: string, input: UpsertProductInput): Promise<Product> => {
  const response = await __request(OpenAPI, {
    method: 'PUT',
    url: '/products/{id}',
    path: { id },
    body: input,
    mediaType: 'application/json'
  });

  const product = unwrapData<any>(response);
  return {
    id: product.id,
    name: product.name,
    description: product.description ?? undefined,
    basePrice: toNumber(product.basePrice),
    imageUrl: product.imageUrl ?? undefined,
    categoryId: product.categoryId ?? product.category?.id
  };
};

export interface UpsertOptionGroupInput {
  productId: string;
  name: string;
  description?: string;
  isRequired: boolean;
  minSelect: number;
  maxSelect: number;
}

export const createOptionGroup = async (input: UpsertOptionGroupInput): Promise<OptionGroup> => {
  const response = await __request(OpenAPI, {
    method: 'POST',
    url: '/option-groups',
    body: input,
    mediaType: 'application/json'
  });

  const group = unwrapData<any>(response);
  return {
    id: group.id,
    productId: group.productId,
    name: group.name,
    description: group.description ?? undefined,
    isRequired: Boolean(group.isRequired),
    minSelect: Number(group.minSelect ?? 0),
    maxSelect: Number(group.maxSelect ?? 0),
    options: []
  };
};

export const updateOptionGroup = async (id: string, input: UpsertOptionGroupInput): Promise<OptionGroup> => {
  const response = await __request(OpenAPI, {
    method: 'PUT',
    url: '/option-groups/{id}',
    path: { id },
    body: input,
    mediaType: 'application/json'
  });

  const group = unwrapData<any>(response);
  return {
    id: group.id,
    productId: group.productId,
    name: group.name,
    description: group.description ?? undefined,
    isRequired: Boolean(group.isRequired),
    minSelect: Number(group.minSelect ?? 0),
    maxSelect: Number(group.maxSelect ?? 0),
    options: []
  };
};

export interface UpsertOptionInput {
  optionGroupId: string;
  name: string;
  description?: string;
  priceModifier: number;
}

export const createOption = async (input: UpsertOptionInput): Promise<Option> => {
  const response = await __request(OpenAPI, {
    method: 'POST',
    url: '/options',
    body: input,
    mediaType: 'application/json'
  });

  const option = unwrapData<any>(response);
  return {
    id: option.id,
    optionGroupId: option.optionGroupId,
    name: option.name,
    description: option.description ?? undefined,
    priceModifier: toNumber(option.priceModifier)
  };
};

export const updateOption = async (id: string, input: UpsertOptionInput): Promise<Option> => {
  const response = await __request(OpenAPI, {
    method: 'PUT',
    url: '/options/{id}',
    path: { id },
    body: input,
    mediaType: 'application/json'
  });

  const option = unwrapData<any>(response);
  return {
    id: option.id,
    optionGroupId: option.optionGroupId,
    name: option.name,
    description: option.description ?? undefined,
    priceModifier: toNumber(option.priceModifier)
  };
};

export const deleteCategory = async (id: string): Promise<void> => {
  await __request(OpenAPI, {
    method: 'DELETE',
    url: '/categories/{id}',
    path: { id }
  });
};

export const deleteProduct = async (id: string): Promise<void> => {
  await __request(OpenAPI, {
    method: 'DELETE',
    url: '/products/{id}',
    path: { id }
  });
};

export const deleteOptionGroup = async (id: string): Promise<void> => {
  await __request(OpenAPI, {
    method: 'DELETE',
    url: '/option-groups/{id}',
    path: { id }
  });
};

export const deleteOption = async (id: string): Promise<void> => {
  await __request(OpenAPI, {
    method: 'DELETE',
    url: '/options/{id}',
    path: { id }
  });
};
