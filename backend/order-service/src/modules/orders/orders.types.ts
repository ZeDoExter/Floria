import type { Decimal } from '@prisma/client/runtime/library';
import type { StoreKey } from './roles.js';

export const ORDER_STATUS_VALUES = [
  'PENDING',
  'PLACED',
  'PREPARING',
  'READY_FOR_PICKUP',
  'OUT_FOR_DELIVERY',
  'COMPLETED',
  'CANCELLED'
] as const;

export type OrderStatus = (typeof ORDER_STATUS_VALUES)[number];

export interface ProductOption {
  id: string;
  name: string;
  priceModifier: Decimal;
}

export interface ProductOptionGroup {
  id: string;
  name: string;
  options: ProductOption[];
}

export interface ProductWithOptionGroups {
  id: string;
  name: string;
  basePrice: Decimal;
  storeKey: StoreKey;
  optionGroups: ProductOptionGroup[];
}

export interface OrderItemWithSnapshot {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: Decimal;
  optionSnapshot: unknown;
}

export interface OrderWithItems {
  id: string;
  cognito_user_id: string;
  totalAmount: Decimal;
  status: string;
  storeKey: StoreKey;
  createdAt: Date;
  notes: string | null;
  deliveryDate: Date | null;
  items: OrderItemWithSnapshot[];
}

export interface CalculatedProductPricing {
  product: ProductWithOptionGroups;
  selectedOptions: ProductOption[];
  unitPrice: Decimal;
}

export interface PreparedOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: Decimal;
  optionSnapshot: {
    selectedOptionIds: string[];
    selectedOptions: Array<{
      id: string;
      name: string;
      priceModifier: number;
    }>;
  };
}

export interface SerializedOrderList {
  orders: Array<{
    id: string;
    totalAmount: number;
    status: string;
    createdAt: Date;
    notes: string | null;
    deliveryDate: Date | null;
    storeKey: StoreKey;
    customerId?: string;
    customerEmail?: string | null;
  }>;
}

export interface SerializedOrderDetail {
  order: {
    id: string;
    totalAmount: number;
    status: string;
    createdAt: Date;
    notes: string | null;
    deliveryDate: Date | null;
    storeKey: StoreKey;
  };
}
