import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const NavBar = () => {
  const { cartItems } = useCart();
  const { user, logout } = useAuth();
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const linkStyle = (active: boolean) => ({
    color: active ? '#c2415c' : '#444',
    textDecoration: 'none'
  });

  return (
    <header style={{ background: '#fff', borderBottom: '1px solid #eee' }}>
      <div style={{ margin: '0 auto', maxWidth: 960, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ fontSize: 18, fontWeight: 600, color: '#c2415c', textDecoration: 'none' }}>
          Flora Tailor
        </Link>
        <nav style={{ display: 'flex', gap: 16, fontSize: 14 }}>
          <NavLink to="/" style={({ isActive }) => linkStyle(isActive)}>
            Home
          </NavLink>
          <NavLink to="/orders" style={({ isActive }) => linkStyle(isActive)}>
            Orders
          </NavLink>
          <NavLink to="/cart" style={({ isActive }) => linkStyle(isActive)}>
            Cart ({itemCount})
          </NavLink>
          {user ? (
            <button type="button" onClick={logout} style={{ border: '1px solid #c2415c', background: '#c2415c', color: '#fff', padding: '4px 12px', cursor: 'pointer' }}>
              Logout
            </button>
          ) : (
            <NavLink to="/profile" style={({ isActive }) => linkStyle(isActive)}>
              Login
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
};
