import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAuthStore } from '../stores/authStore';

/**
 * Hook to sync AuthContext with authStore
 * This ensures both authentication systems stay in sync
 */
export function useSyncAuth() {
  const { user: contextUser } = useAuth();
  const { user: storeUser, loadStored } = useAuthStore();

  useEffect(() => {
    // Load stored auth on mount
    loadStored();
  }, [loadStored]);

  useEffect(() => {
    // Sync from context to store if they differ
    if (contextUser && (!storeUser || storeUser.email !== contextUser.email)) {
      useAuthStore.setState({
        user: {
          email: contextUser.email,
          displayName: contextUser.displayName,
          role: contextUser.role,
          token: contextUser.token
        },
        isAuthenticated: true
      });
    } else if (!contextUser && storeUser) {
      // Context has no user but store does - clear store
      useAuthStore.setState({
        user: null,
        isAuthenticated: false
      });
    }
  }, [contextUser, storeUser]);
}
