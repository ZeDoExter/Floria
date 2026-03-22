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

const statusStyles: Record<string, string> = {
  pending:    'bg-[#fde8ec] text-[#c0657a]',
  confirmed:  'bg-[#e8f0e4] text-[#4a7c40]',
  processing: 'bg-[#e8f0e4] text-[#4a7c40]',
  delivered:  'bg-[#e8f0e4] text-[#4a7c40]',
  completed:  'bg-[#e8f0e4] text-[#4a7c40]',
  cancelled:  'bg-[#fee2e2] text-[#ef4444]',
};

export const OrderCard = ({ order }: OrderCardProps) => {
  const badgeClass = statusStyles[order.status?.toLowerCase()] ?? 'bg-muted text-muted-foreground';

  return (
    <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{order.orderNumber}</h3>
          <p className="text-sm text-muted-foreground">{order.date}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {order.items} {order.items === 1 ? 'item' : 'items'}
        </div>
        <div
          className="text-xl font-bold text-foreground"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          ${order.total.toFixed(2)}
        </div>
      </div>
    </div>
  );
};
