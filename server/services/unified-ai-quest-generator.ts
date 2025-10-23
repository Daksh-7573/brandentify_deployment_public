/**
 * Unified AI Quest Generator
 * Replaces template-based quest generation with TRUE AI-powered personalization
 * Uses FREE local Ollama (Llama 3.2:3b) for cost-effective quest generation
 */

import { db } from '../db';
import { users, skills, workExperiences, questDefinitions, brandGoals } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { localAIService } from './local-ai-service';

// Brand goal ID to text mapping
const BRAND_GOAL_MAP: Record<string, string> = {
  'professional_1': 'Position myself as an authority in my niche',
  'professional_2': 'Transition into a new career',
  'professional_3': 'Showcase my portfolio and attract clients',
  'entrepreneurial_1': 'Build credibility for my startup or business',
  'entrepreneurial_2': 'Network with investors and partners',
  'entrepreneurial_3': 'Attract top talent to my team',
  'personal_1': 'Share my journey and inspire others',
  'personal_2': 'Advocate for causes I care about',
  'personal_3': 'Build a personal community around shared interests'
};

export interface QuestSubtask {
  title: string;
  description: string;
  estimatedMinutes: number;
  platformActivity?: string;
  platformDetails?: any;
}

export interface GeneratedQuest {
  title: string;
  description: string;
  muskTip: string;
  questType: string;
  xpReward: number;
  difficulty: string;
  questDefinitionId: number;
  platform?: string;
  subtasks?: QuestSubtask[];
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

      console.log(`[AI Quest Generator] Generated quest with ${aiQuest.subtasks?.length || 0} subtasks`);

