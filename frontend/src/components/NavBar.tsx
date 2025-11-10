import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { hasDashboardAccess } from '../utils/auth';

export const NavBar = () => {
  const navigate = useNavigate();
  const { count: itemCount } = useCartStore();
  const { user, logout } = useAuthStore();
  const canAccessDashboard = user ? hasDashboardAccess(user.role) : false;
  const isAdmin = user?.role === 'admin';
  const isOwner = user?.role === 'owner';
  const ordersLabel = isOwner ? 'Customer orders' : 'Orders';

  const handleLogout = () => {
    logout();
    navigate('/auth', { replace: true });
  };

  return (
    <header className="bg-card border-b-2 border-lightBorder shadow-md sticky top-0 z-50">
      <div className="mx-auto max-w-[960px] px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary hover:opacity-80 transition-opacity flex items-center gap-2">
          🌸 Flora Tailor
        </Link>
        <nav className="flex gap-6 text-sm font-medium items-center">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `transition-colors hover:text-primary ${isActive ? 'text-primary font-semibold' : 'text-foreground'}`
            }
          >
            Home
          </NavLink>
          <NavLink 
            to="/orders" 
            className={({ isActive }) => 
              `transition-colors hover:text-primary ${isActive ? 'text-primary font-semibold' : 'text-foreground'}`
            }
          >
            {ordersLabel}
          </NavLink>
          <NavLink 
            to="/cart" 
            className={({ isActive }) => 
              `transition-colors hover:text-primary flex items-center gap-1 ${isActive ? 'text-primary font-semibold' : 'text-foreground'}`
            }
          >
            Cart 
            {itemCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-xs rounded-full bg-primary text-primary-foreground font-bold">
                {itemCount}
              </span>
            )}
          </NavLink>
          {canAccessDashboard && (
            <NavLink 
              to="/admin/catalog" 
              className={({ isActive }) => 
                `transition-colors hover:text-primary ${isActive ? 'text-primary font-semibold' : 'text-foreground'}`
              }
            >
              Dashboard
            </NavLink>
          )}
          {isAdmin && (
            <NavLink 
              to="/admin/users" 
              className={({ isActive }) => 
                `transition-colors hover:text-primary ${isActive ? 'text-primary font-semibold' : 'text-foreground'}`
              }
            >
              Users
            </NavLink>
          )}
          {user ? (
            <button 
              type="button" 
              onClick={handleLogout} 
              className="px-4 py-2 rounded-xl bg-error text-white font-medium hover:opacity-90 transition-all shadow-md hover:shadow-lg"
            >
              Logout
            </button>
          ) : (
            <NavLink 
              to="/auth" 
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-all shadow-md hover:shadow-lg"
            >
              Login
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
};
