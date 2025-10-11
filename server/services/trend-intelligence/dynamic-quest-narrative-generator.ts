/**
 * Dynamic Quest Narrative Generator
 * 
 * Uses Musk AI to generate trend-specific, actionable quest directions
 * Example output: "Share 80-second reel about corporate travel management based on current airline loyalty disruption trends"
 */

import { localAI } from '../local-ai-service';
import { TrendBundle } from './trend-intelligence-service';

export interface QuestContext {
  questType: string; // e.g., 'visibility', 'content_creation', 'networking'
  industry: string;
  domain?: string;
  userProfile?: {
    title?: string;
    name?: string;
    brandGoals?: string[];
  };
  deliverableFormat?: string; // e.g., '60-second video', 'LinkedIn post'
  platform?: string; // e.g., 'LinkedIn', 'TikTok', 'Brandentifier'
}

export interface DynamicQuestNarrative {
  title: string;
  description: string; // Trend-specific, actionable direction
  muskTip: string; // Musk-style guidance with trend context
  trendContext: string; // Why this matters now
  usedTrends: string[]; // Topics used from trend bundle
}

export class DynamicQuestNarrativeGenerator {
  
  /**
   * Generate trend-aware quest narrative using Musk AI
   */
  async generateNarrative(
    context: QuestContext,
    trendBundle?: TrendBundle | null
  ): Promise<DynamicQuestNarrative> {
    
    // Fallback to generic narrative if no trends available
    if (!trendBundle || trendBundle.trends.length === 0) {
      return this.generateGenericNarrative(context);
    }

    const prompt = this.buildMuskPrompt(context, trendBundle);

    try {
      const response = await localAI.generateResponse(
        prompt,
        {
          systemPrompt: this.getMuskSystemPrompt(),
          temperature: 0.7,
          maxTokens: 500
        }
      );

      return this.parseAIResponse(response, trendBundle);

    } catch (error) {
      console.error('[DynamicQuestNarrative] AI generation error:', error);
      return this.generateGenericNarrative(context);
    }
  }

  /**
   * Build Musk AI prompt with trend context
   */
  private buildMuskPrompt(context: QuestContext, trendBundle: TrendBundle): string {
    const trends = trendBundle.trends.slice(0, 3);
    const trendSummary = trends.map(t => `- ${t.topic}: ${t.content.substring(0, 100)}`).join('\n');

    return `
Generate a specific, actionable quest for a ${context.industry} professional${context.userProfile?.title ? ` working as ${context.userProfile.title}` : ''}.

CURRENT TRENDS in ${context.industry}${context.domain ? `/${context.domain}` : ''}:
${trendSummary}

QUEST TYPE: ${context.questType}
DELIVERABLE: ${context.deliverableFormat || 'Professional content'}
PLATFORM: ${context.platform || 'Any'}

Create a quest that:
1. References a SPECIFIC trend from above (mention the actual topic)
2. Gives EXACT specs (e.g., "80-second reel", "3 data points", "150-word post")
3. Explains WHY this matters RIGHT NOW based on the trend
4. Provides a Musk-style tip with actionable steps

Format your response EXACTLY as:
TITLE: [Catchy title]
DESCRIPTION: [Specific action with trend reference and exact specs]
TIP: [Musk-style guidance]
CONTEXT: [Why this trend matters now]
`.trim();
  }

  /**
   * Musk system prompt for trend-aware guidance
   */
  private getMuskSystemPrompt(): string {
    return `You are Musk, an AI career advisor who gives sharp, specific career guidance. 

When giving quest directions:
- Always reference SPECIFIC trends or news
- Give EXACT specifications (numbers, formats, time limits)
- Explain the strategic "why" behind actions
- Be direct and actionable

Examples of good directions:
✅ "Create 60-second reel about AI regulation changes (reference the EU AI Act trends) with 3 key takeaways"
✅ "Write 150-word LinkedIn post on remote work policy shifts citing the return-to-office data from this week"

Examples of bad directions:
❌ "Create content about your industry"
❌ "Share insights on your platform"

Be specific. Be trend-aware. Be Musk.`;
  }

  /**
   * Parse AI response into structured narrative
   */
  private parseAIResponse(response: string, trendBundle: TrendBundle): DynamicQuestNarrative {
    const lines = response.split('\n');
    
    let title = '';
    let description = '';
    let tip = '';
    let context = '';

    for (const line of lines) {
      if (line.startsWith('TITLE:')) {
        title = line.replace('TITLE:', '').trim();
      } else if (line.startsWith('DESCRIPTION:')) {
        description = line.replace('DESCRIPTION:', '').trim();
      } else if (line.startsWith('TIP:')) {
        tip = line.replace('TIP:', '').trim();
      } else if (line.startsWith('CONTEXT:')) {
        context = line.replace('CONTEXT:', '').trim();
      }
    }

    // Fallback if parsing failed
    if (!title || !description) {
      console.warn('[DynamicQuestNarrative] Failed to parse AI response, using fallback');
      return {
        title: 'Create Trend-Aware Content',
        description: response.substring(0, 200),
        muskTip: 'Leverage current market trends to maximize impact',
        trendContext: `Based on ${trendBundle.trends.length} recent trends in ${trendBundle.industry}`,
        usedTrends: trendBundle.trends.slice(0, 2).map(t => t.topic)
      };
    }

    return {
      title,
      description,
      muskTip: tip || 'Stay ahead by acting on trends before they peak',
      trendContext: context || `Trending in ${trendBundle.industry} right now`,
      usedTrends: trendBundle.trends.slice(0, 2).map(t => t.topic)
    };
  }

  /**
   * Fallback generic narrative when trends unavailable
   */
  private generateGenericNarrative(context: QuestContext): DynamicQuestNarrative {
    const industry = context.industry || 'your industry';
    
    return {
      title: `${context.questType.replace(/_/g, ' ')} Quest`,
      description: `Complete a ${context.deliverableFormat || 'professional task'} relevant to ${industry}${context.domain ? ` focusing on ${context.domain}` : ''}.`,
      muskTip: `Focus on quality over quantity. Make it specific to ${industry} to stand out.`,
      trendContext: 'Industry-relevant content creation',
      usedTrends: []
    };
  }

  /**
   * Generate multiple narrative options and pick the best
   */
  async generateWithOptions(
    context: QuestContext,
    trendBundle?: TrendBundle | null,
    options: number = 2
  ): Promise<DynamicQuestNarrative> {
    if (options === 1 || !trendBundle) {
      return this.generateNarrative(context, trendBundle);
    }

    const narratives: DynamicQuestNarrative[] = [];

    for (let i = 0; i < options; i++) {
      const narrative = await this.generateNarrative(context, trendBundle);
      narratives.push(narrative);
    }

    // Pick the one with most specific description (longer, more detailed)
    narratives.sort((a, b) => b.description.length - a.description.length);
    
    return narratives[0];
  }
}

// Export singleton instance
export const dynamicQuestNarrativeGenerator = new DynamicQuestNarrativeGenerator();
