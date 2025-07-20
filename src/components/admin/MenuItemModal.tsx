'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Upload, X } from 'lucide-react'
import { toast } from 'sonner'

interface MenuItem {
  id?: string
  name: string
  description: string
  price: string
  categoryId: string
  image?: string
  isVegetarian: boolean
  isVegan: boolean
  isGlutenFree: boolean
  spiceLevel: 'MILD' | 'MEDIUM' | 'HOT' | 'EXTRA_HOT'
  preparationTime: number
  ingredients: string[]
  tags: string[]
}

interface Category {
  id: string
  name: string
}

interface MenuItemModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (item: MenuItem) => void
  item?: MenuItem | null
  categories: Category[]
}

export default function MenuItemModal({ 
  isOpen, 
  onClose, 
  onSave, 
  item, 
  categories 
}: MenuItemModalProps) {
  const [formData, setFormData] = useState<MenuItem>({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    image: '',
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    spiceLevel: 'MILD',
    preparationTime: 30,
    ingredients: [],
    tags: []
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [ingredientsText, setIngredientsText] = useState('')
  const [tagsText, setTagsText] = useState('')

  // Initialize form data when item changes
  useEffect(() => {
    if (item) {
      setFormData(item)
      setIngredientsText(item.ingredients.join(', '))
      setTagsText(item.tags.join(', '))
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        categoryId: '',
        image: '',
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        spiceLevel: 'MILD',
        preparationTime: 30,
        ingredients: [],
        tags: []
      })
      setIngredientsText('')
      setTagsText('')
    }
  }, [item])

  const handleImageUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'menu-items')

    try {
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        return result.url
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let imageUrl = formData.image

      // Upload new image if selected
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile)
        if (!imageUrl) {
          setIsLoading(false)
          return
        }
      }

      const menuItemData = {
        ...formData,
        image: imageUrl,
        ingredients: ingredientsText.split(',').map(i => i.trim()).filter(i => i),
        tags: tagsText.split(',').map(t => t.trim()).filter(t => t)
      }

      if (item?.id) {
        // Update existing item
        const token = localStorage.getItem('admin-token')
        const response = await fetch(`/api/admin/menu/${item.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(menuItemData)
        })

        if (response.ok) {
          const result = await response.json()
          onSave(result.data || result)
          toast.success('Menu item updated successfully')
        } else {
          const error = await response.json()
          throw new Error(error.error || 'Failed to update menu item')
        }
      } else {
        // Create new item
        const token = localStorage.getItem('admin-token')
        const response = await fetch('/api/admin/menu', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(menuItemData)
        })

        if (response.ok) {
          const result = await response.json()
          onSave(result.data || result)
          toast.success('Menu item created successfully')
        } else {
          const error = await response.json()
          throw new Error(error.error || 'Failed to create menu item')
        }
      }

      onClose()
    } catch (error) {
      console.error('Error saving menu item:', error)
      toast.error('Failed to save menu item')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              {item ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h2>
            <p className="text-gray-600 mt-1">
              {item ? 'Update the menu item details below.' : 'Fill in the details to create a new menu item.'}
            </p>
          </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
              >
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
              <Label htmlFor="spiceLevel">Spice Level</Label>
              <Select
                value={formData.spiceLevel}
                onValueChange={(value: 'MILD' | 'MEDIUM' | 'HOT' | 'EXTRA_HOT') => 
                  setFormData({ ...formData, spiceLevel: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MILD">Mild</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HOT">Hot</SelectItem>
                  <SelectItem value="EXTRA_HOT">Extra Hot</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image</Label>
            <div className="flex items-center gap-4">
              {(formData.image || imageFile) && (
                <div className="relative">
                  <Image
                    src={imageFile ? URL.createObjectURL(imageFile) : (formData.image || '')}
                    alt="Menu item"
                    width={80}
                    height={60}
                    className="rounded-md object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={() => {
                      setImageFile(null)
                      setFormData({ ...formData, image: '' })
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setImageFile(file)
                    }
                  }}
                  className="hidden"
                  id="image-upload"
                />
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 border border-dashed border-gray-300 rounded-md p-4 hover:border-gray-400">
                    <Upload className="h-4 w-4" />
                    <span>Upload Image</span>
                  </div>
                </Label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preparationTime">Preparation Time (minutes)</Label>
              <Input
                id="preparationTime"
                type="number"
                value={formData.preparationTime}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  preparationTime: parseInt(e.target.value) || 0 
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Dietary Options</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isVegetarian}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      isVegetarian: e.target.checked 
                    })}
                  />
                  Vegetarian
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isVegan}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      isVegan: e.target.checked 
                    })}
                  />
                  Vegan
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isGlutenFree}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      isGlutenFree: e.target.checked 
                    })}
                  />
                  Gluten Free
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ingredients">Ingredients (comma separated)</Label>
            <Textarea
              id="ingredients"
              value={ingredientsText}
              onChange={(e) => setIngredientsText(e.target.value)}
              placeholder="Rice, chicken, spices, onions..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="popular, spicy, traditional..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (item ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
}
