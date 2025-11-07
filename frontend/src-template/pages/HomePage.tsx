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
    <section className="space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-rose-600">Design your perfect bouquet</h1>
        <p className="text-slate-600">
          Discover bespoke floral arrangements with customizable options for every occasion.
        </p>
      </header>
      {isLoading && <p className="text-center text-slate-500">Loading fresh blooms...</p>}
      {error && <p className="text-center text-rose-600">{error}</p>}
      <div className="grid gap-6 sm:grid-cols-2">
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/products/${product.id}`}
            className="rounded-lg border border-rose-100 bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <h2 className="text-xl font-semibold text-rose-600">{product.name}</h2>
            {product.description && <p className="mt-2 text-sm text-slate-600">{product.description}</p>}
            <p className="mt-4 text-sm font-medium text-slate-700">From ${product.basePrice.toFixed(2)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
};
