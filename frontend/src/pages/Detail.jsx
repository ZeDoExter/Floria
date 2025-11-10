import React, { useState } from 'react';
import { ChevronLeft, Star, Minus, Plus } from 'lucide-react';

export default function ProductDetail({ product, onBack }) {
  const [selectedSize, setSelectedSize] = useState('Standard');
  const [quantity, setQuantity] = useState(1);
  const [additionalNotes, setAdditionalNotes] = useState('');

  const sizes = [
    { name: 'Standard', price: 0 },
    { name: 'Deluxe', price: 100 },
    { name: 'Premium', price: 200 }
  ];

  const handleQuantityChange = (type) => {
    if (type === 'increment') {
      setQuantity(quantity + 1);
    } else if (type === 'decrement' && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handlePurchase = () => {
    // Add your purchase logic here
    console.log({
      product,
      size: selectedSize,
      quantity,
      notes: additionalNotes
    });
    alert('Purchase functionality - Add your cart/checkout logic here!');
  };

  return (
    <div className="min-h-screen bg-rose-200">
      {/* Header */}
      <header className="bg-rose-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <nav className="bg-stone-100 rounded-full px-6 py-3 flex items-center justify-between shadow-md">
            <div className="text-xl font-semibold text-gray-800">Floria</div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-700 hover:text-gray-900 text-sm">Home</a>
              <a href="#" className="text-gray-700 hover:text-gray-900 text-sm">Orders</a>
              <a href="#" className="text-gray-700 hover:text-gray-900 text-sm">Cart</a>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full text-sm font-medium">
                Login/Sign up
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-stone-100 rounded-3xl p-8 shadow-lg">
          {/* Back Button */}
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6 group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Shop</span>
          </button>

          {/* Product Image */}
          <div className="flex justify-center mb-6">
            <div className="w-80 h-80 bg-gradient-to-br from-yellow-300 via-green-300 to-blue-300 rounded-2xl overflow-hidden shadow-lg flex items-center justify-center">
              <div className="text-8xl">🌸</div>
            </div>
          </div>

          {/* Product Title and Rating */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Pink Elegance Bouquet</h1>
            <div className="flex items-center justify-center gap-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="text-gray-700 text-sm">5.0 (500+ ratings)</span>
            </div>
          </div>

          {/* Product Description */}
          <p className="text-gray-700 text-sm leading-relaxed mb-6 text-center max-w-2xl mx-auto">
            A stunning arrangement of hand-picked roses, lilies, and seasonal blooms in soft pink and white hues. Perfect for any occasion, from birthdays to anniversaries, or simply to brighten someone's day.
          </p>

          <hr className="border-gray-300 mb-6" />

          {/* Select Size */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Select size</h2>
            <div className="flex gap-3">
              {sizes.map((size) => (
                <button
                  key={size.name}
                  onClick={() => setSelectedSize(size.name)}
                  className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                    selectedSize === size.name
                      ? 'bg-green-300 text-gray-900'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {size.name}
                  {size.price > 0 && `(+${size.price}THB)`}
                </button>
              ))}
            </div>
          </div>

          {/* Add Anything */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Add anything?</h2>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Optional"
              className="w-full h-32 bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={() => handleQuantityChange('decrement')}
              className="w-10 h-10 bg-gray-300 hover:bg-gray-400 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={quantity <= 1}
            >
              <Minus className="w-5 h-5 text-gray-700" />
            </button>
            <div className="w-16 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="font-semibold text-gray-900">{quantity}</span>
            </div>
            <button
              onClick={() => handleQuantityChange('increment')}
              className="w-10 h-10 bg-gray-300 hover:bg-gray-400 rounded-lg flex items-center justify-center transition-colors"
            >
              <Plus className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* Purchase Button */}
          <div className="flex justify-center">
            <button 
              onClick={handlePurchase}
              className="bg-green-400 hover:bg-green-500 text-gray-900 font-semibold px-16 py-3 rounded-xl transition-colors shadow-md"
            >
              Purchase
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-rose-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gray-900 rounded-lg"></div>
              </div>
              <div className="flex gap-3 text-gray-700">
                <a href="#" className="hover:text-gray-900">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="#" className="hover:text-gray-900">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="#" className="hover:text-gray-900">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a href="#" className="hover:text-gray-900">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Use cases</h3>
              <ul className="space-y-2 text-xs text-gray-700">
                <li><a href="#" className="hover:text-gray-900">UI design</a></li>
                <li><a href="#" className="hover:text-gray-900">UX design</a></li>
                <li><a href="#" className="hover:text-gray-900">Wireframing</a></li>
                <li><a href="#" className="hover:text-gray-900">Diagramming</a></li>
                <li><a href="#" className="hover:text-gray-900">Brainstorming</a></li>
                <li><a href="#" className="hover:text-gray-900">Online whiteboard</a></li>
                <li><a href="#" className="hover:text-gray-900">Team collaboration</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Explore</h3>
              <ul className="space-y-2 text-xs text-gray-700">
                <li><a href="#" className="hover:text-gray-900">Design</a></li>
                <li><a href="#" className="hover:text-gray-900">Prototyping</a></li>
                <li><a href="#" className="hover:text-gray-900">Development features</a></li>
                <li><a href="#" className="hover:text-gray-900">Design systems</a></li>
                <li><a href="#" className="hover:text-gray-900">Collaboration features</a></li>
                <li><a href="#" className="hover:text-gray-900">Design process</a></li>
                <li><a href="#" className="hover:text-gray-900">FigJam</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Resources</h3>
              <ul className="space-y-2 text-xs text-gray-700">
                <li><a href="#" className="hover:text-gray-900">Blog</a></li>
                <li><a href="#" className="hover:text-gray-900">Best practices</a></li>
                <li><a href="#" className="hover:text-gray-900">Colors</a></li>
                <li><a href="#" className="hover:text-gray-900">Color wheel</a></li>
                <li><a href="#" className="hover:text-gray-900">Support</a></li>
                <li><a href="#" className="hover:text-gray-900">Developers</a></li>
                <li><a href="#" className="hover:text-gray-900">Resource library</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}