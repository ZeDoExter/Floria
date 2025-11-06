import type { Prisma } from '@prisma/client';

export type ProductWithOptionGroups = Prisma.ProductGetPayload<{
  include: {
    optionGroups: {
      include: {
        options: true;
      };
    };
  };
}>;

export type CartWithItemsAndProduct = Prisma.CartGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
  };
}>;

export type CartItemWithProduct = CartWithItemsAndProduct['items'][number];

export interface SerializedCartItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  selectedOptionIds: string[];
  unitPrice: number;
}

export interface SerializedCart {
  id?: string;
  cognito_user_id?: string | null;
  anonymousId?: string | null;
  items: SerializedCartItem[];
}
