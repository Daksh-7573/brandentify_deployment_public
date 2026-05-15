/**
 * Enhanced Quest Progress Tracker Service
 * 
 * Comprehensive automatic quest tracking system that monitors:
 * - Profile updates and completion
 * - Pulse creation and engagement
 * - Networking activities (connections, messages)
 * - Career capsule updates
 * - Smart connect usage
 * - Content interactions
 * 
 * Automatically updates quest progress and completes quests when criteria are met.
 */

import { db } from '../db';
import { userQuests, questDefinitions } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';

/**
 * Comprehensive action types that can trigger quest progress updates
 */
export type TrackingActionType = 
  // Content Creation Actions
  | 'pulse_created'
  | 'pulse_published'
  | 'pulse_with_media_created'
  | 'pulse_with_hashtags_created'
  | 'project_showcase_created'
  | 'poll_created'
  
  // Engagement Actions  
  | 'post_liked'
  | 'post_commented'
  | 'post_shared'
  | 'insightful_reaction_added'
  | 'misinformed_reaction_added'
  | 'comment_thread_participation'
  
  // Networking Actions
  | 'connection_request_sent'
  | 'connection_accepted'
  | 'connection_received'
  | 'direct_message_sent'
  | 'conversation_started'
  | 'professional_outreach_sent'
  | 'profile_viewed'
  | 'profile_engagement_liked'
  | 'profile_engagement_commented'
  
  // Profile Actions
  | 'profile_field_updated'
  | 'work_experience_added'
  | 'skill_added'
  | 'skill_endorsed'
  | 'profile_photo_uploaded'
  | 'cover_image_uploaded'
  | 'portfolio_project_added'
  | 'education_added'
  | 'certification_added'
  | 'recommendation_received'
  | 'recommendation_given'
  | 'profile_completion_increased'
  | 'headline_optimized'
  | 'summary_updated'
  
  // Smart Connect Actions
  | 'smart_connect_used'
  | 'connection_suggestion_accepted'
  | 'industry_professional_contacted'
  
  // Career Capsule Actions
  | 'career_goal_created'
  | 'career_goal_updated'
  | 'milestone_completed'
  | 'task_completed'
  | 'career_capsule_updated'
  
  // Search & Discovery Actions
  | 'search_performed'
  | 'advanced_filter_used'
  | 'industry_search_conducted'
  
  // Resume Actions
  | 'resume_updated'
  | 'resume_parsed'
  | 'achievement_added'
  
  // Brand Quest Actions
  | 'brand_goal_set'
  | 'weekly_quest_completed'
  | 'streak_maintained';

/**
 * Action metadata for detailed tracking
 */
interface ActionMetadata {
  targetUserId?: number;
  postId?: number;
  projectId?: number;
  connectionId?: number;
  fieldName?: string;
  skillName?: string;
  goalId?: number;
  searchQuery?: string;
  platform?: string;
  [key: string]: any;
}

/**
 * Quest progress update result
 */
interface ProgressUpdateResult {
  questId: number;
  previousProgress: number;
  newProgress: number;
  targetCount: number;
  completed: boolean;
  xpAwarded: number;
}

/**
 * Track a user action and update relevant quest progress
 */
export async function trackUserActionEnhanced(
  userId: number,
  actionType: TrackingActionType,
  count: number = 1,
  metadata?: ActionMetadata
): Promise<ProgressUpdateResult[]> {
  const results: ProgressUpdateResult[] = [];
  
  try {
    console.log(`[EnhancedQuestTracker] Tracking action: ${actionType} for user ${userId}, count: ${count}`);
    
    // 1. Get user's active quests
    const activeQuests = await getActiveUserQuests(userId);
    if (!activeQuests || activeQuests.length === 0) {
      console.log(`[EnhancedQuestTracker] No active quests for user ${userId}`);
      return results;
    }
    
    // 2. Find quests that should track this action
    const matchingQuests = findMatchingQuests(activeQuests, actionType, metadata);
    
    if (matchingQuests.length === 0) {
      console.log(`[EnhancedQuestTracker] No matching quests for action ${actionType}`);
      return results;
    }
    
    console.log(`[EnhancedQuestTracker] Found ${matchingQuests.length} matching quests for action ${actionType}`);
    
    // 3. Update progress for each matching quest
    for (const { quest, definition } of matchingQuests) {
      const result = await updateQuestProgress(userId, quest, definition, count, actionType);
      if (result) {
        results.push(result);
      }
    }
    
    return results;
  } catch (error) {
    console.error(`[EnhancedQuestTracker] Error tracking action ${actionType}:`, error);
    return results;
  }
}

/**
 * Get active quests for a user with their definitions
 */
