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

export const decodeLocalUserEmail = (cognitoUserId: string): string | null => {
  if (!cognitoUserId?.startsWith('local-')) {
    return null;
  }

  const hex = cognitoUserId.slice('local-'.length);
  try {
    return Buffer.from(hex, 'hex').toString('utf8');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Unable to decode cognito user id to email', error);
    return null;
  }
};
