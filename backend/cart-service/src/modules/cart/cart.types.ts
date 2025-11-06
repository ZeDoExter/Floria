import type { Product, OptionGroup, Option, Cart, CartItem } from '@prisma/client';

export type ProductWithOptionGroups = Product & {
  optionGroups?: (OptionGroup & { options?: Option[] })[];
};

export type CartWithItemsAndProduct = Cart & {
  items?: (CartItem & { product?: Product })[];
};

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
