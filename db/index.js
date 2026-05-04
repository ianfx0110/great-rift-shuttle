import pkg from 'pg';
import fs from 'fs';
import path from 'path';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
});

export const query = (text, params) => pool.query(text, params);

export async function initDb() {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not found. Database features will not work until configured.');
    return;
  }

  try {
    const schemaPath = path.join(process.cwd(), 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    await query(sql);
    console.log('Great Rift Shuttle Database (PostgreSQL) initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize PostgreSQL DB:', error);
  }
}

export default pool;
