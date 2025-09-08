import cron from 'node-cron';
import { personalizedQuestAssignment } from './personalized-quest-assignment';
import { storage } from '../storage';

class WeeklyQuestScheduler {
  private isSchedulerActive = false;

  // Schedule to run every Monday at 6:00 AM
  public startScheduler() {
    if (this.isSchedulerActive) {
      console.log('[WeeklyQuestScheduler] Scheduler already running');
      return;
    }

    // Schedule: Every Monday at 6:00 AM (0 6 * * 1)
    cron.schedule('0 6 * * 1', async () => {
      console.log('[WeeklyQuestScheduler] Starting weekly quest generation...');
      await this.generateWeeklyQuestsForAllUsers();
    }, {
      timezone: 'UTC'
    });

    this.isSchedulerActive = true;
    console.log('[WeeklyQuestScheduler] Monday 6AM scheduler activated');
  }

  public stopScheduler() {
    this.isSchedulerActive = false;
    console.log('[WeeklyQuestScheduler] Scheduler stopped');
  }

  private async generateWeeklyQuestsForAllUsers() {
    try {
      console.log('[WeeklyQuestScheduler] Fetching all active users...');
      
      // Get all users from storage
      const users = await storage.getAllUsers();
      console.log(`[WeeklyQuestScheduler] Found ${users.length} users to process`);

      let successCount = 0;
      let errorCount = 0;

      for (const user of users) {
        try {
          console.log(`[WeeklyQuestScheduler] Generating quests for user ${user.id} (${user.name})`);
          
          // Generate personalized quests with 3-7 quest limit
          const result = await personalizedQuestAssignment.assignWeeklyPersonalizedQuests(
            user.id, 
            { minQuests: 3, maxQuests: 7 }
          );
          
          console.log(`[WeeklyQuestScheduler] ✅ Generated ${result.assignedQuests.length} quests for ${user.name}`);
          successCount++;
          
        } catch (userError) {
          console.error(`[WeeklyQuestScheduler] ❌ Error generating quests for user ${user.id}:`, userError);
          errorCount++;
        }
      }

      console.log(`[WeeklyQuestScheduler] Weekly generation complete: ${successCount} success, ${errorCount} errors`);
      
    } catch (error) {
      console.error('[WeeklyQuestScheduler] Fatal error in weekly generation:', error);
    }
  }

  // Manual trigger for testing
  public async triggerWeeklyGeneration() {
    console.log('[WeeklyQuestScheduler] Manual trigger - generating weekly quests');
    await this.generateWeeklyQuestsForAllUsers();
  }

  public getSchedulerStatus() {
    return {
      isActive: this.isSchedulerActive,
      nextRun: this.isSchedulerActive ? 'Next Monday 6:00 AM UTC' : 'Not scheduled'
    };
  }
}

export const weeklyQuestScheduler = new WeeklyQuestScheduler();