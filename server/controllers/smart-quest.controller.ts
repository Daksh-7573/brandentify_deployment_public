/**
 * Smart Quest Generation Controller
 * Handles weekly quest generation with duplicate prevention and post suggestions
 */

import { Request, Response } from 'express';
import { db } from '../db';
import { users, skills, workExperiences, educations, userQuests, questDefinitions } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import { smartPostSuggestionEngine } from '../services/smart-post-suggestion-engine';
import { weeklyQuestPreventionService } from '../services/weekly-quest-prevention';

function resolveUserId(req: Request): number | null {
  const unsafeReq = req as any;
  const userId = unsafeReq.user?.id || unsafeReq.session?.user?.id;
  return typeof userId === 'number' ? userId : null;
}

/**
 * GET /api/quests/weekly
 * Get or generate weekly quest for authenticated user
 */
export async function getWeeklyQuest(req: Request, res: Response) {
  try {
    const userId = resolveUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    console.log(`[QuestController] Fetching weekly quest for user ${userId}`);

    // Get user profile
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if profile is complete
    const profileComplete = weeklyQuestPreventionService.isProfileCompleteForQuests(user);

    if (!profileComplete) {
      console.log(`[QuestController] Profile incomplete. Returning fallback quest.`);
      
      const fallbackQuest = weeklyQuestPreventionService.generateProfileCompletionQuest([
        'name', 'title', 'industry', 'location'
      ].filter(field => !(user as any)[field]));

      return res.status(200).json({
        success: true,
        quest: fallbackQuest,
        profileComplete: false,
        message: 'Complete your profile to unlock personalized quests'
      });
    }

    // Check weekly quest status
    const weeklyCheck = await weeklyQuestPreventionService.checkWeeklyQuestStatus(userId);

    if (weeklyCheck.hasQuestThisWeek && weeklyCheck.lastQuest) {
      console.log(`[QuestController] Returning existing weekly quest for user ${userId}`);
      
      // Fetch full quest details with definition
      const [questWithDetails] = await db
        .select({
          id: userQuests.id,
          status: userQuests.status,
          progress: userQuests.progress,
          assignedAt: userQuests.assignedAt,
          completedAt: userQuests.completedAt,
          weekNumber: userQuests.weekNumber,
          year: userQuests.year,
          title: questDefinitions.title,
          description: questDefinitions.description,
          type: questDefinitions.type,
          targetAction: questDefinitions.targetAction,
          xpReward: questDefinitions.xpReward,
          estimatedTimeMinutes: questDefinitions.estimatedTimeMinutes
        })
        .from(userQuests)
        .leftJoin(questDefinitions, eq(userQuests.questDefinitionId, questDefinitions.id))
        .where(eq(userQuests.id, weeklyCheck.lastQuest.id))
        .limit(1);

      const questHash = weeklyQuestPreventionService.calculateQuestHash(
        questWithDetails?.title || '',
        questWithDetails?.description || ''
      );

      return res.status(200).json({
        success: true,
        quest: questWithDetails,
        questHash,
        profileComplete: true,
        isExisting: true,
        nextAvailableDate: weeklyCheck.nextAvailableDate
      });
    }

    // No quest this week - this would typically be handled by the scheduler
    // For now, return a message indicating quests are assigned automatically
    console.log(`[QuestController] No quest found for user ${userId} this week`);

    return res.status(200).json({
      success: true,
      quest: null,
      profileComplete: true,
      message: 'Weekly quests are assigned automatically. Check back soon!',
      nextAvailableDate: weeklyCheck.nextAvailableDate
    });

  } catch (error) {
    console.error('[QuestController] Error fetching weekly quest:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch weekly quest'
    });
  }
}

/**
 * GET /api/quests/post-suggestions
 * Get AI-powered post suggestions for user
 */
