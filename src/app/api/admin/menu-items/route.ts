import { NextRequest, NextResponse } from 'next/server';
import { AdminService } from '@/lib/services/admin.service';
import { requireAdminAuth } from '@/lib/middleware/admin-auth';

// GET /api/admin/menu-items - Get all menu items with stats
export const GET = requireAdminAuth(async (request: NextRequest) => {
  try {
    const url = new URL(request.url);
    const categoryId = url.searchParams.get('categoryId');

    const menuItems = await AdminService.getMenuItemsWithStats(categoryId || undefined);

    return NextResponse.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    );
  }
});

// POST /api/admin/menu-items - Create new menu item
export const POST = requireAdminAuth(async (request: NextRequest) => {
  try {
    const data = await request.json();
    const menuItem = await AdminService.createMenuItem(data);

    return NextResponse.json(menuItem, { status: 201 });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { error: 'Failed to create menu item' },
      { status: 500 }
    );
  }
});
