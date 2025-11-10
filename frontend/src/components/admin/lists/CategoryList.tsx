import { Edit2, Trash2 } from 'lucide-react';
import { type Category } from '../../../types/domain';
import { LoadingState } from '../LoadingState';
import { EmptyState } from '../EmptyState';
import { ActionButton } from '../ActionButton';

interface CategoryListProps {
  categories: Category[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  loading: boolean;
}

export function CategoryList({ categories, onEdit, onDelete, loading }: CategoryListProps) {
  if (loading) return <LoadingState />;
  if (!categories.length) return <EmptyState message="No categories yet. Create your first one!" />;

  return (
  <div className="bg-surface border-2 border-primary/20 rounded-xl p-6 space-y-3">
      <h3 className="font-semibold text-lg mb-4 text-secondary">Categories ({categories.length})</h3>
      {categories.map((cat) => (
        <div key={cat.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-secondary hover:bg-secondary/5 transition-all">
          <div>
            <p className="font-medium text-foreground">{cat.name}</p>
            {cat.description && <p className="text-sm text-muted-foreground">{cat.description}</p>}
          </div>
          <div className="flex gap-2">
            <ActionButton icon={Edit2} onClick={() => onEdit(cat.id)} ariaLabel="Edit category" />
            <ActionButton icon={Trash2} onClick={() => onDelete(cat.id)} ariaLabel="Delete category" variant="danger" />
          </div>
        </div>
      ))}
    </div>
  );
}
