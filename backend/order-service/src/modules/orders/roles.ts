export type UserRole = 'owner' | 'admin' | 'customer';

const ROLE_BY_EMAIL: Record<string, UserRole> = {
  'flora.owner@example.com': 'owner',
  'flora.owner.market@example.com': 'owner',
  'flora.admin@example.com': 'admin',
  'flora.customer@example.com': 'customer',
  'flora.customer.guest@example.com': 'customer'
};

export const getUserRole = (email?: string | null): UserRole => {
  if (!email) {
    return 'customer';
  }

  return ROLE_BY_EMAIL[email.trim().toLowerCase()] ?? 'customer';
};

