/**
 * AI Quest Personalizer Service
 * 
 * Uses FREE local Ollama to transform generic quest templates into personalized,
 * impactful quests tailored to each user's industry, goals, and target audience.
 * 
 * Acts as a Digital Marketing Expert to:
 * - Personalize quest titles and descriptions
 * - Add context-specific Musk tips
 * - Generate targeted hashtags
 * - Recommend optimal posting times
 * - Explain platform selection rationale
 * 
 * Cost: $0.00 (uses local Ollama Llama 3.2:3b)
 */

import { LocalAIService } from './local-ai-service';
import { pool } from '../db';

const localAI = new LocalAIService();

export interface QuestTemplate {
  id: number;
  title: string;
  description: string;
  type: string;
  platform?: string;
  targetCount: number;
  targetAction: string;
  muskTip?: string;
  deliverableFormat?: string;
  quantityValue?: number;
  quantityType?: string;
  platformConstraints?: string;
  guidanceSnippet?: string;
  estimatedTimeMinutes: number;
  xpReward: number;
}

export interface UserContext {
  id: number;
  name: string;
  industry?: string;
  domain?: string;
  title?: string;
  location?: string;
  lookingFor?: string;
  brandGoals?: string[]; // User's selected brand goals
  targetAudience?: string; // Primary target audience demographic
  topSkills?: string[];
  careerStage?: string;
}

export interface PersonalizedQuest {
  // Core quest data (from template)
  templateId: number;
  type: string;
  platform?: string;
  targetCount: number;
  targetAction: string;
  estimatedTimeMinutes: number;
  xpReward: number;
  
  // AI-personalized content
  personalizedTitle: string;
  personalizedDescription: string;
  personalizedMuskTip: string;
  whyThisQuest: string; // Marketing rationale
  specificDeliverable: string; // Exact action to take
  recommendedHashtags: string[];
  hashtagRationale: string;
  optimalPostingTime?: string;
  platformRationale?: string; // Why this platform for this user
  successMetrics?: string; // What success looks like
  
  // Metadata
  aiGenerated: boolean;
  generatedAt: Date;
}

export class AIQuestPersonalizer {
  
  /**
   * Personalize a quest template for a specific user using AI
   */
  async personalizeQuest(
    template: QuestTemplate,
    userContext: UserContext
  ): Promise<PersonalizedQuest> {
    
    console.log(`[AIQuestPersonalizer] Personalizing quest "${template.title}" for ${userContext.name}`);
    
    try {
      // Build context-rich prompt for AI
      const prompt = this.buildPersonalizationPrompt(template, userContext);
      
      // Generate personalized content using FREE local Ollama
      const aiResponse = await localAI.generateNewsContent(prompt);
      
      // Parse AI response
      const personalized = this.parseAIResponse(aiResponse, template, userContext);
      
      console.log(`[AIQuestPersonalizer] ✅ Personalized: "${personalized.personalizedTitle}"`);
      
      return personalized;
      
    } catch (error) {
      console.error('[AIQuestPersonalizer] Error personalizing quest:', error);
      // Fallback to enhanced template version
      return this.createFallbackPersonalization(template, userContext);
    }
  }
  
  /**
   * Build AI prompt with digital marketing expertise
   */
  private buildPersonalizationPrompt(template: QuestTemplate, user: UserContext): string {
    const goalsList = user.brandGoals?.join(', ') || 'professional growth';
    const skillsList = user.topSkills?.slice(0, 3).join(', ') || 'their expertise';
    
    return `You are Musk, an AI digital marketing expert and career strategist on Brandentifier.

Your task: Personalize a quest for ${user.name} using marketing psychology and brand-building expertise.

USER PROFILE:
- Name: ${user.name}
- Industry: ${user.industry || 'General'}
- Specialty: ${user.domain || 'Professional'}
- Current Role: ${user.title || 'Professional'}
- Location: ${user.location || 'Global'}
- Career Goals: ${goalsList}
- Top Skills: ${skillsList}
- Target Audience: ${user.targetAudience || 'Professional peers'}
- Career Stage: ${user.careerStage || 'Growth phase'}

QUEST TEMPLATE:
- Type: ${template.type}
- Platform: ${template.platform || 'General'}
- Action: ${template.targetAction}
- Generic Title: "${template.title}"
- Generic Description: "${template.description}"
- Time: ${template.estimatedTimeMinutes} minutes

YOUR ROLE AS DIGITAL MARKETING EXPERT:
1. Personalize the quest title to address ${user.name} directly and reference their goals
2. Rewrite description to explain WHY this matters for ${user.name}'s brand
3. Create a Musk tip with insider marketing knowledge specific to their industry
4. Generate 3-5 hashtags that maximize reach for ${user.targetAudience || 'their audience'}
5. Suggest optimal posting time based on ${user.targetAudience || 'professional audience'} behavior
6. Explain deliverable with specific, actionable steps
7. Define success metrics

MARKETING EXPERTISE TO APPLY:
- Audience psychology: What resonates with ${user.targetAudience || 'professionals'}?
- Platform algorithms: How to maximize ${template.platform || 'platform'} reach?
- Brand positioning: How does this build ${user.name}'s personal brand?
- Content strategy: Why this content NOW for their career stage?

RESPOND WITH VALID JSON (no markdown, no extra text):
{
  "personalizedTitle": "Direct, action-oriented title addressing ${user.name} (max 80 chars)",
  "personalizedDescription": "Why this quest matters for ${user.name}'s specific goals and brand (2-3 sentences)",
  "personalizedMuskTip": "Insider marketing tip from Musk specific to ${user.industry || 'their industry'} + ${template.platform || 'platform'} (conversational, direct)",
  "whyThisQuest": "Marketing rationale: Why THIS content at THIS stage for ${user.name}? (1 sentence)",
  "specificDeliverable": "Exact action to take with format details (e.g., '3-slide carousel about AI ethics using Canva, post at 2pm EST')",
  "recommendedHashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "hashtagRationale": "Why these hashtags will reach ${user.targetAudience || 'their target audience'} (1 sentence)",
  "optimalPostingTime": "Best time to post for maximum engagement (e.g., '2-4pm EST Tuesday-Thursday')",
  "platformRationale": "Why ${template.platform || 'this platform'} is optimal for ${user.name}'s audience and goals (1 sentence)",
  "successMetrics": "What success looks like (e.g., '200+ views, 10+ thoughtful comments, 3+ connection requests')"
}`;
  }
  
