import { Edit2, Trash2 } from 'lucide-react';
import { type ProductOptionGroup } from '../../../types/domain';
import { LoadingState } from '../LoadingState';
import { EmptyState } from '../EmptyState';
import { ActionButton } from '../ActionButton';

interface OptionGroupListProps {
  optionGroups: ProductOptionGroup[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  loading: boolean;
}

export function OptionGroupList({ optionGroups, onEdit, onDelete, loading }: OptionGroupListProps) {
  if (loading) return <LoadingState />;
  if (!optionGroups.length) return <EmptyState message="No option groups yet. Create your first one!" />;

  return (
  <div className="bg-surface border border-border rounded-xl p-6 space-y-3">
      <h3 className="font-semibold text-lg mb-4">Option Groups ({optionGroups.length})</h3>
      {optionGroups.map((grp) => (
        <div key={grp.id} className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="font-medium">{grp.name}</p>
              {grp.description && <p className="text-sm text-muted-foreground">{grp.description}</p>}
            </div>
            <div className="flex gap-2">
              <ActionButton icon={Edit2} onClick={() => onEdit(grp.id)} ariaLabel="Edit option group" />
              <ActionButton icon={Trash2} onClick={() => onDelete(grp.id)} ariaLabel="Delete option group" variant="danger" />
            </div>
          </div>
          <div className="flex gap-2 text-xs">
            {grp.isRequired && (
              <span className="px-2 py-1 rounded-full bg-accent/10 text-accent-foreground">Required</span>
            )}
            <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground">
              {grp.minSelect}-{grp.maxSelect} selections
            </span>
            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary-foreground">
              {grp.options?.length ?? 0} options
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
