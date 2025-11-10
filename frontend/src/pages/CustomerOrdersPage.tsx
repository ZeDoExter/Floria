import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchCustomerOrders, ORDER_STATUS_OPTIONS, updateOrderStatus } from '../api/orders';
import type { OrderResponse, OrderStatus } from '../api/orders';
import { PackageIcon } from '../components/icons/PackageIcon';

const statusConfig = {
  COMPLETED: { label: 'Delivered', color: 'bg-success text-white' },
  PENDING: { label: 'Pending', color: 'bg-muted text-muted-foreground' },
  PLACED: { label: 'Placed', color: 'bg-primary text-primary-foreground' },
  PREPARING: { label: 'Preparing', color: 'bg-primary text-primary-foreground' },
  READY_FOR_PICKUP: { label: 'Ready for Pickup', color: 'bg-primary text-primary-foreground' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: 'bg-primary text-primary-foreground' },
  CANCELLED: { label: 'Cancelled', color: 'bg-error text-white' },
};

export const CustomerOrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');

  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchCustomerOrders(user.token);
        setOrders(response);
      } catch (err) {
        setError('Unable to load customer orders.');
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

  if (!user || user.role !== 'owner') {
    return (
      <div className="min-h-screen bg-background px-4 py-8 md:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-light italic text-foreground">Customer Orders</h1>
            <p className="text-muted-foreground">You need an owner account to view customer orders</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-light italic text-foreground">Customer Orders</h1>
          <p className="text-muted-foreground">Review every arrangement customers have placed from your shop</p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="bg-error/10 border border-error rounded-lg p-4 mb-8">
            <p className="text-error">{error}</p>
          </div>
        )}

        {statusError && (
          <div className="bg-error/10 border border-error rounded-lg p-4 mb-8">
            <p className="text-error">{statusError}</p>
          </div>
        )}

        {/* Status Filter */}
        {!isLoading && !error && orders.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground hover:bg-border'
              }`}
            >
              All
            </button>
            {ORDER_STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  statusFilter === status
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground hover:bg-border'
                }`}
              >
                {statusConfig[status].label}
              </button>
            ))}
          </div>
        )}

        {/* Orders List */}
        {!isLoading && !error && (
          <div className="space-y-4">
            {orders.length > 0 ? (
              orders
                .filter((order) => statusFilter === 'ALL' || order.status === statusFilter)
                .map((order) => {
                  const config = statusConfig[order.status];
                  
                  return (
                    <div
                      key={order.id}
                      className="rounded-xl shadow-md overflow-hidden bg-card border border-border"
                    >
                      <div className="p-5">
                        {/* Order Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Order #{order.id.slice(0, 8)}
                            </p>
                            <p className="font-semibold text-foreground">
                              {order.customerEmail}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(order.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-success">
                              ${order.totalAmount.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {/* Status Selector */}
                        <div className="flex items-center gap-3 pt-4 border-t border-border">
                          <label className="text-sm font-medium text-foreground">
                            Status:
                          </label>
                          <select
                            value={order.status}
                            onChange={(event) => handleStatusChange(order.id, event.target.value as OrderStatus)}
                            disabled={updatingOrderId === order.id}
                            className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                          >
                            {ORDER_STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {statusConfig[status].label}
                              </option>
                            ))}
                          </select>
                          <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${config.color}`}>
                            {config.label}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="text-center py-12 bg-card rounded-xl border border-border max-w-md mx-auto">
                <PackageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No customer orders yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
