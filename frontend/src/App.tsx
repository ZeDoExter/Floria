import { Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ProfilePage } from './pages/ProfilePage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { NavBar } from './components/NavBar';
import OwnerCatalogPage  from './pages/AdminCatalogPage';
import Authentication from './pages/Authentication';
import "./App.css";

function App() {
  return (
  <div className="min-h-screen bg-surface text-foreground">
      <NavBar />
      <main className="mx-auto max-w-[960px] p-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products/:productId" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />
          <Route path="/admin/catalog" element={<OwnerCatalogPage />} />
          <Route path="/admin/catalog/:section" element={<OwnerCatalogPage />} />
          <Route path="/auth" element={<Authentication />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
