import { create } from 'zustand';
import { authAdapter, type AuthUser } from '../services/adapters/authAdapter';

const STORAGE_KEY = 'flora-tailor/authStore';

interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    mode: 'real' | 'mock';
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    loadStored: () => void;
    refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    mode: authAdapter.mode(),
    loadStored: () => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw) as AuthUser | null;
            if (parsed && parsed.email) {
                set({ user: parsed, isAuthenticated: true });
            }
        } catch (e) {
            console.warn('Failed to parse stored auth state', e);
            localStorage.removeItem(STORAGE_KEY);
        }
    },
    login: async (email, password) => {
        set({ loading: true, error: null });
        try {
            const user = await authAdapter.login(email, password);
            set({ user, isAuthenticated: true });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        } catch (e: any) {
            set({ error: e?.message ?? 'Login failed', user: null, isAuthenticated: false });
        } finally {
            set({ loading: false });
        }
    },
    refreshProfile: async () => {
        const current = get().user;
        if (!current || get().mode === 'mock') return; // no-op in mock mode
        try {
            const refreshed = await authAdapter.loadProfile(current.token);
            if (refreshed) {
                const merged: AuthUser = { ...current, ...refreshed };
                set({ user: merged, isAuthenticated: true });
                localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
            }
        } catch (e) {
            console.warn('Failed to refresh profile', e);
        }
    },
    logout: () => {
        localStorage.removeItem(STORAGE_KEY);
        set({ user: null, isAuthenticated: false });
    }
}));

// Initialize from storage immediately (consumer can call useEffect(() => useAuthStore.getState().loadStored(), []))