/**
 * Social Quests API Routes
 * 
 * Handles AI-powered Social Quest generation, assignment, and progress tracking.
 * Integrates with existing Brand Quest infrastructure while adding platform-specific features.
 */

import { Express, Request, Response } from "express";
import { z } from "zod";
import { SocialQuestAIGenerator } from "./services/social-quest-ai-generator";
import { db } from "./db";
import { 
  socialQuestDefinitions, 
  userSocialQuests, 
  questDefinitions, 
  userQuests,
  insertSocialQuestDefinitionSchema,
  insertUserSocialQuestSchema,
  SocialQuestDefinition,
  UserSocialQuest
} from "../shared/schema";
import { eq, and, desc } from "drizzle-orm";

// Initialize AI generator
const socialQuestAI = new SocialQuestAIGenerator();

// Helper function to get current week number
function getCurrentWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = (now.getTime() - start.getTime() + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000));
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.floor(diff / oneWeek) + 1;
}

// Request validation schemas
const generateSocialQuestsSchema = z.object({
  userId: z.number(),
  weekNumber: z.number().min(1).max(52),
  year: z.number().min(2024),
  forceRegenerate: z.boolean().optional().default(false)
});

const updateProgressSchema = z.object({
  socialQuestId: z.number(),
  progress: z.number().min(0),
  actualPlatformEngagement: z.number().min(0).optional(),
  userFeedbackRating: z.number().min(1).max(5).optional()
});

const platformFeedbackSchema = z.object({
  socialQuestId: z.number(),
  rating: z.number().min(1).max(5),
  feedback: z.string().max(500).optional()
});

