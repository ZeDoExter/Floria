import { create } from 'zustand';
import type { CartItem, CartItemInput } from '../types/domain';
import { PRODUCTS } from '../mocks/db';

const keyOf = (p: Pick<CartItemInput, 'productId' | 'selectedOptionIds'>) =>
  `${p.productId}|${[...p.selectedOptionIds].sort().join(',')}`;

export type CartState = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (item: CartItemInput) => void;
  updateQty: (productId: string, selectedOptionIds: string[], quantity: number) => void;
  remove: (productId: string, selectedOptionIds: string[]) => void;
  clear: () => void;
};

const calc = (items: CartItem[]) => {
  const count = items.reduce((n, it) => n + it.quantity, 0);
  const subtotal = items.reduce((sum, it) => sum + (it.unitPrice ?? 0) * it.quantity, 0);
  return { count, subtotal };
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  count: 0,
  subtotal: 0,
  add: (input) =>
    set((state) => {
      const product = PRODUCTS.find((p) => p.id === input.productId);
      const unitPrice = (product?.basePrice ?? 0) +
        (product?.optionGroups?.flatMap((g) => g.options).filter((o) => input.selectedOptionIds.includes(o.id)).reduce((a, o) => a + (o.priceModifier || 0), 0) ?? 0);
      const productName = product?.name ?? 'Unknown product';

      const idx = state.items.findIndex((x) => keyOf(x) === keyOf(input));
      let next: CartItem[];
      if (idx >= 0) {
        next = [...state.items];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + input.quantity };
      } else {
        next = [...state.items, { ...input, unitPrice, productName }];
      }
      return { items: next, ...calc(next) };
    }),
  updateQty: (productId, selectedOptionIds, quantity) =>
    set((state) => {
      const next = state.items.map((it) =>
        keyOf(it) === keyOf({ productId, selectedOptionIds }) ? { ...it, quantity } : it
      );
      return { items: next, ...calc(next) };
    }),
  remove: (productId, selectedOptionIds) =>
    set((state) => {
      const next = state.items.filter((it) => keyOf(it) !== keyOf({ productId, selectedOptionIds }));
      return { items: next, ...calc(next) };
    }),
  clear: () => set({ items: [], count: 0, subtotal: 0 })
}));
