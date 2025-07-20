import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { orders, orderItems, menuItems, addresses } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { withErrorHandler } from '@/lib/errors'

interface StatusUpdate {
  id: string
  status: string
  timestamp: string
  message: string
}

async function getOrderTracking(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: orderId } = await params

  try {

    // Get order with all related data
    const orderResult = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        total: orders.total,
        createdAt: orders.createdAt,
        estimatedDeliveryTime: orders.estimatedDeliveryTime,
        deliveryAddress: {
          addressLine1: addresses.addressLine1,
          city: addresses.city,
          postalCode: addresses.postalCode
        }
      })
      .from(orders)
      .leftJoin(addresses, eq(orders.deliveryAddressId, addresses.id))
      .where(eq(orders.id, orderId))
      .limit(1)

    if (orderResult.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const order = orderResult[0]

    // Get order items
    const itemsResult = await db
      .select({
        id: orderItems.id,
        name: menuItems.name,
        quantity: orderItems.quantity,
        price: orderItems.unitPrice
      })
      .from(orderItems)
      .innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
      .where(eq(orderItems.orderId, orderId))

    // Simulate status updates (in real app, this would come from a separate table)
    const statusUpdates: StatusUpdate[] = [
      {
        id: '1',
        status: 'pending',
        timestamp: order.createdAt.toISOString(),
        message: 'Order has been placed and is awaiting confirmation'
      }
    ]

    // Add more status updates based on current status
    const statusFlow = ['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered']
    const currentStatusIndex = statusFlow.indexOf(order.status)
    
    if (currentStatusIndex >= 0) {
      for (let i = 0; i <= currentStatusIndex; i++) {
        const status = statusFlow[i]
        const timestamp = new Date(new Date(order.createdAt).getTime() + (i + 1) * 10 * 60 * 1000) // 10 min intervals
        
        statusUpdates.push({
          id: `${i + 2}`,
          status,
          timestamp: timestamp.toISOString(),
          message: getStatusMessage(status)
        })
      }
    }

    const trackingData = {
      ...order,
      items: itemsResult,
      statusUpdates
    }

    return NextResponse.json(trackingData)
  } catch (error) {
    console.error('Error fetching order tracking:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order tracking' },
      { status: 500 }
    )
  }
}

function getStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    confirmed: 'Order has been confirmed and sent to kitchen',
    preparing: 'Your order is being prepared',
    ready: 'Order is ready for pickup/delivery',
    out_for_delivery: 'Order is out for delivery',
    delivered: 'Order has been delivered successfully'
  }
  
  return messages[status] || `Order status updated to ${status}`
}

export const GET = withErrorHandler(getOrderTracking)
