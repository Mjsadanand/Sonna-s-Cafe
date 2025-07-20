'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
// TODO: Ensure Progress component exists at this path or update the import path accordingly
// import { Progress } from '@/components/ui/progress'
import { Progress } from '@/components/ui/progress'
import { 
  Clock, 
  CheckCircle, 
  Truck, 
  Package,
  MapPin,
  Phone,
  MessageCircle 
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { formatCurrency, parsePrice } from '@/lib/utils'

interface OrderTrackingProps {
  orderId: string
}

interface OrderStatusUpdate {
  id: string
  status: string
  timestamp: string
  message?: string
  estimatedTime?: string
}

interface TrackingOrder {
  id: string
  orderNumber: string
  status: string
  total: number
  createdAt: string
  estimatedDeliveryTime?: string
  deliveryAddress?: {
    addressLine1: string
    city: string
    postalCode: string
  }
  items: Array<{
    id: string
    name: string
    quantity: number
    price: number
  }>
  statusUpdates: OrderStatusUpdate[]
}

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Package },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'preparing', label: 'Preparing', icon: Clock },
  { key: 'ready', label: 'Ready for Pickup/Delivery', icon: Package },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle }
]

export default function OrderTracking({ orderId }: OrderTrackingProps) {
  const [order, setOrder] = useState<TrackingOrder | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  // Fetch order details
  const fetchOrder = useCallback(async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}/tracking`)
      if (!response.ok) throw new Error('Failed to fetch order')
      
      const orderData = await response.json()
      setOrder(orderData)
      
      // Calculate current step and progress
      const stepIndex = statusSteps.findIndex(step => step.key === orderData.status)
      setCurrentStep(stepIndex >= 0 ? stepIndex : 0)
      setProgress(stepIndex >= 0 ? ((stepIndex + 1) / statusSteps.length) * 100 : 0)
      
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching order:', error)
      toast.error('Failed to load order details')
      setIsLoading(false)
    }
  }, [orderId])

  // Set up real-time updates (simulated with polling for now)
  useEffect(() => {
    fetchOrder()
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchOrder, 30000)
    
    return () => clearInterval(interval)
  }, [fetchOrder])

  // Simulate WebSocket connection for real-time updates
  useEffect(() => {
    // In a real implementation, you would set up a WebSocket connection here
    // const ws = new WebSocket(`ws://localhost:3000/api/orders/${orderId}/updates`)
    // ws.onmessage = (event) => {
    //   const update = JSON.parse(event.data)
    //   handleStatusUpdate(update)
    // }
    // return () => ws.close()
  }, [orderId])

  const handleStatusUpdate = (update: OrderStatusUpdate) => {
    setOrder(prev => {
      if (!prev) return prev
      
      const updatedOrder = {
        ...prev,
        status: update.status,
        statusUpdates: [...prev.statusUpdates, update]
      }
      
      // Update progress
      const stepIndex = statusSteps.findIndex(step => step.key === update.status)
      setCurrentStep(stepIndex >= 0 ? stepIndex : 0)
      setProgress(stepIndex >= 0 ? ((stepIndex + 1) / statusSteps.length) * 100 : 0)
      
      // Show notification
      toast.success(update.message || `Order ${update.status}`)
      
      return updatedOrder
    })
  }

  const getEstimatedTime = () => {
    if (!order) return null
    
    if (order.estimatedDeliveryTime) {
      const estimatedTime = new Date(order.estimatedDeliveryTime)
      return formatDistanceToNow(estimatedTime, { addSuffix: true })
    }
    
    // Fallback estimation based on status
    const estimations = {
      pending: '5-10 minutes',
      confirmed: '20-30 minutes',
      preparing: '15-25 minutes',
      ready: '5-10 minutes',
      out_for_delivery: '10-20 minutes',
      delivered: 'Completed'
    }
    
    return estimations[order.status as keyof typeof estimations] || 'Calculating...'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-muted-foreground">Order not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Order Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Order #{order.orderNumber}</CardTitle>
              <CardDescription>
                Placed {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
              </CardDescription>
            </div>
            <Badge
              variant={
                order.status === 'delivered' ? 'default' :
                order.status === 'cancelled' ? 'destructive' :
                'secondary'
              }
              className="text-sm"
            >
              {order.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Total Amount</p>
              <p className="text-2xl font-bold">{formatCurrency(parsePrice(order.total))}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Estimated Time</p>
              <p className="text-lg">{getEstimatedTime()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Tracker */}
      <Card>
        <CardHeader>
          <CardTitle>Order Progress</CardTitle>
          <CardDescription>Track your order status in real-time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Order Placed</span>
                <span>Delivered</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Status Steps */}
            <div className="space-y-4">
              {statusSteps.map((step, index) => {
                const Icon = step.icon
                const isCompleted = index <= currentStep
                const isCurrent = index === currentStep
                
                return (
                  <div key={step.key} className="flex items-center space-x-4">
                    <div className={`
                      flex items-center justify-center w-10 h-10 rounded-full border-2
                      ${isCompleted 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : isCurrent
                        ? 'border-blue-500 text-blue-500'
                        : 'border-gray-300 text-gray-300'
                      }
                    `}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${
                        isCompleted ? 'text-green-600' :
                        isCurrent ? 'text-blue-600' : 'text-gray-400'
                      }`}>
                        {step.label}
                      </p>
                      {isCurrent && (
                        <p className="text-sm text-muted-foreground">
                          In progress...
                        </p>
                      )}
                    </div>
                    {isCompleted && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Address */}
      {order.deliveryAddress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Delivery Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p>{order.deliveryAddress.addressLine1}</p>
              <p>{order.deliveryAddress.city}, {order.deliveryAddress.postalCode}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium">{formatCurrency(parsePrice(item.price) * item.quantity)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>Contact us if you have any questions about your order</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
              <Phone className="w-4 h-4" />
              Call Support
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
              <MessageCircle className="w-4 h-4" />
              Live Chat
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Status Updates Timeline */}
      {order.statusUpdates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Status Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.statusUpdates.map((update, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="font-medium">{update.message || `Order ${update.status}`}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(update.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
