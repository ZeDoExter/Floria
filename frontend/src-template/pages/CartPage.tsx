import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export const CartPage = () => {
  const { cartItems, updateQuantity, removeItem } = useCart();
  const subtotal = cartItems.reduce((total, item) => total + (item.unitPrice ?? 0) * item.quantity, 0);

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-rose-600">Your cart</h1>
        <p className="text-slate-600">Review your arrangement before checking out.</p>
      </header>
      {cartItems.length === 0 ? (
        <p>
          Your cart is empty.{' '}
          <Link to="/" className="text-rose-600 underline">
            Explore bouquets
          </Link>
        </p>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.productId} className="rounded border border-rose-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-700">{item.productName ?? 'Custom Bouquet'}</p>
                  <p className="text-sm text-slate-500">Selected options: {item.selectedOptionIds.join(', ') || 'None'}</p>
                </div>
                <button className="text-sm text-rose-600" onClick={() => removeItem(item.productId)}>
                  Remove
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <label className="text-sm text-slate-500">
                  Quantity
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(event) => updateQuantity(item.productId, Number(event.target.value))}
                    className="ml-2 w-20 rounded border border-rose-100 px-2 py-1"
                  />
                </label>
                <p className="font-semibold text-slate-700">
                  ${((item.unitPrice ?? 0) * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-rose-100 pt-4">
            <p className="text-lg font-semibold text-slate-700">Subtotal</p>
            <p className="text-lg font-semibold text-rose-600">${subtotal.toFixed(2)}</p>
          </div>
          <Link to="/checkout" className="inline-block rounded bg-rose-500 px-6 py-2 text-center font-semibold text-white">
            Proceed to checkout
          </Link>
        </div>
      )}
    </section>
  );
};
