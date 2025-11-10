import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { hasDashboardAccess } from '../utils/auth';

export const NavBar = () => {
  const { cartItems } = useCart();
  const { user, logout } = useAuth();
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const canAccessDashboard = user ? hasDashboardAccess(user.role) : false;
  const isOwner = user?.role === 'owner';

  return (
    <header className="bg-background py-4 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-card border border-border rounded-2xl shadow-md px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-2xl font-bold text-foreground hover:opacity-80 transition-opacity"
          >
            Floria
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `text-sm font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              Home
            </NavLink>

            <NavLink 
              to="/orders" 
              className={({ isActive }) => 
                `text-sm font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              Orders
            </NavLink>

            <NavLink 
              to="/cart" 
              className={({ isActive }) => 
                `text-sm font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              Cart ({itemCount})
            </NavLink>

            {isOwner && (
              <NavLink 
                to="/customer-orders" 
                className={({ isActive }) => 
                  `text-sm font-medium transition-colors ${
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`
                }
              >
                Customer orders
              </NavLink>
            )}

            {canAccessDashboard && (
              <NavLink 
                to="/admin/catalog" 
                className={({ isActive }) => 
                  `text-sm font-medium transition-colors ${
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`
                }
              >
                Catalog
              </NavLink>
            )}

            {user ? (
              <button 
                type="button" 
                onClick={logout} 
                className="bg-success text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
              >
                Logout
              </button>
            ) : (
              <NavLink 
                to="/login"
                className="bg-success px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shadow-sm text-white"
              >
                Login/Sign up
              </NavLink>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
