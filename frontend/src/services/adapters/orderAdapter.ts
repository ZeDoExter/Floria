import type { Order, OrderStatus } from '../../types/domain';
import { ORDERS } from '../../mocks/db';
import { submitOrder as submitOrderReal, fetchOrders as fetchOrdersReal, updateOrderStatus as updateOrderStatusReal, type OrderResponse } from '../../api/orders';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_ORDERS === 'true';

// ============ MOCK IMPLEMENTATIONS ============
async function fetchOrdersMock(): Promise<Order[]> {
  await new Promise((r) => setTimeout(r, 120));
  return [...ORDERS];
}

async function submitOrderMock(order: Omit<Order, 'id' | 'createdAt' | 'status'>): Promise<Order> {
  await new Promise((r) => setTimeout(r, 150));
  const total = order.items.reduce((sum: number, it: { unitPrice: number; quantity: number }) => sum + it.unitPrice * it.quantity, 0);
  const created: Order = {
    ...order,
    id: `ord_${Math.random().toString(36).slice(2, 10)}`,
    createdAt: new Date().toISOString(),
    status: 'PLACED',
    totalAmount: total
  };
  ORDERS.unshift(created);
  return created;
}

async function updateOrderStatusMock(id: string, status: OrderStatus): Promise<Order | undefined> {
  await new Promise((r) => setTimeout(r, 120));
  const idx = ORDERS.findIndex((o: Order) => o.id === id);
  if (idx < 0) return undefined;
  ORDERS[idx] = { ...ORDERS[idx], status };
  return ORDERS[idx];
}

// ============ ADAPTER ============
// Map a backend OrderResponse into our domain Order shape.
function toDomain(resp: OrderResponse, fallbackItems?: Order['items'], notes?: string): Order {
  return {
    id: resp.id,
    items: fallbackItems ?? [],
    totalAmount: resp.totalAmount,
    status: resp.status,
    createdAt: resp.createdAt,
    storeKey: resp.storeKey,
    customerEmail: resp.customerEmail ?? null,
    notes
  } as Order;
}

export const orderAdapter = {
  mode: () => (USE_MOCK ? 'mock' : 'real') as 'mock' | 'real',
  fetch: async (token?: string): Promise<Order[]> => {
    if (USE_MOCK) return fetchOrdersMock();
    const list = await fetchOrdersReal(token!); // OrderResponse[]
    return list.map((r: OrderResponse) => toDomain(r));
  },
  submit: async (order: Omit<Order, 'id' | 'createdAt' | 'status'>, token?: string): Promise<Order> => {
    if (USE_MOCK) return submitOrderMock(order);
    const resp = await submitOrderReal(
      {
        items: order.items.map(({ productId, quantity, selectedOptionIds }: { productId: string; quantity: number; selectedOptionIds: string[] }) => ({
          productId,
          quantity,
          selectedOptionIds
        })),
        notes: order.notes
      } as any,
      token!
    );
    // Preserve client-side item detail (unitPrice/productName) until backend supports returning them.
    return toDomain(resp, order.items, order.notes);
  },
  setStatus: async (id: string, status: OrderStatus, token?: string): Promise<Order | undefined> => {
    if (USE_MOCK) return updateOrderStatusMock(id, status);
    const resp = await updateOrderStatusReal(id, status, token!);
    // We don't have item detail from backend on status update; find existing to keep items.
    const existing = ORDERS.find((o: Order) => o.id === id);
    return toDomain(resp, existing?.items);
  }
};
