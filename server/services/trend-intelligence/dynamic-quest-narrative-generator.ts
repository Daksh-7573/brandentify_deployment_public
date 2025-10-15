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
3. Includes 2-3 CONCRETE EXAMPLES of what to share (e.g., "share a recent project challenge you solved" OR "explain a common industry misconception" OR "describe a tool or framework you use daily")
4. Explains WHY this matters RIGHT NOW based on the trend
5. Provides a Musk-style tip with actionable steps

IMPORTANT: The description must include specific content ideas, not vague phrases like "share an observation" or "post insights". Give clear examples of WHAT to create.

Format your response EXACTLY as:
TITLE: [Catchy title]
DESCRIPTION: [Specific action with trend reference, exact specs, AND 2-3 concrete content examples]
TIP: [Musk-style guidance with actionable steps]
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
- Include CONCRETE EXAMPLES of what to share (not vague terms like "insights" or "observations")
- Explain the strategic "why" behind actions
- Be direct and actionable

Examples of good directions:
✅ "Write 200-word post about AI regulation changes: share a recent client challenge you faced OR explain how the EU AI Act impacts your workflow OR describe a compliance tool you're implementing"
✅ "Create 60-second reel on remote work shifts: show your actual home office setup OR walk through your productivity routine OR demonstrate a tool that saves you 2+ hours daily"
✅ "Post 150-word update about your latest project: highlight one unexpected challenge you overcame OR share a metric that improved 25%+ OR explain a framework you developed"

Examples of bad directions (too vague):
❌ "Create content about your industry"
❌ "Share insights on your platform"
❌ "Post an observation, lesson, or insight" (too generic - needs specific examples)

Be specific. Be trend-aware. Give clear content examples. Be Musk.`;
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
   * Provides specific content examples instead of vague instructions
   */
  private generateGenericNarrative(context: QuestContext): DynamicQuestNarrative {
    const industry = context.industry || 'your industry';
    const domain = context.domain || 'your field';
    
    // Get content-specific examples based on quest type
    const contentExamples = this.getContentExamples(context.questType, industry, domain);
    
    return {
      title: contentExamples.title,
      description: contentExamples.description,
      muskTip: contentExamples.tip,
      trendContext: `Build your ${industry} thought leadership`,
      usedTrends: []
    };
  }

  /**
   * Generate specific content examples based on quest type and industry
   */
  private getContentExamples(questType: string, industry: string, domain: string): {
    title: string;
    description: string;
    tip: string;
  } {
    // Content creation quest examples
    if (questType === 'content_creation' || questType === 'pulse_creation') {
      return {
        title: 'Share Your Professional Story',
        description: `Write a 150-300 word post about ${industry}. Choose one: (1) Share a recent project challenge and how you solved it, (2) Explain a common ${domain} misconception and the reality, (3) Describe a tool, framework, or method you use daily that others might benefit from, (4) Highlight a lesson learned from a failure or setback in your career.`,
        tip: `Don't just share generic insights—tell a specific story. Example: Instead of "Communication is important", write "Last month, a project almost failed because I assumed everyone understood the brief. Here's what I changed..." Real stories resonate 10x more than abstract advice.`
      };
    }

    // Portfolio/project quest examples
    if (questType === 'portfolio_building' || questType === 'portfolio') {
      return {
        title: 'Showcase Your Best Work',
        description: `Add a ${industry} project to your portfolio. Include: (1) The specific problem or goal, (2) Your approach and key decisions, (3) Measurable results (e.g., "reduced costs by 30%" or "completed 2 weeks early"), (4) Visuals showing before/after or process.`,
        tip: `Recruiters spend 10 seconds on portfolios. Lead with the result, not the process. Put your biggest number or achievement in the first line, then explain how you got there.`
      };
    }

    // Networking quest examples
    if (questType === 'networking') {
      return {
        title: 'Build Strategic Connections',
        description: `Connect with 3 ${industry} professionals. Focus on: (1) People working in roles you aspire to, (2) Professionals at companies you're interested in, (3) Peers in ${domain} who share similar challenges. Personalize each request—mention a specific post or project of theirs.`,
        tip: `Generic connection requests get ignored 80% of the time. Reference something specific: "I saw your post about ${domain} automation—we're tackling similar challenges at my company." Personalization = response rate.`
      };
    }

    // Visibility/profile quest examples  
    if (questType === 'visibility' || questType === 'profile_update') {
      return {
        title: 'Optimize Your Professional Presence',
        description: `Update your profile to highlight ${industry} expertise. Add: (1) A headline that states your specific value (not just job title), (2) 3-5 quantified achievements with numbers, (3) Skills that match ${domain} job postings, (4) A summary that explains your unique approach or methodology.`,
        tip: `Profiles with specific metrics get 5x more recruiter views. Replace "Experienced in project management" with "Led 15+ projects, delivering $2M in cost savings across ${industry} clients."`
      };
    }

    // Default fallback
    return {
      title: 'Advance Your Career',
      description: `Complete a ${industry} professional development task. Choose what fits your goals: (1) Update your profile with quantified achievements, (2) Share a specific lesson from recent work, (3) Connect with professionals in your target role, (4) Document a project with measurable results.`,
      tip: `Career growth comes from specific, visible actions. Pick one task, do it well, and make it public. Consistency beats perfection.`
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
