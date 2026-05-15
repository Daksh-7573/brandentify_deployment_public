/**
 * Quest Intelligence Service
 * 
 * Provides smart quest management features:
 * - Duplicate prevention using content hashing
 * - Progressive difficulty based on user level
 * - Quest variety balancing (networking, branding, profile, engagement, strategy)
 * - User behavior analysis for smart recommendations
 */

import { db } from '../db';
import { userQuests, questDefinitions, userQuestHistory, users } from '@shared/schema';
import { eq, and, gte, lte, sql, inArray, notInArray } from 'drizzle-orm';
import { createHash } from 'crypto';

export interface UserQuestProfile {
  userId: number;
  level: number;
  totalXp: number;
  questCompletionRate: number;
  preferredCategories: string[];
  weakAreas: string[];
  recentQuestTypes: string[];
  profileCompletion: number;
  networkSize: number;
  contentCreationStreak: number;
  engagementScore: number;
}

export interface QuestDifficultyConfig {
  beginner: {
    xpReward: { min: number; max: number };
    estimatedTime: { min: number; max: number };
    targetCount: { min: number; max: number };
    complexity: 'simple';
  };
  intermediate: {
    xpReward: { min: number; max: number };
    estimatedTime: { min: number; max: number };
    targetCount: { min: number; max: number };
    complexity: 'moderate';
  };
  advanced: {
    xpReward: { min: number; max: number };
    estimatedTime: { min: number; max: number };
    targetCount: { min: number; max: number };
    complexity: 'complex';
  };
}

export class QuestIntelligenceService {
  
  // Difficulty configuration based on user level
  private readonly difficultyConfig: QuestDifficultyConfig = {
    beginner: {
      xpReward: { min: 50, max: 75 },
      estimatedTime: { min: 10, max: 30 },
      targetCount: { min: 1, max: 3 },
      complexity: 'simple'
    },
    intermediate: {
      xpReward: { min: 75, max: 125 },
      estimatedTime: { min: 30, max: 60 },
      targetCount: { min: 3, max: 8 },
      complexity: 'moderate'
    },
    advanced: {
      xpReward: { min: 125, max: 200 },
      estimatedTime: { min: 60, max: 120 },
      targetCount: { min: 5, max: 15 },
      complexity: 'complex'
    }
  };

  /**
   * Generate content hash for duplicate detection
   */
  generateContentHash(title: string, description: string, objective?: string): string {
    const content = `${title}|${description}|${objective || ''}`;
    return createHash('sha256').update(content.toLowerCase().trim()).digest('hex').substring(0, 16);
  }

  /**
   * Check if a quest would be a duplicate for a user
   */
  async isDuplicateQuest(
    userId: number,
    title: string,
    description: string,
    objective?: string
  ): Promise<boolean> {
    const contentHash = this.generateContentHash(title, description, objective);
    
    // Check user's quest history
    const recentQuests = await db
      .select({
        quest: userQuests,
        definition: questDefinitions
      })
      .from(userQuests)
      .innerJoin(questDefinitions, eq(userQuests.questDefinitionId, questDefinitions.id))
      .where(
        and(
          eq(userQuests.userId, userId),
          gte(userQuests.assignedAt, sql`NOW() - INTERVAL '30 days'`)
        )
      );
    
    // Check for matching content hash or similar titles
    for (const { quest, definition } of recentQuests) {
      const existingHash = definition.questContentHash;
      if (existingHash === contentHash) {
        console.log(`[QuestIntelligence] Duplicate detected for user ${userId}: ${title}`);
        return true;
      }
      
      // Also check for similar titles (simplified similarity check)
      const titleSimilarity = this.calculateStringSimilarity(
        title.toLowerCase(),
        definition.title.toLowerCase()
      );
      if (titleSimilarity > 0.8) {
        console.log(`[QuestIntelligence] Similar title detected (${titleSimilarity}): ${title}`);
        return true;
      }
    }
    
    return false;
  }

