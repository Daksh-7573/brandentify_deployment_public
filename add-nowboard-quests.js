/**
 * Script to add Nowboard Opportunities related quests to the database
 * 
 * This script creates new quest definitions for interacting with Nowboard Opportunities
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

async function addNowboardQuestDefinitions() {
  try {
    // Start transaction
    await executeQuery('BEGIN');
    
    // Add Nowboard quest definitions
    const nowboardQuests = [
      {
        title: 'Opportunity Explorer',
        description: 'View 5 Nowboard opportunities in your industry to discover career options.',
        type: 'exploration',
        targetCount: 5,
        targetAction: 'engage_with_nowboard',
        xpReward: 50,
        badgeReward: 'explorer',
        muskTip: 'Explore opportunities in trending industries to expand your career horizons. Look for roles that match your skills but also challenge you to grow professionally.',
        isActive: true
      },
      {
        title: 'Opportunity Saver',
        description: 'Save 3 interesting opportunities from Nowboard for future reference.',
        type: 'networking',
        targetCount: 3,
        targetAction: 'save_nowboard_opportunity',
        xpReward: 75,
        badgeReward: 'opportunist',
        muskTip: 'Save opportunities that align with your career goals. You can refer back to them when updating your skills or preparing for interviews.',
        isActive: true
      },
      {
        title: 'Trend Tracker',
        description: 'View opportunities featuring trending skills in your industry.',
        type: 'exploration',
        targetCount: 3,
        targetAction: 'engage_with_nowboard',
        xpReward: 60,
        badgeReward: null,
        muskTip: 'Pay attention to which skills appear frequently in job opportunities. These are the skills employers value most in your industry right now.',
        isActive: true
      }
    ];
    
    // Insert quest definitions
    for (const quest of nowboardQuests) {
      // First check if quest already exists
      const existingQuest = await executeQuery(
        `SELECT id FROM quest_definitions WHERE title = $1`,
        [quest.title]
      );
      
      if (existingQuest.rows.length > 0) {
        // Update existing quest
        const questId = existingQuest.rows[0].id;
        console.log(`Updating existing quest: ${quest.title} (ID: ${questId})`);
        
        await executeQuery(
          `UPDATE quest_definitions
           SET description = $2,
               type = $3,
               target_count = $4,
               target_action = $5,
               xp_reward = $6,
               badge_reward = $7,
               musk_tip = $8,
               is_active = $9,
               updated_at = NOW()
           WHERE id = $1`,
          [
            questId,
            quest.description,
            quest.type,
            quest.targetCount,
            quest.targetAction,
            quest.xpReward,
            quest.badgeReward,
            quest.muskTip,
            quest.isActive
          ]
        );
      } else {
        // Insert new quest
        console.log(`Creating new quest: ${quest.title}`);
        
        await executeQuery(
          `INSERT INTO quest_definitions 
            (title, description, type, target_count, target_action, xp_reward, badge_reward, musk_tip, is_active, created_at, updated_at)
           VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
          [
            quest.title,
            quest.description,
            quest.type,
            quest.targetCount,
            quest.targetAction,
            quest.xpReward,
            quest.badgeReward,
            quest.muskTip,
            quest.isActive
          ]
        );
      }
    }
    
    // Commit transaction
    await executeQuery('COMMIT');
    
    console.log('Successfully added Nowboard quest definitions');
  } catch (error) {
    // Rollback transaction on error
    await executeQuery('ROLLBACK');
    console.error('Error adding Nowboard quest definitions:', error);
  } finally {
    // Close pool
    pool.end();
  }
}

// Run the function
addNowboardQuestDefinitions()
  .then(() => console.log('Done'))
  .catch(err => console.error('Script error:', err));