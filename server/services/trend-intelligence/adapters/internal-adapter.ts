/**
 * Internal Brandentify Trend Adapter
 * 
 * Analyzes Brandentify platform data for trending topics:
 * - Popular hashtags
 * - Trending pulse topics
 * - Nowboard activity patterns
 * - User engagement signals
 */

import { BaseTrendAdapter, RawTrendData, AdapterConfig } from './base-adapter';
import { db } from '../../../db';
import { pulses, pulseHashtags, hashtags, nowboardItems } from '@shared/schema';
import { sql, desc, gte } from 'drizzle-orm';

export class InternalAdapter extends BaseTrendAdapter {
  constructor(config: Omit<AdapterConfig, 'source'>) {
    super({
      ...config,
      source: 'internal'
    });
  }

  async fetchTrends(industry: string, domain?: string): Promise<RawTrendData[]> {
    const trends: RawTrendData[] = [];

    // Get trending hashtags from last 24 hours
    const trendingHashtags = await this.getTrendingHashtags();
    
    // Get popular pulse topics from last 48 hours
    const popularPulses = await this.getPopularPulses(industry);

    // Combine and score trends
    for (const tag of trendingHashtags.slice(0, 3)) {
      trends.push({
        topic: tag.tag,
        title: `${tag.tag} Trending`,
        description: `${tag.tag} is trending in the ${industry} community with ${tag.count} mentions in the last 24 hours`,
        engagementScore: this.calculateEngagementScore(tag.count, 100), // 100 is baseline
        relevanceScore: this.calculateRelevanceScore(tag.tag, industry, domain),
        keywords: [tag.tag.replace('#', '')],
        region: 'platform'
      });
    }

    for (const pulse of popularPulses.slice(0, 2)) {
      const content = pulse.content?.substring(0, 200) || 'Professional insight';
      
      trends.push({
        topic: content.substring(0, 50),
        title: `Popular Topic: ${content.substring(0, 50)}`,
        description: content,
        engagementScore: this.calculateEngagementScore(
          (pulse.reactionCount || 0) + (pulse.commentCount || 0) * 2,
          20
        ),
        relevanceScore: 70, // Internal content is always relevant
        keywords: this.extractKeywords(content),
        region: 'platform'
      });
    }

    return trends;
  }

  private async getTrendingHashtags() {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const trending = await db
      .select({
        tag: hashtags.tag,
        count: sql<number>`count(*)`.as('count')
      })
      .from(pulseHashtags)
      .innerJoin(hashtags, sql`${pulseHashtags.hashtagId} = ${hashtags.id}`)
      .innerJoin(pulses, sql`${pulseHashtags.pulseId} = ${pulses.id}`)
      .where(gte(pulses.createdAt, oneDayAgo))
      .groupBy(hashtags.tag)
      .orderBy(desc(sql`count(*)`))
      .limit(5);

    return trending;
  }

  private async getPopularPulses(industry?: string) {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    // Get pulses with high engagement
    const popular = await db
      .select({
        id: pulses.id,
        content: pulses.content,
        reactionCount: sql<number>`(
          SELECT COUNT(*) FROM pulse_reactions 
          WHERE pulse_id = ${pulses.id}
        )`.as('reaction_count'),
        commentCount: sql<number>`(
          SELECT COUNT(*) FROM pulse_comments 
          WHERE pulse_id = ${pulses.id}
        )`.as('comment_count')
      })
      .from(pulses)
      .where(gte(pulses.createdAt, twoDaysAgo))
      .orderBy(desc(sql`(
        (SELECT COUNT(*) FROM pulse_reactions WHERE pulse_id = ${pulses.id}) + 
        (SELECT COUNT(*) FROM pulse_comments WHERE pulse_id = ${pulses.id}) * 2
      )`))
      .limit(5);

    return popular;
  }

  private calculateEngagementScore(count: number, baseline: number): number {
    // Normalize to 0-100 scale
    const score = Math.min(100, Math.floor((count / baseline) * 50) + 50);
    return score;
  }

  private calculateRelevanceScore(tag: string, industry: string, domain?: string): number {
    let score = 60; // baseline
    
    const tagLower = tag.toLowerCase();
    const industryLower = industry.toLowerCase();
    
    if (tagLower.includes(industryLower)) {
      score += 20;
    }
    
    if (domain) {
      const domainKeywords = domain.toLowerCase().split(/\s+/);
      const matches = domainKeywords.filter(kw => tagLower.includes(kw));
      score += matches.length * 10;
    }

    return Math.min(100, score);
  }

  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase().split(/\W+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'is', 'was']);
    
    return words
      .filter(w => w.length > 4 && !stopWords.has(w))
      .slice(0, 8);
  }
}

