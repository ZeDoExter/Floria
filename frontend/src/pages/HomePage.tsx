import React, { useState } from 'react';
import { MapPin } from 'lucide-react';

interface Shop {
  id: number;
  name: string;
  distance: string;
  status: 'Open' | 'Closed';
  image: string;
}

export const HomePage: React.FC = () => {
  const [location, setLocation] = useState('');

  // Mock data for shops
  const shops: Shop[] = Array.from({ length: 16 }, (_, i) => ({
    id: i + 1,
    name: 'Floria',
    distance: `${(Math.random() * 5).toFixed(1)} km`,
    status: i % 3 === 2 ? 'Closed' : 'Open',
    image: '/flower-bouquet.jpg', // Replace with actual image
  }));

  const handleSearch = () => {
    console.log('Searching for location:', location);
    // Add search logic here
  };

  return (
    <div
      className="min-h-screen [background:radial-gradient(circle_at_center_top,_#FFC9C9_0%,_#FFB3B3_25%,_#FFA3A3_50%,_#FF9999_100%)]"
    >
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-32">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left side - Tagline */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-5xl lg:text-6xl font-serif italic mb-6 text-gray-800">
              All your favorite<br />
              flower shops<br />
              in one place.
            </h1>
            <p className="text-lg text-gray-700">
              Discover curated flower boutiques that turn moments into memories.
            </p>
          </div>

          {/* Right side - Search Card */}
          <div className="flex-1 max-w-md w-full">
            <div className="bg-[#FFF9F0] rounded-3xl p-8 shadow-lg">
              <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
                Where should we deliver<br />
                your flower today?
              </h2>

              <div className="space-y-4">
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-300 bg-white"
                  />
                </div>

                <button
                  onClick={handleSearch}
                  className="w-full py-3 rounded-xl bg-green-300 hover:bg-green-400 transition-colors font-medium text-gray-800"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shop Listings Section */}
      <div className="bg-[#FFF9F0] rounded-t-[3rem] pb-16">
        <div className="container mx-auto px-4 pt-12">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">
            Discover shop near u
          </h2>

          {/* Shop Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {shops.map((shop) => (
              <div
                key={shop.id}
                className="bg-white rounded-xl overflow-hidden shadow transition-shadow hover:shadow-xl"
              >
                {/* Shop Image */}
                <div className="aspect-square bg-gray-200 relative">
                  {/* Replace with actual image */}
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <svg
                      className="w-24 h-24"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Shop Info */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{shop.name}</h3>
                      <p className="text-sm text-gray-600">{shop.distance}</p>
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        shop.status === 'Open' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {shop.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* More Shops Button */}
          <div className="flex justify-center">
            <button className="px-8 py-3 rounded-full border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white transition-colors font-medium">
              More Shops
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#FFF9F0] py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Use cases */}
            <div>
              <h3 className="font-semibold mb-4 text-gray-900">Use cases</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>UI design</li>
                <li>UX design</li>
                <li>Wireframing</li>
                <li>Diagramming</li>
                <li>Brainstorming</li>
                <li>Online whiteboard</li>
                <li>Team collaboration</li>
              </ul>
            </div>

            {/* Explore */}
            <div>
              <h3 className="font-semibold mb-4 text-gray-900">Explore</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>Design</li>
                <li>Prototyping</li>
                <li>Development features</li>
                <li>Design systems</li>
                <li>Collaboration features</li>
                <li>Design process</li>
                <li>FigJam</li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-semibold mb-4 text-gray-900">Resources</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>Blog</li>
                <li>Best practices</li>
                <li>Colors</li>
                <li>Color wheel</li>
                <li>Support</li>
                <li>Developers</li>
                <li>Resource library</li>
              </ul>
            </div>

            {/* Social Links */}
            <div>
              <div className="flex gap-4 items-center">
                <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center">
                  <span className="text-white text-xs">⌘</span>
                </div>
                <a href="#" className="text-gray-700 hover:text-gray-900">X</a>
                <a href="#" className="text-gray-700 hover:text-gray-900">IG</a>
                <a href="#" className="text-gray-700 hover:text-gray-900">YT</a>
                <a href="#" className="text-gray-700 hover:text-gray-900">IN</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
