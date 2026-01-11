/**
 * Learning Progression Engine (LPE)
 * 
 * An intelligent layer that transforms the feed from a "mirror" into a "ladder"
 * by detecting where users are, knowing where they should grow, and gently
 * nudging content to bridge the gap.
 * 
 * Core Components:
 * 1. Skill Inference - Detect skills from engagement patterns
 * 2. Depth Sequencing - Tag and sequence content by skill level
 * 3. Stretch Injection - Surface high-relevance, low-familiarity content
 * 4. Concept Diversity Guard - Prevent topic clustering
 * 5. Micro Learning Feedback - Occasional progress hints
 */

import { localAIService } from "./local-ai-service";

const AI_BASE_URL = process.env.AI_BASE_URL || 'http://65.20.73.122:11434';
const AI_MODEL = process.env.AI_MODEL || 'llama3.2:1b';

export type SkillDepthLevel = 'intro' | 'applied' | 'advanced' | 'strategic';

export interface LearningContext {
  userId: number;
  inferredSkills: string[];
  emergingSkills: string[];
  missingSkills: string[];
  dominantThemes: string[];
  currentDepthLevel: SkillDepthLevel;
}

export interface PulseWithLPE {
  id: number;
  title: string;
  content: string | null;
  skillDepth: SkillDepthLevel | null;
  industry?: string;
  domain?: string;
  hashtags?: string[];
  relevanceScore: number;
  stretchScore?: number;
  lpeReason?: string;
}

export interface LPEFeedAdjustment {
  adjustedItems: PulseWithLPE[];
  stretchItemsInjected: number;
  depthDistribution: Record<SkillDepthLevel, number>;
  learningHint?: string;
}

export class LearningProgressionEngine {
  private conceptCache: Map<number, string[]> = new Map();
  private sessionHintShown: Map<number, boolean> = new Map();

  /**
   * Get or initialize learning context for a user
   */
  async getLearningContext(storage: any, userId: number): Promise<LearningContext> {
    try {
      const pattern = await storage.getUserLearningPattern(userId);
      
      if (pattern) {
        return {
          userId,
          inferredSkills: Array.isArray(pattern.inferredSkills) ? pattern.inferredSkills : [],
          emergingSkills: Array.isArray(pattern.emergingSkills) ? pattern.emergingSkills : [],
          missingSkills: Array.isArray(pattern.missingSkills) ? pattern.missingSkills : [],
          dominantThemes: Array.isArray(pattern.dominantThemes) ? pattern.dominantThemes : [],
          currentDepthLevel: (pattern.currentDepthLevel as SkillDepthLevel) || 'intro',
        };
      }

      return this.createDefaultContext(userId);
    } catch (error) {
      console.error('[LPE] Error getting learning context:', error);
      return this.createDefaultContext(userId);
    }
  }

  private createDefaultContext(userId: number): LearningContext {
    return {
      userId,
      inferredSkills: [],
      emergingSkills: [],
      missingSkills: [],
      dominantThemes: [],
      currentDepthLevel: 'intro',
    };
  }

  /**
   * Tag a pulse with skill depth level using AI
   */
  async tagPulseSkillDepth(
    storage: any,
    pulseId: number,
    title: string,
    content: string | null
  ): Promise<SkillDepthLevel> {
    try {
      const prompt = `Analyze this professional content and classify its skill depth level.

Title: "${title}"
Content: "${content?.substring(0, 500) || 'No content'}"

Skill Depth Levels:
- intro: Foundational/beginner explanations. Example: "What is branding?"
- applied: Practical frameworks and how-tos. Example: "Brand positioning framework"  
- advanced: Deep expertise and complex concepts. Example: "Brand architecture at scale"
- strategic: Leadership/executive level thinking. Example: "Brand strategy during mergers"

Respond with ONLY one word: intro, applied, advanced, or strategic`;

      const response = await this.callOllama(prompt);
      const depth = this.parseDepthResponse(response);
      
      await storage.updatePulseSkillDepth(pulseId, depth);
      
      return depth;
    } catch (error) {
      console.error('[LPE] Error tagging pulse depth:', error);
      return 'intro';
    }
  }

  /**
   * Calculate StretchScore for a pulse relative to user's learning context
   * StretchScore = relevance - familiarity
   * High stretch = relevant but unfamiliar = growth opportunity
   */
  calculateStretchScore(
    pulse: PulseWithLPE,
    context: LearningContext
  ): number {
    const pulseTopics = this.extractTopics(pulse);
    
    let familiarityScore = 0;
    let totalTopics = pulseTopics.length || 1;

    for (const topic of pulseTopics) {
      const topicLower = topic.toLowerCase();
      
      if (context.inferredSkills.some(s => s.toLowerCase().includes(topicLower))) {
        familiarityScore += 1.0;
      } else if (context.emergingSkills.some(s => s.toLowerCase().includes(topicLower))) {
        familiarityScore += 0.5;
      } else if (context.dominantThemes.some(t => t.toLowerCase().includes(topicLower))) {
        familiarityScore += 0.7;
      }
    }

    const normalizedFamiliarity = familiarityScore / totalTopics;
    const stretchScore = pulse.relevanceScore - normalizedFamiliarity;

    return Math.max(0, Math.min(1, stretchScore));
  }

