import { NextRequest, NextResponse } from 'next/server'
import { AdminService } from '@/lib/services/admin.service'

// GET /api/admin/orders - Get all orders for admin management
export async function GET(request: NextRequest) {
  // Check authorization
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const paymentStatus = searchParams.get('paymentStatus')
    const search = searchParams.get('search')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const sortBy = searchParams.get('sortBy') as 'createdAt' | 'total' | 'status' || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc'

    const result = await AdminService.getAllOrders({
      page,
      limit,
      status: status || undefined,
      paymentStatus: paymentStatus || undefined,
      search: search || undefined,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      sortBy,
      sortOrder
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
