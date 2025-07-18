"use client"

import { useState, useEffect, useRef } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Category } from '@/types'
import { ChevronDown, Check } from 'lucide-react'

interface CategoryTabsProps {
  categories: Category[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
  children: React.ReactNode
}

export function CategoryTabs({ 
  categories, 
  selectedCategory, 
  onCategoryChange,
  children 
}: CategoryTabsProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const allCategories = [
    { id: 'all', name: 'All Items', slug: 'all' },
    ...categories
  ]
  
  const selectedCategoryName = allCategories.find(cat => cat.slug === selectedCategory)?.name || 'All Items'

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <Tabs value={selectedCategory} onValueChange={onCategoryChange} className="w-full">
      <div className="sticky top-14 z-40 bg-white dark:bg-black py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-3 sm:px-4">
          {/* Mobile Dropdown */}
          <div className="md:hidden relative" ref={dropdownRef}>
            <Button
              variant="outline"
              className="w-full justify-between h-10 text-left bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="truncate">{selectedCategoryName}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </Button>
            
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                {allCategories.map((category) => (
                  <button
                    key={category.slug}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-between transition-colors ${
                      selectedCategory === category.slug ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'
                    }`}
                    onClick={() => {
                      onCategoryChange(category.slug)
                      setIsDropdownOpen(false)
                    }}
                  >
                    <span>{category.name}</span>
                    {selectedCategory === category.slug && (
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Horizontal Scroll Tabs */}
          <div className="hidden md:block">
            <div className="overflow-x-auto scrollbar-hide">
              <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-gray-100 dark:bg-gray-800 p-1 text-gray-500 dark:text-gray-400 min-w-full">
                <TabsTrigger 
                  value="all"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-sm dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300"
                >
                  All Items
                </TabsTrigger>
                {categories.map((category) => (
                  <TabsTrigger 
                    key={category.id}
                    value={category.slug}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-sm dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300"
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 sm:mt-6">
        <TabsContent value="all" className="mt-0">
          {children}
        </TabsContent>
        {categories.map((category) => (
          <TabsContent key={category.id} value={category.slug} className="mt-0">
            {children}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  )
}
