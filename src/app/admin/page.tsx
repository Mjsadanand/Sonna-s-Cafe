import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  ChefHat,
  Settings
} from 'lucide-react'

export default function AdminDashboard() {
  // Mock data for demo
  const stats = {
    totalOrders: 1234,
    totalRevenue: 45678.90,
    todayOrders: 89,
    todayRevenue: 2134.50,
    pendingOrders: 12,
    completedOrders: 1222
  }

  const recentOrders = [
    { id: "FH-001234", customer: "John Doe", items: 3, total: 34.50, status: "preparing", time: "2 min ago" },
    { id: "FH-001235", customer: "Jane Smith", items: 2, total: 28.99, status: "ready", time: "5 min ago" },
    { id: "FH-001236", customer: "Mike Johnson", items: 1, total: 16.99, status: "delivered", time: "12 min ago" },
    { id: "FH-001237", customer: "Sarah Wilson", items: 4, total: 52.75, status: "confirmed", time: "15 min ago" },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'preparing': return 'bg-yellow-100 text-yellow-800'
      case 'ready': return 'bg-green-100 text-green-800'
      case 'delivered': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Sonna&apos;s Hotel Admin</h1>
                <p className="text-sm text-gray-500">Hotel Management Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Link href="/">
                <Button variant="outline" size="sm">
                  View Site
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Demo Notice */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Demo Mode:</strong> This is a preview of the admin dashboard. Full functionality will be implemented later.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Orders</CardDescription>
              <CardTitle className="text-2xl">{stats.totalOrders.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-sm">+12% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Revenue</CardDescription>
              <CardTitle className="text-2xl">₹{stats.totalRevenue.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-green-600">
                <DollarSign className="w-4 h-4 mr-1" />
                <span className="text-sm">+8% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Today&apos;s Orders</CardDescription>
              <CardTitle className="text-2xl">{stats.todayOrders}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-blue-600">
                <ShoppingBag className="w-4 h-4 mr-1" />
                <span className="text-sm">Active orders</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Today&apos;s Revenue</CardDescription>
              <CardTitle className="text-2xl">₹{stats.todayRevenue.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-purple-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-sm">Above average</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Recent Orders
                </CardTitle>
                <CardDescription>Latest customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium">{order.id}</p>
                            <p className="text-sm text-gray-600">{order.customer}</p>
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{order.total}</p>
                        <p className="text-sm text-gray-500">{order.items} items • {order.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Button variant="outline" size="sm">
                    View All Orders
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <ChefHat className="w-4 h-4 mr-2" />
                  Add Menu Item
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Hotel Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Order Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Pending</span>
                  <Badge variant="secondary">{stats.pendingOrders}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Preparing</span>
                  <Badge className="bg-yellow-100 text-yellow-800">8</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Ready</span>
                  <Badge className="bg-green-100 text-green-800">4</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Completed</span>
                  <Badge variant="secondary">{stats.completedOrders}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/menu">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <ChefHat className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-semibold">Menu Management</h3>
                <p className="text-sm text-gray-600">Add, edit, and manage menu items</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/orders">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-semibold">Order Management</h3>
                <p className="text-sm text-gray-600">View and manage customer orders</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/analytics">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-semibold">Analytics & Reports</h3>
                <p className="text-sm text-gray-600">View sales and performance data</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
