import { useEffect, useMemo, useState, type ReactNode } from "react"
import { PlusIcon } from "../components/icons/PlusIcon"
import { Edit2Icon } from "../components/icons/Edit2Icon"
import { Trash2Icon } from "../components/icons/Trash2Icon"
import {
  createCategory,
  createOption,
  createOptionGroup,
  createProduct,
  deleteCategory,
  deleteOption,
  deleteOptionGroup,
  deleteProduct,
  fetchCatalogData,
  type Category,
  type Option,
  type OptionGroup,
  type Product,
  updateCategory,
  updateOption,
  updateOptionGroup,
  updateProduct
} from "../api/catalog"

const formatError = (error: unknown) => {
  if (error instanceof Error) return error.message
  return "Something went wrong."
}

export function AdminCatalogPage() {
  type ToastType = "success" | "error"
  type ToastItem = {
    id: number
    type: ToastType
    message: string
  }

  const [activeTab, setActiveTab] = useState("products")
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([])
  const [options, setOptions] = useState<Option[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" })
  const [productForm, setProductForm] = useState({ name: "", description: "", basePrice: "", imageUrl: "", categoryId: "" })
  const [optionGroupForm, setOptionGroupForm] = useState({ productId: "", name: "", description: "", isRequired: false, minSelect: "1", maxSelect: "1" })
  const [optionForm, setOptionForm] = useState({ optionGroupId: "", name: "", description: "", priceModifier: "0" })

  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingOptionGroup, setEditingOptionGroup] = useState<OptionGroup | null>(null)
  const [editingOption, setEditingOption] = useState<Option | null>(null)

  const pushToast = (type: ToastType, message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setToasts((prev) => [...prev, { id, type, message }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 3500)
  }

  const reloadCatalog = async () => {
    try {
      setError(null)
      const catalog = await fetchCatalogData()
      setCategories(catalog.categories)
      setProducts(catalog.products)
      setOptionGroups(catalog.optionGroups)
      setOptions(catalog.options)
    } catch (err) {
      setError(formatError(err))
    }
  }

  useEffect(() => {
    const run = async () => {
      setIsLoading(true)
      await reloadCatalog()
      setIsLoading(false)
    }
    void run()
  }, [])

  const runAction = async (action: () => Promise<void>, successMessage: string) => {
    try {
      setIsSaving(true)
      setError(null)
      await action()
      await reloadCatalog()
      pushToast("success", successMessage)
    } catch (err) {
      const message = formatError(err)
      setError(message)
      pushToast("error", message)
    } finally {
      setIsSaving(false)
    }
  }

  const categoryNameMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories]
  )

  const productNameMap = useMemo(
    () => new Map(products.map((product) => [product.id, product.name])),
    [products]
  )

  const optionGroupNameMap = useMemo(
    () => new Map(optionGroups.map((group) => [group.id, group.name])),
    [optionGroups]
  )

  const getCategoryName = (categoryId: string) => categoryNameMap.get(categoryId) || categoryId
  const getProductName = (productId: string) => productNameMap.get(productId) || "Unknown product"
  const getOptionGroupName = (optionGroupId: string) => optionGroupNameMap.get(optionGroupId) || optionGroupId

  const handleCreateCategory = () => {
    if (!categoryForm.name.trim()) return
    void runAction(async () => {
      await createCategory({
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim() || undefined
      })
      setCategoryForm({ name: "", description: "" })
    }, "Category created successfully")
  }

  const handleCreateProduct = () => {
    if (!productForm.name.trim() || !productForm.categoryId || !productForm.basePrice) return
    void runAction(async () => {
      await createProduct({
        name: productForm.name.trim(),
        description: productForm.description.trim() || undefined,
        basePrice: Number(productForm.basePrice),
        imageUrl: productForm.imageUrl.trim() || undefined,
        categoryId: productForm.categoryId
      })
      setProductForm({ name: "", description: "", basePrice: "", imageUrl: "", categoryId: "" })
    }, "Product created successfully")
  }

  const handleCreateOptionGroup = () => {
    if (!optionGroupForm.name.trim() || !optionGroupForm.productId) return
    void runAction(async () => {
      await createOptionGroup({
        productId: optionGroupForm.productId,
        name: optionGroupForm.name.trim(),
        description: optionGroupForm.description.trim() || undefined,
        isRequired: optionGroupForm.isRequired,
        minSelect: Number(optionGroupForm.minSelect),
        maxSelect: Number(optionGroupForm.maxSelect)
      })
      setOptionGroupForm({ productId: "", name: "", description: "", isRequired: false, minSelect: "1", maxSelect: "1" })
    }, "Option group created successfully")
  }

  const handleCreateOption = () => {
    if (!optionForm.name.trim() || !optionForm.optionGroupId) return
    void runAction(async () => {
      await createOption({
        optionGroupId: optionForm.optionGroupId,
        name: optionForm.name.trim(),
        description: optionForm.description.trim() || undefined,
        priceModifier: Number(optionForm.priceModifier)
      })
      setOptionForm({ optionGroupId: "", name: "", description: "", priceModifier: "0" })
    }, "Option created successfully")
  }

  const handleDeleteCategory = (id: string) => {
    void runAction(async () => {
      await deleteCategory(id)
    }, "Category deleted successfully")
  }

  const handleDeleteProduct = (id: string) => {
    void runAction(async () => {
      await deleteProduct(id)
    }, "Product deleted successfully")
  }

  const handleDeleteOptionGroup = (id: string) => {
    void runAction(async () => {
      await deleteOptionGroup(id)
    }, "Option group deleted successfully")
  }

  const handleDeleteOption = (id: string) => {
    void runAction(async () => {
      await deleteOption(id)
    }, "Option deleted successfully")
  }

  const handleEditCategory = (category: Category) => setEditingCategory(category)
  const handleEditProduct = (product: Product) => setEditingProduct(product)
  const handleEditOptionGroup = (group: OptionGroup) => setEditingOptionGroup(group)
  const handleEditOption = (option: Option) => setEditingOption(option)

  const handleSaveCategory = () => {
    if (!editingCategory) return
    void runAction(async () => {
      await updateCategory(editingCategory.id, {
        name: editingCategory.name,
        description: editingCategory.description
      })
      setEditingCategory(null)
    }, "Category updated successfully")
  }

  const handleSaveProduct = () => {
    if (!editingProduct) return
    void runAction(async () => {
      await updateProduct(editingProduct.id, {
        name: editingProduct.name,
        description: editingProduct.description,
        basePrice: Number(editingProduct.basePrice),
        imageUrl: editingProduct.imageUrl,
        categoryId: editingProduct.categoryId,
        isOutOfStock: editingProduct.isOutOfStock
      })
      setEditingProduct(null)
    }, "Product updated successfully")
  }

  const handleToggleStock = (product: Product) => {
    void runAction(async () => {
      await updateProduct(product.id, { isOutOfStock: !product.isOutOfStock })
    }, product.isOutOfStock ? "Product marked as in stock" : "Product marked as sold out")
  }

  const handleSaveOptionGroup = () => {
    if (!editingOptionGroup) return
    void runAction(async () => {
      await updateOptionGroup(editingOptionGroup.id, {
        productId: editingOptionGroup.productId,
        name: editingOptionGroup.name,
        description: editingOptionGroup.description,
        isRequired: editingOptionGroup.isRequired,
        minSelect: Number(editingOptionGroup.minSelect),
        maxSelect: Number(editingOptionGroup.maxSelect)
      })
      setEditingOptionGroup(null)
    }, "Option group updated successfully")
  }

  const handleSaveOption = () => {
    if (!editingOption) return
    void runAction(async () => {
      await updateOption(editingOption.id, {
        optionGroupId: editingOption.optionGroupId,
        name: editingOption.name,
        description: editingOption.description,
        priceModifier: Number(editingOption.priceModifier)
      })
      setEditingOption(null)
    }, "Option updated successfully")
  }

  const tabs = ["Products", "Categories", "Option Groups", "Options"]

  const inputClass = "w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-primary transition-colors"
  const cardClass = "rounded-2xl p-6 border bg-card border-border shadow-[0_4px_16px_rgba(180,80,100,0.07)]"
  const itemClass = "flex items-start gap-4 p-4 rounded-2xl border bg-card border-border hover:border-primary/30 transition-all duration-200"
  const buttonClass = "p-2 rounded-full hover:bg-accent transition-colors"

  const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: ReactNode }) => {
    if (!isOpen) return null
    return (
      <div className="fixed inset-0 bg-foreground/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-card rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-border shadow-[0_4px_16px_rgba(180,80,100,0.07)] animate-scale-in" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold font-heading text-foreground" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>{title}</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-2xl leading-none">&times;</button>
          </div>
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`min-w-72 max-w-96 rounded-2xl border-2 px-4 py-3 shadow-soft animate-fade-in ${toast.type === "success"
                ? "bg-success/10 border-success/30 text-success"
                : "bg-error/10 border-error/30 text-error"
              }`}
          >
            <p className="text-sm font-bold">{toast.type === "success" ? "Success:" : "Error:"} {toast.message}</p>
          </div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-8">
        {/* Header */}
        <div className="py-8">
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-foreground" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>My Shop</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your products, categories, and options</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase().replace(" ", "-"))}
              className={`py-2 px-5 rounded-full font-bold text-sm transition-all duration-200 ${activeTab === tab.toLowerCase().replace(" ", "-")
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="pb-8">
          {isLoading && <div className="text-center py-8"><span className="animate-pulse-soft text-muted-foreground">Loading catalog...</span></div>}
          {error && <div className="bg-error/10 border-2 border-error/20 rounded-2xl p-4 mb-6"><p className="text-error text-sm font-medium">{error}</p></div>}

          <div className="grid grid-cols-[1fr_2fr] gap-8">
            {/* Products Tab */}
            {activeTab === "products" && (
              <>
                <div className={cardClass}>
                  <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>
                    <PlusIcon className="w-5 h-5 text-secondary" />
                    New Product
                  </h2>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Name <span className="text-error">*</span>
                      </label>
                      <input type="text" value={productForm.name} onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
                      <textarea value={productForm.description} onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))} rows={3} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Base Price (฿) <span className="text-error">*</span>
                      </label>
                      <input type="number" value={productForm.basePrice} onChange={(e) => setProductForm((prev) => ({ ...prev, basePrice: e.target.value }))} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Image URL</label>
                      <input type="text" value={productForm.imageUrl} onChange={(e) => setProductForm((prev) => ({ ...prev, imageUrl: e.target.value }))} placeholder="https://example.com/image.jpg" className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Category <span className="text-error">*</span>
                      </label>
                      <select value={productForm.categoryId} onChange={(e) => setProductForm((prev) => ({ ...prev, categoryId: e.target.value }))} className={inputClass}>
                        <option value="">Select category...</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <button onClick={handleCreateProduct} disabled={isSaving} className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:bg-secondary transition-colors disabled:opacity-60 shadow-soft">
                      Create Product
                    </button>
                  </div>
                </div>

                <div className={cardClass}>
                  <h2 className="text-lg font-semibold text-foreground mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>Products ({products.length})</h2>
                  <div className="space-y-4">
                    {products.map((product) => (
                      <div key={product.id} className={itemClass}>
                        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-border">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-accent to-muted flex items-center justify-center"><span className="text-xs text-muted-foreground">No image</span></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-foreground">{product.name}</h3>
                            {product.isOutOfStock && (
                              <span className="text-xs bg-sold-out/10 text-sold-out px-2 py-0.5 rounded-full font-bold">Sold Out</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{product.description}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="font-bold text-primary" style={{ fontFamily: "'DM Serif Display', serif" }}>฿{product.basePrice}</span>
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{getCategoryName(product.categoryId)}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <div className="flex gap-1">
                            <button onClick={() => handleEditProduct(product)} className={buttonClass} title="Edit"><Edit2Icon size={16} className="text-foreground" /></button>
                            <button onClick={() => handleDeleteProduct(product.id)} className={buttonClass} title="Delete"><Trash2Icon size={16} className="text-error" /></button>
                          </div>
                          <button
                            onClick={() => handleToggleStock(product)}
                            className={`toggle-switch ${product.isOutOfStock ? 'active' : ''}`}
                            title={product.isOutOfStock ? 'Mark as in stock' : 'Mark as sold out'}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Categories Tab */}
            {activeTab === "categories" && (
              <>
                <div className={cardClass}>
                  <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>
                    <PlusIcon className="w-5 h-5 text-secondary" />
                    New Category
                  </h2>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Name <span className="text-error">*</span>
                      </label>
                      <input type="text" value={categoryForm.name} onChange={(e) => setCategoryForm((prev) => ({ ...prev, name: e.target.value }))} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
                      <textarea value={categoryForm.description} onChange={(e) => setCategoryForm((prev) => ({ ...prev, description: e.target.value }))} rows={3} className={inputClass} />
                    </div>
                    <button onClick={handleCreateCategory} disabled={isSaving} className="px-6 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-80 disabled:opacity-60">
                      Create Category
                    </button>
                  </div>
                </div>

                <div className={cardClass}>
                  <h2 className="text-lg font-semibold text-foreground mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>Categories ({categories.length})</h2>
                  <div className="space-y-4">
                    {categories.map((category) => (
                      <div key={category.id} className={itemClass}>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground">{category.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                          <span className="text-xs text-muted-foreground mt-2 inline-block">{category.id}</span>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => handleEditCategory(category)} className={buttonClass}><Edit2Icon size={18} className="text-foreground" /></button>
                          <button onClick={() => handleDeleteCategory(category.id)} className={buttonClass}><Trash2Icon size={18} className="text-error" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Option Groups Tab */}
            {activeTab === "option-groups" && (
              <>
                <div className={cardClass}>
                  <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>
                    <PlusIcon className="w-5 h-5 text-secondary" />
                    New Option Group
                  </h2>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Product <span className="text-error">*</span>
                      </label>
                      <select value={optionGroupForm.productId} onChange={(e) => setOptionGroupForm((prev) => ({ ...prev, productId: e.target.value }))} className={inputClass}>
                        <option value="">Select product...</option>
                        {products.map((prod) => (
                          <option key={prod.id} value={prod.id}>{prod.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Name <span className="text-error">*</span>
                      </label>
                      <input type="text" value={optionGroupForm.name} onChange={(e) => setOptionGroupForm((prev) => ({ ...prev, name: e.target.value }))} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
                      <textarea value={optionGroupForm.description} onChange={(e) => setOptionGroupForm((prev) => ({ ...prev, description: e.target.value }))} rows={2} className={inputClass} />
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={optionGroupForm.isRequired} onChange={(e) => setOptionGroupForm((prev) => ({ ...prev, isRequired: e.target.checked }))} className="w-4 h-4" />
                      <label className="text-sm font-semibold text-foreground">Required</label>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Min Select</label>
                        <input type="number" value={optionGroupForm.minSelect} onChange={(e) => setOptionGroupForm((prev) => ({ ...prev, minSelect: e.target.value }))} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Max Select</label>
                        <input type="number" value={optionGroupForm.maxSelect} onChange={(e) => setOptionGroupForm((prev) => ({ ...prev, maxSelect: e.target.value }))} className={inputClass} />
                      </div>
                    </div>
                    <button onClick={handleCreateOptionGroup} disabled={isSaving} className="px-6 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-80 disabled:opacity-60">
                      Create Option Group
                    </button>
                  </div>
                </div>

                <div className={cardClass}>
                  <h2 className="text-lg font-semibold text-foreground mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>Option Groups ({optionGroups.length})</h2>
                  <div className="space-y-4">
                    {optionGroups.map((group) => (
                      <div key={group.id} className={itemClass}>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground">{group.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <span className="text-xs px-2 py-1 rounded bg-success/20 text-success">{getProductName(group.productId)}</span>
                            <span className={`text-xs px-2 py-1 rounded ${group.isRequired ? "bg-error/20 text-error" : "bg-muted text-muted-foreground"}`}>
                              {group.isRequired ? "Required" : "Optional"}
                            </span>
                            <span className="text-xs text-muted-foreground">Min: {group.minSelect} | Max: {group.maxSelect}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => handleEditOptionGroup(group)} className={buttonClass}><Edit2Icon size={18} className="text-foreground" /></button>
                          <button onClick={() => handleDeleteOptionGroup(group.id)} className={buttonClass}><Trash2Icon size={18} className="text-error" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Options Tab */}
            {activeTab === "options" && (
              <>
                <div className={cardClass}>
                  <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>
                    <PlusIcon className="w-5 h-5 text-secondary" />
                    New Option
                  </h2>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Option Group <span className="text-error">*</span>
                      </label>
                      <select value={optionForm.optionGroupId} onChange={(e) => setOptionForm((prev) => ({ ...prev, optionGroupId: e.target.value }))} className={inputClass}>
                        <option value="">Select option group...</option>
                        {optionGroups.map((og) => (
                          <option key={og.id} value={og.id}>{og.name} ({getProductName(og.productId)})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Name <span className="text-error">*</span>
                      </label>
                      <input type="text" value={optionForm.name} onChange={(e) => setOptionForm((prev) => ({ ...prev, name: e.target.value }))} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
                      <textarea value={optionForm.description} onChange={(e) => setOptionForm((prev) => ({ ...prev, description: e.target.value }))} rows={2} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Price Modifier (฿)</label>
                      <input type="number" value={optionForm.priceModifier} onChange={(e) => setOptionForm((prev) => ({ ...prev, priceModifier: e.target.value }))} className={inputClass} />
                    </div>
                    <button onClick={handleCreateOption} disabled={isSaving} className="px-6 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-80 disabled:opacity-60">
                      Create Option
                    </button>
                  </div>
                </div>

                <div className={cardClass}>
                  <h2 className="text-lg font-semibold text-foreground mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>Options ({options.length})</h2>
                  <div className="space-y-4">
                    {options.map((option) => (
                      <div key={option.id} className={itemClass}>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground">{option.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className={`font-semibold ${option.priceModifier >= 0 ? "text-secondary" : "text-error"}`}>
                              {option.priceModifier >= 0 ? "+" : ""}฿{option.priceModifier}
                            </span>
                            <span className="text-xs px-2 py-1 rounded bg-success/20 text-success">{getOptionGroupName(option.optionGroupId)}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => handleEditOption(option)} className={buttonClass}><Edit2Icon size={18} className="text-foreground" /></button>
                          <button onClick={() => handleDeleteOption(option.id)} className={buttonClass}><Trash2Icon size={18} className="text-error" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modals */}
      <Modal isOpen={!!editingCategory} onClose={() => setEditingCategory(null)} title="Edit Category">
        {editingCategory && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Name <span className="text-error">*</span></label>
              <input type="text" value={editingCategory.name} onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
              <textarea value={editingCategory.description ?? ""} onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })} rows={3} className={inputClass} />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditingCategory(null)} className="px-6 py-2 rounded-full bg-muted text-foreground hover:opacity-80">Cancel</button>
              <button onClick={handleSaveCategory} disabled={isSaving} className="px-6 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-80 disabled:opacity-60">Save</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!editingProduct} onClose={() => setEditingProduct(null)} title="Edit Product">
        {editingProduct && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Name <span className="text-error">*</span></label>
              <input type="text" value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
              <textarea value={editingProduct.description ?? ""} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} rows={3} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Base Price (฿) <span className="text-error">*</span></label>
              <input type="number" value={editingProduct.basePrice} onChange={(e) => setEditingProduct({ ...editingProduct, basePrice: Number(e.target.value) })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Image URL</label>
              <input type="text" value={editingProduct.imageUrl ?? ""} onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Category <span className="text-error">*</span></label>
              <select value={editingProduct.categoryId} onChange={(e) => setEditingProduct({ ...editingProduct, categoryId: e.target.value })} className={inputClass}>
                <option value="">Select category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setEditingProduct({ ...editingProduct!, isOutOfStock: !editingProduct!.isOutOfStock })}
                className={`toggle-switch ${editingProduct!.isOutOfStock ? 'active' : ''}`}
              />
              <label className="text-sm font-bold text-foreground">
                {editingProduct!.isOutOfStock ? 'Sold Out' : 'In Stock'}
              </label>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditingProduct(null)} className="px-6 py-2.5 rounded-full bg-muted text-foreground font-bold text-sm hover:bg-border transition-colors">Cancel</button>
              <button onClick={handleSaveProduct} disabled={isSaving} className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:bg-secondary transition-colors disabled:opacity-60 shadow-soft">Save</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!editingOptionGroup} onClose={() => setEditingOptionGroup(null)} title="Edit Option Group">
        {editingOptionGroup && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Product <span className="text-error">*</span></label>
              <select value={editingOptionGroup.productId} onChange={(e) => setEditingOptionGroup({ ...editingOptionGroup, productId: e.target.value })} className={inputClass}>
                <option value="">Select product...</option>
                {products.map((prod) => (
                  <option key={prod.id} value={prod.id}>{prod.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Name <span className="text-error">*</span></label>
              <input type="text" value={editingOptionGroup.name} onChange={(e) => setEditingOptionGroup({ ...editingOptionGroup, name: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
              <textarea value={editingOptionGroup.description ?? ""} onChange={(e) => setEditingOptionGroup({ ...editingOptionGroup, description: e.target.value })} rows={2} className={inputClass} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={editingOptionGroup.isRequired} onChange={(e) => setEditingOptionGroup({ ...editingOptionGroup, isRequired: e.target.checked })} className="w-4 h-4" />
              <label className="text-sm font-semibold text-foreground">Required</label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Min Select</label>
                <input type="number" value={editingOptionGroup.minSelect} onChange={(e) => setEditingOptionGroup({ ...editingOptionGroup, minSelect: Number(e.target.value) })} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Max Select</label>
                <input type="number" value={editingOptionGroup.maxSelect} onChange={(e) => setEditingOptionGroup({ ...editingOptionGroup, maxSelect: Number(e.target.value) })} className={inputClass} />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditingOptionGroup(null)} className="px-6 py-2 rounded-full bg-muted text-foreground hover:opacity-80">Cancel</button>
              <button onClick={handleSaveOptionGroup} disabled={isSaving} className="px-6 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-80 disabled:opacity-60">Save</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!editingOption} onClose={() => setEditingOption(null)} title="Edit Option">
        {editingOption && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Option Group <span className="text-error">*</span></label>
              <select value={editingOption.optionGroupId} onChange={(e) => setEditingOption({ ...editingOption, optionGroupId: e.target.value })} className={inputClass}>
                <option value="">Select option group...</option>
                {optionGroups.map((og) => (
                  <option key={og.id} value={og.id}>{og.name} ({getProductName(og.productId)})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Name <span className="text-error">*</span></label>
              <input type="text" value={editingOption.name} onChange={(e) => setEditingOption({ ...editingOption, name: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
              <textarea value={editingOption.description ?? ""} onChange={(e) => setEditingOption({ ...editingOption, description: e.target.value })} rows={2} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Price Modifier (฿)</label>
              <input type="number" value={editingOption.priceModifier} onChange={(e) => setEditingOption({ ...editingOption, priceModifier: Number(e.target.value) })} className={inputClass} />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditingOption(null)} className="px-6 py-2 rounded-full bg-muted text-foreground hover:opacity-80">Cancel</button>
              <button onClick={handleSaveOption} disabled={isSaving} className="px-6 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-80 disabled:opacity-60">Save</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
