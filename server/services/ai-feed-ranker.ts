/**
 * AI Feed Ranking Service
 * 
 * Uses Ollama (llama3.2:1b) to intelligently rank pulses for each user
 * based on their profile, interests, and career goals
 * 
 * Now enhanced with Learning Progression Engine (LPE) for:
 * - Skill depth sequencing (intro → applied → advanced → strategic)
 * - StretchScore injection (high-relevance, low-familiarity content)
 * - Concept diversity guard (prevents topic clustering)
 */

import { UserContext, UserContextBuilder } from './user-context-builder.js';
import { Pulse } from '../../shared/schema.js';
import { learningProgressionEngine, LPEFeedAdjustment, PulseWithLPE } from './learning-progression-engine.js';
import { localAIService } from './local-ai-service';

export interface RankedPulse {
  pulseId: number;
  relevanceScore: number;
  reason?: string;
  skillDepth?: string;
  stretchScore?: number;
  lpeReason?: string;
}

export interface FeedRankingResult {
  rankedPulseIds: number[];
  rankings: RankedPulse[];
  timestamp: Date;
  usedAI: boolean;
  lpeApplied?: boolean;
  depthDistribution?: Record<string, number>;
  learningHint?: string;
}

export class AIFeedRanker {
  private contextBuilder: UserContextBuilder;

  constructor(contextBuilder: UserContextBuilder) {
    this.contextBuilder = contextBuilder;
  }

  /**
   * Rank pulses for a specific user using AI + Learning Progression Engine
   */
  async rankFeedForUser(userId: number, pulses: Pulse[], storage?: any): Promise<FeedRankingResult> {
    const startTime = Date.now();
    console.log(`[AIFeedRanker] Ranking ${pulses.length} pulses for user ${userId}`);

    try {
      // 1. Build user context
      const context = await this.contextBuilder.buildContext(userId);
      if (!context) {
        console.warn(`[AIFeedRanker] No context available for user ${userId}, using fallback`);
        return this.fallbackRanking(pulses);
      }

      // 2. Limit pulses to top 100 for AI processing (performance optimization)
      const pulsesToRank = pulses.slice(0, 100);

      // 3. Build AI prompt
      const prompt = this.buildRankingPrompt(context, pulsesToRank);

      // 4. Call Ollama AI
      const rankings = await this.callOllamaForRanking(prompt, pulsesToRank);

      // 5. Apply diversity filter
      const diversifiedRankings = this.applyDiversityFilter(rankings, pulsesToRank);

      // 6. Apply Learning Progression Engine (LPE) adjustments
      let lpeResult: LPEFeedAdjustment | null = null;
      if (storage) {
        try {
          const learningContext = await learningProgressionEngine.getLearningContext(storage, userId);
          
          const pulsesWithLPE: PulseWithLPE[] = diversifiedRankings.map(r => {
            const pulse = pulsesToRank.find(p => p.id === r.pulseId);
            return {
              id: r.pulseId,
              title: pulse?.title || '',
              content: pulse?.content || null,
              skillDepth: (pulse as any)?.skillDepth || null,
              industry: pulse?.industry,
              domain: pulse?.domain,
              hashtags: pulse?.hashtags as string[] || [],
              relevanceScore: r.relevanceScore / 100,
            };
          });

          lpeResult = await learningProgressionEngine.applyLPEAdjustments(
            pulsesWithLPE,
            learningContext,
            storage
          );

          console.log(`[AIFeedRanker] LPE applied - Depth distribution:`, lpeResult.depthDistribution);
        } catch (lpeError) {
          console.error('[AIFeedRanker] LPE error (non-fatal):', lpeError);
        }
      }

      const duration = Date.now() - startTime;
      console.log(`[AIFeedRanker] Ranking completed in ${duration}ms using AI${lpeResult ? ' + LPE' : ''}`);

      const finalRankings = lpeResult 
        ? lpeResult.adjustedItems.map((item, idx) => ({
            pulseId: item.id,
            relevanceScore: 100 - (idx * 2),
            reason: diversifiedRankings.find(r => r.pulseId === item.id)?.reason,
            skillDepth: item.skillDepth || undefined,
            stretchScore: item.stretchScore,
            lpeReason: item.lpeReason,
          }))
        : diversifiedRankings;

      return {
        rankedPulseIds: finalRankings.map(r => r.pulseId),
        rankings: finalRankings,
        timestamp: new Date(),
        usedAI: true,
        lpeApplied: !!lpeResult,
        depthDistribution: lpeResult?.depthDistribution,
        learningHint: lpeResult?.learningHint,
      };
    } catch (error) {
      console.error('[AIFeedRanker] Error ranking feed with AI:', error);
      return this.fallbackRanking(pulses);
    }
  }

