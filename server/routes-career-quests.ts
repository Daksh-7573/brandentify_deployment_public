import { Router } from "express";
import { IStorage } from "./storage";
import { pool, db, sql } from "./db";
import { suggestHashtags } from './services/openai-service';
import { 
  generateIntelligentCareerQuests, 
  calculateProfileCompletion,
  PersonalizedQuest
} from './services/intelligent-career-quest-generator';

// Helper function to get week number from date
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// Import the service function instead of duplicating code
import { updateQuestProgress as serviceUpdateQuestProgress } from './services/quest-progress-service';

// Import social quest template engine
import { socialQuestTemplateEngine } from './services/social-quest-template-engine';

export function setupCareerQuestsRoutes(apiRouter: Router, storage: IStorage) {
  // Quest Definition routes
  apiRouter.get("/quest-definitions", async (req, res) => {
    try {
      const questDefinitions = await storage.getAllQuestDefinitions();
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
        // Get user profile data for intelligent quest generation
        const userData = await storage.getUser(userId);
        if (!userData) {
          console.log(`[GET /users/${userId}/quests/current-week] User not found`);
          return res.status(404).json({ message: 'User not found' });
        }

        // Get user's additional profile data
        const [skills, experiences, educations, projects] = await Promise.all([
          storage.getSkillsByUserId(userId),
          storage.getWorkExperiencesByUserId(userId), 
          storage.getEducationsByUserId(userId),
          storage.getProjectsByUserId(userId)
        ]);

        // Calculate profile completion and generate intelligent quests
        const profileCompletion = calculateProfileCompletion(userData, skills, experiences, educations, projects);
        const intelligentQuests = generateIntelligentCareerQuests(userData, skills, experiences, educations, projects);

        console.log(`[GET /users/${userId}/quests/current-week] Profile completion: ${profileCompletion.percentage}%`);
        console.log(`[GET /users/${userId}/quests/current-week] Generated ${intelligentQuests.length} intelligent quests`);

        // Convert PersonalizedQuest to format expected by frontend
        const formattedQuests = intelligentQuests.map((quest: PersonalizedQuest, index: number) => ({
          id: Date.now() + index, // Temporary ID for frontend
          userId: userId,
          questDefinitionId: index + 1000, // Temporary ID
          status: 'active',
          progress: 0,
          assignedAt: new Date().toISOString(),
          completedAt: null,
          xpEarned: null,
          badgeEarned: null,
          weekNumber: getWeekNumber(new Date()),
          year: new Date().getFullYear(),
          // Quest definition fields
          title: quest.title,
          description: quest.description,
          questType: quest.type,
          targetCount: 1,
          targetAction: quest.targetAction,
          xpReward: quest.xpReward,
          badgeReward: null,
          muskTip: `💡 Smart Tip: ${quest.mediaSpecific}`,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          // Additional intelligent fields
          mediaSpecific: quest.mediaSpecific,
          priority: quest.priority,
          difficulty: quest.difficulty
        }));

        // Also get existing database quests if any
        const tableCheck = await db.execute(sql`
          SELECT EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_name = 'user_quests'
          )
        `);
        
        let dbQuests: any[] = [];
        if (tableCheck.rows[0].exists) {
          // Get current week number and year
          const now = new Date();
          const weekNumber = getWeekNumber(now);
          const year = now.getFullYear();
          
          console.log(`[GET /users/${userId}/quests/current-week] Also fetching existing DB quests for week ${weekNumber}, year ${year}`);
          
          // Also check for the previous week's quests in case they're relevant
          const prevWeek = weekNumber > 1 ? weekNumber - 1 : 52;
          const prevYear = prevWeek === 52 ? year - 1 : year;
        
        // First, let's mark any expired active quests with expired status
        // These would be quests from the previous week that weren't completed
        try {
          const markExpiredResult = await db.execute(sql`
            UPDATE user_quests 
            SET status = 'expired'
            WHERE user_id = ${userId} 
            AND status = 'active'
            AND week_number = ${prevWeek} 
            AND year = ${prevYear}
            AND progress < (
              SELECT target_count 
              FROM quest_definitions 
              WHERE id = user_quests.quest_definition_id
            )
            RETURNING id
          `);
          
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
          const userQuestsResult = await db.execute(sql`
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
            WHERE uq.user_id = ${userId} AND 
                  ((uq.week_number = ${weekNumber} AND uq.year = ${year}) OR 
                   (uq.week_number = ${prevWeek} AND uq.year = ${prevYear}))
            ORDER BY uq.assigned_at DESC
          `);
          
          const weeklyQuests = userQuestsResult.rows;
          console.log(`[GET /users/${userId}/quests/current-week] Found ${weeklyQuests.length} quests for weeks ${prevWeek}-${weekNumber}`);
          
          // Filter out any quests with missing definition data
          const validQuests = weeklyQuests.filter(quest => quest.questTitle && quest.targetCount);
          
          if (validQuests.length < weeklyQuests.length) {
            console.log(`[GET /users/${userId}/quests/current-week] Filtered out ${weeklyQuests.length - validQuests.length} quests with missing definition data`);
          }
          
          dbQuests = validQuests;
        } catch (queryError) {
          console.error(`[GET /users/${userId}/quests/current-week] Query error:`, queryError);
          dbQuests = [];
        }
      }

      // Combine intelligent quests with existing database quests
      // Prioritize database quests if they exist, especially active ones
      const activeDbQuests = dbQuests.filter(q => q.status === 'active');
      const completedDbQuests = dbQuests.filter(q => q.status === 'completed');
      
      // If we have active database quests, prioritize them over intelligent quests
      const allQuests = activeDbQuests.length > 0 
        ? [...activeDbQuests, ...completedDbQuests]
        : [...formattedQuests, ...completedDbQuests];

      console.log(`[GET /users/${userId}/quests/current-week] Returning ${allQuests.length} total quests (${formattedQuests.length} intelligent + ${completedDbQuests.length} completed DB quests)`);
      
      res.json(allQuests);
      } catch (error) {
        console.error(`[GET /users/${userId}/quests/current-week] Error generating intelligent quests:`, error);
        // Fallback to empty array
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
        const tableCheck = await db.execute(sql`
          SELECT EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_name = 'user_quests'
          )
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
          const markExpiredResult = await db.execute(sql`
            UPDATE user_quests 
            SET status = 'expired'
            WHERE user_id = ${userId} 
            AND status = 'active'
            AND (week_number < ${weekNumber} OR (week_number = ${weekNumber} AND year < ${year}))
            AND progress < (
              SELECT target_count 
              FROM quest_definitions 
              WHERE id = user_quests.quest_definition_id
            )
            RETURNING id
          `);
          
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
          const combinedResult = await db.execute(sql`
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
            WHERE uq.user_id = ${userId}
            ORDER BY uq.assigned_at DESC
          `);
          
          // Process the results
          const questsWithDefinitions = combinedResult.rows.map((row: any) => {
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
        const tableCheck = await db.execute(sql`
          SELECT EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_name = 'user_quests'
          )
        `);
        
        if (!tableCheck[0].exists) {
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
        const tableCheck = await db.execute(sql`
          SELECT EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_name = 'user_quests'
          )
        `);
        
        if (!tableCheck.rows[0].exists) {
          console.log('[POST /users/:userId/quests/assign-weekly] user_quests table does not exist, returning empty array');
          return res.status(201).json([]);
        }
        
        // Also check quest_definitions table
        const questDefinitionsCheck = await db.execute(sql`
          SELECT EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_name = 'quest_definitions'
          )
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

  // Daily quest assignment route
  apiRouter.post("/users/:userId/quests/assign-daily", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      try {
        // Check if database tables exist first
        const tableCheck = await db.execute(sql`
          SELECT EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_name = 'user_quests'
          )
        `);
        
        if (!tableCheck.rows[0].exists) {
          console.log('[POST /users/:userId/quests/assign-daily] user_quests table does not exist, returning empty array');
          return res.status(201).json([]);
        }
        
        // Also check quest_definitions table
        const questDefinitionsCheck = await db.execute(sql`
          SELECT EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_name = 'quest_definitions'
          )
        `);
        
        if (!questDefinitionsCheck.rows[0].exists) {
          console.log('[POST /users/:userId/quests/assign-daily] quest_definitions table does not exist, returning empty array');
          return res.status(201).json([]);
        }
        
        const assignedQuests = await storage.assignDailyQuestsToUser(userId);
        res.status(201).json(assignedQuests);
      } catch (dbError) {
        console.error(`[POST /users/${req.params.userId}/quests/assign-daily] Database error:`, dbError);
        // Return empty array instead of error to prevent UI crashes
        res.status(201).json([]);
      }
    } catch (error) {
      console.error(`[POST /users/${req.params.userId}/quests/assign-daily] Error:`, error);
      // Return empty array instead of error to prevent UI crashes
      res.status(201).json([]);
    }
  });

  // Route to get quests by bucket (daily/completed/missed)
  apiRouter.get("/users/:userId/quests/bucket/:bucket", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const bucket = req.params.bucket as 'daily' | 'completed' | 'missed';
      
      if (!userId || isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      if (!['daily', 'completed', 'missed'].includes(bucket)) {
        return res.status(400).json({ error: 'Invalid bucket type' });
      }

      let quests: any[] = [];

      if (bucket === 'daily') {
        // Get today's active quests (note: will need to add definitions separately)
        quests = await storage.getCurrentDayUserQuests(userId);
      } else if (bucket === 'completed') {
        // Get completed user quests with definitions
        quests = await storage.getCompletedUserQuestsWithDefinitions(userId);
      } else if (bucket === 'missed') {
        // Get all user quests (without definitions for now) and filter by expired/dismissed status
        const allQuests = await storage.getUserQuestsByUserId(userId);
        quests = allQuests.filter((q: any) => q.status === 'expired' || q.status === 'dismissed');
      }

      res.json(quests || []);
    } catch (error) {
      console.error('Error fetching bucket quests:', error);
      res.status(500).json({ error: 'Failed to fetch bucket quests' });
    }
  });

  // Route to get social quests by bucket (daily/completed/missed)
  apiRouter.get("/users/:userId/social-quests/bucket/:bucket", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const bucket = req.params.bucket as 'daily' | 'completed' | 'missed';
      
      if (!userId || isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      if (!['daily', 'completed', 'missed'].includes(bucket)) {
        return res.status(400).json({ error: 'Invalid bucket type' });
      }

      let quests: any[] = [];

      if (bucket === 'daily') {
        // Get today's active social quests (note: will need to add definitions separately)
        quests = await storage.getCurrentDaySocialQuests(userId);
      } else if (bucket === 'completed') {
        // Get all user social quests with definitions and filter by completed status
        const allQuests = await storage.getUserSocialQuestsWithDefinitions(userId);
        quests = allQuests.filter((q: any) => q.status === 'completed');
      } else if (bucket === 'missed') {
        // Get all user social quests with definitions and filter by expired/dismissed status
        const allQuests = await storage.getUserSocialQuestsWithDefinitions(userId);
        quests = allQuests.filter((q: any) => q.status === 'expired' || q.status === 'dismissed');
      }

      res.json(quests || []);
    } catch (error) {
      console.error('Error fetching social bucket quests:', error);
      res.status(500).json({ error: 'Failed to fetch social bucket quests' });
    }
  });

  // Daily quest retrieval route
  apiRouter.get("/users/:userId/quests/current-day", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      try {
        // Check if database tables exist first
        const tableCheck = await db.execute(sql`
          SELECT EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_name = 'user_quests'
          )
        `);
        
        if (!tableCheck.rows[0].exists) {
          console.log('[GET /users/:userId/quests/current-day] user_quests table does not exist, returning empty array');
          return res.status(200).json([]);
        }
        
        const dailyQuests = await storage.getCurrentDayUserQuests(userId);
        res.json(dailyQuests);
      } catch (dbError) {
        console.error(`[GET /users/${req.params.userId}/quests/current-day] Database error:`, dbError);
        // Return empty array instead of error to prevent UI crashes
        res.status(200).json([]);
      }
    } catch (error) {
      console.error(`[GET /users/${req.params.userId}/quests/current-day] Error:`, error);
      // Return empty array instead of error to prevent UI crashes
      res.status(200).json([]);
    }
  });

  // Bucket-based quest retrieval route for career quests
  apiRouter.get("/users/:userId/quests/bucket/:bucket", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const bucket = req.params.bucket;
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      if (!['daily', 'completed', 'missed'].includes(bucket)) {
        return res.status(400).json({ message: 'Invalid bucket. Must be daily, completed, or missed' });
      }
      
      const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      let questsWithDefinitions = [];
      
      // Query based on bucket type
      if (bucket === 'daily') {
        // Active quests assigned today
        const result = await db.execute(sql`
          SELECT 
            uq.id,
            uq.user_id as "userId",
            uq.quest_definition_id as "questDefinitionId",
            uq.status,
            uq.progress,
            uq.assigned_at as "assignedAt",
            uq.completed_at as "completedAt",
            uq.assigned_date as "assignedDate",
            uq.xp_earned as "xpEarned",
            uq.badge_earned as "badgeEarned",
            uq.musk_response as "muskResponse",
            -- Quest definition fields
            qd.title,
            qd.description,
            qd.type,
            qd.target_count as "targetCount",
            qd.target_action as "targetAction",
            qd.xp_reward as "xpReward",
            qd.badge_reward as "badgeReward",
            qd.musk_tip as "muskTip"
          FROM user_quests uq
          JOIN quest_definitions qd ON uq.quest_definition_id = qd.id
          WHERE uq.user_id = ${userId} 
            AND uq.assigned_date = ${currentDate}
            AND uq.status = 'active'
          ORDER BY uq.assigned_at DESC
        `);
        questsWithDefinitions = result.rows;
      } else if (bucket === 'completed') {
        // Completed quests (today and recent)
        const result = await db.execute(sql`
          SELECT 
            uq.id,
            uq.user_id as "userId",
            uq.quest_definition_id as "questDefinitionId",
            uq.status,
            uq.progress,
            uq.assigned_at as "assignedAt",
            uq.completed_at as "completedAt",
            uq.assigned_date as "assignedDate",
            uq.xp_earned as "xpEarned",
            uq.badge_earned as "badgeEarned",
            uq.musk_response as "muskResponse",
            -- Quest definition fields
            qd.title,
            qd.description,
            qd.type,
            qd.target_count as "targetCount",
            qd.target_action as "targetAction",
            qd.xp_reward as "xpReward",
            qd.badge_reward as "badgeReward",
            qd.musk_tip as "muskTip"
          FROM user_quests uq
          JOIN quest_definitions qd ON uq.quest_definition_id = qd.id
          WHERE uq.user_id = ${userId} 
            AND uq.status = 'completed'
          ORDER BY uq.completed_at DESC
          LIMIT 20
        `);
        questsWithDefinitions = result.rows;
      } else if (bucket === 'missed') {
        // Expired or dismissed quests
        const result = await db.execute(sql`
          SELECT 
            uq.id,
            uq.user_id as "userId",
            uq.quest_definition_id as "questDefinitionId",
            uq.status,
            uq.progress,
            uq.assigned_at as "assignedAt",
            uq.completed_at as "completedAt",
            uq.assigned_date as "assignedDate",
            uq.xp_earned as "xpEarned",
            uq.badge_earned as "badgeEarned",
            uq.musk_response as "muskResponse",
            -- Quest definition fields
            qd.title,
            qd.description,
            qd.type,
            qd.target_count as "targetCount",
            qd.target_action as "targetAction",
            qd.xp_reward as "xpReward",
            qd.badge_reward as "badgeReward",
            qd.musk_tip as "muskTip"
          FROM user_quests uq
          JOIN quest_definitions qd ON uq.quest_definition_id = qd.id
          WHERE uq.user_id = ${userId} 
            AND uq.status IN ('expired', 'dismissed')
          ORDER BY uq.assigned_at DESC
          LIMIT 20
        `);
        questsWithDefinitions = result.rows;
      }
      
      res.json(questsWithDefinitions);
    } catch (error) {
      console.error(`[GET /users/${req.params.userId}/quests/bucket/${req.params.bucket}] Error:`, error);
      res.status(500).json({ message: 'Failed to fetch quests by bucket' });
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
        const tableCheck = await db.execute(sql`
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
        
        const userXpResult = await db.execute(sql`
          SELECT 
            id,
            user_id as "userId",
            balance,
            lifetime_earned as "lifetimeEarned",
            current_month_earned as "currentMonthEarned",
            updated_at as "lastUpdated"
          FROM user_xp
          WHERE user_id = ${userId}
        `);
        
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
        const tableCheck = await db.execute(sql`
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
        
        const userBadgesResult = await db.execute(sql`
          SELECT 
            id,
            user_id as "userId",
            badge_type as "type",
            earned_at as "awardedAt",
            quest_id as "questId",
            display_on_profile as "displayOnProfile",
            display_on_resume as "displayOnResume"
          FROM user_badges
          WHERE user_id = ${userId}
          ORDER BY earned_at DESC
        `);
        
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
        const tableCheck = await db.execute(sql`
          SELECT EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_name = 'user_badges'
          )
        `);
        
        if (!tableCheck.rows[0].exists) {
          console.log('[GET /users/:userId/badges/type/:type] user_badges table does not exist, returning empty array');
          return res.json([]);
        }
        
        const { type } = req.params;
        
        // Get user badges by type directly from database
        console.log(`[GET /users/${userId}/badges/type/${type}] Fetching user badges by type directly from DB`);
        
        const userBadgesResult = await db.execute(sql`
          SELECT 
            id,
            user_id as "userId",
            badge_type as "type",
            earned_at as "awardedAt",
            quest_id as "questId",
            display_on_profile as "displayOnProfile",
            display_on_resume as "displayOnResume"
          FROM user_badges
          WHERE user_id = ${userId} AND badge_type = ${type}
          ORDER BY earned_at DESC
        `);
        
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
        const tableCheck = await db.execute(sql`
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
        
        const transactionsResult = await db.execute(sql`
          SELECT 
            id,
            user_id as "userId",
            amount,
            source,
            source_id as "sourceId",
            created_at as "createdAt",
            description
          FROM xp_transactions
          WHERE user_id = ${userId}
          ORDER BY created_at DESC
        `);
        
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
        const tableCheck = await db.execute(sql`
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
        
        const transactionsResult = await db.execute(sql`
          SELECT 
            id,
            user_id as "userId",
            amount,
            source,
            source_id as "sourceId",
            created_at as "createdAt",
            description
          FROM xp_transactions
          WHERE user_id = ${userId} AND source = ${source}
          ORDER BY created_at DESC
        `);
        
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
      const tableCheck = await db.execute(sql`
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
      const currentWeekQuestsResult = await db.execute(sql`
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
        WHERE uq.week_number = ${weekNumber} AND uq.year = ${year}
        ORDER BY uq.assigned_at DESC
        LIMIT 50
      `);
      
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

  // ============================================================================
  // SOCIAL QUEST ENDPOINTS
  // ============================================================================

  // Get all social quest definitions
  apiRouter.get("/social-quest-definitions", async (req, res) => {
    try {
      const socialQuestDefinitions = await storage.getAllSocialQuestDefinitions();
      res.json(socialQuestDefinitions);
    } catch (error) {
      console.error('[GET /social-quest-definitions] Error:', error);
      res.status(500).json({ message: 'Failed to fetch social quest definitions' });
    }
  });

  // Get user's social quests
  apiRouter.get("/users/:userId/social-quests", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      const socialQuests = await storage.getUserSocialQuests(userId);
      res.json(socialQuests);
    } catch (error) {
      console.error(`[GET /users/${req.params.userId}/social-quests] Error:`, error);
      res.status(500).json({ message: 'Failed to fetch user social quests' });
    }
  });

  // Get user's social quests with full definitions
  apiRouter.get("/users/:userId/social-quests-with-definitions", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      const socialQuests = await storage.getUserSocialQuestsWithDefinitions(userId);
      res.json(socialQuests);
    } catch (error) {
      console.error(`[GET /users/${req.params.userId}/social-quests-with-definitions] Error:`, error);
      res.status(500).json({ message: 'Failed to fetch user social quests with definitions' });
    }
  });

  // Get personalized social quest for specific platform
  apiRouter.get("/users/:userId/social-quest/personalized/:platform", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const platform = req.params.platform;
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      if (!['linkedin', 'twitter', 'instagram', 'facebook', 'youtube', 'tiktok'].includes(platform)) {
        return res.status(400).json({ message: 'Invalid platform' });
      }
      
      const personalizedQuest = await socialQuestPersonalizationService.generatePersonalizedSocialQuest(
        userId, 
        platform, 
        'share_content'
      );
      
      res.json(personalizedQuest);
    } catch (error) {
      console.error(`[GET /users/${req.params.userId}/social-quest/personalized/${req.params.platform}] Error:`, error);
      res.status(500).json({ message: 'Failed to generate personalized social quest' });
    }
  });

  // Create user social quest
  apiRouter.post("/users/:userId/social-quests", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      const socialQuestData = req.body;
      const createdSocialQuest = await storage.createUserSocialQuest({
        ...socialQuestData,
        userId
      });
      
      res.status(201).json(createdSocialQuest);
    } catch (error) {
      console.error(`[POST /users/${req.params.userId}/social-quests] Error:`, error);
      res.status(500).json({ message: 'Failed to create user social quest' });
    }
  });

  // Update user social quest
  apiRouter.patch("/users/:userId/social-quests/:socialQuestId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const socialQuestId = parseInt(req.params.socialQuestId);
      
      if (isNaN(userId) || isNaN(socialQuestId)) {
        return res.status(400).json({ message: 'Invalid user ID or social quest ID' });
      }
      
      const updateData = req.body;
      const updatedSocialQuest = await storage.updateUserSocialQuest(socialQuestId, updateData);
      
      if (!updatedSocialQuest) {
        return res.status(404).json({ message: 'User social quest not found' });
      }
      
      res.json(updatedSocialQuest);
    } catch (error) {
      console.error(`[PATCH /users/${req.params.userId}/social-quests/${req.params.socialQuestId}] Error:`, error);
      res.status(500).json({ message: 'Failed to update user social quest' });
    }
  });

  // Social Quest Daily endpoints
  apiRouter.get("/users/:userId/social-quests/current-day", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      const dailySocialQuests = await storage.getCurrentDaySocialQuests(userId);
      res.json(dailySocialQuests);
    } catch (error) {
      console.error(`[GET /users/${req.params.userId}/social-quests/current-day] Error:`, error);
      res.status(500).json({ message: 'Failed to fetch daily social quests' });
    }
  });

  // Bucket-based social quest retrieval route
  apiRouter.get("/users/:userId/social-quests/bucket/:bucket", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const bucket = req.params.bucket;
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      if (!['daily', 'completed', 'missed'].includes(bucket)) {
        return res.status(400).json({ message: 'Invalid bucket. Must be daily, completed, or missed' });
      }
      
      let socialQuestsWithDefinitions = [];
      
      // Query based on bucket type for social quests  
      if (bucket === 'daily') {
        // Active social quests assigned within last 24 hours (rolling window)
        const result = await db.execute(sql`
          SELECT 
            uq.id,
            uq.user_id as "userId",
            uq.quest_definition_id as "questDefinitionId",
            uq.status,
            uq.progress,
            uq.assigned_at as "assignedAt",
            uq.completed_at as "completedAt",
            uq.assigned_date as "assignedDate",
            uq.xp_earned as "xpEarned",
            uq.badge_earned as "badgeEarned",
            uq.musk_response as "muskResponse",
            -- Quest definition fields
            qd.title,
            qd.description,
            qd.type,
            qd.target_count as "targetCount",
            qd.target_action as "targetAction",
            qd.xp_reward as "xpReward",
            qd.badge_reward as "badgeReward",
            qd.musk_tip as "muskTip"
          FROM user_quests uq
          JOIN quest_definitions qd ON uq.quest_definition_id = qd.id
          WHERE uq.user_id = ${userId} 
            AND uq.assigned_at >= NOW() - INTERVAL '24 hours'
            AND uq.status = 'active'
            AND EXISTS (
              SELECT 1 FROM user_social_quests usq 
              WHERE usq.user_quest_id = uq.id
            )
          ORDER BY uq.assigned_at DESC
        `);
        socialQuestsWithDefinitions = result.rows;
      } else if (bucket === 'completed') {
        // Completed social quests (today and recent)
        const result = await db.execute(sql`
          SELECT 
            uq.id,
            uq.user_id as "userId",
            uq.quest_definition_id as "questDefinitionId",
            uq.status,
            uq.progress,
            uq.assigned_at as "assignedAt",
            uq.completed_at as "completedAt",
            uq.assigned_date as "assignedDate",
            uq.xp_earned as "xpEarned",
            uq.badge_earned as "badgeEarned",
            uq.musk_response as "muskResponse",
            -- Quest definition fields
            qd.title,
            qd.description,
            qd.type,
            qd.target_count as "targetCount",
            qd.target_action as "targetAction",
            qd.xp_reward as "xpReward",
            qd.badge_reward as "badgeReward",
            qd.musk_tip as "muskTip"
          FROM user_quests uq
          JOIN quest_definitions qd ON uq.quest_definition_id = qd.id
          WHERE uq.user_id = ${userId} 
            AND uq.status = 'completed'
            AND EXISTS (
              SELECT 1 FROM user_social_quests usq 
              WHERE usq.user_quest_id = uq.id
            )
          ORDER BY uq.completed_at DESC
          LIMIT 20
        `);
        socialQuestsWithDefinitions = result.rows;
      } else if (bucket === 'missed') {
        // Expired or dismissed social quests
        const result = await db.execute(sql`
          SELECT 
            uq.id,
            uq.user_id as "userId",
            uq.quest_definition_id as "questDefinitionId",
            uq.status,
            uq.progress,
            uq.assigned_at as "assignedAt",
            uq.completed_at as "completedAt",
            uq.assigned_date as "assignedDate",
            uq.xp_earned as "xpEarned",
            uq.badge_earned as "badgeEarned",
            uq.musk_response as "muskResponse",
            -- Quest definition fields
            qd.title,
            qd.description,
            qd.type,
            qd.target_count as "targetCount",
            qd.target_action as "targetAction",
            qd.xp_reward as "xpReward",
            qd.badge_reward as "badgeReward",
            qd.musk_tip as "muskTip"
          FROM user_quests uq
          JOIN quest_definitions qd ON uq.quest_definition_id = qd.id
          WHERE uq.user_id = ${userId} 
            AND uq.status IN ('expired', 'dismissed')
            AND EXISTS (
              SELECT 1 FROM user_social_quests usq 
              WHERE usq.user_quest_id = uq.id
            )
          ORDER BY uq.assigned_at DESC
          LIMIT 20
        `);
        socialQuestsWithDefinitions = result.rows;
      }
      
      res.json(socialQuestsWithDefinitions);
    } catch (error) {
      console.error(`[GET /users/${req.params.userId}/social-quests/bucket/${req.params.bucket}] Error:`, error);
      res.status(500).json({ message: 'Failed to fetch social quests by bucket' });
    }
  });

  apiRouter.post("/users/:userId/social-quests/assign-daily", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      const assignedSocialQuests = await storage.assignDailySocialQuests(userId);
      res.json(assignedSocialQuests);
    } catch (error) {
      console.error(`[POST /users/${req.params.userId}/social-quests/assign-daily] Error:`, error);
      res.status(500).json({ message: 'Failed to assign daily social quests' });
    }
  });

  // On-demand daily quest assignment endpoint
  apiRouter.post("/users/:userId/quests/daily/ensure", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      console.log(`[POST /users/${userId}/quests/daily/ensure] Ensuring daily quests for user ${userId}`);
      
      const result = await storage.ensureDailyQuestsForUser(userId);
      
      console.log(`[POST /users/${userId}/quests/daily/ensure] ✅ Ensured quests: ${result.careerQuests.length} career + ${result.socialQuests.length} social`);
      res.json(result);
    } catch (error) {
      console.error(`[POST /users/${req.params.userId}/quests/daily/ensure] Error:`, error);
      res.status(500).json({ message: 'Failed to ensure daily quests' });
    }
  });

  console.log("Career Quests and Social Quests routes loaded");
}