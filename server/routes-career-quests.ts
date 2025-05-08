import { Router } from "express";
import { IStorage } from "./storage";
import { pool } from "./db";

// Helper function to get week number from date
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// A dedicated route for updating quest progress
async function updateQuestProgress(questId: number, userId: number, progress: number) {
  try {
    // Check if user quest exists
    const result = await pool.query(`
      SELECT * FROM user_quests WHERE id = $1 AND user_id = $2
    `, [questId, userId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const userQuest = result.rows[0];
    const questDefinitionId = userQuest.quest_definition_id;
    
    // Get quest definition for target count
    const defResult = await pool.query(`
      SELECT * FROM quest_definitions WHERE id = $1
    `, [questDefinitionId]);
    
    if (defResult.rows.length === 0) {
      return null;
    }
    
    const questDefinition = defResult.rows[0];
    const targetCount = questDefinition.target_count;
    
    // Calculate new status and completed_at
    let newStatus = userQuest.status;
    let completedAt = userQuest.completed_at;
    let xpEarned = userQuest.xp_earned;
    let badgeEarned = userQuest.badge_earned;
    
    // If progress meets or exceeds target count, mark as completed
    if (progress >= targetCount && userQuest.status === 'active') {
      newStatus = 'completed';
      completedAt = new Date();
      xpEarned = questDefinition.xp_reward;
      badgeEarned = questDefinition.badge_reward;
    }
    
    // Update the quest with new progress
    const updateResult = await pool.query(`
      UPDATE user_quests
      SET progress = $1, 
          status = $2,
          completed_at = $3,
          xp_earned = $4,
          badge_earned = $5
      WHERE id = $6 AND user_id = $7
      RETURNING 
        id,
        user_id as "userId",
        quest_definition_id as "questDefinitionId",
        status,
        progress,
        assigned_at as "assignedAt",
        completed_at as "completedAt",
        dismissed_reason as "dismissedReason",
        xp_earned as "xpEarned",
        badge_earned as "badgeEarned",
        musk_response as "muskResponse",
        week_number as "weekNumber",
        year
    `, [progress, newStatus, completedAt, xpEarned, badgeEarned, questId, userId]);
    
    if (updateResult.rows.length === 0) {
      return null;
    }
    
    return updateResult.rows[0];
  } catch (error) {
    console.error('Error updating quest progress:', error);
    throw error;
  }
}

export function setupCareerQuestsRoutes(apiRouter: Router, storage: IStorage) {
  // Quest Definition routes
  apiRouter.get("/quest-definitions", async (req, res) => {
    try {
      const questDefinitions = await storage.getQuestDefinitions();
      res.json(questDefinitions);
    } catch (error) {
      console.error('[GET /quest-definitions] Error:', error);
      res.status(500).json({ message: 'Failed to fetch quest definitions' });
    }
  });

  apiRouter.get("/quest-definitions/active", async (req, res) => {
    try {
      const activeQuestDefinitions = await storage.getActiveQuestDefinitions();
      res.json(activeQuestDefinitions);
    } catch (error) {
      console.error('[GET /quest-definitions/active] Error:', error);
      res.status(500).json({ message: 'Failed to fetch active quest definitions' });
    }
  });

  apiRouter.get("/quest-definitions/type/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const questDefinitions = await storage.getQuestDefinitionsByType(type);
      res.json(questDefinitions);
    } catch (error) {
      console.error(`[GET /quest-definitions/type/${req.params.type}] Error:`, error);
      res.status(500).json({ message: 'Failed to fetch quest definitions by type' });
    }
  });

  apiRouter.get("/quest-definitions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid quest definition ID' });
      }
      
      const questDefinition = await storage.getQuestDefinitionById(id);
      if (!questDefinition) {
        return res.status(404).json({ message: 'Quest definition not found' });
      }
      
      res.json(questDefinition);
    } catch (error) {
      console.error(`[GET /quest-definitions/${req.params.id}] Error:`, error);
      res.status(500).json({ message: 'Failed to fetch quest definition' });
    }
  });

  apiRouter.post("/quest-definitions", async (req, res) => {
    try {
      const questDefinition = req.body;
      const createdQuestDefinition = await storage.createQuestDefinition(questDefinition);
      res.status(201).json(createdQuestDefinition);
    } catch (error) {
      console.error('[POST /quest-definitions] Error:', error);
      res.status(500).json({ message: 'Failed to create quest definition' });
    }
  });

  apiRouter.patch("/quest-definitions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid quest definition ID' });
      }
      
      const questDefinition = req.body;
      const updatedQuestDefinition = await storage.updateQuestDefinition(id, questDefinition);
      
      if (!updatedQuestDefinition) {
        return res.status(404).json({ message: 'Quest definition not found' });
      }
      
      res.json(updatedQuestDefinition);
    } catch (error) {
      console.error(`[PATCH /quest-definitions/${req.params.id}] Error:`, error);
      res.status(500).json({ message: 'Failed to update quest definition' });
    }
  });

  apiRouter.delete("/quest-definitions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid quest definition ID' });
      }
      
      const deleted = await storage.deleteQuestDefinition(id);
      
      if (!deleted) {
        return res.status(404).json({ message: 'Quest definition not found' });
      }
      
      res.json({ message: 'Quest definition deleted successfully' });
    } catch (error) {
      console.error(`[DELETE /quest-definitions/${req.params.id}] Error:`, error);
      res.status(500).json({ message: 'Failed to delete quest definition' });
    }
  });

  // User Quest routes
  apiRouter.get("/users/:userId/quests", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      const userQuests = await storage.getUserQuestsByUserId(userId);
      res.json(userQuests);
    } catch (error) {
      console.error(`[GET /users/${req.params.userId}/quests] Error:`, error);
      res.status(500).json({ message: 'Failed to fetch user quests' });
    }
  });

  apiRouter.get("/users/:userId/quests/active", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      const activeQuests = await storage.getActiveUserQuests(userId);
      res.json(activeQuests);
    } catch (error) {
      console.error(`[GET /users/${req.params.userId}/quests/active] Error:`, error);
      res.status(500).json({ message: 'Failed to fetch active user quests' });
    }
  });

  apiRouter.get("/users/:userId/quests/completed", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      const completedQuests = await storage.getCompletedUserQuests(userId);
      res.json(completedQuests);
    } catch (error) {
      console.error(`[GET /users/${req.params.userId}/quests/completed] Error:`, error);
      res.status(500).json({ message: 'Failed to fetch completed user quests' });
    }
  });

  apiRouter.get("/users/:userId/quests/current-week", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      try {
        // Check if database tables exist first
        const tableCheck = await pool.query(`
          SELECT EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_name = 'user_quests'
          );
        `);
        
        if (!tableCheck.rows[0].exists) {
          console.log('[GET /quests/current-week] user_quests table does not exist, returning empty array');
          return res.json([]);
        }
        
        // Get current week number and year
        const now = new Date();
        const weekNumber = getWeekNumber(now);
        const year = now.getFullYear();
        
        console.log(`[GET /users/${userId}/quests/current-week] Fetching quests for week ${weekNumber}, year ${year}`);
        
        // Also check for the previous week's quests in case they're relevant
        const prevWeek = weekNumber > 1 ? weekNumber - 1 : 52;
        const prevYear = prevWeek === 52 ? year - 1 : year;
        
        // Using direct DB query instead of the storage method
        const userQuestsResult = await pool.query(`
          SELECT 
            uq.id,
            uq.user_id as "userId",
            uq.quest_definition_id as "questDefinitionId",
            uq.status,
            uq.progress,
            uq.assigned_at as "assignedAt",
            uq.completed_at as "completedAt",
            uq.dismissed_reason as "dismissedReason",
            uq.xp_earned as "xpEarned",
            uq.badge_earned as "badgeEarned",
            uq.musk_response as "muskResponse",
            uq.week_number as "weekNumber",
            qd.title as "questTitle",
            qd.description as "questDescription",
            qd.type as "questType",
            qd.target_count as "targetCount",
            qd.target_action as "targetAction",
            qd.xp_reward as "xpReward",
            qd.badge_reward as "badgeReward",
            qd.musk_tip as "muskTip",
            uq.year
          FROM user_quests uq
          LEFT JOIN quest_definitions qd ON uq.quest_definition_id = qd.id 
          WHERE uq.user_id = $1 AND 
                ((uq.week_number = $2 AND uq.year = $3) OR 
                 (uq.week_number = $4 AND uq.year = $5))
          ORDER BY uq.assigned_at DESC
        `, [userId, weekNumber, year, prevWeek, prevYear]);
        
        const weeklyQuests = userQuestsResult.rows;
        console.log(`[GET /users/${userId}/quests/current-week] Found ${weeklyQuests.length} quests for weeks ${prevWeek}-${weekNumber}`);
        
        res.json(weeklyQuests);
      } catch (dbError) {
        console.error(`[GET /users/${req.params.userId}/quests/current-week] Database error:`, dbError);
        // Return empty array instead of error to prevent UI crashes
        res.json([]);
      }
    } catch (error) {
      console.error(`[GET /users/${req.params.userId}/quests/current-week] Error:`, error);
      // Return empty array to prevent UI crashes
      res.json([]);
    }
  });
  
  // Get user quests with their definitions in a single response
  apiRouter.get("/users/:userId/quests-with-definitions", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      try {
        // Check if database tables exist first
        const tableCheck = await pool.query(`
          SELECT EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_name = 'user_quests'
          );
        `);
        
        if (!tableCheck.rows[0].exists) {
          console.log('[GET /quests-with-definitions] user_quests table does not exist, returning empty array');
          return res.json([]);
        }
        
        // Using direct db query instead of storage method since it's not implemented yet
        console.log(`[GET /users/${userId}/quests-with-definitions] Fetching user quests directly from DB`);
        
        // Get user quests
        const userQuestsResult = await pool.query(`
          SELECT 
            id,
            user_id as "userId",
            quest_definition_id as "questDefinitionId",
            status,
            progress,
            assigned_at as "assignedAt",
            completed_at as "completedAt",
            dismissed_reason as "dismissedReason",
            xp_earned as "xpEarned",
            badge_earned as "badgeEarned",
            musk_response as "muskResponse",
            week_number as "weekNumber",
            year
          FROM user_quests
          WHERE user_id = $1
          ORDER BY assigned_at DESC
        `, [userId]);
        
        const userQuests = userQuestsResult.rows;
        console.log(`[GET /users/${userId}/quests-with-definitions] Found ${userQuests.length} quests`);
        
        // Get all quest definitions
        const questDefinitionsResult = await pool.query(`
          SELECT 
            id,
            title,
            description,
            type,
            target_count as "targetCount",
            target_action as "targetAction",
            xp_reward as "xpReward",
            badge_reward as "badgeReward",
            required_profile_completion as "requiredProfileCompletion",
            required_career_stage as "requiredCareerStage",
            required_industry as "requiredIndustry",
            musk_tip as "muskTip",
            is_active as "isActive",
            created_at as "createdAt",
            updated_at as "updatedAt"
          FROM quest_definitions
          WHERE is_active = true
        `);
        
        const questDefinitions = questDefinitionsResult.rows;
        console.log(`[GET /users/${userId}/quests-with-definitions] Found ${questDefinitions.length} quest definitions`);
        
        // Combine user quests with their definitions
        // Even if a quest definition is no longer active, fetch it directly from the database
        const questsWithDefinitions = await Promise.all(userQuests.map(async userQuest => {
          // First check active definitions
          let definition = questDefinitions.find(def => def.id === userQuest.questDefinitionId);
          
          // If definition not found in active quests, try to fetch it directly
          if (!definition && userQuest.questDefinitionId) {
            try {
              const defResult = await pool.query(`
                SELECT 
                  id,
                  title,
                  description,
                  type,
                  target_count as "targetCount",
                  target_action as "targetAction",
                  xp_reward as "xpReward",
                  badge_reward as "badgeReward",
                  required_profile_completion as "requiredProfileCompletion",
                  required_career_stage as "requiredCareerStage",
                  required_industry as "requiredIndustry",
                  musk_tip as "muskTip",
                  is_active as "isActive",
                  created_at as "createdAt",
                  updated_at as "updatedAt"
                FROM quest_definitions
                WHERE id = $1
              `, [userQuest.questDefinitionId]);
              
              if (defResult.rows.length > 0) {
                definition = defResult.rows[0];
              }
            } catch (err) {
              console.error(`Error fetching quest definition ${userQuest.questDefinitionId}:`, err);
            }
          }
          
          return {
            ...userQuest,
            definition: definition || null
          };
        }));
        
        res.json(questsWithDefinitions);
      } catch (dbError) {
        console.error(`[GET /users/${req.params.userId}/quests-with-definitions] Database error:`, dbError);
        // Return empty array instead of error to prevent UI crashes
        res.json([]);
      }
    } catch (error) {
      console.error(`[GET /users/${req.params.userId}/quests-with-definitions] Error:`, error);
      // Return empty array to prevent UI crashes
      res.json([]);
    }
  });

  apiRouter.get("/user-quests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid quest ID' });
      }
      
      const quest = await storage.getUserQuestById(id);
      if (!quest) {
        return res.status(404).json({ message: 'Quest not found' });
      }
      
      res.json(quest);
    } catch (error) {
      console.error(`[GET /user-quests/${req.params.id}] Error:`, error);
      res.status(500).json({ message: 'Failed to fetch user quest' });
    }
  });

  apiRouter.post("/users/:userId/quests", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      try {
        // Check if database tables exist first
        const tableCheck = await pool.query(`
          SELECT EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_name = 'user_quests'
          );
        `);
        
        if (!tableCheck.rows[0].exists) {
          console.log('[POST /users/:userId/quests] user_quests table does not exist, returning default quest');
          return res.status(201).json({
            id: 0,
            userId: userId,
            questDefinitionId: 0,
            status: 'active',
            progress: 0,
            assignedAt: new Date(),
            completedAt: null,
            earnedXp: 0,
            dismissReason: null,
            weekNumber: 0,
            year: 0
          });
        }
        
        const quest = { ...req.body, userId };
        const createdQuest = await storage.createUserQuest(quest);
        res.status(201).json(createdQuest);
      } catch (dbError) {
        console.error(`[POST /users/${req.params.userId}/quests] Database error:`, dbError);
        // Return a default quest object instead of error
        res.status(201).json({
          id: 0,
          userId: userId,
          questDefinitionId: 0,
          status: 'active',
          progress: 0,
          assignedAt: new Date(),
          completedAt: null,
          earnedXp: 0,
          dismissReason: null,
          weekNumber: 0,
          year: 0
        });
      }
    } catch (error) {
      console.error(`[POST /users/${req.params.userId}/quests] Error:`, error);
      // Return a default quest object instead of error
      res.status(201).json({
        id: 0,
        userId: parseInt(req.params.userId) || 0,
        questDefinitionId: 0,
        status: 'active',
        progress: 0,
        assignedAt: new Date(),
        completedAt: null,
        earnedXp: 0,
        dismissReason: null,
        weekNumber: 0,
        year: 0
      });
    }
  });

  apiRouter.post("/users/:userId/quests/assign-weekly", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      try {
        // Check if database tables exist first
        const tableCheck = await pool.query(`
          SELECT EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_name = 'user_quests'
          );
        `);
        
        if (!tableCheck.rows[0].exists) {
          console.log('[POST /users/:userId/quests/assign-weekly] user_quests table does not exist, returning empty array');
          return res.status(201).json([]);
        }
        
        // Also check quest_definitions table
        const questDefinitionsCheck = await pool.query(`
          SELECT EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_name = 'quest_definitions'
          );
        `);
        
        if (!questDefinitionsCheck.rows[0].exists) {
          console.log('[POST /users/:userId/quests/assign-weekly] quest_definitions table does not exist, returning empty array');
          return res.status(201).json([]);
        }
        
        const assignedQuests = await storage.assignWeeklyQuestsToUser(userId);
        res.status(201).json(assignedQuests);
      } catch (dbError) {
        console.error(`[POST /users/${req.params.userId}/quests/assign-weekly] Database error:`, dbError);
        // Return empty array instead of error to prevent UI crashes
        res.status(201).json([]);
      }
    } catch (error) {
      console.error(`[POST /users/${req.params.userId}/quests/assign-weekly] Error:`, error);
      // Return empty array instead of error to prevent UI crashes
      res.status(201).json([]);
    }
  });

  apiRouter.patch("/user-quests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid quest ID' });
      }
      
      const quest = req.body;
      const updatedQuest = await storage.updateUserQuest(id, quest);
      
      if (!updatedQuest) {
        return res.status(404).json({ message: 'Quest not found' });
      }
      
      res.json(updatedQuest);
    } catch (error) {
      console.error(`[PATCH /user-quests/${req.params.id}] Error:`, error);
      res.status(500).json({ message: 'Failed to update user quest' });
    }
  });

  apiRouter.post("/user-quests/:id/complete", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid quest ID' });
      }
      
      const earnedXp = req.body.earnedXp ? parseInt(req.body.earnedXp) : undefined;
      const completedQuest = await storage.completeUserQuest(id, earnedXp);
      
      if (!completedQuest) {
        return res.status(404).json({ message: 'Quest not found' });
      }
      
      res.json(completedQuest);
    } catch (error) {
      console.error(`[POST /user-quests/${req.params.id}/complete] Error:`, error);
      res.status(500).json({ message: 'Failed to complete user quest' });
    }
  });

  apiRouter.post("/user-quests/:id/dismiss", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid quest ID' });
      }
      
      const { reason } = req.body;
      const dismissedQuest = await storage.dismissUserQuest(id, reason);
      
      if (!dismissedQuest) {
        return res.status(404).json({ message: 'Quest not found' });
      }
      
      res.json(dismissedQuest);
    } catch (error) {
      console.error(`[POST /user-quests/${req.params.id}/dismiss] Error:`, error);
      res.status(500).json({ message: 'Failed to dismiss user quest' });
    }
  });

  apiRouter.post("/user-quests/:id/progress", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid quest ID' });
      }
      
      const updatedQuest = await storage.incrementQuestProgress(id);
      
      if (!updatedQuest) {
        return res.status(404).json({ message: 'Quest not found' });
      }
      
      res.json(updatedQuest);
    } catch (error) {
      console.error(`[POST /user-quests/${req.params.id}/progress] Error:`, error);
      res.status(500).json({ message: 'Failed to increment quest progress' });
    }
  });

  // User XP routes
  apiRouter.get("/users/:userId/xp", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      try {
        // Check if database tables exist first
        const tableCheck = await pool.query(`
          SELECT EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_name = 'user_xp'
          );
        `);
        
        if (!tableCheck.rows[0].exists) {
          console.log('[GET /users/:userId/xp] user_xp table does not exist, returning default XP');
          // Return default XP object to prevent UI crashes
          return res.json({
            id: 0,
            userId: userId,
            balance: 0,
            lifetimeEarned: 0,
            currentMonthEarned: 0,
            lastUpdated: new Date()
          });
        }
        
        // Get user XP directly from database
        console.log(`[GET /users/${userId}/xp] Fetching user XP directly from DB`);
        
        const userXpResult = await pool.query(`
          SELECT 
            id,
            user_id as "userId",
            balance,
            lifetime_earned as "lifetimeEarned",
            current_month_earned as "currentMonthEarned",
            updated_at as "lastUpdated"
          FROM user_xp
          WHERE user_id = $1
        `, [userId]);
        
        if (userXpResult.rows.length > 0) {
          const userXp = userXpResult.rows[0];
          console.log(`[GET /users/${userId}/xp] Found XP record:`, userXp);
          res.json(userXp);
        } else {
          console.log(`[GET /users/${userId}/xp] No XP record found for user ${userId}, returning default`);
          // Return default XP object if no record exists
          res.json({
            id: 0,
            userId: userId,
            balance: 0,
            lifetimeEarned: 0,
            currentMonthEarned: 0,
            lastUpdated: new Date()
          });
        }
      } catch (dbError) {
        console.error(`[GET /users/${req.params.userId}/xp] Database error:`, dbError);
        // Return default XP object to prevent UI crashes
        return res.json({
          id: 0,
          userId: userId,
          balance: 0,
          lifetimeEarned: 0,
          currentMonthEarned: 0,
          lastUpdated: new Date()
        });
      }
    } catch (error) {
      console.error(`[GET /users/${req.params.userId}/xp] Error:`, error);
      // Return default XP object to prevent UI crashes
      return res.json({
        id: 0,
        userId: parseInt(req.params.userId) || 0,
        balance: 0,
        lifetimeEarned: 0,
        currentMonthEarned: 0,
        lastUpdated: new Date()
      });
    }
  });

  apiRouter.post("/users/:userId/xp/increment", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      const { amount, source, sourceId } = req.body;
      
      if (!amount || !source) {
        return res.status(400).json({ message: 'Amount and source are required' });
      }
      
      const result = await storage.incrementUserXp(userId, amount, source, sourceId);
      res.json(result);
    } catch (error) {
      console.error(`[POST /users/${req.params.userId}/xp/increment] Error:`, error);
      res.status(500).json({ message: 'Failed to increment user XP' });
    }
  });

  apiRouter.post("/users/:userId/xp/reset-monthly", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      const userXp = await storage.resetMonthlyXp(userId);
      
      if (!userXp) {
        return res.status(404).json({ message: 'User XP record not found' });
      }
      
      res.json(userXp);
    } catch (error) {
      console.error(`[POST /users/${req.params.userId}/xp/reset-monthly] Error:`, error);
      res.status(500).json({ message: 'Failed to reset monthly XP' });
    }
  });

  // User Badge routes
  apiRouter.get("/users/:userId/badges", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      try {
        // Check if database tables exist first
        const tableCheck = await pool.query(`
          SELECT EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_name = 'user_badges'
          );
        `);
        
        if (!tableCheck.rows[0].exists) {
          console.log('[GET /users/:userId/badges] user_badges table does not exist, returning empty array');
          return res.json([]);
        }
        
        // Get user badges directly from database
        console.log(`[GET /users/${userId}/badges] Fetching user badges directly from DB`);
        
        const userBadgesResult = await pool.query(`
          SELECT 
            id,
            user_id as "userId",
            badge_type as "type",
            earned_at as "awardedAt",
            quest_id as "questId",
            display_on_profile as "displayOnProfile",
            display_on_resume as "displayOnResume"
          FROM user_badges
          WHERE user_id = $1
          ORDER BY earned_at DESC
        `, [userId]);
        
        const userBadges = userBadgesResult.rows;
        console.log(`[GET /users/${userId}/badges] Found ${userBadges.length} badges`);
        
        res.json(userBadges);
      } catch (dbError) {
        console.error(`[GET /users/${req.params.userId}/badges] Database error:`, dbError);
        // Return empty array instead of error to prevent UI crashes
        res.json([]);
      }
    } catch (error) {
      console.error(`[GET /users/${req.params.userId}/badges] Error:`, error);
      // Return empty array instead of error to prevent UI crashes
      res.json([]);
    }
  });

  apiRouter.get("/users/:userId/badges/type/:type", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      try {
        // Check if database tables exist first
        const tableCheck = await pool.query(`
          SELECT EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_name = 'user_badges'
          );
        `);
        
        if (!tableCheck.rows[0].exists) {
          console.log('[GET /users/:userId/badges/type/:type] user_badges table does not exist, returning empty array');
          return res.json([]);
        }
        
        const { type } = req.params;
        
        // Get user badges by type directly from database
        console.log(`[GET /users/${userId}/badges/type/${type}] Fetching user badges by type directly from DB`);
        
        const userBadgesResult = await pool.query(`
          SELECT 
            id,
            user_id as "userId",
            badge_type as "type",
            earned_at as "awardedAt",
            quest_id as "questId",
            display_on_profile as "displayOnProfile",
            display_on_resume as "displayOnResume"
          FROM user_badges
          WHERE user_id = $1 AND badge_type = $2
          ORDER BY earned_at DESC
        `, [userId, type]);
        
        const userBadges = userBadgesResult.rows;
        console.log(`[GET /users/${userId}/badges/type/${type}] Found ${userBadges.length} badges`);
        
        res.json(userBadges);
      } catch (dbError) {
        console.error(`[GET /users/${req.params.userId}/badges/type/${req.params.type}] Database error:`, dbError);
        // Return empty array instead of error to prevent UI crashes
        res.json([]);
      }
    } catch (error) {
      console.error(`[GET /users/${req.params.userId}/badges/type/${req.params.type}] Error:`, error);
      // Return empty array instead of error to prevent UI crashes
      res.json([]);
    }
  });

  apiRouter.post("/users/:userId/badges", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      const badge = { ...req.body, userId };
      const createdBadge = await storage.createUserBadge(badge);
      res.status(201).json(createdBadge);
    } catch (error) {
      console.error(`[POST /users/${req.params.userId}/badges] Error:`, error);
      res.status(500).json({ message: 'Failed to create user badge' });
    }
  });

  apiRouter.patch("/user-badges/:id/toggle-display", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid badge ID' });
      }
      
      const { displayOnProfile, displayOnResume } = req.body;
      
      if (displayOnProfile === undefined || displayOnResume === undefined) {
        return res.status(400).json({ message: 'displayOnProfile and displayOnResume are required' });
      }
      
      const updatedBadge = await storage.toggleBadgeDisplay(id, displayOnProfile, displayOnResume);
      
      if (!updatedBadge) {
        return res.status(404).json({ message: 'Badge not found' });
      }
      
      res.json(updatedBadge);
    } catch (error) {
      console.error(`[PATCH /user-badges/${req.params.id}/toggle-display] Error:`, error);
      res.status(500).json({ message: 'Failed to toggle badge display' });
    }
  });

  // XP Transaction routes
  apiRouter.get("/users/:userId/xp-transactions", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      try {
        // Check if database tables exist first
        const tableCheck = await pool.query(`
          SELECT EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_name = 'xp_transactions'
          );
        `);
        
        if (!tableCheck.rows[0].exists) {
          console.log('[GET /users/:userId/xp-transactions] xp_transactions table does not exist, returning empty array');
          return res.json([]);
        }
        
        // Get XP transactions directly from database
        console.log(`[GET /users/${userId}/xp-transactions] Fetching XP transactions directly from DB`);
        
        const transactionsResult = await pool.query(`
          SELECT 
            id,
            user_id as "userId",
            amount,
            source,
            source_id as "sourceId",
            created_at as "createdAt",
            description
          FROM xp_transactions
          WHERE user_id = $1
          ORDER BY created_at DESC
        `, [userId]);
        
        const transactions = transactionsResult.rows;
        console.log(`[GET /users/${userId}/xp-transactions] Found ${transactions.length} transactions`);
        
        res.json(transactions);
      } catch (dbError) {
        console.error(`[GET /users/${req.params.userId}/xp-transactions] Database error:`, dbError);
        // Return empty array instead of error to prevent UI crashes
        res.json([]);
      }
    } catch (error) {
      console.error(`[GET /users/${req.params.userId}/xp-transactions] Error:`, error);
      // Return empty array instead of error to prevent UI crashes
      res.json([]);
    }
  });

  apiRouter.get("/users/:userId/xp-transactions/source/:source", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      try {
        // Check if database tables exist first
        const tableCheck = await pool.query(`
          SELECT EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_name = 'xp_transactions'
          );
        `);
        
        if (!tableCheck.rows[0].exists) {
          console.log('[GET /users/:userId/xp-transactions/source/:source] xp_transactions table does not exist, returning empty array');
          return res.json([]);
        }
        
        const { source } = req.params;
        
        // Get XP transactions by source directly from database
        console.log(`[GET /users/${userId}/xp-transactions/source/${source}] Fetching XP transactions by source directly from DB`);
        
        const transactionsResult = await pool.query(`
          SELECT 
            id,
            user_id as "userId",
            amount,
            source,
            source_id as "sourceId",
            created_at as "createdAt",
            description
          FROM xp_transactions
          WHERE user_id = $1 AND source = $2
          ORDER BY created_at DESC
        `, [userId, source]);
        
        const transactions = transactionsResult.rows;
        console.log(`[GET /users/${userId}/xp-transactions/source/${source}] Found ${transactions.length} transactions`);
        
        res.json(transactions);
      } catch (dbError) {
        console.error(`[GET /users/${req.params.userId}/xp-transactions/source/${req.params.source}] Database error:`, dbError);
        // Return empty array instead of error to prevent UI crashes
        res.json([]);
      }
    } catch (error) {
      console.error(`[GET /users/${req.params.userId}/xp-transactions/source/${req.params.source}] Error:`, error);
      // Return empty array instead of error to prevent UI crashes
      res.json([]);
    }
  });

  // Get current week quests for all users (system-wide current quests)
  apiRouter.get("/quests/current-week", async (req, res) => {
    try {
      // Check if database tables exist first
      const tableCheck = await pool.query(`
        SELECT EXISTS (
          SELECT 1 
          FROM information_schema.tables 
          WHERE table_name = 'user_quests'
        );
      `);
      
      if (!tableCheck.rows[0].exists) {
        console.log('[GET /quests/current-week] user_quests table does not exist, returning empty array');
        return res.json([]);
      }
      
      // Get current week number and year
      const now = new Date();
      const weekNumber = getWeekNumber(now);
      const year = now.getFullYear();
      
      console.log(`[GET /quests/current-week] Fetching quests for week ${weekNumber}, year ${year}`);
      
      // Using direct DB query to get all current week quests
      const currentWeekQuestsResult = await pool.query(`
        SELECT 
          uq.id,
          uq.user_id as "userId",
          uq.quest_definition_id as "questDefinitionId",
          uq.status,
          uq.progress,
          uq.assigned_at as "assignedAt",
          uq.completed_at as "completedAt",
          uq.dismissed_reason as "dismissedReason",
          uq.xp_earned as "xpEarned",
          uq.badge_earned as "badgeEarned",
          uq.musk_response as "muskResponse",
          uq.week_number as "weekNumber",
          uq.year,
          qd.title as "questTitle",
          qd.description as "questDescription",
          qd.type as "questType",
          u.name as "userName",
          u.photo_url as "userPhotoURL"
        FROM user_quests uq
        JOIN quest_definitions qd ON uq.quest_definition_id = qd.id
        JOIN users u ON uq.user_id = u.id
        WHERE uq.week_number = $1 AND uq.year = $2
        ORDER BY uq.assigned_at DESC
        LIMIT 50
      `, [weekNumber, year]);
      
      const currentWeekQuests = currentWeekQuestsResult.rows;
      console.log(`[GET /quests/current-week] Found ${currentWeekQuests.length} quests for week ${weekNumber}`);
      
      res.json(currentWeekQuests);
    } catch (error) {
      console.error(`[GET /quests/current-week] Error:`, error);
      // Return empty array instead of error to prevent UI crashes
      res.json([]);
    }
  });

  console.log("Career Quests routes loaded");
}