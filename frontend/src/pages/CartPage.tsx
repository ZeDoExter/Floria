import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProductDetail, ProductDetail } from '../api/products';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { canPlaceOrders } from '../utils/auth';

export const CartPage: React.FC = () => {
  const { cartItems, updateQuantity, removeItem } = useCart();
  const subtotal = cartItems.reduce(
    (total, item) => total + (item.unitPrice ?? 0) * item.quantity,
    0
  );
  const [productDetails, setProductDetails] = useState<
    Record<string, ProductDetail>
  >({});
  const { user } = useAuth();
  const canOrder = user ? canPlaceOrders(user.role) : true;

  useEffect(() => {
    let isMounted = true;

    const loadDetails = async () => {
      const uniqueProductIds = Array.from(
        new Set(cartItems.map((item) => item.productId))
      ).filter(Boolean) as string[];

      if (uniqueProductIds.length === 0) {
        if (isMounted) setProductDetails({});
        return;
      }

      try {
        const entries = await Promise.all(
          uniqueProductIds.map(async (id) => {
            const detail = await fetchProductDetail(id);
            return [id, detail] as const;
          })
        );
        if (!isMounted) return;

        setProductDetails((current) => {
          const next = { ...current };
          for (const [id, detail] of entries) next[id] = detail;
          return next;
        });
      } catch (error) {
        console.error("Failed to load product details for cart items", error);
      }
    };

    void loadDetails();
    return () => {
      isMounted = false;
    };
  }, [cartItems]);

  const describeSelectedOptions = useMemo(() => {
    return (productId: string, selectedOptionIds: string[]) => {
      if (!selectedOptionIds.length) return "None selected";

      const detail = productDetails[productId];
      if (!detail) return "Loading details...";

      const groupsWithSelections = detail.optionGroups
        .map((group) => {
          const options = group.options.filter((o) =>
            selectedOptionIds.includes(o.id)
          );
          if (options.length === 0) return null;
          const optionNames = options.map((o) => o.name).join(", ");
          return `${group.name}: ${optionNames}`;
        })
        .filter((v): v is string => Boolean(v));

      if (groupsWithSelections.length === 0) return "None selected";
      return groupsWithSelections.join(" | ");
    };
  }, [productDetails]);

  return (
    <section className="flex flex-col gap-4">
      {/* Header */}
      <header>
        <h1 className="text-[28px] mb-1 text-rose-600 font-semibold">Your cart</h1>
        <p className="text-slate-600">Review your arrangement before checking out.</p>
      </header>

      {/* Empty cart */}
      {cartItems.length === 0 ? (
        <p className="text-slate-700">
          Your cart is empty.{" "}
          <Link to="/" className="text-rose-600 hover:text-rose-700 underline underline-offset-2">
            Explore bouquets
          </Link>
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Items */}
          {cartItems.map((item) => (
            <div
              key={item.productId + (item.selectedOptionIds?.join("|") ?? "")}
              className="border border-slate-200 bg-white rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">
                    {item.productName ?? "Custom Bouquet"}
                  </p>
                  <p className="text-sm text-slate-600">
                    Selected options:{" "}
                    {describeSelectedOptions(item.productId, item.selectedOptionIds)}
                  </p>
                </div>
                <button
                  type="button"
                  className="text-rose-600 hover:text-rose-700 text-sm font-medium"
                  onClick={() => removeItem(item.productId, item.selectedOptionIds)}
                >
                  Remove
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <label className="text-sm text-slate-800 flex items-center">
                  Quantity
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(
                        item.productId,
                        Number(e.target.value),
                        item.selectedOptionIds
                      )
                    }
                    className="ml-2 w-20 rounded-md border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
                  />
                </label>
                <p className="font-semibold text-slate-900">
                  ${((item.unitPrice ?? 0) * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}

          {/* Subtotal */}
          <div className="flex items-center justify-between border-t border-slate-200 pt-3">
            <p className="text-lg font-semibold text-slate-900">Subtotal</p>
            <p className="text-lg font-semibold text-rose-600">
              ${subtotal.toFixed(2)}
            </p>
          </div>

          {/* CTA */}
          {canOrder ? (
            <Link
              to="/checkout"
              className="inline-block text-center bg-rose-600 text-white px-4 py-2 rounded-md font-medium hover:bg-rose-700 transition"
            >
              Proceed to checkout
            </Link>
          ) : (
            <p className="text-rose-600 text-sm">
              Store owners cannot proceed to checkout. Switch to a customer account to
              place an order.
            </p>
          )}
        </div>
      )}
    </section>
  );
};
