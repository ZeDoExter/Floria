import { DefaultService } from './index';
import { request as __request } from './core/request';
import { OpenAPI } from './core/OpenAPI';
import { CartItemInput } from './cart';

export const ORDER_STATUS_OPTIONS = [
  'PENDING',
  'PLACED',
  'PREPARING',
  'READY_FOR_PICKUP',
  'OUT_FOR_DELIVERY',
  'COMPLETED',
  'CANCELLED'
] as const;

export type OrderStatus = (typeof ORDER_STATUS_OPTIONS)[number];

export type CheckoutPayload = {
  items: CartItemInput[];
  notes?: string;
  deliveryDate?: string;
};

export type OrderItemResponse = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  optionSnapshot: {
    selectedOptions?: Array<{
      id: string;
      name: string;
      priceModifier: number;
    }>;
    selectedOptionIds?: string[];
    imageUrl?: string;
  };
};

export type OrderResponse = {
  id: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  notes: string | null;
  deliveryDate: string | null;
  customerEmail?: string | null;
  items?: OrderItemResponse[];
};

const normalizeOrder = (order: any): OrderResponse => ({
  ...order,
  totalAmount: Number(order.totalAmount ?? 0),
  status: (order.status as OrderStatus) ?? 'PENDING'
});

export const submitOrder = async (payload: CheckoutPayload, token: string) => {
  const response = await __request(OpenAPI, {
    method: 'POST',
    url: '/orders',
    body: payload,
  });
  const order = (response as any)?.order;
  return normalizeOrder(order ?? response);
};

export const fetchOrders = async (token: string) => {
  const response = await DefaultService.ordersControllerList();
  const orders = (response.data as { orders?: unknown })?.orders;
  if (!Array.isArray(orders)) {
    return [];
  }
  return orders.map(normalizeOrder);
};

export const fetchCustomerOrders = async (token: string) => {
  const response = await DefaultService.ordersControllerListCustomerOrders();
  const orders = (response.data as { orders?: unknown })?.orders;
  if (!Array.isArray(orders)) {
    return [];
  }
  return orders.map(normalizeOrder);
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus, token: string) => {
  // Pass the order handler
  const response = await __request(OpenAPI, {
    method: 'PATCH',
    url: `/orders/${orderId}/status`,
    body: { status }
  });
  const order = (response as any)?.order ?? response;
  return normalizeOrder(order);
};
