import { NextRequest, NextResponse } from 'next/server';
import { MenuService } from '@/lib/services/menu.service';
import { z } from 'zod';

// GET /api/menu/[id] - Get single menu item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const menuItem = await MenuService.getMenuItemById(id);
    return NextResponse.json(menuItem);
  } catch (error) {
    console.error('Error fetching menu item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu item' },
      { status: 500 }
    );
  }
}

// PUT /api/menu/[id] - Update menu item (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Note: This should be wrapped with authentication middleware in a real implementation
  try {
    const { id } = await params;
    const body = await request.json();
    
    const updateMenuItemSchema = z.object({
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      price: z.string().optional(),
      categoryId: z.string().uuid().optional(),
      image: z.string().optional(),
      isAvailable: z.boolean().optional(),
      isVegetarian: z.boolean().optional(),
      isVegan: z.boolean().optional(),
      isGlutenFree: z.boolean().optional(),
      spiceLevel: z.enum(['MILD', 'MEDIUM', 'HOT', 'EXTRA_HOT']).optional(),
      preparationTime: z.number().optional(),
      ingredients: z.array(z.string()).optional(),
      nutritionInfo: z.record(z.string(), z.unknown()).optional(),
      tags: z.array(z.string()).optional(),
      isPopular: z.boolean().optional(),
      sortOrder: z.number().optional(),
    });

    const validatedData = updateMenuItemSchema.parse(body);
    const menuItem = await MenuService.updateMenuItem(id, validatedData);

    return NextResponse.json(menuItem);
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json(
      { error: 'Failed to update menu item' },
      { status: 500 }
    );
  }
}

// DELETE /api/menu/[id] - Delete menu item (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Note: This should be wrapped with authentication middleware in a real implementation
  try {
    const { id } = await params;
    await MenuService.deleteMenuItem(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json(
      { error: 'Failed to delete menu item' },
      { status: 500 }
    );
  }
}
