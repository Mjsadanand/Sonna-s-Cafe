"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useUser } from '@clerk/nextjs'
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
import { formatCurrency, parsePrice } from '@/lib/utils'
import { apiClient } from '@/lib/api/client'
import { toast } from 'sonner'

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  specialInstructions?: string | null;
  menuItem: {
    id: string;
    name: string;
    description: string;
    price: string;
    image: string;
    category: {
      id: string;
      name: string;
    };
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: string;
  createdAt: string | Date;
  estimatedDeliveryTime: string | Date | null;
  actualDeliveryTime: string | Date | null;
  items?: OrderItem[];
}

export default function OrdersPage() {
  // No need for menuItemsMap or mapping logic; backend now provides menuItem details
  const { user } = useUser()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch user orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      try {
        const response = await apiClient.orders.getUserOrders()
        if (response.success && response.data) {
          // The API returns a pagination object with orders array
          interface OrdersApiResponse {
            orders?: Order[];
            [key: string]: unknown;
          }
          const responseData = response.data as unknown as OrdersApiResponse;
          if (responseData.orders && Array.isArray(responseData.orders)) {
            setOrders(responseData.orders as Order[])
          } else if (Array.isArray(responseData)) {
            // Fallback: if it's directly an array
            setOrders(responseData as Order[])
          } else {
            // If neither, set empty array
            setOrders([])
          }
        } else {
          // API returned success:false, set empty array
          setOrders([])
          if (response.error) {
            console.error('API Error:', response.error)
          }
        }
      } catch (error) {
        console.error('Error fetching orders:', error)
        // Ensure orders is always an array even on error
        setOrders([])
        toast.error('Failed to load orders')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [user])

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

  const activeOrders = Array.isArray(orders) ? orders.filter(order => order.status !== 'delivered') : []
  const pastOrders = Array.isArray(orders) ? orders.filter(order => order.status === 'delivered') : []

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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Your Orders</h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Track and manage your food orders</p>
            </div>
          </div>
        </div>

        {/* Loader while fetching orders */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
            <span className="text-gray-600 dark:text-gray-400 text-lg">Loading your orders...</span>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && orders.length === 0 && (
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
        {!isLoading && orders.length > 0 && (
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
                            <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                            <CardDescription>
                              Ordered on {new Date(order.createdAt).toLocaleDateString()}
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
                            {/* <h4 className="font-medium mb-2">Items:</h4> */}
                            <div className="text-sm text-gray-600">
                              {order.items && order.items.length > 0 ? (
                                <ul>
                                  {order.items.map((item: OrderItem, index: number) => {
                                    const displayName = item.menuItem?.name || 'Item';
                                    const imageSrc = item.menuItem?.image || null;
                                    return (
                                      <li key={index} className="flex items-center gap-4 py-2 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                                        {imageSrc ? (
                                          <Image
                                            src={imageSrc}
                                            alt={displayName}
                                            width={48}
                                            height={48}
                                            className="w-12 h-12 rounded object-cover border border-gray-200 dark:border-gray-700"
                                            style={{ objectFit: 'cover' }}
                                            unoptimized={false}
                                            priority={false}
                                          />
                                        ) : (
                                          <div className="w-12 h-12 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500">🍽️</div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <span className="block font-semibold text-base md:text-lg text-gray-800 dark:text-gray-100 truncate">{displayName}</span>
                                          <span className="block text-xs md:text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity}</span>
                                        </div>
                                        <div className="text-right">
                                          {/* <span className="block text-green-700 dark:text-green-400 font-semibold text-base md:text-lg">₹{item.unitPrice}</span> */}
                                          {/* <span className="block text-xs text-gray-400 dark:text-gray-500">Total: ₹{item.totalPrice}</span> */}
                                        </div>
                                      </li>
                                    );
                                  })}
                                </ul>
                              ) : (
                                <p className="text-gray-500 dark:text-gray-400">No items available</p>
                              )}
                            </div>
                          </div>

                          {/* Order Details */}
                          <div className="flex justify-between items-center pt-4 border-t">
                            <div className="text-sm text-gray-600">
                              <p>Estimated delivery: {order.estimatedDeliveryTime ? new Date(order.estimatedDeliveryTime).toLocaleString() : 'TBD'}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-lg">{formatCurrency(parsePrice(order.total))}</p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex space-x-2 pt-2">
                            {/* <Button size="sm" variant="outline">
                              <MapPin className="w-4 h-4 mr-2" />
                              Track Order
                            </Button> */}
                            <Link href="/contact">
                              <Button size="sm" variant="outline">
                                <Phone className="w-4 h-4 mr-2" />
                                Contact Support
                              </Button>
                            </Link>
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
                          <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                          <CardDescription>
                            Delivered on {new Date(order.createdAt).toLocaleDateString()}
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
                          <div className="text-sm text-gray-600">
                            {order.items && order.items.length > 0 ? (
                              <ul>
                                {order.items.map((item: OrderItem, index: number) => (
                                  <li key={index}>
                                    <span className="font-semibold">{item.menuItem?.name || 'Unknown Item'}</span>
                                    &nbsp;| Qty: {item.quantity} - ₹{item.totalPrice}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p>No items available</p>
                            )}
                          </div>
                        </div>

                        {/* Order Details */}
                        <div className="flex justify-between items-center pt-4 border-t">
                          <div className="text-sm text-gray-600">
                            <p>Delivered: {order.actualDeliveryTime ? new Date(order.actualDeliveryTime).toLocaleString() : 'Time not recorded'}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lg">{formatCurrency(parsePrice(order.total))}</p>
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
        {!isLoading && (
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
        )}
      </div>
    </div>
  )
}
