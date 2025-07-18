import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-gray-900/80 backdrop-blur-sm text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-green-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-purple-500 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 animate-fade-in-up">
          {/* Brand Section */}
          <div className="space-y-4 group">
            <div className="flex items-center space-x-2 transform group-hover:scale-105 transition-transform duration-300">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-green-500/30 transition-all duration-300 animate-bounce-slow">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Sonna&apos;s Hotel</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed hover:text-gray-300 transition-colors duration-300">
              Delicious food delivered fresh to your doorstep. Experience the best flavors from around the world.
            </p>
          </div>

          {/* Quick Links */}
          <div className="group">
            <h3 className="font-semibold text-lg mb-4 text-transparent bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text group-hover:from-green-300 group-hover:to-blue-300 transition-all duration-300">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/menu" className="text-gray-400 hover:text-green-400 transition-all duration-300 hover:translate-x-2 inline-block relative group/link">
                  <span className="relative z-10">Menu</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-400 group-hover/link:w-full transition-all duration-300"></span>
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-gray-400 hover:text-green-400 transition-all duration-300 hover:translate-x-2 inline-block relative group/link">
                  <span className="relative z-10">Track Order</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-400 group-hover/link:w-full transition-all duration-300"></span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-green-400 transition-all duration-300 hover:translate-x-2 inline-block relative group/link">
                  <span className="relative z-10">Contact Us</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-400 group-hover/link:w-full transition-all duration-300"></span>
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-green-400 transition-all duration-300 hover:translate-x-2 inline-block relative group/link">
                  <span className="relative z-10">About Us</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-400 group-hover/link:w-full transition-all duration-300"></span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="group">
            <h3 className="font-semibold text-lg mb-4 text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text group-hover:from-blue-300 group-hover:to-purple-300 transition-all duration-300">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/menu?category=pizza" className="text-gray-400 hover:text-blue-400 transition-all duration-300 hover:translate-x-2 inline-block relative group/link">
                  <span className="relative z-10">Pizza</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover/link:w-full transition-all duration-300"></span>
                </Link>
              </li>
              <li>
                <Link href="/menu?category=indian" className="text-gray-400 hover:text-blue-400 transition-all duration-300 hover:translate-x-2 inline-block relative group/link">
                  <span className="relative z-10">Indian</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover/link:w-full transition-all duration-300"></span>
                </Link>
              </li>
              <li>
                <Link href="/menu?category=small-bites" className="text-gray-400 hover:text-blue-400 transition-all duration-300 hover:translate-x-2 inline-block relative group/link">
                  <span className="relative z-10">Small Bites</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover/link:w-full transition-all duration-300"></span>
                </Link>
              </li>
              <li>
                <Link href="/menu?category=beverages" className="text-gray-400 hover:text-blue-400 transition-all duration-300 hover:translate-x-2 inline-block relative group/link">
                  <span className="relative z-10">Beverages</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover/link:w-full transition-all duration-300"></span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="group">
            <h3 className="font-semibold text-lg mb-4 text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text group-hover:from-purple-300 group-hover:to-pink-300 transition-all duration-300">Contact</h3>
            <div className="space-y-2 text-gray-400 text-sm">
              <p className="hover:text-purple-400 transition-colors duration-300 hover:translate-x-1 transform cursor-pointer">📍 123 Food Street, Cuisine City, FC 12345</p>
              <p className="hover:text-purple-400 transition-colors duration-300 hover:translate-x-1 transform cursor-pointer">📞 (555) 123-4567</p>
              <p className="hover:text-purple-400 transition-colors duration-300 hover:translate-x-1 transform cursor-pointer">✉️ hello@foodiehub.com</p>
              <div className="pt-4 space-y-1">
                <p className="font-semibold text-white">Hours:</p>
                <p className="hover:text-purple-400 transition-colors duration-300">Mon-Sun: 9:00 AM - 11:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center animate-fade-in-up delay-300">
          <p className="text-gray-400 text-sm hover:text-white transition-colors duration-300">
            © 2024 FoodieHub. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-400 hover:text-green-400 text-sm transition-all duration-300 hover:scale-110 transform relative group">
              Privacy Policy
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-green-400 text-sm transition-all duration-300 hover:scale-110 transform relative group">
              Terms of Service
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
