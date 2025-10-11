/**
 * Trend Intelligence Service
 * 
 * Core service for managing industry trend data:
 * - Normalizes trend data from multiple sources
 * - Scores and ranks trends by industry/domain
 * - Manages caching with TTL
 * - Provides query APIs for trend retrieval
 */

import { db } from '../../db';
import { industryTrends, trendSourceHealth, IndustryTrend, InsertIndustryTrend } from '@shared/schema';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';

// Normalized trend data model
export interface NormalizedTrend {
  topic: string;
  content: string;
  industry: string;
  domain?: string;
  velocityScore: number; // 0-100
  sentimentScore?: number; // 0-100
  relevanceScore: number; // 0-100
  region?: string;
  source: 'news_api' | 'twitter' | 'linkedin' | 'rss_feed' | 'google_trends' | 'reddit' | 'internal';
  sourceUrl?: string;
  sourceMetadata?: any;
  adapterVersion?: string;
  processingMetadata?: any;
}

// Trend query options
export interface TrendQueryOptions {
  industry?: string;
  domain?: string;
  region?: string;
  minVelocityScore?: number;
  minRelevanceScore?: number;
  limit?: number;
  includeExpired?: boolean;
}

// Trend bundle for quest generation
export interface TrendBundle {
  industry: string;
  domain?: string;
  trends: IndustryTrend[];
  fetchedAt: Date;
  expiresAt: Date;
  isFresh: boolean; // < 1 hour old
  isFallback: boolean; // 1-24 hours old
}

export class TrendIntelligenceService {
  
