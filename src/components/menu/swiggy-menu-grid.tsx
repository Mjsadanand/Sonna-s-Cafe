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
  const [infoDropdown, setInfoDropdown] = useState<{ [key: string]: boolean }>({})

  const getSpiceIcon = (level?: string) => {
    if (!level) return null;
    const color = {
      MILD: 'text-green-500',
      MEDIUM: 'text-yellow-500',
      HOT: 'text-orange-600',
      EXTRA_HOT: 'text-red-600',
    }[level] || 'text-gray-400';
    return (
      <span className={`inline-flex items-center gap-1 font-semibold ${color}`}>
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" className="inline-block align-middle"><path d="M10 2C10.5523 2 11 2.44772 11 3V10.5858L13.2929 8.29289C13.6834 7.90237 14.3166 7.90237 14.7071 8.29289C15.0976 8.68342 15.0976 9.31658 14.7071 9.70711L10.7071 13.7071C10.3166 14.0976 9.68342 14.0976 9.29289 13.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L9 10.5858V3C9 2.44772 9.44772 2 10 2Z" /></svg>
        SPICE LEVEL {level.replace('_', ' ')}
      </span>
    );
  };

  const handleAddToCart = async (item: MenuItem) => {
    const currentQuantity = quantities[item.id] || 1
    await addToCart(item, currentQuantity)
    toast.success(`${currentQuantity}x ${item.name} added to cart`)
    setQuantities(prev => ({ ...prev, [item.id]: 1 }))
    setShowRecommendations(prev => ({ ...prev, [item.id]: true }))
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
    <>
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
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-4 h-4 border-2 flex items-center justify-center ${item.isVegetarian ? 'border-green-500' : 'border-red-500'
                          }`}>
                          <div className={`w-2 h-2 rounded-full ${item.isVegetarian ? 'bg-green-500' : 'bg-red-500'
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

                    {item.isAvailable ? (
                      <>
                        <div className="flex items-center gap-3">
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

                          <Button
                            onClick={() => handleAddToCart(item)}
                            className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-green-600 dark:text-green-400 border border-green-600 dark:border-green-400 font-bold px-4 py-2"
                          >
                            ADD
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900"
                            onClick={() => setInfoDropdown(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                            aria-expanded={!!infoDropdown[item.id]}
                            aria-controls={`info-dropdown-${item.id}`}
                          >
                            {infoDropdown[item.id] ? 'Hide Info' : 'Show Info'}
                          </Button>
                        </div>

                        {/* Show Info Button & Dropdown */}
                        <div className="mt-2">
                          {infoDropdown[item.id] && (
                            <div
                              id={`info-dropdown-${item.id}`}
                              className="mt-2 rounded border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-950 p-3 text-xs shadow-lg animate-fade-in"
                            >
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                {item.spiceLevel && (
                                  <span className="flex items-center gap-1">
                                    {getSpiceIcon(item.spiceLevel)}
                                  </span>
                                )}
                                {item.isVegan && (
                                  <span title="Vegan" className="inline-flex items-center gap-1 text-green-600 font-semibold">
                                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm3.54 10.46a.75.75 0 01-1.06 0L10 9.94l-2.48 2.52a.75.75 0 01-1.06-1.06l3-3a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06z" /></svg>Vegan
                                  </span>
                                )}
                                {item.isGlutenFree && (
                                  <span title="Gluten Free" className="inline-flex items-center gap-1 text-yellow-700 font-semibold">
                                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm2.83 7.17a1 1 0 00-1.41 0L10 10.59l-1.42-1.42a1 1 0 00-1.41 1.41l2.12 2.12a1 1 0 001.41 0l2.12-2.12a1 1 0 000-1.41z" /></svg>Gluten Free
                                  </span>
                                )}
                              </div>
                              {item.ingredients && item.ingredients.length > 0 && (
                                <div className="mb-1">
                                  <span className="font-semibold text-gray-700 dark:text-gray-200">Ingredients:</span>
                                  <span className="ml-1 text-gray-600 dark:text-gray-300">{item.ingredients.join(', ')}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <span className="text-red-500 dark:text-red-400 font-medium text-sm">Not Available</span>
                    )}

                    <div className="flex items-center gap-2 mt-3">
                      <Clock className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-300">{item.preparationTime} mins</span>
                    </div>
                  </div>

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

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

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
      <div className="mt-6 flex flex-wrap gap-4 items-center justify-center text-xs md:text-sm">
        <span className="font-semibold text-gray-700 dark:text-gray-200">Spice Level:</span>
        <span className="inline-flex items-center gap-1 text-green-500 font-semibold">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" className="inline-block align-middle"><path d="M10 2C10.5523 2 11 2.44772 11 3V10.5858L13.2929 8.29289C13.6834 7.90237 14.3166 7.90237 14.7071 8.29289C15.0976 8.68342 15.0976 9.31658 14.7071 9.70711L10.7071 13.7071C10.3166 14.0976 9.68342 14.0976 9.29289 13.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L9 10.5858V3C9 2.44772 9.44772 2 10 2Z" /></svg>
          Mild
        </span>
        <span className="inline-flex items-center gap-1 text-yellow-500 font-semibold">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" className="inline-block align-middle"><path d="M10 2C10.5523 2 11 2.44772 11 3V10.5858L13.2929 8.29289C13.6834 7.90237 14.3166 7.90237 14.7071 8.29289C15.0976 8.68342 15.0976 9.31658 14.7071 9.70711L10.7071 13.7071C10.3166 14.0976 9.68342 14.0976 9.29289 13.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L9 10.5858V3C9 2.44772 9.44772 2 10 2Z" /></svg>
          Medium
        </span>
        <span className="inline-flex items-center gap-1 text-orange-600 font-semibold">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" className="inline-block align-middle"><path d="M10 2C10.5523 2 11 2.44772 11 3V10.5858L13.2929 8.29289C13.6834 7.90237 14.3166 7.90237 14.7071 8.29289C15.0976 8.68342 15.0976 9.31658 14.7071 9.70711L10.7071 13.7071C10.3166 14.0976 9.68342 14.0976 9.29289 13.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L9 10.5858V3C9 2.44772 9.44772 2 10 2Z" /></svg>
          Hot
        </span>
        <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" className="inline-block align-middle"><path d="M10 2C10.5523 2 11 2.44772 11 3V10.5858L13.2929 8.29289C13.6834 7.90237 14.3166 7.90237 14.7071 8.29289C15.0976 8.68342 15.0976 9.31658 14.7071 9.70711L10.7071 13.7071C10.3166 14.0976 9.68342 14.0976 9.29289 13.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L9 10.5858V3C9 2.44772 9.44772 2 10 2Z" /></svg>
          Extra Hot
        </span>
      </div>
    </>
  )
}
