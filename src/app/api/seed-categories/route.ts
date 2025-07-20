import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema';

// Sonna's Café Categories Data
const sonnaCategories = [
  {
    id: 'cat_1',
    name: 'Premium Eggless Cakes',
    slug: 'premium-eggless-cakes',
    description: 'Exquisite eggless cakes crafted with finest ingredients'
  },
  {
    id: 'cat_2', 
    name: 'Baked Savouries',
    slug: 'baked-savouries',
    description: 'Freshly baked savory items and specialty buns'
  },
  {
    id: 'cat_3',
    name: 'Combos',
    slug: 'combos',
    description: 'Complete meal combinations with traditional flavors'
  },
  {
    id: 'cat_4',
    name: 'Snacks',
    slug: 'snacks', 
    description: 'Crispy snacks and appetizers'
  },
  {
    id: 'cat_5',
    name: 'Desserts',
    slug: 'desserts',
    description: 'Artisanal desserts, pastries and sweet treats'
  },
  {
    id: 'cat_6',
    name: 'Pizza & Pasta',
    slug: 'pizza-pasta',
    description: 'Italian classics - pizzas and pasta dishes'
  },
  {
    id: 'cat_7',
    name: 'Burgers & Sandwiches', 
    slug: 'burgers-sandwiches',
    description: 'Gourmet burgers and croissant sandwiches'
  },
  {
    id: 'cat_8',
    name: 'Beverages',
    slug: 'beverages',
    description: 'Refreshing drinks, iced teas and specialty coffees'
  }
]

// POST /api/seed-categories - Manually seed categories
export async function POST() {
  try {
    console.log('🌱 Starting categories seeding...')

    // Clear existing categories
    console.log('🗑️ Clearing existing categories...')
    await db.delete(categories)

    // Insert categories
    console.log('📂 Inserting Sonna\'s Café categories...')
    const insertedCategories = await db.insert(categories).values(
      sonnaCategories.map((cat, index) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: null,
        isActive: true,
        sortOrder: index,
      }))
    ).returning()
    
    console.log(`✅ Successfully inserted ${insertedCategories.length} categories`)

    return NextResponse.json({
      success: true,
      message: 'Categories seeded successfully',
      data: {
        categories: insertedCategories.length,
        items: insertedCategories.map(cat => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug
        }))
      }
    })

  } catch (error) {
    console.error('❌ Error seeding categories:', error)
    return NextResponse.json(
      { error: 'Failed to seed categories' },
      { status: 500 }
    )
  }
}
