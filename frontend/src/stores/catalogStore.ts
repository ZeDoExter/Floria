import { create } from 'zustand';
import type { Category, ProductDetail, ProductSummary, StoreKey } from '../types/domain';
import { catalogAdapter } from '../services/adapters/catalogAdapter';
import { useAuthStore } from './authStore';

// Derive summaries from details
const toSummary = (p: ProductDetail): ProductSummary => ({
  id: p.id,
  name: p.name,
  description: p.description,
  basePrice: p.basePrice,
  imageUrl: p.imageUrl,
  categoryId: p.categoryId,
  categoryName: p.categoryName,
  storeKey: p.storeKey
});

interface CatalogState {
  categories: Category[];
  products: ProductDetail[];
  isLoading: boolean;
  activeStore?: StoreKey;
  load: () => Promise<void>;
  setActiveStore: (store?: StoreKey) => void;
  getProduct: (id: string) => ProductDetail | undefined;
  listSummaries: () => ProductSummary[];
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  categories: [],
  products: [],
  isLoading: false,
  activeStore: undefined,
  load: async () => {
    if (get().isLoading || get().products.length) return;
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().user?.token;
      const [categories, products] = await Promise.all([
        catalogAdapter.listCategories(token),
        catalogAdapter.listProducts(token)
      ]);
      set({ categories, products });
    } catch (e) {
      console.warn('Failed to load catalog', e);
    } finally {
      set({ isLoading: false });
    }
  },
  setActiveStore: (store) => set({ activeStore: store }),
  getProduct: (id) => get().products.find((p) => p.id === id),
  listSummaries: () => {
    const { products, activeStore } = get();
    return products
      .filter((p) => !activeStore || p.storeKey === activeStore)
      .map(toSummary);
  }
}));
