import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { submitOrder } from '../api/orders';
import { canPlaceOrders } from '../utils/auth';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const [notes, setNotes] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(dayjs().add(2, 'day').format('YYYY-MM-DD'));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    return <p>Please log in to complete your purchase.</p>;
  }

  const canOrder = canPlaceOrders(user.role);

  if (!canOrder) {
    return (
      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h1 style={{ fontSize: 28, marginBottom: 4, color: '#c2415c' }}>Checkout</h1>
        <p>Store owners manage customer orders but cannot place new orders from this storefront.</p>
      </section>
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    if (!canOrder) {
      setError('Store owners cannot place orders from their own store.');
      setIsSubmitting(false);
      return;
    }
    try {
      await submitOrder(
        {
          items: cartItems.map(({ productId, quantity, selectedOptionIds }) => ({
            productId,
            quantity,
            selectedOptionIds
          })),
          notes,
          deliveryDate
        },
        user.token
      );
      clearCart();
      navigate('/orders');
    } catch (err) {
      console.error(err);
      setError('We were unable to place your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <header>
        <h1 style={{ fontSize: 28, marginBottom: 4, color: '#c2415c' }}>Checkout</h1>
        <p>Provide delivery preferences for your bespoke bouquet.</p>
      </header>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label style={{ fontSize: 14 }}>
          Delivery date
          <input
            type="date"
            value={deliveryDate}
            onChange={(event) => setDeliveryDate(event.target.value)}
            style={{ marginTop: 4, padding: '6px 8px', width: '100%' }}
          />
        </label>
        <label style={{ fontSize: 14 }}>
          Notes for our florists
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Tell us about the event, preferred colors, or allergens..."
            style={{ marginTop: 4, padding: '6px 8px', width: '100%' }}
            rows={4}
          />
        </label>
        {error && <p style={{ color: '#c2415c' }}>{error}</p>}
        <button type="submit" disabled={isSubmitting || cartItems.length === 0} style={{ background: '#c2415c', color: '#fff', padding: '8px 16px', border: 'none', cursor: 'pointer', opacity: isSubmitting || cartItems.length === 0 ? 0.6 : 1 }}>
          {isSubmitting ? 'Placing order...' : 'Place order'}
        </button>
      </form>
    </section>
  );
};
