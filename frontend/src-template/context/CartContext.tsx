import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { mergeCart, CartItemInput } from '../api/cart';
import { useAuth } from './AuthContext';

type CartItem = CartItemInput & {
  id?: string;
  productName?: string;
  unitPrice?: number;
};

type CartContextValue = {
  cartItems: CartItem[];
  addItem: (item: CartItemInput) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const LOCAL_CART_KEY = 'flora-tailor/cart';

export const CartProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_CART_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CartItem[];
        setCartItems(parsed);
      } catch (error) {
        console.warn('Failed to parse stored cart', error);
        localStorage.removeItem(LOCAL_CART_KEY);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    const syncCart = async () => {
      if (!user) {
        return;
      }
      try {
        const merged = await mergeCart(
          cartItems.map(({ productId, quantity, selectedOptionIds }) => ({
            productId,
            quantity,
            selectedOptionIds
          })),
          user.token
        );
        setCartItems(merged);
      } catch (error) {
        console.error('Failed to merge cart', error);
      }
    };

    void syncCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.token]);

  const addItem = (item: CartItemInput) => {
    setCartItems((items) => {
      const existing = items.find((x) => x.productId === item.productId);
      if (existing) {
        return items.map((x) =>
          x.productId === item.productId
            ? { ...x, quantity: x.quantity + item.quantity, selectedOptionIds: item.selectedOptionIds }
            : x
        );
      }
      return [...items, item];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCartItems((items) => items.map((item) => (item.productId === productId ? { ...item, quantity } : item)));
  };

  const removeItem = (productId: string) => {
    setCartItems((items) => items.filter((item) => item.productId !== productId));
  };

  const clearCart = () => setCartItems([]);

  const value = useMemo(
    () => ({
      cartItems,
      addItem,
      updateQuantity,
      removeItem,
      clearCart
    }),
    [cartItems]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
};
