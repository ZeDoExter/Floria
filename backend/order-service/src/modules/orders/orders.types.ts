import type { Prisma } from '@prisma/client';
import type { Decimal } from '@prisma/client/runtime/library';

export type ProductWithOptionGroups = Prisma.ProductGetPayload<{
  include: {
    optionGroups: {
      include: {
        options: true;
      };
    };
  };
}>;

export type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    items: true;
  };
}>;

export type ProductOption = ProductWithOptionGroups['optionGroups'][number]['options'][number];

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
