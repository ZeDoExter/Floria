import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { submitOrder } from '../api/orders';
import { createStripeCheckoutSession } from '../api/payment';
import { canPlaceOrders } from '../utils/auth';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const [notes, setNotes] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(dayjs().add(2, 'day').format('YYYY-MM-DD'));
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'form' | 'redirecting'>('form');

  const subtotal = cartItems.reduce((total, item) => total + (item.unitPrice ?? 0) * item.quantity, 0);
  const shipping = cartItems.length > 0 ? 8 : 0;
  const total = subtotal + shipping;

  if (!user) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-card border border-border rounded-2xl p-10 text-center max-w-sm w-full shadow-card animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c0657a" strokeWidth="1.5" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Sign in to checkout</h2>
          <p className="text-sm text-muted-foreground mb-6">You need to be logged in to place an order.</p>
          <Link
            to="/login"
            className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold text-sm hover:bg-secondary transition-all shadow-soft"
          >
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  if (!canPlaceOrders(user.role)) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-card border border-border rounded-2xl p-10 text-center max-w-sm w-full shadow-card">
          <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c0657a" strokeWidth="1.5" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Owners can't place orders</h2>
          <p className="text-sm text-muted-foreground">Switch to a customer account to purchase flowers.</p>
        </div>
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-card border border-border rounded-2xl p-10 text-center max-w-sm w-full shadow-card">
          <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c0657a" strokeWidth="1.5" aria-hidden="true">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Your cart is empty</h2>
          <Link to="/" className="inline-block mt-4 bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold text-sm hover:bg-secondary transition-all shadow-soft">
            Browse Flowers
          </Link>
        </div>
      </main>
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setStep('redirecting');

    try {
      // Step 1: Place the order
      const order = await submitOrder(
        {
          items: cartItems.map(({ productId, quantity, selectedOptionIds }) => ({
            productId,
            quantity,
            selectedOptionIds,
          })),
          notes,
          deliveryDate,
        },
        user.token
      );

      const orderId = order?.id;
      if (!orderId) throw new Error('Order was created but no ID was returned');

      clearCart();

      // Step 2: Create Stripe Checkout Session and redirect
      try {
        const session = await createStripeCheckoutSession({
          orderId,
          items: cartItems.map((item) => ({
            productName: item.productName ?? 'Flower Arrangement',
            unitPrice: item.unitPrice ?? 0,
            quantity: item.quantity,
          })),
        });

        if (session.url) {
          window.location.href = session.url;
          return;
        }
      } catch (stripeErr) {
        // Stripe session creation failed — order is placed, redirect to success anyway
        console.warn('Stripe session creation failed, falling back', stripeErr);
      }

      // Fallback: no Stripe URL — go to order history
      navigate(`/checkout/success?orderId=${orderId}`);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'We were unable to place your order. Please try again.');
      setStep('form');
    }
  };

  if (step === 'redirecting') {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-4 animate-pulse-soft">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c0657a" strokeWidth="1.5" aria-hidden="true">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Redirecting to payment...</h2>
          <p className="text-sm text-muted-foreground">Please wait while we prepare your checkout.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 md:py-12">
      <div className="mx-auto max-w-2xl animate-fade-in-up">
        {/* Header */}
        <div className="mb-8">
          <Link to="/cart" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
            ← Back to Cart
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-foreground mt-3" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>
            Checkout
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Review your order, then pay securely with Stripe</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Order Items */}
          <div className="rounded-2xl bg-card border border-border shadow-card p-5 space-y-3">
            <h2 className="text-lg italic text-foreground mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Order Summary</h2>
            {cartItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-0">
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">{item.productName ?? 'Arrangement'}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="font-bold text-sm text-primary whitespace-nowrap">
                  ฿{((item.unitPrice ?? 0) * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
            <div className="space-y-1 pt-2">
              <div className="flex justify-between text-sm text-foreground">
                <span>Subtotal</span>
                <span className="font-semibold">฿{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-foreground">
                <span>Shipping</span>
                <span className="font-semibold">฿{shipping.toFixed(2)}</span>
              </div>
              <div className="border-t-2 border-border pt-2 flex justify-between">
                <span className="font-bold text-foreground">Total</span>
                <span className="font-bold text-primary text-lg" style={{ fontFamily: "'DM Serif Display', serif" }}>฿{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="rounded-2xl bg-card border border-border shadow-card p-5 space-y-4">
            <h2 className="text-lg italic text-foreground mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Delivery Details</h2>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Delivery Date</label>
              <input
                type="date"
                value={deliveryDate}
                min={dayjs().add(1, 'day').format('YYYY-MM-DD')}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Notes for our florists</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. preferred colors, occasion, allergens..."
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:outline-none focus:border-primary resize-none transition-colors"
                rows={3}
              />
            </div>
          </div>

          {error && (
            <div className="bg-error/10 border border-error/20 rounded-2xl p-4 animate-fade-in">
              <p className="text-sm text-error font-medium">{error}</p>
            </div>
          )}

          {/* Stripe Pay Button */}
          <button
            type="submit"
            className="w-full py-4 rounded-full font-bold text-base bg-primary text-primary-foreground hover:bg-secondary transition-all duration-200 shadow-soft hover:shadow-soft-lg flex items-center justify-center gap-3"
          >
            <span>Pay ฿{total.toFixed(2)} with Stripe</span>
          </button>

          <p className="text-center text-xs text-muted-foreground">
            You'll be redirected to Stripe's secure checkout page
          </p>
        </form>
      </div>
    </main>
  );
};
