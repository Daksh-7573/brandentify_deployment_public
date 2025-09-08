import { db } from '../db';
import { users, userQuests, questDefinitions } from '@shared/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { platformRecommendationService } from './platform-recommendation-service';

export class PersonalizedQuestAssignment {
  
  /**
   * Assigns personalized social media quests based on user profile
   */
  async assignPersonalizedSocialQuests(userId: number): Promise<{
    success: boolean;
    assignedQuests: any[];
    recommendations: any[];
    message: string;
  }> {
    try {
      console.log(`[PersonalizedQuests] Starting assignment for user ${userId}`);
      
      // Get platform recommendations for this user
      const recommendations = await platformRecommendationService.getRecommendedPlatforms(userId);
      console.log(`[PersonalizedQuests] Got ${recommendations.length} platform recommendations:`, 
                  recommendations.map(r => `${r.platform} (priority: ${r.priority})`));

      if (recommendations.length === 0) {
        console.log(`[PersonalizedQuests] No suitable platforms found for user ${userId}`);
        return {
          success: false,
          assignedQuests: [],
          recommendations: [],
          message: 'No suitable social platforms identified for your profile'
        };
      }

      // Get target actions from recommendations
      const targetActions = recommendations.map(rec => rec.targetAction);
      
      // Find existing quest definitions for these platforms
      const existingQuests = await db
        .select()
        .from(questDefinitions)
        .where(
          and(
            eq(questDefinitions.type, 'social_post'),
            inArray(questDefinitions.targetAction, targetActions)
          )
        );

      console.log(`[PersonalizedQuests] Found ${existingQuests.length} matching quest definitions`);

      // Create missing quest definitions if needed
      const existingTargetActions = existingQuests.map(q => q.targetAction);
      const missingRecommendations = recommendations.filter(
        rec => !existingTargetActions.includes(rec.targetAction)
      );

      for (const missingRec of missingRecommendations) {
        const questData = platformRecommendationService.getPlatformQuestData(missingRec.targetAction);
        
        const [newQuest] = await db
          .insert(questDefinitions)
          .values({
            title: questData.title,
            description: questData.description,
            type: 'social_post',
            targetCount: 1,
            targetAction: missingRec.targetAction,
            xpReward: this.getXpRewardByPriority(missingRec.priority),
            badgeReward: null,
            muskTip: questData.muskTip
          })
          .returning();

        existingQuests.push(newQuest);
        console.log(`[PersonalizedQuests] Created quest definition: ${questData.title}`);
      }

      // Check for existing user assignments to avoid duplicates
      const currentWeek = this.getWeekNumber(new Date());
      const currentYear = new Date().getFullYear();
      
      const existingAssignments = await db
        .select()
        .from(userQuests)
        .where(
          and(
            eq(userQuests.userId, userId),
            eq(userQuests.weekNumber, currentWeek),
            eq(userQuests.year, currentYear),
            inArray(userQuests.questDefinitionId, existingQuests.map(q => q.id))
          )
        );

      console.log(`[PersonalizedQuests] Found ${existingAssignments.length} existing assignments for this week`);

      // Filter out already assigned quests
      const alreadyAssignedQuestIds = existingAssignments.map(a => a.questDefinitionId);
      const questsToAssign = existingQuests.filter(q => !alreadyAssignedQuestIds.includes(q.id));

      if (questsToAssign.length === 0) {
        console.log(`[PersonalizedQuests] All recommended quests already assigned for user ${userId}`);
        return {
          success: true,
          assignedQuests: [],
          recommendations,
          message: 'All recommended social quests are already assigned for this week'
        };
      }

      // Assign new quests based on priority order
      const assignedQuests = [];
      for (const quest of questsToAssign) {
        const [assignedQuest] = await db
          .insert(userQuests)
          .values({
            userId,
            questDefinitionId: quest.id,
            status: 'active',
            progress: 0,
            assignedAt: new Date(),
            weekNumber: currentWeek,
            year: currentYear
          })
          .returning();

        assignedQuests.push({
          ...assignedQuest,
          questDefinition: quest,
          recommendation: recommendations.find(r => r.targetAction === quest.targetAction)
        });

        console.log(`[PersonalizedQuests] Assigned quest: ${quest.title} to user ${userId}`);
      }

      return {
        success: true,
        assignedQuests,
        recommendations,
        message: `Assigned ${assignedQuests.length} personalized social quests based on your profile`
      };

    } catch (error) {
      console.error('[PersonalizedQuests] Error assigning personalized quests:', error);
      return {
        success: false,
        assignedQuests: [],
        recommendations: [],
        message: 'Error assigning personalized quests'
      };
    }
  }

