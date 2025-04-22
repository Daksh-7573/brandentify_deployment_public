/**
 * Database Cleanup Script
 * 
 * This script cleans all data from the database and resets sequences.
 * Use in development or testing environments only.
 */
import { pool } from './server/db.js';

async function cleanDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('Starting database cleanup...');
    await client.query('BEGIN');
    
    // Delete all data from all relevant tables in proper order to respect foreign key constraints
    const tables = [
      'project_collaborators',
      'project_endorsements',
      'services',
      'skills',
      'work_experiences',
      'educations',
      'projects',
      'nowboard_items',
      'nowboard_inspired_by',
      'musk_matches',
      'users',
      // Extended tables
      'industry_pulse_posts',
      'industry_pulse_reactions',
      'industry_pulse_comments',
      'industry_pulse_bookmarks',
      'industry_pulse_poll_votes',
      'news_user_preferences',
      'hashtags',
      'pulse_comments',
      'pulse_hashtags',
      'pulse_reactions',
      'portfolios',
      'pulses',
      'pulse_shares',
      'user_reaction_quotas',
      'user_xp',
      'news_articles',
      'poll_votes',
      'shadow_resumes',
      'user_badges',
      'user_quests',
      'user_hashtag_follows',
      'xp_transactions'
    ];
    
    // Delete data from all tables
    for (const table of tables) {
      try {
        console.log(`Deleting data from ${table}...`);
        await client.query(`DELETE FROM ${table}`);
      } catch (error) {
        console.log(`Note: Could not delete from ${table} - table may not exist or has dependencies: ${error.message}`);
      }
    }
    
    // Reset sequences to start from 1 again
    const sequences = [
      'users_id_seq',
      'services_id_seq',
      'skills_id_seq',
      'work_experiences_id_seq',
      'educations_id_seq',
      'projects_id_seq',
      'project_collaborators_id_seq',
      'project_endorsements_id_seq',
      'nowboard_items_id_seq',
      'musk_matches_id_seq'
    ];
    
    // Reset all sequence counters
    for (const sequence of sequences) {
      try {
        console.log(`Resetting sequence ${sequence}...`);
        await client.query(`SELECT setval('${sequence}', 1, false)`);
      } catch (error) {
        console.log(`Note: Could not reset sequence ${sequence}: ${error.message}`);
      }
    }
    
    await client.query('COMMIT');
    console.log('Database cleanup completed successfully!');
    console.log('All tables have been emptied and sequences reset.');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during database cleanup:', error);
    throw error;
  } finally {
    client.release();
    // Close the pool to end the process
    await pool.end();
  }
}

// Run the cleanup function
cleanDatabase()
  .then(() => {
    console.log('Database cleanup script completed.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Database cleanup failed:', err);
    process.exit(1);
  });