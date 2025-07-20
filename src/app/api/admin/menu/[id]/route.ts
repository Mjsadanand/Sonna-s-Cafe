import { NextRequest, NextResponse } from 'next/server';
import { MenuService } from '@/lib/services/menu.service';
import { requireAdminAuth } from '@/lib/middleware/admin-auth';
import { z } from 'zod';

// GET /api/admin/menu/[id] - Get single menu item for admin
export const GET = requireAdminAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params
    const result = await MenuService.getMenuItemById(id);
    
    if (!result) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching menu item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu item' },
      { status: 500 }
    );
  }
});

// PUT /api/admin/menu/[id] - Update menu item
export const PUT = requireAdminAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params
    const body = await request.json();
    
    const updateMenuItemSchema = z.object({
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      price: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
      categoryId: z.string().optional(),
      image: z.string().optional(),
      isAvailable: z.boolean().optional(),
      isVegetarian: z.boolean().optional(),
      isVegan: z.boolean().optional(),
      isGlutenFree: z.boolean().optional(),
      isPopular: z.boolean().optional(),
      spiceLevel: z.enum(['MILD', 'MEDIUM', 'HOT', 'EXTRA_HOT']).optional(),
      preparationTime: z.number().optional(),
      sortOrder: z.number().optional(),
      ingredients: z.array(z.string()).optional(),
      tags: z.array(z.string()).optional(),
      nutritionInfo: z.record(z.string(), z.any()).optional(),
    });

    const validatedData = updateMenuItemSchema.parse(body);
    const result = await MenuService.updateMenuItem(id, validatedData);

    if (!result) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update menu item' },
      { status: 500 }
    );
  }
});

// DELETE /api/admin/menu/[id] - Delete menu item
export const DELETE = requireAdminAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params
    const result = await MenuService.deleteMenuItem(id);

    if (!result) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json(
      { error: 'Failed to delete menu item' },
      { status: 500 }
    );
  }
});
