/**
 * Smart Daily Quest Allocator
 * 
 * Uses Impact-Weighted logic to determine optimal number of daily quests (1-4)
 * Instead of fixed "1 Career + 1 Social", the system:
 * 1. Analyzes available quest pool
 * 2. Calculates impact scores (weighted by user goals)
 * 3. Determines optimal quest quantity based on total impact value
 * 4. Ensures balanced mix of Career + Social quests
 * 
 * Fallback: If system can't decide, defaults to 1 Career + 1 Social
 */

import { questImpactScorer, QuestImpactScore } from './quest-impact-scorer';
import { ProfileCompletenessChecker } from './profile-completeness-checker';
import { BrandGoalQuestMapper } from './brand-goal-quest-mapper';
import { db } from '../db';
import { users, questDefinitions, userQuests, brandGoals } from '@shared/schema';
import { eq, and, inArray, ne, notInArray } from 'drizzle-orm';

// Map pre-defined goal IDs to their text labels
const GOAL_ID_TO_TEXT: Record<string, string> = {
  // Visibility & Awareness
  'visibility_1': 'Improve visibility on social media networks',
  'visibility_2': 'Increase brand recognition among my target audience',
  'visibility_3': 'Establish a consistent online presence across platforms',
  'visibility_4': 'Appear in search results when people look for my name or expertise',
  'visibility_5': 'Grow my follower base with an engaged audience',
  // Professional & Career Growth
  'professional_1': 'Position myself as an authority in my niche',
  'professional_2': 'Attract new business opportunities',
  'professional_3': 'Get featured on podcasts or collaborations',
  // Engagement & Community
  'engagement_1': 'Build a loyal community around my brand',
  // Monetization & Impact
  'monetization_1': 'Attract sponsorships and brand collaborations',
  'monetization_2': 'Convert followers into leads or customers',
  'monetization_3': 'Launch my own product or service under my name'
};

export interface QuestAllocationResult {
  totalQuests: number;
  careerQuests: number;
  socialQuests: number;
  totalImpactScore: number;
  allocationStrategy: string;
  selectedQuests: SelectedQuest[];
}

export interface SelectedQuest {
  questDefinitionId: number;
  questType: string;
  category: 'career' | 'social';
  impactScore: number;
  estimatedMinutes: number;
  title: string;
  description: string;
}

export class SmartQuestAllocator {
  
  /**
   * Impact thresholds for determining quest quantity
   */
  private readonly IMPACT_THRESHOLDS = {
    SINGLE_HIGH_IMPACT: 85,      // 1 quest if score >= 85
    TWO_QUEST_MIN: 120,          // 2 quests if total >= 120
    THREE_QUEST_MIN: 180,        // 3 quests if total >= 180
    FOUR_QUEST_MIN: 250          // 4 quests if total >= 250
  };

  /**
   * Maximum time commitment per day (in minutes)
   */
  private readonly MAX_DAILY_MINUTES = 60;

