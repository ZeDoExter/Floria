import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProductDetail, ProductDetail } from '../api/products';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { canPlaceOrders } from '../utils/auth';

export const CartPage = () => {
  const { cartItems, updateQuantity, removeItem } = useCart();
  const subtotal = cartItems.reduce((total, item) => total + (item.unitPrice ?? 0) * item.quantity, 0);
  const [productDetails, setProductDetails] = useState<Record<string, ProductDetail>>({});
  const { user } = useAuth();
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
    <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <header>
        <h1 style={{ fontSize: 28, marginBottom: 4, color: '#c2415c' }}>Your cart</h1>
        <p>Review your arrangement before checking out.</p>
      </header>
      {cartItems.length === 0 ? (
        <p>
          Your cart is empty.{' '}
          <Link to="/" style={{ color: '#c2415c' }}>
            Explore bouquets
          </Link>
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {cartItems.map((item) => (
            <div key={item.productId} style={{ border: '1px solid #eee', background: '#fff', padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <p style={{ fontWeight: 600 }}>{item.productName ?? 'Custom Bouquet'}</p>
                  <p style={{ fontSize: 14, color: '#555' }}>Selected options: {describeSelectedOptions(item.productId, item.selectedOptionIds)}</p>
                </div>
                <button type="button" style={{ color: '#c2415c', cursor: 'pointer' }} onClick={() => removeItem(item.productId, item.selectedOptionIds)}>
                  Remove
                </button>
              </div>
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: 14 }}>
                  Quantity
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(event) => updateQuantity(item.productId, Number(event.target.value), item.selectedOptionIds)}
                    style={{ marginLeft: 8, width: 80, padding: '4px 8px' }}
                  />
                </label>
                <p style={{ fontWeight: 600 }}>${((item.unitPrice ?? 0) * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', paddingTop: 12 }}>
            <p style={{ fontSize: 18, fontWeight: 600 }}>Subtotal</p>
            <p style={{ fontSize: 18, fontWeight: 600, color: '#c2415c' }}>${subtotal.toFixed(2)}</p>
          </div>
          {canOrder ? (
            <Link
              to="/checkout"
              style={{
                display: 'inline-block',
                textAlign: 'center',
                background: '#c2415c',
                color: '#fff',
                padding: '8px 16px',
                textDecoration: 'none'
              }}
            >
              Proceed to checkout
            </Link>
          ) : (
            <p style={{ color: '#c2415c', fontSize: 14 }}>
              Store owners cannot proceed to checkout. Switch to a customer account to place an order.
            </p>
          )}
        </div>
      )}
    </section>
  );
};

