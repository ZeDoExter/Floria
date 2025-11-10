import { type Order, type OrderStatus, ORDER_STATUS_OPTIONS } from '../../../types/domain';
import { LoadingState } from '../LoadingState';
import { EmptyState } from '../EmptyState';

interface OrderListProps {
  orders: Order[];
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  loading: boolean;
}

export function OrderList({ orders, onStatusChange, loading }: OrderListProps) {
  if (loading) return <LoadingState />;
  if (!orders.length) return <EmptyState message="No orders yet." />;

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'COMPLETED': return 'bg-primary/10 text-primary border-primary/30';
      case 'CANCELLED': return 'bg-accent/10 text-accent-foreground border-accent/30';
      case 'PREPARING': return 'bg-secondary/10 text-secondary-foreground border-secondary/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
  <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
      <h3 className="font-semibold text-lg mb-4">Orders ({orders.length})</h3>
      {orders.map((order) => (
        <div key={order.id} className="p-4 rounded-lg border-2 border-accent/20 hover:border-accent/40 transition-colors space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium">Order #{order.id}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(order.createdAt).toLocaleString()} • {order.storeKey}
              </p>
              {order.customerEmail && (
                <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
              )}
            </div>
            <div className="text-right">
              <p className="font-semibold text-lg text-accent">฿{order.totalAmount}</p>
              <p className="text-xs text-muted-foreground">{order.items.length} items</p>
            </div>
          </div>
          
          <div className="space-y-1">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>{item.productName} x{item.quantity}</span>
                <span className="text-muted-foreground">฿{item.unitPrice}</span>
              </div>
            ))}
          </div>

          {order.notes && (
            <p className="text-sm text-muted-foreground italic border-l-2 border-accent/30 pl-3">
              {order.notes}
            </p>
          )}

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            <select
              value={order.status}
              onChange={e => onStatusChange(order.id, e.target.value as OrderStatus)}
              aria-label={`Update status for order ${order.id}`}
              className={`px-3 py-1 rounded-lg border text-sm font-medium ${getStatusColor(order.status)}`}
            >
              {ORDER_STATUS_OPTIONS.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}
