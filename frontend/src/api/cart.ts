import { apiClient } from './client';

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
  const response = await apiClient.post<SerializedCart>(
    '/cart/merge',
    { items },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return normalizeCart(response.data);
};

export const fetchRemoteCart = async (token: string) => {
  const response = await apiClient.get<SerializedCart>('/cart', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return normalizeCart(response.data);
};
export const addCartItem = async (token: string, item: CartItemInput) => {
  const response = await apiClient.post<SerializedCart>('/cart/items', item, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return normalizeCart(response.data);
};

export const updateCartItemQuantity = async (token: string, id: string, quantity: number) => {
  const response = await apiClient.put<SerializedCart>(`/cart/items/${id}`, { quantity }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return normalizeCart(response.data);
};

export const removeCartItem = async (token: string, id: string) => {
  const response = await apiClient.delete<SerializedCart>(`/cart/items/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return normalizeCart(response.data);
};
