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

  /**
   * Get all Social Quests for a user with pagination
   * GET /api/social-quests/user/:userId
   */
  app.get('/api/social-quests/user/:userId', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const platform = req.query.platform as string;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'Invalid user ID'
        });
      }

      const socialQuests = await getUserSocialQuests(userId, page, limit, platform);

      res.status(200).json({
        success: true,
        quests: socialQuests,
        pagination: {
          page: page,
          limit: limit,
          hasMore: socialQuests.length === limit
        }
      });

    } catch (error) {
      console.error('[Social Quests API] Error fetching user quests:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user Social Quests'
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