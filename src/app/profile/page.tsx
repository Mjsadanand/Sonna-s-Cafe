"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  MapPin, 
  CreditCard, 
  Heart,
  Settings,
  LogOut,
  ArrowLeft,
  Edit,
  Save,
  X,
  Phone,
  Mail,
  Star,
  Loader2
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'

interface UserProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  loyaltyPoints: number;
  createdAt: string;
}

interface OrderStats {
  totalOrders: number;
  totalSpent: number;
  completedOrders: number;
  pendingOrders: number;
  loyaltyPoints: number;
  availableDiscount: number;
}

interface FavoriteItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  orderCount: number;
  totalQuantity: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  itemCount: number;
}

interface ProfileData {
  user: UserProfile;
  statistics: OrderStats;
  favoriteItems: FavoriteItem[];
  recentOrders: RecentOrder[];
}

export default function ProfilePage() {
  const { user: clerkUser, isLoaded } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: ''
  })

  // Fetch profile data
  const fetchProfileData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/user/profile/stats')
      if (!response.ok) {
        throw new Error('Failed to fetch profile data')
      }
      const data = await response.json()
      setProfileData(data)
      
      // Initialize edit form
      setEditForm({
        firstName: data.user.firstName || '',
        lastName: data.user.lastName || '',
        phone: data.user.phone || ''
      })
    } catch (error) {
      console.error('Error fetching profile data:', error)
      toast.error('Failed to load profile data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isLoaded && clerkUser) {
      fetchProfileData()
    }
  }, [isLoaded, clerkUser])

  const handleSave = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const updatedUser = await response.json()
      setProfileData(prev => prev ? {
        ...prev,
        user: { ...prev.user, ...editForm }
      } : null)
      
      setIsEditing(false)
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    }
  }

  const handleCancel = () => {
    if (profileData) {
      setEditForm({
        firstName: profileData.user.firstName || '',
        lastName: profileData.user.lastName || '',
        phone: profileData.user.phone || ''
      })
    }
    setIsEditing(false)
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!clerkUser || !profileData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Unable to load profile data</p>
          <Button asChild className="mt-4">
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          {/* Back Button - Mobile Only (Icon Only) */}
          <div className="sm:hidden mb-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="w-10 h-10 p-0">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Desktop Header */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage your account and preferences</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>

          {/* Mobile Header */}
          <div className="sm:hidden">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your account and preferences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>Your basic account details</CardDescription>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="sm:hidden"
                  >
                    {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                      <Input
                        value={editForm.firstName}
                        onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                      <Input
                        value={editForm.lastName}
                        onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                        placeholder="Enter your last name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                      <Input
                        value={editForm.phone}
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div className="flex space-x-2 pt-4">
                      <Button onClick={handleSave} size="sm">
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button onClick={handleCancel} variant="outline" size="sm">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">
                        {profileData.user.firstName} {profileData.user.lastName}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">{profileData.user.email}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">{profileData.user.phone || 'Not provided'}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Favorite Items */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <CardTitle>Favorite Items</CardTitle>
                    <CardDescription>Your most loved dishes</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profileData.favoriteItems.length > 0 ? (
                    profileData.favoriteItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Image 
                            src={item.image || '/images/placeholder-food.jpg'} 
                            alt={item.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{item.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{item.category}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="font-semibold text-green-600">{formatCurrency(item.price)}</span>
                            <span className="text-sm text-gray-500">
                              Ordered {item.orderCount} times
                            </span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Order Again
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No favorite items yet</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">Start ordering to see your favorites here!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Order Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Total Orders</span>
                    <span className="font-semibold dark:text-white">{profileData.statistics.totalOrders}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Total Spent</span>
                    <span className="font-semibold dark:text-white">{formatCurrency(profileData.statistics.totalSpent)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Completed Orders</span>
                    <span className="font-semibold dark:text-white">{profileData.statistics.completedOrders}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Loyalty Points</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      {profileData.statistics.loyaltyPoints} pts
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Available Discount</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(profileData.statistics.availableDiscount)}
                    </span>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xs text-blue-600 dark:text-blue-400 text-center">
                      Earn 1 point for every ₹1 spent • 1000 points = ₹10 discount
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/orders">
                  <Button variant="outline" className="w-full justify-start">
                    <User className="w-4 h-4 mr-2" />
                    View Orders
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start">
                  <MapPin className="w-4 h-4 mr-2" />
                  Manage Addresses
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Payment Methods
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Account Settings
                </Button>
                <Separator />
                <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>

            {/* Loyalty Program */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">Loyalty Rewards</CardTitle>
                <CardDescription className="text-green-700">
                  You&apos;re {550} points away from your next reward!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="w-full bg-white rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full transition-all duration-300 w-4/5"></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-700">2,450 points</span>
                    <span className="text-green-700">3,000 points</span>
                  </div>
                  <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                    View Rewards
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
