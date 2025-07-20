'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Save, X, Plus } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'

interface FormData {
  name: string
  description: string
  price: string
  categoryId: string
  imageUrl: string
  isAvailable: boolean
  isVegetarian: boolean
  isVegan: boolean
  isGlutenFree: boolean
  spiceLevel: 'MILD' | 'MEDIUM' | 'HOT' | 'EXTRA_HOT'
  preparationTime: number
  ingredients: string[]
  allergens: string[]
  tags: string[]
}

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  categoryId: string
  image: string
  isAvailable: boolean
  isVegetarian: boolean
  isVegan: boolean
  isGlutenFree: boolean
  spiceLevel: string
  preparationTime: number
  ingredients: string[]
  allergens: string[]
  tags: string[]
}

interface Category {
  id: string
  name: string
}

export default function EditMenuItem() {
  const router = useRouter()
  const params = useParams()
  const itemId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [newIngredient, setNewIngredient] = useState('')
  const [newAllergen, setNewAllergen] = useState('')
  const [newTag, setNewTag] = useState('')
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    imageUrl: '',
    isAvailable: true,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    spiceLevel: 'MILD',
    preparationTime: 15,
    ingredients: [],
    allergens: [],
    tags: []
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('admin-token')
        if (!token) {
          router.push('/admin/login')
          return
        }

        // Fetch menu item details
        const itemResponse = await fetch(`/api/admin/menu/${itemId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        // Fetch categories
        const categoriesResponse = await fetch('/api/admin/categories', {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (itemResponse.ok && categoriesResponse.ok) {
          const item: MenuItem = await itemResponse.json()
          const categoriesData = await categoriesResponse.json()
          
          setCategories(categoriesData)
          setFormData({
            name: item.name,
            description: item.description,
            price: item.price.toString(),
            categoryId: item.categoryId,
            imageUrl: item.image || '',
            isAvailable: item.isAvailable,
            isVegetarian: item.isVegetarian || false,
            isVegan: item.isVegan || false,
            isGlutenFree: item.isGlutenFree || false,
            spiceLevel: (item.spiceLevel as FormData['spiceLevel']) || 'MILD',
            preparationTime: item.preparationTime || 15,
            ingredients: item.ingredients || [],
            allergens: item.allergens || [],
            tags: item.tags || []
          })
        } else {
          router.push('/admin/menu')
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        router.push('/admin/menu')
      } finally {
        setLoading(false)
      }
    }

    if (itemId) {
      fetchData()
    }
  }, [itemId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const token = localStorage.getItem('admin-token')
      const response = await fetch(`/api/admin/menu/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
        }),
      })

      if (response.ok) {
        router.push('/admin/menu')
      } else {
        alert('Failed to update menu item')
      }
    } catch (error) {
      console.error('Error updating menu item:', error)
      alert('Error updating menu item')
    } finally {
      setSaving(false)
    }
  }

  const addItem = (type: 'ingredients' | 'allergens' | 'tags', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [type]: [...prev[type], value.trim()]
      }))
      if (type === 'ingredients') setNewIngredient('')
      if (type === 'allergens') setNewAllergen('')
      if (type === 'tags') setNewTag('')
    }
  }

  const removeItem = (type: 'ingredients' | 'allergens' | 'tags', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading menu item...</p>
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
              <Link href="/admin/menu">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Menu
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Menu Item</h1>
                <p className="text-sm text-gray-500">Update menu item details</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Menu Item Details</CardTitle>
              <CardDescription>Update the information for this menu item</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Item Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter item name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the menu item"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.categoryId} onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preparationTime">Preparation Time (minutes)</Label>
                    <Input
                      id="preparationTime"
                      type="number"
                      value={formData.preparationTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, preparationTime: parseInt(e.target.value) || 15 }))}
                      placeholder="15"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* Options */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Dietary Options</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="available"
                        checked={formData.isAvailable}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAvailable: !!checked }))}
                      />
                      <Label htmlFor="available">Available</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="vegetarian"
                        checked={formData.isVegetarian}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVegetarian: !!checked }))}
                      />
                      <Label htmlFor="vegetarian">Vegetarian</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="vegan"
                        checked={formData.isVegan}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVegan: !!checked }))}
                      />
                      <Label htmlFor="vegan">Vegan</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="glutenFree"
                        checked={formData.isGlutenFree}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isGlutenFree: !!checked }))}
                      />
                      <Label htmlFor="glutenFree">Gluten Free</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="spiceLevel">Spice Level</Label>
                  <Select value={formData.spiceLevel} onValueChange={(value: FormData['spiceLevel']) => setFormData(prev => ({ ...prev, spiceLevel: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select spice level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MILD">Mild</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HOT">Hot</SelectItem>
                      <SelectItem value="EXTRA_HOT">Extra Hot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Ingredients */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Ingredients</h3>
                  <div className="flex space-x-2">
                    <Input
                      value={newIngredient}
                      onChange={(e) => setNewIngredient(e.target.value)}
                      placeholder="Add ingredient"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('ingredients', newIngredient))}
                    />
                    <Button type="button" onClick={() => addItem('ingredients', newIngredient)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.ingredients.map((ingredient, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {ingredient}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => removeItem('ingredients', index)} />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Allergens */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Allergens</h3>
                  <div className="flex space-x-2">
                    <Input
                      value={newAllergen}
                      onChange={(e) => setNewAllergen(e.target.value)}
                      placeholder="Add allergen"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('allergens', newAllergen))}
                    />
                    <Button type="button" onClick={() => addItem('allergens', newAllergen)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.allergens.map((allergen, index) => (
                      <Badge key={index} variant="destructive" className="flex items-center gap-1">
                        {allergen}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => removeItem('allergens', index)} />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Tags</h3>
                  <div className="flex space-x-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add tag"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('tags', newTag))}
                    />
                    <Button type="button" onClick={() => addItem('tags', newTag)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {tag}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => removeItem('tags', index)} />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <Link href="/admin/menu">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={saving} className="bg-green-600 hover:bg-green-700">
                    {saving ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </div>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Update Menu Item
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
