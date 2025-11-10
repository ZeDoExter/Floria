export type UserRole = 'owner' | 'customer';

export const hasDashboardAccess = (role: UserRole) => role === 'owner';

export const canManageCatalog = (role: UserRole) => role === 'owner';

export const canPlaceOrders = (role: UserRole) => role === 'customer' || role === 'owner';

export const canReviewCustomerOrders = (role: UserRole) => role === 'owner';
