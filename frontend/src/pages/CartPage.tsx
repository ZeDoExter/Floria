import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProductDetail, ProductDetail } from '../api/products';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { canPlaceOrders } from '../utils/auth';

export const CartPage = () => {
  const { items: cartItems, updateQty: updateQuantity, remove: removeItem } = useCartStore();
  const subtotal = cartItems.reduce((total, item) => total + (item.unitPrice ?? 0) * item.quantity, 0);
  const [productDetails, setProductDetails] = useState<Record<string, ProductDetail>>({});
  const { user } = useAuthStore();
  const canOrder = user ? canPlaceOrders(user.role) : true;

  useEffect(() => {
    let isMounted = true;

    const loadDetails = async () => {
      const uniqueProductIds = Array.from(new Set(cartItems.map((item) => item.productId))).filter(Boolean);
      if (uniqueProductIds.length === 0) {
        if (isMounted) {
          setProductDetails({});
        }
        return;
      }

      try {
        const entries = await Promise.all(
          uniqueProductIds.map(async (id) => {
            const detail = await fetchProductDetail(id);
            return [id, detail] as const;
          })
        );
        if (!isMounted) {
          return;
        }
        setProductDetails((current) => {
          const next = { ...current };
          for (const [id, detail] of entries) {
            next[id] = detail;
          }
          return next;
        });
      } catch (error) {
        console.error('Failed to load product details for cart items', error);
      }
    };

    const guardedLoad = async () => {
      await loadDetails();
    };

    void guardedLoad();

    return () => {
      isMounted = false;
    };
  }, [cartItems]);

  const describeSelectedOptions = useMemo(() => {
    return (productId: string, selectedOptionIds: string[]) => {
      if (!selectedOptionIds.length) {
        return 'None selected';
      }

      const detail = productDetails[productId];
      if (!detail) {
        return 'Loading details...';
      }

      const groupsWithSelections = detail.optionGroups
        .map((group) => {
          const options = group.options.filter((option) => selectedOptionIds.includes(option.id));
          if (options.length === 0) {
            return null;
          }
          const optionNames = options.map((option) => option.name).join(', ');
          return `${group.name}: ${optionNames}`;
        })
        .filter((value): value is string => Boolean(value));

      if (groupsWithSelections.length === 0) {
        return 'None selected';
      }

      return groupsWithSelections.join(' | ');
    };
  }, [productDetails]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-card rounded-3xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-foreground">Your cart</h1>
        <p className="text-muted-foreground mt-1">Review your arrangement before checking out.</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="bg-card rounded-2xl shadow-md p-12 text-center space-y-4">
          <div className="text-6xl">🛒</div>
          <p className="text-muted-foreground text-lg">
            Your cart is empty.{' '}
            <Link to="/" className="text-primary font-semibold hover:underline">
              Explore bouquets
            </Link>
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Cart Items */}
          {cartItems.map((item) => (
            <div key={`${item.productId}-${item.selectedOptionIds.join(',')}`} className="bg-card rounded-2xl shadow-md p-6 space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-foreground">{item.productName ?? 'Custom Bouquet'}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {describeSelectedOptions(item.productId, item.selectedOptionIds)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId, item.selectedOptionIds)}
                  className="text-error hover:bg-error/10 p-2 rounded-lg transition-colors"
                  aria-label="Remove item"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-border">
                <div className="flex items-center gap-3">
                  <label htmlFor={`qty-${item.productId}`} className="text-sm font-medium text-foreground">Quantity:</label>
                  <input
                    id={`qty-${item.productId}`}
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.productId, item.selectedOptionIds, Number(e.target.value))}
                    className="w-20 px-3 py-2 rounded-lg border-2 border-border bg-white text-center font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    aria-label="Quantity"
                  />
                </div>
                <p className="text-xl font-bold text-primary">
                  ฿{((item.unitPrice ?? 0) * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}

          {/* Subtotal */}
          <div className="bg-card rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-foreground">Subtotal</span>
              <span className="text-3xl font-bold text-primary">฿{subtotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          {canOrder ? (
            <Link
              to="/checkout"
              className="block w-full bg-primary text-primary-foreground px-6 py-4 rounded-2xl font-bold text-center hover:opacity-90 transition-all shadow-lg text-lg"
            >
              Proceed to checkout
            </Link>
          ) : (
            <div className="bg-error/10 border-l-4 border-error text-error p-4 rounded-lg">
              <p className="font-medium">
                Store owners cannot proceed to checkout. Switch to a customer account to place an order.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

