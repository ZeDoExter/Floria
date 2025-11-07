import type { Decimal } from '@prisma/client/runtime/library';

export interface ProductOption {
  id: string;
  priceModifier: Decimal;
}

export interface OptionGroupWithOptions {
  id: string;
  options?: ProductOption[];
}

export interface ProductWithOptionGroups {
  id: string;
  basePrice: Decimal | number;
  optionGroups?: OptionGroupWithOptions[];
}

export interface CartItemWithProduct {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  selectedOptionIds: string[];
  unitPrice: Decimal;
  product: {
    id: string;
    name: string;
  };
}

export interface CartWithItemsAndProduct {
  id: string;
  cognito_user_id: string | null;
  anonymousId: string | null;
  items?: CartItemWithProduct[];
}

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
