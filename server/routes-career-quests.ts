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

function getISOWeekStartDate(year: number, weekNumber: number): Date {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const weekOneMonday = new Date(jan4);
  weekOneMonday.setUTCDate(jan4.getUTCDate() - jan4Day + 1);

  const weekStart = new Date(weekOneMonday);
  weekStart.setUTCDate(weekOneMonday.getUTCDate() + (weekNumber - 1) * 7);
  return weekStart;
}

function dateToISODateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

function normalizeQuestDate(value: unknown): string | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return dateToISODateString(value);
  }

  const stringValue = String(value).trim();
  if (!stringValue) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) {
    return stringValue;
  }

  const parsed = new Date(stringValue);
  if (!Number.isNaN(parsed.getTime())) {
    return dateToISODateString(parsed);
  }

  return null;
}

// Import the service function instead of duplicating code
import { updateQuestProgress as serviceUpdateQuestProgress } from './services/quest-progress-service';

// Import social quest template engine
import { socialQuestTemplateEngine } from './services/social-quest-template-engine';

// Helper function to classify quest types
function isCareerQuest(quest: any): boolean {
  const socialPlatforms = ['linkedin', 'instagram', 'twitter', 'facebook', 'youtube', 'tiktok', 'medium', 'pinterest'];
  const questType = quest.type || quest.definition?.type;
  const platform = quest.platform || quest.definition?.platform;
  const questCategory = (quest.questCategory || quest.quest_category || quest.definition?.questCategory || quest.definition?.quest_category || '').toLowerCase();

  if (['career', 'profile', 'portfolio'].includes(questCategory)) {
    return true;
  }

  if (questCategory === 'social') {
    return false;
  }
  
  // Exclude if it's explicitly a social_quest or social_post type
  if (questType === 'social_quest' || questType === 'social_post') {
    return false;
  }
  
  // Exclude if the platform is a social media platform
  if (platform && socialPlatforms.includes(platform.toLowerCase())) {
    return false;
  }
  
  // Include all other Brandentify platform activities
  return true;
}

function isSocialQuest(quest: any): boolean {
  const socialPlatforms = ['linkedin', 'instagram', 'twitter', 'facebook', 'youtube', 'tiktok', 'medium', 'pinterest'];
  const questType = quest.type || quest.definition?.type;
  const platform = quest.platform || quest.definition?.platform;
  const questCategory = (quest.questCategory || quest.quest_category || quest.definition?.questCategory || quest.definition?.quest_category || '').toLowerCase();

  if (questCategory === 'social') {
    return true;
  }

  if (['career', 'profile', 'portfolio', 'networking'].includes(questCategory)) {
    return false;
  }
  
  // Include if it's explicitly a social_quest or social_post type
  if (questType === 'social_quest' || questType === 'social_post') {
    return true;
  }
  
  // Include if the platform is a social media platform
  if (platform && socialPlatforms.includes(platform.toLowerCase())) {
    return true;
  }
  
  // Exclude all other quests
  return false;
}

