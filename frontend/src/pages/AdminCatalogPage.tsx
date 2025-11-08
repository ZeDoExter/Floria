import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Category,
  CreateOptionGroupInput,
  StoreKey,
  createCategory,
  createOption,
  createOptionGroup,
  createProduct,
  fetchCategories
} from '../api/catalog';
import { fetchProductDetail, fetchProducts, ProductDetail } from '../api/products';
import { useAuth } from '../context/AuthContext';
import { canManageCatalog, hasDashboardAccess } from '../utils/auth';

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
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    basePrice: '',
    imageUrl: '',
    categoryId: '',
    storeKey: 'flagship' as StoreKey
  });
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

  const role = user?.role ?? 'customer';
  const canViewCatalog = hasDashboardAccess(role);
  const canManage = canManageCatalog(role);

  const optionGroups = useMemo(() => {
    return products.flatMap((product) =>
      product.optionGroups.map((group) => ({
        id: group.id,
        name: group.name,
        productName: product.name
      }))
    );
  }, [products]);

  if (!canViewCatalog) {
    return (
      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h1 style={{ fontSize: 28, marginBottom: 4, color: '#c2415c' }}>Admin catalog</h1>
        <p>You need an administrator or store owner account to view the catalog dashboard.</p>
      </section>
    );
  }

  const authToken = user?.token;
  const disableCatalogActions = !canManage;

  const handleCreateCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCategoryFeedback(null);
    if (disableCatalogActions) {
      setCategoryFeedback({ status: 'error', message: 'You do not have permission to create categories.' });
      return;
    }
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
    if (disableCatalogActions) {
      setProductFeedback({ status: 'error', message: 'You do not have permission to create products.' });
      return;
    }
    try {
      await createProduct(
        {
          name: productForm.name.trim(),
          description: productForm.description.trim() || undefined,
          basePrice: Number(productForm.basePrice || 0),
          imageUrl: productForm.imageUrl.trim() || undefined,
          categoryId: productForm.categoryId,
          storeKey: productForm.storeKey
        },
        authToken
      );
      setProductFeedback({ status: 'success', message: 'Product created successfully.' });
      setProductForm({ name: '', description: '', basePrice: '', imageUrl: '', categoryId: '', storeKey: 'flagship' });
      await loadCatalog();
    } catch (err) {
      console.error(err);
      setProductFeedback({ status: 'error', message: 'Failed to create product. Please review the details and try again.' });
    }
  };

  const handleCreateOptionGroup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOptionGroupFeedback(null);
    if (disableCatalogActions) {
      setOptionGroupFeedback({ status: 'error', message: 'You do not have permission to create option groups.' });
      return;
    }
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
    if (disableCatalogActions) {
      setOptionFeedback({ status: 'error', message: 'You do not have permission to create options.' });
      return;
    }
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
      {disableCatalogActions && (
        <p
          style={{
            background: '#fff5f8',
            border: '1px solid #f6c4d5',
            color: '#8e2945',
            padding: '12px 16px',
            borderRadius: 4
          }}
        >
          You are signed in with read-only administrator access. The store owner account must be used to create or edit catalog
          entries.
        </p>
      )}

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
        <form onSubmit={handleCreateCategory}>
          <fieldset
            disabled={disableCatalogActions}
            style={{ display: 'flex', flexDirection: 'column', gap: 8, border: 'none', padding: 0, margin: 0 }}
          >
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
            <button type="submit" style={{ alignSelf: 'flex-start', background: '#c2415c', color: '#fff', padding: '6px 12px', border: 'none', cursor: disableCatalogActions ? 'not-allowed' : 'pointer' }}>
              Create category
            </button>
            {categoryFeedback && (
              <p style={{ color: categoryFeedback.status === 'success' ? '#2f855a' : '#c2415c' }}>{categoryFeedback.message}</p>
            )}
          </fieldset>
        </form>
      </section>

      <section ref={sectionRefs.products} style={{ border: '1px solid #eee', background: '#fff', padding: 16 }}>
        <h2 style={{ fontSize: 22, marginBottom: 8, color: '#c2415c' }}>Products</h2>
        <ul style={{ marginBottom: 12, paddingLeft: 16 }}>
          {products.map((product) => (
            <li key={product.id}>
              <strong>{product.name}</strong> – ${product.basePrice.toFixed(2)} (Category: {product.category?.name ?? 'Unassigned'} · Option groups: {product.optionGroups.length} · Store: {product.storeKey === 'weekend-market' ? 'Weekend market stall' : 'Flagship boutique'})
            </li>
          ))}
          {products.length === 0 && <li>No products found.</li>}
        </ul>
        <form onSubmit={handleCreateProduct}>
          <fieldset
            disabled={disableCatalogActions}
            style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', border: 'none', padding: 0, margin: 0 }}
          >
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
            <label style={{ fontSize: 14, display: 'flex', flexDirection: 'column' }}>
              Storefront
              <select
                value={productForm.storeKey}
                onChange={(event) => setProductForm((current) => ({ ...current, storeKey: event.target.value as StoreKey }))}
                style={{ marginTop: 4, padding: '6px 8px' }}
              >
                <option value="flagship">Flagship boutique</option>
                <option value="weekend-market">Weekend market stall</option>
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
              style={{ background: '#c2415c', color: '#fff', padding: '6px 12px', border: 'none', cursor: disableCatalogActions ? 'not-allowed' : 'pointer', justifySelf: 'flex-start' }}
            >
              Create product
            </button>
          </fieldset>
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
        <form onSubmit={handleCreateOptionGroup}>
          <fieldset
            disabled={disableCatalogActions}
            style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', border: 'none', padding: 0, margin: 0 }}
          >
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
              style={{ background: '#c2415c', color: '#fff', padding: '6px 12px', border: 'none', cursor: disableCatalogActions ? 'not-allowed' : 'pointer', justifySelf: 'flex-start' }}
            >
              Create option group
            </button>
          </fieldset>
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
        <form onSubmit={handleCreateOption}>
          <fieldset
            disabled={disableCatalogActions}
            style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', border: 'none', padding: 0, margin: 0 }}
          >
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
              style={{ background: '#c2415c', color: '#fff', padding: '6px 12px', border: 'none', cursor: disableCatalogActions ? 'not-allowed' : 'pointer', justifySelf: 'flex-start' }}
            >
              Create option
            </button>
          </fieldset>
        </form>
        {optionFeedback && (
          <p style={{ marginTop: 8, color: optionFeedback.status === 'success' ? '#2f855a' : '#c2415c' }}>{optionFeedback.message}</p>
        )}
      </section>
    </section>
  );
};
