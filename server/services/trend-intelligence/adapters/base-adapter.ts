/**
 * Base Trend Adapter
 * 
 * Abstract base class for all trend adapters
 * Provides:
 * - Rate limiting
 * - Health check integration
 * - Error handling
 * - Standardized response format
 */

import { trendIntelligenceService, NormalizedTrend } from '../trend-intelligence-service';

export interface RawTrendData {
  title?: string;
  topic?: string;
  headline?: string;
  description?: string;
  content?: string;
  summary?: string;
  url?: string;
  link?: string;
  views?: number;
  shares?: number;
  likes?: number;
  engagementScore?: number;
  sentiment?: 'positive' | 'negative' | 'neutral' | number;
  relevanceScore?: number;
  region?: string;
  keywords?: string[];
  [key: string]: any;
}

export interface AdapterConfig {
  name: string;
  source: 'news_api' | 'twitter' | 'linkedin' | 'rss_feed' | 'google_trends' | 'reddit' | 'internal';
  enabled: boolean;
  apiKey?: string;
  dailyLimit?: number;
  timeout?: number;
}

export abstract class BaseTrendAdapter {
  protected config: AdapterConfig;
  protected version: string = '1.0.0';

  constructor(config: AdapterConfig) {
    this.config = config;
  }

  /**
   * Fetch trends for a specific industry/domain
   * Must be implemented by child classes
   */
  abstract fetchTrends(industry: string, domain?: string): Promise<RawTrendData[]>;

  /**
   * Execute trend fetch with error handling and health tracking
   */
  async execute(industry: string, domain?: string): Promise<NormalizedTrend[]> {
    if (!this.config.enabled) {
      console.log(`[${this.config.name}] Adapter disabled, skipping`);
      return [];
    }

    const startTime = Date.now();

    try {
      // Check rate limits
      const health = await trendIntelligenceService.getSourceHealth(this.config.source);
      if (health && this.config.dailyLimit) {
        if (health.requestsToday >= this.config.dailyLimit) {
          console.warn(`[${this.config.name}] Daily limit reached (${health.requestsToday}/${this.config.dailyLimit})`);
          return [];
        }
        
        if (!health.isActive) {
          console.warn(`[${this.config.name}] Source is inactive (too many failures)`);
          return [];
        }
      }

      console.log(`[${this.config.name}] Fetching trends for ${industry}/${domain || 'general'}...`);

      // Fetch raw trends
      const rawTrends = await Promise.race([
        this.fetchTrends(industry, domain),
        this.timeout(this.config.timeout || 10000)
      ]);

      // Normalize trends
      const normalized = rawTrends.map(raw => 
        trendIntelligenceService.normalizeTrendData(
          raw,
          this.config.source,
          industry,
          domain
        )
      );

      const responseTime = Date.now() - startTime;

      // Update health metrics
      await trendIntelligenceService.updateSourceHealth(
        this.config.source,
        true,
        responseTime
      );

      console.log(`[${this.config.name}] ✅ Fetched ${normalized.length} trends in ${responseTime}ms`);

      return normalized;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      console.error(`[${this.config.name}] ❌ Error fetching trends:`, errorMessage);

      // Update health metrics with failure
      await trendIntelligenceService.updateSourceHealth(
        this.config.source,
        false,
        responseTime,
        errorMessage
      );

      return [];
    }
  }

  /**
   * Store fetched trends in database
   */
  async storeNormalizedTrends(trends: NormalizedTrend[], ttlHours: number = 1) {
    const stored: any[] = [];
    for (const trend of trends) {
      try {
        const storedTrend = await trendIntelligenceService.storeTrend(trend, ttlHours);
        stored.push(storedTrend);
      } catch (error) {
        console.error(`[${this.config.name}] Error storing trend:`, error);
      }
    }
    return stored;
  }

  /**
   * Timeout helper
   */
  private timeout(ms: number): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Request timeout after ${ms}ms`)), ms)
    );
  }
}
