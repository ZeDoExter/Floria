import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export const OrderSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div
        className={`max-w-md w-full text-center transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Success Icon */}
        <div className="relative inline-block mb-6">
          <div className="w-24 h-24 rounded-full bg-primary-light border-4 border-primary flex items-center justify-center mx-auto">
            <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold font-heading text-foreground mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>
          Payment Successful
        </h1>
        <p className="text-muted-foreground mb-2 text-sm leading-relaxed">
          Your order has been placed and confirmed. Our florists are getting your arrangement ready.
        </p>

        {orderId && (
          <p className="text-muted-foreground bg-muted rounded-full px-4 py-2 inline-block mb-6 text-sm"
            style={{ fontFamily: "'DM Serif Display', serif" }}>
            Order #{orderId.slice(0, 8)}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-6">
          <Link
            to="/orders"
            className="w-full bg-primary text-primary-foreground py-3.5 rounded-full font-bold text-sm hover:bg-secondary transition-all duration-200 shadow-soft hover:shadow-soft-lg text-center"
          >
            View My Orders
          </Link>
          <Link
            to="/"
            className="w-full bg-transparent border border-border text-foreground py-3.5 rounded-full font-bold text-sm hover:bg-accent transition-all duration-200 text-center"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
};
