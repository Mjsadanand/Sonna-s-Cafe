import { NextRequest, NextResponse } from 'next/server'
import { AdminService } from '@/lib/services/admin.service'
import { verifyAdminToken } from '@/lib/middleware/admin-auth'

// GET /api/admin/menu-items/[id] - Get menu item details
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Check authorization
  const isAuthorized = await verifyAdminToken(request)
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await context.params
    const menuItems = await AdminService.getMenuItemsWithStats();
    const menuItem = menuItems.find(item => item.id === id);

    if (!menuItem) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 })
    }

    return NextResponse.json(menuItem)
  } catch (error) {
    console.error('Error fetching menu item:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menu item' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/menu-items/[id] - Update menu item
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Check authorization
  const isAuthorized = await verifyAdminToken(request)
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await context.params
    const data = await request.json()

    const updatedMenuItem = await AdminService.updateMenuItem(id, data)

    return NextResponse.json(updatedMenuItem)
  } catch (error) {
    console.error('Error updating menu item:', error)
    return NextResponse.json(
      { error: 'Failed to update menu item' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/menu-items/[id] - Delete menu item
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Check authorization
  const isAuthorized = await verifyAdminToken(request)
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await context.params
    await AdminService.deleteMenuItem(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting menu item:', error)
    return NextResponse.json(
      { error: 'Failed to delete menu item' },
      { status: 500 }
    )
  }
}
