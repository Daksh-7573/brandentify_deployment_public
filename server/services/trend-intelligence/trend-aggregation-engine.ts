/**
 * Trend Aggregation Engine
 * 
 * Scalable trend spike detection system for 100K+ users:
 * - Processes RSS feeds to identify trending topics
 * - Calculates spike scores based on feed frequency, category spread, and recency
 * - Pre-computes relevant industries, domains, and hashtags
 * - Implements tiered detection (niche, industry, global trends)
 */

import { db } from '../../db';
import { industryTrends } from '@shared/schema';
import { gte } from 'drizzle-orm';

export interface TrendAggregate {
  topic: string;
  keywords: string[];
  feedSources: string[];
  categories: string[];
  mentionCount: number;
  firstSeen: Date;
  lastSeen: Date;
  spikeScore: number;
  relevantIndustries: string[];
  relevantDomains: string[];
  relevantHashtags: string[];
  tier: 'niche' | 'industry' | 'global';
}

export interface TrendDetectionConfig {
  niche: {
    minFeeds: number;
    minRelevance: number;
    categoryMatch: boolean;
    threshold: number;
  };
  industry: {
    minFeeds: number;
    minRelevance: number;
    categoryMatch: boolean;
    threshold: number;
  };
  global: {
    minFeeds: number;
    minRelevance: number;
    crossCategory: number;
    threshold: number;
  };
}

export class TrendAggregationEngine {
  
  /**
   * Configuration for 100K user scale
   */
  private readonly config: TrendDetectionConfig = {
    niche: {
      minFeeds: 6,
      minRelevance: 80,
      categoryMatch: true,
      threshold: 180
    },
    industry: {
      minFeeds: 12,
      minRelevance: 60,
      categoryMatch: false,
      threshold: 250
    },
    global: {
      minFeeds: 20,
      minRelevance: 40,
      crossCategory: 3,
      threshold: 350
    }
  };

  /**
   * Industry to category mapping
   */
  private readonly categoryToIndustries: Record<string, string[]> = {
    'Technology': ['Technology', 'FinTech', 'HealthTech', 'EdTech'],
    'Marketing': ['Marketing', 'Digital Marketing', 'Content Marketing'],
    'Finance': ['Finance', 'Banking', 'Investment', 'Accounting'],
    'Healthcare': ['Healthcare', 'Medical', 'Pharmaceutical'],
    'Hospitality': ['Hospitality', 'Hotel Management', 'Event Management'],
    'Design': ['Design', 'UI/UX', 'Graphic Design'],
    'Consulting': ['Consulting', 'Management Consulting', 'IT Consulting'],
    'Education': ['Education', 'Teaching', 'Academic Research']
  };

  /**
   * Aggregate trends from the database (already stored by RSS adapters)
   */
  async aggregateTrends(): Promise<TrendAggregate[]> {
    console.log('[TrendAggregation] 🔍 Starting trend aggregation...');
    
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    // Get all trends from the last hour
    const recentTrends = await db
      .select()
      .from(industryTrends)
      .where(gte(industryTrends.fetchedAt, oneHourAgo));

    console.log(`[TrendAggregation] Found ${recentTrends.length} trends from last hour`);

    // Group trends by topic (normalize variations)
    const trendMap = new Map<string, TrendAggregate>();

    for (const trend of recentTrends) {
      const normalizedTopic = this.normalizeTopic(trend.topic);
      
      if (!trendMap.has(normalizedTopic)) {
        trendMap.set(normalizedTopic, {
          topic: trend.topic, // Use first occurrence as display name
          keywords: this.extractKeywords(trend.topic),
          feedSources: [trend.source],
          categories: [trend.industry],
          mentionCount: 1,
          firstSeen: trend.fetchedAt || new Date(),
          lastSeen: trend.fetchedAt || new Date(),
          spikeScore: 0,
          relevantIndustries: this.mapToIndustries(trend.industry),
          relevantDomains: trend.domain ? [trend.domain] : [],
          relevantHashtags: [],
          tier: 'niche'
        });
      } else {
        const existing = trendMap.get(normalizedTopic)!;
        existing.feedSources.push(trend.source);
        existing.categories.push(trend.industry);
        existing.mentionCount++;
        existing.lastSeen = trend.fetchedAt || existing.lastSeen;
        
        // Add new industries/domains if not already present
        const newIndustries = this.mapToIndustries(trend.industry);
        existing.relevantIndustries = [...new Set([...existing.relevantIndustries, ...newIndustries])];
        
        if (trend.domain && !existing.relevantDomains.includes(trend.domain)) {
          existing.relevantDomains.push(trend.domain);
        }
      }
    }

    // Calculate spike scores and generate hashtags
    const aggregates = Array.from(trendMap.values());
    for (const trend of aggregates) {
      trend.spikeScore = this.calculateSpikeScore(trend);
      trend.tier = this.determineTier(trend);
      trend.relevantHashtags = this.generateHashtags(trend);
    }

    // Filter by thresholds
    const filteredTrends = aggregates.filter(t => {
      if (t.tier === 'niche') return t.spikeScore >= this.config.niche.threshold;
      if (t.tier === 'industry') return t.spikeScore >= this.config.industry.threshold;
      if (t.tier === 'global') return t.spikeScore >= this.config.global.threshold;
      return false;
    });

    console.log(`[TrendAggregation] ✅ Detected ${filteredTrends.length} trending topics:`);
    filteredTrends.forEach(t => {
      console.log(`  - ${t.topic} (${t.tier}) - Score: ${t.spikeScore}, Feeds: ${t.mentionCount}`);
    });

    return filteredTrends;
  }

