export type UserRole = 'owner' | 'admin' | 'customer';

const ROLE_BY_EMAIL: Record<string, UserRole> = {
  'flora.owner@example.com': 'owner',
  'flora.admin@example.com': 'admin',
  'flora.customer@example.com': 'customer'
};

export const getUserRole = (email?: string | null): UserRole => {
  if (!email) {
    return 'customer';
  }

  const normalized = email.trim().toLowerCase();
  return ROLE_BY_EMAIL[normalized] ?? 'customer';
};

export const hasDashboardAccess = (role: UserRole) => role === 'admin' || role === 'owner';

export const canManageCatalog = (role: UserRole) => role === 'owner';

export const canPlaceOrders = (role: UserRole) => role !== 'owner';
