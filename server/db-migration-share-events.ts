/**
 * Migration script to add share_events table for Quantum Card share tracking
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({ 
  connectionString: databaseUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigration() {
  console.log("Starting share events database migration...");

  try {
    // Create share_events table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS share_events (
        id SERIAL PRIMARY KEY,
        ref_user INTEGER NOT NULL REFERENCES users(id),
        viewer_id INTEGER REFERENCES users(id),
        card_id TEXT,
        viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reward_granted BOOLEAN DEFAULT false
      );
    `);
    console.log("✅ Created share_events table");

    // Create index on ref_user for faster lookups
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_share_events_ref_user 
      ON share_events(ref_user);
    `);
    console.log("✅ Created index on ref_user");

    // Create index on viewer_id for duplicate detection
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_share_events_viewer 
      ON share_events(viewer_id, ref_user, card_id);
    `);
    console.log("✅ Created index on viewer_id");

    console.log("✅ Share events migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run migration
runMigration()
  .then(() => {
    console.log("Migration script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration script failed:", error);
    process.exit(1);
  });

export { runMigration };
