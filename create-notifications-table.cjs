/**
 * Create Notifications Table Script
 * 
 * This script creates the notifications table in the database.
 */

const { Pool } = require('pg');
const { config } = require('dotenv');

config();

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set in environment variables.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createNotificationsTable() {
  const client = await pool.connect();
  try {
    console.log('Creating notifications table...');

    // Start a transaction
    await client.query('BEGIN');

    // Check if the table already exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notifications'
      );
    `);

    if (tableCheck.rows[0].exists) {
      console.log('Notifications table already exists. Skipping creation.');
      await client.query('COMMIT');
      return;
    }

    // Create the notifications table
    await client.query(`
      CREATE TABLE notifications (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        link TEXT,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Add constraints
    await client.query(`
      ALTER TABLE notifications 
      ADD CONSTRAINT notifications_type_check 
      CHECK (type IN ('success', 'error', 'info', 'warning'));
    `);

    await client.query(`
      ALTER TABLE notifications 
      ADD CONSTRAINT notifications_category_check 
      CHECK (category IN (
        'quest_completed', 
        'xp_earned', 
        'system_error', 
        'new_milestone', 
        'new_follower', 
        'pulse_reaction', 
        'pulse_comment', 
        'achievement',
        'api_error'
      ));
    `);

    // Create index for faster queries by user_id
    await client.query(`
      CREATE INDEX notifications_user_id_idx ON notifications(user_id);
    `);

    // Commit the transaction
    await client.query('COMMIT');
    console.log('Successfully created notifications table!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating notifications table:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

createNotificationsTable().catch(err => {
  console.error('Failed to create notifications table:', err);
  process.exit(1);
});