  /**
   * Apply Learning Progression Engine adjustments to feed
   * 
   * Feed Composition Rules:
   * - 60% current comfort depth
   * - 25% next depth level (growth)
   * - 15% adjacent skill areas (stretch)
   */
  async applyLPEAdjustments(
    pulses: PulseWithLPE[],
    context: LearningContext,
    storage: any
  ): Promise<LPEFeedAdjustment> {
    const adjustedItems: PulseWithLPE[] = [];
    const depthDistribution: Record<SkillDepthLevel, number> = {
      intro: 0,
      applied: 0,
      advanced: 0,
      strategic: 0,
    };

    const targetDepth = context.currentDepthLevel;
    const nextDepth = this.getNextDepth(targetDepth);
    
    const comfortPulses: PulseWithLPE[] = [];
    const growthPulses: PulseWithLPE[] = [];
    const stretchPulses: PulseWithLPE[] = [];

    for (const pulse of pulses) {
      let depth = pulse.skillDepth;
      
      if (!depth) {
        depth = await this.tagPulseSkillDepth(storage, pulse.id, pulse.title, pulse.content);
        pulse.skillDepth = depth;
      }

      const stretchScore = this.calculateStretchScore(pulse, context);
      pulse.stretchScore = stretchScore;

      if (depth === targetDepth) {
        comfortPulses.push(pulse);
      } else if (depth === nextDepth) {
        growthPulses.push(pulse);
      }

      if (stretchScore > 0.5) {
        stretchPulses.push(pulse);
      }
    }

    const totalItems = pulses.length;
    const comfortCount = Math.floor(totalItems * 0.60);
    const growthCount = Math.floor(totalItems * 0.25);
    const stretchCount = Math.floor(totalItems * 0.15);

    comfortPulses.slice(0, comfortCount).forEach(p => {
      p.lpeReason = 'Matches your current expertise level';
      adjustedItems.push(p);
      depthDistribution[p.skillDepth!]++;
    });

    growthPulses.slice(0, growthCount).forEach(p => {
      p.lpeReason = 'Advancing your skills to the next level';
      adjustedItems.push(p);
      depthDistribution[p.skillDepth!]++;
    });

    stretchPulses.slice(0, stretchCount).forEach(p => {
      p.lpeReason = 'Expanding your professional perspective';
      adjustedItems.push(p);
      if (p.skillDepth) depthDistribution[p.skillDepth]++;
    });

    const usedIds = new Set(adjustedItems.map(p => p.id));
    for (const pulse of pulses) {
      if (!usedIds.has(pulse.id)) {
        adjustedItems.push(pulse);
        if (pulse.skillDepth) depthDistribution[pulse.skillDepth]++;
      }
    }

    const diversifiedItems = this.applyConceptDiversityGuard(adjustedItems, context.userId);

    const learningHint = this.generateLearningHint(context, depthDistribution);

    return {
      adjustedItems: diversifiedItems,
      stretchItemsInjected: stretchCount,
      depthDistribution,
      learningHint,
    };
  }

  /**
   * Concept Diversity Guard - Prevent 3+ consecutive similar topics
   */
  private applyConceptDiversityGuard(
    pulses: PulseWithLPE[],
    userId: number
  ): PulseWithLPE[] {
    const result: PulseWithLPE[] = [];
    const recentConcepts: string[] = this.conceptCache.get(userId) || [];
    const deferred: PulseWithLPE[] = [];

    for (const pulse of pulses) {
      const pulseConcepts = this.extractTopics(pulse);
      const primaryConcept = pulseConcepts[0]?.toLowerCase() || '';

      const consecutiveSimilar = recentConcepts.slice(-2).filter(
        c => this.conceptsSimilar(c, primaryConcept)
      ).length;

      if (consecutiveSimilar >= 2) {
        deferred.push(pulse);
      } else {
        result.push(pulse);
        recentConcepts.push(primaryConcept);
        
        if (recentConcepts.length > 10) {
          recentConcepts.shift();
        }
      }
    }

    result.push(...deferred);
    this.conceptCache.set(userId, recentConcepts.slice(-10));

    return result;
  }

  private conceptsSimilar(a: string, b: string): boolean {
    if (!a || !b) return false;
    return a === b || a.includes(b) || b.includes(a);
  }

