/**
 * Add is_shadow_resume column to resumes table
 * This script adds the missing is_shadow_resume column to the resumes table
 */

require('dotenv').config();
const { Client } = require('pg');

async function executeQuery(queryText, params = []) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    await client.connect();
    const result = await client.query(queryText, params);
    return result;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  } finally {
    await client.end();
  }
}

async function runMigration() {
  try {
    console.log('Adding is_shadow_resume column to resumes table...');
    
    // Check if column already exists
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'resumes' AND column_name = 'is_shadow_resume';
    `;
    
    const columnCheckResult = await executeQuery(checkColumnQuery);
    
    if (columnCheckResult.rows.length > 0) {
      console.log('Column is_shadow_resume already exists, skipping migration');
      return;
    }
    
    // Add column
    const alterTableQuery = `
      ALTER TABLE resumes 
      ADD COLUMN is_shadow_resume BOOLEAN DEFAULT FALSE;
    `;
    
    await executeQuery(alterTableQuery);
    
    // Add other missing columns if needed
    const addAdditionalColumnsQuery = `
      ALTER TABLE resumes 
      ADD COLUMN IF NOT EXISTS theme_style TEXT DEFAULT 'professional',
      ADD COLUMN IF NOT EXISTS is_downloadable BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS last_updated_by_musk TIMESTAMP,
      ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private';
    `;
    
    await executeQuery(addAdditionalColumnsQuery);
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();