"use client"

import { MenuItem } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/contexts/cart-context-new'
import { toast } from 'sonner'
import Image from 'next/image'
import { Star, Clock, Plus } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface TopPicksProps {
  items: MenuItem[]
  isLoading: boolean
}

export function TopPicks({ items, isLoading }: TopPicksProps) {
  const { addToCart } = useCart()

  const handleAddToCart = async (item: MenuItem) => {
    await addToCart(item, 1)
    toast.success(`${item.name} added to cart`)
  }

  if (isLoading) {
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Top picks for you</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="flex-shrink-0 w-80 overflow-hidden animate-pulse">
              <div className="flex">
                <div className="w-32 h-32 bg-gray-200" />
                <div className="flex-1 p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-3 bg-gray-200 rounded mb-2 w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (items.length === 0) return null

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6">Top picks for you</h2>
      
      {/* Horizontal scrollable container */}
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
      {items.map((item) => (
        <Card
        key={item.id}
        className="flex-shrink-0 w-80 overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 cursor-pointer group bg-white dark:bg-gray-900"
        >
        <div className="flex">
          {/* Image */}
          <div className="relative w-32 h-32 flex-shrink-0">
            <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = '/images/placeholder-food.jpg'
            }}
            />
            {!item.isAvailable && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-xs font-medium">Not Available</span>
            </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div>
            <h3 className="font-semibold text-gray-800 dark:text-white line-clamp-1 mb-1">
              {item.name}
            </h3>
            
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-green-600 dark:text-green-400 fill-current" />
                <span className="text-xs text-gray-600 dark:text-gray-300">4.3</span>
              </div>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                <span className="text-xs text-gray-600 dark:text-gray-300">{item.preparationTime}m</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
              {item.description}
            </p>

            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-800 dark:text-white">
                {formatCurrency(item.price)}
              </span>

              {item.isAvailable && (
                <Button
                size="sm"
                onClick={() => handleAddToCart(item)}
                className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-green-600 dark:text-green-400 border border-green-600 dark:border-green-400 h-8 px-3 font-semibold"
                >
                <Plus className="w-3 h-3 mr-1" />
                ADD
                </Button>
              )}
            </div>
            </div>

            <div className="flex gap-1 mt-2">
            {item.isVegetarian && (
              <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 text-xs px-1 py-0">
                VEG
              </Badge>
            )}
            {item.isVegan && (
              <Badge className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs px-1 py-0">
                VEGAN
              </Badge>
            )}
            </div>
          </div>
        </div>
        </Card>
      ))}
    </div>
    </div>
  )
}