export async function getPostSuggestions(req: Request, res: Response) {
  try {
    const userId = resolveUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    console.log(`[QuestController] Generating post suggestions for user ${userId}`);

    // Get user profile
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user skills and experiences for better suggestions
    const userSkills = await db
      .select()
      .from(skills)
      .where(eq(skills.userId, userId));

    const userExperiences = await db
      .select()
      .from(workExperiences)
      .where(eq(workExperiences.userId, userId));

    // Check profile completeness
    const profileCheck = smartPostSuggestionEngine.isProfileCompleteForSuggestions(user);

    if (!profileCheck.isComplete) {
      console.log(`[QuestController] Profile incomplete for suggestions. Missing:`, profileCheck.missingFields);
      
      return res.status(200).json({
        success: true,
        suggestions: [smartPostSuggestionEngine.generateFallbackSuggestion()],
        profileComplete: false,
        profileCheck,
        message: 'Complete your profile to unlock personalized post suggestions'
      });
    }

    // Generate AI suggestions
    const count = parseInt(req.query.count as string) || 3;
    const suggestions = await smartPostSuggestionEngine.generatePostSuggestions(
      user,
      userSkills,
      userExperiences,
      count
    );

    console.log(`[QuestController] Generated ${suggestions.length} suggestions for user ${userId}`);

    return res.status(200).json({
      success: true,
      suggestions,
      profileComplete: true,
      profileCheck
    });

  } catch (error) {
    console.error('[QuestController] Error generating post suggestions:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate post suggestions'
    });
  }
}

/**
 * GET /api/quests/weekly-status
 * Check weekly quest status without generating
 */
export async function getWeeklyQuestStatus(req: Request, res: Response) {
  try {
    const userId = resolveUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const weeklyCheck = await weeklyQuestPreventionService.checkWeeklyQuestStatus(userId);

    return res.status(200).json({
      success: true,
      ...weeklyCheck
    });

  } catch (error) {
    console.error('[QuestController] Error checking weekly status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check weekly quest status'
    });
  }
}

/**
 * GET /api/smart-quests/debug/generate-quest
 * Debug endpoint to test uniqueness logic with optional lock window override.
 * Query params:
 *  - lockWindowMinutes: number (optional, e.g. 1 for fast testing)
 */
