/**
 * Create tables for Enhanced Musk System (8 layers)
 */

import { pool } from '../db';

async function createEnhancedMuskTables() {
  try {
    console.log('Creating enhanced Musk tables...');

    // User Musk Memory table
    console.log('Creating user_musk_memory table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_musk_memory (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
        behavior_patterns JSONB DEFAULT '{"questCompletion": 0, "platformPreferences": {}, "contentPreferences": [], "skippedTopics": []}',
        preferred_platforms TEXT[] DEFAULT '{}',
        content_format TEXT,
        tone TEXT DEFAULT 'neutral',
        recent_actions JSONB DEFAULT '[]',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Conversation Goals table
    console.log('Creating conversation_goals table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversation_goals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        conversation_id TEXT NOT NULL,
        primary_goal TEXT NOT NULL,
        sub_goals JSONB DEFAULT '[]',
        stage TEXT DEFAULT 'onboarding',
        emotion TEXT DEFAULT 'neutral',
        emotion_confidence INTEGER DEFAULT 50,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Goal Checkpoints table
    console.log('Creating goal_checkpoints table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS goal_checkpoints (
        id SERIAL PRIMARY KEY,
        goal_id INTEGER NOT NULL REFERENCES conversation_goals(id),
        checkpoint TEXT NOT NULL,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Emotion Intent History table
    console.log('Creating emotion_intent_history table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS emotion_intent_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        conversation_id TEXT NOT NULL,
        user_message TEXT NOT NULL,
        detected_intent TEXT NOT NULL,
        detected_emotion TEXT NOT NULL,
        emotion_score INTEGER,
        adjusted_tone TEXT,
        response_quality INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ All enhanced Musk tables created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    process.exit(1);
  }
}

createEnhancedMuskTables();
