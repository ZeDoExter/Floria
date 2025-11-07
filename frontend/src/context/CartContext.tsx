import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { mergeCart, CartItemInput, addCartItem, updateCartItemQuantity, removeCartItem } from "../api/cart";
import { useAuth } from "./AuthContext";
import { canPlaceOrders } from "../utils/auth";

type CartItem = CartItemInput & {
  id?: string;
  productName?: string;
  unitPrice?: number;
};

type CartContextValue = {
  cartItems: CartItem[];
  addItem: (item: CartItem) => Promise<void> | void;
  updateQuantity: (productId: string, quantity: number, selectedOptionIds?: string[]) => Promise<void> | void;
  removeItem: (productId: string, selectedOptionIds?: string[]) => Promise<void> | void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const LOCAL_CART_KEY = "flora-tailor/cart";

const optsKey = (productId: string, selectedOptionIds: string[]) =>
  `${productId}|${[...selectedOptionIds].sort().join(",")}`;

export const CartProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { user } = useAuth();
  const latestCartRef = useRef<CartItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_CART_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CartItem[];
        setCartItems(parsed);
      } catch (error) {
        console.warn("Failed to parse stored cart", error);
        localStorage.removeItem(LOCAL_CART_KEY);
      }
    }
  }, []);

  useEffect(() => {
    latestCartRef.current = cartItems;
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    const syncCart = async () => {
      if (!user) return;

      if (!canPlaceOrders(user.role)) {
        if (latestCartRef.current.length > 0) {
          setCartItems([]);
        }
        localStorage.removeItem(LOCAL_CART_KEY);
        try {
          await mergeCart([], user.token);
        } catch (error) {
          console.error("Failed to clear remote cart for store owners", error);
        }
        return;
      }
      try {
        const merged = await mergeCart(
          latestCartRef.current.map(({ productId, quantity, selectedOptionIds }) => ({
            productId,
            quantity,
            selectedOptionIds
          })),
          user.token
        );
        setCartItems(merged);
      } catch (error) {
        console.error("Failed to merge cart", error);
      }
    };
    void syncCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.token, user?.role]);

  const addItem = async (item: CartItem) => {
    if (user && !canPlaceOrders(user.role)) {
      console.warn("Store owners cannot add items to the cart.");
      return;
    }
    if (user) {
      try {
        const updated = await addCartItem(user.token, {
          productId: item.productId,
          quantity: item.quantity,
          selectedOptionIds: item.selectedOptionIds
        });
        setCartItems(updated);
        return;
      } catch (error) {
        console.error("Failed to add remote cart item", error);
      }
    }
    setCartItems((items) => {
      const key = optsKey(item.productId, item.selectedOptionIds);
      const index = items.findIndex((x) => optsKey(x.productId, x.selectedOptionIds) === key);
      if (index >= 0) {
        const copy = [...items];
        const existing = copy[index];
        copy[index] = {
          ...existing,
          quantity: existing.quantity + item.quantity,
          // keep unitPrice/productName from existing or take from new if missing
          unitPrice: existing.unitPrice ?? item.unitPrice,
          productName: existing.productName ?? item.productName
        };
        return copy;
      }
      return [...items, item];
    });
  };

  const updateQuantity = async (productId: string, quantity: number, selectedOptionIds: string[] = []) => {
    if (user) {
      const target = cartItems.find((x) => optsKey(x.productId, x.selectedOptionIds) === optsKey(productId, selectedOptionIds));
      if (target?.id) {
        try {
          const updated = await updateCartItemQuantity(user.token, target.id, quantity);
          setCartItems(updated);
          return;
        } catch (error) {
          console.error("Failed to update remote cart item", error);
        }
      }
    }
    setCartItems((items) =>
      items.map((item) =>
        optsKey(item.productId, item.selectedOptionIds) === optsKey(productId, selectedOptionIds)
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeItem = async (productId: string, selectedOptionIds: string[] = []) => {
    if (user) {
      const target = cartItems.find((x) => optsKey(x.productId, x.selectedOptionIds) === optsKey(productId, selectedOptionIds));
      if (target?.id) {
        try {
          const updated = await removeCartItem(user.token, target.id);
          setCartItems(updated);
          return;
        } catch (error) {
          console.error("Failed to remove remote cart item", error);
        }
      }
    }
    setCartItems((items) => items.filter((item) => optsKey(item.productId, item.selectedOptionIds) !== optsKey(productId, selectedOptionIds)));
  };

  const clearCart = () => setCartItems([]);

  const value = useMemo(
    () => ({ cartItems, addItem, updateQuantity, removeItem, clearCart }),
    [cartItems]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
};