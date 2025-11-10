import { create } from 'zustand';
import { catalogAdapter } from '../services/adapters/catalogAdapter';
import type { Category, ProductDetail, ProductOptionGroup, ProductOption, Order, OrderStatus } from '../types/domain';

interface AdminCatalogState {
  // Data
  categories: Category[];
  products: ProductDetail[];
  optionGroups: ProductOptionGroup[];
  options: ProductOption[];
  orders: Order[];
  
  // UI state
  loading: boolean;
  error: string | null;
  
  // Actions
  loadAll: (token?: string) => Promise<void>;
  
  // Categories
  createCategory: (data: Omit<Category, 'id'>, token?: string) => Promise<Category>;
  updateCategory: (id: string, data: Partial<Category>, token?: string) => Promise<Category>;
  deleteCategory: (id: string, token?: string) => Promise<void>;
  
  // Products
  createProduct: (data: Omit<ProductDetail, 'id' | 'optionGroups'>, token?: string) => Promise<ProductDetail>;
  updateProduct: (id: string, data: Partial<ProductDetail>, token?: string) => Promise<ProductDetail>;
  deleteProduct: (id: string, token?: string) => Promise<void>;
  
  // Option Groups
  createOptionGroup: (data: Omit<ProductOptionGroup, 'id' | 'options'>, token?: string) => Promise<ProductOptionGroup>;
  updateOptionGroup: (id: string, data: Partial<ProductOptionGroup>, token?: string) => Promise<ProductOptionGroup>;
  deleteOptionGroup: (id: string, token?: string) => Promise<void>;
  
  // Options
  createOption: (data: Omit<ProductOption, 'id'>, token?: string) => Promise<ProductOption>;
  updateOption: (id: string, data: Partial<ProductOption>, token?: string) => Promise<ProductOption>;
  deleteOption: (id: string, token?: string) => Promise<void>;
  
  // Orders (admin view)
  loadOrders: (token?: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus, token?: string) => Promise<void>;
}

export const useAdminCatalogStore = create<AdminCatalogState>((set, get) => ({
  categories: [],
  products: [],
  optionGroups: [],
  options: [],
  orders: [],
  loading: false,
  error: null,
  
  loadAll: async (token?: string) => {
    set({ loading: true, error: null });
    try {
      const [categories, products, optionGroups, options] = await Promise.all([
        catalogAdapter.listCategories(token),
        catalogAdapter.listProducts(token),
        catalogAdapter.listOptionGroups(token),
        catalogAdapter.listOptions(token)
      ]);
      set({ categories, products, optionGroups, options });
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to load catalog' });
    } finally {
      set({ loading: false });
    }
  },
  
  // Categories
  createCategory: async (data, token) => {
    set({ loading: true, error: null });
    try {
      const newCat = await catalogAdapter.createCategory(data, token);
      set(state => ({ categories: [...state.categories, newCat] }));
      return newCat;
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to create category' });
      throw e;
    } finally {
      set({ loading: false });
    }
  },
  
  updateCategory: async (id, data, token) => {
    set({ loading: true, error: null });
    try {
      const updated = await catalogAdapter.updateCategory(id, data, token);
      set(state => ({
        categories: state.categories.map(c => c.id === id ? updated : c)
      }));
      return updated;
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to update category' });
      throw e;
    } finally {
      set({ loading: false });
    }
  },
  
  deleteCategory: async (id, token) => {
    set({ loading: true, error: null });
    try {
      await catalogAdapter.deleteCategory(id, token);
      set(state => ({
        categories: state.categories.filter(c => c.id !== id)
      }));
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to delete category' });
      throw e;
    } finally {
      set({ loading: false });
    }
  },
  
  // Products
  createProduct: async (data, token) => {
    set({ loading: true, error: null });
    try {
      const newProd = await catalogAdapter.createProduct(data, token);
      set(state => ({ products: [...state.products, newProd] }));
      return newProd;
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to create product' });
      throw e;
    } finally {
      set({ loading: false });
    }
  },
  
  updateProduct: async (id, data, token) => {
    set({ loading: true, error: null });
    try {
      const updated = await catalogAdapter.updateProduct(id, data, token);
      set(state => ({
        products: state.products.map(p => p.id === id ? updated : p)
      }));
      return updated;
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to update product' });
      throw e;
    } finally {
      set({ loading: false });
    }
  },
  
  deleteProduct: async (id, token) => {
    set({ loading: true, error: null });
    try {
      await catalogAdapter.deleteProduct(id, token);
      set(state => ({
        products: state.products.filter(p => p.id !== id)
      }));
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to delete product' });
      throw e;
    } finally {
      set({ loading: false });
    }
  },
  
  // Option Groups
  createOptionGroup: async (data, token) => {
    set({ loading: true, error: null });
    try {
      const newGroup = await catalogAdapter.createOptionGroup(data, token);
      set(state => ({ optionGroups: [...state.optionGroups, newGroup] }));
      return newGroup;
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to create option group' });
      throw e;
    } finally {
      set({ loading: false });
    }
  },
  
  updateOptionGroup: async (id, data, token) => {
    set({ loading: true, error: null });
    try {
      const updated = await catalogAdapter.updateOptionGroup(id, data, token);
      set(state => ({
        optionGroups: state.optionGroups.map(g => g.id === id ? updated : g)
      }));
      return updated;
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to update option group' });
      throw e;
    } finally {
      set({ loading: false });
    }
  },
  
  deleteOptionGroup: async (id, token) => {
    set({ loading: true, error: null });
    try {
      await catalogAdapter.deleteOptionGroup(id, token);
      set(state => ({
        optionGroups: state.optionGroups.filter(g => g.id !== id)
      }));
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to delete option group' });
      throw e;
    } finally {
      set({ loading: false });
    }
  },
  
  // Options
  createOption: async (data, token) => {
    set({ loading: true, error: null });
    try {
      const newOpt = await catalogAdapter.createOption(data, token);
      set(state => ({ options: [...state.options, newOpt] }));
      return newOpt;
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to create option' });
      throw e;
    } finally {
      set({ loading: false });
    }
  },
  
  updateOption: async (id, data, token) => {
    set({ loading: true, error: null });
    try {
      const updated = await catalogAdapter.updateOption(id, data, token);
      set(state => ({
        options: state.options.map(o => o.id === id ? updated : o)
      }));
      return updated;
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to update option' });
      throw e;
    } finally {
      set({ loading: false });
    }
  },
  
  deleteOption: async (id, token) => {
    set({ loading: true, error: null });
    try {
      await catalogAdapter.deleteOption(id, token);
      set(state => ({
        options: state.options.filter(o => o.id !== id)
      }));
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to delete option' });
      throw e;
    } finally {
      set({ loading: false });
    }
  },
  
  // Orders
  loadOrders: async (token) => {
    set({ loading: true, error: null });
    try {
      const orders = await catalogAdapter.listAllOrders(token);
      set({ orders });
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to load orders' });
    } finally {
      set({ loading: false });
    }
  },
  
  updateOrderStatus: async (orderId, status, token) => {
    set({ loading: true, error: null });
    try {
      await catalogAdapter.updateOrderStatus(orderId, status, token);
      set(state => ({
        orders: state.orders.map(o => o.id === orderId ? { ...o, status } : o)
      }));
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to update order status' });
      throw e;
    } finally {
      set({ loading: false });
    }
  }
}));
