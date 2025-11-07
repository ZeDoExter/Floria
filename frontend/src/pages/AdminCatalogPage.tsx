import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Category,
  CreateOptionGroupInput,
  createCategory,
  createOption,
  createOptionGroup,
  createProduct,
  fetchCategories
} from '../api/catalog';
import { fetchProductDetail, fetchProducts, ProductDetail } from '../api/products';
import { useAuth } from '../context/AuthContext';
import { isAdminEmail } from '../utils/auth';

const SECTION_KEYS = ['categories', 'products', 'option-groups', 'options'] as const;
type SectionKey = (typeof SECTION_KEYS)[number];

type Feedback = {
  status: 'success' | 'error';
  message: string;
};

export const AdminCatalogPage = () => {
  const { user } = useAuth();
  const params = useParams<{ section?: string }>();
  const activeSection = SECTION_KEYS.find((key) => key === params.section) ?? undefined;
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [productForm, setProductForm] = useState({ name: '', description: '', basePrice: '', imageUrl: '', categoryId: '' });
  const [optionGroupForm, setOptionGroupForm] = useState({
    productId: '',
    name: '',
    description: '',
    isRequired: false,
    minSelect: '0',
    maxSelect: '0'
  });
  const [optionForm, setOptionForm] = useState({ optionGroupId: '', name: '', description: '', priceModifier: '0' });
  const [categoryFeedback, setCategoryFeedback] = useState<Feedback | null>(null);
  const [productFeedback, setProductFeedback] = useState<Feedback | null>(null);
  const [optionGroupFeedback, setOptionGroupFeedback] = useState<Feedback | null>(null);
  const [optionFeedback, setOptionFeedback] = useState<Feedback | null>(null);

  const categoriesRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);
  const optionGroupsRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const sectionRefs: Record<SectionKey, React.RefObject<HTMLDivElement>> = {
    categories: categoriesRef,
    products: productsRef,
    'option-groups': optionGroupsRef,
    options: optionsRef
  };

  const loadCatalog = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [categoryData, productSummaries] = await Promise.all([fetchCategories(), fetchProducts()]);
      const details = await Promise.all(
        productSummaries.map(async (summary) => {
          const detail = await fetchProductDetail(summary.id);
          return detail;
        })
      );
      setCategories(categoryData);
      setProducts(details);
    } catch (err) {
      console.error(err);
      setError('Unable to load catalog data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  useEffect(() => {
    if (!activeSection) {
      return;
    }
    const ref = sectionRefs[activeSection];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  const optionGroups = useMemo(() => {
    return products.flatMap((product) =>
      product.optionGroups.map((group) => ({
        id: group.id,
        name: group.name,
        productName: product.name
      }))
    );
  }, [products]);

  if (!isAdminEmail(user?.email)) {
    return (
      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h1 style={{ fontSize: 28, marginBottom: 4, color: '#c2415c' }}>Admin catalog</h1>
        <p>You need an administrator account to view and manage the catalog.</p>
      </section>
    );
  }

  const authToken = user?.token;

  const handleCreateCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCategoryFeedback(null);
    try {
      await createCategory(
        {
          name: categoryForm.name.trim(),
          description: categoryForm.description.trim() || undefined
        },
        authToken
      );
      setCategoryFeedback({ status: 'success', message: 'Category created successfully.' });
      setCategoryForm({ name: '', description: '' });
      await loadCatalog();
    } catch (err) {
      console.error(err);
      setCategoryFeedback({ status: 'error', message: 'Failed to create category. Please try again.' });
    }
  };

  const handleCreateProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProductFeedback(null);
    try {
      await createProduct(
        {
          name: productForm.name.trim(),
          description: productForm.description.trim() || undefined,
          basePrice: Number(productForm.basePrice || 0),
          imageUrl: productForm.imageUrl.trim() || undefined,
          categoryId: productForm.categoryId
        },
        authToken
      );
      setProductFeedback({ status: 'success', message: 'Product created successfully.' });
      setProductForm({ name: '', description: '', basePrice: '', imageUrl: '', categoryId: '' });
      await loadCatalog();
    } catch (err) {
      console.error(err);
      setProductFeedback({ status: 'error', message: 'Failed to create product. Please review the details and try again.' });
    }
  };

  const handleCreateOptionGroup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOptionGroupFeedback(null);
    try {
      const payload: CreateOptionGroupInput = {
        productId: optionGroupForm.productId,
        name: optionGroupForm.name.trim(),
        description: optionGroupForm.description.trim() || undefined,
        isRequired: optionGroupForm.isRequired,
        minSelect: Number(optionGroupForm.minSelect || 0),
        maxSelect: Number(optionGroupForm.maxSelect || 0)
      };
      await createOptionGroup(payload, authToken);
      setOptionGroupFeedback({ status: 'success', message: 'Option group created successfully.' });
      setOptionGroupForm({ productId: '', name: '', description: '', isRequired: false, minSelect: '0', maxSelect: '0' });
      await loadCatalog();
    } catch (err) {
      console.error(err);
      setOptionGroupFeedback({ status: 'error', message: 'Failed to create option group. Please try again.' });
    }
  };

  const handleCreateOption = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOptionFeedback(null);
    try {
      await createOption(
        {
          optionGroupId: optionForm.optionGroupId,
          name: optionForm.name.trim(),
          description: optionForm.description.trim() || undefined,
          priceModifier: Number(optionForm.priceModifier || 0)
        },
        authToken
      );
      setOptionFeedback({ status: 'success', message: 'Option created successfully.' });
      setOptionForm({ optionGroupId: '', name: '', description: '', priceModifier: '0' });
      await loadCatalog();
    } catch (err) {
      console.error(err);
      setOptionFeedback({ status: 'error', message: 'Failed to create option. Please try again.' });
    }
  };

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header>
        <h1 style={{ fontSize: 28, marginBottom: 4, color: '#c2415c' }}>Catalog management</h1>
        <p>Review existing catalog data and quickly add new categories, products, option groups, and options.</p>
        {isLoading && <p style={{ color: '#c2415c' }}>Loading catalog data…</p>}
        {error && <p style={{ color: '#c2415c' }}>{error}</p>}
      </header>

      <section ref={sectionRefs.categories} style={{ border: '1px solid #eee', background: '#fff', padding: 16 }}>
        <h2 style={{ fontSize: 22, marginBottom: 8, color: '#c2415c' }}>Categories</h2>
        <ul style={{ marginBottom: 12, paddingLeft: 16 }}>
          {categories.map((category) => (
            <li key={category.id}>
              <strong>{category.name}</strong>
              {category.description ? ` – ${category.description}` : ''}
            </li>
          ))}
          {categories.length === 0 && <li>No categories found.</li>}
        </ul>
        <form onSubmit={handleCreateCategory} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 14 }}>
            Name
            <input
              type="text"
              value={categoryForm.name}
              onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))}
              required
              style={{ marginTop: 4, padding: '6px 8px' }}
            />
          </label>
          <label style={{ fontSize: 14 }}>
            Description
            <textarea
              value={categoryForm.description}
              onChange={(event) => setCategoryForm((current) => ({ ...current, description: event.target.value }))}
              rows={2}
              style={{ marginTop: 4, padding: '6px 8px' }}
            />
          </label>
          <button type="submit" style={{ alignSelf: 'flex-start', background: '#c2415c', color: '#fff', padding: '6px 12px', border: 'none', cursor: 'pointer' }}>
            Create category
          </button>
          {categoryFeedback && (
            <p style={{ color: categoryFeedback.status === 'success' ? '#2f855a' : '#c2415c' }}>{categoryFeedback.message}</p>
          )}
        </form>
      </section>

      <section ref={sectionRefs.products} style={{ border: '1px solid #eee', background: '#fff', padding: 16 }}>
        <h2 style={{ fontSize: 22, marginBottom: 8, color: '#c2415c' }}>Products</h2>
        <ul style={{ marginBottom: 12, paddingLeft: 16 }}>
          {products.map((product) => (
            <li key={product.id}>
              <strong>{product.name}</strong> – ${product.basePrice.toFixed(2)} (Category: {product.category?.name ?? 'Unassigned'} · Option groups: {product.optionGroups.length})
            </li>
          ))}
          {products.length === 0 && <li>No products found.</li>}
        </ul>
        <form onSubmit={handleCreateProduct} style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <label style={{ fontSize: 14, display: 'flex', flexDirection: 'column' }}>
            Name
            <input
              type="text"
              value={productForm.name}
              onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))}
              required
              style={{ marginTop: 4, padding: '6px 8px' }}
            />
          </label>
          <label style={{ fontSize: 14, display: 'flex', flexDirection: 'column' }}>
            Base price
            <input
              type="number"
              step="0.01"
              min="0"
              value={productForm.basePrice}
              onChange={(event) => setProductForm((current) => ({ ...current, basePrice: event.target.value }))}
              required
              style={{ marginTop: 4, padding: '6px 8px' }}
            />
          </label>
          <label style={{ fontSize: 14, display: 'flex', flexDirection: 'column' }}>
            Category
            <select
              value={productForm.categoryId}
              onChange={(event) => setProductForm((current) => ({ ...current, categoryId: event.target.value }))}
              required
              style={{ marginTop: 4, padding: '6px 8px' }}
            >
              <option value="">Select a category…</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label style={{ fontSize: 14, gridColumn: '1 / -1', display: 'flex', flexDirection: 'column' }}>
            Description
            <textarea
              value={productForm.description}
              onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))}
              rows={2}
              style={{ marginTop: 4, padding: '6px 8px' }}
            />
          </label>
          <label style={{ fontSize: 14, gridColumn: '1 / -1', display: 'flex', flexDirection: 'column' }}>
            Image URL
            <input
              type="url"
              value={productForm.imageUrl}
              onChange={(event) => setProductForm((current) => ({ ...current, imageUrl: event.target.value }))}
              style={{ marginTop: 4, padding: '6px 8px' }}
            />
          </label>
          <button
            type="submit"
            style={{ background: '#c2415c', color: '#fff', padding: '6px 12px', border: 'none', cursor: 'pointer', justifySelf: 'flex-start' }}
          >
            Create product
          </button>
        </form>
        {productFeedback && (
          <p style={{ marginTop: 8, color: productFeedback.status === 'success' ? '#2f855a' : '#c2415c' }}>{productFeedback.message}</p>
        )}
      </section>

      <section ref={sectionRefs['option-groups']} style={{ border: '1px solid #eee', background: '#fff', padding: 16 }}>
        <h2 style={{ fontSize: 22, marginBottom: 8, color: '#c2415c' }}>Option groups</h2>
        {products.map((product) => (
          <div key={product.id} style={{ marginBottom: 12 }}>
            <h3 style={{ marginBottom: 4 }}>{product.name}</h3>
            <ul style={{ paddingLeft: 16 }}>
              {product.optionGroups.map((group) => (
                <li key={group.id}>
                  <strong>{group.name}</strong> – {group.isRequired ? 'Required' : 'Optional'} (min {group.minSelect}, max {group.maxSelect || '∞'})
                </li>
              ))}
              {product.optionGroups.length === 0 && <li>No option groups yet.</li>}
            </ul>
          </div>
        ))}
        {products.length === 0 && <p>No products available yet.</p>}
        <form onSubmit={handleCreateOptionGroup} style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <label style={{ fontSize: 14, display: 'flex', flexDirection: 'column' }}>
            Product
            <select
              value={optionGroupForm.productId}
              onChange={(event) => setOptionGroupForm((current) => ({ ...current, productId: event.target.value }))}
              required
              style={{ marginTop: 4, padding: '6px 8px' }}
            >
              <option value="">Select a product…</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </label>
          <label style={{ fontSize: 14, display: 'flex', flexDirection: 'column' }}>
            Name
            <input
              type="text"
              value={optionGroupForm.name}
              onChange={(event) => setOptionGroupForm((current) => ({ ...current, name: event.target.value }))}
              required
              style={{ marginTop: 4, padding: '6px 8px' }}
            />
          </label>
          <label style={{ fontSize: 14, display: 'flex', flexDirection: 'column' }}>
            Minimum selections
            <input
              type="number"
              min="0"
              value={optionGroupForm.minSelect}
              onChange={(event) => setOptionGroupForm((current) => ({ ...current, minSelect: event.target.value }))}
              style={{ marginTop: 4, padding: '6px 8px' }}
            />
          </label>
          <label style={{ fontSize: 14, display: 'flex', flexDirection: 'column' }}>
            Maximum selections (0 for unlimited)
            <input
              type="number"
              min="0"
              value={optionGroupForm.maxSelect}
              onChange={(event) => setOptionGroupForm((current) => ({ ...current, maxSelect: event.target.value }))}
              style={{ marginTop: 4, padding: '6px 8px' }}
            />
          </label>
          <label style={{ fontSize: 14, display: 'flex', flexDirection: 'column' }}>
            Description
            <textarea
              value={optionGroupForm.description}
              onChange={(event) => setOptionGroupForm((current) => ({ ...current, description: event.target.value }))}
              rows={2}
              style={{ marginTop: 4, padding: '6px 8px' }}
            />
          </label>
          <label style={{ fontSize: 14, alignSelf: 'center', display: 'flex', gap: 8, marginTop: 24 }}>
            <input
              type="checkbox"
              checked={optionGroupForm.isRequired}
              onChange={(event) => setOptionGroupForm((current) => ({ ...current, isRequired: event.target.checked }))}
            />
            Required group
          </label>
          <button
            type="submit"
            style={{ background: '#c2415c', color: '#fff', padding: '6px 12px', border: 'none', cursor: 'pointer', justifySelf: 'flex-start' }}
          >
            Create option group
          </button>
        </form>
        {optionGroupFeedback && (
          <p style={{ marginTop: 8, color: optionGroupFeedback.status === 'success' ? '#2f855a' : '#c2415c' }}>{optionGroupFeedback.message}</p>
        )}
      </section>

      <section ref={sectionRefs.options} style={{ border: '1px solid #eee', background: '#fff', padding: 16 }}>
        <h2 style={{ fontSize: 22, marginBottom: 8, color: '#c2415c' }}>Options</h2>
        {products.map((product) => (
          <div key={product.id} style={{ marginBottom: 12 }}>
            <h3 style={{ marginBottom: 4 }}>{product.name}</h3>
            {product.optionGroups.map((group) => (
              <div key={group.id} style={{ marginBottom: 8, paddingLeft: 16 }}>
                <h4 style={{ marginBottom: 4 }}>{group.name}</h4>
                <ul style={{ paddingLeft: 16 }}>
                  {group.options.map((option) => (
                    <li key={option.id}>
                      <strong>{option.name}</strong> – ${option.priceModifier.toFixed(2)}
                    </li>
                  ))}
                  {group.options.length === 0 && <li>No options yet.</li>}
                </ul>
              </div>
            ))}
            {product.optionGroups.length === 0 && <p style={{ paddingLeft: 16 }}>No option groups available.</p>}
          </div>
        ))}
        {products.length === 0 && <p>No products available yet.</p>}
        <form onSubmit={handleCreateOption} style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <label style={{ fontSize: 14, display: 'flex', flexDirection: 'column' }}>
            Option group
            <select
              value={optionForm.optionGroupId}
              onChange={(event) => setOptionForm((current) => ({ ...current, optionGroupId: event.target.value }))}
              required
              style={{ marginTop: 4, padding: '6px 8px' }}
            >
              <option value="">Select an option group…</option>
              {optionGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.productName} – {group.name}
                </option>
              ))}
            </select>
          </label>
          <label style={{ fontSize: 14, display: 'flex', flexDirection: 'column' }}>
            Name
            <input
              type="text"
              value={optionForm.name}
              onChange={(event) => setOptionForm((current) => ({ ...current, name: event.target.value }))}
              required
              style={{ marginTop: 4, padding: '6px 8px' }}
            />
          </label>
          <label style={{ fontSize: 14, display: 'flex', flexDirection: 'column' }}>
            Price modifier
            <input
              type="number"
              step="0.01"
              value={optionForm.priceModifier}
              onChange={(event) => setOptionForm((current) => ({ ...current, priceModifier: event.target.value }))}
              style={{ marginTop: 4, padding: '6px 8px' }}
            />
          </label>
          <label style={{ fontSize: 14, gridColumn: '1 / -1', display: 'flex', flexDirection: 'column' }}>
            Description
            <textarea
              value={optionForm.description}
              onChange={(event) => setOptionForm((current) => ({ ...current, description: event.target.value }))}
              rows={2}
              style={{ marginTop: 4, padding: '6px 8px' }}
            />
          </label>
          <button
            type="submit"
            style={{ background: '#c2415c', color: '#fff', padding: '6px 12px', border: 'none', cursor: 'pointer', justifySelf: 'flex-start' }}
          >
            Create option
          </button>
        </form>
        {optionFeedback && (
          <p style={{ marginTop: 8, color: optionFeedback.status === 'success' ? '#2f855a' : '#c2415c' }}>{optionFeedback.message}</p>
        )}
      </section>
    </section>
  );
};
