"use client"

import { useState, useEffect } from 'react'
import { MenuGrid } from '@/components/menu/menu-grid'
import { CategoryTabs } from '@/components/menu/category-tabs'
import { MenuSearch } from '@/components/menu/menu-search'
import { MenuItem, Category } from '@/types'
import menuItems from '@/data/menu-items.json'
import categories from '@/data/categories.json'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>(menuItems as MenuItem[])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    
    // Simulate loading delay for better UX
    const timer = setTimeout(() => {
      let items = [...(menuItems as MenuItem[])]

      // Filter by category
      if (selectedCategory !== 'all') {
        items = items.filter(item => item.category.slug === selectedCategory)
      }

      // Filter by search term
      if (searchTerm) {
        items = items.filter(item =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      setFilteredItems(items)
      setIsLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [selectedCategory, searchTerm])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
  }

  const handleSearchChange = (term: string) => {
    setSearchTerm(term)
  }

  return (
    <div className="min-h-screen modern-bg floating-shapes">
      <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 relative fade-in">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              <span className="text-black dark:text-white">Our</span>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Menu</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-xl sm:max-w-2xl mx-auto text-balance px-4 sm:px-0">
              Discover our delicious selection of fresh, made-to-order dishes crafted with the finest ingredients.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="relative max-w-md sm:max-w-2xl w-full px-4 sm:px-0">
            <div className="glass-card p-2 border-0 shadow-xl">
              <MenuSearch 
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                placeholder="Search for dishes, categories, or ingredients..."
              />
            </div>
          </div>
        </div>

        {/* Category Tabs and Menu Grid */}
        <CategoryTabs
          categories={categories as Category[]}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        >
          <div className="mt-6 sm:mt-8">
            {searchTerm && (
              <div className="mb-6 px-4 sm:px-0">
                <Card className="glass-card border-0 shadow-lg">
                  <CardContent className="p-3 sm:p-4">
                    <p className="text-black dark:text-white font-medium text-center text-sm sm:text-base">
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-blue-600 mr-2 sm:mr-3"></div>
                          Searching your delicious options...
                        </span>
                      ) : (
                        `Found ${filteredItems.length} delicious ${filteredItems.length !== 1 ? 'options' : 'option'} for "${searchTerm}"`
                      )}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
            <MenuGrid items={filteredItems} isLoading={isLoading} />
          </div>
        </CategoryTabs>

        {/* Empty State */}
        {!isLoading && filteredItems.length === 0 && (
          <div className="text-center py-12 sm:py-16 px-4 sm:px-0">
            <Card className="glass-card border-0 shadow-2xl max-w-sm sm:max-w-md mx-auto">
              <CardContent className="p-8 sm:p-12">
                <div className="text-4xl sm:text-6xl mb-4 sm:mb-6">🔍</div>
                <h3 className="text-xl sm:text-2xl font-bold text-black dark:text-white mb-3 sm:mb-4">No dishes found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 text-balance text-sm sm:text-base">
                  {searchTerm 
                    ? `We couldn't find any dishes matching "${searchTerm}". Try a different search term.`
                    : `No dishes available in this category right now. Check back soon!`
                  }
                </p>
                {searchTerm && (
                  <Button
                    onClick={() => setSearchTerm('')}
                    className="btn-gradient-blue interactive text-sm sm:text-base"
                  >
                    Clear search and view all items
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