  /**
   * Main allocation function - determines optimal quest quantity
   */
  async allocateDailyQuests(userId: number): Promise<QuestAllocationResult> {
    try {
      console.log(`[SmartQuestAllocator] 🎯 Starting allocation for user ${userId}`);
      
      // Get user profile and brand goals
      const userProfile = await this.getUserProfile(userId);
      const userGoals = await this.getUserBrandGoals(userId);
      
      console.log(`[SmartQuestAllocator] User: ${userProfile?.name}, Goals: ${userGoals.join(', ')}`);

      // Check profile completeness to determine quest focus
      const profileStatus = await ProfileCompletenessChecker.checkProfileCompleteness(userId);
      console.log(`[SmartQuestAllocator] Profile ${profileStatus.completionPercentage}% complete - Focus: ${profileStatus.focusArea}`);
      
      if (profileStatus.missingFields.length > 0) {
        console.log(`[SmartQuestAllocator] Missing fields: ${profileStatus.missingFields.join(', ')}`);
      }

      // Get available quest pool (career + social) - STRICT Brand Goal filtering
      const availableCareerQuests = await this.getAvailableCareerQuests(userId, profileStatus.focusArea, userGoals);
      const availableSocialQuests = await this.getAvailableSocialQuests(userId, userGoals); // NOW with brand goal filtering
      
      console.log(`[SmartQuestAllocator] Available: ${availableCareerQuests.length} career, ${availableSocialQuests.length} social`);

      if (availableCareerQuests.length === 0 && availableSocialQuests.length === 0) {
        console.log(`[SmartQuestAllocator] ⚠️ EMPTY QUEST POOL - User ${userId} (${userProfile?.name}) has NO available quests after brand goal filtering`);
        console.log(`[SmartQuestAllocator] Profile focus: ${profileStatus.focusArea}, User goals: [${userGoals.join(', ')}]`);
        console.log('[SmartQuestAllocator] Falling back to unrestricted quest pool');
        return await this.getFallbackAllocation(userId);
      }

      // Calculate impact scores for all available quests
      const scoredCareerQuests = this.scoreQuestPool(availableCareerQuests, userGoals, 'career');
      const scoredSocialQuests = this.scoreQuestPool(availableSocialQuests, userGoals, 'social');

      // Sort by impact score (highest first)
      scoredCareerQuests.sort((a, b) => b.impactScore - a.impactScore);
      scoredSocialQuests.sort((a, b) => b.impactScore - a.impactScore);

      console.log(`[SmartQuestAllocator] Top career quest: ${scoredCareerQuests[0]?.title} (${scoredCareerQuests[0]?.impactScore})`);
      console.log(`[SmartQuestAllocator] Top social quest: ${scoredSocialQuests[0]?.title} (${scoredSocialQuests[0]?.impactScore})`);

      // Determine optimal allocation using impact-weighted logic
      const allocation = this.determineOptimalAllocation(
        scoredCareerQuests,
        scoredSocialQuests,
        userGoals
      );

      console.log(`[SmartQuestAllocator] ✅ Allocated ${allocation.totalQuests} quests (${allocation.careerQuests} career, ${allocation.socialQuests} social) - Strategy: ${allocation.allocationStrategy}`);
      
      return allocation;

    } catch (error) {
      console.error('[SmartQuestAllocator] Error in allocation:', error);
      return await this.getFallbackAllocation(userId);
    }
  }