export function setupCareerQuestsRoutes(apiRouter: Router, storage: IStorage) {
  // TEST ENDPOINT: Direct database query to debug personalized quests
  apiRouter.get("/test-personalized-quest/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const currentDate = new Date().toISOString().split('T')[0];
      
      const result = await pool.query(`
        SELECT 
          uq.id,
          uq.quest_definition_id,
          uq.assigned_date,
          qd.title as def_title,
          qd.musk_tip as def_musk_tip,
          qd.estimated_time_minutes as def_time,
          qd.difficulty_level as def_difficulty,
          gcq.id as gen_id,
          gcq.personalized_title as gen_title,
          gcq.personalized_musk_tip as gen_musk_tip,
          gcq.estimated_time_minutes as gen_time,
          gcq.difficulty_level as gen_difficulty
        FROM user_quests uq
        JOIN quest_definitions qd ON uq.quest_definition_id = qd.id
        LEFT JOIN LATERAL (
          SELECT * FROM generated_career_quests
          WHERE user_id = uq.user_id
            AND quest_definition_id = uq.quest_definition_id
            AND assigned_date = uq.assigned_date::text
          ORDER BY id DESC
          LIMIT 1
        ) gcq ON true
        WHERE uq.user_id = $1
          AND uq.assigned_date::text = $2
        ORDER BY uq.assigned_at DESC
      `, [userId, currentDate]);
      
      res.json({
        currentDate,
        userId,
        rowCount: result.rows.length,
        rawRows: result.rows,
        processedQuests: result.rows.map(row => ({
          id: row.id,
          title: row.gen_title || row.def_title,
          muskTip: row.gen_musk_tip || row.def_musk_tip,
          estimatedTimeMinutes: row.gen_time || row.def_time,
          difficultyLevel: row.gen_difficulty || row.def_difficulty,
          hasPersonalizedData: !!row.gen_id
        }))
      });
    } catch (error) {
      console.error('[TEST PERSONALIZED QUEST] Error:', error);
      res.status(500).json({ error: String(error) });
    }
  });
  
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
              qd.deliverable_format as "deliverableFormat",
              qd.quantity_value as "quantityValue",
              qd.quantity_type as "quantityType",
              qd.platform_constraints as "platformConstraints",
              qd.guidance_snippet as "guidanceSnippet",
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
                deliverableFormat: row.deliverableFormat,
                quantityValue: row.quantityValue,
                quantityType: row.quantityType,
                platformConstraints: row.platformConstraints,
                guidanceSnippet: row.guidanceSnippet,
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

  // Compatibility endpoint for weekly query shape: /api/quests?week=current&userId=...
  apiRouter.get('/quests', async (req, res) => {
    try {
      const week = String(req.query.week || '').toLowerCase();
      if (week !== 'current') {
        return res.status(400).json({ message: 'Unsupported query. Use week=current.' });
      }

      const userId = parseInt(String(req.query.userId));
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Valid userId is required' });
      }

      return res.redirect(307, `/api/quests/weekly?userId=${userId}`);
    } catch (error) {
      console.error('[GET /quests] Error:', error);
      return res.status(500).json({ message: 'Failed to resolve weekly quests route' });
    }
  });

  // Weekly calendar endpoint (grouped by day) for additive migration from daily views.
  apiRouter.get('/quests/weekly', async (req, res) => {
    try {
      const userId = parseInt(String(req.query.userId || ''));
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid or missing userId query parameter' });
      }

      const now = new Date();
      const requestedWeekNumber = parseInt(String(req.query.weekNumber || getWeekNumber(now)));
      const requestedYear = parseInt(String(req.query.year || now.getUTCFullYear()));
      const fallbackToLatest = String(req.query.fallbackToLatest || 'true').toLowerCase() !== 'false';

      if (isNaN(requestedWeekNumber) || isNaN(requestedYear)) {
        return res.status(400).json({ message: 'Invalid weekNumber or year query parameter' });
      }

      let weekNumber = requestedWeekNumber;
      let year = requestedYear;

      // Keep status accurate for calendar dots without changing completed quests.
      await db.execute(sql`
        UPDATE user_quests
        SET status = 'expired'
        WHERE user_id = ${userId}
          AND status = 'active'
          AND assigned_date < CURRENT_DATE
          AND progress < (
            SELECT target_count
            FROM quest_definitions
            WHERE id = user_quests.quest_definition_id
          )
      `);

      const fetchWeeklyRows = async (targetWeekNumber: number, targetYear: number) => {
        return db.execute(sql`
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
            uq.assigned_date as "assignedDate",
            uq.scheduled_date as "scheduledDate",
            uq.week_number as "weekNumber",
            uq.year,
            qd.title,
            qd.description,
            qd.type,
            qd.target_count as "targetCount",
            qd.target_action as "targetAction",
            qd.xp_reward as "xpReward",
            qd.badge_reward as "badgeReward",
            qd.platform,
            qd.quest_category as "questCategory",
            qd.musk_tip as "muskTip",
            qd.deliverable_format as "deliverableFormat",
            qd.quantity_value as "quantityValue",
            qd.quantity_type as "quantityType",
            qd.platform_constraints as "platformConstraints",
            qd.guidance_snippet as "guidanceSnippet"
          FROM user_quests uq
          JOIN quest_definitions qd ON qd.id = uq.quest_definition_id
          WHERE uq.user_id = ${userId}
            AND uq.week_number = ${targetWeekNumber}
            AND uq.year = ${targetYear}
          ORDER BY uq.assigned_date ASC, uq.assigned_at ASC
        `);
      };

      let rowsResult = await fetchWeeklyRows(weekNumber, year);

      // Self-heal only for current week: generate missing week quests for this user, then refetch.
      const currentWeekNow = getWeekNumber(now);
      const currentYearNow = now.getUTCFullYear();
      if (rowsResult.rows.length === 0 && weekNumber === currentWeekNow && year === currentYearNow) {
        const { ensureWeeklyQuestsForUser } = await import('./services/weekly-quest-recovery');
        await ensureWeeklyQuestsForUser(userId);
        rowsResult = await fetchWeeklyRows(weekNumber, year);
      }

      // Visibility fallback: if requested week is empty, return latest week with quests for this user.
      if (rowsResult.rows.length === 0 && fallbackToLatest) {
        const latestWeekResult = await db.execute(sql`
          SELECT week_number as "weekNumber", year
          FROM user_quests
          WHERE user_id = ${userId}
          ORDER BY year DESC, week_number DESC
          LIMIT 1
        `);

        if (latestWeekResult.rows.length > 0) {
          const latest = latestWeekResult.rows[0] as any;
          weekNumber = Number(latest.weekNumber);
          year = Number(latest.year);
          rowsResult = await fetchWeeklyRows(weekNumber, year);
        }
      }

      const weekStart = getISOWeekStartDate(year, weekNumber);
      const weekDays = Array.from({ length: 7 }).map((_, index) => {
        const date = new Date(weekStart);
        date.setUTCDate(weekStart.getUTCDate() + index);
        const dateString = dateToISODateString(date);
        return {
          date: dateString,
          dayName: date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }),
          quests: [] as any[],
        };
      });

      const dayMap = new Map<string, { date: string; dayName: string; quests: any[] }>();
      for (const day of weekDays) {
        dayMap.set(day.date, day);
      }

      const flattenedQuests: any[] = [];

      for (const row of rowsResult.rows as any[]) {
        const assignedDate = normalizeQuestDate(row.scheduledDate ?? row.assignedDate);
        if (!assignedDate) {
          continue;
        }

        const statusLabel = row.status === 'completed'
          ? 'completed'
          : row.status === 'expired'
            ? 'missed'
            : 'pending';

        const apiStatus = row.status === 'completed'
          ? 'completed'
          : row.status === 'active'
            ? 'in_progress'
            : 'pending';

        const mappedQuest = {
          id: row.id,
          userId: row.userId,
          questDefinitionId: row.questDefinitionId,
          status: row.status,
          progress: row.progress,
          assignedAt: row.assignedAt,
          completedAt: row.completedAt,
          xpEarned: row.xpEarned,
          badgeEarned: row.badgeEarned,
          assignedDate,
          scheduled_date: assignedDate,
          weekNumber: row.weekNumber,
          year: row.year,
          calendarStatus: statusLabel,
          title: row.title,
          description: row.description,
          type: row.type,
          platform: row.platform,
          questCategory: row.questCategory,
          definition: {
            id: row.questDefinitionId,
            title: row.title,
            description: row.description,
            type: row.type,
            targetCount: row.targetCount,
            targetAction: row.targetAction,
            xpReward: row.xpReward,
            badgeReward: row.badgeReward,
            platform: row.platform,
            muskTip: row.muskTip,
            deliverableFormat: row.deliverableFormat,
            quantityValue: row.quantityValue,
            quantityType: row.quantityType,
            platformConstraints: row.platformConstraints,
            guidanceSnippet: row.guidanceSnippet,
          }
        };

        flattenedQuests.push({
          id: row.id,
          title: row.title,
          status: apiStatus,
          scheduled_date: assignedDate,
        });

        const dayEntry = dayMap.get(assignedDate);
        if (dayEntry) {
          dayEntry.quests.push(mappedQuest);
        }
      }

      const days = weekDays.map((day) => {
        const hasCompleted = day.quests.some((quest) => quest.calendarStatus === 'completed');
        const hasQuests = day.quests.length > 0;
        const allMissed = hasQuests && day.quests.every((quest) => quest.calendarStatus === 'missed');

        const status = hasCompleted ? 'completed' : allMissed ? 'missed' : 'pending';
        return {
          ...day,
          status,
        };
      });

      const summary = {
        totalQuests: rowsResult.rows.length,
        completed: rowsResult.rows.filter((row: any) => row.status === 'completed').length,
        missed: rowsResult.rows.filter((row: any) => row.status === 'expired').length,
        pending: rowsResult.rows.filter((row: any) => row.status === 'active').length,
      };

      res.json({
        userId,
        weekNumber,
        year,
        requestedWeekNumber,
        requestedYear,
        weekStartDate: dateToISODateString(weekStart),
        weekEndDate: dateToISODateString(new Date(weekStart.getTime() + (6 * 86400000))),
        summary,
        quests: flattenedQuests,
        days,
      });
    } catch (error) {
      console.error('[GET /quests/weekly] Error:', error);
      res.status(500).json({ message: 'Failed to fetch weekly calendar quests' });
    }
  });

  // Admin force generation endpoint for weekly quest rollout/recovery.
  apiRouter.post('/admin/generate-weekly-quests', async (req, res) => {
    try {
      const userId = req.body?.userId ? parseInt(String(req.body.userId)) : undefined;
      const force = req.body?.force !== false;
      const targetWeeklyQuests = req.body?.targetWeeklyQuests
        ? parseInt(String(req.body.targetWeeklyQuests))
        : undefined;

      const { dailyQuestScheduler } = await import('./services/daily-quest-scheduler');

      if (userId && !isNaN(userId)) {
        const generated = await dailyQuestScheduler.triggerWeeklyAssignmentForUser(userId, {
          force,
          targetWeeklyQuests,
        });

        return res.json({
          scope: 'single-user',
          userId,
          generatedCount: Array.isArray(generated) ? generated.length : 0,
        });
      }

      const result = await dailyQuestScheduler.generateWeeklyQuestsForAllUsers({
        force,
        targetWeeklyQuests,
      });

      res.json({
        scope: 'all-users',
        ...result,
      });
    } catch (error) {
      console.error('[POST /admin/generate-weekly-quests] Error:', error);
      res.status(500).json({ message: 'Failed to force generate weekly quests' });
    }
  });

  // Admin bulk generation endpoint: Fill ALL 7 days of the week for all users
  // This is more aggressive than the weekly scheduler - ensures complete week coverage daily
  apiRouter.post('/admin/generate-weekly-quests-bulk', async (req, res) => {
    try {
      const force = req.body?.force !== false;

      const { weeklyQuestBulkGenerator } = await import('./services/weekly-quest-bulk-generator');

      console.log('[POST /admin/generate-weekly-quests-bulk] Starting bulk weekly quest generation...');
      const result = await weeklyQuestBulkGenerator.generateWeeklyQuestsForAllUsers(force);

      res.json({
        scope: 'all-users-all-days',
        force,
        ...result,
      });
    } catch (error) {
      console.error('[POST /admin/generate-weekly-quests-bulk] Error:', error);
      res.status(500).json({ 
        message: 'Failed to bulk generate weekly quests',
        error: error.message 
      });
    }
  });

  // Admin smart recovery endpoint: Ensure all users have full week of quests
  // Only generates MISSING days - never overwrites existing quests (intelligent gap-filling)
  // Cases: No quests → generate 7 days | Partial → generate missing | Complete → skip
  apiRouter.post('/admin/ensure-weekly-quests', async (req, res) => {
    try {
      const dryRun = req.body?.dryRun === true;

      const { ensureWeeklyQuestsForAllUsers } = await import('./services/weekly-quest-recovery');

      console.log(`[POST /admin/ensure-weekly-quests] Starting smart weekly quest recovery${dryRun ? ' [DRY-RUN]' : ''}...`);
      const result = await ensureWeeklyQuestsForAllUsers({ dryRun });

      res.json({
        scope: 'smart-recovery',
        dryRun,
        ...result,
      });
    } catch (error) {
      console.error('[POST /admin/ensure-weekly-quests] Error:', error);
      res.status(500).json({ 
        message: 'Failed to ensure weekly quests',
        error: error.message 
      });
    }
  });

  // Admin compatibility alias for weekly quest recovery.
  apiRouter.post('/admin/fix-weekly-quests', async (req, res) => {
    try {
      const dryRun = req.body?.dryRun === true;
      const { ensureWeeklyQuestsForAllUsers } = await import('./services/weekly-quest-recovery');

      const result = await ensureWeeklyQuestsForAllUsers({ dryRun });
      res.json({
        scope: 'smart-recovery',
        dryRun,
        ...result,
      });
    } catch (error) {
      console.error('[POST /admin/fix-weekly-quests] Error:', error);
      res.status(500).json({
        message: 'Failed to fix weekly quests',
        error: error.message,
      });
    }
  });

  // Daily quest assignment route
  apiRouter.post("/users/:userId/quests/assign-daily", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const force = req.query.force === 'true' || req.body?.force === true;
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
        
        // HOTFIX: Use V2 generator for achievable quests
        // Import the daily quest scheduler to use the same logic
        const { dailyQuestScheduler } = await import('./services/daily-quest-scheduler');
        
        // Trigger assignment for this specific user
        await dailyQuestScheduler.triggerDailyAssignmentForUser(userId, { force });
        
        // Return the newly assigned quests
        const assignedQuests = await storage.getCurrentDayUserQuests(userId);
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

      // Add strong cache prevention headers to fix published app caching issue
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      let quests: any[] = [];

      if (bucket === 'daily') {
        // Query database directly to get personalized quest data using direct ID joins
        // Show all ACTIVE quests regardless of assigned date (fixes issue where yesterday's quests disappear)
        const result = await pool.query(`
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
            uq.assigned_date as "assignedDate",
            COALESCE(gcq.personalized_title, gsq.personalized_title, qd.title) as title,
            COALESCE(gcq.personalized_description, gsq.personalized_description, qd.description) as description,
            qd.type as type,
            qd.target_count as "targetCount",
            qd.target_action as "targetAction",
            qd.xp_reward as "xpReward",
            qd.badge_reward as "badgeReward",
            qd.platform,
            qd.quest_category as "questCategory",
            COALESCE(gcq.personalized_musk_tip, gsq.personalized_musk_tip, qd.musk_tip) as "muskTip",
            COALESCE(gcq.deliverable_format, qd.deliverable_format) as "deliverableFormat",
            qd.quantity_value as "quantityValue",
            qd.quantity_type as "quantityType",
            qd.platform_constraints as "platformConstraints",
            COALESCE(gcq.guidance_snippet, qd.guidance_snippet) as "guidanceSnippet",
            COALESCE(gcq.estimated_time_minutes, qd.estimated_time_minutes) as "estimatedTimeMinutes",
            COALESCE(gcq.difficulty_level, qd.difficulty_level) as "difficultyLevel"
          FROM user_quests uq
          JOIN quest_definitions qd ON uq.quest_definition_id = qd.id
          LEFT JOIN generated_career_quests gcq ON uq.generated_career_quest_id = gcq.id
          LEFT JOIN generated_social_quests gsq ON uq.generated_quest_id = gsq.id
          WHERE uq.user_id = $1
            AND uq.status = 'active'
          ORDER BY uq.assigned_at DESC
        `, [userId]);
        
        quests = result.rows.map(row => ({
          ...row,
          definition: {
            id: row.questDefinitionId,
            title: row.title,
            description: row.description,
            type: row.type,
            targetCount: row.targetCount,
            targetAction: row.targetAction,
            xpReward: row.xpReward,
            badgeReward: row.badgeReward,
            platform: row.platform,
            muskTip: row.muskTip,
            deliverableFormat: row.deliverableFormat,
            quantityValue: row.quantityValue,
            quantityType: row.quantityType,
            platformConstraints: row.platformConstraints,
            guidanceSnippet: row.guidanceSnippet
          }
        })).filter(isCareerQuest);
      } else if (bucket === 'completed') {
        // Get completed user quests WITH personalized generated data
        const result = await pool.query(`
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
            uq.assigned_date as "assignedDate",
            COALESCE(gcq.personalized_title, gsq.personalized_title, qd.title) as title,
            COALESCE(gcq.personalized_description, gsq.personalized_description, qd.description) as description,
            qd.type as type,
            qd.target_count as "targetCount",
            qd.target_action as "targetAction",
            qd.xp_reward as "xpReward",
            qd.badge_reward as "badgeReward",
            qd.platform,
            qd.quest_category as "questCategory",
            COALESCE(gcq.personalized_musk_tip, gsq.personalized_musk_tip, qd.musk_tip) as "muskTip",
            COALESCE(gcq.deliverable_format, qd.deliverable_format) as "deliverableFormat",
            qd.quantity_value as "quantityValue",
            qd.quantity_type as "quantityType",
            qd.platform_constraints as "platformConstraints",
            COALESCE(gcq.guidance_snippet, qd.guidance_snippet) as "guidanceSnippet",
            COALESCE(gcq.estimated_time_minutes, qd.estimated_time_minutes) as "estimatedTimeMinutes",
            COALESCE(gcq.difficulty_level, qd.difficulty_level) as "difficultyLevel"
          FROM user_quests uq
          JOIN quest_definitions qd ON uq.quest_definition_id = qd.id
          LEFT JOIN LATERAL (
            SELECT * FROM generated_career_quests
            WHERE user_id = uq.user_id
              AND quest_definition_id = uq.quest_definition_id
              AND assigned_date = uq.assigned_date::text
            ORDER BY id DESC
            LIMIT 1
          ) gcq ON true
          LEFT JOIN LATERAL (
            SELECT * FROM generated_social_quests
            WHERE user_id = uq.user_id
              AND quest_definition_id = uq.quest_definition_id
              AND assigned_date = uq.assigned_date::text
            ORDER BY id DESC
            LIMIT 1
          ) gsq ON true
          WHERE uq.user_id = $1
            AND uq.status = 'completed'
          ORDER BY uq.completed_at DESC
        `, [userId]);
        
        quests = result.rows.map(row => ({
          ...row,
          definition: {
            id: row.questDefinitionId,
            title: row.title,
            description: row.description,
            type: row.type,
            targetCount: row.targetCount,
            targetAction: row.targetAction,
            xpReward: row.xpReward,
            badgeReward: row.badgeReward,
            platform: row.platform,
            muskTip: row.muskTip,
            deliverableFormat: row.deliverableFormat,
            quantityValue: row.quantityValue,
            quantityType: row.quantityType,
            platformConstraints: row.platformConstraints,
            guidanceSnippet: row.guidanceSnippet
          }
        })).filter(isCareerQuest);
      } else if (bucket === 'missed') {
        // Get missed/expired user quests WITH personalized generated data
        const result = await pool.query(`
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
            uq.assigned_date as "assignedDate",
            COALESCE(gcq.personalized_title, gsq.personalized_title, qd.title) as title,
            COALESCE(gcq.personalized_description, gsq.personalized_description, qd.description) as description,
            qd.type as type,
            qd.target_count as "targetCount",
            qd.target_action as "targetAction",
            qd.xp_reward as "xpReward",
            qd.badge_reward as "badgeReward",
            qd.platform,
            qd.quest_category as "questCategory",
            COALESCE(gcq.personalized_musk_tip, gsq.personalized_musk_tip, qd.musk_tip) as "muskTip",
            COALESCE(gcq.deliverable_format, qd.deliverable_format) as "deliverableFormat",
            qd.quantity_value as "quantityValue",
            qd.quantity_type as "quantityType",
            qd.platform_constraints as "platformConstraints",
            COALESCE(gcq.guidance_snippet, qd.guidance_snippet) as "guidanceSnippet",
            COALESCE(gcq.estimated_time_minutes, qd.estimated_time_minutes) as "estimatedTimeMinutes",
            COALESCE(gcq.difficulty_level, qd.difficulty_level) as "difficultyLevel"
          FROM user_quests uq
          JOIN quest_definitions qd ON uq.quest_definition_id = qd.id
          LEFT JOIN LATERAL (
            SELECT * FROM generated_career_quests
            WHERE user_id = uq.user_id
              AND quest_definition_id = uq.quest_definition_id
              AND assigned_date = uq.assigned_date::text
            ORDER BY id DESC
            LIMIT 1
          ) gcq ON true
          LEFT JOIN LATERAL (
            SELECT * FROM generated_social_quests
            WHERE user_id = uq.user_id
              AND quest_definition_id = uq.quest_definition_id
              AND assigned_date = uq.assigned_date::text
            ORDER BY id DESC
            LIMIT 1
          ) gsq ON true
          WHERE uq.user_id = $1
            AND (uq.status = 'expired' OR uq.status = 'dismissed')
          ORDER BY uq.assigned_at DESC
        `, [userId]);
        
        quests = result.rows.map(row => ({
          ...row,
          definition: {
            id: row.questDefinitionId,
            title: row.title,
            description: row.description,
            type: row.type,
            targetCount: row.targetCount,
            targetAction: row.targetAction,
            xpReward: row.xpReward,
            badgeReward: row.badgeReward,
            platform: row.platform,
            muskTip: row.muskTip,
            deliverableFormat: row.deliverableFormat,
            quantityValue: row.quantityValue,
            quantityType: row.quantityType,
            platformConstraints: row.platformConstraints,
            guidanceSnippet: row.guidanceSnippet
          }
        })).filter(isCareerQuest);
      }

      res.json(quests || []);
    } catch (error: any) {
      console.error('Error fetching bucket quests:', error);
      
      // Graceful error handling for Neon database cold start / unavailability
      if (error.message?.includes('Database temporarily unavailable') || 
          error.message?.includes('endpoint has been disabled') ||
          error.message?.includes('endpoint is paused')) {
        return res.status(503).json({ 
          error: 'Database waking up',
          message: 'System is warming up. Please refresh in a few seconds.',
          retryAfter: 5
        });
      }
      
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

      // Add strong cache prevention headers to fix published app caching issue
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      let quests: any[] = [];

      if (bucket === 'daily') {
        // Get today's active social quests WITH personalized generated data (same pattern as completed/missed)
        const result = await pool.query(`
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
            uq.assigned_date as "assignedDate",
            COALESCE(gsq.personalized_title, gcq.personalized_title, qd.title) as title,
            COALESCE(gsq.personalized_description, gcq.personalized_description, qd.description) as description,
            qd.type as type,
            qd.target_count as "targetCount",
            qd.target_action as "targetAction",
            qd.xp_reward as "xpReward",
            qd.badge_reward as "badgeReward",
            qd.platform,
            qd.quest_category as "questCategory",
            COALESCE(gsq.personalized_musk_tip, gcq.personalized_musk_tip, qd.musk_tip) as "muskTip",
            COALESCE(gcq.deliverable_format, qd.deliverable_format) as "deliverableFormat",
            qd.quantity_value as "quantityValue",
            qd.quantity_type as "quantityType",
            qd.platform_constraints as "platformConstraints",
            COALESCE(gcq.guidance_snippet, qd.guidance_snippet) as "guidanceSnippet",
            COALESCE(gcq.estimated_time_minutes, qd.estimated_time_minutes) as "estimatedTimeMinutes",
            COALESCE(gcq.difficulty_level, qd.difficulty_level) as "difficultyLevel"
          FROM user_quests uq
          JOIN quest_definitions qd ON uq.quest_definition_id = qd.id
          LEFT JOIN LATERAL (
            SELECT * FROM generated_career_quests
            WHERE user_id = uq.user_id
              AND quest_definition_id = uq.quest_definition_id
              AND assigned_date = uq.assigned_date::text
            ORDER BY id DESC
            LIMIT 1
          ) gcq ON true
          LEFT JOIN LATERAL (
            SELECT * FROM generated_social_quests
            WHERE user_id = uq.user_id
              AND quest_definition_id = uq.quest_definition_id
              AND assigned_date = uq.assigned_date::text
            ORDER BY id DESC
            LIMIT 1
          ) gsq ON true
          WHERE uq.user_id = $1
            AND uq.status = 'active'
          ORDER BY uq.assigned_at DESC
        `, [userId]);
        
        quests = result.rows.map(row => {
          const questData = {
            ...row,
            definition: {
              id: row.questDefinitionId,
              title: row.title,
              description: row.description,
              type: row.type,
              targetCount: row.targetCount,
              targetAction: row.targetAction,
              xpReward: row.xpReward,
              badgeReward: row.badgeReward,
              platform: row.platform,
              muskTip: row.muskTip,
              deliverableFormat: row.deliverableFormat,
              quantityValue: row.quantityValue,
              quantityType: row.quantityType,
              platformConstraints: row.platformConstraints,
              guidanceSnippet: row.guidanceSnippet
            }
          };
          // Double-check top-level fields match for frontend safety
          if (!questData.title && questData.definition.title) questData.title = questData.definition.title;
          if (!questData.description && questData.definition.description) questData.description = questData.definition.description;
          if (!questData.muskTip && questData.definition.muskTip) questData.muskTip = questData.definition.muskTip;
          return questData;
        }).filter(isSocialQuest);
        
        console.log(`[GET Social Daily] Found ${quests.length} active social quests for user ${userId}`);
      } else if (bucket === 'completed') {
        // Get completed social quests WITH personalized generated data
        const result = await pool.query(`
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
            uq.assigned_date as "assignedDate",
            COALESCE(gcq.personalized_title, gsq.personalized_title, qd.title) as title,
            COALESCE(gcq.personalized_description, gsq.personalized_description, qd.description) as description,
            qd.type as type,
            qd.target_count as "targetCount",
            qd.target_action as "targetAction",
            qd.xp_reward as "xpReward",
            qd.badge_reward as "badgeReward",
            qd.platform,
            qd.quest_category as "questCategory",
            COALESCE(gcq.personalized_musk_tip, gsq.personalized_musk_tip, qd.musk_tip) as "muskTip",
            COALESCE(gcq.deliverable_format, qd.deliverable_format) as "deliverableFormat",
            qd.quantity_value as "quantityValue",
            qd.quantity_type as "quantityType",
            qd.platform_constraints as "platformConstraints",
            COALESCE(gcq.guidance_snippet, qd.guidance_snippet) as "guidanceSnippet",
            COALESCE(gcq.estimated_time_minutes, qd.estimated_time_minutes) as "estimatedTimeMinutes",
            COALESCE(gcq.difficulty_level, qd.difficulty_level) as "difficultyLevel"
          FROM user_quests uq
          JOIN quest_definitions qd ON uq.quest_definition_id = qd.id
          LEFT JOIN LATERAL (
            SELECT * FROM generated_career_quests
            WHERE user_id = uq.user_id
              AND quest_definition_id = uq.quest_definition_id
              AND assigned_date = uq.assigned_date::text
            ORDER BY id DESC
            LIMIT 1
          ) gcq ON true
          LEFT JOIN LATERAL (
            SELECT * FROM generated_social_quests
            WHERE user_id = uq.user_id
              AND quest_definition_id = uq.quest_definition_id
              AND assigned_date = uq.assigned_date::text
            ORDER BY id DESC
            LIMIT 1
          ) gsq ON true
          WHERE uq.user_id = $1
            AND uq.status = 'completed'
          ORDER BY uq.completed_at DESC
        `, [userId]);
        
        quests = result.rows.map(row => {
          const questData = {
            ...row,
            definition: {
              id: row.questDefinitionId,
              title: row.title,
              description: row.description,
              type: row.type,
              targetCount: row.targetCount,
              targetAction: row.targetAction,
              xpReward: row.xpReward,
              badgeReward: row.badgeReward,
              platform: row.platform,
              muskTip: row.muskTip,
              deliverableFormat: row.deliverableFormat,
              quantityValue: row.quantityValue,
              quantityType: row.quantityType,
              platformConstraints: row.platformConstraints,
              guidanceSnippet: row.guidanceSnippet
            }
          };
          // Double-check top-level fields match for frontend safety
          if (!questData.title && questData.definition.title) questData.title = questData.definition.title;
          if (!questData.description && questData.definition.description) questData.description = questData.definition.description;
          if (!questData.muskTip && questData.definition.muskTip) questData.muskTip = questData.definition.muskTip;
          return questData;
        }).filter(isSocialQuest);
      } else if (bucket === 'missed') {
        // Get missed/expired social quests WITH personalized generated data
        const result = await pool.query(`
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
            uq.assigned_date as "assignedDate",
            COALESCE(gcq.personalized_title, gsq.personalized_title, qd.title) as title,
            COALESCE(gcq.personalized_description, gsq.personalized_description, qd.description) as description,
            qd.type as type,
            qd.target_count as "targetCount",
            qd.target_action as "targetAction",
            qd.xp_reward as "xpReward",
            qd.badge_reward as "badgeReward",
            qd.platform,
            qd.quest_category as "questCategory",
            COALESCE(gcq.personalized_musk_tip, gsq.personalized_musk_tip, qd.musk_tip) as "muskTip",
            COALESCE(gcq.deliverable_format, qd.deliverable_format) as "deliverableFormat",
            qd.quantity_value as "quantityValue",
            qd.quantity_type as "quantityType",
            qd.platform_constraints as "platformConstraints",
            COALESCE(gcq.guidance_snippet, qd.guidance_snippet) as "guidanceSnippet",
            COALESCE(gcq.estimated_time_minutes, qd.estimated_time_minutes) as "estimatedTimeMinutes",
            COALESCE(gcq.difficulty_level, qd.difficulty_level) as "difficultyLevel"
          FROM user_quests uq
          JOIN quest_definitions qd ON uq.quest_definition_id = qd.id
          LEFT JOIN LATERAL (
            SELECT * FROM generated_career_quests
            WHERE user_id = uq.user_id
              AND quest_definition_id = uq.quest_definition_id
              AND assigned_date = uq.assigned_date::text
            ORDER BY id DESC
            LIMIT 1
          ) gcq ON true
          LEFT JOIN LATERAL (
            SELECT * FROM generated_social_quests
            WHERE user_id = uq.user_id
              AND quest_definition_id = uq.quest_definition_id
              AND assigned_date = uq.assigned_date::text
            ORDER BY id DESC
            LIMIT 1
          ) gsq ON true
          WHERE uq.user_id = $1
            AND (uq.status = 'expired' OR uq.status = 'dismissed')
          ORDER BY uq.assigned_at DESC
        `, [userId]);
        
        quests = result.rows.map(row => {
          const questData = {
            ...row,
            definition: {
              id: row.questDefinitionId,
              title: row.title,
              description: row.description,
              type: row.type,
              targetCount: row.targetCount,
              targetAction: row.targetAction,
              xpReward: row.xpReward,
              badgeReward: row.badgeReward,
              platform: row.platform,
              muskTip: row.muskTip,
              deliverableFormat: row.deliverableFormat,
              quantityValue: row.quantityValue,
              quantityType: row.quantityType,
              platformConstraints: row.platformConstraints,
              guidanceSnippet: row.guidanceSnippet
            }
          };
          // Double-check top-level fields match for frontend safety
          if (!questData.title && questData.definition.title) questData.title = questData.definition.title;
          if (!questData.description && questData.definition.description) questData.description = questData.definition.description;
          if (!questData.muskTip && questData.definition.muskTip) questData.muskTip = questData.definition.muskTip;
          return questData;
        }).filter(isSocialQuest);
      }

      res.json(quests || []);
    } catch (error: any) {
      console.error('Error fetching social bucket quests:', error);
      
      // Graceful error handling for Neon database cold start / unavailability
      if (error.message?.includes('Database temporarily unavailable') || 
          error.message?.includes('endpoint has been disabled') ||
          error.message?.includes('endpoint is paused')) {
        return res.status(503).json({ 
          error: 'Database waking up',
          message: 'System is warming up. Please refresh in a few seconds.',
          retryAfter: 5
        });
      }
      
      res.status(500).json({ error: 'Failed to fetch social bucket quests' });
    }
  });

  // Daily quest retrieval route with self-healing assignment
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
        
        // First, try to get existing daily quests
        let dailyQuests = await storage.getCurrentDayUserQuests(userId);
        
        // Self-healing: If no quests found for today, assign them automatically
        if (!dailyQuests || dailyQuests.length === 0) {
          console.log(`[GET /users/${userId}/quests/current-day] No quests found, auto-assigning daily quests...`);
          try {
            // Assign daily career quests to this user
            const assignedQuests = await storage.assignDailyQuestsToUser(userId);
            console.log(`[GET /users/${userId}/quests/current-day] ✅ Auto-assigned ${assignedQuests.length} career quests`);
            
            // Fetch the newly assigned quests with definitions
            dailyQuests = await storage.getCurrentDayUserQuests(userId);
          } catch (assignError) {
            console.error(`[GET /users/${userId}/quests/current-day] Error auto-assigning quests:`, assignError);
            // Still return empty array to prevent crashes
          }
        }
        
        res.json(dailyQuests || []);
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
      
      // TODO: Re-enable when socialQuestPersonalizationService is available
      // const personalizedQuest = await socialQuestPersonalizationService.generatePersonalizedSocialQuest(
      //   userId, 
      //   platform, 
      //   'share_content'
      const personalizedQuest = null; // Temporary fix
      
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

  // Social Quest Daily endpoints with self-healing assignment
  apiRouter.get("/users/:userId/social-quests/current-day", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      // First, try to get existing daily social quests
      let dailySocialQuests = await storage.getCurrentDaySocialQuests(userId);
      
      // Self-healing: If no social quests found for today, assign them automatically
      if (!dailySocialQuests || dailySocialQuests.length === 0) {
        console.log(`[GET /users/${userId}/social-quests/current-day] No social quests found, auto-assigning...`);
        try {
          // Assign daily social quests to this user
          const assignedSocialQuests = await storage.assignDailySocialQuests(userId);
          console.log(`[GET /users/${userId}/social-quests/current-day] ✅ Auto-assigned ${assignedSocialQuests.length} social quests`);
          
          // Fetch the newly assigned social quests
          dailySocialQuests = await storage.getCurrentDaySocialQuests(userId);
        } catch (assignError) {
          console.error(`[GET /users/${userId}/social-quests/current-day] Error auto-assigning social quests:`, assignError);
          // Still return empty array to prevent crashes
        }
      }
      
      res.json(dailySocialQuests || []);
    } catch (error) {
      console.error(`[GET /users/${req.params.userId}/social-quests/current-day] Error:`, error);
      res.status(500).json({ message: 'Failed to fetch daily social quests' });
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

  // Admin endpoint for production backfill - assigns quests to all users
  apiRouter.post("/admin/quests/assign-all-users", async (req, res) => {
    try {
      // Basic security check - require ADMIN_TOKEN environment variable
      const adminToken = req.headers.authorization || req.query.token;
      if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
        return res.status(401).json({ error: 'Unauthorized - Admin token required' });
      }

      console.log('[ADMIN] Starting bulk quest assignment to all users...');
      
      // Get all active users
      const users = await storage.getAllUsers();
      console.log(`[ADMIN] Found ${users.length} users for quest assignment`);
      
      let successCount = 0;
      let errorCount = 0;
      const results = [];
      
      const { dailyQuestScheduler } = await import('./services/daily-quest-scheduler');

      // Assign quests to each user
      for (const user of users) {
        try {
          const assignedQuests = await dailyQuestScheduler.triggerDailyAssignmentForUser(user.id, { force: true });
          const careerQuests = assignedQuests.filter(isCareerQuest);
          const socialQuests = assignedQuests.filter(isSocialQuest);
          
          results.push({
            userId: user.id,
            name: user.name,
            careerQuests: careerQuests.length,
            socialQuests: socialQuests.length,
            status: 'success'
          });
          
          successCount++;
          console.log(`[ADMIN] ✅ User ${user.id} (${user.name}): ${careerQuests.length} career + ${socialQuests.length} social quests`);
          
        } catch (userError) {
          console.error(`[ADMIN] ❌ Error assigning quests to user ${user.id}:`, userError);
          results.push({
            userId: user.id,
            name: user.name || 'Unknown',
            error: userError.message,
            status: 'error'
          });
          errorCount++;
        }
      }
      
      const summary = {
        totalUsers: users.length,
        successCount,
        errorCount,
        timestamp: new Date().toISOString(),
        results
      };
      
      console.log(`[ADMIN] ✅ Bulk assignment complete: ${successCount} success, ${errorCount} errors`);
      res.json(summary);
      
    } catch (error) {
      console.error('[ADMIN] Error in bulk quest assignment:', error);
      res.status(500).json({ error: 'Failed to assign quests to users', details: error.message });
    }
  });

  console.log("Career Quests and Social Quests routes loaded");
}
