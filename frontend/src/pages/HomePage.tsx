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
    <div className="space-y-8">
      {/* Hero Section - Inspired by Figma */}
      <div className="bg-card rounded-3xl shadow-lg p-8 text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">
          Where should we deliver<br />your flower today?
        </h1>
        <div className="max-w-md mx-auto space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Location"
              className="w-full px-4 py-3 pl-12 rounded-xl border-2 border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-success"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <button className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all shadow-md">
            Search
          </button>
        </div>
      </div>

      {/* Discover Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Discover shop near u</h2>
        
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading fresh blooms...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-error/10 border-l-4 border-error text-error p-4 rounded-lg">
            <p className="font-medium">{error}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className="group bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Product Image */}
              <div className="aspect-square overflow-hidden bg-muted">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl">🌸</span>
                  </div>
                )}
              </div>
              
              {/* Product Info */}
              <div className="p-4 space-y-2">
                <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                  Floria
                </h3>
                <p className="text-sm text-muted-foreground">
                  {(Math.random() * 5 + 0.5).toFixed(1)} km
                </p>
                <div className="flex items-center justify-between pt-2">
                  <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                    Math.random() > 0.3 
                      ? 'bg-success/20 text-success' 
                      : 'bg-error/20 text-error'
                  }`}>
                    {Math.random() > 0.3 ? 'Open' : 'Closed'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* More Shops Button */}
        {products.length > 0 && (
          <div className="text-center pt-4">
            <button className="px-8 py-3 rounded-xl border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-primary-foreground transition-all">
              More Shops
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
