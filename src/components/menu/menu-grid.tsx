"use client"

import { MenuItemCard } from './menu-item-card'
import { MenuItem } from '@/types'
import { Card, CardContent } from '@/components/ui/card'

interface MenuGridProps {
  items: MenuItem[]
  isLoading?: boolean
}

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: 8 }).map((_, i) => (
      <Card key={i} className="glass-card border-0 shadow-lg overflow-hidden">
        <div className="aspect-[4/3] bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 animate-pulse" />
        <CardContent className="p-6">
          <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded mb-3 animate-pulse" />
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded mb-4 w-3/4 animate-pulse" />
          <div className="flex justify-between items-center">
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-20 animate-pulse" />
            <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-24 animate-pulse" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
)

export function MenuGrid({ items, isLoading = false }: MenuGridProps) {
  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <Card className="glass-card border-0 shadow-2xl max-w-md mx-auto">
          <CardContent className="p-12">
            <div className="text-6xl mb-6">🍽️</div>
            <h3 className="text-2xl font-bold text-black dark:text-white mb-4">No dishes found</h3>
            <p className="text-gray-600 dark:text-gray-400 text-balance">
              Try adjusting your filters or search terms to discover delicious options.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item, index) => (
        <div
          key={item.id}
          className="fade-in"
          data-delay={index * 0.1}
        >
          <MenuItemCard item={item} />
        </div>
      ))}
    </div>
  )
}
