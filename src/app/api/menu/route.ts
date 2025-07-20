import { NextRequest, NextResponse } from 'next/server';
import { MenuService } from '@/lib/services/menu.service';
import { z } from 'zod';

// GET /api/menu - Get all menu items with categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const categoryId = searchParams.get('categoryId') || undefined;
    const isAvailable = searchParams.get('isAvailable') === 'true' ? true : undefined;
    const search = searchParams.get('search') || undefined;
    const isPopular = searchParams.get('isPopular') === 'true' ? true : undefined;

    const result = await MenuService.getMenuItemsWithCategories({
      page,
      limit,
      categoryId,
      isAvailable,
      search,
      isPopular,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    );
  }
}

// POST /api/menu - Create new menu item (Admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const createMenuItemSchema = z.object({
      name: z.string().min(1, 'Name is required'),
      description: z.string().optional(),
      price: z.string().min(1, 'Price is required'),
      categoryId: z.string().uuid('Valid category ID is required'),
      image: z.string().optional(),
      isAvailable: z.boolean().default(true),
      isVegetarian: z.boolean().default(false),
      isVegan: z.boolean().default(false),
      isGlutenFree: z.boolean().default(false),
      spiceLevel: z.enum(['MILD', 'MEDIUM', 'HOT', 'EXTRA_HOT']).default('MILD'),
      preparationTime: z.number().default(30),
      ingredients: z.array(z.string()).optional(),
      nutritionInfo: z.record(z.string(), z.unknown()).optional(),
      tags: z.array(z.string()).optional(),
      isPopular: z.boolean().default(false),
      sortOrder: z.number().default(0),
    });

    const validatedData = createMenuItemSchema.parse(body);
    const menuItem = await MenuService.createMenuItem(validatedData);

    return NextResponse.json(menuItem, { status: 201 });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { error: 'Failed to create menu item' },
      { status: 500 }
    );
  }
}