  /**
   * Calculate string similarity using Jaccard index
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const set1 = new Set(str1.split(/\s+/));
    const set2 = new Set(str2.split(/\s+/));
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }

  /**
   * Determine appropriate difficulty level based on user stats
   */
  async determineDifficultyLevel(userId: number): Promise<'beginner' | 'intermediate' | 'advanced'> {
    const userProfile = await this.buildUserQuestProfile(userId);
    
    // Level-based difficulty progression
    if (userProfile.level < 5) {
      return 'beginner';
    } else if (userProfile.level < 15) {
      return 'intermediate';
    } else {
      return 'advanced';
    }
  }

  /**
   * Get difficulty configuration for a level
   */
  getDifficultyConfig(level: 'beginner' | 'intermediate' | 'advanced') {
    return this.difficultyConfig[level];
  }

  /**
   * Build comprehensive user quest profile for personalization
   */
  async buildUserQuestProfile(userId: number): Promise<UserQuestProfile> {
    // Get user basic info
    const userResult = await db
      .select({
        id: users.id,
        profileCompleted: users.profileCompleted,
        level: sql<number>`COALESCE((${users.premiumFeaturesUsage}->>'level')::int, 1)`,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    const user = userResult[0];
    
    // Get quest statistics
    const questStats = await db
      .select({
        totalQuests: sql<number>`count(*)`,
        completedQuests: sql<number>`sum(case when ${userQuests.isCompleted} = true then 1 else 0 end)`,
        totalXp: sql<number>`sum(COALESCE(${userQuests.xpEarned}, 0))`,
        networkingQuests: sql<number>`sum(case when ${questDefinitions.questCategory} = 'networking' then 1 else 0 end)`,
        profileQuests: sql<number>`sum(case when ${questDefinitions.questCategory} = 'profile' then 1 else 0 end)`,
        careerQuests: sql<number>`sum(case when ${questDefinitions.questCategory} = 'career' then 1 else 0 end)`,
        portfolioQuests: sql<number>`sum(case when ${questDefinitions.questCategory} = 'portfolio' then 1 else 0 end)`
      })
      .from(userQuests)
      .innerJoin(questDefinitions, eq(userQuests.questDefinitionId, questDefinitions.id))
      .where(eq(userQuests.userId, userId));
    
    const stats = questStats[0];
    const completionRate = stats.totalQuests > 0 
      ? (stats.completedQuests / stats.totalQuests) * 100 
      : 0;
    
    // Determine preferred categories
    const categoryCounts = [
      { category: 'networking', count: stats.networkingQuests },
      { category: 'profile', count: stats.profileQuests },
      { category: 'career', count: stats.careerQuests },
      { category: 'portfolio', count: stats.portfolioQuests }
    ];
    
    const preferredCategories = categoryCounts
      .filter(c => c.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 2)
      .map(c => c.category);
    
    // Determine weak areas (categories with few quests)
    const weakAreas = categoryCounts
      .filter(c => c.count === 0)
      .map(c => c.category);
    
    // Get recent quest types
    const recentQuests = await db
      .select({
        type: questDefinitions.type,
        category: questDefinitions.questCategory
      })
      .from(userQuests)
      .innerJoin(questDefinitions, eq(userQuests.questDefinitionId, questDefinitions.id))
      .where(
        and(
          eq(userQuests.userId, userId),
          gte(userQuests.assignedAt, sql`NOW() - INTERVAL '7 days'`)
        )
      )
      .orderBy(userQuests.assignedAt)
      .limit(10);
    
    const recentQuestTypes = [...new Set(recentQuests.map(q => q.type))];
    
    return {
      userId,
      level: user?.level || 1,
      totalXp: stats.totalXp || 0,
      questCompletionRate: completionRate,
      preferredCategories,
      weakAreas,
      recentQuestTypes,
      profileCompletion: user?.profileCompleted || 0,
      networkSize: 0, // Would need connection count query
      contentCreationStreak: 0, // Would need activity tracking
      engagementScore: 0 // Would need engagement calculation
    };
  }

  /**
   * Balance quest variety for a weekly quest set
   */
  async balanceQuestVariety(
    userId: number,
    candidateQuests: any[]
  ): Promise<any[]> {
    const userProfile = await this.buildUserQuestProfile(userId);
    const balancedQuests: any[] = [];
    const categoryCounts: Record<string, number> = {};
    
    // Required categories for balanced weekly set
    const requiredCategories = ['networking', 'profile', 'career', 'engagement', 'strategy'];
    
    // First pass: ensure variety across categories
    for (const category of requiredCategories) {
      const categoryQuests = candidateQuests.filter(q => 
        q.category === category || q.questCategory === category
      );
      
      if (categoryQuests.length > 0 && !categoryCounts[category]) {
        // Select best quest from this category
        const selectedQuest = this.selectBestQuest(categoryQuests, userProfile);
        balancedQuests.push(selectedQuest);
        categoryCounts[category] = 1;
      }
    }
    
    // Second pass: fill remaining slots with preferred categories
    const remainingSlots = 5 - balancedQuests.length;
    const remainingQuests = candidateQuests.filter(q => 
      !balancedQuests.some(bq => bq.id === q.id)
    );
    
    // Sort by user's preferred categories
    const sortedRemaining = remainingQuests.sort((a, b) => {
      const aPreferred = userProfile.preferredCategories.includes(a.category || a.questCategory);
      const bPreferred = userProfile.preferredCategories.includes(b.category || b.questCategory);
      return bPreferred ? 1 : -1;
    });
    
    // Add remaining quests up to the limit
    for (let i = 0; i < Math.min(remainingSlots, sortedRemaining.length); i++) {
      balancedQuests.push(sortedRemaining[i]);
    }
    
    return balancedQuests.slice(0, 5);
  }

  /**
   * Select the best quest from a set based on user profile
   */
  private selectBestQuest(quests: any[], userProfile: UserQuestProfile): any {
    // Score each quest
    const scoredQuests = quests.map(quest => {
      let score = 0;
      
      // Prefer quests in user's preferred categories
      if (userProfile.preferredCategories.includes(quest.category || quest.questCategory)) {
        score += 10;
      }
      
      // Prefer quests addressing weak areas
      if (userProfile.weakAreas.includes(quest.category || quest.questCategory)) {
        score += 15;
      }
      
      // Prefer quests not recently completed
      if (!userProfile.recentQuestTypes.includes(quest.type)) {
        score += 5;
      }
      
      // Prefer moderate difficulty quests based on user level
      const difficultyMatch = this.difficultyMatchesLevel(
        quest.difficultyLevel || 'beginner',
        userProfile.level
      );
      score += difficultyMatch ? 10 : 0;
      
      return { quest, score };
    });
    
    // Sort by score and return highest
    scoredQuests.sort((a, b) => b.score - a.score);
    return scoredQuests[0]?.quest || quests[0];
  }

  /**
   * Check if difficulty matches user level
   */
  private difficultyMatchesLevel(difficulty: string, level: number): boolean {
    const difficultyMap: Record<string, number[]> = {
      'beginner': [1, 5],
      'intermediate': [5, 15],
      'advanced': [15, 100]
    };
    
    const range = difficultyMap[difficulty] || [1, 100];
    return level >= range[0] && level < range[1];
  }

  /**
   * Get smart quest recommendations based on user behavior
   */
  async getSmartRecommendations(userId: number): Promise<{
    recommendedCategory: string;
    recommendedType: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
  }> {
    const profile = await this.buildUserQuestProfile(userId);
    
    // Priority 1: Profile completion if below 70%
    if (profile.profileCompletion < 70) {
      return {
        recommendedCategory: 'profile',
        recommendedType: 'profile_update',
        reason: `Your profile is only ${profile.profileCompletion}% complete. Complete it to increase visibility 3x.`,
        priority: 'high'
      };
    }
    
    // Priority 2: Networking if network is small
    if (profile.networkSize < 10) {
      return {
        recommendedCategory: 'networking',
        recommendedType: 'networking',
        reason: 'Building your professional network is critical for career growth. 70-80% of jobs come through networking.',
        priority: 'high'
      };
    }
    
    // Priority 3: Content creation if no recent activity
    if (profile.contentCreationStreak === 0) {
      return {
        recommendedCategory: 'career',
        recommendedType: 'pulse_creation',
        reason: 'You haven\'t shared any insights recently. Creating content positions you as a thought leader.',
        priority: 'medium'
      };
    }
    
    // Priority 4: Work on weak areas
    if (profile.weakAreas.length > 0) {
      const weakCategory = profile.weakAreas[0];
      return {
        recommendedCategory: weakCategory,
        recommendedType: this.getDefaultTypeForCategory(weakCategory),
        reason: `You haven't explored ${weakCategory} quests yet. Diversifying your professional development leads to better outcomes.`,
        priority: 'medium'
      };
    }
    
    // Default: Continue with preferred category
    return {
      recommendedCategory: profile.preferredCategories[0] || 'career',
      recommendedType: 'engagement',
      reason: 'Continue building on your strengths while gradually exploring new areas.',
      priority: 'low'
    };
  }

  /**
   * Get default quest type for a category
   */
  private getDefaultTypeForCategory(category: string): string {
    const typeMap: Record<string, string> = {
      'networking': 'networking',
      'profile': 'profile_update',
      'career': 'pulse_creation',
      'portfolio': 'portfolio',
      'engagement': 'social_quest'
    };
    return typeMap[category] || 'pulse_creation';
  }

  /**
   * Prevent repetitive quest patterns by tracking user history
   */
  async preventRepetitivePatterns(userId: number, questType: string): Promise<boolean> {
    // Get last 14 days of quest history
    const recentHistory = await db
      .select({
        type: questDefinitions.type,
        category: questDefinitions.questCategory
      })
      .from(userQuestHistory)
      .innerJoin(questDefinitions, eq(userQuestHistory.questDefinitionId, questDefinitions.id))
      .where(
        and(
          eq(userQuestHistory.userId, userId),
          gte(userQuestHistory.assignedAt, sql`NOW() - INTERVAL '14 days'`)
        )
      );
    
    // Count occurrences of this quest type
    const typeCount = recentHistory.filter(h => h.type === questType).length;
    
    // If type appears more than 3 times in 14 days, consider it repetitive
    if (typeCount >= 3) {
      console.log(`[QuestIntelligence] Preventing repetitive pattern: ${questType} (${typeCount} times in 14 days)`);
      return false;
    }
    
    return true;
  }

  /**
   * Generate weekly quest recommendations with all intelligence features
   */
  async generateIntelligentWeeklyQuests(userId: number): Promise<any[]> {
    console.log(`[QuestIntelligence] Generating intelligent quests for user ${userId}`);
    
    // 1. Build user profile
    const userProfile = await this.buildUserQuestProfile(userId);
    
    // 2. Get smart recommendations
    const recommendation = await this.getSmartRecommendations(userId);
    
    // 3. Determine appropriate difficulty
    const difficultyLevel = await this.determineDifficultyLevel(userId);
    const difficultyConfig = this.getDifficultyConfig(difficultyLevel);
    
    // 4. Get candidate quests (would integrate with quest generator)
    // For now, returning configuration for quest generation
    const questConfig = {
      userId,
      difficultyLevel,
      difficultyConfig,
      recommendedCategory: recommendation.recommendedCategory,
      recommendedType: recommendation.recommendedType,
      priority: recommendation.priority,
      reason: recommendation.reason,
      preferredCategories: userProfile.preferredCategories,
      weakAreas: userProfile.weakAreas,
      avoidTypes: userProfile.recentQuestTypes.slice(0, 3) // Avoid last 3 types
    };
    
    console.log(`[QuestIntelligence] Quest config generated:`, questConfig);
    
    // Return configuration object for quest generator
    return [questConfig];
  }
}

// Export singleton instance
export const questIntelligence = new QuestIntelligenceService();
