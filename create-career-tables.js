/**
 * Script to create career capsule related tables
 */

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pg;

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable not set!');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Execute SQL query with proper error handling
async function executeQuery(queryText, params = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(queryText, params);
    return result;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function createTables() {
  try {
    // Create enum types if they don't exist
    await executeQuery(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'goal_type_enum') THEN
          CREATE TYPE goal_type_enum AS ENUM (
            'custom', 'certification', 'education', 'position_change', 
            'skill_acquisition', 'promotion', 'industry_switch', 
            'entrepreneurship', 'relocation'
          );
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'goal_status_enum') THEN
          CREATE TYPE goal_status_enum AS ENUM (
            'completed', 'not_started', 'in_progress', 'abandoned'
          );
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'skill_priority_enum') THEN
          CREATE TYPE skill_priority_enum AS ENUM (
            'high', 'medium', 'low'
          );
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'skill_status_enum') THEN
          CREATE TYPE skill_status_enum AS ENUM (
            'completed', 'in_progress', 'not_started'
          );
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'log_entry_type_enum') THEN
          CREATE TYPE log_entry_type_enum AS ENUM (
            'accomplishment', 'challenge', 'learning', 'reflection'
          );
        END IF;
      END
      $$;
    `);

    console.log('Created enum types');

    // Create career_goals table if it doesn't exist
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS career_goals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        goal_type goal_type_enum NOT NULL DEFAULT 'position_change',
        status goal_status_enum DEFAULT 'not_started',
        timeframe INTEGER NOT NULL DEFAULT 5,
        target_industry TEXT,
        target_role TEXT,
        current_skills JSONB DEFAULT '[]',
        required_skills JSONB DEFAULT '[]',
        progress INTEGER DEFAULT 0,
        is_private BOOLEAN DEFAULT TRUE,
        is_musk_generated BOOLEAN DEFAULT TRUE,
        start_date TIMESTAMP DEFAULT NOW(),
        target_date TIMESTAMP,
        last_updated TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('Created career_goals table');

    // Create goal_milestones table if it doesn't exist
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS goal_milestones (
        id SERIAL PRIMARY KEY,
        goal_id INTEGER NOT NULL REFERENCES career_goals(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        target_date TIMESTAMP,
        status goal_status_enum DEFAULT 'not_started',
        "order" INTEGER,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('Created goal_milestones table');

    // Create goal_skills table if it doesn't exist
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS goal_skills (
        id SERIAL PRIMARY KEY,
        goal_id INTEGER NOT NULL REFERENCES career_goals(id) ON DELETE CASCADE,
        skill_name TEXT NOT NULL,
        description TEXT,
        priority skill_priority_enum DEFAULT 'medium',
        status skill_status_enum DEFAULT 'not_started',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('Created goal_skills table');

    // Create goal_progress_logs table if it doesn't exist
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS goal_progress_logs (
        id SERIAL PRIMARY KEY,
        goal_id INTEGER NOT NULL REFERENCES career_goals(id) ON DELETE CASCADE,
        milestone_id INTEGER REFERENCES goal_milestones(id) ON DELETE SET NULL,
        entry TEXT NOT NULL,
        entry_type log_entry_type_enum DEFAULT 'accomplishment',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('Created goal_progress_logs table');

    console.log('All tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await pool.end();
  }
}

// Run the main function
(async () => {
  try {
    await createTables();
    console.log('Database setup complete');
  } catch (err) {
    console.error('Database setup failed:', err);
  }
})();