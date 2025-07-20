'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Download,
  Settings,
  DollarSign,
  Clock,
  AlertCircle,
  ChevronDown
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import MenuItemModal from './MenuItemModal'

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

interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalUsers: number
  totalMenuItems: number
  todayOrders: number
  todayRevenue: number
  pendingOrders: number
  deliveredOrders: number
  orderGrowth: number
  revenueGrowth: number
}

interface Order {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  subtotal: string
  tax: string
  deliveryFee: string
  discount: string
  total: string
  customerNotes: string | null
  estimatedDeliveryTime: string | null
  actualDeliveryTime: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
  }
}

interface MenuItemWithStats {
  id: string
  name: string
  description: string | null
  price: number
  image: string | null
  categoryId: string
  isAvailable: boolean
  isVegetarian: boolean
  isVegan: boolean
  isGlutenFree: boolean
  spiceLevel: string
  preparationTime: number | null
  isPopular: boolean
  createdAt: string
  updatedAt: string
  ordersCount: number
  totalQuantitySold: number
  revenue: number
}

interface User {
  id: string
  clerkId: string
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  role: string
  isActive: boolean
  loyaltyPoints: number
  createdAt: string
  updatedAt: string
  totalOrders: number
  totalSpent: number
  lastOrderDate: string | null
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [menuItems, setMenuItems] = useState<MenuItemWithStats[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')

  // Menu Modal states
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false)
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null)
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])

  // Category states
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDescription, setNewCategoryDescription] = useState('')

  // Menu search state
  const [menuSearchTerm, setMenuSearchTerm] = useState('')

  // Export states
  const [isExporting, setIsExporting] = useState(false)

  // Get token from localStorage
  const getAuthHeaders = () => {
    const token = localStorage.getItem('admin-token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  // Handle data export
  const handleExportData = async (type: 'orders' | 'menu-items' | 'users') => {
    setIsExporting(true)
    try {
      const response = await fetch(`/api/admin/export/${type}`, {
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        throw new Error(`Failed to export ${type}`)
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `${type}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} exported successfully`)
    } catch (error) {
      console.error(`Error exporting ${type}:`, error)
      toast.error(`Failed to export ${type}`)
    } finally {
      setIsExporting(false)
    }
  }

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: getAuthHeaders()
      })
      if (!response.ok) throw new Error('Failed to fetch stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast.error('Failed to load dashboard statistics')
    }
  }

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders?limit=50', {
        headers: getAuthHeaders()
      })
      if (!response.ok) throw new Error('Failed to fetch orders')
      const data = await response.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders')
    }
  }

  // Fetch menu items
  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/admin/menu-items', {
        headers: getAuthHeaders()
      })
      if (!response.ok) throw new Error('Failed to fetch menu items')
      const data = await response.json()
      setMenuItems(data)
    } catch (error) {
      console.error('Error fetching menu items:', error)
      toast.error('Failed to load menu items')
    }
  }

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users?limit=50', {
        headers: getAuthHeaders()
      })
      if (!response.ok) throw new Error('Failed to fetch users')
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    }
  }

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/menu/categories')
      if (!response.ok) throw new Error('Failed to fetch categories')
      const result = await response.json()
      const categoriesData = result.data || result
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error fetching categories:', error)
      // Set default categories if API fails
      setCategories([
        { id: '1', name: 'Appetizers' },
        { id: '2', name: 'Main Courses' },
        { id: '3', name: 'Desserts' },
        { id: '4', name: 'Beverages' }
      ])
    }
  }

  // Menu modal handlers
  const handleOpenMenuModal = (item?: MenuItem) => {
    setSelectedMenuItem(item || null)
    setIsMenuModalOpen(true)
  }

  const handleCloseMenuModal = () => {
    setIsMenuModalOpen(false)
    setSelectedMenuItem(null)
  }

  const handleSaveMenuItem = async (item: MenuItem) => {
    // Refresh menu items after save
    await fetchMenuItems()
    handleCloseMenuModal()
    console.log('Saved menu item:', item.name)
  }

  // Delete menu item
  const handleDeleteMenuItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/menu-items/${itemId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      if (response.ok) {
        toast.success('Menu item deleted successfully')
        await fetchMenuItems()
      } else {
        throw new Error('Failed to delete menu item')
      }
    } catch (error) {
      console.error('Error deleting menu item:', error)
      toast.error('Failed to delete menu item')
    }
  }

  // Category handlers
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Category name is required')
      return
    }

    try {
      const slug = newCategoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: newCategoryName.trim(),
          slug: slug,
          description: newCategoryDescription.trim() || null
        })
      })

      if (response.ok) {
        toast.success('Category added successfully')
        setNewCategoryName('')
        setNewCategoryDescription('')
        setShowAddCategory(false)
        await fetchCategories()
      } else {
        throw new Error('Failed to add category')
      }
    } catch (error) {
      console.error('Error adding category:', error)
      toast.error('Failed to add category')
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        await Promise.all([
          fetchStats(),
          fetchOrders(),
          fetchMenuItems(),
          fetchUsers(),
          fetchCategories()
        ])
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error('Failed to load dashboard data')
      }
      setIsLoading(false)
    }

    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update order status
  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      })

      if (!response.ok) throw new Error('Failed to update order')

      toast.success(`Order ${status.toLowerCase()} successfully`)
      await fetchOrders()
      await fetchStats() // Refresh stats
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('Failed to update order status')
    }
  }

  // Toggle menu item availability
  const toggleMenuItemAvailability = async (itemId: string, available: boolean) => {
    try {
      const response = await fetch(`/api/admin/menu-items/${itemId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isAvailable: available })
      })

      if (!response.ok) throw new Error('Failed to update menu item')

      toast.success(`Menu item ${available ? 'enabled' : 'disabled'} successfully`)
      await fetchMenuItems()
    } catch (error) {
      console.error('Error updating menu item:', error)
      toast.error('Failed to update menu item')
    }
  }

  // Filter orders based on search and status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.user.firstName && order.user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.user.lastName && order.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Filter menu items based on search
  const filteredMenuItems = menuItems.filter((item) => {
    if (!menuSearchTerm) return true
    
    const searchLower = menuSearchTerm.toLowerCase()
    const categoryName = categories.find(cat => cat.id === item.categoryId)?.name || ''
    
    return (
      item.name.toLowerCase().includes(searchLower) ||
      (item.description && item.description.toLowerCase().includes(searchLower)) ||
      categoryName.toLowerCase().includes(searchLower) ||
      item.spiceLevel.toLowerCase().includes(searchLower) ||
      item.price.toString().includes(searchLower)
    )
  })

  // Get recent orders (last 10)
  const recentOrders = orders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm md:text-base">Manage your restaurant operations</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Button variant="outline" className="w-full sm:w-auto">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={isExporting} className="w-full sm:w-auto">
                  <Download className="w-4 h-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Export Data'}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExportData('orders')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Orders
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportData('menu-items')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Menu Items
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportData('users')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Users
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                {stats.todayOrders} orders today
              </p>
              {stats.orderGrowth !== 0 && (
                <div className="flex items-center text-xs">
                  <TrendingUp className={`w-3 h-3 mr-1 ${stats.orderGrowth > 0 ? 'text-green-600' : 'text-red-600'}`} />
                  <span className={stats.orderGrowth > 0 ? 'text-green-600' : 'text-red-600'}>
                    {stats.orderGrowth > 0 ? '+' : ''}{stats.orderGrowth.toFixed(1)}%
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                ₹{stats.todayRevenue.toFixed(2)} today
              </p>
              {stats.revenueGrowth !== 0 && (
                <div className="flex items-center text-xs">
                  <TrendingUp className={`w-3 h-3 mr-1 ${stats.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`} />
                  <span className={stats.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}>
                    {stats.revenueGrowth > 0 ? '+' : ''}{stats.revenueGrowth.toFixed(1)}%
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Registered customers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMenuItems}</div>
              <p className="text-xs text-muted-foreground">
                Available items
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="menu">Menu</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>
                  {recentOrders.length > 0 ? 'Latest customer orders' : 'No orders yet today'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentOrders.length > 0 ? (
                  <div className="space-y-3">
                    {recentOrders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">#{order.orderNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.user.firstName ? `${order.user.firstName} ${order.user.lastName}` : order.user.email}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={
                            order.status === 'delivered' ? 'default' :
                            order.status === 'cancelled' ? 'destructive' :
                            order.status === 'pending' ? 'secondary' :
                            'outline'
                          }>
                            {order.status}
                          </Badge>
                          <p className="text-sm font-medium">₹{parseFloat(order.total).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No orders yet today</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Today&apos;s performance overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pending Orders</span>
                    <span className="font-medium">{stats?.pendingOrders || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Completed Orders</span>
                    <span className="font-medium">{stats?.deliveredOrders || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Menu Items</span>
                    <span className="font-medium">
                      {menuItems.filter(item => item.isAvailable).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Users</span>
                    <span className="font-medium">{users.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Management</CardTitle>
              <CardDescription>
                View and manage all customer orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                  title="Filter orders by status"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Orders List */}
              <div className="space-y-4">
                {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                  <Card key={order.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">#{order.orderNumber}</span>
                          <Badge variant={
                            order.status === 'delivered' ? 'default' :
                            order.status === 'cancelled' ? 'destructive' :
                            order.status === 'pending' ? 'secondary' :
                            'outline'
                          }>
                            {order.status}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium">Customer</p>
                          <p className="text-sm text-muted-foreground">
                            {order.user.firstName ? `${order.user.firstName} ${order.user.lastName}` : order.user.email}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Payment: {order.paymentStatus}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium">Order Details</p>
                          <p className="text-sm text-muted-foreground">
                            Total: ₹{parseFloat(order.total).toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Subtotal: ₹{parseFloat(order.subtotal).toFixed(2)}
                          </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {order.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, 'confirmed')}
                            >
                              Confirm
                            </Button>
                          )}
                          {order.status === 'confirmed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateOrderStatus(order.id, 'preparing')}
                            >
                              Start Preparing
                            </Button>
                          )}
                          {order.status === 'preparing' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateOrderStatus(order.id, 'ready')}
                            >
                              Mark Ready
                            </Button>
                          )}
                          {order.status === 'ready' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateOrderStatus(order.id, 'delivered')}
                            >
                              Mark Delivered
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No orders found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Menu Tab */}
        <TabsContent value="menu" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Menu Management</CardTitle>
                  <CardDescription>
                    Manage menu items and their availability
                  </CardDescription>
                </div>
                <Button onClick={() => handleOpenMenuModal()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Menu Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search menu items by name, description, category, or price..."
                    value={menuSearchTerm}
                    onChange={(e) => setMenuSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {menuSearchTerm && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Found {filteredMenuItems.length} item{filteredMenuItems.length !== 1 ? 's' : ''} matching &quot;{menuSearchTerm}&quot;
                  </p>
                )}
              </div>

              {/* Category Management Section */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-medium">Categories ({categories.length})</h3>
                    <p className="text-xs text-muted-foreground">Manage menu categories</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddCategory(!showAddCategory)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Category
                  </Button>
                </div>

                {/* Add Category Form */}
                {showAddCategory && (
                  <div className="space-y-3 p-3 bg-white rounded border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-700">Category Name *</label>
                        <Input
                          placeholder="e.g., Premium Eggless Cakes"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">Description</label>
                        <Input
                          placeholder="e.g., Exquisite eggless cakes..."
                          value={newCategoryDescription}
                          onChange={(e) => setNewCategoryDescription(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleAddCategory}>
                        Add Category
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          setShowAddCategory(false)
                          setNewCategoryName('')
                          setNewCategoryDescription('')
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Categories List */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {categories.map((category) => (
                    <Badge key={category.id} variant="secondary" className="text-xs">
                      {category.name}
                    </Badge>
                  ))}
                  {categories.length === 0 && (
                    <p className="text-xs text-muted-foreground">No categories yet. Add one above.</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMenuItems.length > 0 ? filteredMenuItems.map((item) => (
                  <Card key={item.id} className={`relative ${!item.isAvailable ? 'opacity-60' : ''}`}>
                    <CardContent className="p-4">
                      <div className="aspect-square bg-gray-100 rounded-lg mb-3 relative overflow-hidden">
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
                            <Package className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        {!item.isAvailable && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span className="text-white font-medium">Unavailable</span>
                          </div>
                        )}
                      </div>
                      
                      <h3 className="font-medium mb-1">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {item.description || 'No description'}
                      </p>
                      <p className="font-semibold text-lg mb-3">₹{(typeof item.price === 'string' ? parseFloat(item.price) : item.price).toFixed(2)}</p>
                      
                      <div className="text-xs text-muted-foreground mb-3">
                        <p>{item.ordersCount} orders • ₹{(typeof item.revenue === 'string' ? parseFloat(item.revenue) : item.revenue).toFixed(2)} revenue</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={item.isAvailable ? "outline" : "default"}
                          onClick={() => toggleMenuItemAvailability(item.id, !item.isAvailable)}
                        >
                          {item.isAvailable ? 'Disable' : 'Enable'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleOpenMenuModal({
                            id: item.id,
                            name: item.name,
                            description: item.description || '',
                            price: item.price.toString(),
                            categoryId: item.categoryId,
                            image: item.image || '',
                            isVegetarian: item.isVegetarian,
                            isVegan: item.isVegan,
                            isGlutenFree: item.isGlutenFree,
                            spiceLevel: item.spiceLevel as 'MILD' | 'MEDIUM' | 'HOT' | 'EXTRA_HOT',
                            preparationTime: item.preparationTime || 30,
                            ingredients: [],
                            tags: []
                          })}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteMenuItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <div className="col-span-full text-center py-8">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      {menuSearchTerm ? `No menu items found matching "${menuSearchTerm}"` : 'No menu items found'}
                    </p>
                    {menuSearchTerm && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setMenuSearchTerm('')}
                        className="mt-2"
                      >
                        Clear search
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                View and manage registered users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.length > 0 ? users.map((user) => (
                  <Card key={user.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {user.firstName ? `${user.firstName} ${user.lastName}` : 'Anonymous User'}
                            </p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={user.isActive ? 'default' : 'secondary'}>
                                {user.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                              <Badge variant="outline">{user.role}</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{user.loyaltyPoints} points</p>
                          <p className="text-sm text-muted-foreground">
                            {user.totalOrders} orders • ₹{user.totalSpent.toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No users found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Menu Item Modal */}
      <MenuItemModal
        isOpen={isMenuModalOpen}
        onClose={handleCloseMenuModal}
        onSave={handleSaveMenuItem}
        item={selectedMenuItem}
        categories={categories}
      />
    </div>
    </div>
  )
}
