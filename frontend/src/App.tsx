import { Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ProfilePage } from './pages/ProfilePage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { NavBar } from './components/NavBar';
import { AdminCatalogPage } from './pages/AdminCatalogPage';
import { AdminUsersPage } from './pages/AdminUsersPage';

function App() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8f5f5', color: '#1f1f1f' }}>
      <NavBar />
      <main style={{ margin: '0 auto', maxWidth: 960, padding: 24 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products/:productId" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />
          <Route path="/admin/catalog" element={<AdminCatalogPage />} />
          <Route path="/admin/catalog/:section" element={<AdminCatalogPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
