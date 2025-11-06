import { apiClient } from './client';

export type CartItemInput = {
  productId: string;
  quantity: number;
  selectedOptionIds: string[];
};

export type CartItemResponse = CartItemInput & {
  id: string;
  unitPrice: number;
  productName: string;
};

export const mergeCart = async (items: CartItemInput[], token: string) => {
  const response = await apiClient.post<{ items: CartItemResponse[] }>(
    '/cart/merge',
    { items },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data.items;
};

export const fetchRemoteCart = async (token: string) => {
  const response = await apiClient.get<{ items: CartItemResponse[] }>('/cart', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.items;
};