  /**
   * Determine optimal number and mix of quests based on impact scores
   */
  private determineOptimalAllocation(
    careerQuests: SelectedQuest[],
    socialQuests: SelectedQuest[],
    userGoals: string[]
  ): QuestAllocationResult {
    
    const selectedQuests: SelectedQuest[] = [];
    let totalImpact = 0;
    let totalMinutes = 0;

    // Strategy 1: Single High-Impact Quest (if one quest has exceptional value)
    const topCareer = careerQuests[0];
    const topSocial = socialQuests[0];

    if (topCareer && topCareer.impactScore >= this.IMPACT_THRESHOLDS.SINGLE_HIGH_IMPACT) {
      selectedQuests.push(topCareer);
      totalImpact = topCareer.impactScore;
      totalMinutes = topCareer.estimatedMinutes;
      
      return {
        totalQuests: 1,
        careerQuests: 1,
        socialQuests: 0,
        totalImpactScore: totalImpact,
        allocationStrategy: 'Single High-Impact Career Quest',
        selectedQuests
      };
    }

    if (topSocial && topSocial.impactScore >= this.IMPACT_THRESHOLDS.SINGLE_HIGH_IMPACT) {
      selectedQuests.push(topSocial);
      totalImpact = topSocial.impactScore;
      totalMinutes = topSocial.estimatedMinutes;
      
      return {
        totalQuests: 1,
        careerQuests: 0,
        socialQuests: 1,
        totalImpactScore: totalImpact,
        allocationStrategy: 'Single High-Impact Social Quest',
        selectedQuests
      };
    }

    // Strategy 2: Balanced Mix (1-4 quests based on combined impact)
    // Start with 1 career + 1 social (baseline)
    if (topCareer) {
      selectedQuests.push(topCareer);
      totalImpact += topCareer.impactScore;
      totalMinutes += topCareer.estimatedMinutes;
    }

    if (topSocial) {
      selectedQuests.push(topSocial);
      totalImpact += topSocial.impactScore;
      totalMinutes += topSocial.estimatedMinutes;
    }

    // Check if we should add more quests based on impact thresholds and time
    if (totalImpact >= this.IMPACT_THRESHOLDS.FOUR_QUEST_MIN && totalMinutes < this.MAX_DAILY_MINUTES) {
      // Try to add 2 more quests (4 total)
      const additionalQuests = this.selectAdditionalQuests(
        [...careerQuests.slice(1), ...socialQuests.slice(1)],
        2,
        this.MAX_DAILY_MINUTES - totalMinutes
      );
      
      selectedQuests.push(...additionalQuests);
      totalImpact += additionalQuests.reduce((sum, q) => sum + q.impactScore, 0);
      totalMinutes += additionalQuests.reduce((sum, q) => sum + q.estimatedMinutes, 0);

      const careerCount = selectedQuests.filter(q => q.category === 'career').length;
      const socialCount = selectedQuests.filter(q => q.category === 'social').length;

      return {
        totalQuests: selectedQuests.length,
        careerQuests: careerCount,
        socialQuests: socialCount,
        totalImpactScore: totalImpact,
        allocationStrategy: 'High-Impact Mix (4 Quests)',
        selectedQuests
      };
    }

    if (totalImpact >= this.IMPACT_THRESHOLDS.THREE_QUEST_MIN && totalMinutes < this.MAX_DAILY_MINUTES) {
      // Try to add 1 more quest (3 total)
      const additionalQuests = this.selectAdditionalQuests(
        [...careerQuests.slice(1), ...socialQuests.slice(1)],
        1,
        this.MAX_DAILY_MINUTES - totalMinutes
      );
      
      selectedQuests.push(...additionalQuests);
      totalImpact += additionalQuests.reduce((sum, q) => sum + q.impactScore, 0);
      totalMinutes += additionalQuests.reduce((sum, q) => sum + q.estimatedMinutes, 0);

      const careerCount = selectedQuests.filter(q => q.category === 'career').length;
      const socialCount = selectedQuests.filter(q => q.category === 'social').length;

      return {
        totalQuests: selectedQuests.length,
        careerQuests: careerCount,
        socialQuests: socialCount,
        totalImpactScore: totalImpact,
        allocationStrategy: 'Medium-Impact Mix (3 Quests)',
        selectedQuests
      };
    }

    // Default: 2 quests (1 career + 1 social or best 2)
    const careerCount = selectedQuests.filter(q => q.category === 'career').length;
    const socialCount = selectedQuests.filter(q => q.category === 'social').length;

    return {
      totalQuests: selectedQuests.length,
      careerQuests: careerCount,
      socialQuests: socialCount,
      totalImpactScore: totalImpact,
      allocationStrategy: 'Balanced Mix (1-2 Quests)',
      selectedQuests
    };
  }

  /**
   * Select additional quests within time constraints
   */
  private selectAdditionalQuests(
    questPool: SelectedQuest[],
    count: number,
    maxMinutesRemaining: number
  ): SelectedQuest[] {
    const selected: SelectedQuest[] = [];
    let minutesUsed = 0;

    for (const quest of questPool) {
      if (selected.length >= count) break;
      if (minutesUsed + quest.estimatedMinutes <= maxMinutesRemaining) {
        selected.push(quest);
        minutesUsed += quest.estimatedMinutes;
      }
    }

    return selected;
  }

