import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { hasDashboardAccess } from '../utils/auth';
import { useState } from 'react';

export const NavBar = () => {
  const { cartItems } = useCart();
  const { user, logout } = useAuth();
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const canAccessDashboard = user ? hasDashboardAccess(user.role) : false;
  const isAdmin = user?.role === 'admin';
  const isOwner = user?.role === 'owner';
  const ordersLabel = isOwner ? 'Customer orders' : 'Orders';

  // --- Button click animation state ---
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = (action?: () => void) => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 150);
    if (action) action();
  };

  // --- Shared nav link style ---
  const linkStyle = (active: boolean) => ({
    color: active ? '#1e293b' : '#64748b',
    textDecoration: 'none',
    fontWeight: 500,
    fontSize: '14px',
    transition: 'all 0.3s ease',
    padding: '6px 8px',
  });

  // --- Hover effect styling ---
  const hoverStyle = {
    color: '#3E8340',
    transform: 'scale(1.05)',
  };

  return (
    <header style={{ padding: '20px' }}>
      <div
        style={{
          margin: '0 auto',
          maxWidth: '1200px',
          background: '#fefcf3',
          borderRadius: '24px',
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          transition: 'box-shadow 0.3s ease',
        }}
      >
        <Link
          to="/"
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: '#1e293b',
            textDecoration: 'none',
            transition: 'color 0.3s ease, transform 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#3E8340';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#1e293b';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Floria
        </Link>

        <nav style={{ display: 'flex', gap: 24, fontSize: 14, alignItems: 'center' }}>
          {[
            { to: '/', label: 'Home' },
            { to: '/orders', label: ordersLabel },
            { to: '/cart', label: `Cart (${itemCount})` },
            ...(canAccessDashboard ? [{ to: '/admin/catalog', label: 'Catalog' }] : []),
            ...(isAdmin ? [{ to: '/admin/users', label: 'Users' }] : []),
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                ...linkStyle(isActive),
              })}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, hoverStyle);
              }}
              onMouseLeave={(e) => {
                Object.assign(e.currentTarget.style, linkStyle(e.currentTarget.classList.contains('active')));
              }}
            >
              {label}
            </NavLink>
          ))}

          {user ? (
            <button
              type="button"
              onClick={() => handleClick(logout)}
              style={{
                border: 'none',
                background: '#3E8340',
                color: '#fff',
                padding: '8px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                transform: isClicked ? 'scale(0.95)' : 'scale(1)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#BADD7F')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#3E8340')}
            >
              Logout
            </button>
          ) : (
            <button
              style={{
                border: 'none',
                background: '#3E8340',
                color: '#fff',
                padding: '8px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                transform: isClicked ? 'scale(0.95)' : 'scale(1)',
              }}
              onClick={() => handleClick()}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#BADD7F')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#3E8340')}
            >
              <NavLink to="/profile" style={{ color: '#fff', textDecoration: 'none' }}>
                Login/Sign up
              </NavLink>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};