  /**
   * Parse AI response with error handling
   */
  private parseAIResponse(
    aiResponse: string,
    template: QuestTemplate,
    user: UserContext
  ): PersonalizedQuest {
    // Handle markdown code blocks
    let jsonStr = aiResponse.trim();
    if (jsonStr.includes('```json')) {
      jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
    } else if (jsonStr.includes('```')) {
      jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
    }
    
    const parsed = JSON.parse(jsonStr);
    
    return {
      // Template data
      templateId: template.id,
      type: template.type,
      platform: template.platform,
      targetCount: template.targetCount,
      targetAction: template.targetAction,
      estimatedTimeMinutes: template.estimatedTimeMinutes,
      xpReward: template.xpReward,
      
      // AI-personalized content
      personalizedTitle: parsed.personalizedTitle || template.title,
      personalizedDescription: parsed.personalizedDescription || template.description,
      personalizedMuskTip: parsed.personalizedMuskTip || template.muskTip || 'Focus on quality over quantity',
      whyThisQuest: parsed.whyThisQuest || 'Strategic content for your brand',
      specificDeliverable: parsed.specificDeliverable || template.deliverableFormat || 'Complete the action',
      recommendedHashtags: parsed.recommendedHashtags || [],
      hashtagRationale: parsed.hashtagRationale || 'Selected for maximum reach',
      optimalPostingTime: parsed.optimalPostingTime,
      platformRationale: parsed.platformRationale,
      successMetrics: parsed.successMetrics,
      
      // Metadata
      aiGenerated: true,
      generatedAt: new Date()
    };
  }
  
  /**
   * Fallback personalization using template data + basic substitution
   */
  private createFallbackPersonalization(
    template: QuestTemplate,
    user: UserContext
  ): PersonalizedQuest {
    const firstName = user.name.split(' ')[0];
    
    return {
      templateId: template.id,
      type: template.type,
      platform: template.platform,
      targetCount: template.targetCount,
      targetAction: template.targetAction,
      estimatedTimeMinutes: template.estimatedTimeMinutes,
      xpReward: template.xpReward,
      
      personalizedTitle: `${firstName}: ${template.title}`,
      personalizedDescription: template.description,
      personalizedMuskTip: template.muskTip || 'Take action to build your brand',
      whyThisQuest: `Build your presence in ${user.industry || 'your industry'}`,
      specificDeliverable: template.deliverableFormat || template.description,
      recommendedHashtags: [],
      hashtagRationale: 'Use relevant industry hashtags',
      optimalPostingTime: template.platform === 'linkedin' ? '9am-11am or 12pm-2pm' : 'Peak engagement hours',
      platformRationale: template.platform ? `${template.platform} reaches your target audience` : 'Platform selected for your goals',
      successMetrics: 'Quality engagement and brand visibility',
      
      aiGenerated: false,
      generatedAt: new Date()
    };
  }
  
  /**
   * Batch personalize multiple quests for efficiency
   */
  async personalizeQuestBatch(
    templates: QuestTemplate[],
    userContext: UserContext
  ): Promise<PersonalizedQuest[]> {
    console.log(`[AIQuestPersonalizer] Personalizing ${templates.length} quests for ${userContext.name}`);
    
    const personalized: PersonalizedQuest[] = [];
    
    for (const template of templates) {
      try {
        const quest = await this.personalizeQuest(template, userContext);
        personalized.push(quest);
      } catch (error) {
        console.error(`[AIQuestPersonalizer] Error personalizing quest ${template.id}:`, error);
        // Add fallback version
        personalized.push(this.createFallbackPersonalization(template, userContext));
      }
    }
    
    return personalized;
  }
}

export const aiQuestPersonalizer = new AIQuestPersonalizer();