  /**
   * Update user's learning context based on engagement
   */
  async updateLearningContextFromEngagement(
    storage: any,
    userId: number,
    pulseId: number,
    engagementType: 'insightful' | 'misinformed' | 'comment'
  ): Promise<void> {
    try {
      const pulse = await storage.getPulseById(pulseId);
      if (!pulse) return;

      const context = await this.getLearningContext(storage, userId);
      const topics = this.extractTopicsFromPulse(pulse);
      
      if (engagementType === 'insightful') {
        for (const topic of topics) {
          if (!context.inferredSkills.includes(topic)) {
            if (context.emergingSkills.includes(topic)) {
              context.emergingSkills = context.emergingSkills.filter(s => s !== topic);
              context.inferredSkills.push(topic);
            } else {
              context.emergingSkills.push(topic);
            }
          }
        }
        
        if (!context.dominantThemes.includes(pulse.industry || '')) {
          context.dominantThemes = [...context.dominantThemes.slice(-4), pulse.industry || ''].filter(Boolean);
        }
      } else if (engagementType === 'comment') {
        for (const topic of topics) {
          if (!context.inferredSkills.includes(topic)) {
            context.inferredSkills.push(topic);
          }
        }
        
        if (pulse.skillDepth && this.depthOrder(pulse.skillDepth) > this.depthOrder(context.currentDepthLevel)) {
          context.currentDepthLevel = pulse.skillDepth;
        }
      }

      await storage.updateUserLearningContext(userId, {
        inferredSkills: context.inferredSkills.slice(-20),
        emergingSkills: context.emergingSkills.slice(-10),
        missingSkills: context.missingSkills,
        dominantThemes: context.dominantThemes.slice(-5),
        currentDepthLevel: context.currentDepthLevel,
      });
    } catch (error) {
      console.error('[LPE] Error updating learning context:', error);
    }
  }

  /**
   * Generate occasional micro learning hints
   */
  private generateLearningHint(
    context: LearningContext,
    distribution: Record<SkillDepthLevel, number>
  ): string | undefined {
    if (this.sessionHintShown.get(context.userId)) {
      return undefined;
    }

    const nextDepth = this.getNextDepth(context.currentDepthLevel);
    const growthContent = distribution[nextDepth] || 0;
    
    if (growthContent > 0) {
      this.sessionHintShown.set(context.userId, true);
      
      const hints: Record<SkillDepthLevel, string> = {
        intro: "You're building strong fundamentals",
        applied: "Moving from concepts to practical application",
        advanced: "Developing deep domain expertise",
        strategic: "Advancing toward leadership-level thinking",
      };
      
      return hints[nextDepth];
    }

    return undefined;
  }

  private getNextDepth(current: SkillDepthLevel): SkillDepthLevel {
    const order: SkillDepthLevel[] = ['intro', 'applied', 'advanced', 'strategic'];
    const idx = order.indexOf(current);
    return order[Math.min(idx + 1, order.length - 1)];
  }

  private depthOrder(depth: SkillDepthLevel): number {
    const order: SkillDepthLevel[] = ['intro', 'applied', 'advanced', 'strategic'];
    return order.indexOf(depth);
  }

  private extractTopics(pulse: PulseWithLPE): string[] {
    const topics: string[] = [];
    
    if (pulse.industry) topics.push(pulse.industry);
    if (pulse.domain) topics.push(pulse.domain);
    if (pulse.hashtags) topics.push(...pulse.hashtags.slice(0, 3));
    
    return topics.filter(Boolean);
  }

  private extractTopicsFromPulse(pulse: any): string[] {
    const topics: string[] = [];
    
    if (pulse.industry) topics.push(pulse.industry);
    if (pulse.domain) topics.push(pulse.domain);
    if (pulse.hashtags && Array.isArray(pulse.hashtags)) {
      topics.push(...pulse.hashtags.slice(0, 3));
    }
    
    return topics.filter(Boolean);
  }

  private parseDepthResponse(response: string): SkillDepthLevel {
    const cleaned = response.toLowerCase().trim();
    
    if (cleaned.includes('strategic')) return 'strategic';
    if (cleaned.includes('advanced')) return 'advanced';
    if (cleaned.includes('applied')) return 'applied';
    return 'intro';
  }

  private async callOllama(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${AI_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: AI_MODEL,
          prompt,
          stream: false,
          options: {
            temperature: 0.2,
            num_predict: 50,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response || '';
    } catch (error) {
      console.error('[LPE] Ollama call failed:', error);
      return 'intro';
    }
  }

  clearSessionState(userId: number): void {
    this.sessionHintShown.delete(userId);
    this.conceptCache.delete(userId);
  }
}

export const learningProgressionEngine = new LearningProgressionEngine();
