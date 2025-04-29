import { pool } from './db';

async function executeQuery(query: string, params: any[] = []) {
  try {
    return await pool.query(query, params);
  } catch (error) {
    console.error("Error executing query:", error);
    throw error;
  }
}

// Helper function to get the current week number
function getWeekNumber(date: Date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

async function assignStarterQuests() {
  try {
    console.log('Starting: Assigning starter quests to users');

    // Get all users
    const users = await executeQuery(`SELECT id FROM users`);
    
    if (users.rows.length === 0) {
      console.log('No users found to assign quests to');
      return {
        success: false,
        message: 'No users found'
      };
    }

    // Get the profile enhancement quests (first 3 quests to get users started)
    const quests = await executeQuery(`
      SELECT id, title, xp_reward 
      FROM quest_definitions 
      WHERE type = 'profile_update' 
      ORDER BY required_profile_completion ASC
      LIMIT 3
    `);

    if (quests.rows.length === 0) {
      console.log('No starter quests found to assign');
      return {
        success: false,
        message: 'No starter quests found'
      };
    }

    let assignedCount = 0;
    const currentWeek = getWeekNumber(new Date());
    const currentYear = new Date().getFullYear();

    // For each user
    for (const user of users.rows) {
      const userId = user.id;
      
      // Check if user already has quests
      const existingQuests = await executeQuery(`
        SELECT COUNT(*) FROM user_quests WHERE user_id = $1
      `, [userId]);
      
      if (parseInt(existingQuests.rows[0].count) > 0) {
        console.log(`User ${userId} already has quests assigned, skipping`);
        continue;
      }

      // Initialize user_xp record if it doesn't exist
      const userXp = await executeQuery(`
        SELECT id FROM user_xp WHERE user_id = $1
      `, [userId]);
      
      if (userXp.rows.length === 0) {
        await executeQuery(`
          INSERT INTO user_xp (user_id, balance, lifetime_earned) 
          VALUES ($1, 0, 0)
        `, [userId]);
        console.log(`Created XP record for user ${userId}`);
      }

      // Assign each starter quest to the user
      for (const quest of quests.rows) {
        await executeQuery(`
          INSERT INTO user_quests (
            user_id, quest_definition_id, status, progress, 
            assigned_at, week_number, year
          ) VALUES ($1, $2, 'active', 0, NOW(), $3, $4)
        `, [userId, quest.id, currentWeek, currentYear]);
        
        console.log(`Assigned quest "${quest.title}" to user ${userId}`);
        assignedCount++;
      }
      
      console.log(`Successfully assigned ${quests.rows.length} quests to user ${userId}`);
    }

    return {
      success: true,
      message: `Successfully assigned ${assignedCount} quests to ${users.rows.length} users`
    };
  } catch (error) {
    console.error('Error while assigning starter quests:', error);
    return {
      success: false,
      message: 'Error while assigning starter quests',
      error: String(error)
    };
  }
}

// Run the quest assignment script
assignStarterQuests()
  .then(result => {
    console.log('Result:', result);
    process.exit(0);
  })
  .catch(err => {
    console.error('Failed:', err);
    process.exit(1);
  });