"use client"

import { useState } from 'react'
import { MenuItem } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/contexts/cart-context-new'
import { toast } from 'sonner'
import Image from 'next/image'
import { Star, Clock, Plus, Minus } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { RecommendationSection } from './recommendation-section'

interface SwiggyMenuGridProps {
  items: MenuItem[]
  isLoading: boolean
  onItemAdded?: () => void
}

interface ItemQuantities {
  [key: string]: number
}

interface ShowRecommendations {
  [key: string]: boolean
}

export function SwiggyMenuGrid({ items, isLoading, onItemAdded }: SwiggyMenuGridProps) {
  const { addToCart } = useCart()
  const [quantities, setQuantities] = useState<ItemQuantities>({})
  const [showRecommendations, setShowRecommendations] = useState<ShowRecommendations>({})

  const handleAddToCart = async (item: MenuItem) => {
    const currentQuantity = quantities[item.id] || 1
    await addToCart(item, currentQuantity)
    toast.success(`${currentQuantity}x ${item.name} added to cart`)
    setQuantities(prev => ({ ...prev, [item.id]: 1 })) // Reset quantity after adding
    setShowRecommendations(prev => ({ ...prev, [item.id]: true })) // Show recommendations
    onItemAdded?.()
  }

  const incrementQuantity = (itemId: string) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 1) + 1
    }))
  }

  const decrementQuantity = (itemId: string) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(1, (prev[itemId] || 1) - 1)
    }))
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden animate-pulse">
            <div className="flex">
              <div className="w-32 h-32 bg-gray-200 flex-shrink-0" />
              <div className="flex-1 p-4">
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded mb-2 w-3/4" />
                <div className="h-3 bg-gray-200 rounded mb-4 w-1/2" />
                <div className="h-8 bg-gray-200 rounded w-20" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🍽️</div>
        <h3 className="text-2xl font-bold mb-4">No dishes found</h3>
        <p className="text-gray-600">
          Try adjusting your filters or search terms to discover delicious options.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {items.map((item, index) => {
        const quantity = quantities[item.id] || 1
        
        return (
          <div key={item.id}>
            <Card
              className="overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-200 group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex">
                {/* Content */}
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    {/* Veg/Non-veg indicator */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-4 h-4 border-2 flex items-center justify-center ${
                        item.isVegetarian ? 'border-green-500' : 'border-red-500'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          item.isVegetarian ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                      </div>
                      <span className="text-xs text-orange-500 dark:text-orange-300 font-medium">BESTSELLER</span>
                    </div>

                    <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-1 line-clamp-1">
                      {item.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-gray-800 dark:text-white">
                        {formatCurrency(item.price)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-green-600 dark:text-green-400 fill-current" />
                        <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">4.3</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">(150+)</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-300 line-clamp-2 mb-4">
                      {item.description}
                    </p>
                  </div>

                  {/* Add to cart section */}
                  {item.isAvailable ? (
                    <div className="flex items-center gap-3">
                      {/* Quantity selector */}
                      <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => decrementQuantity(item.id)}
                          disabled={quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="px-3 text-sm font-medium dark:text-white">{quantity}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => incrementQuantity(item.id)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>

                      {/* Add button */}
                      <Button
                        onClick={() => handleAddToCart(item)}
                        className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-green-600 dark:text-green-400 border border-green-600 dark:border-green-400 font-bold px-4 py-2"
                      >
                        ADD
                      </Button>
                    </div>
                  ) : (
                    <span className="text-red-500 dark:text-red-400 font-medium text-sm">Not Available</span>
                  )}

                  {/* Additional info */}
                  <div className="flex items-center gap-2 mt-3">
                    <Clock className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-300">{item.preparationTime} mins</span>
                  </div>
                </div>

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
                  
                  {/* Overlay for descriptions on image like Swiggy */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  
                  {/* Tags and badges on image */}
                  <div className="absolute top-2 left-2">
                    {item.isVegan && (
                      <Badge className="bg-green-600 dark:bg-green-700 text-white text-xs px-1 py-0.5">
                        VEGAN
                      </Badge>
                    )}
                  </div>

                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white text-xs font-medium text-center px-2">
                        Not Available
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
            
            {/* Show recommendations after adding item */}
            {showRecommendations[item.id] && (
              <RecommendationSection
                currentItem={item}
                allItems={items}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
