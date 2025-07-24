"use client"

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { MenuItem, Category } from '@/types'
import { toast } from 'sonner'
import { Search } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SwiggyMenuGrid, WhatsOnMind, TopPicks } from '@/components/menu'
import { useCart } from '@/contexts/cart-context-new'
import { useRouter } from 'next/navigation'

interface MenuItemWithCategory extends Omit<MenuItem, 'category'> {
  category: Category
}

export default function MenuClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialSearch = searchParams?.get('search') || '';
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [menuItems, setMenuItems] = useState<MenuItemWithCategory[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredItems, setFilteredItems] = useState<MenuItemWithCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCartAlert, setShowCartAlert] = useState(false)
  const { getCartItemCount } = useCart()

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/menu/categories?activeOnly=true')
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      const result = await response.json()
      const categoriesData = result.data || result
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([])
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

  // Initial fetch, use search param if present
  useEffect(() => {
    Promise.all([
      fetchCategories(),
      fetchMenuItems(undefined, initialSearch)
    ])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Filter items when category or search changes
  useEffect(() => {
    const filterItems = () => {
      let items = [...menuItems]

      if (selectedCategory !== 'all') {
        const selectedCategoryData = categories.find(cat => cat.slug === selectedCategory)
        if (selectedCategoryData) {
          items = items.filter(item => item.category?.id === selectedCategoryData.id)
        }
      }

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
    setSearchTerm(term);
    if (term === '') {
      // When search is cleared, fetch all menu items again
      fetchMenuItems(selectedCategory !== 'all' ? selectedCategory : undefined, '');
    } else {
      // When typing, fetch filtered menu items
      fetchMenuItems(selectedCategory !== 'all' ? selectedCategory : undefined, term);
    }
  }

  // Helper to clear the search bar and menu
  const handleClearSearch = () => {
    setSearchTerm('');
    fetchMenuItems(selectedCategory !== 'all' ? selectedCategory : undefined, '');
    // Remove 'search' param from URL if present
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('search');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }

  // Show cart alert as long as there are items in the cart
  useEffect(() => {
    if (getCartItemCount() > 0) {
      setShowCartAlert(true)
    } else {
      setShowCartAlert(false)
    }
  }, [getCartItemCount])

  if (error && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto p-8 text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 animate-fade-in-up">
            <div className="text-6xl mb-4 animate-bounce-slow">😔</div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Something went wrong</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-orange-600 hover:bg-orange-700 text-white mb-4">
              Try Again
            </Button>
            <div className="mt-8">
              <h4 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Try these popular categories:</h4>
              <div className="flex flex-wrap gap-3 justify-center">
                {['Pizza','Burgers','Biryani','Chinese','Desserts','Drinks'].map(cat => (
                  <Button key={cat} variant="outline" className="border-orange-400 text-orange-600 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900" onClick={() => { setError(null); setSelectedCategory(cat.toLowerCase()); }}>
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header with Search */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for restaurant, cuisine or a dish"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* What's on your mind? */}
        <WhatsOnMind onCategorySelect={handleCategoryChange} />

        {/* Top Picks Section */}
        <TopPicks items={filteredItems.slice(0, 6)} isLoading={isLoading} />

        {/* Menu Grid - Swiggy Style */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Items to explore</h2>
          <SwiggyMenuGrid 
            items={filteredItems} 
            isLoading={isLoading}
            onItemAdded={() => setShowCartAlert(true)}
          />
        </div>

        {/* Empty State */}
        {!isLoading && filteredItems.length === 0 && !error && (
          <div className="text-center py-16 animate-fade-in-up">
            <div className="text-6xl mb-4 animate-bounce-slow">🔍</div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">No dishes found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm 
                ? `We couldn't find any dishes matching "${searchTerm}". Try a different search term.`
                : `No dishes available in this category right now. Check back soon!`
              }
            </p>
            {searchTerm && (
              <Button onClick={handleClearSearch} className="bg-orange-600 hover:bg-orange-700 text-white mb-4">
                Clear search and view all items
              </Button>
            )}
            <div className="mt-8">
              <h4 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Try these popular categories:</h4>
              <div className="flex flex-wrap gap-3 justify-center">
                {['Pizza','Burgers','Biryani','Chinese','Desserts','Drinks'].map(cat => (
                  <Button key={cat} variant="outline" className="border-orange-400 text-orange-600 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900" onClick={() => { setSearchTerm(''); setSelectedCategory(cat.toLowerCase()); }}>
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cart Alert - Floating Button */}
      {showCartAlert && getCartItemCount() > 0 && (
        <div
          className="fixed left-1/2 transform -translate-x-1/2 z-50 bottom-6 lg:bottom-6 mb-20 lg:mb-0"
          style={{ pointerEvents: 'auto' }}
        >
          <Button
            onClick={() => router.push('/cart')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-bounce"
          >
            <span className="bg-white text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              {getCartItemCount()}
            </span>
            View Cart
          </Button>
        </div>
      )}
    </div>
  )
}
