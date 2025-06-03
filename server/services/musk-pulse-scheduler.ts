/**
 * Musk Pulse Scheduler Service
 * 
 * Handles automated scheduling of Musk pulse generation
 * - 3 times daily: 9 AM, 2 PM, 7 PM
 * - Event-driven generation based on user activity and industry trends
 */

import { muskPulseGenerator } from './musk-pulse-generator';

export class MuskPulseScheduler {
  private scheduleIntervals: NodeJS.Timeout[] = [];
  private isRunning = false;

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
    this.isRunning = false;
    
    console.log('[MuskPulseScheduler] Schedule stopped');
  }

  /**
   * Schedule pulses for 9 AM, 2 PM, and 7 PM daily
   */
  private scheduleDailyPulses(): void {
    // Define target times in 24-hour format
    const scheduleTimes = [
      { hour: 9, minute: 0, type: 'morning' as const },   // 9:00 AM
      { hour: 14, minute: 0, type: 'afternoon' as const }, // 2:00 PM
      { hour: 19, minute: 0, type: 'evening' as const }    // 7:00 PM
    ];

    scheduleTimes.forEach(({ hour, minute, type }) => {
      this.scheduleDaily(hour, minute, type);
    });
  }

  /**
   * Schedule a daily recurring task at specific time
   */
  private scheduleDaily(hour: number, minute: number, type: 'morning' | 'afternoon' | 'evening'): void {
    const scheduleTime = () => {
      const now = new Date();
      const scheduled = new Date();
      scheduled.setHours(hour, minute, 0, 0);

      // If the time has passed today, schedule for tomorrow
      if (scheduled <= now) {
        scheduled.setDate(scheduled.getDate() + 1);
      }

      const timeUntilExecution = scheduled.getTime() - now.getTime();
      
      console.log(`[MuskPulseScheduler] Next ${type} pulse scheduled for: ${scheduled.toLocaleString()}`);

      setTimeout(async () => {
        await this.generateScheduledPulse(type);
        // Schedule the next occurrence (24 hours later)
        scheduleTime();
      }, timeUntilExecution);
    };

    scheduleTime();
  }

  /**
   * Generate a scheduled pulse
   */
  private async generateScheduledPulse(timeOfDay: 'morning' | 'afternoon' | 'evening'): Promise<void> {
    try {
      console.log(`[MuskPulseScheduler] Generating ${timeOfDay} pulse`);
      
      await muskPulseGenerator.generateScheduledPulse({
        timeOfDay,
        eventDriven: false
      });
      
      console.log(`[MuskPulseScheduler] Successfully generated ${timeOfDay} pulse`);
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
   * Generate an immediate pulse for testing
   */
  async generateTestPulse(type: 'morning' | 'afternoon' | 'evening' = 'afternoon'): Promise<void> {
    console.log(`[MuskPulseScheduler] Generating test ${type} pulse`);
    await this.generateScheduledPulse(type);
  }

  /**
   * Get scheduler status
   */
  getStatus(): { isRunning: boolean; activeIntervals: number } {
    return {
      isRunning: this.isRunning,
      activeIntervals: this.scheduleIntervals.length
    };
  }
}

// Export singleton instance
export const muskPulseScheduler = new MuskPulseScheduler();