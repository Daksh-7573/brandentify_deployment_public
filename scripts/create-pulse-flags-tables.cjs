/**
 * Migration script to create pulse flag tables
 * 
 * This script creates the flag reason enum and pulse_flags table
 * for the content moderation feature.
 */

const { Pool } = require('pg');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable not set');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function executeQuery(queryText, params = []) {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(queryText, params);
      return result;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}

async function createFlagTables() {
  try {
    console.log('Creating pulse flag tables...');

    // Create flag reason enum
    await executeQuery(`
      DO $$ BEGIN
        -- Create flag_reason enum if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'flag_reason') THEN
          CREATE TYPE flag_reason AS ENUM (
            'inappropriate', 'spam', 'misinformation', 'harmful', 'personal_attack', 'copyright', 'other'
          );
        END IF;
      END $$;
    `);

    console.log('Created flag_reason enum');

    // Create pulse_flags table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS pulse_flags (
        id SERIAL PRIMARY KEY,
        pulse_id INTEGER NOT NULL REFERENCES pulses(id) ON DELETE CASCADE,
        flagged_by_user_id INTEGER NOT NULL REFERENCES users(id),
        reason flag_reason NOT NULL,
        details TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        reviewed_by_user_id INTEGER REFERENCES users(id),
        review_notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        reviewed_at TIMESTAMP
      );
      
      -- Create index on pulse_id for efficient querying
      CREATE INDEX IF NOT EXISTS idx_pulse_flags_pulse_id 
      ON pulse_flags (pulse_id);
      
      -- Create index on status for efficient filtering
      CREATE INDEX IF NOT EXISTS idx_pulse_flags_status 
      ON pulse_flags (status);
      
      -- Create index on created_at for chronological sorting
      CREATE INDEX IF NOT EXISTS idx_pulse_flags_created_at 
      ON pulse_flags (created_at);
    `);

    console.log('Created pulse_flags table');

    // Add flag count to pulses table if it doesn't exist
    await executeQuery(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name='pulses' AND column_name='flag_count'
        ) THEN
          ALTER TABLE pulses ADD COLUMN flag_count INTEGER DEFAULT 0;
        END IF;
      END $$;
    `);

    console.log('Added flag_count column to pulses table (if needed)');

    console.log('Successfully created all pulse flag tables!');
  } catch (error) {
    console.error('Error creating pulse flag tables:', error);
    throw error;
  }
}

// Main function
async function main() {
  try {
    await createFlagTables();
    console.log('Pulse flags database setup completed successfully!');
  } catch (error) {
    console.error('Error during pulse flags database setup:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();