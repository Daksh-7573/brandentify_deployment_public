/**
 * Trend Spike Scheduler
 * 
 * Orchestrates the entire instant quest generation system:
 * - Runs hourly to detect trending topics
 * - Maintains user interest index
 * - Matches trends to users efficiently
 * - Cleans up expired quests
 * 
 * Scalable for 100K+ users with optimized batch processing
 */

import cron from 'node-cron';
import { trendAggregationEngine } from './trend-aggregation-engine';
import { userInterestIndexer } from './user-interest-indexer';
import { instantQuestMatcher } from './instant-quest-matcher';

export class TrendSpikeScheduler {
  
  private isSchedulerActive: boolean = false;
  private hourlyJob: cron.ScheduledTask | null = null;
  private dailyIndexJob: cron.ScheduledTask | null = null;

  /**
   * Start the scheduler
   */
  start(): void {
    if (this.isSchedulerActive) {
      console.log('[TrendSpikeScheduler] Scheduler already running');
      return;
    }

    console.log('[TrendSpikeScheduler] 🚀 Starting Instant Quest System...');

    // Build user index on startup
    this.buildUserIndex().catch(err => {
      console.error('[TrendSpikeScheduler] Failed to build user index on startup:', err);
    });

    // Schedule hourly trend detection and matching (every hour at :00)
    this.hourlyJob = cron.schedule('0 * * * *', async () => {
      console.log('[TrendSpikeScheduler] ⏰ Hourly trend detection triggered');
      await this.runTrendDetectionCycle();
    });

    // Schedule daily index rebuild (every day at 2:00 AM UTC)
    this.dailyIndexJob = cron.schedule('0 2 * * *', async () => {
      console.log('[TrendSpikeScheduler] ⏰ Daily index rebuild triggered');
      await this.buildUserIndex();
    });

    // Schedule hourly cleanup (every hour at :30)
    cron.schedule('30 * * * *', async () => {
      console.log('[TrendSpikeScheduler] ⏰ Hourly cleanup triggered');
      await this.cleanupExpiredQuests();
    });

    this.isSchedulerActive = true;
    console.log('[TrendSpikeScheduler] ✅ Scheduler started successfully');
    console.log('[TrendSpikeScheduler] - Hourly trend detection: Every hour at :00');
    console.log('[TrendSpikeScheduler] - Daily index rebuild: 2:00 AM UTC');
    console.log('[TrendSpikeScheduler] - Hourly cleanup: Every hour at :30');
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (!this.isSchedulerActive) {
      console.log('[TrendSpikeScheduler] Scheduler not running');
      return;
    }

    this.hourlyJob?.stop();
    this.dailyIndexJob?.stop();
    this.isSchedulerActive = false;
    
    console.log('[TrendSpikeScheduler] ⏹️ Scheduler stopped');
  }

  /**
   * Run a complete trend detection cycle
   */
  private async runTrendDetectionCycle(): Promise<void> {
    try {
      console.log('[TrendSpikeScheduler] 🔍 Starting trend detection cycle...');
      const startTime = Date.now();

      // Step 1: Check if index needs rebuild
      if (userInterestIndexer.needsRebuild()) {
        console.log('[TrendSpikeScheduler] User index is stale, rebuilding...');
        await this.buildUserIndex();
      }

      // Step 2: Aggregate trends from RSS feeds
      const trends = await trendAggregationEngine.aggregateTrends();
      
      if (trends.length === 0) {
        console.log('[TrendSpikeScheduler] No trending topics detected this hour');
        return;
      }

      console.log(`[TrendSpikeScheduler] Detected ${trends.length} trending topics`);

      // Step 3: Match trends to users and create instant quests
      const results = await instantQuestMatcher.matchTrendsToUsers(trends);

      // Step 4: Log results
      const totalQuests = results.reduce((sum, r) => sum + r.questsCreated, 0);
      const duration = Date.now() - startTime;

      console.log('[TrendSpikeScheduler] ✅ Cycle complete:');
      console.log(`  - ${trends.length} trends detected`);
      console.log(`  - ${totalQuests} instant quests created`);
      console.log(`  - Duration: ${duration}ms`);

      // Step 5: Log detailed breakdown
      results.forEach(r => {
        if (r.questsCreated > 0) {
          console.log(`  - "${r.trendTopic}" (${r.tier}): ${r.questsCreated} quests for ${r.matchedUsers} users`);
        }
      });

    } catch (error) {
      console.error('[TrendSpikeScheduler] ❌ Error in trend detection cycle:', error);
    }
  }

  /**
   * Build user interest index
   */
  private async buildUserIndex(): Promise<void> {
    try {
      console.log('[TrendSpikeScheduler] 🔨 Building user interest index...');
      await userInterestIndexer.buildIndex();
      console.log('[TrendSpikeScheduler] ✅ User index built successfully');
    } catch (error) {
      console.error('[TrendSpikeScheduler] ❌ Failed to build user index:', error);
    }
  }

  /**
   * Clean up expired instant quests
   */
  private async cleanupExpiredQuests(): Promise<void> {
    try {
      const deleted = await instantQuestMatcher.cleanupExpiredQuests();
      if (deleted > 0) {
        console.log(`[TrendSpikeScheduler] 🧹 Cleaned up ${deleted} expired instant quests`);
      }
    } catch (error) {
      console.error('[TrendSpikeScheduler] ❌ Error cleaning up expired quests:', error);
    }
  }

  /**
   * Manual trigger for testing
   */
  async triggerDetectionCycle(): Promise<void> {
    console.log('[TrendSpikeScheduler] 🔧 Manual trigger - Running detection cycle');
    await this.runTrendDetectionCycle();
  }

  /**
   * Manual trigger to rebuild index
   */
  async triggerIndexRebuild(): Promise<void> {
    console.log('[TrendSpikeScheduler] 🔧 Manual trigger - Rebuilding user index');
    await this.buildUserIndex();
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    const indexStats = userInterestIndexer.getStats();
    
    return {
      isActive: this.isSchedulerActive,
      schedule: {
        hourlyTrends: 'Every hour at :00',
        dailyIndex: '2:00 AM UTC daily',
        hourlyCleanup: 'Every hour at :30'
      },
      indexStats: {
        industries: indexStats.industryCount,
        domains: indexStats.domainCount,
        hashtags: indexStats.hashtagCount,
        lastRebuild: indexStats.lastRebuild,
        needsRebuild: userInterestIndexer.needsRebuild()
      }
    };
  }
}

// Export singleton instance
export const trendSpikeScheduler = new TrendSpikeScheduler();
