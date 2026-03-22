import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchProductDetail, ProductDetail } from '../api/products';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { canPlaceOrders } from '../utils/auth';
import { PlusIcon } from '../components/icons/PlusIcon';
import { MinusIcon } from '../components/icons/MinusIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { EditIcon } from '../components/icons/EditIcon';
import { PackageIcon } from '../components/icons/PackageIcon';

type EditingItem = {
  productId: string;
  originalOptions: string[];
  quantity: number;
  unitPrice: number;
};

export const CartPage = () => {
  const { cartItems, updateQuantity, removeItem, addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [productDetails, setProductDetails] = useState<Record<string, ProductDetail>>({});
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});

  const canOrder = user ? canPlaceOrders(user.role) : true;
  const subtotal = cartItems.reduce((total, item) => total + (item.unitPrice ?? 0) * item.quantity, 0);
  const shipping = cartItems.length > 0 ? 8 : 0;
  const total = subtotal + shipping;

  useEffect(() => {
    let isMounted = true;

    const loadDetails = async () => {
      const uniqueProductIds = Array.from(new Set(cartItems.map((item) => item.productId))).filter(Boolean);
      if (uniqueProductIds.length === 0) {
        if (isMounted) setProductDetails({});
        return;
      }

      try {
        const entries = await Promise.all(
          uniqueProductIds.map(async (id) => {
            const detail = await fetchProductDetail(id);
            return [id, detail] as const;
          })
        );
        if (!isMounted) return;
        setProductDetails((current) => {
          const next = { ...current };
          for (const [id, detail] of entries) {
            next[id] = detail;
          }
          return next;
        });
      } catch (error) {
        console.error('Failed to load product details for cart items', error);
      }
    };

    void loadDetails();
    return () => { isMounted = false; };
  }, [cartItems]);

  const getSelectedOptionsDisplay = useMemo(() => {
    return (productId: string, selectedOptionIds: string[]) => {
      if (!selectedOptionIds.length) return [];
      const detail = productDetails[productId];
      if (!detail) return [];

      const options: Array<{ name: string; price: number }> = [];
      detail.optionGroups.forEach((group) => {
        group.options.forEach((option) => {
          if (selectedOptionIds.includes(option.id)) {
            options.push({ name: option.name, price: option.priceModifier });
          }
        });
      });
      return options;
    };
  }, [productDetails]);

  const handleEditItem = (item: typeof cartItems[0]) => {
    const detail = productDetails[item.productId];
    if (!detail) return;

    const initialOptions = detail.optionGroups.reduce<Record<string, string[]>>((acc, group) => {
      acc[group.id] = item.selectedOptionIds.filter(optId =>
        group.options.some(opt => opt.id === optId)
      );
      return acc;
    }, {});

    setSelectedOptions(initialOptions);
    setEditingItem({
      productId: item.productId,
      originalOptions: item.selectedOptionIds,
      quantity: item.quantity,
      unitPrice: item.unitPrice ?? 0
    });
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    const detail = productDetails[editingItem.productId];
    if (!detail) return;

    const newOptionIds = Object.values(selectedOptions).flat();
    const optionsChanged =
      newOptionIds.length !== editingItem.originalOptions.length ||
      !newOptionIds.every(id => editingItem.originalOptions.includes(id));

    if (!optionsChanged) {
      setEditingItem(null);
      return;
    }

    const basePrice = detail.basePrice;
    const modifiers = detail.optionGroups.reduce((total, group) => {
      const selected = selectedOptions[group.id] || [];
      const sum = selected.reduce((groupTotal, optionId) => {
        const option = group.options.find((o) => o.id === optionId);
        return groupTotal + (option?.priceModifier ?? 0);
      }, 0);
      return total + sum;
    }, 0);
    const newPrice = basePrice + modifiers;

    setEditingItem(null);
    await removeItem(editingItem.productId, editingItem.originalOptions);
    await addItem({
      productId: editingItem.productId,
      quantity: editingItem.quantity,
      selectedOptionIds: newOptionIds,
      unitPrice: newPrice,
      productName: detail.name
    } as any);
  };

  const toggleOption = (group: ProductDetail['optionGroups'][number], optionId: string) => {
    setSelectedOptions((prev) => {
      const current = prev[group.id] || [];
      const isSelected = current.includes(optionId);
      if (isSelected) {
        // Deselect current
        return { ...prev, [group.id]: current.filter((id) => id !== optionId) };
      }
      if (group.maxSelect === 1) {
        // Radio button — replace selection
        return { ...prev, [group.id]: [optionId] };
      }
      if (group.maxSelect > 0 && current.length >= group.maxSelect) return prev;
      return { ...prev, [group.id]: [...current, optionId] };
    });
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8 md:py-12">
      <div className="mx-auto max-w-2xl animate-fade-in-up">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-foreground" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>
            Your Cart
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Review your selections before checkout</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl shadow-card p-12 text-center animate-fade-in">
            <PackageIcon className="h-14 w-14 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-lg font-bold text-foreground mb-1">Your cart is empty</h2>
            <p className="text-sm text-muted-foreground mb-6">Add some beautiful flowers to get started!</p>
            <Link
              to="/"
              className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold text-sm hover:bg-secondary transition-all duration-200 shadow-soft"
            >
              Browse Flowers
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Cart Items */}
            <div className="space-y-3">
              {cartItems.map((item) => {
                const selectedOpts = getSelectedOptionsDisplay(item.productId, item.selectedOptionIds);

                return (
                  <div key={`${item.productId}-${item.selectedOptionIds.join('-')}`} className="flex gap-4 rounded-2xl bg-card p-4 border border-border hover:border-primary/30 transition-all duration-200 shadow-card">
                    {/* Product Image */}
                    <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-accent to-muted flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {productDetails[item.productId]?.imageUrl ? (
                        <img src={productDetails[item.productId].imageUrl!} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <PackageIcon className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-foreground">{item.productName ?? 'Custom Bouquet'}</h3>
                      <p className="text-primary font-bold text-sm mt-0.5" style={{ fontFamily: "'DM Serif Display', serif" }}>${(item.unitPrice ?? 0).toFixed(2)}</p>

                      {selectedOpts.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                          {selectedOpts.map((opt, idx) => (
                            <p key={idx}>
                              {opt.name}
                              {opt.price > 0 && <span className="text-success ml-1">(+${opt.price.toFixed(2)})</span>}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.productId, Math.max(0, item.quantity - 1), item.selectedOptionIds)}
                          className="p-1.5 rounded-full bg-muted hover:bg-accent text-foreground transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <MinusIcon className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-bold text-foreground">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1, item.selectedOptionIds)}
                          className="p-1.5 rounded-full bg-muted hover:bg-accent text-foreground transition-colors"
                          aria-label="Increase quantity"
                        >
                          <PlusIcon className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="text-right flex flex-col justify-between items-end gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1">
                        {productDetails[item.productId]?.optionGroups?.length > 0 && (
                          <button
                            onClick={() => handleEditItem(item)}
                            className="p-1.5 rounded-full hover:bg-accent text-primary transition-colors"
                            aria-label="Edit item"
                          >
                            <EditIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => removeItem(item.productId, item.selectedOptionIds)}
                          className="p-1.5 rounded-full hover:bg-error/10 text-error transition-colors"
                          aria-label="Remove item"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="font-bold text-sm text-foreground" style={{ fontFamily: "'DM Serif Display', serif" }}>
                        ${((item.unitPrice ?? 0) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Edit Modal */}
            {editingItem && productDetails[editingItem.productId] && (
              <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4" onClick={() => setEditingItem(null)}>
                <div className="bg-card border border-border rounded-2xl shadow-soft-lg max-w-md w-full max-h-[80vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold font-heading text-foreground">Edit Options</h2>
                      <button onClick={() => setEditingItem(null)} className="text-muted-foreground hover:text-foreground transition-colors p-1" aria-label="Close">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>

                    {productDetails[editingItem.productId].optionGroups.map((group) => (
                      <div key={group.id} className="space-y-2.5">
                        <div>
                          <h3 className="text-sm font-bold text-foreground">
                            {group.name}
                            {group.isRequired && <span className="text-sold-out ml-1">*</span>}
                          </h3>
                          {group.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{group.description}</p>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {group.options.map((option) => {
                            const isSelected = selectedOptions[group.id]?.includes(option.id);
                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => toggleOption(group, option.id)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${isSelected
                                    ? 'bg-primary text-primary-foreground shadow-soft'
                                    : 'bg-muted text-foreground border-2 border-border hover:border-primary/50'
                                  }`}
                              >
                                {option.name}
                                {option.priceModifier !== 0 && (
                                  <span className="ml-1 text-xs opacity-80">
                                    ({option.priceModifier > 0 ? '+' : ''}${option.priceModifier.toFixed(2)})
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    <div className="flex gap-3 pt-4 border-t border-border">
                      <button
                        onClick={() => setEditingItem(null)}
                        className="flex-1 bg-muted text-foreground py-2.5 rounded-full font-bold text-sm hover:bg-border transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => void handleSaveEdit()}
                        className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-full font-bold text-sm hover:bg-secondary transition-colors shadow-soft"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="rounded-2xl bg-card p-6 border border-border shadow-card space-y-3">
              <div className="flex justify-between text-sm text-foreground">
                <span>Subtotal</span>
                <span className="font-semibold" style={{ fontFamily: "'DM Serif Display', serif" }}>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-foreground">
                <span>Shipping</span>
                <span className="font-semibold" style={{ fontFamily: "'DM Serif Display', serif" }}>${shipping.toFixed(2)}</span>
              </div>
              <div className="border-t-2 border-border pt-3 flex justify-between">
                <span className="font-bold text-foreground">Total</span>
                <span className="font-bold text-primary text-lg" style={{ fontFamily: "'DM Serif Display', serif" }}>${total.toFixed(2)}</span>
              </div>

              {canOrder ? (
                <>
                  <button
                    onClick={() => navigate('/checkout')}
                    className="w-full mt-4 bg-primary text-primary-foreground py-3.5 rounded-full font-bold text-sm hover:bg-secondary transition-all duration-200 shadow-soft hover:shadow-soft-lg"
                  >
                    Continue to Checkout
                  </button>
                  <Link
                    to="/"
                    className="block w-full bg-accent text-foreground py-3 rounded-full font-bold text-sm hover:bg-muted transition-colors text-center"
                  >
                    Continue Shopping
                  </Link>
                </>
              ) : (
                <div className="mt-4 p-4 bg-error/10 border-2 border-error/20 rounded-2xl">
                  <p className="text-sm text-error text-center font-medium">
                    Store owners cannot checkout. Switch to a customer account.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
