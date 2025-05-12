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

async function createDemoUserAndAssignQuests() {
  try {
    // Step 1: Use the existing demo user with ID 1
    console.log("Using existing demo user with ID 1");
    const demoUserId = 1;
    
    // Step 3: Get current week and year
    const currentDate = new Date();
    const currentWeek = getWeekNumber(currentDate);
    const currentYear = currentDate.getFullYear();
    
    console.log(`Current Week: ${currentWeek}, Year: ${currentYear}`);

    // Step 4: Get quest definitions
    const { rows: allQuests } = await executeQuery(`
      SELECT * FROM quest_definitions 
      WHERE target_action IN (
        'use_hashtag', 'add_media_to_pulse', 'comment_on_pulse'
      )
      AND is_active = true
    `);
    
    console.log(`Found ${allQuests.length} quest definitions for demo quests`);

    // Step 5: Get currently assigned quests for this week
    const { rows: currentWeekQuests } = await executeQuery(`
      SELECT * FROM user_quests
      WHERE user_id = $1
      AND week_number = $2
      AND year = $3
    `, [demoUserId, currentWeek, currentYear]);
    
    // Step 6: Check if we have 3 active quests for this week - if not, assign new ones
    if (currentWeekQuests.length !== 3) {
      // First, remove any existing quests for this week
      await executeQuery(`
        DELETE FROM user_quests
        WHERE user_id = $1
        AND week_number = $2
        AND year = $3
      `, [demoUserId, currentWeek, currentYear]);
      
      // Select specific quests based on target actions
      const questsToAssign = [];
      
      // Find Hashtag Hero
      const hashtagQuest = allQuests.find(q => q.target_action === 'use_hashtag');
      if (hashtagQuest) questsToAssign.push(hashtagQuest);
      
      // Find Media Maven
      const mediaQuest = allQuests.find(q => q.target_action === 'add_media_to_pulse');
      if (mediaQuest) questsToAssign.push(mediaQuest);
      
      // Find Meaningful Commenter
      const commenterQuest = allQuests.find(q => q.target_action === 'comment_on_pulse');
      if (commenterQuest) questsToAssign.push(commenterQuest);
      
      if (questsToAssign.length === 0) {
        console.log("No active quests found to assign! Please check quest_definitions table.");
        return { success: false, error: "No active quests found" };
      }
      
      // Assign these quests to the user
      for (const quest of questsToAssign) {
        await executeQuery(`
          INSERT INTO user_quests 
            (user_id, quest_definition_id, status, progress, assigned_at, week_number, year)
          VALUES 
            ($1, $2, 'active', 0, NOW(), $3, $4)
        `, [demoUserId, quest.id, currentWeek, currentYear]);
      }
      
      console.log(`Assigned ${questsToAssign.length} new quests for week ${currentWeek} to user ${demoUserId}`);
    } else {
      console.log(`Already have ${currentWeekQuests.length} quests for this week for user ${demoUserId}`);
    }

    // Step 7: Get updated list of quests to confirm
    const { rows: assignedQuests } = await executeQuery(`
      SELECT 
        uq.id,
        uq.user_id as "userId",
        uq.quest_definition_id as "questDefinitionId",
        uq.status,
        uq.progress,
        uq.assigned_at as "assignedAt",
        uq.completed_at as "completedAt",
        uq.xp_earned as "xpEarned",
        uq.badge_earned as "badgeEarned",
        uq.musk_response as "muskResponse",
        uq.week_number as "weekNumber",
        uq.year,
        qd.title as "questTitle",
        qd.description as "questDescription",
        qd.type as "questType",
        qd.target_count as "targetCount",
        qd.target_action as "targetAction",
        qd.xp_reward as "xpReward",
        qd.badge_reward as "badgeReward",
        qd.musk_tip as "muskTip"
      FROM user_quests uq
      JOIN quest_definitions qd ON uq.quest_definition_id = qd.id 
      WHERE uq.user_id = $1 AND 
            uq.week_number = $2 AND 
            uq.year = $3
      ORDER BY uq.assigned_at DESC
    `, [demoUserId, currentWeek, currentYear]);
    
    console.log("Assigned quests:", JSON.stringify(assignedQuests, null, 2));

    console.log('Setup completed successfully!');
    return { success: true, quests: assignedQuests };
  } catch (error) {
    console.error('Error setting up demo user and quests:', error);
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

// Execute the function
createDemoUserAndAssignQuests()
  .then((result) => {
    console.log('Setup completed:', result);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  });