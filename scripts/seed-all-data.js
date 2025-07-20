import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { categories, menuItems } from '../src/lib/db/schema/index.js';
import categoriesData from '../src/data/categories.json' with { type: 'json' };
import menuItemsData from '../src/data/menu-items.json' with { type: 'json' };

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const sql = postgres(connectionString);
const db = drizzle(sql);

async function seedCategories() {
  console.log('🌱 Seeding categories...');
  
  try {
    // Clear existing categories
    await db.delete(categories);
    console.log('✅ Cleared existing categories');

    // Insert new categories
    for (const category of categoriesData) {
      await db.insert(categories).values({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        isActive: true,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`✅ Added category: ${category.name}`);
    }
    
    console.log(`🎉 Successfully seeded ${categoriesData.length} categories`);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  }
}

async function seedMenuItems() {
  console.log('🌱 Seeding menu items...');
  
  try {
    // Clear existing menu items
    await db.delete(menuItems);
    console.log('✅ Cleared existing menu items');

    // Insert new menu items
    for (const item of menuItemsData) {
      // Skip items that don't have complete data
      if (!item.name || !item.price || !item.category?.id) {
        console.log(`⚠️ Skipping item with incomplete data: ${item.name || 'Unknown'}`);
        continue;
      }

      await db.insert(menuItems).values({
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: item.price.toString(),
        categoryId: item.category.id,
        image: item.image || null,
        isAvailable: item.isAvailable !== false,
        isVegetarian: item.isVegetarian || false,
        isVegan: item.isVegan || false,
        isGlutenFree: item.isGlutenFree || false,
        isPopular: item.isPopular || false,
        spiceLevel: item.spiceLevel || 'MILD',
        preparationTime: item.preparationTime || 30,
        sortOrder: 0,
        ingredients: item.ingredients || [],
        tags: item.tags || [],
        nutritionInfo: item.nutritionInfo || null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`✅ Added menu item: ${item.name}`);
    }
    
    console.log(`🎉 Successfully seeded ${menuItemsData.length} menu items`);
  } catch (error) {
    console.error('❌ Error seeding menu items:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting database seeding...');
    
    await seedCategories();
    await seedMenuItems();
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Categories: ${categoriesData.length}`);
    console.log(`   - Menu Items: ${menuItemsData.length}`);
    
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
    console.log('🔌 Database connection closed');
  }
}

// Run the seeding
main();
