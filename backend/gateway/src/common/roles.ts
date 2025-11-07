export type UserRole = 'owner' | 'admin' | 'customer';

export interface DirectoryUser {
  email: string;
  displayName: string;
  role: UserRole;
  description: string;
  capabilities: string[];
}

const DIRECTORY_USERS: DirectoryUser[] = [
  {
    email: 'flora.owner@example.com',
    displayName: 'Main shop owner',
    role: 'owner',
    description: 'Primary owner account for the flagship Flora Tailor storefront.',
    capabilities: [
      'Full catalog management',
      'View and coordinate every customer order',
      'Read-only access to administrative overviews'
    ]
  },
  {
    email: 'flora.owner.market@example.com',
    displayName: 'Weekend market owner',
    role: 'owner',
    description: 'Alternate owner representing the pop-up location used for testing multi-owner flows.',
    capabilities: [
      'Full catalog management',
      'View and coordinate every customer order',
      'Read-only access to administrative overviews'
    ]
  },
  {
    email: 'flora.admin@example.com',
    displayName: 'Shop administrator',
    role: 'admin',
    description: 'General administrator with read-only catalog access for QA and merchandising.',
    capabilities: [
      'Browse storefront as a shopper',
      'Review catalog, products, and customers',
      'View the directory of test accounts'
    ]
  },
  {
    email: 'flora.customer@example.com',
    displayName: 'Loyal customer',
    role: 'customer',
    description: 'Typical shopper profile for validating retail purchase flows.',
    capabilities: ['Browse, customize, and purchase arrangements', 'View their personal order history']
  },
  {
    email: 'flora.customer.guest@example.com',
    displayName: 'Guest customer',
    role: 'customer',
    description: 'Secondary customer account for multi-user cart and checkout tests.',
    capabilities: ['Browse, customize, and purchase arrangements', 'View their personal order history']
  }
];

const ROLE_BY_EMAIL = DIRECTORY_USERS.reduce<Record<string, UserRole>>((acc, user) => {
  acc[user.email.toLowerCase()] = user.role;
  return acc;
}, {});

export const getUserRole = (email?: string | null): UserRole => {
  if (!email) {
    return 'customer';
  }
  return ROLE_BY_EMAIL[email.trim().toLowerCase()] ?? 'customer';
};

export const listDirectoryUsers = (): DirectoryUser[] => DIRECTORY_USERS.map((entry) => ({ ...entry }));
