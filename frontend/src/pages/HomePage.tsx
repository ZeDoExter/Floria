import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts, ProductSummary } from '../api/products';
import { fetchUserProfile } from '../api/users';
import { searchProducts, SearchProductResult } from '../api/search';
import { PackageIcon } from '../components/icons/PackageIcon';
import { SearchIcon } from '../components/icons/SearchIcon';
import { XMarkIcon } from '../components/icons/XMarkIcon';

const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden bg-card border border-border animate-fade-in">
    <div className="skeleton w-full h-56" />
    <div className="p-4 space-y-3">
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-3 w-1/2" />
      <div className="skeleton h-4 w-1/3" />
    </div>
  </div>
);

export const HomePage = () => {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<ProductSummary[]>([]);
  const [ownerNames, setOwnerNames] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchProductResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<number | null>(null);

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

        const uniqueOwnerIds = [...new Set(data.map(p => p.ownerId).filter(Boolean))] as string[];
        const ownerNamesMap: Record<string, string> = {};

        await Promise.all(
          uniqueOwnerIds.map(async (ownerId) => {
            try {
              const owner = await fetchUserProfile(ownerId);
              ownerNamesMap[ownerId] = owner.firstName || 'Shop';
            } catch {
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

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchProducts(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/40 via-background to-muted/30" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="space-y-6 animate-fade-in-up">
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading text-foreground leading-tight">
                Fresh Blooms, <br />
                <span className="text-primary">Delivered</span> with Love 🌷
              </h1>
              <p className="text-lg text-muted-foreground font-body">
                Discover curated flower boutiques that turn everyday moments into beautiful memories.
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-xl relative">
              <div className="relative">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  id="search-products"
                  type="text"
                  placeholder="Search for flowers, bouquets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 rounded-2xl border-2 border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:border-primary shadow-soft transition-all duration-200"
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Clear search"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {searchQuery && (
                <div className="absolute z-10 mt-2 w-full bg-card border-2 border-border rounded-2xl shadow-soft-lg max-h-96 overflow-y-auto animate-scale-in">
                  {isSearching ? (
                    <div className="p-6 text-center text-muted-foreground">
                      <span className="animate-pulse-soft">🔍 Searching...</span>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((result) => (
                        <Link
                          key={result.id}
                          to={`/products/${result.id}`}
                          className="block px-4 py-3 hover:bg-accent/50 transition-colors"
                          onClick={handleClearSearch}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground truncate">
                                {result.name}
                              </h3>
                              {result.description && (
                                <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                                  {result.description}
                                </p>
                              )}
                            </div>
                            <div className="text-sm font-bold text-primary whitespace-nowrap">
                              ${result.basePrice.toFixed(2)}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-muted-foreground">
                      No flowers found for "{searchQuery}" 🥀
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold font-heading text-foreground mb-8">
          ✨ Discover Products
        </h2>

        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {error && (
          <div className="bg-error/10 border-2 border-error/20 rounded-2xl p-6 mb-8 text-center animate-fade-in">
            <p className="text-error font-medium">{error}</p>
          </div>
        )}

        {!isLoading && !error && (
          <>
            {/* Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {displayedProducts.map((product, index) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className={`group relative rounded-2xl overflow-hidden bg-card border-2 border-border hover:border-primary/50 hover:shadow-card-hover transition-all duration-300 animate-fade-in stagger-${Math.min(index % 8 + 1, 8)}`}
                >
                  {/* Image */}
                  <div className="relative overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-56 bg-gradient-to-br from-accent to-muted flex items-center justify-center">
                        <span className="text-4xl group-hover:animate-float">🌸</span>
                      </div>
                    )}

                    {/* Sold Out Badge */}
                    {product.isOutOfStock && (
                      <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
                        <span className="bg-sold-out text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                          Sold Out
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-1.5">
                    <h3 className="font-bold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {product.categoryName || 'Flowers'}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-primary">
                        ${product.basePrice.toFixed(2)}
                      </p>
                      {product.ownerId && (
                        <Link
                          to={`/shops/${product.ownerId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-muted-foreground hover:text-primary transition-colors truncate max-w-[80px]"
                        >
                          {ownerNames[product.ownerId] || 'Shop'}
                        </Link>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Infinite Scroll Trigger */}
            {hasMore && (
              <div ref={observerTarget} className="py-10 text-center">
                {isLoadingMore && (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <span className="animate-pulse-soft">🌸</span>
                    <span>Loading more blooms...</span>
                  </div>
                )}
              </div>
            )}

            {!hasMore && displayedProducts.length > 0 && (
              <div className="text-center py-10">
                <p className="text-muted-foreground text-sm">
                  You've explored all our flowers! 🌺
                </p>
              </div>
            )}

            {displayedProducts.length === 0 && (
              <div className="text-center py-16 bg-card rounded-3xl border-2 border-border animate-fade-in-up">
                <span className="text-5xl mb-4 block">🌱</span>
                <h3 className="font-bold text-foreground text-lg mb-1">No products yet</h3>
                <p className="text-muted-foreground text-sm">Check back soon for beautiful blooms!</p>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
};
