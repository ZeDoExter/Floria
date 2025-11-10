import { FormEvent } from 'react';
import { Edit2, Plus, Save, X } from 'lucide-react';

interface OptionFormData {
  id: string;
  name: string;
  description: string;
  priceModifier: string;
}

interface OptionFormProps {
  form: OptionFormData;
  setForm: (form: OptionFormData) => void;
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
  loading: boolean;
}

export function OptionForm({ form, setForm, onSubmit, onCancel, loading }: OptionFormProps) {
  return (
  <form onSubmit={onSubmit} className="bg-surface border border-border rounded-xl p-6 space-y-4">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        {form.id ? <Edit2 className="h-5 w-5 text-accent" /> : <Plus className="h-5 w-5 text-primary" />}
        {form.id ? 'Edit Option' : 'New Option'}
      </h3>
      <div>
        <label htmlFor="opt-name" className="block text-sm font-medium mb-1">Name *</label>
        <input
          id="opt-name"
          type="text"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          required
          className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label htmlFor="opt-description" className="block text-sm font-medium mb-1">Description</label>
        <input
          id="opt-description"
          type="text"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label htmlFor="opt-price" className="block text-sm font-medium mb-1">Price Modifier (฿)</label>
        <input
          id="opt-price"
          type="number"
          step="0.01"
          value={form.priceModifier}
          onChange={e => setForm({ ...form, priceModifier: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {form.id ? 'Update' : 'Create'}
        </button>
        {form.id && (
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel editing option"
            className="px-4 py-2 rounded-lg border border-border hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );
}
