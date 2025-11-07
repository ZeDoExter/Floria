import { apiClient } from './client';
import { CartItemInput } from './cart';

export type CheckoutPayload = {
  items: CartItemInput[];
  notes?: string;
  deliveryDate?: string;
};

export type OrderResponse = {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
};

export const submitOrder = async (payload: CheckoutPayload, token: string) => {
  const response = await apiClient.post<{ order: OrderResponse }>(
    '/orders',
    payload,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data.order;
};

export const fetchOrders = async (token: string) => {
  const response = await apiClient.get<{ orders: OrderResponse[] }>('/orders', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.orders;
};