export default function setupSocialQuestRoutes(app: Express) {
  
  /**
   * Generate AI-powered Social Quests for a user
   * POST /api/social-quests/generate
   */
  app.post('/api/social-quests/generate', async (req: Request, res: Response) => {
    try {
      const validatedData = generateSocialQuestsSchema.parse(req.body);
      console.log(`[Social Quests API] Generating quests for user ${validatedData.userId}, week ${validatedData.weekNumber}`);

      // Check if quests already exist for this week (unless force regenerate)
      if (!validatedData.forceRegenerate) {
        const existingQuests = await getSocialQuestsForWeek(
          validatedData.userId, 
          validatedData.weekNumber, 
          validatedData.year
        );
        
        if (existingQuests.length > 0) {
          return res.status(200).json({
            success: true,
            message: 'Social quests already exist for this week',
            quests: existingQuests,
            generated: false
          });
        }
      }

      // Generate new AI-powered Social Quests
      const aiGeneratedTasks = await socialQuestAI.generateSocialQuests(
        validatedData.userId,
        validatedData.weekNumber, 
        validatedData.year
      );

      // Store generated tasks in database
      const createdQuests = await storeSocialQuests(
        validatedData.userId,
        aiGeneratedTasks,
        validatedData.weekNumber,
        validatedData.year
      );

      res.status(201).json({
        success: true,
        message: `Generated ${createdQuests.length} personalized Social Quests`,
        quests: createdQuests,
        generated: true,
        aiAnalysis: {
          totalTasks: aiGeneratedTasks.length,
          platformBreakdown: getPlatformBreakdown(aiGeneratedTasks),
          primaryFocus: 'Brandentifier (60% focus)'
        }
      });

    } catch (error) {
      console.error('[Social Quests API] Error generating quests:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate Social Quests',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Get Social Quests for a specific user and week
   * GET /api/social-quests/user/:userId/week/:weekNumber/:year
   */
  app.get('/api/social-quests/user/:userId/week/:weekNumber/:year', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const weekNumber = parseInt(req.params.weekNumber);
      const year = parseInt(req.params.year);

      if (!userId || !weekNumber || !year) {
        return res.status(400).json({
          success: false,
          error: 'Invalid parameters'
        });
      }

      const socialQuests = await getSocialQuestsForWeek(userId, weekNumber, year);

      res.status(200).json({
        success: true,
        quests: socialQuests,
        week: weekNumber,
        year: year,
        totalQuests: socialQuests.length,
        platformSummary: getPlatformSummary(socialQuests)
      });

    } catch (error) {
      console.error('[Social Quests API] Error fetching weekly quests:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch Social Quests'
      });
    }
  });

  // TEMPORARY: Add old endpoint back but return empty data to fix caching issues
  app.get('/api/social-quests/user/:userId', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'Invalid user ID'
        });
      }

      // Return empty data to break the old 4-task system
      res.json({
        success: true,
        quests: [], // Empty - forces use of new 3-tab system
        pagination: {
          page: 1,
          limit: 20,
          hasMore: false
        }
      });
    } catch (error) {
      console.error('[Social Quests API] Error in old endpoint:', error);
      res.status(500).json({
        success: false,
        error: 'Endpoint deprecated - use /weekly, /completed, /missed endpoints'
      });
    }
  });

  /**
   * Update Social Quest progress
   * PATCH /api/social-quests/:socialQuestId/progress
   */
  app.patch('/api/social-quests/:socialQuestId/progress', async (req: Request, res: Response) => {
    try {
      const socialQuestId = parseInt(req.params.socialQuestId);
      const validatedData = updateProgressSchema.parse(req.body);

      if (!socialQuestId) {
        return res.status(400).json({
          success: false,
          error: 'Invalid social quest ID'
        });
      }

      const updated = await updateSocialQuestProgress(socialQuestId, validatedData);

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: 'Social Quest not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Social Quest progress updated',
        quest: updated
      });

    } catch (error) {
      console.error('[Social Quests API] Error updating progress:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update Social Quest progress'
      });
    }
  });

  /**
   * Submit platform feedback for Social Quest
   * POST /api/social-quests/:socialQuestId/feedback
   */
  app.post('/api/social-quests/:socialQuestId/feedback', async (req: Request, res: Response) => {
    try {
      const socialQuestId = parseInt(req.params.socialQuestId);
      const validatedData = platformFeedbackSchema.parse(req.body);

      if (!socialQuestId) {
        return res.status(400).json({
          success: false,
          error: 'Invalid social quest ID'
        });
      }

      await submitPlatformFeedback(socialQuestId, validatedData);

      res.status(200).json({
        success: true,
        message: 'Feedback submitted successfully'
      });

    } catch (error) {
      console.error('[Social Quests API] Error submitting feedback:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to submit feedback'
      });
    }
  });

  /**
   * Get platform analytics for user
   * GET /api/social-quests/analytics/:userId
   */
  app.get('/api/social-quests/analytics/:userId', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const timeframe = req.query.timeframe as string || 'month'; // week, month, quarter

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'Invalid user ID'
        });
      }

      const analytics = await getSocialQuestAnalytics(userId, timeframe);

      res.status(200).json({
        success: true,
        analytics: analytics,
        timeframe: timeframe
      });

    } catch (error) {
      console.error('[Social Quests API] Error fetching analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch analytics'
      });
    }
  });

  /**
   * Get current week Social Quests for user
   * GET /api/social-quests/user/:userId/weekly
   */
  app.get('/api/social-quests/user/:userId/weekly', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'Invalid user ID'
        });
      }

      const now = new Date();
      const weekNumber = getCurrentWeekNumber();
      const year = now.getFullYear();
      
      console.log(`[Social Quests API] Fetching weekly quests for user ${userId}, week ${weekNumber}`);

      // Get active Social Quests for current week using the userQuests table structure
      const weeklySocialQuests = await db
        .select({
          // User Quest data
          id: userQuests.id,
          userId: userQuests.userId,
          questDefinitionId: userQuests.questDefinitionId,
          status: userQuests.status,
          progress: userQuests.progress,
          assignedAt: userQuests.assignedAt,
          completedAt: userQuests.completedAt,
          weekNumber: userQuests.weekNumber,
          year: userQuests.year,
          xpEarned: userQuests.xpEarned,
          badgeEarned: userQuests.badgeEarned,
          muskResponse: userQuests.muskResponse,
          
          // Quest Definition data
          title: questDefinitions.title,
          description: questDefinitions.description,
          type: questDefinitions.type,
          targetCount: questDefinitions.targetCount,
          targetAction: questDefinitions.targetAction,
          xpReward: questDefinitions.xpReward,
          badgeReward: questDefinitions.badgeReward,
          muskTip: questDefinitions.muskTip,
          
          // Social Quest specific data
          socialQuestId: userSocialQuests.id,
          aiGeneratedContent: userSocialQuests.aiGeneratedContent,
          platformRecommendationReason: userSocialQuests.platformRecommendationReason,
          platformEngagementGoal: userSocialQuests.platformEngagementGoal,
          actualPlatformEngagement: userSocialQuests.actualPlatformEngagement,
          userFeedbackRating: userSocialQuests.userFeedbackRating,
          
          // Social Quest Definition data  
          targetPlatform: socialQuestDefinitions.targetPlatform,
          platformPriority: socialQuestDefinitions.platformPriority,
          contentTemplate: socialQuestDefinitions.contentTemplate,
          platformSpecificData: socialQuestDefinitions.platformSpecificData
        })
        .from(userQuests)
        .leftJoin(questDefinitions, eq(userQuests.questDefinitionId, questDefinitions.id))
        .leftJoin(userSocialQuests, eq(userSocialQuests.userQuestId, userQuests.id))
        .leftJoin(socialQuestDefinitions, eq(userSocialQuests.socialQuestDefinitionId, socialQuestDefinitions.id))
        .where(
          and(
            eq(userQuests.userId, userId),
            eq(userQuests.weekNumber, weekNumber),
            eq(userQuests.year, year),
            eq(userQuests.status, 'active'),
            eq(questDefinitions.type, 'social_quest')
          )
        )
        .orderBy(desc(userQuests.assignedAt));

      res.status(200).json({
        success: true,
        weekNumber: weekNumber,
        year: year,
        quests: weeklySocialQuests
      });

    } catch (error) {
      console.error('[Social Quests API] Error fetching weekly quests:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch weekly Social Quests'
      });
    }
  });

  /**
   * Get completed Social Quests for user
   * GET /api/social-quests/user/:userId/completed
   */
  app.get('/api/social-quests/user/:userId/completed', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'Invalid user ID'
        });
      }

      console.log(`[Social Quests API] Fetching completed quests for user ${userId}`);

      const completedSocialQuests = await db
        .select({
          // User Quest data
          id: userQuests.id,
          userId: userQuests.userId,
          questDefinitionId: userQuests.questDefinitionId,
          status: userQuests.status,
          progress: userQuests.progress,
          assignedAt: userQuests.assignedAt,
          completedAt: userQuests.completedAt,
          weekNumber: userQuests.weekNumber,
          year: userQuests.year,
          xpEarned: userQuests.xpEarned,
          badgeEarned: userQuests.badgeEarned,
          muskResponse: userQuests.muskResponse,
          
          // Quest Definition data
          title: questDefinitions.title,
          description: questDefinitions.description,
          type: questDefinitions.type,
          targetCount: questDefinitions.targetCount,
          targetAction: questDefinitions.targetAction,
          xpReward: questDefinitions.xpReward,
          badgeReward: questDefinitions.badgeReward,
          muskTip: questDefinitions.muskTip,
          
          // Social Quest specific data
          socialQuestId: userSocialQuests.id,
          aiGeneratedContent: userSocialQuests.aiGeneratedContent,
          platformRecommendationReason: userSocialQuests.platformRecommendationReason,
          platformEngagementGoal: userSocialQuests.platformEngagementGoal,
          actualPlatformEngagement: userSocialQuests.actualPlatformEngagement,
          userFeedbackRating: userSocialQuests.userFeedbackRating,
          
          // Social Quest Definition data  
          targetPlatform: socialQuestDefinitions.targetPlatform,
          platformPriority: socialQuestDefinitions.platformPriority,
          contentTemplate: socialQuestDefinitions.contentTemplate,
          platformSpecificData: socialQuestDefinitions.platformSpecificData
        })
        .from(userQuests)
        .leftJoin(questDefinitions, eq(userQuests.questDefinitionId, questDefinitions.id))
        .leftJoin(userSocialQuests, eq(userSocialQuests.userQuestId, userQuests.id))
        .leftJoin(socialQuestDefinitions, eq(userSocialQuests.socialQuestDefinitionId, socialQuestDefinitions.id))
        .where(
          and(
            eq(userQuests.userId, userId),
            eq(userQuests.status, 'completed'),
            eq(questDefinitions.type, 'social_quest')
          )
        )
        .orderBy(desc(userQuests.completedAt))
        .limit(limit)
        .offset(offset);

      res.status(200).json({
        success: true,
        quests: completedSocialQuests,
        pagination: {
          page: page,
          limit: limit,
          hasMore: completedSocialQuests.length === limit
        }
      });

    } catch (error) {
      console.error('[Social Quests API] Error fetching completed quests:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch completed Social Quests'
      });
    }
  });

  /**
   * Get missed/expired Social Quests for user
   * GET /api/social-quests/user/:userId/missed
   */
  app.get('/api/social-quests/user/:userId/missed', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'Invalid user ID'
        });
      }

      console.log(`[Social Quests API] Fetching missed quests for user ${userId}`);

      const missedSocialQuests = await db
        .select({
          // User Quest data
          id: userQuests.id,
          userId: userQuests.userId,
          questDefinitionId: userQuests.questDefinitionId,
          status: userQuests.status,
          progress: userQuests.progress,
          assignedAt: userQuests.assignedAt,
          completedAt: userQuests.completedAt,
          weekNumber: userQuests.weekNumber,
          year: userQuests.year,
          xpEarned: userQuests.xpEarned,
          badgeEarned: userQuests.badgeEarned,
          muskResponse: userQuests.muskResponse,
          
          // Quest Definition data
          title: questDefinitions.title,
          description: questDefinitions.description,
          type: questDefinitions.type,
          targetCount: questDefinitions.targetCount,
          targetAction: questDefinitions.targetAction,
          xpReward: questDefinitions.xpReward,
          badgeReward: questDefinitions.badgeReward,
          muskTip: questDefinitions.muskTip,
          
          // Social Quest specific data
          socialQuestId: userSocialQuests.id,
          aiGeneratedContent: userSocialQuests.aiGeneratedContent,
          platformRecommendationReason: userSocialQuests.platformRecommendationReason,
          platformEngagementGoal: userSocialQuests.platformEngagementGoal,
          actualPlatformEngagement: userSocialQuests.actualPlatformEngagement,
          userFeedbackRating: userSocialQuests.userFeedbackRating,
          
          // Social Quest Definition data  
          targetPlatform: socialQuestDefinitions.targetPlatform,
          platformPriority: socialQuestDefinitions.platformPriority,
          contentTemplate: socialQuestDefinitions.contentTemplate,
          platformSpecificData: socialQuestDefinitions.platformSpecificData
        })
        .from(userQuests)
        .leftJoin(questDefinitions, eq(userQuests.questDefinitionId, questDefinitions.id))
        .leftJoin(userSocialQuests, eq(userSocialQuests.userQuestId, userQuests.id))
        .leftJoin(socialQuestDefinitions, eq(userSocialQuests.socialQuestDefinitionId, socialQuestDefinitions.id))
        .where(
          and(
            eq(userQuests.userId, userId),
            eq(userQuests.status, 'expired'),
            eq(questDefinitions.type, 'social_quest')
          )
        )
        .orderBy(desc(userQuests.assignedAt))
        .limit(limit)
        .offset(offset);

      res.status(200).json({
        success: true,
        quests: missedSocialQuests,
        pagination: {
          page: page,
          limit: limit,
          hasMore: missedSocialQuests.length === limit
        }
      });

    } catch (error) {
      console.error('[Social Quests API] Error fetching missed quests:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch missed Social Quests'
      });
    }
  });

  /**
   * Complete a Social Quest
   * POST /api/social-quests/user/:userId/quest/:questId/complete
   */
  app.post('/api/social-quests/user/:userId/quest/:questId/complete', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const questId = parseInt(req.params.questId);
      
      if (!userId || !questId) {
        return res.status(400).json({
          success: false,
          error: 'Invalid user ID or quest ID'
        });
      }

      console.log(`[Social Quests API] Completing quest ${questId} for user ${userId}`);

      // First get the quest to check its target count
      const questInfo = await db
        .select({
          targetCount: questDefinitions.targetCount,
          xpReward: questDefinitions.xpReward,
          badgeReward: questDefinitions.badgeReward
        })
        .from(userQuests)
        .leftJoin(questDefinitions, eq(userQuests.questDefinitionId, questDefinitions.id))
        .where(
          and(
            eq(userQuests.id, questId),
            eq(userQuests.userId, userId),
            eq(userQuests.status, 'active')
          )
        )
        .limit(1);

      if (questInfo.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Quest not found or already completed'
        });
      }

      // Update quest status to completed
      const completedQuest = await db
        .update(userQuests)
        .set({
          status: 'completed',
          progress: questInfo[0].targetCount || 1,
          completedAt: new Date(),
          xpEarned: questInfo[0].xpReward,
          badgeEarned: questInfo[0].badgeReward
        })
        .where(eq(userQuests.id, questId))
        .returning();

      res.status(200).json({
        success: true,
        message: 'Social Quest completed successfully',
        quest: completedQuest[0]
      });

    } catch (error) {
      console.error('[Social Quests API] Error completing quest:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to complete Social Quest'
      });
    }
  });
}

