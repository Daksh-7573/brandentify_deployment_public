/**
 * Script to assign current week quests to ALL users
 * This will fix the Brand Quests visibility issue by creating active quests for week 38 for all users
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

async function assignCurrentWeekQuestsToAllUsers() {
  try {
    const currentDate = new Date();
    const currentWeek = getWeekNumber(currentDate);
    const currentYear = currentDate.getFullYear();
    
    console.log(`Assigning quests for Week ${currentWeek}, Year ${currentYear} to all users`);
    
    // Get all users (excluding system users like Musk AI Assistant)
    const usersResult = await executeQuery(`
      SELECT id, name, username 
      FROM users 
      WHERE id NOT IN (3) -- Exclude Musk AI Assistant
      ORDER BY id
    `);
    
    if (usersResult.rows.length === 0) {
      console.log('No users found');
      return;
    }
    
    console.log(`Found ${usersResult.rows.length} users to assign quests to`);
    
    // Get available active quest definitions
    const questDefinitionsResult = await executeQuery(`
      SELECT id, title, description, category, difficulty, xp_reward, target_action, type
      FROM quest_definitions 
      WHERE is_active = true
      ORDER BY RANDOM()
    `);
    
    if (questDefinitionsResult.rows.length === 0) {
      console.log('No active quest definitions found');
      return;
    }
    
    console.log(`Found ${questDefinitionsResult.rows.length} active quest definitions`);
    
    // Assign quests to each user
    for (const user of usersResult.rows) {
      console.log(`\nProcessing user ${user.id} (${user.name || user.username})`);
      
      // Check if user already has active quests for current week
      const existingQuests = await executeQuery(`
        SELECT id, status FROM user_quests 
        WHERE user_id = $1 AND week_number = $2 AND year = $3
      `, [user.id, currentWeek, currentYear]);
      
      if (existingQuests.rows.length > 0) {
        console.log(`  User ${user.id} already has ${existingQuests.rows.length} quests for week ${currentWeek}`);
        // Update expired quests to active for current week
        const updateResult = await executeQuery(`
          UPDATE user_quests 
          SET status = 'active'
          WHERE user_id = $1 AND week_number = $2 AND year = $3 AND status != 'completed'
        `, [user.id, currentWeek, currentYear]);
        console.log(`  Updated ${updateResult.rowCount} existing quests to active status`);
        continue;
      }
      
      // Select 3-5 random quests for this user
      const selectedQuests = questDefinitionsResult.rows
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 3) + 3); // 3-5 quests
      
      // Assign selected quests to the user
      for (const questDef of selectedQuests) {
        const questResult = await executeQuery(`
          INSERT INTO user_quests (
            user_id, quest_definition_id, status, progress, 
            assigned_at, week_number, year, xp_earned, badge_earned
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING id
        `, [
          user.id,
          questDef.id,
          'active', // Set status as active
          0,
          new Date(),
          currentWeek,
          currentYear,
          0,
          null
        ]);
        
        console.log(`  ✓ Assigned quest "${questDef.title}" (ID: ${questResult.rows[0].id}) to user ${user.id}`);
      }
      
      console.log(`  Successfully assigned ${selectedQuests.length} active quests to user ${user.id}`);
    }
    
    console.log(`\n✅ Successfully assigned quests to all ${usersResult.rows.length} users for week ${currentWeek}`);
    
  } catch (error) {
    console.error('Error assigning current week quests:', error);
  } finally {
    await pool.end();
  }
}

// Run the script
assignCurrentWeekQuestsToAllUsers();