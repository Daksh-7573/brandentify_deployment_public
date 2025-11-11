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
import { and, lte, isNotNull, eq } from 'drizzle-orm';
import { smartQuestAllocator } from './smart-quest-allocator';
import { comprehensiveQuestGeneratorV2 } from './comprehensive-quest-generator-v2';
import { socialQuestGeneratorV2 } from './social-quest-generator-v2';

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
   * Update user's nextQuestAssignmentTime to tomorrow at midnight in their timezone
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
   * Calculate the next midnight in the given timezone
   */
  private calculateNextMidnight(timezone: string): Date {
    try {
      const now = new Date();
      
      // Get current time in user's timezone
      const userTimeString = now.toLocaleString('en-US', { timeZone: timezone });
      const userTime = new Date(userTimeString);
      
      // Set to next midnight
      const nextMidnight = new Date(userTime);
      nextMidnight.setHours(24, 1, 0, 0); // Tomorrow at 00:01 (12:01 AM)
      
      // Convert back to UTC for storage
      const utcOffset = now.getTime() - userTime.getTime();
      const nextMidnightUTC = new Date(nextMidnight.getTime() + utcOffset);
      
      return nextMidnightUTC;
      
    } catch (error) {
      console.error(`[TimezoneQuestScheduler] Error calculating next midnight for timezone ${timezone}:`, error);
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
   */
  public async initializeUsersNextAssignmentTime() {
    try {
      console.log('[TimezoneQuestScheduler] 🔄 Initializing nextQuestAssignmentTime for users...');
      
      // Find users without nextQuestAssignmentTime set
      const uninitializedUsers = await db
        .select({
          id: users.id,
          name: users.name,
          timezone: users.timezone
        })
        .from(users)
        .where(
          isNotNull(users.timezone) // Only users with timezone set
        );

      console.log(`[TimezoneQuestScheduler] Found ${uninitializedUsers.length} users to initialize`);

      for (const user of uninitializedUsers) {
        const nextMidnight = this.calculateNextMidnight(user.timezone || 'UTC');
        
        await db
          .update(users)
          .set({ nextQuestAssignmentTime: nextMidnight })
          .where(eq(users.id, user.id));
        
        console.log(`[TimezoneQuestScheduler] ✅ Initialized user ${user.id} (${user.name}) - next assignment at ${nextMidnight.toISOString()}`);
      }

      console.log('[TimezoneQuestScheduler] 🎉 Initialization complete');
      
    } catch (error) {
      console.error('[TimezoneQuestScheduler] Error initializing users:', error);
    }
  }
}

export const timezoneAwareQuestScheduler = new TimezoneAwareQuestScheduler();
