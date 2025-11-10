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
  priceModifier: number;
}

export interface ProductOptionGroup {
  id: string;
  name: string;
  options: ProductOption[];
}

export interface ProductWithOptionGroups {
  id: string;
  name: string;
  basePrice: number;
  optionGroups: ProductOptionGroup[];
}

export interface OrderItemWithSnapshot {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  optionSnapshot: unknown;
}

export interface OrderWithItems {
  id: string;
  userId: string;
  totalAmount: number;
  status: string;
  createdAt: Date;
  notes: string | null;
  deliveryDate: Date | null;
  items: OrderItemWithSnapshot[];
}

export interface CalculatedProductPricing {
  product: ProductWithOptionGroups;
  selectedOptions: ProductOption[];
  unitPrice: number;
}

export interface PreparedOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
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
  };
}
