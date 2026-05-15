/**
 * Quest Generation Wrapper Service
 * 
 * Enhances quest generation by:
 * 1. Using improved AI prompts
 * 2. Providing robust fallbacks when AI fails
 * 3. Ensuring detailed quest content
 * 4. Handling both career and social quests
 */

import { comprehensiveQuestGeneratorV2 } from './comprehensive-quest-generator-v2';
import { socialQuestGeneratorV2 } from './social-quest-generator-v2';
import { enhancedQuestPromptGenerator } from './enhanced-quest-prompt-generator';

export interface EnhancedQuestResult {
  success: boolean;
  quest: any;
  source: 'ai' | 'fallback';
  questType: string;
  warning?: string;
}

export class QuestGenerationEnhancer {
  /**
   * Generate a career quest with fallback
   */
  static async generateCareerQuestWithFallback(
    userId: number,
    questDefinitionId: number,
    userProfile: any,
    selectedGoals: string[],
    questType: string = 'profile_update'
  ): Promise<EnhancedQuestResult> {
    try {
      console.log(`[QuestEnhancer] Generating career quest: ${questType}`);
      
      // Try AI-powered generation first
      const aiQuest = await comprehensiveQuestGeneratorV2.generatePersonalizedQuest(
        userId,
        questDefinitionId,
        userProfile,
        selectedGoals
      );
      
      if (aiQuest) {
        console.log(`[QuestEnhancer] ✅ AI generation successful for ${questType}`);
        return {
          success: true,
          quest: aiQuest,
          source: 'ai',
          questType
        };
      }
      
      // AI returned null (field already satisfied) - generate fallback
      console.log(`[QuestEnhancer] AI returned null, using fallback for ${questType}`);
      return {
        success: true,
        quest: enhancedQuestPromptGenerator.generateDetailedFallbackQuest(questType, userProfile),
        source: 'fallback',
        questType,
        warning: 'Profile field already satisfied, using general fallback'
      };
      
    } catch (aiError) {
      console.error(`[QuestEnhancer] AI generation failed:`, aiError);
      
      // Always provide fallback
      const fallbackQuest = enhancedQuestPromptGenerator.generateDetailedFallbackQuest(questType, userProfile);
      return {
        success: true,
        quest: fallbackQuest,
        source: 'fallback',
        questType,
        warning: `AI generation failed, using detailed fallback: ${(aiError as Error).message}`
      };
    }
  }

  /**
   * Generate a social quest with fallback
   */
  static async generateSocialQuestWithFallback(
    userId: number,
    questDefinitionId: number,
    platform: string
  ): Promise<EnhancedQuestResult> {
    try {
      console.log(`[QuestEnhancer] Generating social quest for ${platform}`);
      
      // Try AI-powered social generation
      const socialQuest = await socialQuestGeneratorV2.generateSocialQuest(
        userId,
        questDefinitionId,
        platform
      );
      
      if (socialQuest) {
        console.log(`[QuestEnhancer] ✅ AI social generation successful for ${platform}`);
        return {
          success: true,
          quest: socialQuest,
          source: 'ai',
          questType: 'social_post'
        };
      }
      
      // Fallback for social
      const fallbackSocial = enhancedQuestPromptGenerator.generateDetailedFallbackQuest('social_post', {
        platform,
        name: 'Professional'
      });
      
      return {
        success: true,
        quest: fallbackSocial,
        source: 'fallback',
        questType: 'social_post',
        warning: 'Social generation returned null, using fallback'
      };
      
    } catch (aiError) {
      console.error(`[QuestEnhancer] Social generation failed:`, aiError);
      
      // Fallback
      const fallbackSocial = enhancedQuestPromptGenerator.generateDetailedFallbackQuest('social_post', {
        platform,
        name: 'Professional'
      });
      
      return {
        success: true,
        quest: fallbackSocial,
        source: 'fallback',
        questType: 'social_post',
        warning: `Social generation failed, using detailed fallback: ${(aiError as Error).message}`
      };
    }
  }

  /**
   * Ensure quest has all required detailed fields
   */
  static ensureQuestDetail(quest: any): any {
    // Ensure all required fields exist with good defaults
    return {
      title: quest.title || 'Complete This Quest',
      description: quest.description || quest.personalizedDescription || 'An important step in your professional journey',
      deliverableFormat: quest.deliverableFormat || 'Completion of the specified action',
      estimatedTimeMinutes: quest.estimatedTime || quest.estimatedTimeMinutes || 20,
      muskTip: quest.personalizedMuskTip || quest.muskTip || 'Every action moves you forward. This one counts.',
      guidanceSnippet: quest.guidanceSnippet || '1. Start now\n2. Focus on quality\n3. Share your result\n4. Celebrate your progress',
      expectedOutcome: quest.expectedOutcome || 'Advance your professional growth',
      ...quest
    };
  }
}

export const questGenerationEnhancer = QuestGenerationEnhancer;