  /**
   * Score quest pool with weighted impact based on user goals
   */
  private scoreQuestPool(
    quests: any[],
    userGoals: string[],
    category: 'career' | 'social'
  ): SelectedQuest[] {
    return quests.map(quest => {
      const questType = quest.targetAction || quest.type || 'default';
      
      // Get base impact score
      const impactData = questImpactScorer.getImpactScore(questType);
      const baseScore = impactData?.impactScore || 50;
      
      // Apply goal-based weighting
      const weightedScore = questImpactScorer.getWeightedImpactScore(questType, userGoals);
      
      return {
        questDefinitionId: quest.id,
        questType,
        category,
        impactScore: weightedScore || baseScore,
        estimatedMinutes: impactData?.estimatedMinutes || 15,
        title: quest.title,
        description: quest.description
      };
    });
  }

  /**
   * Get user profile
   */
  private async getUserProfile(userId: number) {
    const [profile] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    return profile || null;
  }

  /**
   * Get user's brand goals
   */
  /**
   * Get user's brand goals (both pre-defined and custom)
   * Returns: Array of goal text strings
   */
  private async getUserBrandGoals(userId: number): Promise<string[]> {
    const [userGoals] = await db
      .select()
      .from(brandGoals)
      .where(eq(brandGoals.userId, userId))
      .limit(1);
    
    if (!userGoals) {
      return [];
    }

    // Convert pre-defined goal IDs to text
    const preDefinedGoalTexts = (userGoals.selectedGoals || []).map(
      goalId => GOAL_ID_TO_TEXT[goalId] || goalId
    );

    // Combine pre-defined (converted to text) + custom goals
    const customGoalTexts = userGoals.customGoals || [];
    
    const allGoals = [...preDefinedGoalTexts, ...customGoalTexts];
    
    console.log(`[SmartQuestAllocator.getUserBrandGoals] User ${userId} has ${allGoals.length} total goals (${preDefinedGoalTexts.length} pre-defined + ${customGoalTexts.length} custom)`);
    
    return allGoals;
  }

  /**
   * Get available career quests (not yet assigned today)
   * FIXED: Use Brand Goals as PRIMARY filter, profile focus as PREFERENCE (not strict filter)
   * This ensures career quests are always allocated regardless of profile completion status
   */
  private async getAvailableCareerQuests(
    userId: number, 
    focusArea: 'profile' | 'pulse' = 'profile',
    userGoals: string[] = []
  ): Promise<any[]> {
    const todayDateString = new Date().toISOString().split('T')[0];
    
    // Get today's assigned quest IDs
    const todayAssigned = await db
      .select({ questDefId: userQuests.questDefinitionId })
      .from(userQuests)
      .where(and(
        eq(userQuests.userId, userId),
        eq(userQuests.assignedDate, todayDateString)
      ));
    
    const assignedIds = todayAssigned.map(q => q.questDefId);
    
    // Step 1: ALL possible career quest types (comprehensive list)
    const allCareerQuestTypes = [
      'profile_update', 'resume', 'portfolio', 'learning', 'exploration', 
      'networking', 'engagement', 'pulse_creation', 'visibility'
    ];
    
    // Step 2: Get quest types allowed by Brand Goals (PRIMARY FILTER)
    const brandGoalAllowedTypes = BrandGoalQuestMapper.getAllowedQuestTypes(userGoals);
    
    // Step 3: Use brand goal types as primary, or all types if no goals selected
    let finalAllowedTypes: string[];
    
    if (userGoals.length === 0) {
      // No Brand Goals selected - use all career quest types
      console.log('[SmartQuestAllocator] ⚠️ No Brand Goals selected - using all career quest types');
      finalAllowedTypes = allCareerQuestTypes;
    } else {
      // Filter by brand goals - career quest types only (exclude social_quest, social_post)
      finalAllowedTypes = brandGoalAllowedTypes.filter(type => 
        allCareerQuestTypes.includes(type)
      );
      console.log(`[SmartQuestAllocator] 🎯 Brand Goal career types: ${finalAllowedTypes.length} types (${finalAllowedTypes.join(', ')})`);
      
      // FALLBACK: If no career types from brand goals, use all career types
      if (finalAllowedTypes.length === 0) {
        console.log(`[SmartQuestAllocator] ⚠️ No career types in Brand Goals - using all career quest types as fallback`);
        finalAllowedTypes = allCareerQuestTypes;
      }
    }
    
    console.log(`[SmartQuestAllocator] ✅ Final career quest types: [${finalAllowedTypes.join(', ')}]`);
    
    // Get career quests not assigned today, filtered by final allowed types (ACTIVE ONLY)
    const careerQuestsQuery = assignedIds.length > 0
      ? db.select()
          .from(questDefinitions)
          .where(and(
            eq(questDefinitions.isActive, true), // Only active quests
            ne(questDefinitions.type, 'social_post'),
            ne(questDefinitions.type, 'social_quest'),
            notInArray(questDefinitions.id, assignedIds),
            inArray(questDefinitions.type, finalAllowedTypes as any)
          ))
      : db.select()
          .from(questDefinitions)
          .where(and(
            eq(questDefinitions.isActive, true), // Only active quests
            ne(questDefinitions.type, 'social_post'),
            ne(questDefinitions.type, 'social_quest'),
            inArray(questDefinitions.type, finalAllowedTypes as any)
          ));
    
    return await careerQuestsQuery;
  }

