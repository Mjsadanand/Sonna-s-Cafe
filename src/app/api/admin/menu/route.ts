import { NextRequest, NextResponse } from 'next/server';
import { MenuService } from '@/lib/services/menu.service';
import { requireAdminAuth } from '@/lib/middleware/admin-auth';
import { z } from 'zod';

// GET /api/admin/menu - Get all menu items for admin management
export const GET = requireAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search');
    const isPopular = searchParams.get('isPopular');

    const result = await MenuService.getMenuItems({
      categoryId: categoryId || undefined,
      isAvailable: status === 'available' ? true : status === 'unavailable' ? false : undefined,
      search: search || undefined,
      isPopular: isPopular ? isPopular === 'true' : undefined,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching admin menu items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    );
  }
});

// POST /api/admin/menu - Create new menu item
export const POST = requireAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    
    const createMenuItemSchema = z.object({
      name: z.string().min(1),
      description: z.string(),
      price: z.string(),
      categoryId: z.string(),
      image: z.string().optional(),
      isAvailable: z.boolean().default(true),
      isVegetarian: z.boolean().default(false),
      isVegan: z.boolean().default(false),
      isGlutenFree: z.boolean().default(false),
      isPopular: z.boolean().default(false),
      spiceLevel: z.enum(['MILD', 'MEDIUM', 'HOT', 'EXTRA_HOT']).default('MILD'),
      preparationTime: z.number().default(15),
      sortOrder: z.number().default(0),
      ingredients: z.array(z.string()).default([]),
      tags: z.array(z.string()).default([]),
      nutritionInfo: z.record(z.string(), z.any()).optional(),
    });

    const validatedData = createMenuItemSchema.parse(body);
    const result = await MenuService.createMenuItem(validatedData);

    return NextResponse.json({
      success: true,
      data: result
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating menu item:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create menu item' },
      { status: 500 }
    );
  }
});
