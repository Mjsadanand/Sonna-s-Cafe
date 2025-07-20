'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Package, Clock, MapPin, Loader2 } from 'lucide-react'
import { apiClient } from '@/lib/api/client'
import { formatCurrency, parsePrice } from '@/lib/utils'
import { toast } from 'sonner'

interface OrderDetails {
  id: string
  orderNumber: string
  status: string
  totalAmount: string
  createdAt: string
  estimatedDeliveryTime: string | null
  items: Array<{
    id: string
    quantity: number
    price: string
    menuItem: {
      name: string
      image?: string
    }
  }>
}

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setIsLoading(false)
        return
      }

      try {
        const response = await apiClient.orders.getOrder(orderId)
        if (response.success && response.data) {
          setOrder(response.data as OrderDetails)
        } else {
          toast.error('Failed to load order details')
        }
      } catch (error) {
        console.error('Error fetching order:', error)
        toast.error('Failed to load order details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  // Fallback for orders without ID or failed loading
  const orderNumber = order?.orderNumber || "FH-" + Math.random().toString(36).substr(2, 9).toUpperCase()
  const estimatedDelivery = order?.estimatedDeliveryTime 
    ? new Date(order.estimatedDeliveryTime).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    : new Date(Date.now() + 45 * 60 * 1000).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
            <p className="text-gray-600">
              Thank you for your order. We&apos;re preparing your delicious meal!
            </p>
          </div>

          {/* Order Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Order Number:</span>
                <span className="text-green-600 font-bold">{orderNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Status:</span>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                  {order?.status === 'pending' ? 'Preparing' : order?.status || 'Preparing'}
                </span>
              </div>
              {order?.totalAmount && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Amount:</span>
                  <span className="font-bold">{formatCurrency(parsePrice(order.totalAmount))}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="font-medium flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Estimated Delivery:
                </span>
                <span className="font-bold">{estimatedDelivery}</span>
              </div>
            </CardContent>
          </Card>

          {/* What's Next */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What&apos;s Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Order Confirmation</h4>
                    <p className="text-sm text-gray-600">You&apos;ll receive an email confirmation shortly.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-yellow-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Preparation</h4>
                    <p className="text-sm text-gray-600">Our chefs are preparing your order with fresh ingredients.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Out for Delivery</h4>
                    <p className="text-sm text-gray-600">Your order will be on its way to you soon.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-600 font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Delivered</h4>
                    <p className="text-sm text-gray-600">Enjoy your delicious meal!</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/orders">
              <Button className="bg-green-600 hover:bg-green-700">
                <MapPin className="w-4 h-4 mr-2" />
                Track Your Order
              </Button>
            </Link>
            <Link href="/menu">
              <Button variant="outline">
                Order Again
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline">
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Support */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Questions about your order? Contact us at{' '}
              <a href="tel:+15551234567" className="text-green-600 hover:underline">
                (555) 123-4567
              </a>{' '}
              or{' '}
              <a href="mailto:support@foodiehub.com" className="text-green-600 hover:underline">
                support@foodiehub.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