// Helper functions for database operations

/**
 * Get Social Quests for a specific week
 */
async function getSocialQuestsForWeek(userId: number, weekNumber: number, year: number) {
  
  return await db
    .select({
      id: userSocialQuests.id,
      userQuestId: userSocialQuests.userQuestId,
      platform: socialQuestDefinitions.targetPlatform,
      priority: socialQuestDefinitions.platformPriority,
      questTitle: questDefinitions.title,
      questDescription: questDefinitions.description,
      aiGeneratedContent: userSocialQuests.aiGeneratedContent,
      platformRecommendationReason: userSocialQuests.platformRecommendationReason,
      progress: userQuests.progress,
      status: userQuests.status,
      xpReward: questDefinitions.xpReward,
      targetCount: questDefinitions.targetCount,
      targetAction: questDefinitions.targetAction,
      muskTip: questDefinitions.muskTip,
      userFeedbackRating: userSocialQuests.userFeedbackRating,
      actualPlatformEngagement: userSocialQuests.actualPlatformEngagement,
      createdAt: userSocialQuests.createdAt
    })
    .from(userSocialQuests)
    .innerJoin(socialQuestDefinitions, eq(userSocialQuests.socialQuestDefinitionId, socialQuestDefinitions.id))
    .innerJoin(userQuests, eq(userSocialQuests.userQuestId, userQuests.id))
    .innerJoin(questDefinitions, eq(userQuests.questDefinitionId, questDefinitions.id))
    .where(and(
      eq(userQuests.userId, userId),
      eq(userQuests.weekNumber, weekNumber),
      eq(userQuests.year, year)
    ))
    .orderBy(socialQuestDefinitions.platformPriority, desc(userSocialQuests.createdAt));
}

