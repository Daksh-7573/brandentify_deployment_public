/**
 * Musk Pulse Scheduler Service
 * 
 * Handles automated scheduling of Musk pulse generation
 * - 3 times daily: 9 AM, 2 PM, 7 PM UTC (cron-based, restart-resistant)
 * - Event-driven generation based on user activity and industry trends
 */

import cron from 'node-cron';
import { muskPulseGenerator } from './musk-pulse-generator';
import { personalizedMuskPulseGenerator } from './personalized-musk-pulse-generator';

export class MuskPulseScheduler {
  private scheduleIntervals: NodeJS.Timeout[] = [];
  private cronJobs: cron.ScheduledTask[] = [];
  private isRunning = false;
  private usePersonalization = true; // Toggle for personalized vs shared pulses

  /**
   * Start the automated pulse generation schedule
   */
  start(): void {
    if (this.isRunning) {
      console.log('[MuskPulseScheduler] Already running');
      return;
    }

    console.log('[MuskPulseScheduler] Starting automated pulse generation schedule');
    this.isRunning = true;

    // Schedule daily pulses at specific times
    this.scheduleDailyPulses();
    
    // Start monitoring for event-driven pulses
    this.startEventMonitoring();
    
    console.log('[MuskPulseScheduler] Schedule activated');
  }

  /**
   * Stop the automated scheduling
   */
  stop(): void {
    console.log('[MuskPulseScheduler] Stopping automated pulse generation');
    
    this.scheduleIntervals.forEach(interval => clearInterval(interval));
    this.scheduleIntervals = [];
    
    this.cronJobs.forEach(job => job.stop());
    this.cronJobs = [];
    
    this.isRunning = false;
    
    console.log('[MuskPulseScheduler] Schedule stopped');
  }

  /**
   * Schedule pulses for 9 AM, 2 PM, and 7 PM daily using cron (restart-resistant)
   */
  private scheduleDailyPulses(): void {
    // Define target times using cron expressions (minute hour * * *)
    const scheduleTimes = [
      { cron: '0 9 * * *', type: 'morning' as const, time: '9:00 AM UTC' },     // 9:00 AM UTC daily
      { cron: '0 14 * * *', type: 'afternoon' as const, time: '2:00 PM UTC' },  // 2:00 PM UTC daily
      { cron: '0 19 * * *', type: 'evening' as const, time: '7:00 PM UTC' }     // 7:00 PM UTC daily
    ];

    scheduleTimes.forEach(({ cron: cronExpression, type, time }) => {
      const job = cron.schedule(cronExpression, async () => {
        console.log(`[MuskPulseScheduler] 🔔 Triggered ${type} pulse at ${time}`);
        await this.generateScheduledPulse(type);
      }, {
        timezone: 'UTC'
      });

      this.cronJobs.push(job);
      console.log(`[MuskPulseScheduler] ✅ ${type} pulse scheduled for ${time} daily`);
    });
  }

  /**
   * Generate a scheduled pulse (personalized for all users)
   */
  private async generateScheduledPulse(timeOfDay: 'morning' | 'afternoon' | 'evening'): Promise<void> {
    try {
      console.log(`[MuskPulseScheduler] Generating ${timeOfDay} pulse (personalized: ${this.usePersonalization})`);
      
      if (this.usePersonalization) {
        // Generate personalized pulses for each user
        await personalizedMuskPulseGenerator.generatePersonalizedPulsesForAllUsers(timeOfDay);
        console.log(`[MuskPulseScheduler] Successfully generated personalized ${timeOfDay} pulses`);
      } else {
        // Generate shared pulse for all users (old behavior)
        await muskPulseGenerator.generateScheduledPulse({
          timeOfDay,
          eventDriven: false
        });
        console.log(`[MuskPulseScheduler] Successfully generated shared ${timeOfDay} pulse`);
      }
      
    } catch (error) {
      console.error(`[MuskPulseScheduler] Error generating ${timeOfDay} pulse:`, error);
    }
  }

  /**
   * Start monitoring for event-driven pulse opportunities
   */
  private startEventMonitoring(): void {
    // Check every 30 minutes for trending activities that might warrant a pulse
    const eventCheckInterval = setInterval(async () => {
      await this.checkForEventTriggers();
    }, 30 * 60 * 1000); // 30 minutes

    this.scheduleIntervals.push(eventCheckInterval);
    
    console.log('[MuskPulseScheduler] Event monitoring started (checking every 30 minutes)');
  }

