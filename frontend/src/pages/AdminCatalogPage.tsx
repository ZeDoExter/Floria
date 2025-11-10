import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useAdminCatalogStore } from '../stores/adminCatalogStore';
import { OrderStatus, StoreKey } from '../types/domain';
import {
  CategoryForm,
  ProductForm,
  OptionGroupForm,
  OptionForm,
  CategoryList,
  ProductList,
  OptionGroupList,
  OptionList,
  OrderList,
  FeedbackBanner
} from '../components/admin';

type TabType = 'products' | 'categories' | 'option-groups' | 'options' | 'orders';

// Tab Button Component
function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground hover:bg-muted/80'
      }`}
    >
      {children}
    </button>
  );
}

export default function OwnerCatalogPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    categories,
    products,
    optionGroups,
    options,
    orders,
    loading,
    error,
    loadAll,
    loadOrders,
    createCategory,
    updateCategory,
    deleteCategory,
    createProduct,
    updateProduct,
    deleteProduct,
    createOptionGroup,
    updateOptionGroup,
    deleteOptionGroup,
    createOption,
    updateOption,
    deleteOption,
    updateOrderStatus
  } = useAdminCatalogStore();

  const [activeTab, setActiveTab] = useState<TabType>('products');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Category form state
  const [categoryForm, setCategoryForm] = useState({ id: '', name: '', description: '' });
  
  // Product form state
  const [productForm, setProductForm] = useState<{
    id: string;
    name: string;
    description: string;
    basePrice: string;
    imageUrl: string;
    categoryId: string;
    storeKey: StoreKey;
    imageFile?: File | null;
  }>({
    id: '', name: '', description: '', basePrice: '', imageUrl: '',
    categoryId: '', storeKey: 'flagship', imageFile: null
  });

  // Option Group form state
  const [optionGroupForm, setOptionGroupForm] = useState({
    id: '', name: '', description: '', isRequired: false, minSelect: '0', maxSelect: '1'
  });

  // Option form state
  const [optionForm, setOptionForm] = useState({
    id: '', name: '', description: '', priceModifier: '0'
  });

  // Auth check
  useEffect(() => {
    if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
      navigate('/');
    }
  }, [user, navigate]);

  // Load data
  useEffect(() => {
    loadAll();
    loadOrders();
  }, [loadAll, loadOrders]);

  // Feedback helper
  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Category handlers
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (categoryForm.id) {
        await updateCategory(categoryForm.id, { name: categoryForm.name, description: categoryForm.description });
        showFeedback('success', 'Category updated successfully');
      } else {
        await createCategory({ name: categoryForm.name, description: categoryForm.description });
        showFeedback('success', 'Category created successfully');
      }
      resetCategoryForm();
    } catch (err) {
      showFeedback('error', 'Failed to save category');
    }
  };

  const handleCategoryEdit = (id: string) => {
    const cat = categories.find((c: any) => c.id === id);
    if (cat) setCategoryForm({ id: cat.id, name: cat.name, description: cat.description || '' });
  };

  const handleCategoryDelete = async (id: string) => {
    if (confirm('Delete this category?')) {
      try {
        await deleteCategory(id);
        showFeedback('success', 'Category deleted');
      } catch (err) {
        showFeedback('error', 'Failed to delete category');
      }
    }
  };

  const resetCategoryForm = () => setCategoryForm({ id: '', name: '', description: '' });

  // Product handlers
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrl = productForm.imageUrl;

      // If user uploaded a file, convert to base64
      if (productForm.imageFile) {
        imageUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(productForm.imageFile!);
        });
      }

      const data = {
        name: productForm.name,
        description: productForm.description,
        basePrice: parseFloat(productForm.basePrice),
        imageUrl,
        categoryId: productForm.categoryId || undefined,
        storeKey: productForm.storeKey
      };
      if (productForm.id) {
        await updateProduct(productForm.id, data);
        showFeedback('success', 'Product updated successfully');
      } else {
        await createProduct(data);
        showFeedback('success', 'Product created successfully');
      }
      resetProductForm();
    } catch (err) {
      showFeedback('error', 'Failed to save product');
    }
  };

  const handleProductEdit = (id: string) => {
    const prod = products.find((p: any) => p.id === id);
    if (prod) {
      setProductForm({
        id: prod.id,
        name: prod.name,
        description: prod.description || '',
        basePrice: prod.basePrice.toString(),
        imageUrl: prod.imageUrl || '',
        categoryId: prod.categoryId || '',
        storeKey: prod.storeKey
      });
    }
  };

  const handleProductDelete = async (id: string) => {
    if (confirm('Delete this product?')) {
      try {
        await deleteProduct(id);
        showFeedback('success', 'Product deleted');
      } catch (err) {
        showFeedback('error', 'Failed to delete product');
      }
    }
  };

  const resetProductForm = () => {
    setProductForm({
      id: '', name: '', description: '', basePrice: '', imageUrl: '',
      categoryId: '', storeKey: 'flagship', imageFile: null
    });
  };

  // Option Group handlers
  const handleOptionGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name: optionGroupForm.name,
        description: optionGroupForm.description,
        isRequired: optionGroupForm.isRequired,
        minSelect: parseInt(optionGroupForm.minSelect),
        maxSelect: parseInt(optionGroupForm.maxSelect)
      };
      if (optionGroupForm.id) {
        await updateOptionGroup(optionGroupForm.id, data);
        showFeedback('success', 'Option group updated successfully');
      } else {
        await createOptionGroup(data);
        showFeedback('success', 'Option group created successfully');
      }
      resetOptionGroupForm();
    } catch (err) {
      showFeedback('error', 'Failed to save option group');
    }
  };

  const handleOptionGroupEdit = (id: string) => {
    const grp = optionGroups.find((g: any) => g.id === id);
    if (grp) {
      setOptionGroupForm({
        id: grp.id,
        name: grp.name,
        description: grp.description || '',
        isRequired: grp.isRequired,
        minSelect: grp.minSelect.toString(),
        maxSelect: grp.maxSelect.toString()
      });
    }
  };

  const handleOptionGroupDelete = async (id: string) => {
    if (confirm('Delete this option group?')) {
      try {
        await deleteOptionGroup(id);
        showFeedback('success', 'Option group deleted');
      } catch (err) {
        showFeedback('error', 'Failed to delete option group');
      }
    }
  };

  const resetOptionGroupForm = () => {
    setOptionGroupForm({
      id: '', name: '', description: '', isRequired: false, minSelect: '0', maxSelect: '1'
    });
  };

  // Option handlers
  const handleOptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name: optionForm.name,
        description: optionForm.description,
        priceModifier: parseFloat(optionForm.priceModifier)
      };
      if (optionForm.id) {
        await updateOption(optionForm.id, data);
        showFeedback('success', 'Option updated successfully');
      } else {
        await createOption(data);
        showFeedback('success', 'Option created successfully');
      }
      resetOptionForm();
    } catch (err) {
      showFeedback('error', 'Failed to save option');
    }
  };

  const handleOptionEdit = (id: string) => {
    const opt = options.find((o: any) => o.id === id);
    if (opt) {
      setOptionForm({
        id: opt.id,
        name: opt.name,
        description: opt.description || '',
        priceModifier: opt.priceModifier.toString()
      });
    }
  };

  const handleOptionDelete = async (id: string) => {
    if (confirm('Delete this option?')) {
      try {
        await deleteOption(id);
        showFeedback('success', 'Option deleted');
      } catch (err) {
        showFeedback('error', 'Failed to delete option');
      }
    }
  };

  const resetOptionForm = () => {
    setOptionForm({ id: '', name: '', description: '', priceModifier: '0' });
  };

  // Order handler
  const handleOrderStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, status);
      showFeedback('success', 'Order status updated');
    } catch (err) {
      showFeedback('error', 'Failed to update order status');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-secondary to-primary p-6 rounded-2xl text-primary-foreground shadow-lg">
        <h1 className="text-3xl font-bold">Catalog Management</h1>
        <p className="opacity-90 mt-1">Manage your products, categories, and orders</p>
      </div>

      {/* Feedback */}
      {feedback && <FeedbackBanner type={feedback.type} message={feedback.message} />}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border overflow-x-auto">
        <TabButton active={activeTab === 'products'} onClick={() => setActiveTab('products')}>
          Products
        </TabButton>
        <TabButton active={activeTab === 'categories'} onClick={() => setActiveTab('categories')}>
          Categories
        </TabButton>
        <TabButton active={activeTab === 'option-groups'} onClick={() => setActiveTab('option-groups')}>
          Option Groups
        </TabButton>
        <TabButton active={activeTab === 'options'} onClick={() => setActiveTab('options')}>
          Options
        </TabButton>
        <TabButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')}>
          Orders
        </TabButton>
      </div>

      {/* Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Panel - Forms */}
        <div className="lg:col-span-1">
          {activeTab === 'categories' && (
            <CategoryForm
              form={categoryForm}
              setForm={setCategoryForm}
              onSubmit={handleCategorySubmit}
              onCancel={resetCategoryForm}
              loading={loading}
            />
          )}

          {activeTab === 'products' && (
            <ProductForm
              form={productForm}
              setForm={setProductForm}
              categories={categories}
              onSubmit={handleProductSubmit}
              onCancel={resetProductForm}
              loading={loading}
            />
          )}

          {activeTab === 'option-groups' && (
            <OptionGroupForm
              form={optionGroupForm}
              setForm={setOptionGroupForm}
              onSubmit={handleOptionGroupSubmit}
              onCancel={resetOptionGroupForm}
              loading={loading}
            />
          )}

          {activeTab === 'options' && (
            <OptionForm
              form={optionForm}
              setForm={setOptionForm}
              onSubmit={handleOptionSubmit}
              onCancel={resetOptionForm}
              loading={loading}
            />
          )}

          {activeTab === 'orders' && (
            <div className="bg-surface border border-border rounded-xl p-6">
              <p className="text-muted-foreground text-sm">
                Orders are read-only. You can only update their status in the list.
              </p>
            </div>
          )}
        </div>

        {/* Right Panel - Lists */}
        <div className="lg:col-span-2">
          {activeTab === 'categories' && (
            <CategoryList
              categories={categories}
              onEdit={handleCategoryEdit}
              onDelete={handleCategoryDelete}
              loading={loading}
            />
          )}

          {activeTab === 'products' && (
            <ProductList
              products={products}
              onEdit={handleProductEdit}
              onDelete={handleProductDelete}
              loading={loading}
            />
          )}

          {activeTab === 'option-groups' && (
            <OptionGroupList
              optionGroups={optionGroups}
              onEdit={handleOptionGroupEdit}
              onDelete={handleOptionGroupDelete}
              loading={loading}
            />
          )}

          {activeTab === 'options' && (
            <OptionList
              options={options}
              onEdit={handleOptionEdit}
              onDelete={handleOptionDelete}
              loading={loading}
            />
          )}

          {activeTab === 'orders' && (
            <OrderList
              orders={orders}
              onStatusChange={handleOrderStatusChange}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
