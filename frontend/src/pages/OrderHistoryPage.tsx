import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  ShoppingBag,
  Calendar,
  User,
  Store,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useOrderStore } from '../stores/orderStore';
import type { Order, OrderStatus } from '../types/domain';
import { PageHeader, FeedbackBanner, EmptyState, LoadingState } from '../components/admin';

export const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { orders, isLoading, fetch, setStatus } = useOrderStore();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Check if user is owner/admin (can manage all orders)
  const isOwner = user?.role === 'owner' || user?.role === 'admin';

  // Filter orders based on user role
  const displayOrders = isOwner 
    ? orders 
    : orders.filter(order => order.customerEmail === user?.email);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/auth', { replace: true });
      return;
    }

    // Load orders on mount
    fetch().catch(err => {
      console.error('Failed to fetch orders:', err);
      setFeedback({ type: 'error', message: 'Unable to load orders. Please try again.' });
    });
  }, [isAuthenticated, user, navigate, fetch]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    if (!isOwner) return;

    setUpdatingOrderId(orderId);
    setFeedback(null);

    try {
      await setStatus(orderId, newStatus);
      setFeedback({ type: 'success', message: `Order ${orderId} updated to ${newStatus}` });
    } catch (err) {
      console.error('Failed to update order status:', err);
      setFeedback({ type: 'error', message: 'Unable to update order status. Please try again.' });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'COMPLETED': return CheckCircle;
      case 'CANCELLED': return XCircle;
      case 'PREPARING': return Package;
      case 'OUT_FOR_DELIVERY': return Truck;
      case 'READY_FOR_PICKUP': return ShoppingBag;
      default: return Clock;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'COMPLETED': return 'bg-success/10 text-success border-success/30';
      case 'CANCELLED': return 'bg-error/10 text-error border-error/30';
      case 'PREPARING': return 'bg-primary/10 text-primary border-primary/30';
      case 'OUT_FOR_DELIVERY': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'READY_FOR_PICKUP': return 'bg-purple-100 text-purple-700 border-purple-300';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING': return 'Pending';
      case 'PLACED': return 'Placed';
      case 'PREPARING': return 'Preparing';
      case 'READY_FOR_PICKUP': return 'Ready for Pickup';
      case 'OUT_FOR_DELIVERY': return 'Out for Delivery';
      case 'COMPLETED': return 'Completed';
      case 'CANCELLED': return 'Cancelled';
      default: return status;
    }
  };

  const getStoreLabel = (storeKey: string) => {
    switch (storeKey) {
      case 'flagship': return 'Flagship Boutique';
      case 'weekend-market': return 'Weekend Market Stall';
      default: return storeKey;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="bg-card rounded-3xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-foreground">
          {isOwner ? 'Customer Orders' : 'Order History'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isOwner 
            ? 'Review and manage customer orders across all storefronts' 
            : 'Track your bespoke flower arrangements and deliveries'}
        </p>
      </div>

      {feedback && (
        <div className={`${feedback.type === 'error' ? 'bg-error/10 border-error text-error' : 'bg-success/10 border-success text-success'} border-l-4 p-4 rounded-lg`}>
          <p className="font-medium">{feedback.message}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : displayOrders.length === 0 ? (
        <div className="bg-card rounded-2xl shadow-md p-12 text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground text-lg">
            {isOwner 
              ? 'No customer orders have been submitted yet.' 
              : 'You have not placed any orders yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayOrders.map((order) => {
            const StatusIcon = getStatusIcon(order.status);
            const statusColor = getStatusColor(order.status);
            const isUpdating = updatingOrderId === order.id;

            return (
              <div
                key={order.id}
                className="bg-card rounded-2xl shadow-md p-6 hover:shadow-lg transition-all space-y-4"
              >
                {/* Order Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">Order #{order.id}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge/Selector */}
                  <div>
                    {isOwner ? (
                      <div className="flex flex-col items-end gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          disabled={isUpdating}
                          aria-label={`Update status for order ${order.id}`}
                          className="px-3 py-1.5 text-sm font-medium rounded-lg border-2 border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 transition-all"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="PLACED">Placed</option>
                          <option value="PREPARING">Preparing</option>
                          <option value="READY_FOR_PICKUP">Ready for Pickup</option>
                          <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                        {isUpdating && (
                          <span className="text-xs text-muted-foreground">Updating...</span>
                        )}
                      </div>
                    ) : (
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 ${statusColor}`}>
                        <StatusIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">{getStatusLabel(order.status)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Info (Owner View) */}
                {isOwner && order.customerEmail && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                    <User className="h-4 w-4" />
                    <span>Customer: {order.customerEmail}</span>
                  </div>
                )}

                {/* Store Info (Owner View) */}
                {isOwner && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Store className="h-4 w-4" />
                    <span>{getStoreLabel(order.storeKey)}</span>
                  </div>
                )}

                {/* Order Items */}
                <div className="border-t border-border pt-4 space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground mb-3">Order Items</h4>
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-border"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{item.productName}</p>
                        {item.selectedOptionIds.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Options: {item.selectedOptionIds.join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        <p className="font-semibold text-primary">฿{item.unitPrice.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Notes */}
                {order.notes && (
                  <div className="flex items-start gap-2 p-3 bg-warning/5 border border-warning/20 rounded-lg">
                    <FileText className="h-4 w-4 text-warning mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                      <p className="text-sm text-foreground">{order.notes}</p>
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="flex items-center justify-between pt-4 border-t-2 border-primary/30">
                  <span className="font-semibold text-foreground">Total Amount</span>
                  <span className="text-2xl font-bold text-primary">฿{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
