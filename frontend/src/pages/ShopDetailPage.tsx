import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchProducts, ProductSummary } from '../api/products';
import { fetchCategories, Category } from '../api/catalog';
import { fetchUserProfile, UserProfile } from '../api/users';
import { PackageIcon } from '../components/icons/PackageIcon';

export const ShopDetailPage = () => {
  const { ownerId } = useParams<{ ownerId: string }>();
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [owner, setOwner] = useState<UserProfile | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ownerId) return;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [productsData, categoriesData, ownerData] = await Promise.all([
          fetchProducts(),
          fetchCategories(),
          fetchUserProfile(ownerId)
        ]);
        
        // Filter products by owner
        const shopProducts = productsData.filter((p: ProductSummary) => p.ownerId === ownerId);
        setProducts(shopProducts);
        setCategories(categoriesData);
        setOwner(ownerData);
      } catch (err) {
        setError('Unable to load shop details.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [ownerId]);

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.categoryId === selectedCategory);

  const shopName = owner?.firstName || 'Shop';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading shop...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-error/10 border border-error rounded-lg p-4">
          <p className="text-error text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto max-w-5xl">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex items-center gap-2 text-foreground hover:text-primary transition-colors"
        >
          <span className="text-xl">←</span>
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Shop Header */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden mb-7">
          <div className="p-6">
            <h1 className="text-3xl font-bold text-foreground mb-4">{shopName}</h1>
            <div className="flex items-center gap-4 flex-wrap text-sm">
              <div className="flex items-center gap-2">
                <PackageIcon className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">{products.length} Products</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-success rounded-full"></span>
                <span className="text-success font-medium">Open</span>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4">Browse Products</h2>
            
            {/* Category Filter */}
            {products.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground hover:bg-border'
                  }`}
                >
                  All
                </button>
                {categories
                  .filter(cat => products.some(p => p.categoryId === cat.id))
                  .map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedCategory === category.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground hover:bg-border'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="rounded-xl overflow-hidden bg-card border border-border hover:shadow-md hover:border-primary transition-all group"
                >
                  <div className="relative overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-52 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-52 sm:h-56 bg-muted flex items-center justify-center">
                        <PackageIcon className="h-12 w-12 text-muted-foreground opacity-30" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 space-y-1.5">
                    <p className="text-xs text-primary font-semibold uppercase tracking-wide">
                      {product.categoryName || 'Product'}
                    </p>
                    <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-primary font-bold text-base">
                      ${product.basePrice.toFixed(2)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-card rounded-xl border border-border">
              <PackageIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground text-base">
                {selectedCategory === 'all' 
                  ? 'No products available' 
                  : 'No products in this category'}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
