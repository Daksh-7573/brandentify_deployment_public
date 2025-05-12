/**
 * Script to assign Nowboard quests to user 1
 * These quests will appear in the Brand Quests section
 */

import pg from 'pg';
const { Pool } = pg;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function executeQuery(queryText, params = []) {
  try {
    const result = await pool.query(queryText, params);
    return result;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

async function assignNowboardQuests() {
  try {
    // Start transaction
    await executeQuery('BEGIN');
    
    // Get nowboard quest definitions
    const questsResult = await executeQuery(`
      SELECT id 
      FROM quest_definitions 
      WHERE target_action IN ('engage_with_nowboard', 'save_nowboard_opportunity')
    `);
    
    if (questsResult.rows.length === 0) {
      console.log('No Nowboard quests found');
      await executeQuery('ROLLBACK');
      return;
    }
    
    // Get current week number and year
    const date = new Date();
    const weekNumber = getWeekNumber(date);
    const year = date.getFullYear();
    
    // Assign quests to user 1
    const userId = 1;
    
    // Check how many active quests user already has for current week
    const activeQuestCount = await executeQuery(`
      SELECT COUNT(*) as count 
      FROM user_quests 
      WHERE user_id = $1 AND status = 'active' AND week_number = $2 AND year = $3
    `, [userId, weekNumber, year]);
    
    const currentActiveQuests = parseInt(activeQuestCount.rows[0].count);
    console.log(`User ${userId} has ${currentActiveQuests} active quests for week ${weekNumber}`);
    
    // Maximum quests per week
    const maxQuestsPerWeek = 3;
    
    // If we already have 3 or more active quests, don't add more
    if (currentActiveQuests >= maxQuestsPerWeek) {
      console.log(`User ${userId} already has ${currentActiveQuests} active quests for week ${weekNumber}, skipping assignment`);
      await executeQuery('COMMIT');
      return;
    }
    
    // How many more quests we can assign
    const remainingSlots = maxQuestsPerWeek - currentActiveQuests;
    console.log(`Can assign up to ${remainingSlots} more quests for week ${weekNumber}`);
    
    // Count of quests assigned in this run
    let assignedCount = 0;
    
    for (const quest of questsResult.rows) {
      // Break if we've assigned the maximum allowed
      if (assignedCount >= remainingSlots) {
        console.log(`Reached maximum of ${maxQuestsPerWeek} quests per week`);
        break;
      }
      
      const questDefinitionId = quest.id;
      
      // Check if quest is already assigned to user
      const existingResult = await executeQuery(`
        SELECT id FROM user_quests 
        WHERE user_id = $1 AND quest_definition_id = $2
      `, [userId, questDefinitionId]);
      
      if (existingResult.rows.length > 0) {
        console.log(`Quest ${questDefinitionId} already assigned to user ${userId}`);
        continue;
      }
      
      // Assign quest to user
      await executeQuery(`
        INSERT INTO user_quests 
          (user_id, quest_definition_id, status, progress, assigned_at, week_number, year)
        VALUES
          ($1, $2, 'active', 0, NOW(), $3, $4)
      `, [userId, questDefinitionId, weekNumber, year]);
      
      console.log(`Assigned quest ${questDefinitionId} to user ${userId}`);
      assignedCount++;
    }
    
    // Commit transaction
    await executeQuery('COMMIT');
    
    console.log('Successfully assigned Nowboard quests to user 1');
  } catch (error) {
    // Rollback transaction on error
    await executeQuery('ROLLBACK');
    console.error('Error assigning Nowboard quests:', error);
  } finally {
    // Close pool
    pool.end();
  }
}

/**
 * Get ISO week number
 */
function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Run the function
assignNowboardQuests()
  .then(() => console.log('Done'))
  .catch(err => console.error('Script error:', err));