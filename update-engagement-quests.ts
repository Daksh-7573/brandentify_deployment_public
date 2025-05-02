import { pool } from './server/db';

async function executeQuery(query: string, params: any[] = []) {
  try {
    return await pool.query(query, params);
  } catch (error) {
    console.error("Error executing query:", error);
    throw error;
  }
}

async function updateEngagementQuests() {
  try {
    console.log('Starting: Updating quest definitions to focus on engagement');

    // Check if quest_definitions table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'quest_definitions'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('quest_definitions table does not exist, please run db-migration-career-quests.ts first');
      return {
        success: false,
        message: 'quest_definitions table does not exist'
      };
    }

    // First, deactivate all existing quests
    await executeQuery(`
      UPDATE quest_definitions 
      SET is_active = false
    `);
    console.log('Deactivated all existing quests');

    // Define new engagement-focused quests
    // Available badge types: quest_initiate, weekly_hustler, musk_learner, thought_leader, portfolio_star, visibility_boosted
    // Available quest types: profile_update, pulse_creation, networking, learning, portfolio, resume, visibility
    const engagementQuests = [
      {
        title: "Trending Topic Pulse",
        description: "Create a pulse post about a trending topic in your industry",
        type: "pulse_creation",
        target_count: 1,
        target_action: "create_trending_pulse",
        xp_reward: 75,
        badge_reward: "thought_leader",
        required_profile_completion: 30,
        musk_tip: "Share your insights on trending topics to establish yourself as an industry thought leader. Use hashtags to increase visibility.",
        is_active: true
      },
      {
        title: "Hashtag Hero",
        description: "Create a pulse with at least 3 relevant hashtags",
        type: "pulse_creation",
        target_count: 1,
        target_action: "create_pulse_with_hashtags",
        xp_reward: 60,
        badge_reward: "quest_initiate",
        required_profile_completion: 20,
        musk_tip: "Using relevant hashtags can increase your post visibility by up to 70%. Choose industry-specific hashtags for maximum impact.",
        is_active: true
      },
      {
        title: "Meaningful Comment",
        description: "Leave a thoughtful comment on a high-engagement pulse",
        type: "networking", // Changed from pulse_engagement to valid type
        target_count: 2,
        target_action: "comment_on_pulse",
        xp_reward: 50,
        badge_reward: null,
        required_profile_completion: 10,
        musk_tip: "Thoughtful comments show your expertise. Ask questions or add value to the discussion to increase your visibility.",
        is_active: true
      },
      {
        title: "React and Connect",
        description: "React to 5 pulses from professionals in your target industry",
        type: "networking", // Changed from pulse_engagement to valid type
        target_count: 5,
        target_action: "react_to_pulse",
        xp_reward: 40,
        badge_reward: null,
        required_profile_completion: 10,
        musk_tip: "Consistent engagement builds your network organically. Professionals whose content you regularly engage with are 4x more likely to connect with you.",
        is_active: true
      },
      {
        title: "Content Amplifier",
        description: "Share a valuable pulse with your network",
        type: "networking", // Changed from pulse_engagement to valid type
        target_count: 3,
        target_action: "share_pulse",
        xp_reward: 65,
        badge_reward: "portfolio_star",
        required_profile_completion: 40,
        musk_tip: "Sharing quality content positions you as a valuable resource in your network and increases your visibility across extended networks.",
        is_active: true
      },
      {
        title: "Multimedia Creator",
        description: "Create a pulse with an image or document attachment",
        type: "pulse_creation",
        target_count: 1,
        target_action: "create_multimedia_pulse",
        xp_reward: 70,
        badge_reward: null,
        required_profile_completion: 50,
        musk_tip: "Pulses with visual elements get 94% more views than text-only posts. Add relevant images to boost engagement.",
        is_active: true
      },
      {
        title: "Industry Conversation Starter",
        description: "Start a conversation by posting a question-based pulse about your industry",
        type: "pulse_creation",
        target_count: 1,
        target_action: "create_question_pulse",
        xp_reward: 80,
        badge_reward: "musk_learner",
        required_profile_completion: 60,
        musk_tip: "Question-based posts receive 2x more comments than statement posts. Engage your network by asking for their professional opinion.",
        is_active: true
      },
      {
        title: "Daily Engagement Streak",
        description: "Interact with at least one pulse every day for 5 consecutive days",
        type: "networking", // Changed from pulse_engagement to valid type
        target_count: 5,
        target_action: "daily_pulse_interaction",
        xp_reward: 100,
        badge_reward: "weekly_hustler",
        required_profile_completion: 30,
        musk_tip: "Consistent daily engagement increases your visibility in the feed algorithm. Even 5 minutes a day can significantly boost your professional presence.",
        is_active: true
      }
    ];

    // Insert or update quests
    for (const quest of engagementQuests) {
      // Check if the quest already exists
      const existingQuest = await executeQuery(`
        SELECT id FROM quest_definitions 
        WHERE title = $1 AND target_action = $2
      `, [quest.title, quest.target_action]);

      if (existingQuest.rows.length > 0) {
        // Update existing quest
        await executeQuery(`
          UPDATE quest_definitions 
          SET description = $1, 
              type = $2,
              target_count = $3, 
              xp_reward = $4, 
              badge_reward = $5,
              required_profile_completion = $6,
              musk_tip = $7,
              is_active = $8
          WHERE id = $9
        `, [
          quest.description, 
          quest.type,
          quest.target_count, 
          quest.xp_reward, 
          quest.badge_reward,
          quest.required_profile_completion,
          quest.musk_tip,
          quest.is_active,
          existingQuest.rows[0].id
        ]);
        console.log(`Updated existing quest: ${quest.title}`);
      } else {
        // Create new quest
        await executeQuery(`
          INSERT INTO quest_definitions (
            title, description, type, target_count, target_action, 
            xp_reward, badge_reward, required_profile_completion, musk_tip, is_active
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          quest.title,
          quest.description,
          quest.type,
          quest.target_count,
          quest.target_action,
          quest.xp_reward,
          quest.badge_reward,
          quest.required_profile_completion,
          quest.musk_tip,
          quest.is_active
        ]);
        console.log(`Added new quest: ${quest.title}`);
      }
    }

    console.log('Successfully updated quest definitions to focus on engagement');
    return {
      success: true,
      message: 'Successfully updated quest definitions to focus on engagement'
    };
  } catch (error) {
    console.error('Error while updating engagement quests:', error);
    return {
      success: false,
      message: 'Error while updating engagement quests',
      error: String(error)
    };
  }
}

// Run the update script
updateEngagementQuests()
  .then(result => {
    console.log('Result:', result);
    process.exit(0);
  })
  .catch(err => {
    console.error('Failed:', err);
    process.exit(1);
  });