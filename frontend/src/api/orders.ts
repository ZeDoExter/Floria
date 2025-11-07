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

const normalizeOrder = (order: any): OrderResponse => ({
  ...order,
  totalAmount: Number(order.totalAmount ?? 0)
});

export const submitOrder = async (payload: CheckoutPayload, token: string) => {
  const response = await apiClient.post('/orders', payload, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const order = (response.data as { order?: unknown })?.order;
  return normalizeOrder(order ?? response.data);
};

export const fetchOrders = async (token: string) => {
  const response = await apiClient.get('/orders', {
    headers: { Authorization: `Bearer ${token}` }
  });

  const orders = (response.data as { orders?: unknown })?.orders;
  if (!Array.isArray(orders)) {
    return [];
  }

  return orders.map(normalizeOrder);
};