      return {
        title: aiQuest.title,
        description: aiQuest.description,
        muskTip: aiQuest.muskTip,
        questType: questDef.type,
        xpReward: questDef.xpReward || 85,
        difficulty: questDef.difficultyLevel || 'advanced',
        questDefinitionId: questDef.id,
        subtasks: aiQuest.subtasks
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
      const platform = this.selectPlatformForAudience(userData);

      // Build context for AI
      const context = this.buildUserContext(userData, 'social', platform);

      // Generate quest using AI
      const aiQuest = await localAIService.generateQuest(context);

      console.log(`[AI Quest Generator] Generated quest with ${aiQuest.subtasks?.length || 0} subtasks`);

      return {
        title: aiQuest.title,
        description: aiQuest.description,
        muskTip: aiQuest.muskTip,
        questType: questDef.type,
        xpReward: questDef.xpReward || 50,
        difficulty: 'intermediate',
        questDefinitionId: questDef.id,
        platform,
        subtasks: aiQuest.subtasks
      };
    } catch (error) {
      console.error(`[AI Quest Generator] Error generating social quest:`, error);
      return null;
    }
  }

  /**
   * Get user data including profile, skills, experience, and brand goals
   */
  private async getUserData(userId: number) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return null;

    const userSkills = await db.select().from(skills).where(eq(skills.userId, userId));
    const experiences = await db.select().from(workExperiences).where(eq(workExperiences.userId, userId));
    
    // ✅ FIX: Fetch brand goals from brand_goals table
    const [userBrandGoals] = await db.select().from(brandGoals).where(eq(brandGoals.userId, userId));
    
    // Map selected goal IDs to full text descriptions
    let mappedGoals: string[] = [];
    if (userBrandGoals?.selectedGoals) {
      mappedGoals = userBrandGoals.selectedGoals
        .map((goalId: string) => BRAND_GOAL_MAP[goalId])
        .filter(Boolean);
    }
    
    // Add custom goals if any
    if (userBrandGoals?.customGoals && userBrandGoals.customGoals.length > 0) {
      mappedGoals.push(...userBrandGoals.customGoals);
    }

    return { user, skills: userSkills, experiences, brandGoals: mappedGoals };
  }

  /**
   * Build context object for AI quest generation
   */
  private buildUserContext(userData: any, questType: 'career' | 'social', platform?: string) {
    const { user, skills, experiences, brandGoals: fetchedBrandGoals } = userData;

    const primaryAudience = user.primaryAudience?.[0] || 'Professionals';
    const secondaryAudience = user.secondaryAudience?.[0] || '';
    
    // ✅ FIX: Use brand goals fetched from database
    let brandGoals: string[] = fetchedBrandGoals || [];
    
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
   * INTELLIGENT PLATFORM SELECTOR
   * Selects best platform based on maximum audience reach potential
   * Considers: Primary/Secondary Audience + Industry + Domain + Goals
   */
  private selectPlatformForAudience(userData: any): string {
    const { user, brandGoals: fetchedBrandGoals } = userData;
    const primaryAudience = user.primaryAudience || [];
    const secondaryAudience = user.secondaryAudience || [];
    const industry = (user.industry || '').toLowerCase();
    const domain = (user.domain || user.title || '').toLowerCase();
    const goals = fetchedBrandGoals || [];

    // Platform scoring system (0-100 points)
    const platformScores: Record<string, number> = {
      'linkedin': 0,
      'twitter': 0,
      'instagram': 0,
      'youtube': 0,
      'tiktok': 0
    };

    // 1️⃣ AUDIENCE-BASED SCORING (40 points)
    const audiencePlatformMap: Record<string, Record<string, number>> = {
      'executives': { linkedin: 20, twitter: 10, youtube: 5, instagram: 3, tiktok: 2 },
      'investors': { linkedin: 20, twitter: 15, youtube: 8, instagram: 3, tiktok: 2 },
      'entrepreneurs': { linkedin: 18, twitter: 15, instagram: 10, youtube: 8, tiktok: 5 },
      'students': { instagram: 18, tiktok: 15, youtube: 12, linkedin: 8, twitter: 5 },
      'creators': { instagram: 18, youtube: 18, tiktok: 15, twitter: 10, linkedin: 5 },
      'developers': { twitter: 18, linkedin: 15, youtube: 10, instagram: 5, tiktok: 2 },
      'designers': { instagram: 18, linkedin: 12, twitter: 10, youtube: 8, tiktok: 8 },
      'marketers': { linkedin: 18, twitter: 15, instagram: 12, youtube: 10, tiktok: 8 },
      'freelancers': { linkedin: 15, instagram: 12, twitter: 10, youtube: 8, tiktok: 5 },
      'professionals': { linkedin: 20, twitter: 12, youtube: 8, instagram: 5, tiktok: 3 }
    };

    // Primary audience (higher weight)
    primaryAudience.forEach((audience: string) => {
      const audienceKey = audience.toLowerCase();
      const scores = audiencePlatformMap[audienceKey];
      if (scores) {
        Object.entries(scores).forEach(([platform, score]) => {
          platformScores[platform] += score;
        });
      }
    });

    // Secondary audience (lower weight - 50%)
    secondaryAudience.forEach((audience: string) => {
      const audienceKey = audience.toLowerCase();
      const scores = audiencePlatformMap[audienceKey];
      if (scores) {
        Object.entries(scores).forEach(([platform, score]) => {
          platformScores[platform] += score * 0.5;
        });
      }
    });

    // 2️⃣ INDUSTRY-BASED SCORING (30 points)
    const industryPlatformMap: Record<string, Record<string, number>> = {
      'technology': { twitter: 15, linkedin: 12, youtube: 8, instagram: 5, tiktok: 3 },
      'finance': { linkedin: 18, twitter: 10, youtube: 6, instagram: 3, tiktok: 2 },
      'healthcare': { linkedin: 15, youtube: 12, twitter: 8, instagram: 5, tiktok: 3 },
      'education': { youtube: 15, linkedin: 12, instagram: 10, twitter: 8, tiktok: 8 },
      'marketing': { instagram: 15, linkedin: 12, twitter: 12, youtube: 10, tiktok: 10 },
      'creative': { instagram: 18, youtube: 15, tiktok: 12, twitter: 8, linkedin: 5 },
      'entertainment': { tiktok: 18, instagram: 15, youtube: 15, twitter: 10, linkedin: 3 },
      'consulting': { linkedin: 18, twitter: 10, youtube: 8, instagram: 3, tiktok: 2 }
    };

    for (const [ind, scores] of Object.entries(industryPlatformMap)) {
      if (industry.includes(ind)) {
        Object.entries(scores).forEach(([platform, score]) => {
          platformScores[platform] += score;
        });
        break;
      }
    }

    // 3️⃣ DOMAIN-BASED SCORING (20 points)
    const domainKeywords: Record<string, Record<string, number>> = {
      'software': { twitter: 10, linkedin: 8, youtube: 6, instagram: 3, tiktok: 2 },
      'design': { instagram: 10, linkedin: 6, twitter: 5, youtube: 5, tiktok: 6 },
      'sales': { linkedin: 10, twitter: 6, instagram: 5, youtube: 4, tiktok: 3 },
      'content': { instagram: 10, youtube: 10, tiktok: 8, twitter: 6, linkedin: 4 },
      'engineering': { linkedin: 8, twitter: 8, youtube: 6, instagram: 3, tiktok: 2 },
      'management': { linkedin: 10, twitter: 6, youtube: 5, instagram: 3, tiktok: 2 }
    };

    for (const [keyword, scores] of Object.entries(domainKeywords)) {
      if (domain.includes(keyword)) {
        Object.entries(scores).forEach(([platform, score]) => {
          platformScores[platform] += score;
        });
      }
    }

    // 4️⃣ GOAL-BASED SCORING (10 points)
    const goalKeywords: Record<string, Record<string, number>> = {
      'thought leadership': { linkedin: 5, twitter: 5, youtube: 3, instagram: 2, tiktok: 1 },
      'brand awareness': { instagram: 5, tiktok: 5, youtube: 4, linkedin: 3, twitter: 3 },
      'network': { linkedin: 5, twitter: 4, instagram: 3, youtube: 2, tiktok: 2 },
      'clients': { linkedin: 5, instagram: 4, twitter: 3, youtube: 3, tiktok: 2 },
      'influence': { instagram: 5, tiktok: 5, youtube: 4, twitter: 4, linkedin: 3 }
    };

    goals.forEach((goal: string) => {
      const goalLower = goal.toLowerCase();
      for (const [keyword, scores] of Object.entries(goalKeywords)) {
        if (goalLower.includes(keyword)) {
          Object.entries(scores).forEach(([platform, score]) => {
            platformScores[platform] += score;
          });
        }
      }
    });

    // 5️⃣ SELECT PLATFORM WITH HIGHEST SCORE (Max Audience Potential)
    let maxScore = 0;
    let selectedPlatform = 'linkedin'; // Default

    Object.entries(platformScores).forEach(([platform, score]) => {
      console.log(`[Platform Selector] ${platform}: ${score} points`);
      if (score > maxScore) {
        maxScore = score;
        selectedPlatform = platform;
      }
    });

    console.log(`[Platform Selector] ✅ Selected: ${selectedPlatform} (${maxScore} points) for max audience reach`);
    
    return selectedPlatform;
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
