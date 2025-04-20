// Script to apply Nowboard schema directly

import { db, pool } from '../db';

async function applyNowboardSchema() {
  try {
    console.log('Creating Nowboard tables...');
    
    // Create the nowboard_category enum type if it doesn't exist
    await db.execute(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'nowboard_category') THEN
          CREATE TYPE nowboard_category AS ENUM (
            'growth', 'learning', 'launch', 'planning', 'collaboration', 'visibility'
          );
        END IF;
      END $$;
    `);
    
    console.log('Created nowboard_category enum');
    
    // Create nowboard_items table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS nowboard_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        content VARCHAR(150) NOT NULL,
        category nowboard_category NOT NULL,
        visibility VARCHAR(20) NOT NULL DEFAULT 'public',
        inspired_count INTEGER NOT NULL DEFAULT 0,
        related_skills TEXT,
        related_project INTEGER,
        image_url TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    console.log('Created nowboard_items table');
    
    // Create nowboard_inspired_by table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS nowboard_inspired_by (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        nowboard_item_id INTEGER NOT NULL REFERENCES nowboard_items(id),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT unique_user_item UNIQUE (user_id, nowboard_item_id)
      );
    `);
    
    console.log('Created nowboard_inspired_by table');
    
    console.log('Successfully created Nowboard schema!');
  } catch (error) {
    console.error('Error applying Nowboard schema:', error);
  } finally {
    await pool.end();
  }
}

applyNowboardSchema();