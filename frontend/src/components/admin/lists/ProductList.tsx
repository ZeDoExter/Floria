import { Edit2, Trash2 } from 'lucide-react';
import { type ProductDetail } from '../../../types/domain';
import { LoadingState } from '../LoadingState';
import { EmptyState } from '../EmptyState';
import { ActionButton } from '../ActionButton';

interface ProductListProps {
  products: ProductDetail[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  loading: boolean;
}

export function ProductList({ products, onEdit, onDelete, loading }: ProductListProps) {
  if (loading) return <LoadingState />;
  if (!products.length) return <EmptyState message="No products yet. Create your first one!" />;

  return (
  <div className="bg-surface border-2 border-primary/20 rounded-xl p-6 space-y-3">
      <h3 className="font-semibold text-lg mb-4 text-secondary">Products ({products.length})</h3>
      {products.map((prod) => (
        <div key={prod.id} className="flex items-start justify-between p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all">
          <div className="flex gap-3">
            {prod.imageUrl && (
              <img src={prod.imageUrl} alt={prod.name} className="w-16 h-16 rounded-lg object-cover border-2 border-primary/30" />
            )}
            <div>
              <p className="font-medium text-foreground">{prod.name}</p>
              <p className="text-sm text-muted-foreground">{prod.description}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm font-semibold text-secondary">฿{prod.basePrice}</span>
                {prod.categoryName && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground font-medium">
                    {prod.categoryName}
                  </span>
                )}
                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/20 text-secondary font-medium">
                  {prod.storeKey}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <ActionButton icon={Edit2} onClick={() => onEdit(prod.id)} ariaLabel="Edit product" />
            <ActionButton icon={Trash2} onClick={() => onDelete(prod.id)} ariaLabel="Delete product" variant="danger" />
          </div>
        </div>
      ))}
    </div>
  );
}
