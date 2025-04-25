import { db, pool, executeRawQuery } from './db';

/**
 * Migration script to add domain and key_responsibilities columns to work_experiences table
 */
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
    
    const existingColumns = await executeRawQuery(checkColumnQuery);
    const existingColumnNames = existingColumns.map((row: any) => row.column_name);
    
    // Add domain column if it doesn't exist
    if (!existingColumnNames.includes('domain')) {
      console.log('Adding domain column to work_experiences table');
      await executeRawQuery(`
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
      await executeRawQuery(`
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

// Run the migration if this file is executed directly
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { runMigration };