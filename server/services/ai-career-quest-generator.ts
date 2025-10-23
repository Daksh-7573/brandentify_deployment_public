import { unifiedAIQuestGenerator } from './unified-ai-quest-generator';

interface GeneratedCareerQuest {
  title: string;
  description: string;
  muskTip: string;
  questType: string;
  variablesUsed: Record<string, any>;
  xpReward: number;
  difficulty: string;
  questDefinitionId: number;
}

/**
 * AI-Powered Career Quest Generator
 * NOW USES REAL AI (Ollama Llama 3.2:3b) instead of templates!
 * 
 * This service has been completely rewritten to use TRUE AI generation
 * instead of template-based variable substitution.
 */
export class AICareerQuestGenerator {
  
  /**
   * Generate a personalized career quest using REAL AI
   * 
   * This now calls the unified AI quest generator which uses
   * FREE local Ollama to generate unique, natural-sounding quests
   * tailored specifically to each user's profile.
   */
  async generatePersonalizedCareerQuest(userId: number): Promise<GeneratedCareerQuest | null> {
    console.log(`[AICareerQuestGenerator] Generating AI-powered career quest for user ${userId}`);
    
    // Use the new unified AI generator with TRUE AI generation
    const quest = await unifiedAIQuestGenerator.generateCareerQuest(userId);
    
    if (!quest) {
      console.log(`[AICareerQuestGenerator] Failed to generate quest for user ${userId}`);
      return null;
    }

    // Map to expected interface (variablesUsed is no longer needed with AI)
    return {
      title: quest.title,
      description: quest.description,
      muskTip: quest.muskTip,
      questType: quest.questType,
      xpReward: quest.xpReward,
      difficulty: quest.difficulty,
      questDefinitionId: quest.questDefinitionId,
      variablesUsed: {} // No longer using templates, so no variables to track
    };
  }
}

export const aiCareerQuestGenerator = new AICareerQuestGenerator();
