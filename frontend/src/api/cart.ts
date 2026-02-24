import { DefaultService } from './index';
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

type SerializedCart = {
  id?: string;
  items: CartItemResponse[];
};

const normalizeCart = (cart: SerializedCart): CartItemResponse[] =>
  cart.items.map((item) => ({
    ...item,
    unitPrice: Number(item.unitPrice ?? 0)
  }));

export const mergeCart = async (items: CartItemInput[], token: string) => {
  const response = await __request(OpenAPI, {
    method: 'POST',
    url: '/cart/merge',
    body: { items }
  });
  return normalizeCart(response as any);
};

export const fetchRemoteCart = async (token: string) => {
  const response = await __request(OpenAPI, {
    method: 'GET',
    url: '/cart',
    // We intentionally don't pass token here if we rely on global, but we can't easily pass the query without codegen param unless we specify it
    query: { anonymousId: 'dummy' }
  });
  return normalizeCart(response as any);
};
export const addCartItem = async (token: string, item: CartItemInput) => {
  const response = await __request(OpenAPI, {
    method: 'POST',
    url: '/cart/items',
    body: item
  });
  return normalizeCart(response as any);
};

export const updateCartItemQuantity = async (token: string, id: string, quantity: number) => {
  const response = await __request(OpenAPI, {
    method: 'PUT',
    url: `/cart/items/${id}`,
    body: { quantity }
  });
  return normalizeCart(response as any);
};

export const removeCartItem = async (token: string, id: string) => {
  const response = await DefaultService.cartControllerRemoveItem(id);
  return normalizeCart(response.data);
};
