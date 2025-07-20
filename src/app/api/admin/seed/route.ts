import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/middleware/admin-auth';
import { db } from '@/lib/db';
import { categories, menuItems } from '@/lib/db/schema';
import categoriesData from '@/data/categories.json';
import menuItemsData from '@/data/menu-items.json';
import { randomUUID } from 'crypto';

// POST /api/admin/seed - Seed database with categories and menu items
export const POST = requireAdminAuth(async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing menu items and categories
    console.log('🗑️ Clearing existing data...');
    await db.delete(menuItems);
    await db.delete(categories);

    // Insert categories
    console.log('📂 Inserting categories...');
    const insertedCategories = await db.insert(categories).values(
      categoriesData.map((cat, index) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description || null,
        image: null,
        isActive: true,
        sortOrder: index,
      }))
    ).returning();
    
    console.log(`✅ Inserted ${insertedCategories.length} categories`);

    // Insert menu items
    console.log('🍽️ Inserting menu items...');
    const insertedMenuItems = await db.insert(menuItems).values(
      menuItemsData.map((item, index) => ({
        id: randomUUID(), // Generate proper UUID for item ID
        name: item.name,
        description: item.description,
        price: item.price.toString(),
        categoryId: item.category.id,
        image: item.image || '/images/placeholder-food.jpg',
        isAvailable: item.isAvailable,
        isVegetarian: item.isVegetarian,
        isVegan: item.isVegan,
        isGlutenFree: item.isGlutenFree,
        isPopular: false,
        spiceLevel: (item.spiceLevel as 'MILD' | 'MEDIUM' | 'HOT' | 'EXTRA_HOT') || 'MILD',
        preparationTime: item.preparationTime || 30,
        sortOrder: index,
        nutritionInfo: {},
      }))
    ).returning();

    console.log(`✅ Inserted ${insertedMenuItems.length} menu items`);
    console.log('🎉 Database seeding completed successfully!');

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        categories: insertedCategories.length,
        menuItems: insertedMenuItems.length
      }
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
});
