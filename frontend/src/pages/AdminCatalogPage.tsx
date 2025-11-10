import { useState } from "react"
import { PlusIcon } from "../components/icons/PlusIcon"
import { Edit2Icon } from "../components/icons/Edit2Icon"
import { Trash2Icon } from "../components/icons/Trash2Icon"

interface Category {
  id: string
  name: string
  description: string
}

interface Product {
  id: number
  name: string
  description: string
  basePrice: number
  imageUrl: string
  categoryId: string
}

interface OptionGroup {
  id: string
  productId: number
  name: string
  description: string
  isRequired: boolean
  minSelect: number
  maxSelect: number
}

interface Option {
  id: string
  optionGroupId: string
  name: string
  description: string
  priceModifier: number
}

export function AdminCatalogPage() {
  const [activeTab, setActiveTab] = useState("products")
  
  const [categories, setCategories] = useState<Category[]>([
    { id: "cat-001", name: "ช่อดอกไม้งานแต่ง", description: "ช่อดอกไม้พรีเมียมสำหรับงานพิธีและงานแต่งงาน" },
    { id: "cat-002", name: "ช่อดอกไม้ประจำวัน", description: "ช่อดอกไม้สดสวยสำหรับทุกโอกาส" },
    { id: "cat-003", name: "ช่อดอกไม้พรีเมียม", description: "ช่อดอกไม้หรูหราสำหรับโอกาสพิเศษ" },
    { id: "cat-004", name: "ช่อดอกไม้สไตล์มินิมอล", description: "ช่อดอกไม้เรียบง่ายแต่สวยงาม" },
  ])

  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: "ช่อกุหลาบออโรร่า",
      description: "ช่อกุหลาบสีชมพูอ่อน 24 ดอก พร้อมใบยูคาลิปตัสและดอกไม้ประดับ",
      basePrice: 2590,
      imageUrl: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=200&h=200&fit=crop",
      categoryId: "cat-001",
    },
    {
      id: 2,
      name: "ช่อทิวลิปพาสเทล",
      description: "ช่อทิวลิปสีพาสเทลหวานๆ ผสมสีชมพู ม่วง และขาว",
      basePrice: 1890,
      imageUrl: "https://images.unsplash.com/photo-1520763185298-1b434c919eba?w=200&h=200&fit=crop",
      categoryId: "cat-002",
    },
    {
      id: 3,
      name: "ช่อดอกไม้ผสม Garden Dream",
      description: "ช่อดอกไม้ผสมหรูหรา ประกอบด้วยกุหลาบ ลิลลี่ ไฮเดรนเยีย",
      basePrice: 3200,
      imageUrl: "https://images.unsplash.com/photo-1487070183336-b863922373d4?w=200&h=200&fit=crop",
      categoryId: "cat-003",
    },
  ])

  const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([
    { id: "og-001", productId: 1, name: "บรรจุภัณฑ์", description: "เลือกรูปแบบการห่อช่อดอกไม้", isRequired: true, minSelect: 1, maxSelect: 1 },
    { id: "og-002", productId: 1, name: "การ์ดข้อความ", description: "เพิ่มการ์ดพร้อมข้อความพิเศษ", isRequired: false, minSelect: 0, maxSelect: 1 },
    { id: "og-003", productId: 2, name: "ขนาดช่อ", description: "เลือกขนาดช่อดอกไม้", isRequired: true, minSelect: 1, maxSelect: 1 },
  ])

  const [options, setOptions] = useState<Option[]>([
    { id: "opt-001", optionGroupId: "og-001", name: "กล่องของขวัญหรู", description: "กล่องแข็งพรีเมียมพร้อมริบบิ้นซาติน", priceModifier: 450 },
    { id: "opt-002", optionGroupId: "og-001", name: "ห่อคราฟท์", description: "กระดาษคราฟท์รีไซเคิล", priceModifier: 120 },
    { id: "opt-003", optionGroupId: "og-002", name: "การ์ดมาตรฐาน", description: "การ์ดขาวพร้อมซอง", priceModifier: 0 },
    { id: "opt-004", optionGroupId: "og-003", name: "เล็ก - 12 ดอก", description: "ช่อขนาดเล็กกะทัดรัด", priceModifier: 0 },
    { id: "opt-005", optionGroupId: "og-003", name: "กลาง - 24 ดอก", description: "ช่อขนาดกลาง", priceModifier: 600 },
  ])

  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" })
  const [productForm, setProductForm] = useState({ name: "", description: "", basePrice: "", imageUrl: "", categoryId: "" })
  const [optionGroupForm, setOptionGroupForm] = useState({ productId: "", name: "", description: "", isRequired: false, minSelect: "1", maxSelect: "1" })
  const [optionForm, setOptionForm] = useState({ optionGroupId: "", name: "", description: "", priceModifier: "0" })

  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingOptionGroup, setEditingOptionGroup] = useState<OptionGroup | null>(null)
  const [editingOption, setEditingOption] = useState<Option | null>(null)

  const handleDeleteCategory = (id: string) => setCategories(categories.filter((c) => c.id !== id))
  const handleDeleteProduct = (id: number) => setProducts(products.filter((p) => p.id !== id))
  const handleDeleteOptionGroup = (id: string) => setOptionGroups(optionGroups.filter((og) => og.id !== id))
  const handleDeleteOption = (id: string) => setOptions(options.filter((o) => o.id !== id))

  const handleEditCategory = (category: Category) => setEditingCategory(category)
  const handleEditProduct = (product: Product) => setEditingProduct(product)
  const handleEditOptionGroup = (group: OptionGroup) => setEditingOptionGroup(group)
  const handleEditOption = (option: Option) => setEditingOption(option)

  const handleSaveCategory = () => {
    if (editingCategory) {
      setCategories(categories.map((c) => (c.id === editingCategory.id ? editingCategory : c)))
      setEditingCategory(null)
    }
  }

  const handleSaveProduct = () => {
    if (editingProduct) {
      setProducts(products.map((p) => (p.id === editingProduct.id ? editingProduct : p)))
      setEditingProduct(null)
    }
  }

  const handleSaveOptionGroup = () => {
    if (editingOptionGroup) {
      setOptionGroups(optionGroups.map((og) => (og.id === editingOptionGroup.id ? editingOptionGroup : og)))
      setEditingOptionGroup(null)
    }
  }

  const handleSaveOption = () => {
    if (editingOption) {
      setOptions(options.map((o) => (o.id === editingOption.id ? editingOption : o)))
      setEditingOption(null)
    }
  }

  const getCategoryName = (categoryId: string) => categories.find((c) => c.id === categoryId)?.name || categoryId
  const getProductName = (productId: number) => products.find((p) => p.id === productId)?.name || `Product ${productId}`
  const getOptionGroupName = (optionGroupId: string) => optionGroups.find((og) => og.id === optionGroupId)?.name || optionGroupId

  const tabs = ["Products", "Categories", "Option Groups", "Options"]

  const inputClass = "w-full px-4 py-3 rounded-lg border-2 border-secondary bg-card"
  const cardClass = "rounded-2xl p-6 border-2 bg-card border-secondary"
  const itemClass = "flex items-start gap-4 p-4 rounded-lg border-2 bg-card border-border"
  const buttonClass = "p-2 rounded-lg hover:opacity-80 transition-opacity bg-muted"

  const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
    if (!isOpen) return null
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-card rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-2xl leading-none">&times;</button>
          </div>
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-8">
        {/* Header */}
        <div className="py-8">
          <h1 className="text-4xl sm:text-5xl font-light italic text-foreground">Catalog Management</h1>
          <p className="text-muted-foreground mt-2">Manage your products, categories, and options</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase().replace(" ", "-"))}
                className={`py-3 px-2 font-medium transition-colors ${
                  activeTab === tab.toLowerCase().replace(" ", "-")
                    ? "text-foreground border-b-2 border-secondary"
                    : "text-muted-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="py-8">
          <div className="grid grid-cols-[1fr_2fr] gap-8">
            {/* Products Tab */}
            {activeTab === "products" && (
              <>
                <div className={cardClass}>
                  <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
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
                  </div>
                </div>

                <div className={cardClass}>
                  <h2 className="text-lg font-semibold text-foreground mb-6">Products ({products.length})</h2>
                  <div className="space-y-4">
                    {products.map((product) => (
                      <div key={product.id} className={itemClass}>
                        <img src={product.imageUrl || "/placeholder.svg"} alt={product.name} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground">{product.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                          <div className="flex items-center gap-3 mt-3">
                            <span className="font-semibold text-secondary">฿{product.basePrice}</span>
                            <span className="text-xs text-muted-foreground">{getCategoryName(product.categoryId)}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => handleEditProduct(product)} className={buttonClass}><Edit2Icon size={18} className="text-foreground" /></button>
                          <button onClick={() => handleDeleteProduct(product.id)} className={buttonClass}><Trash2Icon size={18} className="text-error" /></button>
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
                  <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
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
                  </div>
                </div>

                <div className={cardClass}>
                  <h2 className="text-lg font-semibold text-foreground mb-6">Categories ({categories.length})</h2>
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
                  <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
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
                  </div>
                </div>

                <div className={cardClass}>
                  <h2 className="text-lg font-semibold text-foreground mb-6">Option Groups ({optionGroups.length})</h2>
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
                  <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
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
                  </div>
                </div>

                <div className={cardClass}>
                  <h2 className="text-lg font-semibold text-foreground mb-6">Options ({options.length})</h2>
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
              <textarea value={editingCategory.description} onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })} rows={3} className={inputClass} />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditingCategory(null)} className="px-6 py-2 rounded-lg bg-muted text-foreground hover:opacity-80">Cancel</button>
              <button onClick={handleSaveCategory} className="px-6 py-2 rounded-lg bg-secondary text-secondary-foreground hover:opacity-80">Save</button>
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
              <textarea value={editingProduct.description} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} rows={3} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Base Price (฿) <span className="text-error">*</span></label>
              <input type="number" value={editingProduct.basePrice} onChange={(e) => setEditingProduct({ ...editingProduct, basePrice: Number(e.target.value) })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Image URL</label>
              <input type="text" value={editingProduct.imageUrl} onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })} className={inputClass} />
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
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditingProduct(null)} className="px-6 py-2 rounded-lg bg-muted text-foreground hover:opacity-80">Cancel</button>
              <button onClick={handleSaveProduct} className="px-6 py-2 rounded-lg bg-secondary text-secondary-foreground hover:opacity-80">Save</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!editingOptionGroup} onClose={() => setEditingOptionGroup(null)} title="Edit Option Group">
        {editingOptionGroup && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Product <span className="text-error">*</span></label>
              <select value={editingOptionGroup.productId} onChange={(e) => setEditingOptionGroup({ ...editingOptionGroup, productId: Number(e.target.value) })} className={inputClass}>
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
              <textarea value={editingOptionGroup.description} onChange={(e) => setEditingOptionGroup({ ...editingOptionGroup, description: e.target.value })} rows={2} className={inputClass} />
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
              <button onClick={() => setEditingOptionGroup(null)} className="px-6 py-2 rounded-lg bg-muted text-foreground hover:opacity-80">Cancel</button>
              <button onClick={handleSaveOptionGroup} className="px-6 py-2 rounded-lg bg-secondary text-secondary-foreground hover:opacity-80">Save</button>
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
              <textarea value={editingOption.description} onChange={(e) => setEditingOption({ ...editingOption, description: e.target.value })} rows={2} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Price Modifier (฿)</label>
              <input type="number" value={editingOption.priceModifier} onChange={(e) => setEditingOption({ ...editingOption, priceModifier: Number(e.target.value) })} className={inputClass} />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditingOption(null)} className="px-6 py-2 rounded-lg bg-muted text-foreground hover:opacity-80">Cancel</button>
              <button onClick={handleSaveOption} className="px-6 py-2 rounded-lg bg-secondary text-secondary-foreground hover:opacity-80">Save</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
