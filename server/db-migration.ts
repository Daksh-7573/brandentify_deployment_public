import { pool } from './db';

async function executeRawQuery(query: string, params: any[] = []) {
  try {
    return await pool.query(query, params);
  } catch (error) {
    console.error("Error executing raw query:", error);
    throw error;
  }
}

async function runMigration() {
  try {
    console.log('Starting migration: Adding domain and key_responsibilities columns to work_experiences table');
    
    // Check if columns already exist
    const checkColumnQuery = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'work_experiences'
      AND column_name IN ('domain', 'key_responsibilities');
    `;
    
    const existingColumns = await executeRawQuery(checkColumnQuery);
    const existingColumnNames = existingColumns.rows.map(row => row.column_name);
    
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
    
    return {
      success: true,
      message: 'Migration completed successfully',
      columns: {
        domain: !existingColumnNames.includes('domain') ? 'added' : 'already exists',
        key_responsibilities: !existingColumnNames.includes('key_responsibilities') ? 'added' : 'already exists'
      }
    };
  } catch (error) {
    console.error('Error during migration:', error);
    return {
      success: false,
      message: 'Error during migration',
      error: String(error)
    };
  } finally {
    // Ensure pool is released properly
    await pool.end();
  }
}

// Run the migration and exit
runMigration()
  .then(result => {
    console.log('Migration result:', result);
    process.exit(0);
  })
  .catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });