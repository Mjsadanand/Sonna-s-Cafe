import postgres from 'postgres';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = join(__dirname, '../.env.local');
const envFile = readFileSync(envPath, 'utf8');
const envLines = envFile.split('\n');
for (const line of envLines) {
  if (line.trim() && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').replace(/^"|"$/g, '');
      process.env[key.trim()] = value.trim();
    }
  }
}

// Read JSON files
const categoriesData = JSON.parse(readFileSync(join(__dirname, '../src/data/categories.json'), 'utf8'));
const menuItemsData = JSON.parse(readFileSync(join(__dirname, '../src/data/menu-items.json'), 'utf8'));

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const sql = postgres(connectionString);

async function seedCategories() {
  console.log('🌱 Updating categories...');
  
  try {
    // Don't delete existing categories since menu items are now referencing them
    // Instead, update or insert each category
    
    for (const category of categoriesData) {
      // Try to update existing category first
      const updateResult = await sql`
        UPDATE categories 
        SET name = ${category.name}, 
            slug = ${category.slug}, 
            description = ${category.description}, 
            is_active = true, 
            updated_at = NOW()
        WHERE id = ${category.id}
      `;
      
      if (updateResult.count === 0) {
        // Category doesn't exist, insert it
        await sql`
          INSERT INTO categories (id, name, slug, description, is_active, sort_order, created_at, updated_at)
          VALUES (${category.id}, ${category.name}, ${category.slug}, ${category.description}, true, 0, NOW(), NOW())
        `;
        console.log(`✅ Added new category: ${category.name}`);
      } else {
        console.log(`✅ Updated existing category: ${category.name}`);
      }
    }
    
    console.log(`🎉 Successfully processed ${categoriesData.length} categories`);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  }
}

async function seedMenuItems() {
  console.log('🌱 Seeding menu items...');
  
  try {
    // Clear existing menu items
    await sql`DELETE FROM menu_items`;
    console.log('✅ Cleared existing menu items');

    let successCount = 0;
    let skippedCount = 0;

    // Insert new menu items
    for (const item of menuItemsData) {
      // Skip items that don't have complete data
      if (!item.name || !item.price || !item.category?.id) {
        console.log(`⚠️ Skipping item with incomplete data: ${item.name || 'Unknown'}`);
        skippedCount++;
        continue;
      }

      try {
        // Generate a proper UUID for the menu item
        const itemId = randomUUID();
        
        await sql`
          INSERT INTO menu_items (
            id, name, description, price, category_id, image, is_available, 
            is_vegetarian, is_vegan, is_gluten_free, is_popular, spice_level, 
            preparation_time, sort_order, ingredients, tags, nutrition_info, 
            created_at, updated_at
          ) VALUES (
            ${itemId}, ${item.name}, ${item.description || ''}, ${item.price.toString()}, 
            ${item.category.id}, ${item.image || null}, ${item.isAvailable !== false}, 
            ${item.isVegetarian || false}, ${item.isVegan || false}, ${item.isGlutenFree || false}, 
            ${item.isPopular || false}, ${item.spiceLevel || 'MILD'}, ${item.preparationTime || 30}, 
            0, ${JSON.stringify(item.ingredients || [])}, ${JSON.stringify(item.tags || [])}, 
            ${item.nutritionInfo ? JSON.stringify(item.nutritionInfo) : null}, NOW(), NOW()
          )
        `;
        console.log(`✅ Added menu item: ${item.name}`);
        successCount++;
      } catch (itemError) {
        console.error(`❌ Failed to add item "${item.name}":`, itemError.message);
        skippedCount++;
      }
    }
    
    console.log(`🎉 Menu items seeding completed - Success: ${successCount}, Skipped: ${skippedCount}`);
  } catch (error) {
    console.error('❌ Error seeding menu items:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting database seeding...');
    
    // Important: Delete menu items first, then categories due to foreign key constraints
    await seedMenuItems();
    await seedCategories();
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Categories: ${categoriesData.length}`);
    console.log(`   - Menu Items available to seed: ${menuItemsData.length}`);
    
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