/**
 * Store AI-generated Social Quests in database
 */
async function storeSocialQuests(userId: number, aiTasks: any[], weekNumber: number, year: number) {
  const createdQuests = [];

  for (const task of aiTasks) {
    console.log('[Social Quest Debug] Processing task:', JSON.stringify(task, null, 2));
    // Create base quest definition
    const [questDef] = await db
      .insert(questDefinitions)
      .values({
        title: task.title,
        description: task.description,
        type: 'social_quest',
        targetCount: 1,
        targetAction: task.targetAction,
        xpReward: task.xpReward,
        muskTip: task.muskTip,
        isActive: true
      })
      .returning();

    // Create social quest definition
    const [socialQuestDef] = await db
      .insert(socialQuestDefinitions)
      .values({
        questDefinitionId: questDef.id,
        targetPlatform: task.platform,
        platformPriority: task.priority,
        contentTemplate: task.aiGeneratedContent,
        platformSpecificData: task.platformSpecificData,
        aiGenerationPrompt: `Generated for ${task.platform}`,
        isAiGenerated: true
      })
      .returning();

    // Create user quest assignment
    const [userQuest] = await db
      .insert(userQuests)
      .values({
        userId: userId,
        questDefinitionId: questDef.id,
        status: 'active',
        progress: 0,
        weekNumber: weekNumber,
        year: year
      })
      .returning();

    // Create user social quest
    const [userSocialQuest] = await db
      .insert(userSocialQuests)
      .values({
        userQuestId: userQuest.id,
        socialQuestDefinitionId: socialQuestDef.id,
        aiGeneratedContent: task.aiGeneratedContent,
        platformRecommendationReason: task.platformRecommendationReason,
        platformEngagementGoal: 100 // Default engagement goal
      })
      .returning();

    createdQuests.push({
      ...userSocialQuest,
      questDetails: questDef,
      socialDetails: socialQuestDef,
      userQuest: userQuest
    });
  }

  return createdQuests;
  
  // REMOVED: Old single-endpoint API - replaced with /weekly, /completed, /missed endpoints

  // POST /api/social-quests/:questId/complete - Complete a Social Quest
  app.post('/api/social-quests/:questId/complete', async (req, res) => {
    try {
      const questId = parseInt(req.params.questId);
      const { userId } = req.body;
      
      if (!questId || !userId) {
        return res.status(400).json({ error: 'Quest ID and User ID are required' });
      }

      // Find the user social quest
      const [socialQuest] = await db.db
        .select({
          userQuestId: userSocialQuests.userQuestId,
          xpReward: questDefinitions.xpReward
        })
        .from(userSocialQuests)
        .innerJoin(userQuests, eq(userSocialQuests.userQuestId, userQuests.id))
        .innerJoin(questDefinitions, eq(userQuests.questDefinitionId, questDefinitions.id))
        .where(and(
          eq(userSocialQuests.id, questId),
          eq(userQuests.userId, userId),
          eq(userQuests.status, 'active')
        ))
        .limit(1);

      if (!socialQuest) {
        return res.status(404).json({ error: 'Active social quest not found' });
      }

      // Complete the quest
      await db.db
        .update(userQuests)
        .set({
          status: 'completed',
          completedAt: new Date(),
          progress: 100
        })
        .where(eq(userQuests.id, socialQuest.userQuestId));

      // Award XP (this would integrate with the XP system)
      console.log(`[Social Quests] User ${userId} completed quest ${questId}, awarded ${socialQuest.xpReward} XP`);

      res.json({ 
        success: true, 
        message: 'Social quest completed successfully',
        xpAwarded: socialQuest.xpReward
      });
    } catch (error) {
      console.error('[Social Quests API] Error completing quest:', error);
      res.status(500).json({ error: 'Failed to complete social quest' });
    }
  });
}

