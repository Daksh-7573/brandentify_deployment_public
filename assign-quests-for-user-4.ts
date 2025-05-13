/**
 * Script to assign quests to user ID 4 (the Google login user)
 */

import { Pool } from 'pg';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function executeQuery(query: string, params: any[] = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
}

/**
 * Get the ISO week number for a given date
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Assign quests to a specific user
 */
async function assignQuestsToUser(userId: number) {
  try {
    console.log(`Assigning quests to user ${userId}...`);

    // Get current week and year
    const now = new Date();
    const currentWeek = getWeekNumber(now);
    const currentYear = now.getFullYear();
    
    console.log(`Current week: ${currentWeek}, year: ${currentYear}`);
    
    // Check if user exists
    const userExists = await executeQuery(
      'SELECT id FROM users WHERE id = $1',
      [userId]
    );
    
    if (userExists.length === 0) {
      console.error(`User with ID ${userId} does not exist.`);
      return;
    }
    
    console.log(`User ${userId} exists.`);

    // Get quest definitions for engagement quests
    const engagementQuestDefinitions = await executeQuery(
      `SELECT * FROM quest_definitions 
       WHERE category = 'engagement' 
       AND action_type IN ('create_pulse', 'comment_on_pulse', 'react_to_pulse', 'add_media_to_pulse')`
    );
    
    if (engagementQuestDefinitions.length === 0) {
      console.error('No engagement quest definitions found.');
      return;
    }

    console.log(`Found ${engagementQuestDefinitions.length} engagement quest definitions`);
    
    // Log all quest definitions for debugging
    console.log('Quest definitions found:');
    engagementQuestDefinitions.forEach(quest => {
      console.log(`- ID: ${quest.id}, Title: ${quest.title}, Action Type: ${quest.action_type}`);
    });

    // Assign 3 quests for the current week
    const questsToAssign = [
      // Quest 1: Hashtag Hero - Create pulses with hashtags
      engagementQuestDefinitions.find(q => q.action_type === 'create_pulse'),
      // Quest 2: Meaningful Commenter - Comment on pulses
      engagementQuestDefinitions.find(q => q.action_type === 'comment_on_pulse'),
      // Quest 3: Media Maven - Add media to pulses
      engagementQuestDefinitions.find(q => q.action_type === 'add_media_to_pulse')
    ].filter(q => q); // Filter out undefined quests
    
    if (questsToAssign.length === 0) {
      console.error('No valid quests found to assign.');
      return;
    }

    console.log(`Preparing to assign ${questsToAssign.length} quests to user ${userId}`);

    // Create XP record for user if it doesn't exist
    await executeQuery(
      `INSERT INTO user_xp (user_id, balance, lifetime_earned, current_month_earned) 
       VALUES ($1, 0, 0, 0) 
       ON CONFLICT (user_id) DO NOTHING`,
      [userId]
    );
    
    console.log(`Ensured XP record exists for user ${userId}`);

    // Insert quests for the user with current week
    for (const questDef of questsToAssign) {
      console.log(`Processing quest "${questDef.title}" (ID: ${questDef.id}) for user ${userId}`);
      
      // Check if user already has this quest for the current week
      const existingQuest = await executeQuery(
        `SELECT * FROM user_quests 
         WHERE user_id = $1 AND quest_definition_id = $2 AND week = $3 AND year = $4`,
        [userId, questDef.id, currentWeek, currentYear]
      );
      
      if (existingQuest.length > 0) {
        console.log(`User ${userId} already has quest "${questDef.title}" for week ${currentWeek}`);
        continue;
      }
      
      // Insert the quest
      await executeQuery(
        `INSERT INTO user_quests (
           user_id, quest_definition_id, status, progress, week, year, 
           current_progress, target_count, deadline
         ) VALUES (
           $1, $2, 'active', 0, $3, $4, $5, $6, 
           (NOW() + INTERVAL '7 days')::timestamp
         )`,
        [
          userId, 
          questDef.id, 
          currentWeek, 
          currentYear, 
          0, // current_progress
          questDef.target_count || 3 // default target count if not specified
        ]
      );
      
      console.log(`Quest "${questDef.title}" assigned to user ${userId}`);
    }

    console.log(`Successfully assigned quests to user ${userId}`);
  } catch (error) {
    console.error('Error assigning quests:', error);
  } finally {
    await pool.end();
  }
}

// Assign quests to user ID 4 (Google login user)
assignQuestsToUser(4);