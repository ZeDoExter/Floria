import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const NavBar = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const isOwner = user?.role === 'owner';

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-card/80 border-b border-border shadow-soft">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" onClick={() => setMobileOpen(false)}>
            <span
              style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: '3px' }}
              className="text-2xl font-semibold text-foreground tracking-widest uppercase"
            >
              FLORIA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/"
              className="px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:bg-primary-light hover:text-foreground transition-all duration-200"
            >
              Home
            </Link>

            {user && (
              <Link
                to="/orders"
                className="px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:bg-primary-light hover:text-foreground transition-all duration-200"
              >
                Orders
              </Link>
            )}

            {isOwner && (
              <>
                <Link
                  to="/admin/catalog"
                  className="px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:bg-primary-light hover:text-foreground transition-all duration-200"
                >
                  My Shop
                </Link>
                <Link
                  to="/customer-orders"
                  className="px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:bg-primary-light hover:text-foreground transition-all duration-200"
                >
                  Manage Orders
                </Link>
              </>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              className="relative flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-foreground border border-border bg-card hover:border-primary/50 transition-all duration-200"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              Cart
              {cartCount > 0 && (
                <span className="ml-0.5 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-scale-in">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {user ? (
              <div className="flex items-center gap-2 ml-2">
                <Link
                  to="/profile"
                  className="px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                >
                  {user.displayName || user.email}
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-sm font-medium hover:bg-error/10 hover:text-error transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-secondary transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-full border border-primary text-primary text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-accent transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-foreground transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-foreground transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-foreground transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-2 animate-fade-in">
            <Link to="/" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-foreground hover:bg-accent transition-colors">
              Home
            </Link>
            {user && (
              <Link to="/orders" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-foreground hover:bg-accent transition-colors">
                Orders
              </Link>
            )}
            {isOwner && (
              <>
                <Link to="/admin/catalog" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-foreground hover:bg-accent transition-colors">
                  My Shop
                </Link>
                <Link to="/customer-orders" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-foreground hover:bg-accent transition-colors">
                  Manage Orders
                </Link>
              </>
            )}
            <Link to="/cart" onClick={() => setMobileOpen(false)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-foreground border border-border bg-card hover:border-primary/50 transition-colors">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              Cart
              {cartCount > 0 && (
                <span className="ml-0.5 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-scale-in">
                  {cartCount}
                </span>
              )}
            </Link>
            <div className="border-t border-border pt-3 mt-3 space-y-2">
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-foreground hover:bg-accent transition-colors">
                    {user.displayName || user.email}
                  </Link>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-error hover:bg-error/10 transition-colors">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-bold text-primary-foreground bg-primary hover:bg-secondary transition-colors text-center">
                    Sign In
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-bold text-primary border-2 border-primary hover:bg-primary hover:text-primary-foreground transition-colors text-center">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
