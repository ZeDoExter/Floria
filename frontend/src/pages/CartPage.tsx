import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export const CartPage = () => {
  const { cartItems, updateQuantity, removeItem } = useCart();
  const subtotal = cartItems.reduce((total, item) => total + (item.unitPrice ?? 0) * item.quantity, 0);

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
                  <p style={{ fontSize: 14, color: '#555' }}>
                    Selected options: {item.selectedOptionIds.join(', ') || 'None'}
                  </p>
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
        </div>
      )}
    </section>
  );
};

