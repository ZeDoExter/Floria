import { FormEvent } from 'react';
import { Edit2, Plus, Save, X } from 'lucide-react';

interface OptionGroupFormData {
  id: string;
  name: string;
  description: string;
  isRequired: boolean;
  minSelect: string;
  maxSelect: string;
}

interface OptionGroupFormProps {
  form: OptionGroupFormData;
  setForm: (form: OptionGroupFormData) => void;
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
  loading: boolean;
}

export function OptionGroupForm({ form, setForm, onSubmit, onCancel, loading }: OptionGroupFormProps) {
  return (
  <form onSubmit={onSubmit} className="bg-surface border border-border rounded-xl p-6 space-y-4">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        {form.id ? <Edit2 className="h-5 w-5 text-accent" /> : <Plus className="h-5 w-5 text-primary" />}
        {form.id ? 'Edit Option Group' : 'New Option Group'}
      </h3>
      <div>
        <label htmlFor="optgrp-name" className="block text-sm font-medium mb-1">Name *</label>
        <input
          id="optgrp-name"
          type="text"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          required
          className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label htmlFor="optgrp-description" className="block text-sm font-medium mb-1">Description</label>
        <input
          id="optgrp-description"
          type="text"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isRequired"
          checked={form.isRequired}
          onChange={e => setForm({ ...form, isRequired: e.target.checked })}
          className="rounded border-border"
        />
        <label htmlFor="isRequired" className="text-sm font-medium">Required</label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="optgrp-minselect" className="block text-sm font-medium mb-1">Min Select</label>
          <input
            id="optgrp-minselect"
            type="number"
            value={form.minSelect}
            onChange={e => setForm({ ...form, minSelect: e.target.value })}
            min="0"
            className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label htmlFor="optgrp-maxselect" className="block text-sm font-medium mb-1">Max Select</label>
          <input
            id="optgrp-maxselect"
            type="number"
            value={form.maxSelect}
            onChange={e => setForm({ ...form, maxSelect: e.target.value })}
            min="0"
            className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
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
            aria-label="Cancel editing option group"
            className="px-4 py-2 rounded-lg border border-border hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );
}
