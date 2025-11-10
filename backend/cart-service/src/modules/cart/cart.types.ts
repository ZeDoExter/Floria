export interface ProductOption {
  id: string;
  priceModifier: number;
}

export interface OptionGroupWithOptions {
  id: string;
  options?: ProductOption[];
}

export interface ProductWithOptionGroups {
  id: string;
  basePrice: number;
  optionGroups?: OptionGroupWithOptions[];
}

export interface CartItemWithProduct {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  selectedOptionIds: string[];
  unitPrice: number;
  product: {
    id: string;
    name: string;
  };
}

export interface CartWithItemsAndProduct {
  id: string;
  userId: string | null;
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
  userId?: string | null;
  anonymousId?: string | null;
  items: SerializedCartItem[];
}
