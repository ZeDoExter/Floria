export type UserRole = 'owner' | 'admin' | 'customer';

const ROLE_BY_EMAIL: Record<string, UserRole> = {
  'flora.owner@example.com': 'owner',
  'flora.owner1@example.com': 'owner',
  'flora.owner2@example.com': 'owner',
  'flora.owner.market@example.com': 'owner',
  'flora.admin@example.com': 'admin',
  'flora.customer@example.com': 'customer',
  'flora.customer.guest@example.com': 'customer'
};

export const getUserRole = (email?: string | null): UserRole => {
  if (!email) {
    return 'customer';
  }

  // Check if email matches owner pattern (flora.ownerX@example.com)
  const ownerPattern = /^flora\.owner\d*@example\.com$/i;
  if (ownerPattern.test(email.trim())) {
    return 'owner';
  }

  return ROLE_BY_EMAIL[email.trim().toLowerCase()] ?? 'customer';
};