async function getActiveUserQuests(userId: number) {
  try {
    const quests = await db
      .select({
        quest: userQuests,
        definition: questDefinitions
      })
      .from(userQuests)
      .innerJoin(questDefinitions, eq(userQuests.questDefinitionId, questDefinitions.id))
      .where(
        and(
          eq(userQuests.userId, userId),
          eq(userQuests.status, 'active')
        )
      );
    
    return quests;
  } catch (error) {
    console.error(`[EnhancedQuestTracker] Error fetching active quests:`, error);
    return [];
  }
}

/**
 * Find quests that match the given action type
 */
function findMatchingQuests(
  quests: any[],
  actionType: TrackingActionType,
  metadata?: ActionMetadata
): Array<{ quest: any; definition: any }> {
  const matching: Array<{ quest: any; definition: any }> = [];
  
  for (const { quest, definition } of quests) {
    // Check if quest has auto-tracking conditions defined
    const trackingConditions = definition.autoTrackingConditions || [];
    const targetAction = definition.targetAction;
    
    // Match by tracking condition
    if (trackingConditions.includes(actionType)) {
      matching.push({ quest, definition });
      continue;
    }
    
    // Match by target action (legacy support)
    if (matchesTargetAction(actionType, targetAction)) {
      matching.push({ quest, definition });
      continue;
    }
    
    // Special matching logic for specific action types
    if (matchesSpecialConditions(actionType, definition, metadata)) {
      matching.push({ quest, definition });
    }
  }
  
  return matching;
}

/**
 * Check if action type matches the quest's target action
 */
function matchesTargetAction(actionType: TrackingActionType, targetAction: string): boolean {
  const actionToTargetMap: Record<string, string[]> = {
    'pulse_created': ['create_pulse', 'create_content', 'pulse_creation'],
    'pulse_published': ['create_pulse', 'publish_content', 'pulse_creation'],
    'pulse_with_media_created': ['create_media_pulse', 'add_media', 'media_content'],
    'post_liked': ['engage_with_post', 'add_reaction', 'post_engagement'],
    'post_commented': ['engage_with_post', 'add_comment', 'post_engagement', 'comment_on_post'],
    'connection_request_sent': ['make_connection', 'send_connection_request', 'networking'],
    'connection_accepted': ['make_connection', 'accept_connection', 'networking'],
    'profile_field_updated': ['update_profile', 'enhance_profile', 'profile_update'],
    'work_experience_added': ['update_profile', 'add_experience', 'profile_update'],
    'skill_added': ['update_profile', 'add_skill', 'profile_update'],
    'career_goal_created': ['create_career_goal', 'update_career_capsule', 'career_capsule'],
    'milestone_completed': ['complete_milestone', 'update_career_capsule', 'career_capsule'],
    'smart_connect_used': ['use_smart_connect', 'smart_connect', 'networking'],
    'search_performed': ['perform_search', 'search', 'discovery'],
    'resume_updated': ['update_resume', 'resume_update', 'resume_enhancement'],
  };
  
  const possibleTargets = actionToTargetMap[actionType] || [actionType];
  return possibleTargets.includes(targetAction);
}

/**
 * Special matching logic for complex conditions
 */
