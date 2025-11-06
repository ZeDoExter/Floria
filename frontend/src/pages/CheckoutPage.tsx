import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { submitOrder } from '../api/orders';

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
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
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-rose-600">Checkout</h1>
        <p className="text-slate-600">Provide delivery preferences for your bespoke bouquet.</p>
      </header>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm">
          Delivery date
          <input
            type="date"
            value={deliveryDate}
            onChange={(event) => setDeliveryDate(event.target.value)}
            className="mt-1 w-full rounded border border-rose-100 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Notes for our florists
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Tell us about the event, preferred colors, or allergens..."
            className="mt-1 w-full rounded border border-rose-100 px-3 py-2"
            rows={4}
          />
        </label>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting || cartItems.length === 0}
          className="rounded bg-rose-500 px-6 py-2 font-semibold text-white disabled:opacity-50"
        >
          {isSubmitting ? 'Placing order...' : 'Place order'}
        </button>
      </form>
    </section>
  );
};
