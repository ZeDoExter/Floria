import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchProductDetail, ProductDetail } from '../api/products';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { canPlaceOrders } from '../utils/auth';

export const ProductDetailPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [groupErrors, setGroupErrors] = useState<Record<string, string | null>>({});
  const { add: addItem } = useCartStore();
  const { user } = useAuthStore();
  const canOrder = user ? canPlaceOrders(user.role) : true;

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

  const handleAddToCart = () => {
    if (!product) {
      return;
    }
    setFormError(null);

    if (!canOrder) {
      setFormError('Store owners cannot place orders from their own catalog.');
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
      setFormError('Please fix the highlighted option groups before adding this arrangement to your cart.');
      return;
    }

    setGroupErrors(nextGroupErrors);
    const optionIds = Object.values(selectedOptions).flat();
    addItem({ productId: product.id, quantity: 1, selectedOptionIds: optionIds, unitPrice: price, productName: product?.name ?? "" } as any);
    navigate('/cart');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error/10 border-l-4 border-error text-error p-6 rounded-xl">
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-card rounded-2xl shadow-md p-8 text-center">
        <p className="text-muted-foreground text-lg">Product not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Product Header */}
      <div className="bg-card rounded-3xl shadow-lg p-6 space-y-3">
        <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
        {product.description && (
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>
        )}
        <div className="flex items-baseline gap-2">
          <span className="text-sm text-muted-foreground">Price:</span>
          <span className="text-3xl font-bold text-primary">฿{price.toFixed(2)}</span>
        </div>
      </div>

      {/* Option Groups */}
      <div className="space-y-4">
        {product.optionGroups.map((group) => (
          <div key={group.id} className="bg-card rounded-2xl shadow-md p-6 space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">{group.name}</h2>
              {group.description && (
                <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                <span className={group.isRequired ? "text-primary font-medium" : ""}>
                  {group.isRequired ? 'Required' : 'Optional'}
                </span>
                {' · '}Select between {group.minSelect} and {group.maxSelect || group.options.length}
              </p>
            </div>

            <ul className="space-y-2">
              {group.options.map((option) => {
                const isSelected = selectedOptions[group.id]?.includes(option.id);
                return (
                  <li key={option.id}>
                    <label
                      className={`
                        flex items-center justify-between gap-4 p-4 rounded-xl border-2 
                        cursor-pointer transition-all
                        ${isSelected 
                          ? 'border-primary bg-primary/5 shadow-sm' 
                          : 'border-border bg-white hover:border-primary/50 hover:shadow-sm'
                        }
                      `}
                    >
                      <div className="flex-1">
                        <span className="font-semibold text-foreground">{option.name}</span>
                        {option.description && (
                          <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                        )}
                        {option.priceModifier !== 0 && (
                          <p className="text-sm text-primary font-medium mt-1">
                            {option.priceModifier > 0 ? '+' : ''}฿{option.priceModifier.toFixed(2)}
                          </p>
                        )}
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOption(group, option.id)}
                        className="w-5 h-5 rounded border-2 border-primary text-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                      />
                    </label>
                  </li>
                );
              })}
            </ul>

            {groupErrors[group.id] && (
              <p className="text-sm text-error font-medium bg-error/10 p-3 rounded-lg">
                {groupErrors[group.id]}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Error Messages */}
      {formError && (
        <div className="bg-error/10 border-l-4 border-error text-error p-4 rounded-lg">
          <p className="text-sm font-medium">{formError}</p>
        </div>
      )}

      {!canOrder && (
        <div className="bg-warning/10 border-l-4 border-warning text-warning p-4 rounded-lg">
          <p className="text-sm font-medium">
            Store owners can manage products but cannot purchase from their own shop.
          </p>
        </div>
      )}

      {/* Add to Cart Button */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={!canOrder}
        className="w-full bg-primary text-primary-foreground px-6 py-4 rounded-2xl font-bold text-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
      >
        Add to cart
      </button>
    </div>
  );
};


