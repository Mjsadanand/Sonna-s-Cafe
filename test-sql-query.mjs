// Simple test to verify inArray query works
import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testInArrayQuery() {
  try {
    console.log('Testing direct inArray SQL query...');
    
    // Get some actual menu item IDs
    const result = await pool.query('SELECT id FROM menu_items LIMIT 3');
    const menuItemIds = result.rows.map(row => row.id);
    
    console.log('Found menu item IDs:', menuItemIds);
    
    if (menuItemIds.length === 0) {
      console.log('No menu items found');
      return;
    }
    
    // Test the inArray query that was failing
    const queryResult = await pool.query(
      'SELECT id, price, name FROM menu_items WHERE id = ANY($1)',
      [menuItemIds]
    );
    
    console.log('Query successful! Found items:', queryResult.rows);
    
  } catch (error) {
    console.error('Query failed:', error);
  } finally {
    await pool.end();
  }
}

testInArrayQuery();
