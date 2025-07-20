"use client"

import { useState, useEffect } from 'react'
import { MenuGrid } from '@/components/menu/menu-grid'
import { CategoryTabs } from '@/components/menu/category-tabs'
import { MenuSearch } from '@/components/menu/menu-search'
import { MenuItem, Category } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface MenuItemWithCategory extends Omit<MenuItem, 'category'> {
  category: Category
}

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [menuItems, setMenuItems] = useState<MenuItemWithCategory[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredItems, setFilteredItems] = useState<MenuItemWithCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/menu/categories?activeOnly=true')
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      const result = await response.json()
      // Handle the wrapped response structure
      const categoriesData = result.data || result
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([]) // Set empty array as fallback
      toast.error('Failed to load categories. Please try again.')
    }
  }

  // Fetch menu items
  const fetchMenuItems = async (categoryId?: string, search?: string) => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        limit: '100',
        isAvailable: 'true',
      })
      
      if (categoryId && categoryId !== 'all') {
        params.append('categoryId', categoryId)
      }
      
      if (search) {
        params.append('search', search)
      }

      const response = await fetch(`/api/menu?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch menu items')
      }
      
      const data = await response.json()
      setMenuItems(data.items || [])
      setFilteredItems(data.items || [])
      setError(null)
    } catch (error) {
      console.error('Error fetching menu items:', error)
      setError('Failed to load menu items. Please try again.')
      toast.error('Failed to load menu items. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    Promise.all([
      fetchCategories(),
      fetchMenuItems()
    ])
  }, [])

  // Filter items when category or search changes
  useEffect(() => {
    const filterItems = () => {
      let items = [...menuItems]

      // Filter by category
      if (selectedCategory !== 'all') {
        const selectedCategoryData = categories.find(cat => cat.slug === selectedCategory)
        if (selectedCategoryData) {
          items = items.filter(item => item.category?.id === selectedCategoryData.id)
        }
      }

      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        items = items.filter(item =>
          item.name.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower) ||
          item.category?.name.toLowerCase().includes(searchLower) ||
          (item.ingredients && item.ingredients.some((ingredient: string) => 
            ingredient.toLowerCase().includes(searchLower)
          ))
        )
      }

      setFilteredItems(items)
    }

    filterItems()
  }, [selectedCategory, searchTerm, menuItems, categories])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
  }

  const handleSearchChange = (term: string) => {
    setSearchTerm(term)
  }

  if (error && !isLoading) {
    return (
      <div className="min-h-screen modern-bg floating-shapes flex items-center justify-center">
        <Card className="glass-card border-0 shadow-2xl max-w-md mx-auto">
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-6">😔</div>
            <h3 className="text-2xl font-bold text-black dark:text-white mb-4">Something went wrong</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="btn-gradient-blue interactive"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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
          categories={categories}
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
        {!isLoading && filteredItems.length === 0 && !error && (
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
