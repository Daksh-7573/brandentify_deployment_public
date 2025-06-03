/**
 * Script to assign quests to user ID 2 (current logged-in user)
 */

import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function executeQuery(queryText, params = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(queryText, params);
    return result;
  } finally {
    client.release();
  }
}

/**
 * Get the ISO week number for a given date
 */
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Assign quests to user ID 2
 */
async function assignQuestsToUser2() {
  const userId = 2;
  console.log(`Assigning quests to user ${userId}...`);

  // Get current week and year
  const now = new Date();
  const currentWeek = getWeekNumber(now);
  const currentYear = now.getFullYear();
  
  console.log(`Current week: ${currentWeek}, year: ${currentYear}`);

  try {
    // Check if user exists
    const userCheck = await executeQuery('SELECT id FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      console.log(`User ${userId} does not exist.`);
      return;
    }
    console.log(`User ${userId} exists.`);

    // Get pulse-related quest definitions
    const questDefsResult = await executeQuery(`
      SELECT * FROM quest_definitions 
      WHERE is_active = true 
      AND (target_action LIKE '%pulse%' OR target_action IN ('create_pulse', 'comment_on_pulse', 'react_to_pulse', 'add_media_to_pulse'))
      ORDER BY id
    `);
    
    const questDefinitions = questDefsResult.rows;
    console.log(`Found ${questDefinitions.length} pulse-related quest definitions`);
    
    if (questDefinitions.length === 0) {
      console.log('No active quest definitions found');
      return;
    }

    console.log('Quest definitions found:');
    questDefinitions.forEach(def => {
      console.log(`- ID: ${def.id}, Title: ${def.title}, Type: ${def.type}, Target Action: ${def.target_action}`);
    });

    // Select 3 quests for assignment
    const questsToAssign = questDefinitions.slice(0, 3);
    console.log(`Preparing to assign ${questsToAssign.length} quests to user ${userId}`);

    // Ensure user has XP record
    const xpCheck = await executeQuery('SELECT id FROM user_xp WHERE user_id = $1', [userId]);
    if (xpCheck.rows.length === 0) {
      await executeQuery(`
        INSERT INTO user_xp (user_id, balance, lifetime_earned, current_month_earned)
        VALUES ($1, 0, 0, 0)
      `, [userId]);
    }
    console.log(`Ensured XP record exists for user ${userId}`);

    // Assign quests
    for (const questDef of questsToAssign) {
      console.log(`Processing quest "${questDef.title}" (ID: ${questDef.id}) for user ${userId}`);
      
      // Check if quest already assigned for this week
      const existingQuest = await executeQuery(`
        SELECT id FROM user_quests 
        WHERE user_id = $1 AND quest_definition_id = $2 AND week_number = $3 AND year = $4
      `, [userId, questDef.id, currentWeek, currentYear]);

      if (existingQuest.rows.length > 0) {
        console.log(`Quest "${questDef.title}" already assigned to user ${userId} for this week`);
        continue;
      }

      // Insert the quest
      await executeQuery(`
        INSERT INTO user_quests (
          user_id, quest_definition_id, status, progress, week_number, year,
          assigned_at
        ) VALUES ($1, $2, 'active', 0, $3, $4, NOW())
      `, [userId, questDef.id, currentWeek, currentYear]);

      console.log(`Quest "${questDef.title}" assigned to user ${userId}`);
    }

    console.log(`Successfully assigned quests to user ${userId}`);

  } catch (error) {
    console.error('Error assigning quests:', error);
  } finally {
    await pool.end();
  }
}

// Run the script
assignQuestsToUser2();