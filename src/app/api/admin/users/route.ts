import { NextRequest, NextResponse } from 'next/server'
import { AdminService } from '@/lib/services/admin.service'

// GET /api/admin/users - Get all users for admin management
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
    const role = searchParams.get('role')
    const search = searchParams.get('search')
    const isActive = searchParams.get('isActive')
    const sortBy = searchParams.get('sortBy') as 'createdAt' | 'loyaltyPoints' | 'email' || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc'

    const result = await AdminService.getAllUsers({
      page,
      limit,
      role: role || undefined,
      search: search || undefined,
      isActive: isActive ? isActive === 'true' : undefined,
      sortBy,
      sortOrder
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
