import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchRemoteCart, CartItemInput, addCartItem, updateCartItemQuantity, removeCartItem } from "../api/cart";
import { useAuth } from "./AuthContext";
import { canPlaceOrders } from "../utils/auth";

type CartItem = CartItemInput & {
  id?: string;
  productName?: string;
  unitPrice?: number;
};

type CartContextValue = {
  cartItems: CartItem[];
  addItem: (item: CartItem) => Promise<void>;
  updateQuantity: (productId: string, quantity: number, selectedOptionIds?: string[]) => Promise<void>;
  removeItem: (productId: string, selectedOptionIds?: string[]) => Promise<void>;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const optsKey = (productId: string, selectedOptionIds: string[]) =>
  `${productId}|${[...selectedOptionIds].sort().join(",")}`;

export const CartProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { user } = useAuth();

  // Fetch cart from database when user logs in
  useEffect(() => {
    if (!user) {
      setCartItems([]);
      return;
    }

    if (!canPlaceOrders(user.role)) {
      setCartItems([]);
      return;
    }

    fetchRemoteCart(user.token)
      .then((remoteCart) => {
        setCartItems(remoteCart);
      })
      .catch(() => {
        setCartItems([]);
      });
  }, [user]);

  const addItem = async (item: CartItem) => {
    if (!user) {
      throw new Error("กรุณา login ก่อนเพิ่มสินค้าลงตะกร้า");
    }

    if (!canPlaceOrders(user.role)) {
      throw new Error("เจ้าของร้านไม่สามารถสั่งซื้อสินค้าได้");
    }

    try {
      const updated = await addCartItem(user.token, {
        productId: item.productId,
        quantity: item.quantity,
        selectedOptionIds: item.selectedOptionIds,
        unitPrice: item.unitPrice
      });
      setCartItems(updated);
    } catch (error) {
      throw new Error("ไม่สามารถเพิ่มสินค้าลงตะกร้าได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  const updateQuantity = async (productId: string, quantity: number, selectedOptionIds: string[] = []) => {
    if (!user) {
      throw new Error("กรุณา login ก่อนแก้ไขตะกร้า");
    }

    const target = cartItems.find((x) => optsKey(x.productId, x.selectedOptionIds) === optsKey(productId, selectedOptionIds));
    if (!target?.id) {
      throw new Error("ไม่พบสินค้าในตะกร้า");
    }

    try {
      const updated = await updateCartItemQuantity(user.token, target.id, quantity);
      setCartItems(updated);
    } catch (error) {
      throw new Error("ไม่สามารถแก้ไขจำนวนสินค้าได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  const removeItem = async (productId: string, selectedOptionIds: string[] = []) => {
    if (!user) {
      throw new Error("กรุณา login ก่อนแก้ไขตะกร้า");
    }

    const target = cartItems.find((x) => optsKey(x.productId, x.selectedOptionIds) === optsKey(productId, selectedOptionIds));
    if (!target?.id) {
      throw new Error("ไม่พบสินค้าในตะกร้า");
    }

    try {
      const updated = await removeCartItem(user.token, target.id);
      setCartItems(updated);
    } catch (error) {
      throw new Error("ไม่สามารถลบสินค้าออกจากตะกร้าได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  const clearCart = () => setCartItems([]);

  const value = useMemo(
    () => ({ cartItems, addItem, updateQuantity, removeItem, clearCart }),
    [cartItems, user]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
};