import { Route, Routes, useLocation, Outlet } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ProfilePage } from './pages/ProfilePage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { NavBar } from './components/NavBar';
import { AdminCatalogPage } from './pages/AdminCatalogPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import "./App.css";

/**
 * This component wraps all pages that are NOT the home page.
 * It creates the centered, narrow layout with cream background.
 */
const StandardPageLayout = () => {
  return (
    <main style={{ margin: '0 auto', maxWidth: 960, padding: 24 }}>
      <Outlet /> {/* This renders the child route's element */}
    </main>
  );
};

function App() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div 
      style={{ 
        minHeight: '100vh', 
        background: isHomePage ? 'transparent' : '#FFF9F0', // Cream background for other pages
        color: '#1f1f1f' 
      }}
    >
      <NavBar />

      {/* Routes structure for flower shop application */}
      <Routes>
        {/* Route 1: The HomePage with full-width pink gradient background */}
        <Route path="/" element={<HomePage />} />

        {/* Route 2: A "Layout Route"
          This <Route> wraps all its children in the <StandardPageLayout />.
          This applies the narrow, centered style with cream background to all other pages.
        */}
        <Route element={<StandardPageLayout />}>
          {/* Flower shop routes */}
          <Route path="/shops/:shopId" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          
          {/* User routes */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />
          
          {/* Admin routes */}
          <Route path="/admin/catalog" element={<AdminCatalogPage />} />
          <Route path="/admin/catalog/:section" element={<AdminCatalogPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;