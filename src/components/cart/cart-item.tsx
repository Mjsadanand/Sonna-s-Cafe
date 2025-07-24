"use client"

import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/cart-context-new'
import { MenuItem } from '@/types'
import { Plus, Minus, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import Image from 'next/image'

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
    <div className="flex justify-between items-start">
      <div className="flex-1">
        {/* Veg/Non-veg indicator */}
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-4 h-4 border-2 flex items-center justify-center ${item.menuItem.isVegetarian ? 'border-green-500' : 'border-red-500'}`}>
            <div className={`w-2 h-2 rounded-full ${item.menuItem.isVegetarian ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
        </div>
        <div className="flex items-center gap-3 mb-2">
          {item.menuItem.image && (
            <Image
              src={item.menuItem.image}
              alt={item.menuItem.name}
              width={48}
              height={48}
              className="w-12 h-12 object-cover rounded border border-gray-200 dark:border-gray-700"
            />
          )}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              {item.menuItem.name}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              {formatCurrency(price)}
            </p>
          </div>
        </div>
        {/*
        <p className="text-gray-500 text-sm">
          {item.menuItem.description}
        </p> */}

        {item.specialInstructions && (
          <p className="text-sm text-orange-700 dark:text-orange-300 mt-2 italic">
            Note: {item.specialInstructions}
          </p>
        )}
      </div>

      <div className="flex flex-col items-end gap-3 ml-4">
        {/* Quantity controls */}
        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDecrement}
            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Minus className="w-3 h-3" />
          </Button>
          <span className="px-3 text-sm font-medium min-w-[2rem] text-center text-gray-900 dark:text-gray-100">
            {item.quantity}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleIncrement}
            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>

        {/* Total price */}
        <p className="font-bold text-gray-900 dark:text-gray-100">
          {formatCurrency(itemTotal)}
        </p>

        {/* Remove button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 p-1"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
