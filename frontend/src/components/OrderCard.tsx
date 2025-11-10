interface OrderCardProps {
  order: {
    id: string;
    orderNumber: string;
    date: string;
    total: number;
    status: 'completed' | 'pending' | 'processing' | 'cancelled';
    items: number;
  };
}

const statusColors = {
  completed: 'bg-success text-white',
  pending: 'bg-muted text-muted-foreground',
  processing: 'bg-primary text-primary-foreground',
  cancelled: 'bg-error text-white',
};

export const OrderCard = ({ order }: OrderCardProps) => {
  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{order.orderNumber}</h3>
          <p className="text-sm text-muted-foreground">{order.date}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {order.items} {order.items === 1 ? 'item' : 'items'}
        </div>
        <div className="text-xl font-bold text-foreground">
          ${order.total.toFixed(2)}
        </div>
      </div>
    </div>
  );
};
