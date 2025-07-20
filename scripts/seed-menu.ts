import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { categories, menuItems } from '@/lib/db/schema'
import categoriesData from '@/data/categories.json'
import menuItemsData from '@/data/menu-items.json'

// Create database connection
const connectionString = process.env.DATABASE_URL!
const client = postgres(connectionString)
const db = drizzle(client)

async function seedMenu() {
  try {
    console.log('🌱 Starting menu data seeding...')

    // Clear existing data
    console.log('🗑️ Clearing existing menu data...')
    await db.delete(menuItems)
    await db.delete(categories)

    // Insert categories
    console.log('📂 Inserting categories...')
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
    ).returning()
    
    console.log(`✅ Inserted ${insertedCategories.length} categories`)

    // Insert menu items
    console.log('🍽️ Inserting menu items...')
    const insertedMenuItems = await db.insert(menuItems).values(
      menuItemsData.map((item, index) => ({
        id: item.id,
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
    ).returning()

    console.log(`✅ Inserted ${insertedMenuItems.length} menu items`)
    console.log('🎉 Menu seeding completed successfully!')

  } catch (error) {
    console.error('❌ Error seeding menu data:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

// Run the seeding function
seedMenu().then(() => {
  console.log('✨ All done!')
  process.exit(0)
}).catch((error) => {
  console.error('💥 Seeding failed:', error)
  process.exit(1)
})