/**
 * Get platform breakdown for analytics
 */
function getPlatformBreakdown(tasks: any[]) {
  const breakdown: { [key: string]: number } = {};
  
  tasks.forEach(task => {
    breakdown[task.platform] = (breakdown[task.platform] || 0) + 1;
  });
  
  return breakdown;
}

/**
 * Get platform summary for UI display
 */
function getPlatformSummary(socialQuests: any[]) {
  const platforms = socialQuests.reduce((acc: any[], quest: any) => {
    const existing = acc.find(p => p.platform === quest.platform);
    if (existing) {
      existing.count++;
      existing.totalXP += quest.xpReward;
    } else {
      acc.push({
        platform: quest.platform,
        count: 1,
        priority: quest.priority,
        totalXP: quest.xpReward
      });
    }
    return acc;
  }, []);

  return platforms.sort((a, b) => a.priority - b.priority);
}

/**
 * Get user Social Quests with pagination
 */
async function getUserSocialQuests(userId: number, page: number, limit: number, platform?: string) {
  const offset = (page - 1) * limit;

  let query = db
    .select({
      id: userSocialQuests.id,
      platform: socialQuestDefinitions.targetPlatform,
      priority: socialQuestDefinitions.platformPriority,
      questTitle: questDefinitions.title,
      questDescription: questDefinitions.description,
      aiGeneratedContent: userSocialQuests.aiGeneratedContent,
      progress: userQuests.progress,
      status: userQuests.status,
      xpReward: questDefinitions.xpReward,
      weekNumber: userQuests.weekNumber,
      year: userQuests.year,
      createdAt: userSocialQuests.createdAt
    })
    .from(userSocialQuests)
    .innerJoin(socialQuestDefinitions, eq(userSocialQuests.socialQuestDefinitionId, socialQuestDefinitions.id))
    .innerJoin(userQuests, eq(userSocialQuests.userQuestId, userQuests.id))
    .innerJoin(questDefinitions, eq(userQuests.questDefinitionId, questDefinitions.id))
    .where(eq(userQuests.userId, userId))
    .orderBy(desc(userSocialQuests.createdAt))
    .limit(limit)
    .offset(offset);

  if (platform) {
    query = query.where(and(
      eq(userQuests.userId, userId),
      eq(socialQuestDefinitions.targetPlatform, platform)
    ));
  }

  return await query;
}

