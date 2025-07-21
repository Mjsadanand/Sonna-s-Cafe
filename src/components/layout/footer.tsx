import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-white dark:bg-black text-black dark:text-white border-t border-gray-200/50 dark:border-gray-800/50 shadow-sm relative overflow-hidden w-full transition-colors duration-300">
      {/* Animated background elements */}
      {/* Optional: Subtle background animation, but with lighter colors for white bg */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-green-200 dark:bg-green-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-200 dark:bg-blue-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-purple-200 dark:bg-purple-500 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Brand Section - Top */}
        <div className="text-left mb-12 animate-fade-in-up">
          <div className="flex items-center space-x-3 mb-4 transform hover:scale-105 transition-transform duration-300">
            <div className="w-10 h-10 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center shadow-lg hover:shadow-black/30 dark:hover:shadow-white/30 transition-all duration-300 animate-bounce-slow border border-gray-300">
              <span className="font-bold text-lg">S</span>
            </div>
            <span className="text-2xl font-bold text-black dark:text-white">Sonna&apos;s Patisserie & Café</span>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed hover:text-black dark:hover:text-white transition-colors duration-300 max-w-2xl">
            Exquisite eggless cakes, artisanal desserts, and premium café delights crafted with the finest ingredients. Experience homey atmosphere with authentic flavors delivered fresh to your doorstep.
          </p>
        </div>

        {/* Other Sections - Row Layout */}
        <div className="animate-fade-in-up">
          {/* Mobile: Quick Links and Categories in flex-row */}
          <div className="md:hidden flex flex-row gap-8 mb-8">
            {/* Quick Links */}
            <div className="group flex-1">
              <h3 className="font-semibold text-base mb-2 text-black dark:text-white">Quick Links</h3>
              <ul className="space-y-1">
                <li>
                  <Link href="/menu" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-all duration-300 hover:translate-x-1 inline-block relative group/link text-sm">
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
              <h3 className="font-semibold text-base mb-2 text-black dark:text-white">Categories</h3>
              <ul className="space-y-1">
                <li>
                  <Link href="/menu?category=premium-eggless-cakes" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:translate-x-1 inline-block relative group/link text-sm">
                    <span className="relative z-10">Premium Cakes</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover/link:w-full transition-all duration-300"></span>
                  </Link>
                </li>
                <li>
                  <Link href="/menu?category=desserts" className="text-gray-400 hover:text-blue-400 transition-all duration-300 hover:translate-x-1 inline-block relative group/link text-sm">
                    <span className="relative z-10">Desserts</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover/link:w-full transition-all duration-300"></span>
                  </Link>
                </li>
                <li>
                  <Link href="/menu?category=pizza-pasta" className="text-gray-400 hover:text-blue-400 transition-all duration-300 hover:translate-x-1 inline-block relative group/link text-sm">
                    <span className="relative z-10">Pizza & Pasta</span>
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
            <h3 className="font-semibold text-base mb-3 text-black dark:text-white">Contact</h3>
            
            <div className="space-y-3 text-gray-600 dark:text-gray-300 text-sm">
              <div className="space-y-2">
                <p className="hover:text-purple-400 transition-colors duration-300 hover:translate-x-1 transform cursor-pointer">📍 Shop 5/6/7, Akshay Colony, Vidya Nagar, Hubli, Karnataka 580021</p>
                <p className="hover:text-purple-400 transition-colors duration-300 hover:translate-x-1 transform cursor-pointer">📞 +91 91132 31424</p>
                <p className="hover:text-purple-400 transition-colors duration-300 hover:translate-x-1 transform cursor-pointer">✉️ hello@sonnaspatisserie.com</p>
              </div>
              
              <div className="pt-2 space-y-1">
                <p className="font-semibold text-black dark:text-white">Hours:</p>
                <p className="hover:text-purple-400 transition-colors duration-300">Mon, Wed-Sat: 2:00 PM - 10:00 PM</p>
                <p className="hover:text-purple-400 transition-colors duration-300">Sunday: 1:00 PM - 10:30 PM</p>
                <p className="hover:text-purple-400 transition-colors duration-300">Tuesday: Closed</p>
              </div>
              
              {/* Location Map */}
              <div className="pt-3">
                <p className="font-semibold text-black dark:text-white mb-2">Location:</p>
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
              <h3 className="font-semibold text-base mb-2 text-black dark:text-white">Quick Links</h3>
              <ul className="space-y-1">
                <li>
                  <Link href="/menu" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-all duration-300 hover:translate-x-1 inline-block relative group/link text-xs">
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
              <h3 className="font-semibold text-base mb-2 text-black dark:text-white">Categories</h3>
              <ul className="space-y-1">
                <li>
                  <Link href="/menu?category=premium-eggless-cakes" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:translate-x-1 inline-block relative group/link text-xs">
                    <span className="relative z-10">Premium Cakes</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover/link:w-full transition-all duration-300"></span>
                  </Link>
                </li>
                <li>
                  <Link href="/menu?category=desserts" className="text-gray-400 hover:text-blue-400 transition-all duration-300 hover:translate-x-1 inline-block relative group/link text-xs">
                    <span className="relative z-10">Desserts</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover/link:w-full transition-all duration-300"></span>
                  </Link>
                </li>
                <li>
                  <Link href="/menu?category=pizza-pasta" className="text-gray-400 hover:text-blue-400 transition-all duration-300 hover:translate-x-1 inline-block relative group/link text-xs">
                    <span className="relative z-10">Pizza & Pasta</span>
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
              <h3 className="font-semibold text-base mb-2 text-black dark:text-white">Contact</h3>
              
              {/* Desktop: Horizontal Layout in a single row */}
              <div className="flex items-start space-x-4">
                {/* Contact Details */}
                <div className="flex-shrink-0 space-y-1 text-gray-600 dark:text-gray-300 text-xs">
                  <p className="hover:text-purple-400 transition-colors duration-300 hover:translate-x-1 transform cursor-pointer">📍 Akshay Colony, Vidya Nagar, Hubli</p>
                  <p className="hover:text-purple-400 transition-colors duration-300 hover:translate-x-1 transform cursor-pointer">📞 +91 91132 31424</p>
                  <p className="hover:text-purple-400 transition-colors duration-300 hover:translate-x-1 transform cursor-pointer">✉️ hello@sonnaspatisserie.com</p>
                  {/* Hours */}
                  <div className="flex-shrink-0 space-y-1 text-gray-400 text-xs">
                  <p className="font-semibold text-black dark:text-white text-xs">Hours:</p>
                    <p className="hover:text-purple-400 transition-colors duration-300">Mon,Wed-Sat: 2PM-10PM</p>
                    <p className="hover:text-purple-400 transition-colors duration-300">Sun: 1PM-10:30PM</p>
                    <p className="hover:text-purple-400 transition-colors duration-300">Tue: Closed</p>
                  </div>
                </div>
          
                {/* Map - Gets remaining space */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-black dark:text-white mb-1 text-xs">Location:</p>
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

        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center animate-fade-in-up delay-300">
          <p className="text-gray-600 dark:text-gray-300 text-sm hover:text-black dark:hover:text-white transition-colors duration-300">
            © 2025 Sonna&apos;s Patisserie & Café. All rights reserved.
          </p>
          <span className="text-gray-600 dark:text-gray-300 text-sm hover:text-black dark:hover:text-white transition-colors duration-300">
            Created by Sam with ❤️
          </span> 
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 text-sm transition-all duration-300 hover:scale-110 transform relative group">
              Privacy Policy
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 dark:bg-green-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="/terms" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 text-sm transition-all duration-300 hover:scale-110 transform relative group">
              Terms of Service
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 dark:bg-green-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
