import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/middleware/admin-auth';
import { MenuService } from '@/lib/services/menu.service';
import { db } from '@/lib/db';
import { categories, insertCategorySchema } from '@/lib/db/schema';
import { z } from 'zod';

// GET /api/admin/categories - Get all categories for admin management
export const GET = requireAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const result = await MenuService.getCategories(!includeInactive);
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
});

// POST /api/admin/categories - Create new category
export const POST = requireAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const validatedData = insertCategorySchema.parse(body);
    
    const [result] = await db
      .insert(categories)
      .values({
        ...validatedData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: result
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
});

