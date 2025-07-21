"use client"

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCart } from '@/contexts/cart-context-new'
import { MenuItem } from '@/types'
import { Plus, Minus, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface CartItemWithDetails {
  id: string
  quantity: number
  unitPrice: string
  specialInstructions?: string | null
  addOns?: string[] | null
  menuItem: MenuItem
}

interface CartItemComponentProps {
  item: CartItemWithDetails
}

export function CartItemComponent({ item }: CartItemComponentProps) {
  const { updateCartItem, removeFromCart } = useCart()

  const handleIncrement = async () => {
    await updateCartItem(item.id, item.quantity + 1, item.specialInstructions || undefined)
  }

  const handleDecrement = async () => {
    if (item.quantity > 1) {
      await updateCartItem(item.id, item.quantity - 1, item.specialInstructions || undefined)
    }
  }

  const handleRemove = async () => {
    await removeFromCart(item.id)
    toast.success(`${item.menuItem.name} removed from cart`)
  }

  const price = parseFloat(item.unitPrice)
  const itemTotal = price * item.quantity

  return (
    <>
      {/* Desktop Card */}
      <Card className="hidden sm:block hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-700">
        <CardContent className="p-4 sm:p-6">
          <div className="flex gap-4 sm:gap-6">
            {/* Item Image */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <Image
                src={item.menuItem.image || '/images/placeholder-food.jpg'}
                alt={item.menuItem.name}
                fill
                className="object-cover"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  e.currentTarget.src = '/images/placeholder-food.jpg'
                }}
              />
            </div>

            {/* Item Details */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-black dark:text-white mb-1 leading-tight">
                {item.menuItem.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-2">
                {item.menuItem.description}
              </p>
              <p className="text-green-600 dark:text-green-400 font-semibold text-sm mt-1">{formatCurrency(price)} each</p>
              {item.specialInstructions && (
                <p className="text-xs text-gray-500 mt-1">
                  Special: {item.specialInstructions}
                </p>
              )}
            </div>

            {/* Quantity Controls */}
            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleDecrement}
                  className="w-7 h-7 p-0 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="min-w-[2rem] text-center font-semibold text-sm">
                  {item.quantity}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleIncrement}
                  className="w-7 h-7 p-0 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              
              <p className="font-semibold text-lg text-black dark:text-white">{formatCurrency(itemTotal)}</p>

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRemove}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900 p-1 h-auto"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Card */}
      <Card className="block sm:hidden hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-700">
        <CardContent className="p-3">
          <div className="flex gap-3">
            {/* Item Image */}
            <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <Image
                src={item.menuItem.image || '/images/placeholder-food.jpg'}
                alt={item.menuItem.name}
                fill
                className="object-cover"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  e.currentTarget.src = '/images/placeholder-food.jpg'
                }}
              />
            </div>

            {/* Item Details & Controls */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 pr-2">
                  <h3 className="font-semibold text-base text-black dark:text-white leading-tight">
                    {item.menuItem.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-xs mt-1 line-clamp-1">
                    {item.menuItem.description}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleRemove}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900 p-1 h-auto shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-green-600 dark:text-green-400 font-semibold">{formatCurrency(price)} each</p>
                  {item.specialInstructions && (
                    <p className="text-xs text-gray-500 mt-1">
                      Special: {item.specialInstructions}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleDecrement}
                      className="w-8 h-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="min-w-[1.5rem] text-center font-semibold text-sm">
                      {item.quantity}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleIncrement}
                      className="w-8 h-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <p className="font-semibold text-lg text-black dark:text-white">{formatCurrency(itemTotal)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
