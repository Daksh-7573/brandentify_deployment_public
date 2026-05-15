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
import { eq, and, inArray, ne, notInArray, gte } from 'drizzle-orm';

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

export interface QuestAllocationOptions {
  force?: boolean;
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
  async allocateDailyQuests(userId: number, options: QuestAllocationOptions = {}): Promise<QuestAllocationResult> {
    try {
      console.log(`[SmartQuestAllocator] 🎯 Starting allocation for user ${userId}`);
      if (options.force) {
        console.log(`[SmartQuestAllocator] Force allocation enabled for user ${userId}`);
      }
      
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
        profileStatus.completionPercentage
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
   * FOR DAILY QUESTS: ENFORCES MINIMUM 2 CAREER + 1 SOCIAL
   * 
   * BALANCE RULES:
   * - 1 quest: highest impact (any category)
   * - 2 quests: 1 career + 1 social
   * - 3 quests: 2 career + 1 social (DEFAULT FOR DAILY)
   * - 4 quests: 2 career + 2 social
   */
  private determineOptimalAllocation(
    careerQuests: SelectedQuest[],
    socialQuests: SelectedQuest[],
    completionPercentage: number
  ): QuestAllocationResult {
    const normalQuests = [...careerQuests].sort((a, b) => b.impactScore - a.impactScore);
    const pureSocialQuests = [...socialQuests].sort((a, b) => b.impactScore - a.impactScore);

    if (normalQuests.length === 0 && pureSocialQuests.length === 0) {
      return this.getEmptyAllocation();
    }

    // CRITICAL FIX: For daily quests, ALWAYS try to allocate 2 career + 1 social
    // This ensures consistent, quality quest generation
    const dailyMixAllocation = this.tryDailyMixAllocation(normalQuests, pureSocialQuests);
    if (dailyMixAllocation && dailyMixAllocation.selectedQuests.length >= 3) {
      console.log(`[SmartQuestAllocator] ✅ Daily mix allocation: 2 career + 1 social`);
      return dailyMixAllocation;
    }

    // Fallback: Try standard allocation based on profile completion
    const range = this.getQuestCountRangeByCompletion(completionPercentage);
    const preferredCounts = this.getPreferredCountsForRange(range.min, range.max);

    for (const count of preferredCounts) {
      const candidate = this.buildBalancedAllocation(count, normalQuests, pureSocialQuests);
      if (candidate && candidate.selectedQuests.length > 0) {
        return candidate;
      }
    }

    // Final safety fallback: always return at least one meaningful quest if available
    const topQuest = normalQuests[0] || pureSocialQuests[0];
    if (topQuest) {
      return {
        totalQuests: 1,
        careerQuests: this.countNormalQuests([topQuest]),
        socialQuests: this.countSocialQuests([topQuest]),
        totalImpactScore: topQuest.impactScore,
        allocationStrategy: `Profile Completion Fallback (${completionPercentage}% -> 1 quest)`,
        selectedQuests: [topQuest]
      };
    }

    return this.getEmptyAllocation();
  }

  /**
   * TRY to allocate the ideal daily mix: 2 career + 1 social
   * This ensures users get both types every day for maximum engagement
   */
  private tryDailyMixAllocation(
    careerQuests: SelectedQuest[],
    socialQuests: SelectedQuest[]
  ): QuestAllocationResult | null {
    const selected: SelectedQuest[] = [];

    // Need at least 2 career quests
    if (careerQuests.length >= 2) {
      selected.push(careerQuests[0], careerQuests[1]);
    } else if (careerQuests.length === 1) {
      selected.push(careerQuests[0]);
    }

    // Need at least 1 social quest
    if (socialQuests.length >= 1) {
      selected.push(socialQuests[0]);
    }

    // Verify total time doesn't exceed daily limit
    const totalMinutes = selected.reduce((sum, q) => sum + q.estimatedMinutes, 0);
    if (totalMinutes > this.MAX_DAILY_MINUTES) {
      console.log(`[SmartQuestAllocator] ⚠️ Daily mix exceeds time limit (${totalMinutes} min > ${this.MAX_DAILY_MINUTES} min)`);
      return null;
    }

    if (selected.length === 0) {
      return null;
    }

    return {
      totalQuests: selected.length,
      careerQuests: this.countNormalQuests(selected),
      socialQuests: this.countSocialQuests(selected),
      totalImpactScore: selected.reduce((sum, q) => sum + q.impactScore, 0),
      allocationStrategy: `Daily Mix: ${this.countNormalQuests(selected)} career + ${this.countSocialQuests(selected)} social`,
      selectedQuests: selected
    };
  }

  private getQuestCountRangeByCompletion(completionPercentage: number): { min: number; max: number } {
    if (completionPercentage < 20) {
      return { min: 1, max: 1 };
    }

    if (completionPercentage <= 80) {
      return { min: 2, max: 3 };
    }

    return { min: 3, max: 4 };
  }

  private getPreferredCountsForRange(min: number, max: number): number[] {
    if (min === 1 && max === 1) {
      return [1];
    }

    if (min === 2 && max === 3) {
      return [3, 2, 1];
    }

    return [4, 3, 2, 1];
  }

  private buildBalancedAllocation(
    targetCount: number,
    normalQuests: SelectedQuest[],
    socialQuests: SelectedQuest[]
  ): QuestAllocationResult | null {
    const selected: SelectedQuest[] = [];

    if (targetCount === 1) {
      const topQuest = normalQuests[0] || socialQuests[0];
      if (!topQuest) return null;
      selected.push(topQuest);
    } else if (targetCount === 2) {
      if (normalQuests[0] && socialQuests[0]) {
        selected.push(normalQuests[0], socialQuests[0]);
      } else {
        selected.push(...[...normalQuests, ...socialQuests].slice(0, 2));
      }
    } else if (targetCount === 3) {
      if (normalQuests.length >= 2 && socialQuests.length >= 1) {
        selected.push(normalQuests[0], normalQuests[1], socialQuests[0]);
      } else {
        selected.push(...[...normalQuests, ...socialQuests].slice(0, 3));
      }
    } else if (targetCount === 4) {
      if (normalQuests.length >= 2 && socialQuests.length >= 2) {
        selected.push(normalQuests[0], normalQuests[1], socialQuests[0], socialQuests[1]);
      } else {
        selected.push(...[...normalQuests, ...socialQuests].slice(0, 4));
      }
    }

    if (selected.length === 0) {
      return null;
    }

    // If assigning more than one quest, enforce mixed quest types:
    // at least 1 normal(career/profile/portfolio) + at least 1 social/networking.
    // If balance cannot be met, caller will try a lower target count.
    if (selected.length > 1) {
      const normalCount = this.countNormalQuests(selected);
      const socialCount = this.countSocialQuests(selected);
      if (normalCount < 1 || socialCount < 1) {
        return null;
      }
    }

    const totalMinutes = selected.reduce((sum, q) => sum + q.estimatedMinutes, 0);
    if (totalMinutes > this.MAX_DAILY_MINUTES) {
      return null;
    }

    return {
      totalQuests: selected.length,
      careerQuests: this.countNormalQuests(selected),
      socialQuests: this.countSocialQuests(selected),
      totalImpactScore: selected.reduce((sum, q) => sum + q.impactScore, 0),
      allocationStrategy: `Profile Completion Rules (${targetCount} quests)` ,
      selectedQuests: selected
    };
  }

  /**
   * Select highest impact quest from array
   */
  private selectHighestImpact(quests: SelectedQuest[]): SelectedQuest {
    return quests.reduce((highest, current) => 
      current.impactScore > highest.impactScore ? current : highest
    );
  }

  /**
   * Count normal quests (career/profile/portfolio)
   */
  private countNormalQuests(quests: SelectedQuest[]): number {
    return quests.filter(q => ['career', 'profile', 'portfolio'].includes(q.category)).length;
  }

  /**
   * Count social quests (social/networking)
   */
  private countSocialQuests(quests: SelectedQuest[]): number {
    return quests.filter(q => ['social', 'networking'].includes(q.category)).length;
  }

  /**
   * Get empty allocation result
   */
  private getEmptyAllocation(): QuestAllocationResult {
    return {
      totalQuests: 0,
      careerQuests: 0,
      socialQuests: 0,
      totalImpactScore: 0,
      allocationStrategy: 'No Quests Available',
      selectedQuests: []
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
   * Get quest IDs assigned in the recent N-day window for deduplication.
   */
  private async getRecentQuestIds(userId: number, days = 7): Promise<number[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffDate = cutoff.toISOString().split('T')[0];

    const recent = await db
      .select({ questDefId: userQuests.questDefinitionId })
      .from(userQuests)
      .where(and(
        eq(userQuests.userId, userId),
        gte(userQuests.assignedDate, cutoffDate)
      ));

    return recent.map(r => r.questDefId).filter((id): id is number => id !== null);
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
    const recentIds = await this.getRecentQuestIds(userId, 7);
    
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
    
    const whereClauses: any[] = [
      eq(questDefinitions.isActive, true),
      ne(questDefinitions.type, 'social_post'),
      ne(questDefinitions.type, 'social_quest'),
      inArray(questDefinitions.type, finalAllowedTypes as any)
    ];

    if (recentIds.length > 0) {
      whereClauses.push(notInArray(questDefinitions.id, recentIds));
    }

    return await db.select().from(questDefinitions).where(and(...whereClauses));
  }

  /**
   * Get available social quests (not yet assigned today)
   * STRICTLY filtered by Brand Goals - only shows social quests aligned with user's goals
   */
  private async getAvailableSocialQuests(userId: number, userGoals: string[] = []): Promise<any[]> {
    const recentIds = await this.getRecentQuestIds(userId, 7);
    
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
    
    const whereClauses: any[] = [
      eq(questDefinitions.isActive, true),
      inArray(questDefinitions.type, allowedSocialTypes as any)
    ];

    if (recentIds.length > 0) {
      whereClauses.push(notInArray(questDefinitions.id, recentIds));
    }

    return await db.select().from(questDefinitions).where(and(...whereClauses));
  }

  /**
   * Fallback allocation (original 1 Career + 1 Social)
   * Fetches simple quests without brand goal filtering
   */
  private async getFallbackAllocation(userId?: number): Promise<QuestAllocationResult> {
    console.log('[SmartQuestAllocator] Using fallback allocation: 1 Career + 1 Social');
    
    try {
      const selectedQuests: SelectedQuest[] = [];
      const recentIds = userId ? await this.getRecentQuestIds(userId, 7) : [];

      const careerWhere: any[] = [
        eq(questDefinitions.isActive, true),
        inArray(questDefinitions.type, ['profile_update', 'pulse_creation'] as any)
      ];
      if (recentIds.length > 0) {
        careerWhere.push(notInArray(questDefinitions.id, recentIds));
      }

      const careerQuests = await db
        .select()
        .from(questDefinitions)
        .where(and(...careerWhere))
        .limit(1);
      
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
      
      const socialWhere: any[] = [
        eq(questDefinitions.isActive, true),
        inArray(questDefinitions.type, ['social_quest', 'social_post'] as any)
      ];
      if (recentIds.length > 0) {
        socialWhere.push(notInArray(questDefinitions.id, recentIds));
      }

      const socialQuests = await db
        .select()
        .from(questDefinitions)
        .where(and(...socialWhere))
        .limit(1);
      
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
