/**
 * Migration script to add Musk feedback-related tables
 */

import { db, executeRawQuery } from "./db";

async function runMigration() {
  console.log("Starting feedback system database migration...");

  try {
    // Create the feedback_type enum if it doesn't exist
    await executeRawQuery(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'feedback_type') THEN
          CREATE TYPE feedback_type AS ENUM ('helpful', 'rating', 'text', 'save');
        END IF;
      END
      $$;
    `);
    console.log("Created feedback_type enum");

    // Create musk_feedbacks table
    await executeRawQuery(`
      CREATE TABLE IF NOT EXISTS musk_feedbacks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        conversation_id TEXT NOT NULL,
        message_id TEXT NOT NULL,
        feedback_type feedback_type NOT NULL,
        rating INTEGER,
        helpful BOOLEAN,
        text_feedback TEXT,
        saved_to_plan BOOLEAN DEFAULT false,
        context TEXT,
        prompt_category TEXT,
        prompt_details JSONB DEFAULT '{}',
        response_details JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Created musk_feedbacks table");

    // Create feedback_analytics table
    await executeRawQuery(`
      CREATE TABLE IF NOT EXISTS feedback_analytics (
        id SERIAL PRIMARY KEY,
        prompt_category TEXT NOT NULL,
        response_type TEXT NOT NULL,
        average_rating DECIMAL(3,2),
        helpful_count INTEGER DEFAULT 0,
        unhelpful_count INTEGER DEFAULT 0,
        saved_count INTEGER DEFAULT 0,
        career_stage TEXT,
        industry TEXT,
        most_common_feedback JSONB DEFAULT '[]',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Created feedback_analytics table");

    // Add indexes for better performance
    await executeRawQuery(`
      CREATE INDEX IF NOT EXISTS idx_musk_feedbacks_user_id ON musk_feedbacks(user_id);
      CREATE INDEX IF NOT EXISTS idx_musk_feedbacks_conversation_id ON musk_feedbacks(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_feedback_analytics_prompt_category ON feedback_analytics(prompt_category);
    `);
    console.log("Created indexes on feedback tables");

    console.log("Musk feedback tables migration completed successfully");
  } catch (error) {
    console.error("Error in feedback tables migration:", error);
    throw error;
  }
}

// Run the migration
runMigration().then(() => {
  console.log("Migration complete");
  process.exit(0);
}).catch(error => {
  console.error("Migration failed:", error);
  process.exit(1);
});