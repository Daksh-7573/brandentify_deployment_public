/**
 * Smart Profile Quest Tracker
 * Tracks completed profile quests per Brand Goal
 * Only regenerates when goals change and profile doesn't match new goals
 */

import { db } from '../db';
import { users, userQuests, questDefinitions } from '@shared/schema';
import { eq, and, inArray } from 'drizzle-orm';

export interface ProfileQuestCompletion {
  userId: number;
  questType: string; // e.g., 'linkedin_add_skills', 'twitter_bio_optimization'
  platform: string;
  brandGoals: string[]; // Goals active when quest was completed
  completedAt: Date;
  profileSnapshot: any; // Snapshot of profile when completed
}

export class SmartProfileQuestTracker {

  /**
   * Check if a profile quest should be generated for user
   * Returns true if: 
   * 1. Quest has never been completed, OR
   * 2. User's Brand Goals have changed since quest completion, AND current profile doesn't match new goals
   */
  async shouldGenerateProfileQuest(
    userId: number, 
    questType: string,
    platform: string,
    currentGoals: string[]
  ): Promise<boolean> {
    try {
      // Get user's profile quest history
      const completedQuest = await this.getCompletedProfileQuest(userId, questType, platform);

      // Never completed - generate it
      if (!completedQuest) {
        console.log(`[ProfileTracker] Quest ${questType} never completed for user ${userId} - GENERATE`);
        return true;
      }

      // Check if goals have changed since completion
      const goalsChanged = this.haveGoalsChanged(completedQuest.brandGoals, currentGoals);
      
      if (!goalsChanged) {
        console.log(`[ProfileTracker] Quest ${questType} already completed with same goals - SKIP`);
        return false;
      }

      // Goals changed - check if current profile matches new goals
      const profileMatchesNewGoals = await this.doesProfileMatchGoals(
        userId, 
        questType, 
        currentGoals,
        completedQuest.profileSnapshot
      );

      if (profileMatchesNewGoals) {
        console.log(`[ProfileTracker] Goals changed but profile already matches - SKIP`);
        return false;
      }

      console.log(`[ProfileTracker] Goals changed and profile doesn't match - REGENERATE`);
      return true;

    } catch (error) {
      console.error('[ProfileTracker] Error checking quest generation:', error);
      return true; // Default to generating on error
    }
  }

  /**
   * Get completed profile quest for user
   */
  private async getCompletedProfileQuest(
    userId: number, 
    questType: string, 
    platform: string
  ): Promise<ProfileQuestCompletion | null> {
    try {
      // Query user_quests joined with quest_definitions
      const result = await db
        .select({
          quest: userQuests,
          definition: questDefinitions
        })
        .from(userQuests)
        .innerJoin(questDefinitions, eq(userQuests.questDefinitionId, questDefinitions.id))
        .where(
          and(
            eq(userQuests.userId, userId),
            eq(userQuests.isCompleted, true),
            eq(questDefinitions.targetAction, questType),
            eq(questDefinitions.platform, platform)
          )
        )
        .orderBy(userQuests.completedAt)
        .limit(1);

      if (!result.length) return null;

      const { quest, definition } = result[0];

      return {
        userId: quest.userId,
        questType: definition.targetAction || questType,
        platform: definition.platform || platform,
        brandGoals: quest.brandGoalsSnapshot ? JSON.parse(quest.brandGoalsSnapshot as string) : [],
        completedAt: quest.completedAt || new Date(),
        profileSnapshot: quest.profileSnapshot ? JSON.parse(quest.profileSnapshot as string) : {}
      };

    } catch (error) {
      console.error('[ProfileTracker] Error getting completed quest:', error);
      return null;
    }
  }

  /**
   * Check if Brand Goals have changed
   */
  private haveGoalsChanged(previousGoals: string[], currentGoals: string[]): boolean {
    // Sort arrays for comparison
    const prevSorted = [...previousGoals].sort();
    const currSorted = [...currentGoals].sort();
    
    if (prevSorted.length !== currSorted.length) return true;
    
    return !prevSorted.every((goal, index) => goal === currSorted[index]);
  }

