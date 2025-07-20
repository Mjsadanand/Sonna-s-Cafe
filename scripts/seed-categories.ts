import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { categories } from '@/lib/db/schema'

// Create database connection
const connectionString = process.env.DATABASE_URL!
const client = postgres(connectionString)
const db = drizzle(client)

// Sonna's Café Categories Data
const sonnaCategories = [
  {
    id: 'cat_1',
    name: 'Premium Eggless Cakes',
    slug: 'premium-eggless-cakes',
    description: 'Exquisite eggless cakes crafted with finest ingredients',
    isActive: true,
    sortOrder: 0
  },
  {
    id: 'cat_2', 
    name: 'Baked Savouries',
    slug: 'baked-savouries',
    description: 'Freshly baked savory items and specialty buns',
    isActive: true,
    sortOrder: 1
  },
  {
    id: 'cat_3',
    name: 'Combos',
    slug: 'combos',
    description: 'Complete meal combinations with traditional flavors',
    isActive: true,
    sortOrder: 2
  },
  {
    id: 'cat_4',
    name: 'Snacks',
    slug: 'snacks', 
    description: 'Crispy snacks and appetizers',
    isActive: true,
    sortOrder: 3
  },
  {
    id: 'cat_5',
    name: 'Desserts',
    slug: 'desserts',
    description: 'Artisanal desserts, pastries and sweet treats',
    isActive: true,
    sortOrder: 4
  },
  {
    id: 'cat_6',
    name: 'Pizza & Pasta',
    slug: 'pizza-pasta',
    description: 'Italian classics - pizzas and pasta dishes',
    isActive: true,
    sortOrder: 5
  },
  {
    id: 'cat_7',
    name: 'Burgers & Sandwiches', 
    slug: 'burgers-sandwiches',
    description: 'Gourmet burgers and croissant sandwiches',
    isActive: true,
    sortOrder: 6
  },
  {
    id: 'cat_8',
    name: 'Beverages',
    slug: 'beverages',
    description: 'Refreshing drinks, iced teas and specialty coffees',
    isActive: true,
    sortOrder: 7
  }
]

async function seedCategories() {
  try {
    console.log('🌱 Starting categories seeding...')

    // Clear existing categories
    console.log('🗑️ Clearing existing categories...')
    await db.delete(categories)

    // Insert categories
    console.log('📂 Inserting Sonna\'s Café categories...')
    const insertedCategories = await db.insert(categories).values(
      sonnaCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: null,
        isActive: cat.isActive,
        sortOrder: cat.sortOrder,
      }))
    ).returning()
    
    console.log(`✅ Successfully inserted ${insertedCategories.length} categories:`)
    insertedCategories.forEach(cat => {
      console.log(`   - ${cat.name} (${cat.slug})`)
    })
    
    console.log('🎉 Categories seeding completed successfully!')

  } catch (error) {
    console.error('❌ Error seeding categories:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

// Run the seeding
seedCategories()
