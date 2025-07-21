"use client"

import { useState } from 'react'
import { MenuItem } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/cart-context-new'
import { toast } from 'sonner'
import Image from 'next/image'
import { Plus } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface RecommendationSectionProps {
  currentItem: MenuItem
  allItems: MenuItem[]
}

export function RecommendationSection({ currentItem, allItems }: RecommendationSectionProps) {
  const { addToCart } = useCart()
  const [showRecommendations, setShowRecommendations] = useState(true)

  // Simple recommendation logic - items from same category or similar price range
  const getRecommendations = (): MenuItem[] => {
    const currentPrice = typeof currentItem.price === 'string' ? parseFloat(currentItem.price) : currentItem.price
    
    const recommendations = allItems
      .filter(item => {
        const itemPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price
        return item.id !== currentItem.id &&
          item.isAvailable &&
          (item.category === currentItem.category || 
           Math.abs(itemPrice - currentPrice) < 100)
      })
      .slice(0, 4)
    
    return recommendations
  }

  const recommendations = getRecommendations()

  if (!showRecommendations || recommendations.length === 0) {
    return null
  }

  const handleAddToCart = async (item: MenuItem) => {
    await addToCart(item, 1)
    toast.success(`${item.name} added to cart`)
  }

  return (
    <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">
          Frequently bought together
        </h3>
        <button
          onClick={() => setShowRecommendations(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((item) => (
          <Card key={item.id} className="flex overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
            <div className="relative w-20 h-20 flex-shrink-0">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/images/placeholder-food.jpg'
                }}
              />
            </div>
            
            <div className="flex-1 p-3">
              <h4 className="font-medium text-sm text-gray-800 line-clamp-1 mb-1">
                {item.name}
              </h4>
              <p className="text-xs text-gray-600 line-clamp-1 mb-2">
                {item.description}
              </p>
              
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-800">
                  {formatCurrency(item.price)}
                </span>
                
                <Button
                  size="sm"
                  onClick={() => handleAddToCart(item)}
                  className="bg-white hover:bg-gray-50 text-green-600 border border-green-600 h-7 px-2 text-xs font-bold"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  ADD
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
