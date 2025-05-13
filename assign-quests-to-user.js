/**
 * Script to assign quests to a specific user
 * This script will create quests for the specified user ID
 */

import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
const { Pool } = pg;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function executeQuery(queryText, params = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(queryText, params);
    return result.rows;
  } finally {
    client.release();
  }
}

// Get the ISO week number for a date
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

async function assignQuestsToUser(userId) {
  try {
    console.log(`Assigning quests to user ${userId}...`);

    // Get the current week number and year
    const now = new Date();
    const currentWeek = getWeekNumber(now);
    const currentYear = now.getFullYear();
    
    // Check if user exists
    const userExists = await executeQuery(
      'SELECT id FROM users WHERE id = $1',
      [userId]
    );
    
    if (userExists.length === 0) {
      console.error(`User with ID ${userId} does not exist.`);
      return;
    }

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

    // Assign 3 quests for the current week
    const questsToAssign = [
      // Quest 1: Hashtag Hero - Create pulses with hashtags
      engagementQuestDefinitions.find(q => q.action_type === 'create_pulse'),
      // Quest 2: Meaningful Commenter - Comment on pulses
      engagementQuestDefinitions.find(q => q.action_type === 'comment_on_pulse'),
      // Quest 3: Media Maven - Add media to pulses
      engagementQuestDefinitions.find(q => q.action_type === 'add_media_to_pulse')
    ];

    // Filter out any undefined quests (in case some weren't found)
    const validQuests = questsToAssign.filter(q => q);
    
    if (validQuests.length === 0) {
      console.error('No valid quests found to assign.');
      return;
    }

    console.log(`Assigning ${validQuests.length} quests for week ${currentWeek}, year ${currentYear}`);

    // Create XP record for user if it doesn't exist
    await executeQuery(
      `INSERT INTO user_xp (user_id, balance, lifetime_earned, current_month_earned)
       VALUES ($1, 0, 0, 0)
       ON CONFLICT (user_id) DO NOTHING`,
      [userId]
    );

    // Insert quests for the user with current week
    for (const questDef of validQuests) {
      console.log(`Assigning quest "${questDef.title}" to user ${userId}`);
      
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
           $1, $2, 'active', 0, $3, $4, 0, $5, 
           (NOW() + INTERVAL '7 days')::timestamp
         )`,
        [
          userId, 
          questDef.id, 
          currentWeek, 
          currentYear, 
          questDef.target_count
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

// Get user ID from command arguments or use default
const userId = process.argv[2] ? parseInt(process.argv[2], 10) : 4;

// Call the function to assign quests
assignQuestsToUser(userId);