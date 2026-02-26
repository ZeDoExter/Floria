import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { fetchRemoteCart, mergeCart, CartItemInput, addCartItem, updateCartItemQuantity, removeCartItem } from "../api/cart";
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

const GUEST_CART_KEY = "floria/guest-cart";

const optsKey = (productId: string, selectedOptionIds: string[]) =>
  `${productId}|${[...selectedOptionIds].sort().join(",")}`;

const loadGuestCart = (): CartItem[] => {
  try {
    const s = localStorage.getItem(GUEST_CART_KEY);
    return s ? (JSON.parse(s) as CartItem[]) : [];
  } catch {
    return [];
  }
};

const saveGuestCart = (items: CartItem[]) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
};

export const CartProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { user } = useAuth();
  const prevUserIdRef = useRef<string | null>(null);

  // Sync cart when auth state changes
  useEffect(() => {
    const prevUserId = prevUserIdRef.current;
    const currentUserId = user?.userId ?? null;
    prevUserIdRef.current = currentUserId;

    if (!user) {
      // Logged out — load from localStorage
      setCartItems(loadGuestCart());
      return;
    }

    if (!canPlaceOrders(user.role)) {
      setCartItems([]);
      return;
    }

    // User just logged in (was previously unauthenticated)
    const justLoggedIn = prevUserId === null && currentUserId !== null;
    const guestItems = loadGuestCart();
    localStorage.removeItem(GUEST_CART_KEY);

    const syncCart = async () => {
      try {
        if (justLoggedIn && guestItems.length > 0) {
          // Merge guest items into server cart
          const merged = await mergeCart(guestItems, user.token);
          setCartItems(merged);
        } else {
          // Just refetch server cart normally
          const remote = await fetchRemoteCart(user.token);
          setCartItems(remote);
        }
      } catch {
        // If server fails, fall back to guest items
        setCartItems(guestItems.length > 0 ? guestItems : []);
      }
    };

    void syncCart();
  }, [user]);

  const addItem = useCallback(async (item: CartItem) => {
    if (!user) {
      // Guest mode — persist in localStorage
      setCartItems((prev) => {
        const key = optsKey(item.productId, item.selectedOptionIds);
        const existing = prev.find((x) => optsKey(x.productId, x.selectedOptionIds) === key);
        const next = existing
          ? prev.map((x) =>
              optsKey(x.productId, x.selectedOptionIds) === key
                ? { ...x, quantity: x.quantity + item.quantity }
                : x
            )
          : [...prev, { ...item, id: `guest-${Date.now()}` }];
        saveGuestCart(next);
        return next;
      });
      return;
    }

    if (!canPlaceOrders(user.role)) {
      throw new Error("เจ้าของร้านไม่สามารถสั่งซื้อสินค้าได้");
    }

    try {
      const updated = await addCartItem(user.token, {
        productId: item.productId,
        quantity: item.quantity,
        selectedOptionIds: item.selectedOptionIds,
        unitPrice: item.unitPrice,
      });
      setCartItems(updated);
    } catch {
      throw new Error("ไม่สามารถเพิ่มสินค้าลงตะกร้าได้ กรุณาลองใหม่อีกครั้ง");
    }
  }, [user]);

  const removeItem = useCallback(async (productId: string, selectedOptionIds: string[] = []) => {
    if (!user) {
      // Guest mode
      setCartItems((prev) => {
        const key = optsKey(productId, selectedOptionIds);
        const next = prev.filter((x) => optsKey(x.productId, x.selectedOptionIds) !== key);
        saveGuestCart(next);
        return next;
      });
      return;
    }

    setCartItems((prev) => {
      const target = prev.find(
        (x) => optsKey(x.productId, x.selectedOptionIds) === optsKey(productId, selectedOptionIds)
      );
      if (!target?.id) return prev;

      removeCartItem(user.token, target.id)
        .then((updated) => setCartItems(updated))
        .catch(() => { throw new Error("ไม่สามารถลบสินค้าออกจากตะกร้าได้ กรุณาลองใหม่อีกครั้ง"); });

      return prev; // Optimistic: keep as-is until API responds
    });
  }, [user]);

  const updateQuantity = useCallback(async (productId: string, quantity: number, selectedOptionIds: string[] = []) => {
    if (!user) {
      // Guest mode
      setCartItems((prev) => {
        const key = optsKey(productId, selectedOptionIds);
        const next =
          quantity <= 0
            ? prev.filter((x) => optsKey(x.productId, x.selectedOptionIds) !== key)
            : prev.map((x) =>
                optsKey(x.productId, x.selectedOptionIds) === key ? { ...x, quantity } : x
              );
        saveGuestCart(next);
        return next;
      });
      return;
    }

    if (quantity <= 0) {
      return removeItem(productId, selectedOptionIds);
    }

    setCartItems((prev) => {
      const target = prev.find(
        (x) => optsKey(x.productId, x.selectedOptionIds) === optsKey(productId, selectedOptionIds)
      );
      if (!target?.id) return prev;

      updateCartItemQuantity(user.token, target.id, quantity)
        .then((updated) => setCartItems(updated))
        .catch(() => { throw new Error("ไม่สามารถแก้ไขจำนวนสินค้าได้ กรุณาลองใหม่อีกครั้ง"); });

      // Optimistic update
      return prev.map((x) =>
        optsKey(x.productId, x.selectedOptionIds) === optsKey(productId, selectedOptionIds)
          ? { ...x, quantity }
          : x
      );
    });
  }, [user, removeItem]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem(GUEST_CART_KEY);
  }, []);

  const value = useMemo(
    () => ({ cartItems, addItem, updateQuantity, removeItem, clearCart }),
    [cartItems, addItem, updateQuantity, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
};