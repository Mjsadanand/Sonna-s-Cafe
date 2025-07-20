// Test Order Creation Fix
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { menuItems } from './src/lib/db/schema/index.js';
import { inArray } from 'drizzle-orm';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function testOrderCreationQuery() {
  try {
    console.log('Testing menu item query with inArray...');
    
    // Test with actual menu item IDs from database
    const allMenuItems = await db.select({ id: menuItems.id }).from(menuItems).limit(3);
    console.log('Found menu items:', allMenuItems);
    
    if (allMenuItems.length === 0) {
      console.log('No menu items found in database');
      return;
    }
    
    const menuItemIds = allMenuItems.map(item => item.id);
    console.log('Testing with IDs:', menuItemIds);
    
    const orderMenuItems = await db
      .select({
        id: menuItems.id,
        price: menuItems.price,
        name: menuItems.name,
      })
      .from(menuItems)
      .where(inArray(menuItems.id, menuItemIds));
      
    console.log('Query successful! Found items:', orderMenuItems);
    
  } catch (error) {
    console.error('Query failed:', error);
  } finally {
    await pool.end();
  }
}

testOrderCreationQuery();
