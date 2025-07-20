'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Plus,
  ArrowLeft,
  Save,
  X
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
  isPopular: boolean
  spiceLevel: 'MILD' | 'MEDIUM' | 'HOT' | 'EXTRA_HOT'
  preparationTime: number
  ingredients: string[]
  allergens: string[]
  tags: string[]
}

export default function AddMenuItem() {
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
    isPopular: false,
    spiceLevel: 'MILD',
    preparationTime: 15,
    ingredients: [],
    allergens: [],
    tags: []
  })
  
  const [loading, setLoading] = useState(false)
  const [ingredientInput, setIngredientInput] = useState('')
  const [allergenInput, setAllergenInput] = useState('')
  const [tagInput, setTagInput] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('admin-token')
      if (!token) {
        router.push('/admin/login')
        return
      }

      const response = await fetch('/api/admin/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/admin/menu?success=Item added successfully')
      } else if (response.status === 401) {
        router.push('/admin/login')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error || 'Failed to add menu item'}`)
      }
    } catch (error) {
      console.error('Error adding menu item:', error)
      alert('Failed to add menu item. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const addIngredient = () => {
    if (ingredientInput.trim() && !formData.ingredients.includes(ingredientInput.trim())) {
      setFormData(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, ingredientInput.trim()]
      }))
      setIngredientInput('')
    }
  }

  const removeIngredient = (ingredient: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(i => i !== ingredient)
    }))
  }

  const addAllergen = () => {
    if (allergenInput.trim() && !formData.allergens.includes(allergenInput.trim())) {
      setFormData(prev => ({
        ...prev,
        allergens: [...prev.allergens, allergenInput.trim()]
      }))
      setAllergenInput('')
    }
  }

  const removeAllergen = (allergen: string) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.filter(a => a !== allergen)
    }))
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Menu Item</h1>
                <p className="text-sm text-gray-500">Create a new item for your restaurant menu</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the basic details of your menu item</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Item Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Margherita Pizza"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Price (₹) *</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="299.00"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <textarea
                    className="w-full p-3 border border-gray-200 rounded-lg resize-none h-24"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your menu item..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Category ID</label>
                    <Input
                      value={formData.categoryId}
                      onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                      placeholder="e.g., pizzas, desserts, beverages"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Preparation Time (minutes)</label>
                    <Input
                      type="number"
                      value={formData.preparationTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, preparationTime: parseInt(e.target.value) || 15 }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Image URL</label>
                  <Input
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Properties */}
            <Card>
              <CardHeader>
                <CardTitle>Item Properties</CardTitle>
                <CardDescription>Set dietary information and properties</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isAvailable}
                      onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
                      className="rounded"
                    />
                    <span>Available</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isVegetarian}
                      onChange={(e) => setFormData(prev => ({ ...prev, isVegetarian: e.target.checked }))}
                      className="rounded"
                    />
                    <span>Vegetarian</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isVegan}
                      onChange={(e) => setFormData(prev => ({ ...prev, isVegan: e.target.checked }))}
                      className="rounded"
                    />
                    <span>Vegan</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isGlutenFree}
                      onChange={(e) => setFormData(prev => ({ ...prev, isGlutenFree: e.target.checked }))}
                      className="rounded"
                    />
                    <span>Gluten Free</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isPopular}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPopular: e.target.checked }))}
                      className="rounded"
                    />
                    <span>Popular</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Spice Level</label>
                  <select
                    value={formData.spiceLevel}
                    onChange={(e) => setFormData(prev => ({ ...prev, spiceLevel: e.target.value as 'MILD' | 'MEDIUM' | 'HOT' | 'EXTRA_HOT' }))}
                    className="w-full p-3 border border-gray-200 rounded-lg"
                    title="Select spice level"
                  >
                    <option value="MILD">Mild</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HOT">Hot</option>
                    <option value="EXTRA_HOT">Extra Hot</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Ingredients, Allergens, Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>Add ingredients, allergens, and tags</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Ingredients</label>
                  <div className="flex space-x-2 mb-2">
                    <Input
                      value={ingredientInput}
                      onChange={(e) => setIngredientInput(e.target.value)}
                      placeholder="Add ingredient"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
                    />
                    <Button type="button" onClick={addIngredient} variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.ingredients.map((ingredient, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                        <span>{ingredient}</span>
                        <button
                          type="button"
                          onClick={() => removeIngredient(ingredient)}
                          className="ml-1 hover:text-red-600"
                          title={`Remove ${ingredient}`}
                          aria-label={`Remove ${ingredient}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Allergens</label>
                  <div className="flex space-x-2 mb-2">
                    <Input
                      value={allergenInput}
                      onChange={(e) => setAllergenInput(e.target.value)}
                      placeholder="Add allergen"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergen())}
                    />
                    <Button type="button" onClick={addAllergen} variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.allergens.map((allergen, index) => (
                      <Badge key={index} variant="destructive" className="flex items-center space-x-1">
                        <span>{allergen}</span>
                        <button
                          type="button"
                          onClick={() => removeAllergen(allergen)}
                          className="ml-1 hover:text-red-200"
                          title={`Remove ${allergen}`}
                          aria-label={`Remove ${allergen}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <div className="flex space-x-2 mb-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add tag"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag} variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="flex items-center space-x-1">
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-600"
                          title={`Remove ${tag}`}
                          aria-label={`Remove ${tag}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <Link href="/admin/menu">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Add Menu Item
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
