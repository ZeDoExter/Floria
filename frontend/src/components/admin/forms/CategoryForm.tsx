import { FormEvent } from 'react';
import { Edit2, Plus, Save, X } from 'lucide-react';

interface CategoryFormData {
  id: string;
  name: string;
  description: string;
}

interface CategoryFormProps {
  form: CategoryFormData;
  setForm: (form: CategoryFormData) => void;
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
  loading: boolean;
}

export function CategoryForm({ form, setForm, onSubmit, onCancel, loading }: CategoryFormProps) {
  return (
  <form onSubmit={onSubmit} className="bg-surface border-2 border-secondary/30 rounded-xl p-6 space-y-4 shadow-sm">
      <h3 className="font-semibold text-lg flex items-center gap-2 text-secondary">
        {form.id ? <Edit2 className="h-5 w-5 text-accent" /> : <Plus className="h-5 w-5 text-secondary" />}
        {form.id ? 'Edit Category' : 'New Category'}
      </h3>
      <div>
        <label htmlFor="cat-name" className="block text-sm font-medium mb-1 text-foreground">Name *</label>
        <input
          id="cat-name"
          type="text"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          required
          className="w-full px-3 py-2 rounded-lg border-2 border-primary/30 bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
        />
      </div>
      <div>
        <label htmlFor="cat-description" className="block text-sm font-medium mb-1 text-foreground">Description</label>
        <textarea
          id="cat-description"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 rounded-lg border-2 border-primary/30 bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary resize-none transition-all"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-medium hover:opacity-90 disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
        >
          <Save className="h-4 w-4" />
          {form.id ? 'Update' : 'Create'}
        </button>
        {form.id && (
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel editing category"
            className="px-4 py-2 rounded-lg border-2 border-border hover:bg-accent/10 hover:border-accent transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );
}
