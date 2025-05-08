import { Router } from "express";
import { IStorage } from "./storage";
import { pool } from "./db";
import { suggestHashtags } from './services/openai-service';

// Helper function to get week number from date
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// Import the service function instead of duplicating code
import { updateQuestProgress as serviceUpdateQuestProgress } from './services/quest-progress-service';

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
  
  // Update quest progress
  apiRouter.patch("/users/:userId/quests/:questId/progress", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const questId = parseInt(req.params.questId);
      const { progress } = req.body;
      
      if (isNaN(userId) || isNaN(questId)) {
        return res.status(400).json({ message: 'Invalid user ID or quest ID' });
      }
      
      if (typeof progress !== 'number' || progress < 0) {
        return res.status(400).json({ message: 'Invalid progress value' });
      }
      
      console.log(`[PATCH /users/${userId}/quests/${questId}/progress] Updating progress to ${progress}`);
      
      const updatedQuest = await serviceUpdateQuestProgress(questId, userId, progress);
      
      if (!updatedQuest) {
        return res.status(404).json({ message: 'Quest not found' });
      }
      
      res.json(updatedQuest);
    } catch (error) {
      console.error(`[PATCH /users/${req.params.userId}/quests/${req.params.questId}/progress] Error:`, error);
      res.status(500).json({ message: 'Failed to update quest progress' });
    }
  });

  apiRouter.get("/users/:userId/quests/current-week", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        console.log(`[GET /users/current-week] Invalid user ID: ${req.params.userId}`);
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
        
        // First, let's mark any expired active quests with expired status
        // These would be quests from the previous week that weren't completed
        try {
          const markExpiredResult = await pool.query(`
            UPDATE user_quests 
            SET status = 'expired'
            WHERE user_id = $1 
            AND status = 'active'
            AND week_number = $2 
            AND year = $3
            AND progress < (
              SELECT target_count 
              FROM quest_definitions 
              WHERE id = user_quests.quest_definition_id
            )
            RETURNING id
          `, [userId, prevWeek, prevYear]);
          
          const rowCount = markExpiredResult.rowCount || 0;
          if (rowCount > 0) {
            console.log(`[GET /users/${userId}/quests/current-week] Marked ${rowCount} expired quests as expired`);
          }
        } catch (markError) {
          console.error(`[GET /users/${userId}/quests/current-week] Error marking expired quests:`, markError);
          // Continue with the request even if this part fails
        }
        
        // Now get the quests with their updated status
        try {
          const userQuestsResult = await pool.query(`
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
            JOIN quest_definitions qd ON uq.quest_definition_id = qd.id 
            WHERE uq.user_id = $1 AND 
                  ((uq.week_number = $2 AND uq.year = $3) OR 
                   (uq.week_number = $4 AND uq.year = $5))
            ORDER BY uq.assigned_at DESC
          `, [userId, weekNumber, year, prevWeek, prevYear]);
          
          const weeklyQuests = userQuestsResult.rows;
          console.log(`[GET /users/${userId}/quests/current-week] Found ${weeklyQuests.length} quests for weeks ${prevWeek}-${weekNumber}`);
          
          // Filter out any quests with missing definition data
          const validQuests = weeklyQuests.filter(quest => quest.questTitle && quest.targetCount);
          
          if (validQuests.length < weeklyQuests.length) {
            console.log(`[GET /users/${userId}/quests/current-week] Filtered out ${weeklyQuests.length - validQuests.length} quests with missing definition data`);
          }
          
          res.json(validQuests);
        } catch (queryError) {
          console.error(`[GET /users/${userId}/quests/current-week] Query error:`, queryError);
          res.json([]);
        }
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
        console.log(`[GET /users/quests-with-definitions] Invalid user ID: ${req.params.userId}`);
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
        
        // Get current week number and year
        const now = new Date();
        const weekNumber = getWeekNumber(now);
        const year = now.getFullYear();
        
        // Previous week (to mark expired quests)
        const prevWeek = weekNumber > 1 ? weekNumber - 1 : 52;
        const prevYear = prevWeek === 52 ? year - 1 : year;
        
        // Mark any expired active quests from previous weeks as expired
        try {
          const markExpiredResult = await pool.query(`
            UPDATE user_quests 
            SET status = 'expired'
            WHERE user_id = $1 
            AND status = 'active'
            AND (week_number < $2 OR (week_number = $2 AND year < $3))
            AND progress < (
              SELECT target_count 
              FROM quest_definitions 
              WHERE id = user_quests.quest_definition_id
            )
            RETURNING id
          `, [userId, weekNumber, year]);
          
          const rowCount = markExpiredResult.rowCount || 0;
          if (rowCount > 0) {
            console.log(`[GET /users/${userId}/quests-with-definitions] Marked ${rowCount} expired quests as expired`);
          }
        } catch (markError) {
          console.error(`[GET /users/${userId}/quests-with-definitions] Error marking expired quests:`, markError);
          // Continue with the request even if this part fails
        }
        
        // Using direct db query but with a JOIN to get all data in one query
        // This is much more efficient than separate queries and Promise.all
        console.log(`[GET /users/${userId}/quests-with-definitions] Fetching quests with JOIN`);
        
        try {
          const combinedResult = await pool.query(`
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
              qd.id as "defId",
              qd.title,
              qd.description,
              qd.type,
              qd.target_count as "targetCount",
              qd.target_action as "targetAction",
              qd.xp_reward as "xpReward",
              qd.badge_reward as "badgeReward",
              qd.required_profile_completion as "requiredProfileCompletion",
              qd.required_career_stage as "requiredCareerStage",
              qd.required_industry as "requiredIndustry",
              qd.musk_tip as "muskTip",
              qd.is_active as "isActive",
              qd.created_at as "createdAt",
              qd.updated_at as "updatedAt"
            FROM user_quests uq
            LEFT JOIN quest_definitions qd ON uq.quest_definition_id = qd.id
            WHERE uq.user_id = $1
            ORDER BY uq.assigned_at DESC
          `, [userId]);
          
          // Process the results
          const questsWithDefinitions = combinedResult.rows.map(row => {
            // If we have definition data, structure it
            let definition = null;
            if (row.defId) {
              definition = {
                id: row.defId,
                title: row.title,
                description: row.description,
                type: row.type,
                targetCount: row.targetCount,
                targetAction: row.targetAction,
                xpReward: row.xpReward,
                badgeReward: row.badgeReward,
                requiredProfileCompletion: row.requiredProfileCompletion,
                requiredCareerStage: row.requiredCareerStage,
                requiredIndustry: row.requiredIndustry,
                muskTip: row.muskTip,
                isActive: row.isActive,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt
              };
            }
            
            // Return the quest with its definition
            return {
              id: row.id,
              userId: row.userId,
              questDefinitionId: row.questDefinitionId,
              status: row.status,
              progress: row.progress,
              assignedAt: row.assignedAt,
              completedAt: row.completedAt,
              dismissedReason: row.dismissedReason,
              xpEarned: row.xpEarned,
              badgeEarned: row.badgeEarned,
              muskResponse: row.muskResponse,
              weekNumber: row.weekNumber,
              year: row.year,
              definition: definition
            };
          });
          
          console.log(`[GET /users/${userId}/quests-with-definitions] Found ${questsWithDefinitions.length} quests with definitions`);
          res.json(questsWithDefinitions);
        } catch (queryError) {
          console.error(`[GET /users/${userId}/quests-with-definitions] Query error:`, queryError);
          res.json([]);
        }
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

  // Quest dismissal endpoint removed per simplification requirements

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

  // Monthly XP reset endpoint removed per simplification requirements

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

  // Hashtag suggestions for quests endpoint
  apiRouter.get("/quests/suggest-hashtags", async (req, res) => {
    try {
      const { industry, domain, targetAction, questTitle } = req.query;
      
      if (!industry && !domain && !questTitle) {
        return res.status(400).json({ 
          error: 'Please provide at least one of: industry, domain, or questTitle for context' 
        });
      }
      
      // Create content context from quest information
      let contentContext = "Suggesting hashtags for completing a career-building activity: ";
      
      if (questTitle) {
        contentContext += `${questTitle}. `;
      }
      
      if (targetAction) {
        contentContext += `This involves ${targetAction.toString().replace(/_/g, ' ')}. `;
      }
      
      const result = await suggestHashtags({
        industry: industry as string,
        domain: domain as string,
        contentContext,
        count: 5 // Limit to 5 hashtags for UI display
      });
      
      res.json(result);
    } catch (error) {
      console.error('[GET /quests/suggest-hashtags] Error generating hashtag suggestions:', error);
      res.status(500).json({ 
        error: 'Failed to generate hashtag suggestions',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  console.log("Career Quests routes loaded");
}