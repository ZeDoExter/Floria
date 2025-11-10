import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchProductDetail, ProductDetail } from '../api/products';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { canPlaceOrders } from '../utils/auth';
import { PackageIcon } from '../components/icons/PackageIcon';
import { PlusIcon } from '../components/icons/PlusIcon';
import { MinusIcon } from '../components/icons/MinusIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { EditIcon } from '../components/icons/EditIcon';

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
        if (isMounted) {
          setProductDetails({});
        }
        return;
      }

      try {
        const entries = await Promise.all(
          uniqueProductIds.map(async (id) => {
            const detail = await fetchProductDetail(id);
            return [id, detail] as const;
          })
        );
        if (!isMounted) {
          return;
        }
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

    return () => {
      isMounted = false;
    };
  }, [cartItems]);

  const getSelectedOptionsDisplay = useMemo(() => {
    return (productId: string, selectedOptionIds: string[]) => {
      if (!selectedOptionIds.length) {
        return [];
      }

      const detail = productDetails[productId];
      if (!detail) {
        return [];
      }

      const selectedOptions: Array<{ name: string; price: number }> = [];
      
      detail.optionGroups.forEach((group) => {
        group.options.forEach((option) => {
          if (selectedOptionIds.includes(option.id)) {
            selectedOptions.push({
              name: option.name,
              price: option.priceModifier
            });
          }
        });
      });

      return selectedOptions;
    };
  }, [productDetails]);

  const handleEditItem = (item: typeof cartItems[0]) => {
    const detail = productDetails[item.productId];
    if (!detail) return;

    // Initialize selected options
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

  const handleSaveEdit = () => {
    if (!editingItem) return;

    const detail = productDetails[editingItem.productId];
    if (!detail) return;

    const newOptionIds = Object.values(selectedOptions).flat();
    
    // Check if options actually changed
    const optionsChanged = 
      newOptionIds.length !== editingItem.originalOptions.length ||
      !newOptionIds.every(id => editingItem.originalOptions.includes(id));

    if (!optionsChanged) {
      // No changes, just close modal
      setEditingItem(null);
      return;
    }

    // Calculate new price
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

    // Remove old item and add new one with updated options
    removeItem(editingItem.productId, editingItem.originalOptions);
    
    // Use setTimeout to ensure removal completes before adding
    setTimeout(() => {
      addItem({
        productId: editingItem.productId,
        quantity: editingItem.quantity,
        selectedOptionIds: newOptionIds,
        unitPrice: newPrice,
        productName: detail.name
      } as any);
    }, 0);

    setEditingItem(null);
  };

  const toggleOption = (group: ProductDetail['optionGroups'][number], optionId: string) => {
    setSelectedOptions((prev) => {
      const current = prev[group.id] || [];
      const isSelected = current.includes(optionId);

      if (!isSelected && group.maxSelect > 0 && current.length >= group.maxSelect) {
        return prev;
      }

      const updatedSelection = isSelected
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];

      return { ...prev, [group.id]: updatedSelection };
    });
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8 md:px-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-light italic text-foreground">Cart</h1>
          <p className="text-muted-foreground">Review your arrangement before checking out</p>
        </div>
        {cartItems.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl shadow-lg p-12 text-center max-w-md mx-auto">
            <PackageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
            <h2 className="text-lg font-light text-foreground mb-1">Your cart is empty</h2>
            <p className="text-sm text-muted-foreground mb-4">Explore our beautiful flower collection</p>
            <Link 
              to="/" 
              className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium text-sm hover:bg-secondary transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cart Items */}
            <div className="space-y-3">
              {cartItems.map((item) => {
                const selectedOptions = getSelectedOptionsDisplay(item.productId, item.selectedOptionIds);
                
                return (
                  <div key={`${item.productId}-${item.selectedOptionIds.join('-')}`} className="flex gap-3 rounded-lg bg-card p-3 border border-border">
                    {/* Product Image Placeholder */}
                    <div className="h-20 w-20 rounded-md bg-muted flex-shrink-0 flex items-center justify-center">
                      <PackageIcon className="h-8 w-8 text-muted-foreground opacity-50" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium text-foreground">{item.productName ?? 'Custom Bouquet'}</h3>
                      <p className="text-primary font-medium text-sm mt-0.5">${(item.unitPrice ?? 0).toFixed(2)}</p>
                      
                      {/* Selected Options */}
                      {selectedOptions.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                          {selectedOptions.map((opt, idx) => (
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
                          className="p-1 rounded hover:bg-muted text-foreground transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <MinusIcon className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium text-foreground">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1, item.selectedOptionIds)}
                          className="p-1 rounded hover:bg-muted text-foreground transition-colors"
                          aria-label="Increase quantity"
                        >
                          <PlusIcon className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Actions & Total */}
                    <div className="text-right flex flex-col justify-between items-end gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1">
                        {/* Only show edit button if product has option groups */}
                        {productDetails[item.productId]?.optionGroups?.length > 0 && (
                          <button
                            onClick={() => handleEditItem(item)}
                            className="p-1.5 rounded hover:bg-muted text-primary transition-colors"
                            aria-label="Edit item"
                          >
                            <EditIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => removeItem(item.productId, item.selectedOptionIds)}
                          className="p-1.5 rounded hover:bg-muted text-error transition-colors"
                          aria-label="Remove item"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="font-medium text-sm text-foreground">
                        ${((item.unitPrice ?? 0) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Edit Modal */}
            {editingItem && productDetails[editingItem.productId] && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditingItem(null)}>
                <div className="bg-card border border-border rounded-xl shadow-lg max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-foreground">Edit Options</h2>
                      <button onClick={() => setEditingItem(null)} className="text-muted-foreground hover:text-foreground">
                        ✕
                      </button>
                    </div>

                    {productDetails[editingItem.productId].optionGroups.map((group) => (
                      <div key={group.id} className="space-y-2.5">
                        <div>
                          <h3 className="text-base font-semibold text-foreground">
                            {group.name}
                            {group.isRequired && <span className="text-error ml-1">*</span>}
                          </h3>
                          {group.description && (
                            <p className="text-xs text-muted-foreground mt-1">{group.description}</p>
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
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                  isSelected
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-foreground border border-border hover:border-primary'
                                }`}
                              >
                                {option.name}
                                {option.priceModifier !== 0 && (
                                  <span className="ml-1 text-xs">
                                    ({option.priceModifier > 0 ? '+' : ''}${option.priceModifier.toFixed(2)})
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    <div className="flex gap-2 pt-4 border-t border-border">
                      <button
                        onClick={() => setEditingItem(null)}
                        className="flex-1 bg-muted text-foreground py-2 rounded-lg font-medium text-sm hover:bg-border transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg font-medium text-sm hover:bg-secondary transition-colors"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="rounded-lg bg-card p-4 border border-border space-y-3">
              <div className="flex justify-between text-sm text-foreground">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-foreground">
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-semibold text-primary">${total.toFixed(2)}</span>
              </div>

              {canOrder ? (
                <>
                  <button 
                    onClick={() => navigate('/checkout')}
                    className="w-full mt-4 bg-primary text-primary-foreground py-2 rounded-lg font-medium text-sm hover:bg-secondary transition-colors"
                  >
                    Continue to Checkout
                  </button>
                  <Link
                    to="/"
                    className="block w-full bg-muted text-foreground py-2 rounded-lg font-medium text-sm hover:bg-border transition-colors text-center"
                  >
                    Continue Shopping
                  </Link>
                </>
              ) : (
                <div className="mt-4 p-3 bg-error/10 border border-error rounded-lg">
                  <p className="text-sm text-error text-center">
                    Store owners cannot proceed to checkout. Switch to a customer account to place an order.
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
