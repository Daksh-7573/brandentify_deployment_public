/**
 * Timezone-Aware Quest Scheduler
 * 
 * Generates Brand Quests for users at midnight in their local timezone
 * instead of a single global UTC time.
 * 
 * Approach:
 * - Runs every 15 minutes
 * - Checks which users are due for quest assignment (nextQuestAssignmentTime <= NOW)
 * - Processes users in batches of 200 to prevent server overload
 * - Updates nextQuestAssignmentTime to +24 hours after assignment
 */

import cron from 'node-cron';
import { storage } from '../storage';
import { db } from '../db';
import { users, userQuests } from '@shared/schema';
import { and, lte, isNotNull, isNull, eq } from 'drizzle-orm';
import { smartQuestAllocator } from './smart-quest-allocator';
import { comprehensiveQuestGeneratorV2 } from './comprehensive-quest-generator-v2';
import { socialQuestGeneratorV2 } from './social-quest-generator-v2';
import { fromZonedTime } from 'date-fns-tz';
import { addDays, startOfDay, setHours, setMinutes, setSeconds } from 'date-fns';

class TimezoneAwareQuestScheduler {
  private isSchedulerActive = false;
  private cronJob: cron.ScheduledTask | null = null;
  private readonly BATCH_SIZE = 200; // Process 200 users at a time
  private readonly CHECK_INTERVAL = '*/15 * * * *'; // Every 15 minutes

  /**
   * Start the timezone-aware scheduler
   */
  public startScheduler() {
    if (this.isSchedulerActive) {
      console.log('[TimezoneQuestScheduler] Scheduler already running');
      return;
    }

    // Schedule: Every 15 minutes
    this.cronJob = cron.schedule(this.CHECK_INTERVAL, async () => {
      await this.checkAndAssignQuests();
    }, {
      timezone: 'UTC'
    });

    this.isSchedulerActive = true;
    console.log('[TimezoneQuestScheduler] ✅ Timezone-aware scheduler started (checks every 15 minutes)');
  }

  public stopScheduler() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }
    this.isSchedulerActive = false;
    console.log('[TimezoneQuestScheduler] Scheduler stopped');
  }

  /**
   * Check for users due for quest assignment and process them
   */
  private async checkAndAssignQuests() {
    try {
      console.log('[TimezoneQuestScheduler] 🔍 Checking for users due for quest assignment...');
      
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

      // Process each user
      for (const user of dueUsers) {
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
            // Still update nextQuestAssignmentTime to tomorrow
            await this.updateNextAssignmentTime(user.id, user.timezone || 'UTC');
            continue;
          }
          
          console.log(`[TimezoneQuestScheduler] 🎯 Assigning quests for user ${user.id} (${user.name}) in ${user.timezone}`);
          
          // Use Smart Quest Allocator to determine optimal quest quantity
          const allocation = await smartQuestAllocator.allocateDailyQuests(user.id);
          
          console.log(`[TimezoneQuestScheduler] 📊 Allocation: ${allocation.totalQuests} quests (${allocation.careerQuests} career, ${allocation.socialQuests} social)`);
          
          // Generate career quests
          if (allocation.careerQuests > 0) {
            await comprehensiveQuestGeneratorV2.generateQuestsForUser(
              user.id,
              allocation.careerQuests,
              'career'
            );
          }
          
          // Generate social quests
          if (allocation.socialQuests > 0) {
            await socialQuestGeneratorV2.generateQuestsForUser(
              user.id,
              allocation.socialQuests,
              'social'
            );
          }
          
          // Update nextQuestAssignmentTime to tomorrow at midnight in user's timezone
          await this.updateNextAssignmentTime(user.id, user.timezone || 'UTC');
          
          successCount++;
          console.log(`[TimezoneQuestScheduler] ✅ Quest assignment successful for user ${user.id}`);
          
        } catch (error) {
          console.error(`[TimezoneQuestScheduler] ❌ Error assigning quests for user ${user.id}:`, error);
          errorCount++;
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

      // STEP 2: Find users without nextQuestAssignmentTime (now all users should have timezone)
      const uninitializedUsers = await db
        .select({
          id: users.id,
          name: users.name,
          timezone: users.timezone
        })
        .from(users)
        .where(isNull(users.nextQuestAssignmentTime));

      console.log(`[TimezoneQuestScheduler] Found ${uninitializedUsers.length} users to initialize for quest assignment`);

      for (const user of uninitializedUsers) {
        const nextMidnight = this.calculateNextMidnight(user.timezone || 'UTC');
        
        await db
          .update(users)
          .set({ nextQuestAssignmentTime: nextMidnight })
          .where(eq(users.id, user.id));
        
        console.log(`[TimezoneQuestScheduler] ✅ Initialized user ${user.id} (${user.name}) in timezone ${user.timezone} - next assignment at ${nextMidnight.toISOString()}`);
      }

      console.log('[TimezoneQuestScheduler] 🎉 Initialization complete - all users ready for daily quest generation');
      
    } catch (error) {
      console.error('[TimezoneQuestScheduler] Error initializing users:', error);
    }
  }
}

export const timezoneAwareQuestScheduler = new TimezoneAwareQuestScheduler();
