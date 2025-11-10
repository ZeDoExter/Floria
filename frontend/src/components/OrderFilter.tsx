interface OrderFilterProps {
  filter: string;
  onFilterChange: (filter: string) => void;
}

const filters = [
  { value: 'all', label: 'All Orders' },
  { value: 'completed', label: 'Completed' },
  { value: 'processing', label: 'Processing' },
  { value: 'pending', label: 'Pending' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const OrderFilter = ({ filter, onFilterChange }: OrderFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => onFilterChange(f.value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === f.value
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-card text-muted-foreground hover:bg-muted border border-border'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
};
