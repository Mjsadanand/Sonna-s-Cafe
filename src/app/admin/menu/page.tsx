'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import { 
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ArrowLeft,
  ChefHat,
  DollarSign
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface MenuItem {
  id: string
  name: string
  description: string
  price: string
  categoryId: string
  image: string
  isAvailable: boolean
  isVegetarian: boolean
  isVegan: boolean
  isGlutenFree: boolean
  isPopular: boolean
  spiceLevel: string
  preparationTime: number
  ingredients: string[]
  tags: string[]
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export default function AdminMenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  const fetchMenuItems = useCallback(async () => {
    try {
      const token = localStorage.getItem('admin-token')
      if (!token) {
        router.push('/admin/login')
        return
      }

      const response = await fetch('/api/admin/menu', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Handle paginated response
        if (data.items) {
          setMenuItems(data.items)
        } else {
          setMenuItems(data)
        }
      } else if (response.status === 401) {
        router.push('/admin/login')
      }
    } catch (error) {
      console.error('Error fetching menu items:', error)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchMenuItems()
  }, [fetchMenuItems])

  const toggleAvailability = async (itemId: string, isAvailable: boolean) => {
    try {
      const token = localStorage.getItem('admin-token')
      const response = await fetch(`/api/admin/menu/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          isAvailable: !isAvailable,
        }),
      })

      if (response.ok) {
        fetchMenuItems() // Refresh the list
      }
    } catch (error) {
      console.error('Error updating menu item:', error)
    }
  }

  const deleteMenuItem = async (itemId: string, itemName: string) => {
    if (!confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const token = localStorage.getItem('admin-token')
      const response = await fetch(`/api/admin/menu/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        fetchMenuItems() // Refresh the list
      } else {
        alert('Failed to delete menu item')
      }
    } catch (error) {
      console.error('Error deleting menu item:', error)
      alert('Error deleting menu item')
    }
  }

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading menu items...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Menu Management</h1>
                <p className="text-sm text-gray-500">Manage your restaurant menu items</p>
              </div>
            </div>
            <Link href="/admin/menu/add">
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Menu Item
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Search and Filters */}
        <div className="mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search menu items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>Total Items: {menuItems.length}</span>
                  <span>•</span>
                  <span>Available: {menuItems.filter(item => item.isAvailable).length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ChefHat className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <CardDescription className="text-sm mt-1 line-clamp-2">
                      {item.description}
                    </CardDescription>
                  </div>
                  <Badge variant={item.isAvailable ? "default" : "secondary"}>
                    {item.isAvailable ? "Available" : "Unavailable"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-green-600">
                      <DollarSign className="w-4 h-4 mr-1" />
                      <span className="font-semibold">₹{item.price}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Category: {item.categoryId}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Prep Time: {item.preparationTime}min</span>
                    <span>Updated: {new Date(item.updatedAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAvailability(item.id, item.isAvailable)}
                      className="flex-1"
                    >
                      {item.isAvailable ? (
                        <>
                          <EyeOff className="w-3 h-3 mr-1" />
                          Hide
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3 mr-1" />
                          Show
                        </>
                      )}
                    </Button>
                    <Link href={`/admin/menu/edit/${item.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => deleteMenuItem(item.id, item.name)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No menu items found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'No items match your search.' : 'Get started by adding your first menu item.'}
            </p>
            {!searchTerm && (
              <Link href="/admin/menu/add">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Menu Item
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
