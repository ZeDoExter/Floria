import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, ShoppingBag, Shield, Store, LogOut, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { listKnownUsers, hasDashboardAccess, canManageCatalog, canPlaceOrders } from '../utils/auth';

export const ProfilePage = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to auth page if not logged in
    if (!isAuthenticated || !user) {
      navigate('/auth', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  if (!user) {
    return null; // Will redirect via useEffect
  }

  // Try to get extended info from known users (for mock mode)
  const knownUser = listKnownUsers().find((u) => u.email === user.email);
  const description = knownUser?.description ?? '';
  const capabilities = knownUser?.capabilities ?? [];

  const handleLogout = () => {
    logout();
    navigate('/auth', { replace: true });
  };

  const getRoleBadgeStyle = () => {
    switch (user.role) {
      case 'owner':
        return 'bg-secondary text-secondary-foreground';
      case 'admin':
        return 'bg-accent text-accent-foreground';
      case 'customer':
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  const getRoleIcon = () => {
    switch (user.role) {
      case 'owner':
        return <Store className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'customer':
      default:
        return <User className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Card */}
  <div className="bg-surface border border-border rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-linear-to-r from-primary to-secondary p-8 text-primary-foreground relative overflow-hidden">
          {/* Decorative melon accent circle */}
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-accent/15 blur-2xl" />
          
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-surface/20 border-2 border-accent/60 flex items-center justify-center shadow-lg">
                <User className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user.displayName}</h1>
                <p className="text-sm opacity-90">{user.email}</p>
              </div>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium shadow-md ${getRoleBadgeStyle()}`}>
              {getRoleIcon()}
              <span className="capitalize">{user.role}</span>
            </div>
          </div>
          {description && (
            <p className="mt-4 text-sm opacity-90 relative z-10">{description}</p>
          )}
        </div>

        {/* Capabilities */}
        {capabilities.length > 0 && (
          <div className="p-6 border-b border-border bg-linear-to-br from-accent/5 to-transparent">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <div className="h-1 w-8 bg-accent rounded-full" />
              Your Capabilities
            </h2>
            <ul className="space-y-2">
              {capabilities.map((cap, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-foreground group">
                  <div className="h-5 w-5 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center mt-0.5 shrink-0 group-hover:bg-accent/20 transition-colors">
                    <ChevronRight className="h-3 w-3 text-accent" />
                  </div>
                  <span>{cap}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Quick Actions */}
        <div className="p-6 space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Quick Actions
          </h2>
          
          {canPlaceOrders(user.role) && (
            <Link
              to="/orders"
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-accent hover:bg-accent/5 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <ShoppingBag className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Order History</p>
                  <p className="text-xs text-muted-foreground">View your past purchases</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
            </Link>
          )}

          {canManageCatalog(user.role) && (
            <Link
              to="/admin/catalog"
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-secondary hover:bg-secondary/5 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary/10 border border-secondary/30 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                  <Store className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Manage Catalog</p>
                  <p className="text-xs text-muted-foreground">Edit products and categories</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-secondary transition-colors" />
            </Link>
          )}

          {hasDashboardAccess(user.role) && (
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Admin Dashboard</p>
                  <p className="text-xs text-muted-foreground">Coming soon - Analytics & reports</p>
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 hover:shadow-md transition-all font-medium"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Account Info Card */}
  <div className="bg-surface border-2 border-accent/20 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-accent/40 transition-all">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-1 w-8 bg-accent rounded-full" />
          <h2 className="text-lg font-semibold text-foreground">Account Information</h2>
        </div>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <dt className="text-muted-foreground font-medium">Account Type</dt>
            <dd className="font-semibold text-foreground capitalize">{user.role}</dd>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <dt className="text-muted-foreground font-medium">Email</dt>
            <dd className="font-semibold text-foreground">{user.email}</dd>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg bg-accent/10 border border-accent/20">
            <dt className="text-accent-foreground font-medium">Auth Mode</dt>
            <dd className="font-semibold text-accent-foreground capitalize px-3 py-1 bg-accent/20 rounded-full">
              {useAuthStore.getState().mode}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};