  /**
   * Updates existing social quest assignments with personalized filtering
   * This ensures users only see quests relevant to their profile
   */
  async updateUserSocialQuestVisibility(userId: number): Promise<{
    success: boolean;
    hiddenQuests: number;
    visibleQuests: number;
    message: string;
  }> {
    try {
      // Get platform recommendations
      const recommendations = await platformRecommendationService.getRecommendedPlatforms(userId);
      const recommendedTargetActions = recommendations.map(r => r.targetAction);

      // Get all user's social_post quests
      const userSocialQuests = await db
        .select({
          userQuest: userQuests,
          questDef: questDefinitions
        })
        .from(userQuests)
        .innerJoin(questDefinitions, eq(userQuests.questDefinitionId, questDefinitions.id))
        .where(
          and(
            eq(userQuests.userId, userId),
            eq(questDefinitions.type, 'social_post')
          )
        );

      let hiddenCount = 0;
      let visibleCount = 0;

      // Update quest visibility based on recommendations
      for (const { userQuest, questDef } of userSocialQuests) {
        const isRecommended = recommendedTargetActions.includes(questDef.targetAction);
        
        if (isRecommended) {
          // Ensure quest is visible/active if recommended
          if (userQuest.status === 'expired') {
            await db
              .update(userQuests)
              .set({ status: 'active' })
              .where(eq(userQuests.id, userQuest.id));
          }
          visibleCount++;
        } else {
          // Mark quest as expired if not recommended for this user
          if (userQuest.status === 'active') {
            await db
              .update(userQuests)
              .set({ status: 'expired' })
              .where(eq(userQuests.id, userQuest.id));
          }
          hiddenCount++;
        }
      }

      console.log(`[PersonalizedQuests] Updated visibility for user ${userId}: ${visibleCount} visible, ${hiddenCount} hidden`);

      return {
        success: true,
        hiddenQuests: hiddenCount,
        visibleQuests: visibleCount,
        message: `Updated quest visibility: ${visibleCount} visible, ${hiddenCount} filtered out`
      };

    } catch (error) {
      console.error('[PersonalizedQuests] Error updating quest visibility:', error);
      return {
        success: false,
        hiddenQuests: 0,
        visibleQuests: 0,
        message: 'Error updating quest visibility'
      };
    }
  }

  /**
   * Gets a user's personalized quest summary
   */
  async getPersonalizedQuestSummary(userId: number): Promise<{
    platforms: string[];
    totalQuests: number;
    activeQuests: number;
    recommendations: any[];
  }> {
    try {
      const recommendations = await platformRecommendationService.getRecommendedPlatforms(userId);
      
      const userSocialQuests = await db
        .select()
        .from(userQuests)
        .innerJoin(questDefinitions, eq(userQuests.questDefinitionId, questDefinitions.id))
        .where(
          and(
            eq(userQuests.userId, userId),
            eq(questDefinitions.type, 'social_post'),
            eq(userQuests.status, 'active')
          )
        );

      return {
        platforms: recommendations.map(r => r.platform),
        totalQuests: userSocialQuests.length,
        activeQuests: userSocialQuests.filter(q => q.user_quests.status === 'active').length,
        recommendations
      };

    } catch (error) {
      console.error('[PersonalizedQuests] Error getting quest summary:', error);
      return {
        platforms: [],
        totalQuests: 0,
        activeQuests: 0,
        recommendations: []
      };
    }
  }

  /**
   * Helper function to calculate XP reward based on platform priority
   */
  private getXpRewardByPriority(priority: number): number {
    const xpMap: { [key: number]: number } = {
      5: 80, // Highest priority platforms
      4: 65,
      3: 50,
      2: 40,
      1: 30  // Lowest priority platforms
    };
    return xpMap[priority] || 50;
  }

  /**
   * Weekly quest assignment with 3-7 quest limit per user
   */
  async assignWeeklyPersonalizedQuests(
    userId: number, 
    options: { minQuests: number; maxQuests: number } = { minQuests: 3, maxQuests: 7 }
  ): Promise<{
    success: boolean;
    assignedQuests: any[];
    recommendations: any[];
    message: string;
  }> {
    try {
      console.log(`[WeeklyQuests] Starting weekly assignment for user ${userId}`);
      
      // Get platform recommendations
      const recommendations = await platformRecommendationService.getRecommendedPlatforms(userId);
      
      if (recommendations.length === 0) {
        return {
          success: false,
          assignedQuests: [],
          recommendations: [],
          message: 'No platform recommendations available'
        };
      }

      // Get current week info
      const now = new Date();
      const weekNumber = this.getWeekNumber(now);
      const year = now.getFullYear();

      // Clear existing quests for this week
      await db
        .delete(userQuests)
        .where(
          and(
            eq(userQuests.userId, userId),
            eq(userQuests.weekNumber, weekNumber),
            eq(userQuests.year, year)
          )
        );

      // Get relevant quest definitions based on recommendations
      const recommendedTargetActions = recommendations.map(r => r.targetAction);
      
      const availableQuests = await db
        .select()
        .from(questDefinitions)
        .where(
          and(
            eq(questDefinitions.type, 'social_post'),
            eq(questDefinitions.isActive, true),
            inArray(questDefinitions.targetAction, recommendedTargetActions)
          )
        );

      // Limit quests based on options (3-7 per week)
      const questsToAssign = availableQuests.slice(0, options.maxQuests);
      
      // Ensure minimum quest count
      if (questsToAssign.length < options.minQuests) {
        console.log(`[WeeklyQuests] Warning: Only ${questsToAssign.length} quests available, less than minimum ${options.minQuests}`);
      }

      const assignedQuests = [];

      for (const questDef of questsToAssign) {
        const recommendation = recommendations.find(r => r.targetAction === questDef.targetAction);
        
        const [insertedQuest] = await db
          .insert(userQuests)
          .values({
            userId,
            questDefinitionId: questDef.id,
            status: 'active',
            progress: 0,
            weekNumber,
            year,
            assignedAt: new Date()
          })
          .returning();

        assignedQuests.push({
          ...insertedQuest,
          questDefinition: questDef,
          recommendation
        });

        console.log(`[WeeklyQuests] Assigned quest: ${questDef.title} to user ${userId}`);
      }

      console.log(`[WeeklyQuests] Assigned ${assignedQuests.length} weekly quests for user ${userId}`);

      return {
        success: true,
        assignedQuests,
        recommendations,
        message: `Assigned ${assignedQuests.length} weekly personalized quests`
      };

    } catch (error) {
      console.error('[WeeklyQuests] Error assigning weekly quests:', error);
      return {
        success: false,
        assignedQuests: [],
        recommendations: [],
        message: 'Error assigning weekly quests'
      };
    }
  }

  /**
   * Helper function to get week number
   */
  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }
}

export const personalizedQuestAssignment = new PersonalizedQuestAssignment();