  /**
   * Check for conditions that should trigger event-driven pulses
   */
  private async checkForEventTriggers(): Promise<void> {
    try {
      console.log('[MuskPulseScheduler] Checking for event triggers');
      
      // Check for industry-specific activity spikes
      const industryActivity = await this.getIndustryActivitySpikes();
      
      for (const activity of industryActivity) {
        if (activity.shouldTriggerPulse) {
          console.log(`[MuskPulseScheduler] Triggering pulse for ${activity.industry} activity spike`);
          
          await muskPulseGenerator.generateEventDrivenPulse(
            activity.industry,
            `Increased professional activity in ${activity.industry} sector`
          );
          
          // Prevent duplicate pulses by marking this industry as processed
          await this.markIndustryProcessed(activity.industry);
        }
      }
      
      // Check for hashtag trending spikes
      const hashtagTrends = await this.getHashtagTrendingSpikes();
      
      for (const trend of hashtagTrends) {
        if (trend.shouldTriggerPulse) {
          console.log(`[MuskPulseScheduler] Triggering pulse for trending hashtag: #${trend.hashtag}`);
          
          await muskPulseGenerator.generateEventDrivenPulse(
            trend.primaryIndustry || 'General',
            `Trending topic: #${trend.hashtag} - High engagement from professionals across industries`
          );
          
          // Mark hashtag as processed to prevent spam
          await this.markHashtagProcessed(trend.hashtag);
        }
      }
      
    } catch (error) {
      console.error('[MuskPulseScheduler] Error checking event triggers:', error);
    }
  }

  /**
   * Analyze recent activity to identify industry spikes
   */
  private async getIndustryActivitySpikes(): Promise<Array<{
    industry: string;
    activityScore: number;
    shouldTriggerPulse: boolean;
  }>> {
    try {
      // Simple heuristic: if multiple users from same industry have been active recently
      const recentActivityThreshold = new Date(Date.now() - 4 * 60 * 60 * 1000); // 4 hours ago
      
      // This is a simplified check - in production, you'd want more sophisticated analytics
      const industries = ['Technology', 'Healthcare', 'Finance', 'Marketing', 'Design'];
      
      return industries.map(industry => ({
        industry,
        activityScore: Math.random() * 100, // Placeholder - replace with real analytics
        shouldTriggerPulse: Math.random() > 0.9 // 10% chance for demo purposes
      }));
      
    } catch (error) {
      console.error('[MuskPulseScheduler] Error analyzing activity spikes:', error);
      return [];
    }
  }

  /**
   * Mark an industry as having been processed to prevent duplicate pulses
   */
  private async markIndustryProcessed(industry: string): Promise<void> {
    // In production, you'd store this in cache/database to prevent spam
    console.log(`[MuskPulseScheduler] Marked ${industry} as processed for event-driven pulse`);
  }

  /**
   * Analyze hashtag usage trends to identify viral topics
   */
  private async getHashtagTrendingSpikes(): Promise<Array<{
    hashtag: string;
    followCount: number;
    recentActivity: number;
    primaryIndustry?: string;
    shouldTriggerPulse: boolean;
  }>> {
    try {
      // Get hashtag engagement over the last 4 hours vs. previous 24 hours
      const recentThreshold = new Date(Date.now() - 4 * 60 * 60 * 1000); // 4 hours ago
      const baselineThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
      
      // Simple trending analysis - in production, you'd have more sophisticated metrics
      const trendingHashtags = [
        { tag: 'AI', followCount: 45, recentActivity: 12, industry: 'Technology' },
        { tag: 'RemoteWork', followCount: 38, recentActivity: 8, industry: 'General' },
        { tag: 'CareerGrowth', followCount: 52, recentActivity: 15, industry: 'General' },
        { tag: 'Leadership', followCount: 29, recentActivity: 6, industry: 'Management' },
        { tag: 'Networking', followCount: 33, recentActivity: 9, industry: 'General' }
      ];
      
      return trendingHashtags.map(hashtag => ({
        hashtag: hashtag.tag,
        followCount: hashtag.followCount,
        recentActivity: hashtag.recentActivity,
        primaryIndustry: hashtag.industry,
        // Trigger pulse if significant spike (recentActivity > followCount * 0.2)
        shouldTriggerPulse: hashtag.recentActivity > (hashtag.followCount * 0.2) && Math.random() > 0.85 // 15% chance
      }));
      
    } catch (error) {
      console.error('[MuskPulseScheduler] Error analyzing hashtag trends:', error);
      return [];
    }
  }

  /**
   * Mark a hashtag as processed to prevent duplicate trending pulses
   */
  private async markHashtagProcessed(hashtag: string): Promise<void> {
    // In production, you'd store this in cache/database with expiration
    console.log(`[MuskPulseScheduler] Marked #${hashtag} as processed for trending pulse`);
  }

  /**
   * Generate an immediate pulse for testing
   */
  async generateTestPulse(type: 'morning' | 'afternoon' | 'evening' = 'afternoon'): Promise<void> {
    console.log(`[MuskPulseScheduler] Generating test ${type} pulse`);
    await this.generateScheduledPulse(type);
  }

  /**
   * Get scheduler status
   */
  getStatus(): { isRunning: boolean; activeIntervals: number; activeCronJobs: number } {
    return {
      isRunning: this.isRunning,
      activeIntervals: this.scheduleIntervals.length,
      activeCronJobs: this.cronJobs.length
    };
  }
}

// Export singleton instance
export const muskPulseScheduler = new MuskPulseScheduler();