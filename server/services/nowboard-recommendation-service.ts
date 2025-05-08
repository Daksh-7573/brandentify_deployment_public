import { db } from '../db';
import { sql } from 'drizzle-orm';
import { questDefinitions, userQuests, users } from '@shared/schema';
import { eq, and, gt, lt } from 'drizzle-orm';
import { storage } from '../storage';

export interface NowboardSuggestion {
  id: number;
  type: 'pulse' | 'comment' | 'reaction';
  title: string;
  description: string;
  actionText: string;
  relatedQuestId?: number;
  xpValue: number;
  targetId?: number; // ID of pulse or content to interact with, if applicable
}

export class NowboardRecommendationService {

  /**
   * Get personalized nowboard recommendations for a user based on their active quests
   */
  static async getPersonalizedRecommendations(userId: number, questType?: string): Promise<NowboardSuggestion[]> {
    try {
      // 1. Get user's active quests
      const userActiveQuests = await db
        .select({
          id: userQuests.id,
          questDefId: userQuests.questDefinitionId,
          title: questDefinitions.title,
          description: questDefinitions.description,
          type: questDefinitions.type,
          targetAction: questDefinitions.targetAction,
          targetCount: questDefinitions.targetCount,
          xpReward: questDefinitions.xpReward
        })
        .from(userQuests)
        .leftJoin(questDefinitions, eq(userQuests.questDefinitionId, questDefinitions.id))
        .where(
          and(
            eq(userQuests.userId, userId),
            eq(userQuests.status, 'active')
          )
        );

      if (!userActiveQuests.length) {
        return this.getFallbackRecommendations(questType);
      }

      // 2. Get user profile for personalization
      const user = await storage.getUser(userId);
      const userIndustry = user?.industry || 'Technology';

      // 3. Generate recommendations based on active quests and user profile
      const recommendations: NowboardSuggestion[] = [];
      
      // Match quest types to nowboard actions
      for (const quest of userActiveQuests) {
        if (!quest.targetAction) continue;

        if (questType && !this.matchesQuestType(quest.targetAction, questType)) {
          continue;
        }

        // Create a recommendation based on quest type
        switch (quest.targetAction) {
          case 'create_pulse':
            recommendations.push({
              id: Date.now() + Math.floor(Math.random() * 1000),
              type: 'pulse',
              title: `Create a pulse about ${userIndustry}`,
              description: `Share insights about ${userIndustry} to make progress on your "${quest.title}" quest`,
              actionText: 'Create Pulse',
              relatedQuestId: quest.id,
              xpValue: quest.xpReward || 25
            });
            break;
            
          case 'comment_on_pulse':
            recommendations.push({
              id: Date.now() + Math.floor(Math.random() * 1000),
              type: 'comment',
              title: 'Comment on trending discussions',
              description: `Join the conversation about ${userIndustry} to complete your "${quest.title}" quest`,
              actionText: 'View Discussions',
              relatedQuestId: quest.id,
              xpValue: quest.xpReward || 15
            });
            break;
            
          case 'react_to_pulse':
            recommendations.push({
              id: Date.now() + Math.floor(Math.random() * 1000),
              type: 'reaction',
              title: `React to content in ${userIndustry}`,
              description: `Show appreciation for quality content to progress on your "${quest.title}" quest`,
              actionText: 'Find Content',
              relatedQuestId: quest.id,
              xpValue: quest.xpReward || 10
            });
            break;
        }
      }

      // If we couldn't generate any recommendations, return fallbacks
      if (recommendations.length === 0) {
        return this.getFallbackRecommendations(questType);
      }

      return recommendations;
    } catch (error) {
      console.error('Error getting personalized nowboard recommendations:', error);
      return this.getFallbackRecommendations(questType);
    }
  }

  /**
   * Get fallback recommendations when user has no active quests or there's an error
   */
  private static getFallbackRecommendations(questType?: string): NowboardSuggestion[] {
    const fallbacks: NowboardSuggestion[] = [
      {
        id: 1,
        type: 'pulse',
        title: 'Create a pulse about your recent project',
        description: 'Share your recent work to make progress on your "Content Creator" quest',
        actionText: 'Create Pulse',
        xpValue: 25
      },
      {
        id: 2,
        type: 'comment',
        title: 'Comment on trending industry discussions',
        description: 'Professionals in your industry are discussing new topics. Join the conversation!',
        actionText: 'View Conversations',
        xpValue: 15
      },
      {
        id: 3,
        type: 'reaction',
        title: 'React to content from your industry',
        description: 'Show appreciation for quality content from your peers',
        actionText: 'Find Content',
        xpValue: 10
      }
    ];

    // Filter by quest type if specified
    if (questType) {
      return fallbacks.filter(f => {
        if (questType === 'pulse_creation' && f.type === 'pulse') return true;
        if (questType === 'engagement' && (f.type === 'comment' || f.type === 'reaction')) return true;
        return false;
      });
    }

    return fallbacks;
  }

  /**
   * Check if a quest action type matches the requested quest type filter
   */
  private static matchesQuestType(actionType: string, questType: string): boolean {
    if (questType === 'pulse_creation' && actionType === 'create_pulse') return true;
    if (questType === 'engagement' && (actionType === 'comment_on_pulse' || actionType === 'react_to_pulse')) return true;
    return false;
  }

  /**
   * Track quest progress when user takes an action from a suggestion
   */
  static async trackQuestProgress(userId: number, questId: number, actionType: string): Promise<boolean> {
    try {
      // Find the user quest record
      const [userQuestRecord] = await db
        .select()
        .from(userQuests)
        .where(
          and(
            eq(userQuests.userId, userId),
            eq(userQuests.id, questId)
          )
        );

      if (!userQuestRecord) {
        return false;
      }

      // Update the progress count
      const newProgress = (userQuestRecord.progress || 0) + 1;
      
      // Get the quest definition to get the target count
      const [questDef] = await db
        .select()
        .from(questDefinitions)
        .where(eq(questDefinitions.id, userQuestRecord.questDefinitionId));
        
      const targetCount = questDef?.targetCount || 1;
        
      // Update the quest progress
      await db
        .update(userQuests)
        .set({
          progress: newProgress,
          // If progress meets target, mark as completed
          status: userQuestRecord.status === 'active' && newProgress >= targetCount ? 'completed' : userQuestRecord.status
        })
        .where(
          and(
            eq(userQuests.userId, userId),
            eq(userQuests.id, questId)
          )
        );

      return true;
    } catch (error) {
      console.error('Error tracking quest progress:', error);
      return false;
    }
  }
}