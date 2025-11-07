import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchOrders, OrderResponse } from '../api/orders';

export const OrderHistoryPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchOrders(user.token);
        setOrders(response);
      } catch (err) {
        setError('Unable to load your order history.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [user]);

  if (!user) {
    return <p>Please sign in to view your order history.</p>;
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-rose-600">Order history</h1>
        <p className="text-slate-600">Track your previous bespoke creations.</p>
      </header>
      {isLoading && <p>Loading orders...</p>}
      {error && <p className="text-rose-600">{error}</p>}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <p className="text-sm text-slate-500">You have not placed any orders yet.</p>
        ) : (
          orders.map((order) => (
            <article key={order.id} className="rounded border border-rose-100 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-700">Order #{order.id}</p>
                <p className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-slate-500">Status: {order.status}</span>
                <span className="text-lg font-semibold text-rose-600">${order.totalAmount.toFixed(2)}</span>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
};