  /**
   * Get available social quests (not yet assigned today)
   * STRICTLY filtered by Brand Goals - only shows social quests aligned with user's goals
   */
  private async getAvailableSocialQuests(userId: number, userGoals: string[] = []): Promise<any[]> {
    const todayDateString = new Date().toISOString().split('T')[0];
    
    // Get today's assigned quest IDs
    const todayAssigned = await db
      .select({ questDefId: userQuests.questDefinitionId })
      .from(userQuests)
      .where(and(
        eq(userQuests.userId, userId),
        eq(userQuests.assignedDate, todayDateString)
      ));
    
    const assignedIds = todayAssigned.map(q => q.questDefId);
    
    // Get quest types allowed by Brand Goals (STRICT FILTERING)
    const brandGoalAllowedTypes = BrandGoalQuestMapper.getAllowedQuestTypes(userGoals);
    
    // Define all social quest types
    const socialQuestTypes = ['social_quest', 'social_post'];
    
    // Determine which social quest types to use
    let allowedSocialTypes: string[];
    
    if (userGoals.length === 0) {
      // Fallback: If user has NO brand goals selected, allow all social quest types
      console.log('[SmartQuestAllocator] ⚠️ No brand goals selected - allowing all social quests as fallback');
      allowedSocialTypes = socialQuestTypes;
    } else {
      // Filter social quest types by brand goals
      allowedSocialTypes = socialQuestTypes.filter(type => brandGoalAllowedTypes.includes(type));
      
      // If user has selected brand goals but none allow social quests, allow all as fallback
      if (allowedSocialTypes.length === 0) {
        console.log('[SmartQuestAllocator] ⚠️ No social quest types match Brand Goals - using all social quest types as fallback');
        allowedSocialTypes = socialQuestTypes;
      }
    }
    
    // Get social quests not assigned today (ACTIVE ONLY, filtered by allowed types)
    const socialQuestsQuery = assignedIds.length > 0
      ? db.select()
          .from(questDefinitions)
          .where(and(
            eq(questDefinitions.isActive, true), // Only active quests
            inArray(questDefinitions.type, allowedSocialTypes as any),
            notInArray(questDefinitions.id, assignedIds)
          ))
      : db.select()
          .from(questDefinitions)
          .where(and(
            eq(questDefinitions.isActive, true), // Only active quests
            inArray(questDefinitions.type, allowedSocialTypes as any)
          ));
    
    return await socialQuestsQuery;
  }

