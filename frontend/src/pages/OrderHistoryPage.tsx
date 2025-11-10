import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchOrders } from '../api/orders';
import type { OrderResponse, OrderStatus } from '../api/orders';
import { ChevronDownIcon } from '../components/icons/ChevronDownIcon';
import { PackageIcon } from '../components/icons/PackageIcon';

const statusConfig = {
  COMPLETED: { label: 'Delivered', color: 'bg-success text-white', icon: '✓' },
  PENDING: { label: 'Pending', color: 'bg-muted text-muted-foreground', icon: '○' },
  PLACED: { label: 'Processing', color: 'bg-primary text-primary-foreground', icon: '⟳' },
  PREPARING: { label: 'Processing', color: 'bg-primary text-primary-foreground', icon: '⟳' },
  READY_FOR_PICKUP: { label: 'Processing', color: 'bg-primary text-primary-foreground', icon: '⟳' },
  OUT_FOR_DELIVERY: { label: 'Processing', color: 'bg-primary text-primary-foreground', icon: '⟳' },
  CANCELLED: { label: 'Cancelled', color: 'bg-error text-white', icon: '✕' },
};

export const OrderHistoryPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
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
    return (
      <div className="min-h-screen bg-background px-4 py-8 md:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-light italic text-foreground">Order History</h1>
            <p className="text-muted-foreground">Track and manage all your orders</p>
          </div>

          {/* Sign In Card */}
          <div className="bg-card border border-border rounded-2xl shadow-lg p-12 text-center max-w-md mx-auto">
            <PackageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
            <h2 className="text-lg font-light text-foreground mb-1">Sign in to view your orders</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Please sign in to view your order history and track your purchases
            </p>
            <a 
              href="/login" 
              className="inline-block bg-success text-white px-6 py-2 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Sign In
            </a>
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
          <h1 className="text-4xl sm:text-5xl font-light italic text-foreground">Order History</h1>
          <p className="text-muted-foreground">Track and manage all your orders</p>
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

        {/* Status Filter */}
        {!isLoading && !error && orders.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card text-muted-foreground hover:bg-muted border border-border'
              }`}
            >
              All Orders
            </button>
            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === 'PENDING'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card text-muted-foreground hover:bg-muted border border-border'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('PLACED')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === 'PLACED'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card text-muted-foreground hover:bg-muted border border-border'
              }`}
            >
              Placed
            </button>
            <button
              onClick={() => setStatusFilter('PREPARING')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === 'PREPARING'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card text-muted-foreground hover:bg-muted border border-border'
              }`}
            >
              Preparing
            </button>
            <button
              onClick={() => setStatusFilter('READY_FOR_PICKUP')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === 'READY_FOR_PICKUP'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card text-muted-foreground hover:bg-muted border border-border'
              }`}
            >
              Ready for Pickup
            </button>
            <button
              onClick={() => setStatusFilter('OUT_FOR_DELIVERY')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === 'OUT_FOR_DELIVERY'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card text-muted-foreground hover:bg-muted border border-border'
              }`}
            >
              Out for Delivery
            </button>
            <button
              onClick={() => setStatusFilter('COMPLETED')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === 'COMPLETED'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card text-muted-foreground hover:bg-muted border border-border'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setStatusFilter('CANCELLED')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === 'CANCELLED'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card text-muted-foreground hover:bg-muted border border-border'
              }`}
            >
              Cancelled
            </button>
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
                const isExpanded = expandedOrder === order.id;
                
                return (
                  <div
                    key={order.id}
                    className="rounded-3xl shadow-lg overflow-hidden transition hover:shadow-xl bg-card"
                  >
                    {/* Order Header - Clickable */}
                    <button
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                      className="w-full px-6 py-6 flex items-center justify-between hover:opacity-80 transition"
                    >
                      {/* Order Info */}
                      <div className="flex items-center gap-4 flex-1 text-left">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Order #{order.id.slice(0, 8)}
                          </p>
                          <p className="font-semibold text-foreground">
                            {order.customerEmail || user.email}
                          </p>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-6 flex-1 justify-center">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Date</p>
                          <p className="text-foreground font-medium">
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Status & Expand Icon */}
                      <div className="flex items-center gap-4">
                        <div className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium ${config.color}`}>
                          <span>{config.icon}</span>
                          {config.label}
                        </div>
                        <ChevronDownIcon
                          className={`w-5 h-5 transition-transform text-primary ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </button>

                    {/* Expandable Content */}
                    {isExpanded && (
                      <div className="border-t border-border bg-muted/30">
                        <div className="px-6 py-6">
                          {/* Order Items */}
                          {order.items && order.items.length > 0 && (
                            <div className="space-y-4 mb-6">
                              <h4 className="font-semibold text-foreground mb-3">Order Items</h4>
                              {order.items.map((item) => (
                              <div key={item.id} className="flex gap-4 items-start bg-card rounded-lg p-4">
                                {/* Product Image */}
                                {item.optionSnapshot?.imageUrl && (
                                  <img
                                    src={item.optionSnapshot.imageUrl}
                                    alt={item.productName}
                                    className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                                  />
                                )}
                                
                                {/* Product Details */}
                                <div className="flex-1">
                                  <h5 className="font-semibold text-foreground">{item.productName}</h5>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    Quantity: {item.quantity}
                                  </p>
                                  
                                  {/* Selected Options */}
                                  {item.optionSnapshot?.selectedOptions && item.optionSnapshot.selectedOptions.length > 0 && (
                                    <div className="space-y-1 mb-2">
                                      <p className="text-xs font-medium text-muted-foreground mb-1">Selected Options:</p>
                                      {item.optionSnapshot.selectedOptions.map((opt) => (
                                        <div key={opt.id} className="text-xs flex justify-between items-center bg-muted/50 rounded px-2 py-1">
                                          <span className="text-foreground font-medium">{opt.name}</span>
                                          {opt.priceModifier > 0 && (
                                            <span className="text-success font-semibold">+${opt.priceModifier.toFixed(2)}</span>
                                          )}
                                          {opt.priceModifier === 0 && (
                                            <span className="text-muted-foreground text-xs">included</span>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  
                                  {/* Price Breakdown */}
                                  <div className="mt-2 space-y-1">
                                    {(() => {
                                      const basePrice = item.unitPrice - (item.optionSnapshot?.selectedOptions?.reduce((sum, opt) => sum + opt.priceModifier, 0) || 0);
                                      const optionsTotal = item.optionSnapshot?.selectedOptions?.reduce((sum, opt) => sum + opt.priceModifier, 0) || 0;
                                      
                                      return (
                                        <>
                                          <div className="text-xs text-muted-foreground flex justify-between">
                                            <span>Base Price:</span>
                                            <span>${basePrice.toFixed(2)}</span>
                                          </div>
                                          {optionsTotal > 0 && (
                                            <div className="text-xs text-muted-foreground flex justify-between">
                                              <span>Options:</span>
                                              <span className="text-success">+${optionsTotal.toFixed(2)}</span>
                                            </div>
                                          )}
                                          <div className="text-sm font-semibold text-foreground flex justify-between border-t border-border pt-1">
                                            <span>Unit Price:</span>
                                            <span className="text-success">${item.unitPrice.toFixed(2)}</span>
                                          </div>
                                          <div className="text-sm font-bold text-success flex justify-between">
                                            <span>Total ({item.quantity}x):</span>
                                            <span>${(item.unitPrice * item.quantity).toFixed(2)}</span>
                                          </div>
                                        </>
                                      );
                                    })()}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Order Details */}
                        <div className="space-y-4 mb-6">
                          <div className="bg-card rounded-lg p-4">
                            <h4 className="font-semibold text-foreground mb-2">Order Details</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Order ID:</span>
                                <span className="text-foreground font-medium">{order.id}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Customer:</span>
                                <span className="text-foreground font-medium">
                                  {order.customerEmail || user.email}
                                </span>
                              </div>
                              {order.notes && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Notes:</span>
                                  <span className="text-foreground font-medium">{order.notes}</span>
                                </div>
                              )}
                              {order.deliveryDate && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Delivery Date:</span>
                                  <span className="text-foreground font-medium">
                                    {new Date(order.deliveryDate).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Total */}
                        <div className="border-t border-border pt-4 flex justify-between items-center">
                          <p className="text-muted-foreground">Total</p>
                          <p className="text-2xl font-bold text-success">
                            ${order.totalAmount.toFixed(2)}
                          </p>
                        </div>

                          {/* Actions */}
                          {order.status === 'COMPLETED' && (
                            <div className="mt-6">
                              <button className="w-full px-4 py-3 rounded-xl font-medium text-white transition hover:opacity-90 bg-success">
                                Order Again
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-card rounded-3xl border border-border max-w-md mx-auto">
                <PackageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No orders yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
