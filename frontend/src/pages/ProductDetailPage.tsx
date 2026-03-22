import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProductDetail, ProductDetail } from '../api/products';
import { fetchUserProfile } from '../api/users';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { canPlaceOrders } from '../utils/auth';
import { PackageIcon } from '../components/icons/PackageIcon';

export const ProductDetailPage = () => {
  const { productId: id } = useParams<{ productId: string }>();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [ownerName, setOwnerName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [addedToCart, setAddedToCart] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);

  const canOrder = user ? canPlaceOrders(user.role) : true;

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await fetchProductDetail(id);
        setProduct(data);

        // Initialize selected options
        const initial: Record<string, string[]> = {};
        data.optionGroups.forEach(g => { initial[g.id] = []; });
        setSelectedOptions(initial);

        if (data.ownerId) {
          try {
            const owner = await fetchUserProfile(data.ownerId);
            setOwnerName(owner.firstName || 'Shop');
          } catch {
            setOwnerName('Shop');
          }
        }
      } catch (err) {
        setError('Could not load product details.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, [id]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="skeleton w-full h-80 rounded-3xl" />
            <div className="space-y-4">
              <div className="skeleton h-8 w-3/4" />
              <div className="skeleton h-4 w-1/2" />
              <div className="skeleton h-6 w-1/3" />
              <div className="skeleton h-20 w-full" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center animate-fade-in">
          <PackageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-bold text-foreground mb-2">Oops!</h2>
          <p className="text-muted-foreground mb-4">{error || 'Product not found'}</p>
          <Link to="/" className="inline-block bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-bold text-sm hover:bg-secondary transition-colors shadow-soft">
            Back to Shop
          </Link>
        </div>
      </main>
    );
  }

  const toggleOption = (groupId: string, optionId: string, maxSelect: number) => {
    setSelectedOptions(prev => {
      const current = prev[groupId] || [];
      const isSelected = current.includes(optionId);
      if (isSelected) {
        return { ...prev, [groupId]: current.filter(id => id !== optionId) };
      }
      if (maxSelect === 1) {
        // Radio button — replace selection
        return { ...prev, [groupId]: [optionId] };
      }
      if (maxSelect > 0 && current.length >= maxSelect) return prev;
      return { ...prev, [groupId]: [...current, optionId] };
    });
  };

  const calculateTotalPrice = () => {
    let total = product.basePrice;
    product.optionGroups.forEach(group => {
      const selected = selectedOptions[group.id] || [];
      selected.forEach(optId => {
        const option = group.options.find(o => o.id === optId);
        if (option) total += option.priceModifier;
      });
    });
    return total;
  };

  const validateOptions = () => {
    for (const group of product.optionGroups) {
      if (group.isRequired) {
        const selected = selectedOptions[group.id] || [];
        if (selected.length < group.minSelect) return false;
      }
    }
    return true;
  };

  const handleAddToCart = async () => {
    if (!validateOptions() || product.isOutOfStock) return;

    const allSelectedIds = Object.values(selectedOptions).flat();
    setCartError(null);
    try {
      await addItem({
        productId: product.id,
        quantity: 1,
        selectedOptionIds: allSelectedIds,
        unitPrice: calculateTotalPrice(),
        productName: product.name
      } as any);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (err: any) {
      setCartError(err?.message || 'Could not add to cart');
    }
  };

  const totalPrice = calculateTotalPrice();
  const isValid = validateOptions();

  return (
    <main className="min-h-screen bg-background px-4 py-8 md:py-12">
      <div className="mx-auto max-w-4xl animate-fade-in-up">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
            ← Back to Shop
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden border border-border shadow-card">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-80 md:h-[420px] object-cover"
                />
              ) : (
                <div className="w-full h-80 md:h-[420px] bg-gradient-to-br from-accent to-muted flex items-center justify-center">
                  <PackageIcon className="h-16 w-16 text-muted-foreground" />
                </div>
              )}

              {/* Sold Out Overlay */}
              {product.isOutOfStock && (
                <div className="absolute inset-0 bg-background/70 rounded-2xl flex items-center justify-center">
                  <div className="bg-card border border-border text-muted-foreground px-6 py-2 rounded-full font-semibold text-sm uppercase tracking-wider"
                    style={{ fontFamily: "'Inter', sans-serif" }}>
                    Sold Out
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-5">
            <div>
              <h1 className="text-3xl text-foreground mb-2"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>
                {product.name}
              </h1>
              {product.categoryName && (
                <p className="text-sm text-muted-foreground font-medium">
                  {product.categoryName}
                </p>
              )}
              {ownerName && (
                <Link
                  to={`/shops/${product.ownerId}`}
                  className="inline-block mt-1 text-sm text-primary font-semibold hover:text-secondary transition-colors"
                >
                  by {ownerName}
                </Link>
              )}
            </div>

            <p className="text-4xl text-primary"
              style={{ fontFamily: "'DM Serif Display', serif" }}>
              ฿{totalPrice.toFixed(0)}
            </p>

            {product.description && (
              <p className="text-foreground/80 leading-relaxed text-sm"
                style={{ fontFamily: "'Sarabun', sans-serif" }}>
                {product.description}
              </p>
            )}

            {/* Option Groups */}
            {product.optionGroups.length > 0 && (
              <div className="space-y-4">
                {product.optionGroups.map(group => (
                  <div key={group.id} className="bg-muted/50 rounded-2xl p-4 border border-border">
                    <div className="mb-3">
                      <h3 className="font-bold text-foreground text-sm" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                        {group.name}
                        {group.isRequired && <span className="text-sold-out ml-1">*</span>}
                      </h3>
                      {group.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{group.description}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {group.options.map(option => {
                        const isSelected = selectedOptions[group.id]?.includes(option.id);
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => toggleOption(group.id, option.id, group.maxSelect)}
                            disabled={product.isOutOfStock}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${isSelected
                                ? 'bg-primary text-primary-foreground shadow-soft scale-105'
                                : 'bg-card text-foreground border-2 border-border hover:border-primary/50'
                              } ${product.isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {option.name}
                            {option.priceModifier !== 0 && (
                              <span className="ml-1 text-xs opacity-80">
                                ({option.priceModifier > 0 ? '+' : ''}${option.priceModifier.toFixed(2)})
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add to Cart */}
            {product.isOutOfStock ? (
              <div className="bg-sold-out/10 border-2 border-sold-out/20 rounded-2xl p-4 text-center">
                <p className="text-sold-out font-bold text-sm">
                  This product is currently out of stock.
                </p>
              </div>
            ) : canOrder ? (
              <button
                onClick={handleAddToCart}
                disabled={!isValid}
                className={`w-full py-3.5 rounded-full font-bold text-sm transition-all duration-300 shadow-soft ${addedToCart
                    ? 'bg-success text-success-foreground scale-105'
                    : isValid
                      ? 'bg-primary text-primary-foreground hover:bg-secondary hover:shadow-soft-lg'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
              >
                {addedToCart ? 'Added to Cart' : `Add to Cart — $${totalPrice.toFixed(2)}`}
              </button>
            ) : (
              <div className="bg-warning/10 border-2 border-warning/30 rounded-2xl p-4 text-center">
                <p className="text-sm text-foreground font-medium">
                  Switch to a customer account to place orders.
                </p>
              </div>
            )}

            {cartError && (
              <p className="text-sm text-error font-medium text-center animate-fade-in">{cartError}</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
