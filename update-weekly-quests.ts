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

async function updateWeeklyQuests() {
  try {
    // Step 1: Get current week and year
    const currentDate = new Date();
    const currentWeek = getWeekNumber(currentDate);
    const currentYear = currentDate.getFullYear();
    
    console.log(`Current Week: ${currentWeek}, Year: ${currentYear}`);

    // Step 2: Define all available quests if we need to reset
    const allQuestDescriptions = [
      {
        title: 'Pulse Creator',
        description: 'Create a pulse post to share insights with your network',
        type: 'pulse_creation',
        targetCount: 1,
        targetAction: 'create_pulse',
        xpReward: 30,
        badgeReward: 'weekly_hustler',
        muskTip: 'Quality over quantity - make each pulse valuable to your audience.'
      },
      {
        title: 'Hashtag Hero',
        description: 'Create a pulse with at least 3 relevant hashtags',
        type: 'pulse_creation',
        targetCount: 3,
        targetAction: 'use_hashtag',
        xpReward: 25,
        badgeReward: null,
        muskTip: 'Mix popular and niche hashtags to maximize discovery without losing relevance.'
      },
      {
        title: 'Meaningful Commenter',
        description: 'Leave a thoughtful comment on a pulse post',
        type: 'networking',
        targetCount: 1,
        targetAction: 'comment_on_pulse',
        xpReward: 15,
        badgeReward: null,
        muskTip: 'Add value to conversations by sharing your unique insights or asking thoughtful questions.'
      },
      {
        title: 'Reaction Giver',
        description: 'Mark pulses as \'Insightful\' to show appreciation',
        type: 'networking',
        targetCount: 3,
        targetAction: 'react_to_pulse',
        xpReward: 10,
        badgeReward: null,
        muskTip: 'Try finding content from people outside your usual network for fresh perspectives.'
      },
      {
        title: 'Content Sharer',
        description: 'Share pulses with others in your network',
        type: 'networking',
        targetCount: 1,
        targetAction: 'share_pulse',
        xpReward: 20,
        badgeReward: null,
        muskTip: 'Share content that aligns with your connection\'s interests to make your interaction more meaningful.'
      },
      {
        title: 'Media Maven',
        description: 'Create a pulse with a media attachment (image, document, etc.)',
        type: 'pulse_creation',
        targetCount: 1,
        targetAction: 'add_media_to_pulse',
        xpReward: 25,
        badgeReward: null,
        muskTip: 'Visual content typically receives higher engagement than text-only posts.'
      },
      {
        title: 'Weekly Contributor',
        description: 'Create at least one pulse post this week',
        type: 'pulse_creation',
        targetCount: 1,
        targetAction: 'create_pulse',
        xpReward: 30,
        badgeReward: null,
        muskTip: 'Regular posting helps maintain visibility in your network\'s feeds.'
      },
      {
        title: 'Active Networker',
        description: 'Interact with the platform at least 3 times this week',
        type: 'networking',
        targetCount: 3,
        targetAction: 'platform_interaction',
        xpReward: 20,
        badgeReward: null,
        muskTip: 'Consistent engagement is key to building a strong professional network.'
      }
    ];

    // Step 3: Check if we need to set up quests (first run or reset)
    const { rows: existingQuests } = await executeQuery(`
      SELECT * FROM quest_definitions 
      WHERE target_action IN (
        'create_pulse', 'use_hashtag', 'comment_on_pulse', 'react_to_pulse',
        'share_pulse', 'add_media_to_pulse', 'platform_interaction'
      )
    `);
    
    // If we don't have all the engagement quests, add them
    if (existingQuests.length < allQuestDescriptions.length) {
      console.log(`Only found ${existingQuests.length} engagement quests, adding all quests...`);
      
      // Delete any existing quests to start fresh
      await executeQuery(`
        DELETE FROM user_quests
        WHERE quest_definition_id IN (
          SELECT id FROM quest_definitions
          WHERE target_action IN (
            'create_pulse', 'use_hashtag', 'comment_on_pulse', 'react_to_pulse',
            'share_pulse', 'add_media_to_pulse', 'platform_interaction'
          )
        );
        
        DELETE FROM quest_definitions
        WHERE target_action IN (
          'create_pulse', 'use_hashtag', 'comment_on_pulse', 'react_to_pulse',
          'share_pulse', 'add_media_to_pulse', 'platform_interaction'
        );
      `);
      
      // Add all quest definitions
      for (const quest of allQuestDescriptions) {
        await executeQuery(`
          INSERT INTO quest_definitions
            (title, description, type, target_count, target_action, xp_reward, badge_reward, musk_tip, is_active)
          VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, true)
        `, [
          quest.title,
          quest.description,
          quest.type,
          quest.targetCount,
          quest.targetAction,
          quest.xpReward,
          quest.badgeReward,
          quest.muskTip
        ]);
      }
      
      console.log('Added all quest definitions');
    }

    // Step 4: Get all quest definitions
    const { rows: allQuests } = await executeQuery(`
      SELECT * FROM quest_definitions 
      WHERE target_action IN (
        'create_pulse', 'use_hashtag', 'comment_on_pulse', 'react_to_pulse',
        'share_pulse', 'add_media_to_pulse', 'platform_interaction'
      )
    `);
    
    console.log(`Found ${allQuests.length} quest definitions`);

    // Step 5: Get currently assigned quests for this week
    const { rows: currentWeekQuests } = await executeQuery(`
      SELECT * FROM user_quests
      WHERE user_id = 2
      AND week_number = $1
      AND year = $2
    `, [currentWeek, currentYear]);
    
    // Check if we have 3 active quests for this week - if not, assign new ones
    if (currentWeekQuests.length !== 3) {
      // First, remove any existing quests for this week
      await executeQuery(`
        DELETE FROM user_quests
        WHERE user_id = 2
        AND week_number = $1
        AND year = $2
      `, [currentWeek, currentYear]);
      
      // Select 3 random quests from our pool
      // We'll use the week number to deterministically select quests so they change each week
      const selectedQuests = selectWeeklyQuests(allQuests, currentWeek, currentYear);
      
      // Assign these quests to the user
      for (const quest of selectedQuests) {
        await executeQuery(`
          INSERT INTO user_quests 
            (user_id, quest_definition_id, status, progress, assigned_at, week_number, year)
          VALUES 
            (2, $1, 'active', 0, NOW(), $2, $3)
        `, [quest.id, currentWeek, currentYear]);
      }
      
      console.log(`Assigned ${selectedQuests.length} new quests for week ${currentWeek}`);
    } else {
      console.log(`Already have ${currentWeekQuests.length} quests for this week`);
    }

    console.log('Weekly quest rotation completed successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error updating weekly quests:', error);
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

/**
 * Select 3 quests based on the week number (for deterministic rotation)
 */
function selectWeeklyQuests(quests: any[], week: number, year: number): any[] {
  // Use week number to create a consistent but different selection each week
  const seed = week + (year * 100);
  
  // Shuffle array with a seeded random generator
  const shuffled = [...quests].sort((a, b) => {
    const randomA = Math.sin(seed * a.id) * 10000;
    const randomB = Math.sin(seed * b.id) * 10000;
    return (randomA - Math.floor(randomA)) - (randomB - Math.floor(randomB));
  });
  
  // Take the first 3 quests
  return shuffled.slice(0, 3);
}

// Execute the function
updateWeeklyQuests()
  .then((result) => {
    console.log('Update completed:', result);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Update failed:', error);
    process.exit(1);
  });