import { NextRequest, NextResponse } from 'next/server'
import { AdminService } from '@/lib/services/admin.service'
import { requireAdminAuth } from '@/lib/middleware/admin-auth'

// GET /api/admin/settings - Get admin settings
export const GET = requireAdminAuth(async () => {
  try {
    const settings = await AdminService.getRestaurantSettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
})

// POST /api/admin/settings - Update admin settings
export const POST = requireAdminAuth(async (request: NextRequest) => {
  try {
    const data = await request.json()
    const updatedSettings = await AdminService.updateRestaurantSettings(data)
    
    return NextResponse.json(updatedSettings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
})
