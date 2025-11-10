import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchProductDetail, ProductDetail } from '../api/products';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { canPlaceOrders } from '../utils/auth';
import { PackageIcon } from '../components/icons/PackageIcon';

export const ProductDetailPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [groupErrors, setGroupErrors] = useState<Record<string, string | null>>({});
  const { addItem } = useCart();
  const { user } = useAuth();
  
  const isOwnProduct = user && product && user.userId === product.ownerId;
  const canOrder = user ? (canPlaceOrders(user.role) && !isOwnProduct) : true;

  useEffect(() => {
    if (!productId) {
      return;
    }

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchProductDetail(productId);
        setProduct(data);
        setSelectedOptions(
          data.optionGroups.reduce<Record<string, string[]>>((acc, group) => {
            acc[group.id] = [];
            return acc;
          }, {})
        );
        setGroupErrors(
          data.optionGroups.reduce<Record<string, string | null>>((acc, group) => {
            acc[group.id] = null;
            return acc;
          }, {})
        );
      } catch (err) {
        setError('Unable to load this product.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [productId]);

  const price = useMemo(() => {
    if (!product) {
      return 0;
    }
    const base = product.basePrice;
    const modifiers = product.optionGroups.reduce((total, group) => {
      const selected = selectedOptions[group.id] || [];
      const sum = selected.reduce((groupTotal, optionId) => {
        const option = group.options.find((o) => o.id === optionId);
        return groupTotal + (option?.priceModifier ?? 0);
      }, 0);
      return total + sum;
    }, 0);
    return base + modifiers;
  }, [product, selectedOptions]);

  const toggleOption = (group: ProductDetail['optionGroups'][number], optionId: string) => {
    setFormError(null);
    setSelectedOptions((prev) => {
      const current = prev[group.id] || [];
      const isSelected = current.includes(optionId);

      if (!isSelected && group.maxSelect > 0 && current.length >= group.maxSelect) {
        setGroupErrors((errors) => ({
          ...errors,
          [group.id]: `You can select up to ${group.maxSelect} option${group.maxSelect > 1 ? 's' : ''}.`
        }));
        return prev;
      }

      const updatedSelection = isSelected
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];

      setGroupErrors((errors) => ({
        ...errors,
        [group.id]: null
      }));

      return { ...prev, [group.id]: updatedSelection };
    });
  };

  const handleAddToCart = async () => {
    if (!product) {
      return;
    }
    setFormError(null);

    if (!user) {
      setFormError('Please sign in to add items to cart');
      return;
    }

    if (isOwnProduct) {
      setFormError('You cannot order from your own shop');
      return;
    }
    
    if (!canOrder) {
      setFormError('Please sign in to place orders');
      return;
    }

    const nextGroupErrors: Record<string, string | null> = {};
    let hasError = false;

    for (const group of product.optionGroups) {
      const selected = selectedOptions[group.id] ?? [];
      const requiredMin = Math.max(group.isRequired ? 1 : 0, group.minSelect ?? 0);

      if (selected.length < requiredMin) {
        hasError = true;
        nextGroupErrors[group.id] = `Please select at least ${requiredMin} option${requiredMin > 1 ? 's' : ''} for "${group.name}".`;
        continue;
      }

      if (group.maxSelect > 0 && selected.length > group.maxSelect) {
        hasError = true;
        nextGroupErrors[group.id] = `You can select up to ${group.maxSelect} option${group.maxSelect > 1 ? 's' : ''} for "${group.name}".`;
        continue;
      }

      nextGroupErrors[group.id] = null;
    }

    if (hasError) {
      setGroupErrors(nextGroupErrors);
      setFormError('Please fix the highlighted option groups before adding to cart.');
      return;
    }

    setGroupErrors(nextGroupErrors);
    const optionIds = Object.values(selectedOptions).flat();
    
    try {
      await addItem({ 
        productId: product.id, 
        quantity: 1, 
        selectedOptionIds: optionIds, 
        unitPrice: price, 
        productName: product?.name ?? "" 
      } as any);
      navigate('/cart');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to add item to cart');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading arrangement...</p>
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

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Product not found.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-4">
      <div className="mx-auto max-w-lg">
        {/* Main Card Container - includes everything */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          {/* Back Button inside card */}
          <div className="p-4 pb-0">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-foreground hover:text-primary transition-colors"
            >
              <span className="text-xl">←</span>
              <span className="text-sm font-medium">Back</span>
            </button>
          </div>

          {/* Product Image */}
          <div className="bg-muted mt-4">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-72 object-cover"
              />
            ) : (
              <div className="w-full h-72 bg-muted flex items-center justify-center">
                <PackageIcon className="h-20 w-20 text-muted-foreground opacity-30" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-5 space-y-4">
            {/* Header */}
            <div className="pb-4 border-b border-border">
              <h1 className="text-xl font-bold text-foreground mb-2">{product.name}</h1>
              {product.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
              )}
            </div>

            {/* Option Groups */}
            {product.optionGroups.length > 0 && (
              <div className="space-y-4">
                {product.optionGroups.map((group) => (
                  <div key={group.id} className="space-y-2.5">
                    {/* Group Header */}
                    <div>
                      <h3 className="text-base font-semibold text-foreground">
                        {group.name}
                        {group.isRequired && <span className="text-error ml-1">*</span>}
                      </h3>
                      {group.description && (
                        <p className="text-xs text-muted-foreground mt-1">{group.description}</p>
                      )}
                    </div>

                    {/* Options */}
                    <div className="flex flex-wrap gap-2">
                      {group.options.map((option) => {
                        const isSelected = selectedOptions[group.id]?.includes(option.id);
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => toggleOption(group, option.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              isSelected
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-foreground border border-border hover:border-primary'
                            }`}
                          >
                            {option.name}
                            {option.priceModifier !== 0 && (
                              <span className="ml-1 text-xs">
                                ({option.priceModifier > 0 ? '+' : ''}${option.priceModifier.toFixed(2)})
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Group Error */}
                    {groupErrors[group.id] && (
                      <p className="text-xs text-error">
                        {groupErrors[group.id]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Form Error */}
            {formError && (
              <div className="bg-error/10 border border-error rounded-lg p-3">
                <p className="text-xs text-error">{formError}</p>
              </div>
            )}

            {/* Add to Cart Button */}
            <div className="pt-4 border-t border-border">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!canOrder}
                className="w-full bg-success text-white py-3 px-5 rounded-lg font-bold text-base hover:bg-success/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Purchase - ${price.toFixed(2)}
              </button>

              {!canOrder && isOwnProduct && (
                <p className="text-xs text-error text-center mt-2">
                  You cannot order from your own shop
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
