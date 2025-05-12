import { Pool, neonConfig } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import ws from 'ws';

dotenv.config();

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function executeQuery(query: string, params: any[] = []) {
  try {
    const result = await pool.query(query, params);
    return result;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}

async function assignQuestsToUser(userId: number) {
  try {
    // Step 1: Get current week and year
    const currentDate = new Date();
    const currentWeek = getWeekNumber(currentDate);
    const currentYear = currentDate.getFullYear();
    
    console.log(`Current Week: ${currentWeek}, Year: ${currentYear}`);

    // Step 2: Get quest definitions
    const { rows: allQuests } = await executeQuery(`
      SELECT * FROM quest_definitions 
      WHERE target_action IN (
        'create_pulse', 'use_hashtag', 'comment_on_pulse', 'react_to_pulse',
        'share_pulse', 'add_media_to_pulse', 'platform_interaction'
      )
    `);
    
    console.log(`Found ${allQuests.length} quest definitions`);

    // Step 3: Get currently assigned quests for this week
    const { rows: currentWeekQuests } = await executeQuery(`
      SELECT * FROM user_quests
      WHERE user_id = $1
      AND week_number = $2
      AND year = $3
    `, [userId, currentWeek, currentYear]);
    
    // Check if we have 3 active quests for this week - if not, assign new ones
    if (currentWeekQuests.length !== 3) {
      // First, remove any existing quests for this week
      await executeQuery(`
        DELETE FROM user_quests
        WHERE user_id = $1
        AND week_number = $2
        AND year = $3
      `, [userId, currentWeek, currentYear]);
      
      // Select 3 specific quests - Hashtag Hero, Media Maven, and Meaningful Commenter
      const selectedQuests = [
        allQuests.find(q => q.target_action === 'use_hashtag'), // Hashtag Hero
        allQuests.find(q => q.target_action === 'add_media_to_pulse'), // Media Maven
        allQuests.find(q => q.target_action === 'comment_on_pulse') // Meaningful Commenter
      ].filter(Boolean);
      
      // Assign these quests to the user
      for (const quest of selectedQuests) {
        await executeQuery(`
          INSERT INTO user_quests 
            (user_id, quest_definition_id, status, progress, assigned_at, week_number, year)
          VALUES 
            ($1, $2, 'active', 0, NOW(), $3, $4)
        `, [userId, quest.id, currentWeek, currentYear]);
      }
      
      console.log(`Assigned ${selectedQuests.length} new quests for week ${currentWeek} to user ${userId}`);
    } else {
      console.log(`Already have ${currentWeekQuests.length} quests for this week for user ${userId}`);
    }

    console.log('Weekly quest assignment completed successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error assigning quests:', error);
    return { success: false, error };
  } finally {
    await pool.end();
  }
}

/**
 * Get the ISO week number for a given date
 */
function getWeekNumber(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// Execute the function for user 51502375
assignQuestsToUser(51502375)
  .then((result) => {
    console.log('Assignment completed:', result);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Assignment failed:', error);
    process.exit(1);
  });