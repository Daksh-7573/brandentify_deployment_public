import { unifiedAIQuestGenerator } from './unified-ai-quest-generator';

export interface PersonalBrandData {
  uniqueExpertise: string;
  quantifiedAchievements: string[];
  signatureMethodology: string;
  careerStory: string;
  personalMission: string;
  targetAudience: string;
  competitiveAdvantage: string;
  coreValues: string[];
  contentThemes: string[];
  industryInsights: string[];
}

export interface GeneratedQuest {
  title: string;
  description: string;
  muskTip: string;
  platform: string;
  targetAction: string;
  brandImpact: string;
  callToAction: string;
  xpReward: number;
  estimatedTimeMinutes: number;
  templateId: number;
  variablesUsed: Record<string, any>;
}

/**
 * Social Quest Template Engine
 * NOW USES REAL AI (Ollama Llama 3.2:3b) instead of templates!
 * 
 * This service has been completely rewritten to use TRUE AI generation
 * instead of template-based variable substitution.
 */
export class SocialQuestTemplateEngine {

  /**
   * Generate a personalized social quest using REAL AI
   * 
   * This now calls the unified AI quest generator which uses
   * FREE local Ollama to generate unique, natural-sounding social media quests
   * tailored specifically to each user's profile and target audience.
   */
  async generatePersonalizedQuest(
    userId: number, 
    platform: string
  ): Promise<GeneratedQuest | null> {
    try {
      console.log(`[SocialQuestTemplateEngine] Generating AI-powered social quest for user ${userId} on ${platform}`);
      
      // Use the new unified AI generator with TRUE AI generation
      const quest = await unifiedAIQuestGenerator.generateSocialQuest(userId);
      
      if (!quest) {
        console.log(`[SocialQuestTemplateEngine] Failed to generate quest for user ${userId}`);
        return null;
      }

      // Map to expected interface
      return {
        title: quest.title,
        description: quest.description,
        muskTip: quest.muskTip,
        platform: quest.platform || platform,
        targetAction: 'complete_social_quest',
        brandImpact: 'Builds authority and expertise', // Generic impact - AI generates specific value in description
        callToAction: 'Create and share your content',
        xpReward: quest.xpReward,
        estimatedTimeMinutes: 30,
        templateId: 1, // Legacy field, no longer used with AI
        variablesUsed: {} // No longer using templates, so no variables to track
      };

    } catch (error) {
      console.error(`[SocialQuestTemplateEngine] Error generating AI quest:`, error);
      return null;
    }
  }

  /**
   * Legacy method stub - kept for backward compatibility
   * Real brand data extraction is now handled by AI within the quest generator
   */
  async extractPersonalBrandVariables(userId: number): Promise<PersonalBrandData | null> {
    console.log(`[SocialQuestTemplateEngine] extractPersonalBrandVariables is deprecated - AI handles this now`);
    return {
      uniqueExpertise: '',
      quantifiedAchievements: [],
      signatureMethodology: '',
      careerStory: '',
      personalMission: '',
      targetAudience: '',
      competitiveAdvantage: '',
      coreValues: [],
      contentThemes: [],
      industryInsights: []
    };
  }
}

export const socialQuestTemplateEngine = new SocialQuestTemplateEngine();
