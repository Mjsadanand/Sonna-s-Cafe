"use client"

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/contexts/cart-context'
import { MenuItem } from '@/types'
import { Plus, Minus, Clock, Leaf, Flame, Star, Heart } from 'lucide-react'
import { toast } from 'sonner'

interface MenuItemCardProps {
  item: MenuItem
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const { addItem } = useCart()

  const handleAddToCart = () => {
    addItem(item, quantity)
    toast.success(`${quantity}x ${item.name} added to cart`)
    setQuantity(1)
  }

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1)
  }

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1))
  }

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
    toast.success(isFavorite ? `${item.name} removed from favorites` : `${item.name} added to favorites`)
  }

  const getSpiceLevelColor = (level: string) => {
    switch (level) {
      case 'MILD': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
      case 'MEDIUM': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
      case 'HOT': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
      case 'EXTRA_HOT': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
    }
  }

  const getSpiceIcon = (level: string) => {
    const count = level === 'MILD' ? 1 : level === 'MEDIUM' ? 2 : level === 'HOT' ? 3 : 4
    return Array.from({ length: count }, (_, i) => (
      <Flame key={i} className="w-3 h-3 text-orange-500" />
    ))
  }

  return (
    <Card className="glass-card border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group hover:scale-[1.02] interactive h-full flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden flex-shrink-0">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = '/images/placeholder-food.jpg'
          }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <Badge className="bg-white/90 dark:bg-black/90 text-black dark:text-white border-0 font-medium backdrop-blur-sm">
            {typeof item.category === 'string' ? item.category : item.category?.name || 'Food'}
          </Badge>
        </div>
        
        {/* Favorite Button */}
        <Button
          size="icon"
          variant="ghost"
          className={`absolute top-3 right-3 h-9 w-9 rounded-full backdrop-blur-sm transition-all duration-300 ${
            isFavorite 
              ? 'bg-red-100 dark:bg-red-900/50 text-red-600 hover:bg-red-200 dark:hover:bg-red-800/70' 
              : 'bg-white/90 dark:bg-black/90 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-black hover:text-red-500'
          }`}
          onClick={toggleFavorite}
        >
          <Heart className={`h-4 w-4 transition-all duration-300 ${isFavorite ? 'fill-current scale-110' : ''}`} />
        </Button>

        {/* Rating */}
        <div className="absolute bottom-3 left-3 flex items-center space-x-1 bg-white/90 dark:bg-black/90 rounded-full px-2 py-1 backdrop-blur-sm">
          <Star className="h-3 w-3 text-yellow-500 fill-current" />
          <span className="text-xs font-medium text-black dark:text-white">4.5</span>
        </div>

        {/* Prep Time */}
        <div className="absolute bottom-3 right-3 flex items-center space-x-1 bg-white/90 dark:bg-black/90 rounded-full px-2 py-1 backdrop-blur-sm">
          <Clock className="h-3 w-3 text-green-600" />
          <span className="text-xs font-medium text-black dark:text-white">{item.preparationTime}m</span>
        </div>

        {/* Unavailable Overlay */}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <span className="text-white font-bold text-lg">Not Available</span>
              <p className="text-white/80 text-sm mt-1">Check back later</p>
            </div>
          </div>
        )}
      </div>

      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold text-black dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
            {item.name}
          </CardTitle>
          <span className="text-xl font-bold text-black dark:text-white">
            ${item.price}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pb-4 flex-grow flex flex-col">
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 text-balance flex-shrink-0">
          {item.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-3 flex-shrink-0">
          {item.isVegetarian && (
            <Badge className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-0">
              <Leaf className="w-3 h-3 mr-1" />
              Vegetarian
            </Badge>
          )}
          {item.isVegan && (
            <Badge className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-0">
              Vegan
            </Badge>
          )}
          {item.isGlutenFree && (
            <Badge className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-0">
              Gluten Free
            </Badge>
          )}
          <Badge className={`text-xs border-0 ${getSpiceLevelColor(item.spiceLevel)}`}>
            <div className="flex items-center space-x-1">
              <div className="flex">{getSpiceIcon(item.spiceLevel)}</div>
              <span>{item.spiceLevel}</span>
            </div>
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="pt-0 mt-auto flex-shrink-0">
        {item.isAvailable ? (
          <div className="w-full space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <Button
                size="icon"
                variant="outline"
                className="h-9 w-9 rounded-full border-gray-300 hover:border-red-500 hover:text-red-500 transition-colors"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-8 text-center font-bold text-lg text-black dark:text-white">{quantity}</span>
              <Button
                size="icon"
                variant="outline"
                className="h-9 w-9 rounded-full border-gray-300 hover:border-green-500 hover:text-green-500 transition-colors"
                onClick={incrementQuantity}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <Button 
              onClick={handleAddToCart}
              className="w-full btn-gradient-green interactive"
              size="lg"
            >
              Add to Cart - ${(item.price * quantity).toFixed(2)}
            </Button>
          </div>
        ) : (
          <Button disabled className="w-full bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed" size="lg">
            Currently Unavailable
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