function matchesSpecialConditions(
  actionType: TrackingActionType,
  definition: any,
  metadata?: ActionMetadata
): boolean {
  // Networking quests - track profile views and engagements
  if (definition.category === 'networking' || definition.type === 'networking') {
    if (['profile_viewed', 'profile_engagement_liked', 'profile_engagement_commented'].includes(actionType)) {
      return true;
    }
  }
  
  // Profile quests - track any profile update
  if (definition.category === 'profile' || definition.type === 'profile_update') {
    if (actionType.startsWith('profile_') || 
        actionType.includes('work_experience') ||
        actionType.includes('skill_') ||
        actionType.includes('education') ||
        actionType.includes('certification') ||
        actionType.includes('recommendation')) {
      return true;
    }
  }
  
  // Career capsule quests
  if (definition.category === 'career' && definition.type?.includes('career')) {
    if (actionType.startsWith('career_') || actionType.includes('milestone') || actionType.includes('task_')) {
      return true;
    }
  }
  
  // Engagement quests - track likes, comments, reactions
  if (definition.targetAction?.includes('engage') || definition.category === 'engagement') {
    if (['post_liked', 'post_commented', 'insightful_reaction_added', 'comment_thread_participation'].includes(actionType)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Update quest progress with comprehensive tracking
 */
async function updateQuestProgress(
  userId: number,
  quest: any,
  definition: any,
  count: number,
  actionType: TrackingActionType
): Promise<ProgressUpdateResult | null> {
  try {
    const currentProgress = quest.progress || 0;
    const targetCount = definition.targetCount || 1;
    const newProgress = Math.min(currentProgress + count, targetCount);
    const completionPercentage = Math.floor((newProgress / targetCount) * 100);
    
    // Prepare update data
    const updateData: any = {
      progress: newProgress,
      completionPercentage,
      lastTrackedAt: new Date(),
    };
    
    // Track the activity
    const trackedActivities = quest.trackedActivities || [];
    trackedActivities.push({
      action: actionType,
      timestamp: new Date().toISOString(),
      count
    });
    updateData.trackedActivities = trackedActivities.slice(-50); // Keep last 50 activities
    
    // Check if quest is completed
    const isCompleted = newProgress >= targetCount;
    
    if (isCompleted && !quest.isCompleted) {
      // Complete the quest
      updateData.status = 'completed';
      updateData.completedAt = new Date();
      updateData.isCompleted = true;
      updateData.autoCompleted = true;
      updateData.xpEarned = definition.xpReward;
      
      await db.update(userQuests)
        .set(updateData)
        .where(eq(userQuests.id, quest.id));
      
      console.log(`[EnhancedQuestTracker] Quest ${quest.id} AUTO-COMPLETED! XP: ${definition.xpReward}`);
      
      return {
        questId: quest.id,
        previousProgress: currentProgress,
        newProgress,
        targetCount,
        completed: true,
        xpAwarded: definition.xpReward
      };
    } else {
      // Just update progress
      await db.update(userQuests)
        .set(updateData)
        .where(eq(userQuests.id, quest.id));
      
      console.log(`[EnhancedQuestTracker] Quest ${quest.id} progress: ${currentProgress} → ${newProgress}/${targetCount}`);
      
      return {
        questId: quest.id,
        previousProgress: currentProgress,
        newProgress,
        targetCount,
        completed: false,
        xpAwarded: 0
      };
    }
  } catch (error) {
    console.error(`[EnhancedQuestTracker] Error updating quest ${quest.id}:`, error);
    return null;
  }
}

/**
 * Batch track multiple actions at once (for bulk operations)
 */
export async function trackMultipleActions(
  userId: number,
  actions: Array<{ type: TrackingActionType; count?: number; metadata?: ActionMetadata }>
): Promise<ProgressUpdateResult[]> {
  const allResults: ProgressUpdateResult[] = [];
  
  for (const action of actions) {
    const results = await trackUserActionEnhanced(
      userId,
      action.type,
      action.count || 1,
      action.metadata
    );
    allResults.push(...results);
  }
  
  return allResults;
}

/**
 * Get quest progress summary for a user
 */
export async function getQuestProgressSummary(userId: number) {
  try {
    const summary = await db
      .select({
        totalQuests: sql<number>`count(*)`,
        completedQuests: sql<number>`sum(case when ${userQuests.isCompleted} = true then 1 else 0 end)`,
        inProgressQuests: sql<number>`sum(case when ${userQuests.status} = 'active' and ${userQuests.progress} > 0 then 1 else 0 end)`,
        notStartedQuests: sql<number>`sum(case when ${userQuests.status} = 'active' and (${userQuests.progress} = 0 or ${userQuests.progress} is null) then 1 else 0 end)`,
        totalXpEarned: sql<number>`sum(${userQuests.xpEarned})`,
        avgCompletionPercentage: sql<number>`avg(${userQuests.completionPercentage})`
      })
      .from(userQuests)
      .where(eq(userQuests.userId, userId));
    
    return summary[0];
  } catch (error) {
    console.error(`[EnhancedQuestTracker] Error getting progress summary:`, error);
    return null;
  }
}

/**
 * Re-calculate quest progress from tracked activities (recovery mode)
 */
export async function recalculateQuestProgress(questId: number): Promise<boolean> {
  try {
    const quest = await db
      .select()
      .from(userQuests)
      .where(eq(userQuests.id, questId))
      .limit(1);
    
    if (!quest || quest.length === 0) {
      return false;
    }
    
    const userQuest = quest[0];
    const trackedActivities = userQuest.trackedActivities || [];
    
    // Calculate total progress from activities
    const totalCount = trackedActivities.reduce((sum: number, activity: any) => {
      return sum + (activity.count || 1);
    }, 0);
    
    // Get definition to check target
    const def = await db
      .select()
      .from(questDefinitions)
      .where(eq(questDefinitions.id, userQuest.questDefinitionId))
      .limit(1);
    
    if (!def || def.length === 0) {
      return false;
    }
    
    const definition = def[0];
    const targetCount = definition.targetCount || 1;
    const newProgress = Math.min(totalCount, targetCount);
    const completionPercentage = Math.floor((newProgress / targetCount) * 100);
    
    // Update quest
    await db.update(userQuests)
      .set({
        progress: newProgress,
        completionPercentage,
        lastTrackedAt: new Date()
      })
      .where(eq(userQuests.id, questId));
    
    console.log(`[EnhancedQuestTracker] Recalculated quest ${questId}: ${newProgress}/${targetCount}`);
    return true;
  } catch (error) {
    console.error(`[EnhancedQuestTracker] Error recalculating quest ${questId}:`, error);
    return false;
  }
}

// Export singleton instance for convenience
export const enhancedQuestTracker = {
  trackAction: trackUserActionEnhanced,
  trackMultiple: trackMultipleActions,
  getSummary: getQuestProgressSummary,
  recalculate: recalculateQuestProgress
};
