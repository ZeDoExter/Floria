import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchProductDetail, ProductDetail } from '../api/products';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
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
  const { addItem } = useCart();
  const { user } = useAuth();
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
    return <p>Loading arrangement...</p>;
  }

  if (error) {
    return <p style={{ color: '#c2415c' }}>{error}</p>;
  }

  if (!product) {
    return <p>Product not found.</p>;
  }

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 28, marginBottom: 6, color: '#c2415c' }}>{product.name}</h1>
        {product.description && <p style={{ marginBottom: 6 }}>{product.description}</p>}
        <p style={{ fontSize: 20, fontWeight: 600 }}>${price.toFixed(2)}</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {product.optionGroups.map((group, index) => (
          <div 
            key={group.id} 
            style={{ 
              border: '2px solid #e5e5e5', 
              background: '#fff', 
              padding: 20,
              borderRadius: 8,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ 
                  background: '#c2415c', 
                  color: '#fff', 
                  padding: '2px 8px', 
                  borderRadius: 4, 
                  fontSize: 12,
                  fontWeight: 600
                }}>
                  {index + 1}
                </span>
                <h2 style={{ fontSize: 18, margin: 0, color: '#c2415c' }}>{group.name}</h2>
                {group.isRequired && (
                  <span style={{ 
                    background: '#fff5f8', 
                    color: '#c2415c', 
                    padding: '2px 8px', 
                    borderRadius: 4, 
                    fontSize: 11,
                    fontWeight: 600,
                    border: '1px solid #f6c4d5'
                  }}>
                    REQUIRED
                  </span>
                )}
              </div>
              {group.description && <p style={{ fontSize: 14, margin: '4px 0 0 0', color: '#666' }}>{group.description}</p>}
              <p style={{ fontSize: 12, color: '#888', margin: '4px 0 0 0' }}>
                Select {group.minSelect === group.maxSelect 
                  ? `exactly ${group.minSelect}` 
                  : `${group.minSelect} to ${group.maxSelect || group.options.length}`} option{(group.maxSelect || group.options.length) > 1 ? 's' : ''}
              </p>
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 0, margin: 0 }}>
              {group.options.map((option) => {
                const isSelected = selectedOptions[group.id]?.includes(option.id);
                return (
                  <li key={option.id} style={{ listStyle: 'none' }}>
                    <label
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 12,
                        border: isSelected ? '2px solid #c2415c' : '1px solid #e5e5e5',
                        padding: '12px 16px',
                        background: isSelected ? '#fff5f8' : '#fafafa',
                        cursor: 'pointer',
                        borderRadius: 6,
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 600, fontSize: 15 }}>{option.name}</span>
                          {option.priceModifier !== 0 && (
                            <span style={{ 
                              color: option.priceModifier > 0 ? '#c2415c' : '#2f855a',
                              fontSize: 14,
                              fontWeight: 600
                            }}>
                              {option.priceModifier > 0 ? '+' : ''}{option.priceModifier.toFixed(2)} บาท
                            </span>
                          )}
                        </div>
                        {option.description && <p style={{ fontSize: 13, margin: '4px 0 0 0', color: '#666' }}>{option.description}</p>}
                      </div>
                      <input 
                        type="checkbox" 
                        checked={isSelected} 
                        onChange={() => toggleOption(group, option.id)}
                        style={{ width: 20, height: 20, cursor: 'pointer' }}
                      />
                    </label>
                  </li>
                );
              })}
            </ul>
            {groupErrors[group.id] && (
              <p style={{ 
                marginTop: 12, 
                fontSize: 13, 
                color: '#c2415c',
                background: '#fff5f8',
                padding: '8px 12px',
                borderRadius: 4,
                border: '1px solid #f6c4d5'
              }}>
                ⚠️ {groupErrors[group.id]}
              </p>
            )}
          </div>
        ))}
      </div>
      {formError && <p style={{ color: '#c2415c' }}>{formError}</p>}
      {!canOrder && <p style={{ color: '#c2415c' }}>Store owners can manage products but cannot purchase from their own shop.</p>}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={!canOrder}
        style={{
          background: '#c2415c',
          color: '#fff',
          padding: '8px 16px',
          border: 'none',
          cursor: !canOrder ? 'not-allowed' : 'pointer',
          opacity: !canOrder ? 0.6 : 1
        }}
      >
        Add to cart
      </button>
    </section>
  );
};