  /**
   * Build AI prompt for ranking pulses
   */
  private buildRankingPrompt(context: UserContext, pulses: Pulse[]): string {
    const userSummary = this.contextBuilder.formatForAI(context);

    const pulseSummaries = pulses.map((p, idx) => {
      let summary = `${idx + 1}. [ID:${p.id}] "${p.title || 'Untitled'}"`;
      summary += ` | Type: ${p.type}`;
      if (p.industry) summary += ` | Industry: ${p.industry}`;
      if (p.domain) summary += ` | Domain: ${p.domain}`;
      if (p.category) summary += ` | Category: ${p.category}`;
      
      // Add content snippet
      if (p.content) {
        const contentPreview = p.content.substring(0, 100).replace(/\n/g, ' ');
        summary += ` | Content: "${contentPreview}${p.content.length > 100 ? '...' : ''}"`;
      }
      
      // Add hashtags
      if (p.hashtags && p.hashtags.length > 0) {
        summary += ` | Tags: ${p.hashtags.slice(0, 3).join(', ')}`;
      }
      
      // Add engagement stats
      const engagement = (p.insightfulCount || 0) + (p.misinformedCount || 0) + (p.comments || 0);
      summary += ` | Engagement: ${engagement} (${p.insightfulCount || 0}👍 ${p.misinformedCount || 0}👎 ${p.comments || 0}💬)`;
      
      return summary;
    }).join('\n');

    return `You are an AI career advisor helping personalize a professional feed for a user.

${userSummary}

Available Pulses:
${pulseSummaries}

CRITICAL: Rank pulses by CAREER IMPORTANCE, not engagement preference.

Ranking Priority (in order):
1. CAREER GOAL ALIGNMENT & SKILL GAPS: Pulses that directly advance their career goals, teach missing skills, or fill knowledge gaps (HIGHEST PRIORITY)
2. STRATEGIC OPPORTUNITIES: Industry trends, senior-level guidance, challenging content, leadership insights, emerging technologies in their domain
3. CONTEXTUAL FIT: Industry/domain match, geographic relevance, target audience alignment
4. TIMELINESS: Recent posts and current events (freshness matters)
5. ENGAGEMENT (TIE-BREAKER ONLY): Only use engagement stats to break ties between equally valuable content

IMPORTANT INSTRUCTIONS:
- Do NOT favor "comfortable" or "familiar" content just because the user engaged with it before
- Do NOT prioritize entertainment over education
- DO prioritize content that challenges the user to grow professionally
- DO surface content that might be outside their comfort zone if it helps career advancement
- DO rank difficult/advanced content higher if it matches their career goals

Example: If user is a junior developer who clicks on memes, STILL rank senior engineering advice higher than memes.

Respond with ONLY a comma-separated list of pulse IDs in order of CAREER VALUE (most valuable first).
Example: 12,45,3,67,89

Your ranking:`;
  }

  /**
   * Call Ollama API to get AI ranking
   */
  private async callOllamaForRanking(prompt: string, pulses: Pulse[]): Promise<RankedPulse[]> {
    try {
      const aiResponse = await localAIService.generateCompletion(
        prompt,
        0.3,
        200
      );

      console.log('[AIFeedRanker] AI Response:', aiResponse);

      // Parse AI response (comma-separated pulse IDs)
      const rankedIds = this.parseAIRankingResponse(aiResponse, pulses);

      // Convert to RankedPulse format with scores
      return rankedIds.map((pulseId, idx) => ({
        pulseId,
        relevanceScore: 100 - (idx * 2), // Score decreases by 2 for each position
        reason: idx < 3 ? `Top ${idx + 1} recommendation for your profile` : undefined,
      }));
    } catch (error) {
      console.error('[AIFeedRanker] Error calling Ollama:', error);
      throw error;
    }
  }

  /**
   * Parse AI ranking response to extract pulse IDs
   */
  private parseAIRankingResponse(response: string, pulses: Pulse[]): number[] {
    // Extract comma-separated numbers
    const matches = response.match(/\d+/g);
    if (!matches || matches.length === 0) {
      console.warn('[AIFeedRanker] No pulse IDs found in AI response, using fallback');
      throw new Error('Invalid AI response format');
    }

    const rankedIds = matches.map(Number);
    const validPulseIds = new Set(pulses.map(p => p.id));

    // Filter to only valid pulse IDs and remove duplicates
    const validRankedIds = [...new Set(rankedIds)].filter(id => validPulseIds.has(id));

    if (validRankedIds.length === 0) {
      console.warn('[AIFeedRanker] No valid pulse IDs in AI response, using fallback');
      throw new Error('No valid pulse IDs in AI response');
    }

    // Add any missing pulses at the end
    const missingIds = pulses
      .map(p => p.id)
      .filter(id => !validRankedIds.includes(id));

    return [...validRankedIds, ...missingIds];
  }

  /**
   * Apply diversity filter to prevent over-clustering
   * Enforces: NO 3 consecutive pulses from same author
   */
  private applyDiversityFilter(rankings: RankedPulse[], pulses: Pulse[]): RankedPulse[] {
    const pulseMap = new Map(pulses.map(p => [p.id, p]));
    const result: RankedPulse[] = [];
    const deferred: RankedPulse[] = []; // Store pulses that break consecutive rule
    let lastAuthorId: number | null = null;
    let consecutiveCount = 0;

    for (const ranking of rankings) {
      const pulse = pulseMap.get(ranking.pulseId);
      if (!pulse) continue;

      // Check if this would be the 3rd consecutive from same author
      if (pulse.userId === lastAuthorId) {
        consecutiveCount++;
        if (consecutiveCount >= 3) {
          // Defer this pulse to break the consecutive streak
          deferred.push(ranking);
          continue;
        }
      } else {
        // Different author, reset counter
        consecutiveCount = 1;
        lastAuthorId = pulse.userId;
      }

      result.push(ranking);
    }

    // Append deferred pulses at the end (maintaining their AI ranking order)
    result.push(...deferred);

    return result;
  }

  /**
   * Fallback ranking when AI is unavailable
   */
  private fallbackRanking(pulses: Pulse[]): FeedRankingResult {
    console.log('[AIFeedRanker] Using fallback time-weighted ranking');

    // Use the existing time-weighted algorithm
    const rankings = pulses.map((pulse, idx) => ({
      pulseId: pulse.id,
      relevanceScore: pulse.reachScore || 0,
      reason: undefined,
    }));

    return {
      rankedPulseIds: pulses.map(p => p.id),
      rankings,
      timestamp: new Date(),
      usedAI: false,
    };
  }
}
