"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Clock, 
  CheckCircle, 
  Truck, 
  Package, 
  MapPin,
  Phone,
  ArrowLeft
} from 'lucide-react'

export default function OrdersPage() {
  // Mock orders data
  const [orders] = useState([
    {
      id: "FH-001234",
      date: "2024-01-15",
      status: "delivered",
      items: ["Margherita Pizza", "Buffalo Wings"],
      total: 34.50,
      estimatedDelivery: "45 minutes",
      actualDelivery: "42 minutes"
    },
    {
      id: "FH-001235",
      date: "2024-01-14",
      status: "preparing",
      items: ["Butter Chicken", "Mango Lassi"],
      total: 24.98,
      estimatedDelivery: "35 minutes",
      actualDelivery: null
    },
    {
      id: "FH-001236",
      date: "2024-01-12",
      status: "delivered",
      items: ["Crispy Spring Rolls", "Fresh Lemonade"],
      total: 13.98,
      estimatedDelivery: "30 minutes",
      actualDelivery: "28 minutes"
    }
  ])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Clock className="w-4 h-4" />
      case 'preparing':
        return <Package className="w-4 h-4" />
      case 'ready':
        return <CheckCircle className="w-4 h-4" />
      case 'out-for-delivery':
        return <Truck className="w-4 h-4" />
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'preparing':
        return 'bg-yellow-100 text-yellow-800'
      case 'ready':
        return 'bg-purple-100 text-purple-800'
      case 'out-for-delivery':
        return 'bg-orange-100 text-orange-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const activeOrders = orders.filter(order => order.status !== 'delivered')
  const pastOrders = orders.filter(order => order.status === 'delivered')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="w-fit">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Orders</h1>
              <p className="text-sm sm:text-base text-gray-600">Track and manage your food orders</p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {orders.length === 0 && (
          <div className="text-center py-12 sm:py-16 px-4">
            <Package className="w-16 sm:w-24 h-16 sm:h-24 mx-auto text-gray-300 mb-4 sm:mb-6" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">No orders yet</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
              You haven&apos;t placed any orders yet. Start browsing our delicious menu!
            </p>
            <Link href="/menu">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 h-12 px-8 text-base">
                Browse Menu
              </Button>
            </Link>
          </div>
        )}

        {/* Orders Tabs */}
        {orders.length > 0 && (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="active">
                Active Orders ({activeOrders.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past Orders ({pastOrders.length})
              </TabsTrigger>
            </TabsList>

            {/* Active Orders */}
            <TabsContent value="active" className="mt-6">
              {activeOrders.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                    <p className="text-gray-600">No active orders</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {activeOrders.map((order) => (
                    <Card key={order.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{order.id}</CardTitle>
                            <CardDescription>
                              Ordered on {new Date(order.date).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <Badge className={`${getStatusColor(order.status)} flex items-center space-x-1`}>
                            {getStatusIcon(order.status)}
                            <span className="capitalize">{order.status.replace('-', ' ')}</span>
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Items */}
                          <div>
                            <h4 className="font-medium mb-2">Items:</h4>
                            <ul className="text-sm text-gray-600">
                              {order.items.map((item, index) => (
                                <li key={index}>• {item}</li>
                              ))}
                            </ul>
                          </div>

                          {/* Order Details */}
                          <div className="flex justify-between items-center pt-4 border-t">
                            <div className="text-sm text-gray-600">
                              <p>Estimated delivery: {order.estimatedDelivery}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-lg">${order.total.toFixed(2)}</p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex space-x-2 pt-2">
                            <Button size="sm" variant="outline">
                              <MapPin className="w-4 h-4 mr-2" />
                              Track Order
                            </Button>
                            <Button size="sm" variant="outline">
                              <Phone className="w-4 h-4 mr-2" />
                              Contact Support
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Past Orders */}
            <TabsContent value="past" className="mt-6">
              <div className="space-y-4">
                {pastOrders.map((order) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{order.id}</CardTitle>
                          <CardDescription>
                            Delivered on {new Date(order.date).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Delivered
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Items */}
                        <div>
                          <h4 className="font-medium mb-2">Items:</h4>
                          <ul className="text-sm text-gray-600">
                            {order.items.map((item, index) => (
                              <li key={index}>• {item}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Order Details */}
                        <div className="flex justify-between items-center pt-4 border-t">
                          <div className="text-sm text-gray-600">
                            <p>Delivered in: {order.actualDelivery}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lg">${order.total.toFixed(2)}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-2 pt-2">
                          <Button size="sm" variant="outline">
                            Reorder
                          </Button>
                          <Button size="sm" variant="outline">
                            Leave Review
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Help Section */}
        <div className="mt-12 text-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                If you have any questions about your orders, our support team is here to help.
              </p>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Support: (555) 123-4567
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  Live Chat Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
