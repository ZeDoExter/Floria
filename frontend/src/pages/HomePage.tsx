import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts, ProductSummary } from '../api/products';
import { fetchUserProfile } from '../api/users';
import { PackageIcon } from '../components/icons/PackageIcon';

export const HomePage = () => {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<ProductSummary[]>([]);
  const [ownerNames, setOwnerNames] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchProducts();
        setProducts(data);
        setDisplayedProducts(data.slice(0, ITEMS_PER_PAGE));
        setHasMore(data.length > ITEMS_PER_PAGE);

        // Fetch owner names for all unique owners
        const uniqueOwnerIds = [...new Set(data.map(p => p.ownerId).filter(Boolean))] as string[];
        const ownerNamesMap: Record<string, string> = {};
        
        await Promise.all(
          uniqueOwnerIds.map(async (ownerId) => {
            try {
              const owner = await fetchUserProfile(ownerId);
              ownerNamesMap[ownerId] = owner.firstName || 'Shop';
            } catch (err) {
              ownerNamesMap[ownerId] = 'Shop';
            }
          })
        );
        
        setOwnerNames(ownerNamesMap);
      } catch (err) {
        setError('Unable to load products right now.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    setTimeout(() => {
      const nextPage = page + 1;
      const startIndex = page * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const newProducts = products.slice(startIndex, endIndex);
      
      if (newProducts.length > 0) {
        setDisplayedProducts(prev => [...prev, ...newProducts]);
        setPage(nextPage);
        setHasMore(endIndex < products.length);
      } else {
        setHasMore(false);
      }
      
      setIsLoadingMore(false);
    }, 500);
  }, [page, products, hasMore, isLoadingMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMore, hasMore, isLoadingMore]);

  const handleSearch = () => {
    // Search functionality - location value is kept in state
    console.log('Searching for location:', location);
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Left side - Text */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-light italic text-foreground">
              All your favorite flower shops in one place.
            </h1>
            <p className="text-base text-muted-foreground">
              Discover curated flower boutiques that turn moments into memories.
            </p>
          </div>
      </section>

      {/* Products Section */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-foreground mb-8">Discover Products</h2>

        {isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading fresh blooms...</p>
          </div>
        )}

        {error && (
          <div className="bg-error/10 border border-error rounded-lg p-4 mb-8">
            <p className="text-error text-center">{error}</p>
          </div>
        )}

        {!isLoading && !error && (
          <>
            {/* Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {displayedProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="rounded-xl overflow-hidden bg-card border border-border hover:shadow-md transition-shadow"
                >
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-56 object-cover"
                    />
                  ) : (
                    <div className="w-full h-56 bg-muted flex items-center justify-center">
                      <PackageIcon className="h-12 w-12 text-muted-foreground opacity-50" />
                    </div>
                  )}
                  <div className="p-3 space-y-2">
                    <h3 className="font-semibold text-foreground text-sm line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {product.categoryName || 'Flowers'}
                    </p>
                    <p className="text-sm font-medium text-primary">
                      From ${product.basePrice.toFixed(2)}
                    </p>
                    {product.ownerId && (
                      <Link
                        to={`/shops/${product.ownerId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-foreground hover:text-primary transition-colors block underline decoration-1 underline-offset-2"
                      >
                        {ownerNames[product.ownerId] || 'Shop'}
                      </Link>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Infinite Scroll Trigger */}
            {hasMore && (
              <div ref={observerTarget} className="py-8 text-center">
                {isLoadingMore && (
                  <p className="text-muted-foreground">Loading more products...</p>
                )}
              </div>
            )}

            {!hasMore && displayedProducts.length > 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">You've seen all products</p>
              </div>
            )}

            {displayedProducts.length === 0 && (
              <div className="text-center py-12 bg-card rounded-2xl border border-border">
                <PackageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No products available</p>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
};
