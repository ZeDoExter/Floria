import type { Category, ProductDetail, ProductOptionGroup, ProductOption, OrderStatus } from '../../types/domain';
import { CATEGORIES, PRODUCTS, OPTION_GROUPS, OPTIONS, ORDERS } from '../../mocks/db';
import { apiClient } from '../../api/client';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_CATALOG === 'true';

// ============ CATEGORIES ============
export async function listCategoriesMock(): Promise<Category[]> {
  await new Promise(r => setTimeout(r, 100));
  return [...CATEGORIES];
}

export async function listCategoriesReal(token: string): Promise<Category[]> {
  const response = await apiClient.get<Category[]>('/categories', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function createCategoryMock(data: Omit<Category, 'id'>): Promise<Category> {
  await new Promise(r => setTimeout(r, 150));
  const newCat: Category = { id: `cat-${Date.now()}`, ...data };
  CATEGORIES.push(newCat);
  return newCat;
}

export async function createCategoryReal(data: Omit<Category, 'id'>, token: string): Promise<Category> {
  const response = await apiClient.post<Category>('/categories', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function updateCategoryMock(id: string, data: Partial<Category>): Promise<Category> {
  await new Promise(r => setTimeout(r, 150));
  const idx = CATEGORIES.findIndex(c => c.id === id);
  if (idx === -1) throw new Error('Category not found');
  CATEGORIES[idx] = { ...CATEGORIES[idx], ...data };
  return CATEGORIES[idx];
}

export async function updateCategoryReal(id: string, data: Partial<Category>, token: string): Promise<Category> {
  const response = await apiClient.put<Category>(`/categories/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function deleteCategoryMock(id: string): Promise<void> {
  await new Promise(r => setTimeout(r, 150));
  const idx = CATEGORIES.findIndex(c => c.id === id);
  if (idx !== -1) CATEGORIES.splice(idx, 1);
}

export async function deleteCategoryReal(id: string, token: string): Promise<void> {
  await apiClient.delete(`/categories/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

// ============ PRODUCTS ============
export async function listProductsMock(): Promise<ProductDetail[]> {
  await new Promise(r => setTimeout(r, 100));
  return [...PRODUCTS];
}

export async function listProductsReal(token: string): Promise<ProductDetail[]> {
  const response = await apiClient.get<ProductDetail[]>('/products', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function createProductMock(data: Omit<ProductDetail, 'id' | 'optionGroups'>): Promise<ProductDetail> {
  await new Promise(r => setTimeout(r, 150));
  const newProd: ProductDetail = {
    id: `prod-${Date.now()}`,
    ...data,
    optionGroups: []
  };
  PRODUCTS.push(newProd);
  return newProd;
}

export async function createProductReal(data: Omit<ProductDetail, 'id' | 'optionGroups'>, token: string): Promise<ProductDetail> {
  const response = await apiClient.post<ProductDetail>('/products', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function updateProductMock(id: string, data: Partial<ProductDetail>): Promise<ProductDetail> {
  await new Promise(r => setTimeout(r, 150));
  const idx = PRODUCTS.findIndex(p => p.id === id);
  if (idx === -1) throw new Error('Product not found');
  PRODUCTS[idx] = { ...PRODUCTS[idx], ...data };
  return PRODUCTS[idx];
}

export async function updateProductReal(id: string, data: Partial<ProductDetail>, token: string): Promise<ProductDetail> {
  const response = await apiClient.put<ProductDetail>(`/products/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function deleteProductMock(id: string): Promise<void> {
  await new Promise(r => setTimeout(r, 150));
  const idx = PRODUCTS.findIndex(p => p.id === id);
  if (idx !== -1) PRODUCTS.splice(idx, 1);
}

export async function deleteProductReal(id: string, token: string): Promise<void> {
  await apiClient.delete(`/products/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

// ============ OPTION GROUPS ============
export async function listOptionGroupsMock(): Promise<ProductOptionGroup[]> {
  await new Promise(r => setTimeout(r, 100));
  return [...OPTION_GROUPS];
}

export async function listOptionGroupsReal(token: string): Promise<ProductOptionGroup[]> {
  const response = await apiClient.get<ProductOptionGroup[]>('/option-groups', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function createOptionGroupMock(data: Omit<ProductOptionGroup, 'id' | 'options'>): Promise<ProductOptionGroup> {
  await new Promise(r => setTimeout(r, 150));
  const newGroup: ProductOptionGroup = {
    id: `optgrp-${Date.now()}`,
    ...data,
    options: []
  };
  OPTION_GROUPS.push(newGroup);
  return newGroup;
}

export async function createOptionGroupReal(data: Omit<ProductOptionGroup, 'id' | 'options'>, token: string): Promise<ProductOptionGroup> {
  const response = await apiClient.post<ProductOptionGroup>('/option-groups', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function updateOptionGroupMock(id: string, data: Partial<ProductOptionGroup>): Promise<ProductOptionGroup> {
  await new Promise(r => setTimeout(r, 150));
  const idx = OPTION_GROUPS.findIndex(g => g.id === id);
  if (idx === -1) throw new Error('Option group not found');
  OPTION_GROUPS[idx] = { ...OPTION_GROUPS[idx], ...data };
  return OPTION_GROUPS[idx];
}

export async function updateOptionGroupReal(id: string, data: Partial<ProductOptionGroup>, token: string): Promise<ProductOptionGroup> {
  const response = await apiClient.put<ProductOptionGroup>(`/option-groups/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function deleteOptionGroupMock(id: string): Promise<void> {
  await new Promise(r => setTimeout(r, 150));
  const idx = OPTION_GROUPS.findIndex(g => g.id === id);
  if (idx !== -1) OPTION_GROUPS.splice(idx, 1);
}

export async function deleteOptionGroupReal(id: string, token: string): Promise<void> {
  await apiClient.delete(`/option-groups/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

// ============ OPTIONS ============
export async function listOptionsMock(): Promise<ProductOption[]> {
  await new Promise(r => setTimeout(r, 100));
  return [...OPTIONS];
}

export async function listOptionsReal(token: string): Promise<ProductOption[]> {
  const response = await apiClient.get<ProductOption[]>('/options', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function createOptionMock(data: Omit<ProductOption, 'id'>): Promise<ProductOption> {
  await new Promise(r => setTimeout(r, 150));
  const newOpt: ProductOption = {
    id: `opt-${Date.now()}`,
    ...data
  };
  OPTIONS.push(newOpt);
  return newOpt;
}

export async function createOptionReal(data: Omit<ProductOption, 'id'>, token: string): Promise<ProductOption> {
  const response = await apiClient.post<ProductOption>('/options', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function updateOptionMock(id: string, data: Partial<ProductOption>): Promise<ProductOption> {
  await new Promise(r => setTimeout(r, 150));
  const idx = OPTIONS.findIndex(o => o.id === id);
  if (idx === -1) throw new Error('Option not found');
  OPTIONS[idx] = { ...OPTIONS[idx], ...data };
  return OPTIONS[idx];
}

export async function updateOptionReal(id: string, data: Partial<ProductOption>, token: string): Promise<ProductOption> {
  const response = await apiClient.put<ProductOption>(`/options/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function deleteOptionMock(id: string): Promise<void> {
  await new Promise(r => setTimeout(r, 150));
  const idx = OPTIONS.findIndex(o => o.id === id);
  if (idx !== -1) OPTIONS.splice(idx, 1);
}

export async function deleteOptionReal(id: string, token: string): Promise<void> {
  await apiClient.delete(`/options/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

// ============ ORDERS (for admin) ============
export async function listAllOrdersMock(): Promise<typeof ORDERS> {
  await new Promise(r => setTimeout(r, 100));
  return [...ORDERS];
}

export async function listAllOrdersReal(token: string): Promise<typeof ORDERS> {
  const response = await apiClient.get('/orders', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function updateOrderStatusMock(orderId: string, status: OrderStatus): Promise<void> {
  await new Promise(r => setTimeout(r, 150));
  const order = ORDERS.find(o => o.id === orderId);
  if (!order) throw new Error('Order not found');
  order.status = status;
}

export async function updateOrderStatusReal(orderId: string, status: OrderStatus, token: string): Promise<void> {
  await apiClient.patch(`/orders/${orderId}/status`, { status }, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

// ============ ADAPTER ============
export const catalogAdapter = {
  mode: () => (USE_MOCK ? 'mock' : 'real') as 'mock' | 'real',
  
  listCategories: (token?: string) => USE_MOCK ? listCategoriesMock() : listCategoriesReal(token!),
  createCategory: (data: Omit<Category, 'id'>, token?: string) => USE_MOCK ? createCategoryMock(data) : createCategoryReal(data, token!),
  updateCategory: (id: string, data: Partial<Category>, token?: string) => USE_MOCK ? updateCategoryMock(id, data) : updateCategoryReal(id, data, token!),
  deleteCategory: (id: string, token?: string) => USE_MOCK ? deleteCategoryMock(id) : deleteCategoryReal(id, token!),
  
  listProducts: (token?: string) => USE_MOCK ? listProductsMock() : listProductsReal(token!),
  createProduct: (data: Omit<ProductDetail, 'id' | 'optionGroups'>, token?: string) => USE_MOCK ? createProductMock(data) : createProductReal(data, token!),
  updateProduct: (id: string, data: Partial<ProductDetail>, token?: string) => USE_MOCK ? updateProductMock(id, data) : updateProductReal(id, data, token!),
  deleteProduct: (id: string, token?: string) => USE_MOCK ? deleteProductMock(id) : deleteProductReal(id, token!),
  
  listOptionGroups: (token?: string) => USE_MOCK ? listOptionGroupsMock() : listOptionGroupsReal(token!),
  createOptionGroup: (data: Omit<ProductOptionGroup, 'id' | 'options'>, token?: string) => USE_MOCK ? createOptionGroupMock(data) : createOptionGroupReal(data, token!),
  updateOptionGroup: (id: string, data: Partial<ProductOptionGroup>, token?: string) => USE_MOCK ? updateOptionGroupMock(id, data) : updateOptionGroupReal(id, data, token!),
  deleteOptionGroup: (id: string, token?: string) => USE_MOCK ? deleteOptionGroupMock(id) : deleteOptionGroupReal(id, token!),
  
  listOptions: (token?: string) => USE_MOCK ? listOptionsMock() : listOptionsReal(token!),
  createOption: (data: Omit<ProductOption, 'id'>, token?: string) => USE_MOCK ? createOptionMock(data) : createOptionReal(data, token!),
  updateOption: (id: string, data: Partial<ProductOption>, token?: string) => USE_MOCK ? updateOptionMock(id, data) : updateOptionReal(id, data, token!),
  deleteOption: (id: string, token?: string) => USE_MOCK ? deleteOptionMock(id) : deleteOptionReal(id, token!),
  
  listAllOrders: (token?: string) => USE_MOCK ? listAllOrdersMock() : listAllOrdersReal(token!),
  updateOrderStatus: (orderId: string, status: OrderStatus, token?: string) => USE_MOCK ? updateOrderStatusMock(orderId, status) : updateOrderStatusReal(orderId, status, token!)
};
