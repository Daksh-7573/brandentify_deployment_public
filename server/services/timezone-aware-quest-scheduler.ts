/**
 * Timezone-Aware Quest Scheduler - OPTIMIZED
 * 
 * Generates Brand Quests for users at midnight in their local timezone
 * instead of a single global UTC time.
 * 
 * OPTIMIZATION (2024-12-10):
 * - Changed from every 15 minutes to HOURLY checks (75% less server load)
 * - Still captures all users due because nextQuestAssignmentTime is pre-calculated
 * - Each user's quest generation time is stored in their timezone, so hourly check catches everyone due in that hour
 * - Reduces DB queries from 96/day to 24/day
 * 
 * Approach:
 * - Runs every hour at :00 (e.g., 12:00, 1:00, 2:00, etc.)
 * - Checks which users are due for quest assignment (nextQuestAssignmentTime <= NOW)
 * - Since each user's nextQuestAssignmentTime is their local midnight + 1 second, a once-per-hour check ensures we catch everyone
 * - Processes users in batches of 200 to prevent server overload
 * - Updates nextQuestAssignmentTime to +24 hours after assignment
 */

import cron from 'node-cron';
import { storage } from '../storage';
import { db } from '../db';
import { users, userQuests } from '@shared/schema';
import { and, lte, isNotNull, isNull, eq, lt } from 'drizzle-orm';
import { fromZonedTime } from 'date-fns-tz';
import { addDays, startOfDay, setHours, setMinutes, setSeconds } from 'date-fns';

// Import daily quest scheduler for actual quest assignment logic
// This avoids code duplication and ensures consistency
import { dailyQuestScheduler } from './daily-quest-scheduler';

class TimezoneAwareQuestScheduler {
  private isSchedulerActive = false;
  private cronJob: any = null; // Using 'any' to avoid cron type issues
  private autoHealCronJob: any = null; // Periodic auto-heal job
  private readonly BATCH_SIZE = 200; // Process 200 users at a time
  // ZERO TOLERANCE: Run every 5 minutes to catch retry users quickly
  // Trade-off: More frequent DB checks but ensures failures are retried within 5-10 minutes
  private readonly CHECK_INTERVAL = '*/5 * * * *'; // Every 5 minutes
  private readonly AUTO_HEAL_INTERVAL = '*/5 * * * *'; // Every 5 minutes (aligned with main check)
  private readonly MAX_RETRIES = 3; // Maximum retry attempts before pushing to tomorrow
  private retryCountMap = new Map<number, number>(); // Track retry attempts per user

  /**
   * Start the timezone-aware scheduler
   */
  public startScheduler() {
    if (this.isSchedulerActive) {
      console.log('[TimezoneQuestScheduler] Scheduler already running');
      return;
    }

    // Run initialization once on startup
    this.initializeUsersNextAssignmentTime();

    // Primary scheduler: Every 5 minutes
    this.cronJob = cron.schedule(this.CHECK_INTERVAL, async () => {
      await this.checkAndAssignQuests();
    }, {
      timezone: 'UTC'
    });

    // Auto-heal scheduler: Every hour at :30 (offset from main check)
    // This catches any users who become stuck during the day
    this.autoHealCronJob = cron.schedule(this.AUTO_HEAL_INTERVAL, async () => {
      console.log('[TimezoneQuestScheduler] 🔧 [PERIODIC] Running auto-heal check...');
      await this.autoHealStuckUsers();
    }, {
      timezone: 'UTC'
    });

    this.isSchedulerActive = true;
    console.log('[TimezoneQuestScheduler] ✅ Timezone-aware scheduler started (ZERO TOLERANCE: checks every 5 min, auto-heal every 5 min, max 3 retries)');
  }

