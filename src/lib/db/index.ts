import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export * from './schema';

// Get database URL from environment
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error(
    'DATABASE_URL environment variable is required. Please add it to your .env.local file.\n' +
    'Example: DATABASE_URL="postgresql://username:password@localhost:5432/food_ordering_db"'
  );
}

// Create the PostgreSQL connection
const client = postgres(DATABASE_URL, {
  prepare: false,
  // Connection pool settings
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create the database instance with schema
export const db = drizzle(client, { schema });

// Export the client for manual queries if needed
export { client };

// Export types
export type Database = typeof db;
