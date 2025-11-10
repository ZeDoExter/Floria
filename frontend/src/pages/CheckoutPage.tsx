import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { X, CheckCircle2, CreditCard, Truck, Shield } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { canPlaceOrders } from '../utils/auth';
import { mockCartItems } from '../mocks/db';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [showQRModal, setShowQRModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Mock cart data matching the Figma design
  

  const subtotal = mockCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 5.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <p className="text-muted-foreground">Please log in to complete your purchase.</p>
      </div>
    );
  }

  const canOrder = canPlaceOrders(user.role);

  if (!canOrder) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-4">
        <h1 className="text-3xl font-bold text-error">Checkout</h1>
        <p className="text-muted-foreground">Store owners manage customer orders but cannot place new orders from this storefront.</p>
      </div>
    );
  }

  // Generate QR Code data (mock payment URL)
  const generatePaymentQR = () => {
    const orderId = `ORD-${Date.now()}`;
    const amount = total.toFixed(2);
    return `https://payment.bloom.com/pay?order=${orderId}&amount=${amount}&user=${user.email}`;
  };

  const handleProceedToPayment = () => {
    setShowQRModal(true);
  };

  const handlePaymentComplete = async () => {
    setIsProcessingPayment(true);
    setPaymentSuccess(false);

    // Simulate payment processing (3 seconds)
    await new Promise(resolve => setTimeout(resolve, 3000));

    setPaymentSuccess(true);

    // Wait a moment to show success
    setTimeout(() => {
      setShowQRModal(false);
      navigate('/orders');
    }, 1500);
  };

  return (
    <>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Bloom & Co.</h1>
          <button className="text-primary hover:text-primary/80 transition-colors flex items-center gap-2">
            🛒 Checkout
          </button>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Summary (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary Card */}
            <div className="bg-card rounded-3xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                {mockCartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30">
                    {/* Product Image */}
                    <div 
                      className="w-20 h-20 rounded-xl flex items-center justify-center text-4xl"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.image}
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground">{item.name}</h3>
                      <p className="text-sm text-success font-semibold">${item.price.toFixed(2)}</p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <button 
                        type="button"
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-colors bg-error/20 hover:bg-error/30 text-foreground"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button 
                        type="button"
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-colors bg-success/20 hover:bg-success/30 text-foreground"
                      >
                        +
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right min-w-[80px]">
                      <p className="font-bold text-foreground">${(item.price * item.quantity).toFixed(2)}</p>
                      <button 
                        type="button"
                        className="text-sm text-error hover:text-error/80 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Payment Summary (1/3 width) */}
          <div className="space-y-6">
            {/* Payment Summary Card */}
            <div className="bg-card rounded-3xl shadow-md p-6 space-y-4">
              <h2 className="text-2xl font-bold text-foreground mb-4">Payment Summary</h2>
              
              <div className="space-y-3 text-foreground">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pb-3 border-b border-border">
                  <span>Tax</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xl font-bold">Total</span>
                  <span className="text-2xl font-bold text-success">${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleProceedToPayment}
                className="w-full bg-primary text-white px-6 py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <CreditCard className="h-5 w-5" />
                Proceed to Payment →
              </button>
            </div>

            {/* Additional Info Cards */}
            <div className="bg-card rounded-2xl shadow-md p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground">Free Delivery</p>
                <p className="text-xs text-muted-foreground">On orders over $50</p>
              </div>
            </div>

            <div className="bg-card rounded-2xl shadow-md p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground">Secure Payment</p>
                <p className="text-xs text-muted-foreground">256-bit SSL encryption</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Payment Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-card rounded-3xl shadow-2xl max-w-md w-full relative animate-in fade-in zoom-in duration-300">
            {/* Close button */}
            {!isProcessingPayment && !paymentSuccess && (
              <button
                onClick={() => setShowQRModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            <div className="p-8 space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Scan to Pay</h2>
                <p className="text-muted-foreground">Scan QR code with your banking app</p>
                <div className="bg-primary/10 rounded-xl px-4 py-2 inline-block">
                  <p className="text-3xl font-bold text-primary">${total.toFixed(2)}</p>
                </div>
              </div>

              {!paymentSuccess ? (
                <>
                  {/* QR Code */}
                  <div className="bg-white p-6 rounded-2xl border-4 border-primary/20 flex items-center justify-center shadow-inner">
                    <QRCodeSVG 
                      value={generatePaymentQR()} 
                      size={256}
                      level="H"
                      includeMargin={true}
                    />
                  </div>

                  {/* Instructions */}
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p className="flex items-start gap-2">
                      <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                      <span>Open your mobile banking app</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                      <span>Select "Scan QR" to pay</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                      <span>Scan the QR code above</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0">4</span>
                      <span>Confirm payment on your banking app</span>
                    </p>
                  </div>

                  {/* Mock: Payment Complete Button */}
                  <button
                    onClick={handlePaymentComplete}
                    disabled={isProcessingPayment}
                    className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                  >
                    {isProcessingPayment ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full"></span>
                        Processing Payment...
                      </span>
                    ) : (
                      'I have completed payment'
                    )}
                  </button>
                </>
              ) : (
                /* Success State */
                <div className="text-center space-y-4 py-8">
                  <div className="flex justify-center">
                    <CheckCircle2 className="h-20 w-20 text-success animate-bounce" />
                  </div>
                  <h3 className="text-2xl font-bold text-success">Payment Successful!</h3>
                  <p className="text-muted-foreground">Redirecting to your orders...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