  /**
   * Store normalized trend in database
   */
  async storeTrend(trend: NormalizedTrend, ttlHours: number = 1): Promise<IndustryTrend> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + ttlHours);

    const insertData: InsertIndustryTrend = {
      topic: trend.topic,
      content: trend.content,
      industry: trend.industry,
      domain: trend.domain,
      velocityScore: trend.velocityScore,
      sentimentScore: trend.sentimentScore,
      relevanceScore: trend.relevanceScore,
      region: trend.region || 'global',
      source: trend.source,
      sourceUrl: trend.sourceUrl,
      sourceMetadata: trend.sourceMetadata,
      expiresAt,
      adapterVersion: trend.adapterVersion,
      processingMetadata: trend.processingMetadata
    };

    const [stored] = await db.insert(industryTrends).values(insertData).returning();
    console.log(`[TrendIntelligence] ✅ Stored trend: ${trend.topic} (${trend.industry}/${trend.domain || 'general'})`);
    
    return stored;
  }

  /**
   * Get trends by industry and domain with caching
   */
  async getTrends(options: TrendQueryOptions = {}): Promise<IndustryTrend[]> {
    const {
      industry,
      domain,
      region,
      minVelocityScore = 0,
      minRelevanceScore = 0,
      limit = 10,
      includeExpired = false
    } = options;

    const conditions = [];
    
    if (industry) {
      conditions.push(eq(industryTrends.industry, industry));
    }
    
    if (domain) {
      conditions.push(eq(industryTrends.domain, domain));
    }
    
    if (region) {
      conditions.push(eq(industryTrends.region, region));
    }

    if (minVelocityScore > 0) {
      conditions.push(gte(industryTrends.velocityScore, minVelocityScore));
    }

    if (minRelevanceScore > 0) {
      conditions.push(gte(industryTrends.relevanceScore, minRelevanceScore));
    }

    if (!includeExpired) {
      conditions.push(gte(industryTrends.expiresAt, new Date()));
    }

    const trends = await db
      .select()
      .from(industryTrends)
      .where(and(...conditions))
      .orderBy(desc(industryTrends.fetchedAt), desc(industryTrends.velocityScore), desc(industryTrends.relevanceScore))
      .limit(limit);

    return trends;
  }

  /**
   * Get trend bundle for quest generation (with fallback logic)
   */
  async getTrendBundle(industry: string, domain?: string): Promise<TrendBundle | null> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Try to get fresh trends (< 1 hour old, NOT expired)
    let trends = await this.getTrends({
      industry,
      domain,
      limit: 5,
      minRelevanceScore: 40,
      includeExpired: false
    });

    let isFresh = false;
    let isFallback = false;

    if (trends.length > 0) {
      const latestTrend = trends[0];
      if (latestTrend.fetchedAt && latestTrend.fetchedAt > oneHourAgo) {
        isFresh = true;
        console.log(`[TrendIntelligence] ✅ Fresh trends found for ${industry}/${domain || 'general'} (${trends.length} trends)`);
        
        return {
          industry,
          domain,
          trends,
          fetchedAt: latestTrend.fetchedAt || now,
          expiresAt: latestTrend.expiresAt,
          isFresh,
          isFallback
        };
      }
    }

    // FALLBACK: Try to get trends from last 24 hours (including expired)
    console.log(`[TrendIntelligence] No fresh trends, trying 24h fallback for ${industry}/${domain || 'general'}`);
    trends = await this.getTrends({
      industry,
      domain,
      limit: 5,
      minRelevanceScore: 30, // Lower threshold for fallback
      includeExpired: true // CRITICAL: Include expired for fallback
    });

    if (trends.length > 0) {
      // Filter to last 24 hours
      trends = trends.filter(t => t.fetchedAt && t.fetchedAt > oneDayAgo);
      
      if (trends.length > 0) {
        const latestTrend = trends[0];
        isFallback = true;
        console.log(`[TrendIntelligence] ⚠️ Using fallback trends for ${industry}/${domain || 'general'} (${trends.length} trends, age: ${this.getAgeInHours(latestTrend.fetchedAt!)}h)`);
        
        return {
          industry,
          domain,
          trends,
          fetchedAt: latestTrend.fetchedAt || now,
          expiresAt: latestTrend.expiresAt,
          isFresh,
          isFallback
        };
      }
    }

    // If no domain-specific trends, try industry-wide with same fallback logic
    if (domain) {
      console.log(`[TrendIntelligence] No domain-specific trends, trying industry-wide for ${industry}`);
      
      // Try fresh industry trends
      trends = await this.getTrends({
        industry,
        limit: 5,
        minRelevanceScore: 40,
        includeExpired: false
      });

      if (trends.length > 0 && trends[0].fetchedAt && trends[0].fetchedAt > oneHourAgo) {
        isFresh = true;
        return {
          industry,
          trends,
          fetchedAt: trends[0].fetchedAt || now,
          expiresAt: trends[0].expiresAt,
          isFresh,
          isFallback
        };
      }

      // Try fallback industry trends
      trends = await this.getTrends({
        industry,
        limit: 5,
        minRelevanceScore: 30,
        includeExpired: true
      });

      trends = trends.filter(t => t.fetchedAt && t.fetchedAt > oneDayAgo);
      
      if (trends.length > 0) {
        isFallback = true;
        return {
          industry,
          trends,
          fetchedAt: trends[0].fetchedAt || now,
          expiresAt: trends[0].expiresAt,
          isFresh,
          isFallback
        };
      }
    }

    console.log(`[TrendIntelligence] ❌ No trends available for ${industry}/${domain || 'general'}`);
    return null;
  }

  /**
   * Clean up expired trends
   */
  async cleanupExpiredTrends(): Promise<number> {
    const result = await db
      .delete(industryTrends)
      .where(lte(industryTrends.expiresAt, new Date()))
      .returning();

    const count = result.length;
    if (count > 0) {
      console.log(`[TrendIntelligence] 🧹 Cleaned up ${count} expired trends`);
    }
    
    return count;
  }

  /**
   * Get source health status
   */
  async getSourceHealth(source: string) {
    const [health] = await db
      .select()
      .from(trendSourceHealth)
      .where(eq(trendSourceHealth.source, source as any))
      .limit(1);

    return health || null;
  }

  /**
   * Update source health metrics
   */
  async updateSourceHealth(
    source: string,
    success: boolean,
    responseTime?: number,
    error?: string
  ) {
    const existing = await this.getSourceHealth(source);

    if (!existing) {
      // Create new health record
      await db.insert(trendSourceHealth).values({
        source: source as any,
        isActive: true,
        lastSuccessAt: success ? new Date() : null,
        lastFailureAt: success ? null : new Date(),
        consecutiveFailures: success ? 0 : 1,
        requestsToday: 1,
        averageResponseTime: responseTime,
        trendsIngested: success ? 1 : 0,
        lastError: error
      });
      return;
    }

    // Update existing record
    const updates: any = {
      updatedAt: new Date()
    };

    if (success) {
      updates.lastSuccessAt = new Date();
      updates.consecutiveFailures = 0;
      updates.trendsIngested = (existing.trendsIngested || 0) + 1;
      
      if (responseTime && existing.averageResponseTime) {
        updates.averageResponseTime = Math.floor(
          (existing.averageResponseTime + responseTime) / 2
        );
      } else if (responseTime) {
        updates.averageResponseTime = responseTime;
      }
    } else {
      updates.lastFailureAt = new Date();
      updates.consecutiveFailures = (existing.consecutiveFailures || 0) + 1;
      updates.lastError = error;

      // Deactivate source after 5 consecutive failures
      if (updates.consecutiveFailures >= 5) {
        updates.isActive = false;
        console.error(`[TrendIntelligence] ⚠️ Source ${source} deactivated after 5 failures`);
      }
    }

    updates.requestsToday = (existing.requestsToday || 0) + 1;

    await db
      .update(trendSourceHealth)
      .set(updates)
      .where(eq(trendSourceHealth.source, source as any));
  }

  /**
   * Get age of trend in hours
   */
  private getAgeInHours(date: Date): number {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60));
  }

  /**
   * Normalize and score raw trend data from adapters
   */
  normalizeTrendData(
    rawData: any,
    source: 'news_api' | 'twitter' | 'linkedin' | 'rss_feed' | 'google_trends' | 'reddit' | 'internal',
    industry: string,
    domain?: string
  ): NormalizedTrend {
    // Extract core fields based on source
    const topic = rawData.title || rawData.topic || rawData.headline || 'Untitled';
    const content = rawData.description || rawData.content || rawData.summary || topic;

    // Calculate velocity score based on engagement metrics
    let velocityScore = 50; // default
    if (rawData.engagementScore) {
      velocityScore = Math.min(100, rawData.engagementScore);
    } else if (rawData.views || rawData.shares || rawData.likes) {
      const totalEngagement = (rawData.views || 0) + (rawData.shares || 0) * 10 + (rawData.likes || 0) * 5;
      velocityScore = Math.min(100, Math.floor(totalEngagement / 100));
    }

    // Calculate sentiment score (0-100, 50 is neutral)
    let sentimentScore = 50;
    if (rawData.sentiment) {
      if (typeof rawData.sentiment === 'number') {
        sentimentScore = rawData.sentiment;
      } else if (rawData.sentiment === 'positive') {
        sentimentScore = 75;
      } else if (rawData.sentiment === 'negative') {
        sentimentScore = 25;
      }
    }

    // Calculate relevance score
    let relevanceScore = 60; // default medium relevance
    if (rawData.relevanceScore) {
      relevanceScore = rawData.relevanceScore;
    } else if (rawData.keywords) {
      // Basic keyword matching for relevance
      const industryKeywords = industry.toLowerCase().split(/\s+/);
      const contentLower = content.toLowerCase();
      const matches = industryKeywords.filter(kw => contentLower.includes(kw));
      relevanceScore = Math.min(100, 40 + (matches.length * 20));
    }

    return {
      topic,
      content,
      industry,
      domain,
      velocityScore,
      sentimentScore,
      relevanceScore,
      region: rawData.region || 'global',
      source,
      sourceUrl: rawData.url || rawData.link,
      sourceMetadata: {
        originalData: rawData,
        processedAt: new Date().toISOString()
      },
      adapterVersion: '1.0.0'
    };
  }
}

// Export singleton instance
export const trendIntelligenceService = new TrendIntelligenceService();
