/**
 * Database Reset Script
 * WARNING: This script deletes all data from the database.
 * Use only in development environments or when you want to start fresh.
 */
import { pool } from './server/db.js';

async function resetDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('Starting database reset...');
    await client.query('BEGIN');
    
    // Delete data from all tables
    // We need to delete in the correct order to respect foreign key constraints
    console.log('Deleting all data from tables...');
    
    // Delete dependent tables first
    const tables = [
      'project_collaborators',
      'project_endorsements',
      'services',
      'skills',
      'work_experiences',
      'educations',
      'projects',
      'brands_of_the_day',
      'nowboard_items',
      'musk_matches',
      'enhanced_user_data',
      'users'
    ];
    
    for (const table of tables) {
      console.log(`Deleting data from ${table}...`);
      await client.query(`DELETE FROM ${table}`);
    }
    
    // Reset sequences to start from 1 again
    console.log('Resetting ID sequences...');
    const resetSequences = [
      'SELECT setval(\'users_id_seq\', 1, false)',
      'SELECT setval(\'services_id_seq\', 1, false)',
      'SELECT setval(\'skills_id_seq\', 1, false)',
      'SELECT setval(\'work_experiences_id_seq\', 1, false)',
      'SELECT setval(\'educations_id_seq\', 1, false)',
      'SELECT setval(\'projects_id_seq\', 1, false)',
      'SELECT setval(\'project_collaborators_id_seq\', 1, false)',
      'SELECT setval(\'project_endorsements_id_seq\', 1, false)',
      'SELECT setval(\'brands_of_the_day_id_seq\', 1, false)',
      'SELECT setval(\'nowboard_items_id_seq\', 1, false)',
      'SELECT setval(\'musk_matches_id_seq\', 1, false)',
      'SELECT setval(\'enhanced_user_data_id_seq\', 1, false)'
    ];
    
    for (const resetSeq of resetSequences) {
      await client.query(resetSeq);
    }
    
    await client.query('COMMIT');
    console.log('Database reset completed successfully!');
    console.log('All tables have been emptied and sequences reset.');
    console.log('You can now create fresh data.');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during database reset:', error);
    throw error;
  } finally {
    client.release();
    // Close the pool to end the process
    await pool.end();
  }
}

// Run the reset function
resetDatabase()
  .then(() => {
    console.log('Database reset script completed.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Database reset failed:', err);
    process.exit(1);
  });