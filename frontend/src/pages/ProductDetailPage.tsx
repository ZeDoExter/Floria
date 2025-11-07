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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {product.optionGroups.map((group) => (
          <div key={group.id} style={{ border: '1px solid #eee', background: '#fff', padding: 16 }}>
            <h2 style={{ fontSize: 18, marginBottom: 4, color: '#c2415c' }}>{group.name}</h2>
            {group.description && <p style={{ fontSize: 14, marginBottom: 4 }}>{group.description}</p>}
            <p style={{ fontSize: 12, color: '#555' }}>
              {group.isRequired ? 'Required' : 'Optional'} – select between {group.minSelect} and{' '}
              {group.maxSelect || group.options.length}
            </p>
            <ul style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8, padding: 0 }}>
              {group.options.map((option) => {
                const isSelected = selectedOptions[group.id]?.includes(option.id);
                return (
                  <li key={option.id} style={{ listStyle: 'none' }}>
                    <label
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 12,
                        border: '1px solid #eee',
                        padding: '8px 12px',
                        background: isSelected ? '#fde4ec' : '#fafafa',
                        cursor: 'pointer'
                      }}
                    >
                      <span>
                        <span style={{ fontWeight: 600 }}>{option.name}</span>
                        {option.description && <p style={{ fontSize: 12 }}>{option.description}</p>}
                      </span>
                      <input type="checkbox" checked={isSelected} onChange={() => toggleOption(group, option.id)} />
                    </label>
                  </li>
                );
              })}
            </ul>
            {groupErrors[group.id] && <p style={{ marginTop: 8, fontSize: 12, color: '#c2415c' }}>{groupErrors[group.id]}</p>}
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