/**
 * Update Social Quest progress
 */
async function updateSocialQuestProgress(socialQuestId: number, updateData: any) {
  
  const [updated] = await db
    .update(userSocialQuests)
    .set({
      actualPlatformEngagement: updateData.actualPlatformEngagement,
      userFeedbackRating: updateData.userFeedbackRating,
      updatedAt: new Date()
    })
    .where(eq(userSocialQuests.id, socialQuestId))
    .returning();

  // Also update the base user quest progress
  if (updateData.progress !== undefined) {
    await db
      .update(userQuests)
      .set({
        progress: updateData.progress
      })
      .where(eq(userQuests.id, updated.userQuestId));
  }

  return updated;
}

/**
 * Submit platform feedback
 */
async function submitPlatformFeedback(socialQuestId: number, feedbackData: any) {
  
  await db
    .update(userSocialQuests)
    .set({
      userFeedbackRating: feedbackData.rating,
      updatedAt: new Date()
    })
    .where(eq(userSocialQuests.id, socialQuestId));
}

/**
 * Get Social Quest analytics
 */
async function getSocialQuestAnalytics(userId: number, timeframe: string) {
  
  // This is a simplified analytics implementation
  // In a real system, you'd calculate time-based filtering
  const quests = await db
    .select({
      platform: socialQuestDefinitions.targetPlatform,
      status: userQuests.status,
      xpEarned: userQuests.xpEarned,
      userFeedbackRating: userSocialQuests.userFeedbackRating,
      actualEngagement: userSocialQuests.actualPlatformEngagement,
      weekNumber: userQuests.weekNumber,
      year: userQuests.year
    })
    .from(userSocialQuests)
    .innerJoin(socialQuestDefinitions, eq(userSocialQuests.socialQuestDefinitionId, socialQuestDefinitions.id))
    .innerJoin(userQuests, eq(userSocialQuests.userQuestId, userQuests.id))
    .where(eq(userQuests.userId, userId));

  // Process analytics data
  const analytics = {
    totalQuests: quests.length,
    completedQuests: quests.filter(q => q.status === 'completed').length,
    totalXPEarned: quests.reduce((sum, q) => sum + (q.xpEarned || 0), 0),
    averageRating: quests.filter((q: any) => q.userFeedbackRating).reduce((sum: number, q: any, _: any, arr: any) => sum + q.userFeedbackRating! / arr.length, 0),
    platformBreakdown: getPlatformBreakdown(quests),
    completionRate: quests.length > 0 ? (quests.filter((q: any) => q.status === 'completed').length / quests.length) * 100 : 0
  };

  return analytics;
}