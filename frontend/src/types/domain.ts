// Domain types shared across stores and mocks
// Keep aligned with existing API types in src/api/*

export type UserRole = 'owner' | 'admin' | 'customer';

export type StoreKey = 'flagship' | 'weekend-market';

export type Category = {
  id: string;
  name: string;
  description?: string;
};

export type ProductOption = {
  id: string;
  name: string;
  description?: string;
  priceModifier: number; // delta added to basePrice
};

export type ProductOptionGroup = {
  id: string;
  name: string;
  description?: string;
  isRequired: boolean;
  minSelect: number;
  maxSelect: number;
  options: ProductOption[];
};

export type ProductSummary = {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  imageUrl?: string;
  categoryId?: string;
  categoryName?: string;
  storeKey: StoreKey;
};

export type ProductDetail = ProductSummary & {
  category?: Category;
  optionGroups: ProductOptionGroup[];
};

export type CartItemInput = {
  productId: string;
  quantity: number;
  selectedOptionIds: string[];
};

export type CartItem = CartItemInput & {
  id?: string;
  unitPrice?: number;
  productName?: string;
};

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

export type Order = {
  id: string;
  items: Array<{
    productId: string;
    quantity: number;
    selectedOptionIds: string[];
    unitPrice: number;
    productName: string;
  }>;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string; // ISO string
  storeKey: StoreKey;
  customerEmail?: string | null;
  notes?: string;
};