  /**
   * Fallback allocation (original 1 Career + 1 Social)
   * Fetches simple quests without brand goal filtering
   */
  private async getFallbackAllocation(userId?: number): Promise<QuestAllocationResult> {
    console.log('[SmartQuestAllocator] Using fallback allocation: 1 Career + 1 Social');
    
    try {
      const todayDateString = new Date().toISOString().split('T')[0];
      const selectedQuests: SelectedQuest[] = [];
      
      // Get today's assigned quest IDs if userId provided
      let assignedIds: number[] = [];
      if (userId) {
        const todayAssigned = await db
          .select({ questDefId: userQuests.questDefinitionId })
          .from(userQuests)
          .where(and(
            eq(userQuests.userId, userId),
            eq(userQuests.assignedDate, todayDateString)
          ));
        assignedIds = todayAssigned.map(q => q.questDefId);
      }
      
      // Fetch a simple career quest (profile update or pulse creation)
      const careerQuestsQuery = assignedIds.length > 0
        ? db.select()
            .from(questDefinitions)
            .where(and(
              eq(questDefinitions.isActive, true),
              inArray(questDefinitions.type, ['profile_update', 'pulse_creation'] as any),
              notInArray(questDefinitions.id, assignedIds)
            ))
            .limit(1)
        : db.select()
            .from(questDefinitions)
            .where(and(
              eq(questDefinitions.isActive, true),
              inArray(questDefinitions.type, ['profile_update', 'pulse_creation'] as any)
            ))
            .limit(1);
      
      const careerQuests = await careerQuestsQuery;
      
      if (careerQuests.length > 0) {
        const quest = careerQuests[0];
        selectedQuests.push({
          questDefinitionId: quest.id,
          questType: quest.type,
          category: 'career',
          impactScore: 50,
          estimatedMinutes: quest.estimatedTimeMinutes || 15,
          title: quest.title,
          description: quest.description || ''
        });
      }
      
      // Fetch a simple social quest
      const socialQuestsQuery = assignedIds.length > 0
        ? db.select()
            .from(questDefinitions)
            .where(and(
              eq(questDefinitions.isActive, true),
              inArray(questDefinitions.type, ['social_quest', 'social_post'] as any),
              notInArray(questDefinitions.id, assignedIds)
            ))
            .limit(1)
        : db.select()
            .from(questDefinitions)
            .where(and(
              eq(questDefinitions.isActive, true),
              inArray(questDefinitions.type, ['social_quest', 'social_post'] as any)
            ))
            .limit(1);
      
      const socialQuests = await socialQuestsQuery;
      
      if (socialQuests.length > 0) {
        const quest = socialQuests[0];
        selectedQuests.push({
          questDefinitionId: quest.id,
          questType: quest.type,
          category: 'social',
          impactScore: 50,
          estimatedMinutes: quest.estimatedTimeMinutes || 15,
          title: quest.title,
          description: quest.description || ''
        });
      }
      
      console.log(`[SmartQuestAllocator] ✅ Fallback: Selected ${selectedQuests.length} quests`);
      
      return {
        totalQuests: selectedQuests.length,
        careerQuests: selectedQuests.filter(q => q.category === 'career').length,
        socialQuests: selectedQuests.filter(q => q.category === 'social').length,
        totalImpactScore: selectedQuests.reduce((sum, q) => sum + q.impactScore, 0),
        allocationStrategy: 'Fallback: Default 1+1',
        selectedQuests
      };
    } catch (error) {
      console.error('[SmartQuestAllocator] Error in fallback allocation:', error);
      return {
        totalQuests: 0,
        careerQuests: 0,
        socialQuests: 0,
        totalImpactScore: 0,
        allocationStrategy: 'Fallback: Failed',
        selectedQuests: []
      };
    }
  }

  /**
   * Get allocation summary for user
   */
  async getAllocationSummary(userId: number): Promise<{
    todayQuests: number;
    strategy: string;
    impactScore: number;
  }> {
    const todayDateString = new Date().toISOString().split('T')[0];
    
    const todayQuests = await db
      .select()
      .from(userQuests)
      .where(and(
        eq(userQuests.userId, userId),
        eq(userQuests.assignedDate, todayDateString)
      ));
    
    return {
      todayQuests: todayQuests.length,
      strategy: 'Impact-Weighted Allocation',
      impactScore: 0 // Will be calculated from quest scores
    };
  }
}

export const smartQuestAllocator = new SmartQuestAllocator();