  /**
   * Check if current profile matches new goals
   */
  private async doesProfileMatchGoals(
    userId: number,
    questType: string,
    currentGoals: string[],
    previousSnapshot: any
  ): Promise<boolean> {
    try {
      // Get current user profile
      const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!userResult.length) return false;

      const currentProfile = userResult[0];

      // Quest-specific matching logic
      switch (questType) {
        case 'linkedin_add_skills':
        case 'twitter_bio_optimization':
        case 'instagram_bio_cta':
          // Check if skills/bio contain keywords related to new goals
          return this.checkSkillsMatchGoals(currentProfile, currentGoals);

        case 'linkedin_update_headline':
          // Check if headline reflects new goals
          return this.checkHeadlineMatchesGoals(currentProfile, currentGoals);

        case 'linkedin_about_section':
          // Check if about section aligns with new goals
          return this.checkAboutMatchesGoals(currentProfile, currentGoals);

        default:
          // Conservative: assume profile doesn't match if we can't determine
          return false;
      }

    } catch (error) {
      console.error('[ProfileTracker] Error checking profile match:', error);
      return false;
    }
  }

  /**
   * Check if skills match current goals
   */
  private checkSkillsMatchGoals(profile: any, goals: string[]): boolean {
    const skills = profile.skills || [];
    const domain = profile.domain?.toLowerCase() || '';
    const industry = profile.industry?.toLowerCase() || '';

    // Map goals to expected keywords
    const goalKeywords = this.getGoalKeywords(goals);
    
    // Check if skills or domain/industry contain goal-related keywords
    const profileText = `${skills.join(' ')} ${domain} ${industry}`.toLowerCase();
    
    const matchCount = goalKeywords.filter(keyword => 
      profileText.includes(keyword.toLowerCase())
    ).length;

    // Consider it a match if at least 50% of goal keywords are present
    return matchCount >= Math.ceil(goalKeywords.length * 0.5);
  }

  /**
   * Check if headline matches goals
   */
  private checkHeadlineMatchesGoals(profile: any, goals: string[]): boolean {
    const headline = profile.title?.toLowerCase() || '';
    const goalKeywords = this.getGoalKeywords(goals);
    
    const matchCount = goalKeywords.filter(keyword => 
      headline.includes(keyword.toLowerCase())
    ).length;

    return matchCount >= Math.ceil(goalKeywords.length * 0.3);
  }

  /**
   * Check if about section matches goals
   */
  private checkAboutMatchesGoals(profile: any, goals: string[]): boolean {
    const about = profile.aboutMe?.toLowerCase() || '';
    const goalKeywords = this.getGoalKeywords(goals);
    
    const matchCount = goalKeywords.filter(keyword => 
      about.includes(keyword.toLowerCase())
    ).length;

    return matchCount >= Math.ceil(goalKeywords.length * 0.4);
  }

  /**
   * Get relevant keywords for Brand Goals
   */
  private getGoalKeywords(goals: string[]): string[] {
    const keywords: string[] = [];

    const goalKeywordMap: { [key: string]: string[] } = {
      // Visibility Goals
      'visibility_1': ['industry expert', 'thought leader', 'authority', 'visibility'],
      'visibility_2': ['speaker', 'conference', 'keynote', 'workshop'],
      'visibility_3': ['media', 'press', 'featured', 'interview'],
      'visibility_4': ['recruiter', 'opportunity', 'headhunter', 'talent'],
      'visibility_5': ['award', 'recognition', 'certified', 'achievement'],

      // Professional Goals
      'professional_1': ['authority', 'expert', 'specialist', 'niche'],
      'professional_2': ['founder', 'entrepreneur', 'ceo', 'startup'],
      'professional_3': ['executive', 'leadership', 'director', 'vp'],

      // Engagement Goal
      'engagement_1': ['community', 'network', 'engagement', 'connection'],

      // Monetization Goals
      'monetization_1': ['consulting', 'advisor', 'coach', 'mentor'],
      'monetization_2': ['freelance', 'contract', 'project', 'client'],
      'monetization_3': ['product', 'saas', 'service', 'offer']
    };

    goals.forEach(goal => {
      if (goalKeywordMap[goal]) {
        keywords.push(...goalKeywordMap[goal]);
      }
    });

    return keywords;
  }

  /**
   * Record profile quest completion with current goals and profile snapshot
   */
  async recordProfileQuestCompletion(
    userId: number,
    questId: number,
    currentGoals: string[]
  ): Promise<void> {
    try {
      // Get current profile snapshot
      const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!userResult.length) return;

      const profileSnapshot = {
        skills: userResult[0].skills,
        title: userResult[0].title,
        aboutMe: userResult[0].aboutMe,
        domain: userResult[0].domain,
        industry: userResult[0].industry,
        snapshotDate: new Date().toISOString()
      };

      // Update quest with goals snapshot and profile snapshot
      await db
        .update(userQuests)
        .set({
          brandGoalsSnapshot: JSON.stringify(currentGoals),
          profileSnapshot: JSON.stringify(profileSnapshot),
          completedAt: new Date()
        })
        .where(eq(userQuests.id, questId));

      console.log(`[ProfileTracker] Recorded completion for quest ${questId} with goals:`, currentGoals);

    } catch (error) {
      console.error('[ProfileTracker] Error recording completion:', error);
    }
  }

  /**
   * Get available profile quests for user based on goals and platform
   */
  async getAvailableProfileQuests(
    userId: number,
    platform: string,
    currentGoals: string[]
  ): Promise<string[]> {
    const { getProfileTemplates } = await import('./social-quest-activity-templates');
    const profileTemplates = getProfileTemplates().filter(t => t.platform === platform);

    const availableQuests: string[] = [];

    for (const template of profileTemplates) {
      const shouldGenerate = await this.shouldGenerateProfileQuest(
        userId,
        template.activityType,
        platform,
        currentGoals
      );

      if (shouldGenerate) {
        availableQuests.push(template.id);
      }
    }

    return availableQuests;
  }
}

// Export singleton
export const smartProfileQuestTracker = new SmartProfileQuestTracker();
