/**
 * Trend Refresh Scheduler
 * 
 * Hourly cron job that:
 * - Refreshes trends for all active industries
 * - Cleans up expired trends
 * - Manages adapter health
 * - Ensures trend cache is warm for quest generation
 */

import cron from 'node-cron';
import { trendIntelligenceService } from './trend-intelligence-service';
import { RSSFeedAdapter } from './adapters/rss-feed-adapter';
import { InternalAdapter } from './adapters/internal-adapter';
import { BaseTrendAdapter } from './adapters/base-adapter';

export class TrendRefreshScheduler {
  private adapters: BaseTrendAdapter[] = [];
  private isRunning: boolean = false;
  private cronJob: any = null;
  private cleanupJob: any = null; // Track cleanup cron job

  // Industries to track
  private readonly TRACKED_INDUSTRIES = [
    'Technology',
    'Healthcare',
    'Finance',
    'Marketing',
    'Hospitality',
    'Education',
    'Real Estate',
    'Manufacturing',
    'Retail',
    'Consulting'
  ];

  /**
   * Initialize adapters
   */
  private initializeAdapters() {
    // RSS Feed Adapter
    this.adapters.push(new RSSFeedAdapter({
      name: 'RSS Feed Scraper',
      enabled: true,
      dailyLimit: 200,
      timeout: 15000
    }));

    // Internal Brandentifier Adapter
    this.adapters.push(new InternalAdapter({
      name: 'Brandentifier Analytics',
      enabled: true,
      dailyLimit: 1000, // No external API limits
      timeout: 10000
    }));

    console.log(`[TrendRefreshScheduler] Initialized ${this.adapters.length} adapters`);
  }

  /**
   * Start the hourly scheduler
   */
  startScheduler() {
    if (this.isRunning) {
      console.log('[TrendRefreshScheduler] Already running');
      return;
    }

    this.initializeAdapters();

    // Run immediately on startup
    console.log('[TrendRefreshScheduler] Running initial trend refresh...');
    this.refreshAllTrends().catch(error => {
      console.error('[TrendRefreshScheduler] Initial refresh error:', error);
    });

    // Schedule hourly refresh (at :00 of every hour)
    this.cronJob = cron.schedule('0 * * * *', async () => {
      console.log('[TrendRefreshScheduler] ⏰ Hourly trend refresh triggered');
      await this.refreshAllTrends();
    });

    // Schedule cleanup every 6 hours (track the job)
    this.cleanupJob = cron.schedule('0 */6 * * *', async () => {
      console.log('[TrendRefreshScheduler] 🧹 Running trend cleanup');
      await trendIntelligenceService.cleanupExpiredTrends();
    });

    this.isRunning = true;
    console.log('[TrendRefreshScheduler] ✅ Scheduler started (hourly refresh + 6h cleanup)');
  }

  /**
   * Stop the scheduler
   */
  stopScheduler() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }
    
    // CRITICAL: Stop cleanup job too
    if (this.cleanupJob) {
      this.cleanupJob.stop();
      this.cleanupJob = null;
    }
    
    this.isRunning = false;
    console.log('[TrendRefreshScheduler] Scheduler stopped (both jobs)');
  }

  /**
   * Refresh trends for all industries
   */
  async refreshAllTrends() {
    console.log('[TrendRefreshScheduler] 🔄 Starting trend refresh for all industries');
    
    let totalTrendsIngested = 0;

    for (const industry of this.TRACKED_INDUSTRIES) {
      try {
        const industryTrends = await this.fetchIndustryTrends(industry);
        totalTrendsIngested += industryTrends;
      } catch (error) {
        console.error(`[TrendRefreshScheduler] Error refreshing ${industry}:`, error);
      }
    }

    console.log(`[TrendRefreshScheduler] ✅ Refresh complete: ${totalTrendsIngested} trends ingested`);
  }

  /**
   * Fetch and store trends for a specific industry
   */
  private async fetchIndustryTrends(industry: string): Promise<number> {
    let trendsIngested = 0;

    for (const adapter of this.adapters) {
      try {
        // Fetch normalized trends
        const trends = await adapter.execute(industry);
        
        if (trends.length === 0) {
          continue;
        }

        // Store trends with 1-hour TTL
        const stored = await adapter.storeNormalizedTrends(trends, 1);
        trendsIngested += stored.length;

      } catch (error) {
        console.error(`[TrendRefreshScheduler] Error with adapter for ${industry}:`, error);
      }
    }

    if (trendsIngested > 0) {
      console.log(`[TrendRefreshScheduler] ${industry}: ${trendsIngested} trends ingested`);
    }

    return trendsIngested;
  }

  /**
   * Manual trigger for testing
   */
  async manualRefresh(industry?: string) {
    if (industry) {
      console.log(`[TrendRefreshScheduler] Manual refresh for ${industry}`);
      return await this.fetchIndustryTrends(industry);
    } else {
      console.log('[TrendRefreshScheduler] Manual refresh for all industries');
      return await this.refreshAllTrends();
    }
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeAdapters: this.adapters.length,
      trackedIndustries: this.TRACKED_INDUSTRIES.length
    };
  }
}

// Export singleton instance
export const trendRefreshScheduler = new TrendRefreshScheduler();
