"use client"

import { useRouter } from 'next/navigation'
import { CartItemComponent } from '@/components/cart/cart-item'
import { CartSummary } from '@/components/cart/cart-summary'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/cart-context-new'
import { ShoppingBag, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CartPage() {
  const { cart, clearCart } = useCart()
  const router = useRouter()

  const handleCheckout = () => {
    router.push('/checkout')
  }

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      clearCart()
    }
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="mb-6">
                <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              </div>
              <h1 className="text-2xl font-bold mb-3 text-gray-800 dark:text-white">
                Your cart is empty
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You can go to home page to view more restaurants
              </p>
              <Link href="/menu">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white w-full">
                 ADD ITEMS
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/menu">
              <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Cart</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {/* Restaurant Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="font-bold text-lg mb-2 text-gray-800 dark:text-white">Sonna&apos;s Cafe</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">South Indian • ₹200 for two</p>
              <div className="flex items-center mt-2">
                <span className="bg-green-600 text-white text-xs px-2 py-1 rounded flex items-center">
                  4.3 ★
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">30-35 mins</span>
              </div>
            </div>

            {/* Cart Items */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              {cart.items.map((item, index) => (
                <div key={item.id} className={`p-4 ${index !== cart.items.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}>
                  <CartItemComponent item={item} />
                </div>
              ))}
            </div>

            {/* Add more items */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mt-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <Link href="/menu" className="block text-center">
                <Button variant="outline" className="w-full border-dashed border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <ArrowLeft className="w-4 h-4 mr-2 rotate-180" />
                  Add more items
                </Button>
              </Link>
            </div>
          </div>

          {/* Order Summary - Sticky on desktop */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <CartSummary 
                showCheckoutButton={true}
                onCheckout={handleCheckout}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
