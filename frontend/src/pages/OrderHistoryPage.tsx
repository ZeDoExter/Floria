import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchOrders, ORDER_STATUS_OPTIONS, updateOrderStatus } from '../api/orders';
import type { OrderResponse, OrderStatus } from '../api/orders';
import { canReviewCustomerOrders } from '../utils/auth';

export const OrderHistoryPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const isOwner = user ? canReviewCustomerOrders(user.role) : false;



  const statusLabels: Record<OrderStatus, string> = {
    PENDING: 'Pending',
    PLACED: 'Placed',
    PREPARING: 'Preparing',
    READY_FOR_PICKUP: 'Ready for pickup',
    OUT_FOR_DELIVERY: 'Out for delivery',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled'
  };

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

  const handleStatusChange = async (orderId: string, nextStatus: OrderStatus) => {
    if (!user) {
      return;
    }
    setStatusError(null);
    setUpdatingOrderId(orderId);
    try {
      const updatedOrder = await updateOrderStatus(orderId, nextStatus, user.token);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: updatedOrder.status
              }
            : order
        )
      );
    } catch (err) {
      console.error(err);
      setStatusError('Unable to update the order status. Please try again.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (!user) {
    return <p>Please sign in to view your order history.</p>;
  }

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <header>
        <h1 style={{ fontSize: 28, marginBottom: 4, color: '#c2415c' }}>{isOwner ? 'Customer orders' : 'Order history'}</h1>
        <p>{isOwner ? 'Review every arrangement customers have placed across the storefronts.' : 'Track your previous bespoke creations.'}</p>
      </header>
      {isLoading && <p>Loading orders...</p>}
      {error && <p style={{ color: '#c2415c' }}>{error}</p>}
      {statusError && <p style={{ color: '#c2415c' }}>{statusError}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {orders.length === 0 ? (
          <p style={{ fontSize: 14, color: '#555' }}>
            {isOwner ? 'No customer orders have been submitted yet.' : 'You have not placed any orders yet.'}
          </p>
        ) : (
          orders.map((order) => (
            <article key={order.id} style={{ border: '1px solid #eee', background: '#fff', padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <p style={{ fontWeight: 600 }}>Order #{order.id}</p>
                <p style={{ fontSize: 14, color: '#555' }}>{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              {isOwner && order.customerEmail && (
                <p style={{ marginTop: 4, fontSize: 13, color: '#555' }}>Customer: {order.customerEmail}</p>
              )}
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                {isOwner ? (
                  <label style={{ fontSize: 14, color: '#555', display: 'flex', alignItems: 'center', gap: 8 }}>
                    Status:
                    <select
                      value={order.status}
                      onChange={(event) => handleStatusChange(order.id, event.target.value as OrderStatus)}
                      disabled={updatingOrderId === order.id}
                      style={{ padding: '4px 8px', border: '1px solid #ccc', borderRadius: 4 }}
                    >
                      {ORDER_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {statusLabels[status]}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <span style={{ fontSize: 14, color: '#555' }}>Status: {statusLabels[order.status]}</span>
                )}
                <span style={{ fontSize: 18, fontWeight: 600, color: '#c2415c' }}>${order.totalAmount.toFixed(2)}</span>
              </div>

            </article>
          ))
        )}
      </div>
    </section>
  );
};
