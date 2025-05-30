/**
 * Database Migration: Add domain column to pulses table
 * 
 * This script adds the domain field to the pulses table to store
 * the user's domain specialty within their selected industry.
 */

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
    console.error('Query execution error:', error);
    throw error;
  } finally {
    await client.end();
  }
}

async function addDomainToPulses() {
  console.log('Adding domain column to pulses table...');

  try {
    // Check if domain column already exists
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'pulses' AND column_name = 'domain';
    `;
    
    const columnExists = await executeQuery(checkColumnQuery);
    
    if (columnExists.rows.length > 0) {
      console.log('Domain column already exists in pulses table');
      return;
    }

    // Add domain column to pulses table
    const addColumnQuery = `
      ALTER TABLE pulses 
      ADD COLUMN domain TEXT;
    `;
    
    await executeQuery(addColumnQuery);
    
    console.log('Successfully added domain column to pulses table');

    // Add comment to the column for documentation
    const addCommentQuery = `
      COMMENT ON COLUMN pulses.domain IS 'Domain/specialty within the industry';
    `;
    
    await executeQuery(addCommentQuery);
    
    console.log('Added comment to domain column');

  } catch (error) {
    console.error('Error adding domain column:', error);
    throw error;
  }
}

// Run the migration
if (require.main === module) {
  addDomainToPulses()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { addDomainToPulses };