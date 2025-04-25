/**
 * Migration script to add missing fields to educations table
 * Adds industry, field_of_study, and skills_acquired columns
 */

import { pool } from './db';

async function executeQuery(queryText: string, params: any[] = []) {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(queryText, params);
      console.log(`Query executed successfully. Affected rows: ${result.rowCount}`);
      return result;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error executing query:', err);
    throw err;
  }
}

async function runMigration() {
  try {
    console.log('Starting migration: Adding missing fields to educations table');
    
    // Add industry column
    await executeQuery(`
      ALTER TABLE educations
      ADD COLUMN IF NOT EXISTS industry TEXT
    `);
    console.log('Added industry column to educations table');
    
    // Add field_of_study column
    await executeQuery(`
      ALTER TABLE educations
      ADD COLUMN IF NOT EXISTS field_of_study TEXT
    `);
    console.log('Added field_of_study column to educations table');
    
    // Add skills_acquired column (JSON array)
    await executeQuery(`
      ALTER TABLE educations
      ADD COLUMN IF NOT EXISTS skills_acquired JSONB DEFAULT '[]'
    `);
    console.log('Added skills_acquired column to educations table');
    
    console.log('Migration completed successfully');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

// Run the migration
runMigration()
  .then(() => {
    console.log('Education table migration completed, process will now exit');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error in education migration:', err);
    process.exit(1);
  });