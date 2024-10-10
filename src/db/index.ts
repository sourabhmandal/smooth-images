// db.ts
import { drizzle } from 'drizzle-orm';
import { Pool } from 'pg';

// Connect to the Postgres database using pg Pool
// TODO: update database environment variables
const pool = new Pool({
  user: 'user',
  host: 'localhost',
  database: 'image_processing',
  password: 'password',
  port: 5555, // Default Postgres port
});

// Create Drizzle ORM instance
export const db = drizzle(pool);
