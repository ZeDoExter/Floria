import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const NavBar = () => {
  const { cartItems } = useCart();
  const { user, logout } = useAuth();
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
        <Link to="/" className="text-xl font-semibold text-rose-600">
          Flora Tailor
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'text-rose-600' : 'text-slate-700')}>
            Home
          </NavLink>
          <NavLink to="/orders" className={({ isActive }) => (isActive ? 'text-rose-600' : 'text-slate-700')}>
            Orders
          </NavLink>
          <NavLink to="/cart" className={({ isActive }) => (isActive ? 'text-rose-600' : 'text-slate-700')}>
            Cart ({itemCount})
          </NavLink>
          {user ? (
            <button onClick={logout} className="rounded bg-rose-500 px-3 py-1 text-white">
              Logout
            </button>
          ) : (
            <NavLink to="/profile" className={({ isActive }) => (isActive ? 'text-rose-600' : 'text-slate-700')}>
              Login
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
};
