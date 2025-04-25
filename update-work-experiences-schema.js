/**
 * Migration script to add domain and key_responsibilities columns to work_experiences table
 */
const { Pool } = require('@neondatabase/serverless');
const ws = require('ws');

// Configure Neon database
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  webSocketConstructor: ws
});

async function executeQuery(queryText, params = []) {
  try {
    return await pool.query(queryText, params);
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

async function runMigration() {
  console.log('Starting migration: Adding domain and key_responsibilities columns to work_experiences table');

  try {
    // Check if columns already exist
    const checkColumnQuery = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'work_experiences'
      AND column_name IN ('domain', 'key_responsibilities');
    `;
    
    const existingColumnsResult = await executeQuery(checkColumnQuery);
    const existingColumnNames = existingColumnsResult.rows.map(row => row.column_name);
    
    // Add domain column if it doesn't exist
    if (!existingColumnNames.includes('domain')) {
      console.log('Adding domain column to work_experiences table');
      await executeQuery(`
        ALTER TABLE work_experiences
        ADD COLUMN domain TEXT;
      `);
      console.log('Domain column added successfully');
    } else {
      console.log('Domain column already exists');
    }
    
    // Add key_responsibilities column if it doesn't exist
    if (!existingColumnNames.includes('key_responsibilities')) {
      console.log('Adding key_responsibilities column to work_experiences table');
      await executeQuery(`
        ALTER TABLE work_experiences
        ADD COLUMN key_responsibilities JSONB DEFAULT '[]';
      `);
      console.log('Key responsibilities column added successfully');
    } else {
      console.log('Key responsibilities column already exists');
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the migration
runMigration()
  .then(() => {
    console.log('Migration finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });