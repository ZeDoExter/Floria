import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts, ProductSummary } from '../api/products';

export const HomePage = () => {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        setError('Unable to load products right now.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <header style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 28, marginBottom: 8, color: '#c2415c' }}>Design your perfect bouquet</h1>
        <p>Discover bespoke floral arrangements with customizable options for every occasion.</p>
      </header>
      {isLoading && <p style={{ textAlign: 'center' }}>Loading fresh blooms...</p>}
      {error && <p style={{ textAlign: 'center', color: '#c2415c' }}>{error}</p>}
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/products/${product.id}`}
            style={{
              border: '1px solid #eee',
              padding: 16,
              background: '#fff',
              textDecoration: 'none',
              color: '#222'
            }}
          >
            <h2 style={{ fontSize: 18, marginBottom: 8, color: '#c2415c' }}>{product.name}</h2>
            {product.description && <p style={{ fontSize: 14, marginBottom: 8 }}>{product.description}</p>}
            <p style={{ fontSize: 14, fontWeight: 600 }}>From ${product.basePrice.toFixed(2)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
};
