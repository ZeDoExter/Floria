import { create } from 'zustand';
import type { Order, OrderStatus } from '../types/domain';
import { orderAdapter } from '../services/adapters/orderAdapter';

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  fetch: (token?: string) => Promise<void>;
  submit: (order: Omit<Order, 'id' | 'createdAt' | 'status'>, token?: string) => Promise<Order>;
  setStatus: (id: string, status: OrderStatus, token?: string) => Promise<Order | undefined>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  isLoading: false,
  fetch: async (token?: string) => {
    set({ isLoading: true });
    try {
      const orders = await orderAdapter.fetch(token);
      set({ orders });
    } finally {
      set({ isLoading: false });
    }
  },
  submit: async (payload, token?: string) => {
    const order = await orderAdapter.submit(payload, token);
    set({ orders: [order, ...get().orders] });
    return order;
  },
  setStatus: async (id, status, token?: string) => {
    const updated = await orderAdapter.setStatus(id, status, token);
    if (!updated) return undefined;
    set({ orders: get().orders.map((o) => (o.id === id ? updated : o)) });
    return updated;
  }
}));
