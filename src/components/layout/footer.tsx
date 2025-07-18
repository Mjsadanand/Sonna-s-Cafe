import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-gray-900/80 backdrop-blur-sm text-white relative overflow-hidden w-full">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-green-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-purple-500 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Brand Section - Top */}
        <div className="text-left mb-12 animate-fade-in-up">
          <div className="flex items-center space-x-3 mb-4 transform hover:scale-105 transition-transform duration-300">
            <div className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow-lg hover:shadow-white/30 transition-all duration-300 animate-bounce-slow border border-gray-300">
              <span className="font-bold text-lg">S</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Sonna&apos;s Hotel</span>
          </div>
          <p className="text-gray-400 text-base leading-relaxed hover:text-gray-300 transition-colors duration-300 max-w-2xl">
            Delicious food delivered fresh to your doorstep. Experience the best flavors from around the world.
          </p>
        </div>

        {/* Other Sections - Row Layout */}
        <div className="animate-fade-in-up">
          {/* Mobile: Quick Links and Categories in flex-row */}
          <div className="md:hidden flex flex-row gap-8 mb-8">
            {/* Quick Links */}
            <div className="group flex-1">
              <h3 className="font-semibold text-base mb-2 text-transparent bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text group-hover:from-green-300 group-hover:to-blue-300 transition-all duration-300">Quick Links</h3>
              <ul className="space-y-1">
                <li>
                  <Link href="/menu" className="text-gray-400 hover:text-green-400 transition-all duration-300 hover:translate-x-1 inline-block relative group/link text-sm">
                    <span className="relative z-10">Menu</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-400 group-hover/link:w-full transition-all duration-300"></span>
                  </Link>
                </li>
                <li>
                  <Link href="/orders" className="text-gray-400 hover:text-green-400 transition-all duration-300 hover:translate-x-1 inline-block relative group/link text-sm">
                    <span className="relative z-10">Track Order</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-400 group-hover/link:w-full transition-all duration-300"></span>
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-green-400 transition-all duration-300 hover:translate-x-1 inline-block relative group/link text-sm">
                    <span className="relative z-10">Contact Us</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-400 group-hover/link:w-full transition-all duration-300"></span>
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-green-400 transition-all duration-300 hover:translate-x-1 inline-block relative group/link text-sm">
                    <span className="relative z-10">About Us</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-400 group-hover/link:w-full transition-all duration-300"></span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Categories */}
            <div className="group flex-1">
              <h3 className="font-semibold text-base mb-2 text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text group-hover:from-blue-300 group-hover:to-purple-300 transition-all duration-300">Categories</h3>
              <ul className="space-y-1">
                <li>
                  <Link href="/menu?category=pizza" className="text-gray-400 hover:text-blue-400 transition-all duration-300 hover:translate-x-1 inline-block relative group/link text-sm">
                    <span className="relative z-10">Pizza</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover/link:w-full transition-all duration-300"></span>
                  </Link>
                </li>
                <li>
                  <Link href="/menu?category=indian" className="text-gray-400 hover:text-blue-400 transition-all duration-300 hover:translate-x-1 inline-block relative group/link text-sm">
                    <span className="relative z-10">Indian</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover/link:w-full transition-all duration-300"></span>
                  </Link>
                </li>
                <li>
                  <Link href="/menu?category=small-bites" className="text-gray-400 hover:text-blue-400 transition-all duration-300 hover:translate-x-1 inline-block relative group/link text-sm">
                    <span className="relative z-10">Small Bites</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover/link:w-full transition-all duration-300"></span>
                  </Link>
                </li>
                <li>
                  <Link href="/menu?category=beverages" className="text-gray-400 hover:text-blue-400 transition-all duration-300 hover:translate-x-1 inline-block relative group/link text-sm">
                    <span className="relative z-10">Beverages</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover/link:w-full transition-all duration-300"></span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Mobile: Contact Section */}
          <div className="md:hidden group">
            <h3 className="font-semibold text-base mb-3 text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text group-hover:from-purple-300 group-hover:to-pink-300 transition-all duration-300">Contact</h3>
            
            <div className="space-y-3 text-gray-400 text-sm">
              <div className="space-y-2">
                <p className="hover:text-purple-400 transition-colors duration-300 hover:translate-x-1 transform cursor-pointer">📍 123 Food Street, Cuisine City, FC 12345</p>
                <p className="hover:text-purple-400 transition-colors duration-300 hover:translate-x-1 transform cursor-pointer">📞 (555) 123-4567</p>
                <p className="hover:text-purple-400 transition-colors duration-300 hover:translate-x-1 transform cursor-pointer">✉️ hello@foodiehub.com</p>
              </div>
              
              <div className="pt-2 space-y-1">
                <p className="font-semibold text-white">Hours:</p>
                <p className="hover:text-purple-400 transition-colors duration-300">Mon-Sun: 9:00 AM - 11:00 PM</p>
              </div>
              
              {/* Location Map */}
              <div className="pt-3">
                <p className="font-semibold text-white mb-2">Location:</p>
                <div className="rounded-lg overflow-hidden shadow-lg border border-gray-700/50 hover:border-purple-400/50 transition-colors duration-300">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3481.6494853554373!2d75.10756127458652!3d15.357632458095749!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bb8d710688f2fbf%3A0xaf8bbe49e1a55b99!2sSonna&#39;s%20Patisserie%20and%20Cafe!5e1!3m2!1sen!2sin!4v1752840657196!5m2!1sen!2sin" 
                    width="100%" 
                    height="150" 
                    allowFullScreen={true}
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Sonna's Patisserie and Cafe Location"
                    className="w-full border-0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Desktop: Grid Layout */}
          <div className="hidden md:grid grid-cols-5 gap-2">
            {/* Quick Links */}
            <div className="group">
              <h3 className="font-semibold text-base mb-2 text-transparent bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text group-hover:from-green-300 group-hover:to-blue-300 transition-all duration-300">Quick Links</h3>
              <ul className="space-y-1">
                <li>
                  <Link href="/menu" className="text-gray-400 hover:text-green-400 transition-all duration-300 hover:translate-x-1 inline-block relative group/link text-xs">
                    <span className="relative z-10">Menu</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-400 group-hover/link:w-full transition-all duration-300"></span>
                  </Link>
                </li>
                <li>
                  <Link href="/orders" className="text-gray-400 hover:text-green-400 transition-all duration-300 hover:translate-x-1 inline-block relative group/link text-xs">
                    <span className="relative z-10">Track Order</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-400 group-hover/link:w-full transition-all duration-300"></span>
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-green-400 transition-all duration-300 hover:translate-x-1 inline-block relative group/link text-xs">
                    <span className="relative z-10">Contact Us</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-400 group-hover/link:w-full transition-all duration-300"></span>
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-green-400 transition-all duration-300 hover:translate-x-1 inline-block relative group/link text-xs">
                    <span className="relative z-10">About Us</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-400 group-hover/link:w-full transition-all duration-300"></span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Categories */}
            <div className="group">
              <h3 className="font-semibold text-base mb-2 text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text group-hover:from-blue-300 group-hover:to-purple-300 transition-all duration-300">Categories</h3>
              <ul className="space-y-1">
                <li>
                  <Link href="/menu?category=pizza" className="text-gray-400 hover:text-blue-400 transition-all duration-300 hover:translate-x-1 inline-block relative group/link text-xs">
                    <span className="relative z-10">Pizza</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover/link:w-full transition-all duration-300"></span>
                  </Link>
                </li>
                <li>
                  <Link href="/menu?category=indian" className="text-gray-400 hover:text-blue-400 transition-all duration-300 hover:translate-x-1 inline-block relative group/link text-xs">
                    <span className="relative z-10">Indian</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover/link:w-full transition-all duration-300"></span>
                  </Link>
                </li>
                <li>
                  <Link href="/menu?category=small-bites" className="text-gray-400 hover:text-blue-400 transition-all duration-300 hover:translate-x-1 inline-block relative group/link text-xs">
                    <span className="relative z-10">Small Bites</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover/link:w-full transition-all duration-300"></span>
                  </Link>
                </li>
                <li>
                  <Link href="/menu?category=beverages" className="text-gray-400 hover:text-blue-400 transition-all duration-300 hover:translate-x-1 inline-block relative group/link text-xs">
                    <span className="relative z-10">Beverages</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover/link:w-full transition-all duration-300"></span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info - Takes 3 columns for more space */}
            <div className="group col-span-3">
              <h3 className="font-semibold text-base mb-2 text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text group-hover:from-purple-300 group-hover:to-pink-300 transition-all duration-300">Contact</h3>
              
              {/* Desktop: Horizontal Layout in a single row */}
              <div className="flex items-start space-x-4">
                {/* Contact Details */}
                <div className="flex-shrink-0 space-y-1 text-gray-400 text-xs">
                  <p className="hover:text-purple-400 transition-colors duration-300 hover:translate-x-1 transform cursor-pointer">📍 123 Food Street, Cuisine City</p>
                  <p className="hover:text-purple-400 transition-colors duration-300 hover:translate-x-1 transform cursor-pointer">📞 (555) 123-4567</p>
                  <p className="hover:text-purple-400 transition-colors duration-300 hover:translate-x-1 transform cursor-pointer">✉️ hello@foodiehub.com</p>
                  {/* Hours */}
                  <div className="flex-shrink-0 space-y-1 text-gray-400 text-xs">
                    <p className="font-semibold text-white text-xs">Hours:</p>
                    <p className="hover:text-purple-400 transition-colors duration-300">Mon-Sun: 9AM-11PM</p>
                  </div>
                </div>
          
                {/* Map - Gets remaining space */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white mb-1 text-xs">Location:</p>
                  <div className="rounded-lg overflow-hidden shadow-lg border border-gray-700/50 hover:border-purple-400/50 transition-colors duration-300">
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3481.6494853554373!2d75.10756127458652!3d15.357632458095749!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bb8d710688f2fbf%3A0xaf8bbe49e1a55b99!2sSonna&#39;s%20Patisserie%20and%20Cafe!5e1!3m2!1sen!2sin!4v1752840657196!5m2!1sen!2sin" 
                      width="100%" 
                      height="120" 
                      allowFullScreen={true}
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Sonna's Patisserie and Cafe Location"
                      className="w-full border-0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center animate-fade-in-up delay-300">
          <p className="text-gray-400 text-sm hover:text-white transition-colors duration-300">
            © 2025 Sonna&apos;s Patisserie and Cafe. All rights reserved.
          </p>
          <span className="text-gray-400 text-sm hover:text-white transition-colors duration-300">
            Created by Sam with ❤️
          </span> 
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
