import { NextRequest, NextResponse } from 'next/server'
import { AdminService } from '@/lib/services/admin.service'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Check authorization
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await context.params
    const orderDetails = await AdminService.getOrderDetails(id)

    return NextResponse.json(orderDetails)
  } catch (error) {
    console.error('Error fetching order details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order details' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Check authorization
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await context.params
    const body = await request.json()
    const { status, kitchenNotes } = body

    const result = await AdminService.updateOrderStatus(id, status, kitchenNotes)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}