export async function debugGenerateQuest(req: Request, res: Response) {
  try {
    const userId = resolveUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const lockWindowMinutesRaw = req.query.lockWindowMinutes as string | undefined;
    const lockWindowMinutes = lockWindowMinutesRaw ? Number(lockWindowMinutesRaw) : undefined;
    const hasWindowOverride = Number.isFinite(lockWindowMinutes) && !!lockWindowMinutes && lockWindowMinutes > 0;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const profileComplete = weeklyQuestPreventionService.isProfileCompleteForQuests(user);
    if (!profileComplete) {
      const missingFields = ['name', 'title', 'industry', 'location'].filter((field) => {
        const value = (user as any)[field];
        return !value || value.toString().trim() === '';
      });

      const fallbackQuest = weeklyQuestPreventionService.generateProfileCompletionQuest(missingFields);
      const fallbackHash = weeklyQuestPreventionService.calculateQuestHash(fallbackQuest.title, fallbackQuest.description);

      return res.status(200).json({
        success: true,
        mode: 'profile_fallback',
        profileComplete: false,
        quest: fallbackQuest,
        questHash: fallbackHash,
        message: 'Profile incomplete, fallback quest returned'
      });
    }

    const status = hasWindowOverride
      ? await weeklyQuestPreventionService.checkQuestStatusWithWindow(userId, lockWindowMinutes)
      : await weeklyQuestPreventionService.checkWeeklyQuestStatus(userId);

    if (status.hasQuestThisWeek && status.lastQuest) {
      const [existing] = await db
        .select({
          id: userQuests.id,
          title: questDefinitions.title,
          description: questDefinitions.description,
          assignedAt: userQuests.assignedAt,
          status: userQuests.status,
          weekNumber: userQuests.weekNumber,
          year: userQuests.year
        })
        .from(userQuests)
        .leftJoin(questDefinitions, eq(userQuests.questDefinitionId, questDefinitions.id))
        .where(eq(userQuests.id, status.lastQuest.id))
        .limit(1);

      const existingHash = weeklyQuestPreventionService.calculateQuestHash(existing?.title || '', existing?.description || '');

      return res.status(200).json({
        success: true,
        mode: 'reused_existing',
        lockWindowMinutes: hasWindowOverride ? lockWindowMinutes : null,
        message: 'Quest already generated in active lock window/week. Returning existing quest.',
        quest: existing,
        questHash: existingHash,
        nextAvailableDate: status.nextAvailableDate
      });
    }

    const recentHashes = await weeklyQuestPreventionService.getRecentQuestHashes(userId, 4);
    const recentContent = await weeklyQuestPreventionService.getRecentQuestContent(userId, 4);

    const definitions = await db
      .select({
        id: questDefinitions.id,
        title: questDefinitions.title,
        description: questDefinitions.description
      })
      .from(questDefinitions)
      .where(eq(questDefinitions.isActive, true));

    if (!definitions.length) {
      return res.status(404).json({
        success: false,
        message: 'No active quest definitions available'
      });
    }

    const recentHashSet = new Set(recentHashes.map((item) => item.hash));
    const recentDescriptions = recentContent.map((item) => item.description || '');

    let chosen = definitions.find((item) => {
      const hash = weeklyQuestPreventionService.calculateQuestHash(item.title || '', item.description || '');
      if (recentHashSet.has(hash)) {
        return false;
      }

      const contentCheck = weeklyQuestPreventionService.isContentTooSimilarToRecent(
        item.description || '',
        recentDescriptions,
        weeklyQuestPreventionService.STRICT_CONTENT_SIMILARITY_THRESHOLD
      );

      return !contentCheck.tooSimilar;
    });

    if (!chosen) {
      let best = definitions[0];
      let bestSimilarity = Number.POSITIVE_INFINITY;
      for (const item of definitions) {
        const contentCheck = weeklyQuestPreventionService.isContentTooSimilarToRecent(
          item.description || '',
          recentDescriptions,
          weeklyQuestPreventionService.STRICT_CONTENT_SIMILARITY_THRESHOLD
        );
        if (contentCheck.maxSimilarity < bestSimilarity) {
          bestSimilarity = contentCheck.maxSimilarity;
          best = item;
        }
      }
      chosen = best;
    }

    const now = new Date();
    const weekNumber = weeklyQuestPreventionService.getWeekNumber(now);
    const year = now.getFullYear();
    const assignedDate = weeklyQuestPreventionService.getDateStringUTC(now);

    const [insertedQuest] = await db
      .insert(userQuests)
      .values({
        userId,
        questDefinitionId: chosen.id,
        status: 'active',
        progress: 0,
        assignedDate,
        weekNumber,
        year
      })
      .returning({
        id: userQuests.id,
        assignedAt: userQuests.assignedAt,
        weekNumber: userQuests.weekNumber,
        year: userQuests.year
      });

    const newQuestHash = weeklyQuestPreventionService.calculateQuestHash(chosen.title || '', chosen.description || '');
    const duplicateRecent = recentHashes.find((item) => item.hash === newQuestHash);
    const contentSimilarityCheck = weeklyQuestPreventionService.isContentTooSimilarToRecent(
      chosen.description || '',
      recentContent.map((item) => item.description || ''),
      weeklyQuestPreventionService.STRICT_CONTENT_SIMILARITY_THRESHOLD
    );

    console.log('---- QUEST GENERATION START ----');
    console.log('User ID:', userId);
    console.log('Last Quest:', recentHashes[0]?.title || null);
    console.log('Last Generated At:', insertedQuest?.assignedAt || null);
    console.log('NEW QUEST GENERATED:', chosen.title || 'Untitled Quest');
    console.log('Generated At:', now.toISOString());
    console.log('Quest Hash:', newQuestHash);
    if (duplicateRecent || contentSimilarityCheck.tooSimilar) {
      console.log('[WeeklyQuest] Duplicate/near-duplicate quest detected. Hash match ID:', duplicateRecent?.id || null, 'Max content similarity:', contentSimilarityCheck.maxSimilarity);
    }
    console.log('---- QUEST GENERATION END ----');

    return res.status(200).json({
      success: true,
      mode: 'new_generated',
      lockWindowMinutes: hasWindowOverride ? lockWindowMinutes : null,
      quest: {
        id: insertedQuest.id,
        title: chosen.title,
        description: chosen.description,
        assignedAt: insertedQuest.assignedAt,
        weekNumber: insertedQuest.weekNumber,
        year: insertedQuest.year
      },
      questHash: newQuestHash,
      duplicateInRecent4: !!duplicateRecent,
      duplicateMatchedQuestId: duplicateRecent?.id || null,
      maxContentSimilarityToRecent4: contentSimilarityCheck.maxSimilarity,
      contentTooSimilarToRecent4: contentSimilarityCheck.tooSimilar,
      recentHashes
    });
  } catch (error) {
    console.error('[QuestController] Debug generate quest error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to debug-generate quest',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Export controller functions
 */
export const smartQuestController = {
  getWeeklyQuest,
  getPostSuggestions,
  getWeeklyQuestStatus,
  debugGenerateQuest
};
