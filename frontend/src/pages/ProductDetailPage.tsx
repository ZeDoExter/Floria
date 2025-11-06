import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchProductDetail, ProductDetail } from '../api/products';
import { useCart } from '../context/CartContext';

export const ProductDetailPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();

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

  const toggleOption = (groupId: string, optionId: string) => {
    setSelectedOptions((prev) => {
      const current = prev[groupId] || [];
      if (current.includes(optionId)) {
        return { ...prev, [groupId]: current.filter((id) => id !== optionId) };
      }
      return { ...prev, [groupId]: [...current, optionId] };
    });
  };

  const handleAddToCart = () => {
    if (!product) {
      return;
    }
    const optionIds = Object.values(selectedOptions).flat();
    addItem({ productId: product.id, quantity: 1, selectedOptionIds: optionIds });
    navigate('/cart');
  };

  if (isLoading) {
    return <p>Loading arrangement...</p>;
  }

  if (error) {
    return <p className="text-rose-600">{error}</p>;
  }

  if (!product) {
    return <p>Product not found.</p>;
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-rose-600">{product.name}</h1>
        {product.description && <p className="text-slate-600">{product.description}</p>}
        <p className="text-xl font-semibold text-slate-700">${price.toFixed(2)}</p>
      </div>
      <div className="space-y-4">
        {product.optionGroups.map((group) => (
          <div key={group.id} className="rounded border border-rose-100 bg-white p-4">
            <h2 className="text-lg font-semibold text-rose-600">{group.name}</h2>
            {group.description && <p className="text-sm text-slate-600">{group.description}</p>}
            <p className="text-xs text-slate-500">
              {group.isRequired ? 'Required' : 'Optional'} · select between {group.minSelect} and {group.maxSelect || group.options.length}
            </p>
            <ul className="mt-3 space-y-2">
              {group.options.map((option) => {
                const isSelected = selectedOptions[group.id]?.includes(option.id);
                return (
                  <li key={option.id}>
                    <label className="flex cursor-pointer items-center justify-between rounded border border-rose-100 bg-rose-50 px-3 py-2">
                      <span>
                        <span className="font-medium text-slate-700">{option.name}</span>
                        {option.description && <p className="text-xs text-slate-500">{option.description}</p>}
                      </span>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOption(group.id, option.id)}
                      />
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <button onClick={handleAddToCart} className="rounded bg-rose-500 px-6 py-2 font-semibold text-white">
        Add to cart
      </button>
    </section>
  );
};
