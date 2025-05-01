/**
 * Migration script to add metadata column to resumes table
 */

const { Pool } = require('pg');

async function executeQuery(queryText, params = []) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log(`Executing query: ${queryText} with params`, params);
    const result = await pool.query(queryText, params);
    console.log(`Query executed successfully, affected ${result.rowCount} rows`);
    return result;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

async function runMigration() {
  try {
    console.log('Starting migration to add metadata column to resumes table');

    // Check if the column already exists
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'resumes' AND column_name = 'metadata'
    `;
    const checkResult = await executeQuery(checkColumnQuery);

    if (checkResult.rows.length > 0) {
      console.log('Column "metadata" already exists in resumes table');
      return;
    }

    // Add the column to the table
    const addColumnQuery = `
      ALTER TABLE resumes 
      ADD COLUMN metadata TEXT
    `;
    await executeQuery(addColumnQuery);
    console.log('Successfully added "metadata" column to resumes table');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();