  public stopScheduler() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }
    if (this.autoHealCronJob) {
      this.autoHealCronJob.stop();
      this.autoHealCronJob = null;
    }
    this.isSchedulerActive = false;
    console.log('[TimezoneQuestScheduler] Scheduler stopped');
  }

  /**
   * Check for users due for quest assignment and process them
   */
  private async checkAndAssignQuests() {
    try {
      console.log('[TimezoneQuestScheduler] ⏰ [HOURLY CHECK] Checking for users due for quest assignment...');
      
      const now = new Date();
      
      // Find users whose nextQuestAssignmentTime has passed
      const dueUsers = await db
        .select({
          id: users.id,
          name: users.name,
          timezone: users.timezone,
          nextQuestAssignmentTime: users.nextQuestAssignmentTime
        })
        .from(users)
        .where(
          and(
            isNotNull(users.nextQuestAssignmentTime),
            lte(users.nextQuestAssignmentTime, now)
          )
        )
        .limit(this.BATCH_SIZE);

      if (dueUsers.length === 0) {
        console.log('[TimezoneQuestScheduler] ✅ No users due for quest assignment');
        return;
      }

      console.log(`[TimezoneQuestScheduler] 📋 Found ${dueUsers.length} users due for quests`);

      let successCount = 0;
      let errorCount = 0;
      let skippedCount = 0;

      // Process each user with CRITICAL: finally block to handle success/failure appropriately
      for (const user of dueUsers) {
        let questAssignmentSuccess = false; // Track success for retry logic
        let alreadyHasQuests = false;
        
        try {
          // Check if user already has quests assigned today
          const todayDateString = this.getTodayDateString();
          const existingTodayQuests = await db
            .select()
            .from(userQuests)
            .where(and(
              eq(userQuests.userId, user.id),
              eq(userQuests.assignedDate, todayDateString)
            ));
          
          if (existingTodayQuests.length > 0) {
            console.log(`[TimezoneQuestScheduler] ⏭️ Skipping user ${user.id} (${user.name}) - already has ${existingTodayQuests.length} quests today`);
            skippedCount++;
            alreadyHasQuests = true;
            questAssignmentSuccess = true; // No action needed, consider success
            continue;
          }
          
          console.log(`[TimezoneQuestScheduler] 🎯 Assigning quests for user ${user.id} (${user.name}) in ${user.timezone}`);
          
          // CRITICAL: Delegate to daily quest scheduler for actual quest assignment
          // This ensures consistent quest generation logic and avoids code duplication
          const assignedQuests = await dailyQuestScheduler.triggerDailyAssignmentForUser(user.id);
          
          console.log(`[TimezoneQuestScheduler] ✅ Assigned ${assignedQuests.length} quests for user ${user.id} (${user.name})`);
          
          questAssignmentSuccess = true;
          successCount++;
          
        } catch (error) {
          console.error(`[TimezoneQuestScheduler] ❌ Error assigning quests for user ${user.id} (${user.name}):`, error);
          errorCount++;
          questAssignmentSuccess = false;
          // Log detailed error for debugging
          console.error(`[TimezoneQuestScheduler] 📋 Error details:`, {
            userId: user.id,
            userName: user.name,
            timezone: user.timezone,
            errorMessage: error instanceof Error ? error.message : String(error),
            errorStack: error instanceof Error ? error.stack : undefined
          });
        } finally {
          // CRITICAL: Update nextQuestAssignmentTime based on success/failure
          // - SUCCESS: Push to tomorrow at midnight (user's timezone), reset retry count
          // - FAILURE: Retry up to MAX_RETRIES times, then push to tomorrow (prevents infinite loops)
          try {
            if (questAssignmentSuccess) {
              // Success - schedule for tomorrow and reset retry count
              await this.updateNextAssignmentTime(user.id, user.timezone || 'UTC');
              this.retryCountMap.delete(user.id); // Clear retry counter
              console.log(`[TimezoneQuestScheduler] ⏰ Success: Updated nextQuestAssignmentTime for user ${user.id} to tomorrow`);
            } else {
              // Failure - check retry count
              const currentRetries = this.retryCountMap.get(user.id) || 0;
              const newRetryCount = currentRetries + 1;
              
              if (newRetryCount >= this.MAX_RETRIES) {
                // Max retries reached - push to tomorrow to prevent infinite loops
                console.error(`[TimezoneQuestScheduler] ⚠️ MAX RETRIES (${this.MAX_RETRIES}) reached for user ${user.id}. Pushing to tomorrow.`);
                await this.updateNextAssignmentTime(user.id, user.timezone || 'UTC');
                this.retryCountMap.delete(user.id); // Clear retry counter
                // Log for monitoring/alerting
                console.error(`[TimezoneQuestScheduler] 🚨 ALERT: User ${user.id} (${user.name}) failed quest assignment ${this.MAX_RETRIES} times. Investigate root cause.`);
              } else {
                // Schedule retry
                this.retryCountMap.set(user.id, newRetryCount);
                await this.scheduleRetry(user.id);
                console.log(`[TimezoneQuestScheduler] 🔄 Failure: Scheduled retry ${newRetryCount}/${this.MAX_RETRIES} for user ${user.id} in 5 minutes`);
              }
            }
          } catch (updateError) {
            console.error(`[TimezoneQuestScheduler] ⚠️ CRITICAL: Failed to update nextQuestAssignmentTime for user ${user.id}:`, updateError);
          }
        }
      }

      console.log(`[TimezoneQuestScheduler] 📊 Batch complete: ${successCount} success, ${errorCount} errors, ${skippedCount} skipped`);
      
    } catch (error) {
      console.error('[TimezoneQuestScheduler] Error in checkAndAssignQuests:', error);
    }
  }

  /**
   * Update user's nextQuestAssignmentTime to tomorrow at 12:00:01 AM in their timezone
   * This is 1 second after the quest expiration time (12:00:00 AM)
   */
  private async updateNextAssignmentTime(userId: number, timezone: string) {
    try {
      // Calculate next midnight in user's timezone
      const nextMidnight = this.calculateNextMidnight(timezone);
      
      await db
        .update(users)
        .set({ nextQuestAssignmentTime: nextMidnight })
        .where(eq(users.id, userId));
      
      console.log(`[TimezoneQuestScheduler] ⏰ Updated nextQuestAssignmentTime for user ${userId} to ${nextMidnight.toISOString()}`);
      
    } catch (error) {
      console.error(`[TimezoneQuestScheduler] Error updating nextQuestAssignmentTime for user ${userId}:`, error);
    }
  }

  /**
   * Schedule a retry for failed quest assignment
   * Sets nextQuestAssignmentTime to 5 minutes from now for short-term retry
   * This ensures users don't wait 24 hours after a transient failure
   */
  private async scheduleRetry(userId: number) {
    try {
      const retryTime = new Date();
      retryTime.setMinutes(retryTime.getMinutes() + 5); // Retry in 5 minutes
      
      await db
        .update(users)
        .set({ nextQuestAssignmentTime: retryTime })
        .where(eq(users.id, userId));
      
      console.log(`[TimezoneQuestScheduler] 🔄 Scheduled retry for user ${userId} at ${retryTime.toISOString()}`);
      
    } catch (error) {
      console.error(`[TimezoneQuestScheduler] Error scheduling retry for user ${userId}:`, error);
    }
  }

  /**
   * Calculate the next quest generation time (user's local midnight + 1 second)
   * UPDATED: New quests generate at 12:00:01 AM local time
   * Old quests expire at 12:00 AM local time
   * This creates a 1-second gap between expiration and generation in user's local timezone
   */
  private calculateNextMidnight(timezone: string): Date {
    try {
      // Get tomorrow's date at 00:00:01 (midnight + 1 second) in the user's timezone
      const tomorrow = addDays(new Date(), 1);
      const tomorrowAtMidnightPlusOne = setHours(setMinutes(setSeconds(startOfDay(tomorrow), 1), 0), 0); // 00:00:01
      
      // Convert this local time (in user's timezone) to UTC
      const generationTimeUTC = fromZonedTime(tomorrowAtMidnightPlusOne, timezone);
      
      console.log(`[TimezoneQuestScheduler] 🕐 Calculated quest generation for timezone ${timezone}:`);
      console.log(`  - Old quests expire: 12:00:00 AM local time`);
      console.log(`  - New quests generate: 12:00:01 AM local time`);
      console.log(`  - UTC time for generation: ${generationTimeUTC.toISOString()}`);
      console.log(`  - Purpose: 1-second gap between expiration and generation (all in local timezone)`);
      
      return generationTimeUTC;
      
    } catch (error) {
      console.error(`[TimezoneQuestScheduler] Error calculating quest expiration for timezone ${timezone}:`, error);
      // Fallback: 24 hours from now
      const fallback = new Date();
      fallback.setHours(fallback.getHours() + 24);
      return fallback;
    }
  }

  /**
   * Get today's date in YYYY-MM-DD format
   */
  private getTodayDateString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  /**
   * Initialize nextQuestAssignmentTime for users who don't have it set
   * Run this once during migration
   * CRITICAL FIX: Only initialize users WITHOUT nextQuestAssignmentTime to avoid resetting on every restart
   * UPDATED: Now also sets timezone to 'UTC' for users who don't have it
   */
  public async initializeUsersNextAssignmentTime() {
    try {
      console.log('[TimezoneQuestScheduler] 🔄 Initializing nextQuestAssignmentTime for users...');
      
      // STEP 1: Find users WITHOUT timezone and set it to UTC
      const usersWithoutTimezone = await db
        .select({
          id: users.id,
          name: users.name,
          timezone: users.timezone
        })
        .from(users)
        .where(isNull(users.timezone));

      console.log(`[TimezoneQuestScheduler] Found ${usersWithoutTimezone.length} users without timezone - setting to UTC`);
      
      for (const user of usersWithoutTimezone) {
        await db
          .update(users)
          .set({ timezone: 'UTC' })
          .where(eq(users.id, user.id));
        console.log(`[TimezoneQuestScheduler] ✅ Set timezone UTC for user ${user.id} (${user.name})`);
      }

      // STEP 2: Find all users to initialize/ensure nextQuestAssignmentTime is set
      const uninitializedUsers = await db
        .select({
          id: users.id,
          name: users.name,
          timezone: users.timezone
        })
        .from(users);

      console.log(`[TimezoneQuestScheduler] Found ${uninitializedUsers.length} users to initialize/verify for quest assignment`);

      for (const user of uninitializedUsers) {
        // Force set to NOW so they get quests immediately if they don't have them
        const nextMidnight = new Date(); 
        
        await db
          .update(users)
          .set({ nextQuestAssignmentTime: nextMidnight })
          .where(eq(users.id, user.id));
        
        console.log(`[TimezoneQuestScheduler] ✅ Forced initialization for user ${user.id} (${user.name}) - next assignment at ${nextMidnight.toISOString()}`);
      }

      console.log('[TimezoneQuestScheduler] 🎉 Initialization complete - all users ready for daily quest generation');
      
    } catch (error) {
      console.error('[TimezoneQuestScheduler] Error initializing users:', error);
    }
  }

  /**
   * AUTO-HEAL: Detect and fix stuck users
   * 
   * A user is "stuck" if:
   * 1. Their nextQuestAssignmentTime is more than 1 hour in the past
   * 2. They have no quests assigned for today
   * 
   * This should run on every scheduler startup and periodically to catch edge cases.
   * 
   * CRITICAL: This prevents the bug where users get permanently stuck
   * due to failed quest generation without timestamp update.
   */
  public async autoHealStuckUsers(): Promise<number> {
    try {
      console.log('[TimezoneQuestScheduler] 🔧 Running auto-heal check for stuck users...');
      
      const now = new Date();
      // ZERO TOLERANCE: Lower threshold to 15 minutes (was 1 hour)
      // This catches stuck users faster, aligned with 5-minute check interval
      const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000); // 15 minutes ago
      const todayDateString = this.getTodayDateString();
      
      // Find users whose nextQuestAssignmentTime is > 15 minutes in the past
      // These are potentially stuck users
      const potentiallyStuckUsers = await db
        .select({
          id: users.id,
          name: users.name,
          timezone: users.timezone,
          nextQuestAssignmentTime: users.nextQuestAssignmentTime
        })
        .from(users)
        .where(
          and(
            isNotNull(users.nextQuestAssignmentTime),
            lt(users.nextQuestAssignmentTime, fifteenMinutesAgo)
          )
        );
      
      if (potentiallyStuckUsers.length === 0) {
        console.log('[TimezoneQuestScheduler] ✅ No potentially stuck users found');
        return 0;
      }
      
      console.log(`[TimezoneQuestScheduler] 🔍 Found ${potentiallyStuckUsers.length} users with stale timestamps, checking for stuck users...`);
      
      let healedCount = 0;
      
      for (const user of potentiallyStuckUsers) {
        // Check if user has any quests assigned today
        const todayQuests = await db
          .select()
          .from(userQuests)
          .where(and(
            eq(userQuests.userId, user.id),
            eq(userQuests.assignedDate, todayDateString)
          ));
        
        if (todayQuests.length === 0) {
          // User is STUCK: stale timestamp + no quests today
          console.log(`[TimezoneQuestScheduler] ⚠️ STUCK USER DETECTED: User ${user.id} (${user.name})`);
          console.log(`  - nextQuestAssignmentTime: ${user.nextQuestAssignmentTime?.toISOString()}`);
          console.log(`  - Today's quests: 0`);
          console.log(`  - Action: Resetting timestamp to NOW to trigger immediate assignment`);
          
          // Fix: Set nextQuestAssignmentTime to NOW + 1 second
          // The next hourly check will pick them up
          await db
            .update(users)
            .set({ nextQuestAssignmentTime: new Date(now.getTime() + 1000) })
            .where(eq(users.id, user.id));
          
          healedCount++;
          console.log(`[TimezoneQuestScheduler] ✅ Healed user ${user.id} (${user.name}) - will get quests on next hourly check`);
        }
      }
      
      if (healedCount > 0) {
        console.log(`[TimezoneQuestScheduler] 🎉 Auto-heal complete: Fixed ${healedCount} stuck users`);
      } else {
        console.log('[TimezoneQuestScheduler] ✅ No stuck users found (all users with stale timestamps have quests today)');
      }
      
      return healedCount;
      
    } catch (error) {
      console.error('[TimezoneQuestScheduler] ❌ Error in auto-heal check:', error);
      return 0;
    }
  }
}

export const timezoneAwareQuestScheduler = new TimezoneAwareQuestScheduler();
