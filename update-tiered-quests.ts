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

async function updateTieredQuests() {
  try {
    // First, reset quest definitions to ensure clean state
    await executeQuery(`
      DELETE FROM quest_definitions
      WHERE type IN ('daily', 'weekly', 'monthly', 'pulse_creation', 'networking');
    `);

    // Add Daily Quests (Light, quick tasks)
    await executeQuery(`
      INSERT INTO quest_definitions
        (title, description, type, target_count, target_action, xp_reward, musk_tip, is_active)
      VALUES
        (
          'Daily Reactor',
          'React to 3 pulses today',
          'daily',
          3,
          'react_to_pulse',
          10,
          'Try finding content from people outside your usual network for fresh perspectives.',
          true
        ),
        (
          'Daily Commenter',
          'Leave 1 thoughtful comment on a pulse today',
          'daily',
          1,
          'comment_on_pulse',
          15,
          'Add value to conversations by sharing your unique insights or asking thoughtful questions.',
          true
        ),
        (
          'Quick Connection',
          'Share 1 pulse with someone in your network today',
          'daily',
          1,
          'share_pulse',
          10,
          'Share content that aligns with your connection''s interests to make your interaction more meaningful.',
          true
        );
    `);

    // Add Weekly Quests (Medium difficulty, sustained engagement)
    await executeQuery(`
      INSERT INTO quest_definitions
        (title, description, type, target_count, target_action, xp_reward, badge_reward, musk_tip, is_active)
      VALUES
        (
          'Pulse Creator',
          'Create 3 pulse posts this week',
          'weekly',
          3,
          'create_pulse',
          30,
          'weekly_hustler',
          'Quality over quantity - make each pulse valuable to your audience.',
          true
        ),
        (
          'Hashtag Champion',
          'Use at least 15 relevant hashtags across your pulses this week',
          'weekly',
          15,
          'use_hashtag',
          25,
          null,
          'Mix popular and niche hashtags to maximize discovery without losing relevance.',
          true
        ),
        (
          'Content Curator',
          'React to 10 different pulses this week',
          'weekly',
          10,
          'react_to_pulse',
          20,
          null,
          'Engaging with others'' content is a great way to build your network.',
          true
        );
    `);

    // Add Monthly Challenges (High effort, significant rewards)
    await executeQuery(`
      INSERT INTO quest_definitions
        (title, description, type, target_count, target_action, xp_reward, badge_reward, musk_tip, is_active)
      VALUES
        (
          'Thought Leader',
          'Receive 25 reactions on your pulses this month',
          'monthly',
          25,
          'receive_reactions',
          100,
          'thought_leader',
          'Focus on your unique perspective and expertise to create standout content.',
          true
        ),
        (
          'Networking Master',
          'Connect with 10 new professionals in your industry this month',
          'monthly',
          10,
          'make_connection',
          75,
          null,
          'Quality connections in your industry can open doors to new opportunities.',
          true
        );
    `);

    console.log('Successfully updated tiered quests!');

    // Assign quests to user with ID 2 (as detected in your application)
    await executeQuery(`
      DELETE FROM user_quests WHERE user_id = 2;
      
      -- Assign all quests to user 2
      INSERT INTO user_quests (user_id, quest_definition_id, status, progress, assigned_at, week_number, year)
      SELECT 2, id, 'active', 0, NOW(), extract(week from NOW()), extract(year from NOW())
      FROM quest_definitions
      WHERE is_active = true;
    `);

    console.log('Successfully assigned quests to user!');

    return { success: true };
  } catch (error) {
    console.error('Error updating tiered quests:', error);
    return { success: false, error };
  } finally {
    await pool.end();
  }
}

// Execute the function
updateTieredQuests()
  .then((result) => {
    console.log('Update completed:', result);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Update failed:', error);
    process.exit(1);
  });