/**
 * Script to assign current week quests to user 2
 * This will fix the Brand Quests visibility issue by creating active quests for week 26
 */

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function executeQuery(query: string, params: any[] = []) {
  try {
    const result = await pool.query(query, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Get the ISO week number for a given date
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

async function assignCurrentWeekQuests() {
  try {
    const userId = 2;
    const currentDate = new Date();
    const currentWeek = getWeekNumber(currentDate);
    const currentYear = currentDate.getFullYear();
    
    console.log(`Assigning quests for User ${userId}, Week ${currentWeek}, Year ${currentYear}`);
    
    // First, check if user already has active quests for current week
    const existingQuests = await executeQuery(`
      SELECT id, status FROM user_quests 
      WHERE user_id = $1 AND week_number = $2 AND year = $3
    `, [userId, currentWeek, currentYear]);
    
    if (existingQuests.rows.length > 0) {
      console.log(`User ${userId} already has ${existingQuests.rows.length} quests for week ${currentWeek}`);
      // Update expired quests to active for current week
      await executeQuery(`
        UPDATE user_quests 
        SET status = 'active', updated_at = NOW()
        WHERE user_id = $1 AND week_number = $2 AND year = $3
      `, [userId, currentWeek, currentYear]);
      console.log(`Updated existing quests to active status`);
      return;
    }
    
    // Get available quest definitions
    const questDefinitionsResult = await executeQuery(`
      SELECT id, title, description, category, difficulty, xp_reward, target_action
      FROM quest_definitions 
      WHERE is_active = true
      ORDER BY RANDOM()
      LIMIT 3
    `);
    
    if (questDefinitionsResult.rows.length === 0) {
      console.log('No active quest definitions found');
      return;
    }
    
    console.log(`Found ${questDefinitionsResult.rows.length} quest definitions`);
    
    // Assign 3 random quests to the user for current week
    for (const questDef of questDefinitionsResult.rows) {
      const questResult = await executeQuery(`
        INSERT INTO user_quests (
          user_id, quest_definition_id, status, progress, 
          assigned_at, week_number, year, xp_earned, badge_earned
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `, [
        userId,
        questDef.id,
        'active', // Set status as active
        0,
        new Date(),
        currentWeek,
        currentYear,
        0,
        null
      ]);
      
      console.log(`✓ Assigned quest "${questDef.title}" (ID: ${questResult.rows[0].id}) to user ${userId}`);
    }
    
    console.log(`Successfully assigned ${questDefinitionsResult.rows.length} active quests for week ${currentWeek}`);
    
  } catch (error) {
    console.error('Error assigning current week quests:', error);
  } finally {
    await pool.end();
  }
}

// Run the script
assignCurrentWeekQuests();