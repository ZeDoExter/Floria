import React, { useState } from 'react';
import { Clock, MapPin, Info, ChevronLeft, ChevronRight } from 'lucide-react';

export default function FlowerShop({ onBuyClick }) {
  const [activeCategory, setActiveCategory] = useState('Bouquet');
  
  const categories = ['Bouquet', 'Graduation', 'Wedding', 'Anniversary', 'Plants', 'Gifts'];
  
  const products = [
    { id: 1, name: 'Floria', description: 'Rose, Lily, Tulip', price: '100 THB', image: '🌸' },
    { id: 2, name: 'Floria', description: 'Rose, Lily, Tulip', price: '100 THB', image: '🌸' },
    { id: 3, name: 'Floria', description: 'Rose, Lily, Tulip', price: '100 THB', image: '🌸' },
    { id: 4, name: 'Floria', description: 'Rose, Lily, Tulip', price: '100 THB', image: '🌸' },
    { id: 5, name: 'Floria', description: 'Rose, Lily, Tulip', price: '100 THB', image: '🌸' },
    { id: 6, name: 'Floria', description: 'Rose, Lily, Tulip', price: '100 THB', image: '🌸' },
    { id: 7, name: 'Floria', description: 'Rose, Lily, Tulip', price: '100 THB', image: '🌸' },
    { id: 8, name: 'Floria', description: 'Rose, Lily, Tulip', price: '100 THB', image: '🌸' },
    { id: 9, name: 'Floria', description: 'Rose, Lily, Tulip', price: '100 THB', image: '🌸' },
  ];

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

      {/* Restaurant Info Card */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-stone-100 rounded-3xl p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Floria</h1>
          <p className="text-gray-600 text-sm mb-4">Locus roung 12 3</p>
          
          <div className="flex items-center gap-6 mb-4">
            <div className="flex items-center gap-2 text-gray-700 text-sm">
              <Clock className="w-4 h-4" />
              <span>35 mins • 2.3 km</span>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="text-sm text-gray-700 mb-1">Opening Hours</div>
            <div className="text-sm text-gray-600">Everyday: 09:00-20:00</div>
          </div>
          
          <div className="flex items-start gap-2 mb-6">
            <Info className="w-4 h-4 text-gray-500 mt-0.5" />
            <p className="text-sm text-gray-600">
              For orders less than ฿412.00 for this restaurant, a small order fee applies.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Deliver date : Today"
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Deliver time : Now"
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="bg-stone-100 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Flowers</h2>
          
          {/* Category Navigation */}
          <div className="relative mb-8">
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              <button className="p-2 hover:bg-gray-200 rounded-full flex-shrink-0">
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                    activeCategory === category
                      ? 'bg-green-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {category}
                </button>
              ))}
              
              <button className="p-2 hover:bg-gray-200 rounded-full flex-shrink-0">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Products Grid for each category */}
          {categories.map((category) => (
            <div key={category} className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.slice(0, category === 'Wedding' ? 1 : 3).map((product) => (
                  <div
                    key={`${category}-${product.id}`}
                    className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-pink-200 to-purple-200 rounded-xl flex items-center justify-center text-4xl flex-shrink-0">
                        {product.image}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 mb-1">{product.name}</h4>
                        <p className="text-sm text-gray-500 mb-3 truncate">{product.description}</p>
                        <div className="flex items-center justify-between">
                          <button 
                            onClick={() => onBuyClick(product)}
                            className="text-sm text-gray-700 hover:text-gray-900 font-medium"
                          >
                            Buy
                          </button>
                          <span className="text-sm font-semibold text-gray-900">{product.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-rose-200 py-8">
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