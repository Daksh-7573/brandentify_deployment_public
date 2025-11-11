/**
 * Musk Pulse Scheduler Service
 * 
 * Handles automated scheduling of Musk pulse generation
 * - 3 times daily: 9 AM, 2 PM, 7 PM UTC (cron-based, restart-resistant)
 * - Event-driven generation based on user activity and industry trends
 */

import * as cron from 'node-cron';
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
   * Schedule hourly checks to generate pulses for users based on their local timezone
   * Generates pulses at 9 AM, 2 PM, and 7 PM in each user's timezone
   */
  private scheduleDailyPulses(): void {
    // Run every hour at minute 0 (top of the hour)
    const job = cron.schedule('0 * * * *', async () => {
      console.log(`[MuskPulseScheduler] 🔔 Hourly check triggered - checking user timezones`);
      await this.generatePulsesForUserTimezones();
    }, {
      timezone: 'UTC'
    });

    this.cronJobs.push(job);
    console.log(`[MuskPulseScheduler] ✅ Hourly timezone-based pulse generation scheduled`);
  }

  /**
   * Generate pulses for users based on their local timezone
   * Checks each user's timezone and generates pulses if it's 9 AM, 2 PM, or 7 PM in their timezone
   */
  private async generatePulsesForUserTimezones(): Promise<void> {
    try {
      const { db } = await import('../db');
      const { users } = await import('../../shared/schema');
      const { eq } = await import('drizzle-orm');
      
      // Get all users with their timezones
      const allUsers = await db.select({
        id: users.id,
        name: users.name,
        timezone: users.timezone
      }).from(users);
      
      const now = new Date();
      const targetHours = [9, 14, 19]; // 9 AM, 2 PM, 7 PM
      const timeOfDayMap: Record<number, 'morning' | 'afternoon' | 'evening'> = {
        9: 'morning',
        14: 'afternoon',
        19: 'evening'
      };
      
      for (const user of allUsers) {
        try {
          const userTimezone = user.timezone || 'UTC';
          
          // Get current hour in user's timezone
          const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: userTimezone,
            hour: 'numeric',
            hour12: false
          });
          
          const userHourStr = formatter.format(now);
          const userHour = parseInt(userHourStr, 10);
          
          // Check if it's one of the target hours
          if (targetHours.includes(userHour)) {
            const timeOfDay = timeOfDayMap[userHour];
            console.log(`[MuskPulseScheduler] Generating ${timeOfDay} pulse for user ${user.id} (${user.name}) in ${userTimezone} (local hour: ${userHour})`);
            
            if (this.usePersonalization) {
              await personalizedMuskPulseGenerator.generatePersonalizedPulsesForSpecificUsers([user.id], timeOfDay);
            } else {
              await muskPulseGenerator.generateScheduledPulse({
                timeOfDay,
                eventDriven: false
              });
            }
          }
        } catch (userError) {
          console.error(`[MuskPulseScheduler] Error processing user ${user.id}:`, userError);
          // Continue with next user
        }
      }
      
      console.log(`[MuskPulseScheduler] Timezone-based pulse generation check completed`);
    } catch (error) {
      console.error(`[MuskPulseScheduler] Error in timezone-based pulse generation:`, error);
    }
  }

  /**
   * Generate a scheduled pulse (deprecated - kept for compatibility)
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
        console.log(`[MuskPulseScheduler] Successfully generated shared ${timeOfDay} pulses`);
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