import { Edit2, Trash2 } from 'lucide-react';
import { type ProductOption } from '../../../types/domain';
import { LoadingState } from '../LoadingState';
import { EmptyState } from '../EmptyState';
import { ActionButton } from '../ActionButton';

interface OptionListProps {
  options: ProductOption[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  loading: boolean;
}

export function OptionList({ options, onEdit, onDelete, loading }: OptionListProps) {
  if (loading) return <LoadingState />;
  if (!options.length) return <EmptyState message="No options yet. Create your first one!" />;

  return (
  <div className="bg-surface border border-border rounded-xl p-6 space-y-3">
      <h3 className="font-semibold text-lg mb-4">Options ({options.length})</h3>
      {options.map((opt) => (
        <div key={opt.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
          <div>
            <p className="font-medium">{opt.name}</p>
            {opt.description && <p className="text-sm text-muted-foreground">{opt.description}</p>}
            <p className="text-sm text-primary mt-1">
              {opt.priceModifier >= 0 ? '+' : ''}฿{opt.priceModifier}
            </p>
          </div>
          <div className="flex gap-2">
            <ActionButton icon={Edit2} onClick={() => onEdit(opt.id)} ariaLabel="Edit option" />
            <ActionButton icon={Trash2} onClick={() => onDelete(opt.id)} ariaLabel="Delete option" variant="danger" />
          </div>
        </div>
      ))}
    </div>
  );
}
