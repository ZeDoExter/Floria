import { request as __request } from './core/request';
import { OpenAPI } from './core/OpenAPI';

export type CartItemInput = {
  productId: string;
  quantity: number;
  selectedOptionIds: string[];
  unitPrice?: number;
};

export type CartItemResponse = CartItemInput & {
  id: string;
  unitPrice: number;
  productName: string;
};

// Defensively unwrap the server response. The backend may return:
//   { items: [...] }  OR  { data: { items: [...] } }  OR  { data: [...] }
const normalizeCart = (raw: any): CartItemResponse[] => {
  const payload = raw?.data ?? raw;
  const items: any[] = Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(payload)
      ? payload
      : [];
  return items.map((item) => ({
    ...item,
    unitPrice: Number(item.unitPrice ?? 0),
    selectedOptionIds: Array.isArray(item.selectedOptionIds) ? item.selectedOptionIds : [],
  }));
};

export const fetchRemoteCart = async (token: string): Promise<CartItemResponse[]> => {
  const response = await __request(OpenAPI, {
    method: 'GET',
    url: '/cart',
  });
  return normalizeCart(response);
};

export const mergeCart = async (items: CartItemInput[], token: string): Promise<CartItemResponse[]> => {
  const response = await __request(OpenAPI, {
    method: 'POST',
    url: '/cart/merge',
    body: { items },
  });
  return normalizeCart(response);
};

export const addCartItem = async (token: string, item: CartItemInput): Promise<CartItemResponse[]> => {
  const response = await __request(OpenAPI, {
    method: 'POST',
    url: '/cart/items',
    body: item,
  });
  return normalizeCart(response);
};

export const updateCartItemQuantity = async (token: string, id: string, quantity: number): Promise<CartItemResponse[]> => {
  const response = await __request(OpenAPI, {
    method: 'PUT',
    url: `/cart/items/${id}`,
    body: { quantity },
  });
  return normalizeCart(response);
};

export const removeCartItem = async (token: string, id: string): Promise<CartItemResponse[]> => {
  const response = await __request(OpenAPI, {
    method: 'DELETE',
    url: `/cart/items/${id}`,
  });
  return normalizeCart(response);
};
