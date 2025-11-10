import { Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ProfilePage } from './pages/ProfilePage';
import { RegisterPage } from './pages/RegisterPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { CustomerOrdersPage } from './pages/CustomerOrdersPage';
import { NavBar } from './components/NavBar';
import { AdminCatalogPage } from './pages/AdminCatalogPage';

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
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />
          <Route path="/customer-orders" element={<CustomerOrdersPage />} />
          <Route path="/admin/catalog" element={<AdminCatalogPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
