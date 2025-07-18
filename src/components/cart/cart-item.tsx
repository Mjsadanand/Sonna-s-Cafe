"use client"

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCart } from '@/contexts/cart-context'
import { CartItem } from '@/types'
import { Plus, Minus, Trash2 } from 'lucide-react'

interface CartItemComponentProps {
  item: CartItem
}

export function CartItemComponent({ item }: CartItemComponentProps) {
  const { updateQuantity, removeItem } = useCart()

  const handleIncrement = () => {
    updateQuantity(item.id, item.quantity + 1)
  }

  const handleDecrement = () => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1)
    }
  }

  const handleRemove = () => {
    removeItem(item.id)
  }

  const itemTotal = item.menuItem.price * item.quantity

  return (
    <Card className="mb-3 sm:mb-4 glass-card border-0 shadow-lg overflow-hidden">
      <CardContent className="p-3 sm:p-4">
        {/* Mobile Layout - Stacked */}
        <div className="flex flex-col sm:hidden space-y-3">
          {/* Top row - Image and basic info */}
          <div className="flex items-start space-x-3">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden">
              <Image
                src={item.menuItem.image}
                alt={item.menuItem.name}
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/images/placeholder-food.jpg'
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base sm:text-lg text-black dark:text-white line-clamp-1">{item.menuItem.name}</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">{item.menuItem.description}</p>
              <p className="text-green-600 dark:text-green-400 font-semibold text-sm mt-1">₹{item.menuItem.price.toFixed(2)} each</p>
            </div>
          </div>

          {/* Bottom row - Controls and total */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDecrement}
                disabled={item.quantity <= 1}
                className="h-8 w-8 p-0 rounded-full"
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleIncrement}
                className="h-8 w-8 p-0 rounded-full"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-3">
              <p className="font-semibold text-lg text-black dark:text-white">₹{itemTotal.toFixed(2)}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8 p-0 rounded-full"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop Layout - Horizontal */}
        <div className="hidden sm:flex items-center space-x-4">
          {/* Item Image */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden">
            <Image
              src={item.menuItem.image}
              alt={item.menuItem.name}
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = '/images/placeholder-food.jpg'
              }}
            />
          </div>

          {/* Item Details */}
          <div className="flex-grow min-w-0">
            <h3 className="font-semibold text-lg text-black dark:text-white">{item.menuItem.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{item.menuItem.description}</p>
            <p className="text-green-600 dark:text-green-400 font-semibold">₹{item.menuItem.price.toFixed(2)} each</p>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDecrement}
              disabled={item.quantity <= 1}
              className="h-9 w-9 p-0 rounded-full"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="w-8 text-center font-medium">{item.quantity}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleIncrement}
              className="h-9 w-9 p-0 rounded-full"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Item Total */}
          <div className="text-right flex-shrink-0">
            <p className="font-semibold text-lg text-black dark:text-white">₹{itemTotal.toFixed(2)}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 mt-1"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Special Instructions */}
        {item.specialInstructions && (
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-800 dark:text-gray-200">Special Instructions:</span> {item.specialInstructions}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
