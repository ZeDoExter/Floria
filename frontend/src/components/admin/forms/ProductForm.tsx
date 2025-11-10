import { FormEvent, useState } from 'react';
import { Edit2, Plus, Save, X, Upload, Image as ImageIcon } from 'lucide-react';
import { type StoreKey, type Category } from '../../../types/domain';

interface ProductFormData {
  id: string;
  name: string;
  description: string;
  basePrice: string;
  imageUrl: string;
  categoryId: string;
  storeKey: StoreKey;
  imageFile?: File | null;
}

interface ProductFormProps {
  form: ProductFormData;
  setForm: (form: ProductFormData) => void;
  categories: Category[];
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
  loading: boolean;
}

export function ProductForm({ form, setForm, categories, onSubmit, onCancel, loading }: ProductFormProps) {
  const [previewUrl, setPreviewUrl] = useState<string>(form.imageUrl || '');
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setForm({ ...form, imageFile: file, imageUrl: '' });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (url: string) => {
    setForm({ ...form, imageUrl: url, imageFile: null });
    setPreviewUrl(url);
  };

  const clearImage = () => {
    setForm({ ...form, imageUrl: '', imageFile: null });
    setPreviewUrl('');
  };

  return (
  <form onSubmit={onSubmit} className="bg-surface border-2 border-primary/30 rounded-xl p-6 space-y-4 shadow-sm">
      <h3 className="font-semibold text-lg flex items-center gap-2 text-secondary">
        {form.id ? <Edit2 className="h-5 w-5 text-accent" /> : <Plus className="h-5 w-5 text-primary" />}
        {form.id ? 'Edit Product' : 'New Product'}
      </h3>
      <div>
        <label htmlFor="prod-name" className="block text-sm font-medium mb-1 text-foreground">Name *</label>
        <input
          id="prod-name"
          type="text"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          required
          className="w-full px-3 py-2 rounded-lg border-2 border-primary/30 bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
        />
      </div>
      <div>
        <label htmlFor="prod-description" className="block text-sm font-medium mb-1 text-foreground">Description</label>
        <textarea
          id="prod-description"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 rounded-lg border-2 border-primary/30 bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary resize-none transition-all"
        />
      </div>
      <div>
        <label htmlFor="prod-price" className="block text-sm font-medium mb-1 text-foreground">Base Price (฿) *</label>
        <input
          id="prod-price"
          type="number"
          step="0.01"
          value={form.basePrice}
          onChange={e => setForm({ ...form, basePrice: e.target.value })}
          required
          className="w-full px-3 py-2 rounded-lg border-2 border-primary/30 bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-foreground">Product Image</label>
        
        {/* Toggle between URL and File upload */}
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={() => setUploadMode('url')}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all ${
              uploadMode === 'url'
                ? 'bg-secondary text-secondary-foreground shadow-md'
                : 'bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary'
            }`}
          >
            URL
          </button>
          <button
            type="button"
            onClick={() => setUploadMode('file')}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all ${
              uploadMode === 'file'
                ? 'bg-secondary text-secondary-foreground shadow-md'
                : 'bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary'
            }`}
          >
            Upload File
          </button>
        </div>

        {uploadMode === 'url' ? (
          <input
            id="prod-image"
            type="url"
            value={form.imageUrl}
            onChange={e => handleUrlChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full px-3 py-2 rounded-lg border-2 border-primary/30 bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
          />
        ) : (
          <div className="space-y-2">
            <label
              htmlFor="prod-image-file"
              className="flex items-center justify-center gap-2 w-full px-3 py-8 rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 hover:border-primary cursor-pointer transition-all"
            >
              <Upload className="h-5 w-5 text-secondary" />
              <span className="text-sm text-foreground font-medium">
                {form.imageFile ? form.imageFile.name : 'Click to upload image (max 5MB)'}
              </span>
            </label>
            <input
              id="prod-image-file"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        {/* Image Preview */}
        {previewUrl && (
          <div className="mt-3 relative">
            <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-primary/30 bg-muted shadow-md">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={() => setPreviewUrl('')}
              />
            </div>
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-accent text-accent-foreground hover:opacity-90 transition-opacity shadow-lg"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mt-1 flex items-center gap-1 text-xs text-secondary font-medium">
              <ImageIcon className="h-3 w-3" />
              {form.imageFile 
                ? `${form.imageFile.name} (${(form.imageFile.size / 1024).toFixed(1)} KB)`
                : 'Image from URL'
              }
            </div>
          </div>
        )}
      </div>
      <div>
        <label htmlFor="prod-category" className="block text-sm font-medium mb-1 text-foreground">Category</label>
        <select
          id="prod-category"
          value={form.categoryId}
          onChange={e => setForm({ ...form, categoryId: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border-2 border-primary/30 bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
        >
          <option value="">None</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="prod-store" className="block text-sm font-medium mb-1 text-foreground">Store *</label>
        <select
          id="prod-store"
          value={form.storeKey}
          onChange={e => setForm({ ...form, storeKey: e.target.value as StoreKey })}
          required
          className="w-full px-3 py-2 rounded-lg border-2 border-primary/30 bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
        >
          <option value="flagship">Flagship</option>
          <option value="weekend-market">Weekend Market</option>
        </select>
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
            aria-label="Cancel editing product"
            className="px-4 py-2 rounded-lg border-2 border-border hover:bg-accent/10 hover:border-accent transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );
}
