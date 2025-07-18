"use client"

import { useRouter } from 'next/navigation'
import { CartItemComponent } from '@/components/cart/cart-item'
import { CartSummary } from '@/components/cart/cart-summary'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/cart-context'
import { ShoppingBag, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CartPage() {
  const { state, clearCart } = useCart()
  const router = useRouter()

  const handleCheckout = () => {
    router.push('/checkout')
  }

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      clearCart()
    }
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen modern-bg floating-shapes">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-12 sm:py-16">
          <div className="max-w-xl sm:max-w-2xl mx-auto text-center">
            <div className="glass-card border-0 shadow-2xl p-8 sm:p-12 lg:p-16">
              <div className="mb-6 sm:mb-8">
                <div className="relative mx-auto w-24 h-24 sm:w-32 sm:h-32 mb-4 sm:mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full opacity-20 animate-pulse"></div>
                  <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mt-6 sm:mt-8 text-gray-400 dark:text-gray-500" />
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
                <span className="text-black dark:text-white">Your cart is</span>
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> empty</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 text-base sm:text-lg text-balance px-2 sm:px-0">
                Looks like you haven&apos;t added any items to your cart yet. Start browsing our delicious menu!
              </p>
              <Link href="/menu" className="block">
                <Button className="btn-gradient-blue interactive text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto">
                  Browse Menu
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 ml-2 rotate-180" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen modern-bg floating-shapes">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 relative fade-in">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
            <span className="text-black dark:text-white">Your</span>
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"> Cart</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-xl sm:max-w-2xl mx-auto text-balance px-4 sm:px-0">
            {state.items.length} delicious item{state.items.length !== 1 ? 's' : ''} ready for checkout
          </p>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 sm:mb-8 space-y-3 lg:space-y-0 px-4 sm:px-0">
          <Link href="/menu">
            <Button variant="outline" className="glass-card border-0 hover:shadow-lg transition-all duration-300 interactive text-sm sm:text-base w-full sm:w-auto">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={handleClearCart}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 hover:border-red-300 text-sm sm:text-base w-full sm:w-auto"
          >
            Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-3 sm:space-y-4">
              {state.items.map((item, index) => (
                <div key={item.id} className="fade-in" data-delay={index * 0.1}>
                  <CartItemComponent item={item} />
                </div>
              ))}
            </div>

            {/* Continue Shopping */}
            <div className="mt-6 sm:mt-8 glass-card border-0 shadow-lg p-4 sm:p-6">
              <h3 className="font-bold text-lg sm:text-xl text-black dark:text-white mb-2">Want to add more items?</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 text-balance text-sm sm:text-base">
                Explore our full menu and discover more delicious options.
              </p>
              <Link href="/menu">
                <Button className="btn-gradient-purple interactive text-sm sm:text-base w-full sm:w-auto">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 lg:sticky lg:top-8">
            <CartSummary 
              showCheckoutButton={true}
              onCheckout={handleCheckout}
            />

            {/* Delivery Info */}
            <div className="mt-4 sm:mt-6 glass-card border-0 shadow-lg p-4 sm:p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <h4 className="font-bold text-green-800 dark:text-green-300 mb-3 flex items-center text-sm sm:text-base">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Delivery Information
              </h4>
              <ul className="text-xs sm:text-sm text-green-700 dark:text-green-300 space-y-2">
                <li className="flex items-center">
                  <span className="w-1 h-1 bg-green-500 rounded-full mr-2"></span>
                  Estimated delivery: 30-45 minutes
                </li>
                <li className="flex items-center">
                  <span className="w-1 h-1 bg-green-500 rounded-full mr-2"></span>
                  Free delivery on orders over ₹500
                </li>
                <li className="flex items-center">
                  <span className="w-1 h-1 bg-green-500 rounded-full mr-2"></span>
                  Contactless delivery available
                </li>
                <li className="flex items-center">
                  <span className="w-1 h-1 bg-green-500 rounded-full mr-2"></span>
                  Track your order in real-time
                </li>
              </ul>
            </div>

            {/* Promo Code */}
            <div className="mt-4 sm:mt-6 glass-card border-0 shadow-lg p-4 sm:p-6">
              <h4 className="font-bold text-black dark:text-white mb-3 text-sm sm:text-base">Have a promo code?</h4>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <input
                  type="text"
                  placeholder="Enter code"
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
                <Button className="btn-gradient-orange interactive text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-3">
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
