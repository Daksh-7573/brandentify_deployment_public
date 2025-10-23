/**
 * Unified AI Quest Generator
 * Replaces template-based quest generation with TRUE AI-powered personalization
 * Uses FREE local Ollama (Llama 3.2:3b) for cost-effective quest generation
 */

import { db } from '../db';
import { users, skills, workExperiences, questDefinitions } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { localAIService } from './local-ai-service';

export interface GeneratedQuest {
  title: string;
  description: string;
  muskTip: string;
  questType: string;
  xpReward: number;
  difficulty: string;
  questDefinitionId: number;
  platform?: string;
}

/**
 * Unified AI-Powered Quest Generator
 * Generates both career and social quests using real AI instead of templates
 */
export class UnifiedAIQuestGenerator {
  
  /**
   * Generate a personalized career quest using AI
   */
  async generateCareerQuest(userId: number): Promise<GeneratedQuest | null> {
    console.log(`[AI Quest Generator] Generating AI-powered career quest for user ${userId}`);
    
    try {
      // Get user data
      const userData = await this.getUserData(userId);
      if (!userData) {
        console.log(`[AI Quest Generator] User ${userId} not found`);
        return null;
      }

      // Get quest definition
      const questDef = await this.getQuestDefinition('pulse_creation');
      if (!questDef) {
        console.log(`[AI Quest Generator] No quest definition found for pulse_creation`);
        return null;
      }

      // Build context for AI
      const context = this.buildUserContext(userData, 'career');

      // Generate quest using AI
      const aiQuest = await localAIService.generateQuest(context);

      return {
        title: aiQuest.title,
        description: aiQuest.description,
        muskTip: aiQuest.muskTip,
        questType: questDef.type,
        xpReward: questDef.xpReward || 85,
        difficulty: questDef.difficulty || 'advanced',
        questDefinitionId: questDef.id
      };
    } catch (error) {
      console.error(`[AI Quest Generator] Error generating career quest:`, error);
      return null;
    }
  }

  /**
   * Generate a personalized social quest using AI
   */
  async generateSocialQuest(userId: number): Promise<GeneratedQuest | null> {
    console.log(`[AI Quest Generator] Generating AI-powered social quest for user ${userId}`);
    
    try {
      // Get user data
      const userData = await this.getUserData(userId);
      if (!userData) {
        console.log(`[AI Quest Generator] User ${userId} not found`);
        return null;
      }

      // Get quest definition
      const questDef = await this.getQuestDefinition('social_quest');
      if (!questDef) {
        console.log(`[AI Quest Generator] No quest definition found for social_quest`);
        return null;
      }

      // Determine best platform for user's audience
      const platform = this.selectPlatformForAudience(userData.user);

      // Build context for AI
      const context = this.buildUserContext(userData, 'social', platform);

      // Generate quest using AI
      const aiQuest = await localAIService.generateQuest(context);

      return {
        title: aiQuest.title,
        description: aiQuest.description,
        muskTip: aiQuest.muskTip,
        questType: questDef.type,
        xpReward: questDef.xpReward || 50,
        difficulty: 'intermediate',
        questDefinitionId: questDef.id,
        platform
      };
    } catch (error) {
      console.error(`[AI Quest Generator] Error generating social quest:`, error);
      return null;
    }
  }

  /**
   * Get user data including profile, skills, and experience
   */
  private async getUserData(userId: number) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return null;

    const userSkills = await db.select().from(skills).where(eq(skills.userId, userId));
    const experiences = await db.select().from(workExperiences).where(eq(workExperiences.userId, userId));

    return { user, skills: userSkills, experiences };
  }

  /**
   * Build context object for AI quest generation
   */
  private buildUserContext(userData: any, questType: 'career' | 'social', platform?: string) {
    const { user, skills, experiences } = userData;

    const primaryAudience = user.primaryAudience?.[0] || 'Professionals';
    const secondaryAudience = user.secondaryAudience?.[0] || '';
    
    // Extract brand goals - handle both array and object formats
    let brandGoals: string[] = [];
    if (Array.isArray(user.brandGoals)) {
      brandGoals = user.brandGoals;
    } else if (user.brandGoals && typeof user.brandGoals === 'object') {
      brandGoals = Object.values(user.brandGoals);
    }
    
    // Default brand goals if none set
    if (brandGoals.length === 0) {
      brandGoals = ['Build professional reputation', 'Expand network'];
    }

    // Extract skill names
    const skillNames = skills.map((s: any) => s.name || s.skillName).filter(Boolean);
    if (skillNames.length === 0) {
      skillNames.push(user.domain || 'Professional skills');
    }

    return {
      name: user.name || 'Professional',
      title: user.title || 'Professional',
      industry: user.industry || 'Technology',
      domain: user.domain || user.title || 'Professional Development',
      location: user.location || 'Global',
      primaryAudience,
      secondaryAudience,
      brandGoals,
      skills: skillNames,
      questType,
      platform
    };
  }

  /**
   * Select best platform based on user's target audience
   */
  private selectPlatformForAudience(user: any): string {
    const primaryAudience = user.primaryAudience?.[0]?.toLowerCase() || '';
    
    // Platform selection based on audience demographics
    const platformMap: Record<string, string> = {
      'executives': 'linkedin',
      'investors': 'linkedin',
      'entrepreneurs': 'linkedin',
      'students': 'instagram',
      'creators': 'instagram',
      'developers': 'twitter',
      'designers': 'instagram',
      'marketers': 'linkedin'
    };

    for (const [audience, platform] of Object.entries(platformMap)) {
      if (primaryAudience.includes(audience)) {
        return platform;
      }
    }

    return 'linkedin'; // Default to LinkedIn for professionals
  }

  /**
   * Get quest definition from database
   */
  private async getQuestDefinition(questType: string) {
    const [questDef] = await db
      .select()
      .from(questDefinitions)
      .where(eq(questDefinitions.type, questType as any))
      .limit(1);
    
    return questDef || null;
  }
}

export const unifiedAIQuestGenerator = new UnifiedAIQuestGenerator();
