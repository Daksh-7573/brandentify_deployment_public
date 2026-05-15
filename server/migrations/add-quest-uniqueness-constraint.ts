import { pool } from '../db';

/**
 * Migration: Add unique constraint to prevent duplicate quest generation
 * Constraint: UNIQUE (user_id, scheduled_date, quest_definition_id)
 * This ensures no duplicate quests for the same user on the same date
 */
export async function up() {
  try {
    console.log('[Migration] Adding quest uniqueness constraint...');
    
    // Add unique constraint to prevent duplicate quests
    await pool.query(`
      ALTER TABLE user_quests 
      ADD CONSTRAINT unique_user_quest_date 
      UNIQUE (user_id, scheduled_date, quest_definition_id);
    `);
    
    console.log('[Migration] ✅ Quest uniqueness constraint added successfully');
  } catch (error: any) {
    if (error.code === '23505') {
      console.log('[Migration] ⚠️ Constraint already exists, skipping...');
    } else if (error.code === '23514') {
      console.log('[Migration] ⚠️ Cannot create constraint due to existing duplicates. Cleaning up duplicates first...');
      
      // Remove duplicate quests, keeping the most recent one
      await pool.query(`
        DELETE FROM user_quests 
        WHERE id NOT IN (
          SELECT DISTINCT ON (user_id, scheduled_date, quest_definition_id) 
          id 
          FROM user_quests 
          ORDER BY user_id, scheduled_date, quest_definition_id, assigned_at DESC
        );
      `);
      
      // Try adding the constraint again
      await pool.query(`
        ALTER TABLE user_quests 
        ADD CONSTRAINT unique_user_quest_date 
        UNIQUE (user_id, scheduled_date, quest_definition_id);
      `);
      
      console.log('[Migration] ✅ Duplicates cleaned and constraint added successfully');
    } else {
      console.error('[Migration] ❌ Failed to add quest uniqueness constraint:', error);
      throw error;
    }
  }
}

export async function down() {
  try {
    console.log('[Migration] Removing quest uniqueness constraint...');
    
    await pool.query(`
      ALTER TABLE user_quests 
      DROP CONSTRAINT IF EXISTS unique_user_quest_date;
    `);
    
    console.log('[Migration] ✅ Quest uniqueness constraint removed successfully');
  } catch (error) {
    console.error('[Migration] ❌ Failed to remove quest uniqueness constraint:', error);
    throw error;
  }
}