  /**
   * Calculate spike score based on multiple factors
   */
  private calculateSpikeScore(trend: TrendAggregate): number {
    const feedScore = trend.mentionCount * 10;
    const categoryScore = new Set(trend.categories).size * 20;
    const recencyScore = this.getRecencyScore(trend.lastSeen);
    
    return feedScore + categoryScore + recencyScore;
  }

  /**
   * Calculate recency score (0-100) based on how recent the trend is
   */
  private getRecencyScore(lastSeen: Date): number {
    const minutesAgo = (Date.now() - lastSeen.getTime()) / (1000 * 60);
    
    if (minutesAgo < 30) return 100; // Last 30 minutes
    if (minutesAgo < 45) return 80;  // 30-45 minutes
    if (minutesAgo < 60) return 50;  // 45-60 minutes
    return 30; // Older than 1 hour
  }

  /**
   * Determine trend tier based on configuration
   */
  private determineTier(trend: TrendAggregate): 'niche' | 'industry' | 'global' {
    const uniqueCategories = new Set(trend.categories).size;
    
    // Global: Many feeds across multiple categories
    if (trend.mentionCount >= this.config.global.minFeeds && 
        uniqueCategories >= this.config.global.crossCategory) {
      return 'global';
    }
    
    // Industry: Good number of feeds
    if (trend.mentionCount >= this.config.industry.minFeeds) {
      return 'industry';
    }
    
    // Niche: Fewer feeds but focused
    return 'niche';
  }

  /**
   * Normalize topic for grouping (remove case, punctuation differences)
   */
  private normalizeTopic(topic: string): string {
    return topic.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .trim();
  }

  /**
   * Extract keywords from topic
   */
  private extractKeywords(topic: string): string[] {
    return topic
      .split(/\s+/)
      .filter(word => word.length > 3)
      .map(word => word.toLowerCase());
  }

  /**
   * Map category to relevant industries
   */
  private mapToIndustries(category: string): string[] {
    return this.categoryToIndustries[category] || [category];
  }

  /**
   * Generate hashtags from trend keywords
   */
  private generateHashtags(trend: TrendAggregate): string[] {
    const hashtags = new Set<string>();
    
    // Add topic-based hashtags
    const topicWords = trend.topic.split(/\s+/).filter(w => w.length > 3);
    topicWords.forEach(word => {
      hashtags.add(`#${word.charAt(0).toUpperCase() + word.slice(1)}`);
    });
    
    // Add industry hashtags
    trend.relevantIndustries.forEach(industry => {
      hashtags.add(`#${industry.replace(/\s+/g, '')}`);
    });
    
    // Add generic trending hashtags
    hashtags.add('#Trending');
    hashtags.add('#IndustryInsights');
    
    return Array.from(hashtags).slice(0, 8); // Max 8 hashtags
  }

  /**
   * Get configuration (for debugging)
   */
  getConfig(): TrendDetectionConfig {
    return this.config;
  }
}

// Export singleton instance
export const trendAggregationEngine = new TrendAggregationEngine();
