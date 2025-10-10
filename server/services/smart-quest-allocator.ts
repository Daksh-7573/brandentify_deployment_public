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
      const availableSocialQuests = await this.getAvailableSocialQuests(userId);
      
      console.log(`[SmartQuestAllocator] Available: ${availableCareerQuests.length} career, ${availableSocialQuests.length} social`);

      if (availableCareerQuests.length === 0 && availableSocialQuests.length === 0) {
        console.log('[SmartQuestAllocator] No available quests - returning fallback');
        return this.getFallbackAllocation();
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
      return this.getFallbackAllocation();
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
  private async getUserBrandGoals(userId: number): Promise<string[]> {
    const [userGoals] = await db
      .select()
      .from(brandGoals)
      .where(eq(brandGoals.userId, userId))
      .limit(1);
    
    return userGoals?.selectedGoals || [];
  }

  /**
   * Get available career quests (not yet assigned today)
   * STRICTLY filtered by:
   * 1. Profile focus (profile-building vs pulse-creation)
   * 2. Selected Brand Goals (ONLY matching quest types)
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
    
    // Step 1: Define quest types based on focus area
    const profileBuildingTypes = ['profile_update', 'resume', 'portfolio', 'learning', 'exploration', 'networking'];
    const pulseFocusedTypes = ['pulse_creation', 'visibility', 'networking'];
    
    const focusAreaTypes = focusArea === 'profile' ? profileBuildingTypes : pulseFocusedTypes;
    
    // Step 2: Get quest types allowed by Brand Goals (STRICT)
    const brandGoalAllowedTypes = BrandGoalQuestMapper.getAllowedQuestTypes(userGoals);
    
    // Step 3: Intersect both - quest must match BOTH focus area AND Brand Goals
    let finalAllowedTypes: string[];
    
    if (userGoals.length === 0) {
      // No Brand Goals selected - use only focus area types (fallback)
      console.log('[SmartQuestAllocator] ⚠️ No Brand Goals selected - using focus area types only');
      finalAllowedTypes = focusAreaTypes;
    } else {
      // STRICT: Only quests that match BOTH focus area AND Brand Goals
      finalAllowedTypes = focusAreaTypes.filter(type => brandGoalAllowedTypes.includes(type));
      console.log(`[SmartQuestAllocator] 🎯 Brand Goal filtering: ${brandGoalAllowedTypes.length} goal types × ${focusAreaTypes.length} focus types = ${finalAllowedTypes.length} allowed types`);
    }
    
    // If no matching types after intersection, return empty
    if (finalAllowedTypes.length === 0) {
      console.log('[SmartQuestAllocator] ❌ No quest types match both Brand Goals and focus area');
      return [];
    }
    
    // Get career quests not assigned today, filtered by final allowed types
    const careerQuestsQuery = assignedIds.length > 0
      ? db.select()
          .from(questDefinitions)
          .where(and(
            ne(questDefinitions.type, 'social_post'),
            ne(questDefinitions.type, 'social_quest'),
            notInArray(questDefinitions.id, assignedIds),
            inArray(questDefinitions.type, finalAllowedTypes as any)
          ))
      : db.select()
          .from(questDefinitions)
          .where(and(
            ne(questDefinitions.type, 'social_post'),
            ne(questDefinitions.type, 'social_quest'),
            inArray(questDefinitions.type, finalAllowedTypes as any)
          ));
    
    return await careerQuestsQuery;
  }

  /**
   * Get available social quests (not yet assigned today)
   */
  private async getAvailableSocialQuests(userId: number): Promise<any[]> {
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
    
    // Get social quests not assigned today
    const socialQuestsQuery = assignedIds.length > 0
      ? db.select()
          .from(questDefinitions)
          .where(and(
            eq(questDefinitions.type, 'social_post'),
            notInArray(questDefinitions.id, assignedIds)
          ))
      : db.select()
          .from(questDefinitions)
          .where(eq(questDefinitions.type, 'social_post'));
    
    return await socialQuestsQuery;
  }

  /**
   * Fallback allocation (original 1 Career + 1 Social)
   */
  private getFallbackAllocation(): QuestAllocationResult {
    console.log('[SmartQuestAllocator] Using fallback allocation: 1 Career + 1 Social');
    
    return {
      totalQuests: 2,
      careerQuests: 1,
      socialQuests: 1,
      totalImpactScore: 100,
      allocationStrategy: 'Fallback: Default 1+1',
      selectedQuests: []
    };
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
