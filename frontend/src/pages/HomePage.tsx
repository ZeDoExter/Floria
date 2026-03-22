import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts, ProductSummary } from '../api/products';
import { fetchUserProfile } from '../api/users';
import { searchProducts, SearchProductResult } from '../api/search';
import { PackageIcon } from '../components/icons/PackageIcon';
import { SearchIcon } from '../components/icons/SearchIcon';
import { XMarkIcon } from '../components/icons/XMarkIcon';

const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden bg-card border border-border">
    <div className="skeleton aspect-square w-full" />
    <div className="p-3 space-y-2">
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
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center animate-fade-in-up">
            {/* Left: Text + Search */}
            <div className="space-y-6">
              <div className="inline-block text-xs font-semibold text-muted-foreground uppercase tracking-[3px]"
                style={{ fontFamily: "'Inter', sans-serif" }}>
                Premium Flower Boutique · Bangkok
              </div>
              <h1 className="text-5xl lg:text-6xl font-light text-foreground leading-[1.1]"
                style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: '-0.5px' }}>
                Fresh Blooms,{' '}
                <em className="text-primary">Curated</em>{' '}
                for You
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed"
                style={{ fontFamily: "'Sarabun', sans-serif" }}>
                ดอกไม้สดคัดพิเศษจากฟาร์ม พร้อมบริการจัดช่อตามต้องการ ส่งถึงบ้านทุกวัน
              </p>

              {/* Search Bar */}
              <div className="max-w-xl relative">
                <div className="flex bg-card border border-border rounded-full overflow-hidden shadow-[0_4px_20px_rgba(180,80,100,0.08)]">
                  <div className="flex items-center pl-5 text-muted-foreground">
                    <SearchIcon className="h-4 w-4" />
                  </div>
                  <input
                    id="search-products"
                    type="text"
                    placeholder="ค้นหาดอกไม้, ช่อดอกไม้..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 pl-3 pr-4 py-3.5 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm"
                    style={{ fontFamily: "'Sarabun', sans-serif" }}
                  />
                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="pr-4 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Clear search"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Search Results Dropdown */}
                {searchQuery && (
                  <div className="absolute z-10 mt-2 w-full bg-card border border-border rounded-2xl shadow-[0_8px_32px_rgba(180,80,100,0.10)] max-h-96 overflow-y-auto animate-scale-in">
                    {isSearching ? (
                      <div className="p-6 text-center text-muted-foreground text-sm">Searching...</div>
                    ) : searchResults.length > 0 ? (
                      <div className="py-2">
                        {searchResults.map((result) => (
                          <Link
                            key={result.id}
                            to={`/products/${result.id}`}
                            className="block px-4 py-3 hover:bg-accent transition-colors"
                            onClick={handleClearSearch}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-foreground truncate text-sm"
                                  style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                  {result.name}
                                </h3>
                                {result.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5"
                                    style={{ fontFamily: "'Sarabun', sans-serif" }}>
                                    {result.description}
                                  </p>
                                )}
                              </div>
                              <div className="text-sm text-primary whitespace-nowrap"
                                style={{ fontFamily: "'DM Serif Display', serif" }}>
                                ฿{result.basePrice.toFixed(0)}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-muted-foreground text-sm"
                        style={{ fontFamily: "'Sarabun', sans-serif" }}>
                        ไม่พบสินค้า "{searchQuery}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Featured product cards (decorative) */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Featured top-card placeholder — shows first loaded product if available */}
                {displayedProducts[0] && (
                  <Link
                    to={`/products/${displayedProducts[0].id}`}
                    className="block bg-card rounded-2xl border border-border shadow-[0_8px_32px_rgba(180,80,100,0.10)] overflow-hidden mb-3 hover:shadow-[0_12px_40px_rgba(180,80,100,0.16)] transition-all duration-300"
                  >
                    <div className="flex h-24">
                      <div className="w-32 flex-shrink-0 bg-gradient-to-br from-accent to-muted overflow-hidden">
                        {displayedProducts[0].imageUrl ? (
                          <img src={displayedProducts[0].imageUrl} alt={displayedProducts[0].name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <PackageIcon className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 p-4 flex flex-col justify-center">
                        <div className="text-xs text-primary font-semibold uppercase tracking-wider mb-1"
                          style={{ fontFamily: "'Inter', sans-serif" }}>Featured</div>
                        <div className="text-base text-foreground font-semibold"
                          style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                          {displayedProducts[0].name}
                        </div>
                        <div className="text-base text-primary mt-1"
                          style={{ fontFamily: "'DM Serif Display', serif" }}>
                          ฿{displayedProducts[0].basePrice.toFixed(0)}
                        </div>
                      </div>
                    </div>
                  </Link>
                )}
                {/* Two small cards */}
                <div className="grid grid-cols-2 gap-3">
                  {displayedProducts.slice(1, 3).map((product) => (
                    <Link
                      key={product.id}
                      to={`/products/${product.id}`}
                      className="block bg-card rounded-2xl border border-border shadow-[0_4px_16px_rgba(180,80,100,0.07)] overflow-hidden hover:shadow-[0_8px_28px_rgba(180,80,100,0.14)] transition-all duration-300"
                    >
                      <div className="aspect-square bg-gradient-to-br from-accent to-muted overflow-hidden">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <PackageIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <div className="text-sm text-foreground font-medium"
                          style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                          {product.name}
                        </div>
                        <div className="text-sm text-primary mt-0.5"
                          style={{ fontFamily: "'DM Serif Display', serif" }}>
                          ฿{product.basePrice.toFixed(0)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px bg-gradient-to-r from-transparent to-border flex-1" />
          <h2 className="text-2xl italic text-foreground whitespace-nowrap"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Discover All Products
          </h2>
          <div className="h-px bg-gradient-to-l from-transparent to-border flex-1" />
        </div>

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
                  className={`group relative bg-card rounded-2xl overflow-hidden border border-border hover:shadow-[0_8px_28px_rgba(180,80,100,0.14)] transition-all duration-300 animate-fade-in stagger-${Math.min(index % 8 + 1, 8)}`}
                  style={{ boxShadow: '0 4px 16px rgba(180, 80, 100, 0.07)' }}
                >
                  {/* Square Image */}
                  <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-accent to-muted">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PackageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}

                    {/* Category badge */}
                    {product.categoryName && !product.isOutOfStock && (
                      <div className="absolute bottom-2 left-2 bg-white/90 text-muted-foreground text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{ fontFamily: "'Inter', sans-serif" }}>
                        {product.categoryName}
                      </div>
                    )}

                    {/* Sold Out Overlay */}
                    {product.isOutOfStock && (
                      <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                        <span className="bg-card border border-border text-muted-foreground text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full"
                          style={{ fontFamily: "'Inter', sans-serif" }}>
                          Sold Out
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <div className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors mb-0.5"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      {product.name}
                    </div>
                    {product.categoryName && (
                      <div className="text-[11px] text-muted-foreground mb-2"
                        style={{ fontFamily: "'Sarabun', sans-serif" }}>
                        {product.categoryName}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-base text-primary"
                        style={{ fontFamily: "'DM Serif Display', serif" }}>
                        ฿{product.basePrice.toFixed(0)}
                      </span>
                      {!product.isOutOfStock && (
                        <button
                          onClick={(e) => { e.preventDefault(); }}
                          className="w-7 h-7 rounded-full bg-primary-light text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 flex items-center justify-center flex-shrink-0"
                          aria-label="View product"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                          </svg>
                        </button>
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
                    <span>Loading more products...</span>
                  </div>
                )}
              </div>
            )}

            {!hasMore && displayedProducts.length > 0 && (
              <div className="text-center py-10">
                <p className="text-muted-foreground text-sm">
                  You've explored all our flowers.
                </p>
              </div>
            )}

            {displayedProducts.length === 0 && (
              <div className="text-center py-16 bg-card rounded-2xl border border-border animate-fade-in-up">
                <PackageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
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
