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

  const subtotal = cartItems.reduce((total, item) => total + (item.unitPrice ?? 0) * item.quantity, 0);
  const shipping = cartItems.length > 0 ? 8 : 0;
  const total = subtotal + shipping;

  if (!user) {
    return (
      <main className="min-h-screen bg-background px-4 py-8 md:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-light italic text-foreground">Checkout</h1>
            <p className="text-muted-foreground">Please log in to complete your purchase</p>
          </div>
        </div>
      </main>
    );
  }

  const canOrder = canPlaceOrders(user.role);

  if (!canOrder) {
    return (
      <main className="min-h-screen bg-background px-4 py-8 md:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-light italic text-foreground">Checkout</h1>
            <p className="text-muted-foreground">Store owners manage customer orders but cannot place new orders</p>
          </div>
        </div>
      </main>
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
    <main className="min-h-screen bg-background px-4 py-8 md:px-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-light italic text-foreground">Checkout</h1>
          <p className="text-muted-foreground">Provide delivery preferences for your arrangement</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Checkout Form Card */}
          <div className="rounded-lg bg-card p-6 border border-border">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Delivery Date
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(event) => setDeliveryDate(event.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Notes for our florists
                </label>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Tell us about the event, preferred colors, or allergens..."
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={4}
                />
              </div>

              {error && (
                <div className="bg-error/10 border border-error rounded-lg p-3">
                  <p className="text-sm text-error">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Card */}
          <div className="rounded-lg bg-card p-4 border border-border space-y-3">
            <h2 className="font-semibold text-foreground">Order Summary</h2>
            <div className="flex justify-between text-sm text-foreground">
              <span>Subtotal ({cartItems.length} items)</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-foreground">
              <span>Shipping</span>
              <span>${shipping.toFixed(2)}</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-semibold text-primary">${total.toFixed(2)}</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || cartItems.length === 0}
              className="w-full mt-4 bg-primary text-primary-foreground py-2 rounded-lg font-medium text-sm hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Placing order...' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};
