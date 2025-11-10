import { create } from 'zustand';

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'destructive' | 'warning';
}

interface UiState {
  cartOpen: boolean;
  toasts: Toast[];
  openCart: () => void;
  closeCart: () => void;
  pushToast: (toast: Omit<Toast, 'id'>) => string;
  dismissToast: (id: string) => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  cartOpen: false,
  toasts: [],
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
  pushToast: (toast) => {
    const id = Math.random().toString(36).slice(2, 10);
    set({ toasts: [...get().toasts, { ...toast, id }] });
    return id;
  },
  dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) })
}));
