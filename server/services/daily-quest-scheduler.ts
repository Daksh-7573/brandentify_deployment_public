import cron from 'node-cron';
import { storage } from '../storage';
import { db } from '../db';
import { userQuests, generatedSocialQuests, questDefinitions } from '@shared/schema';
import { eq, and, lt, ne } from 'drizzle-orm';
import { recommendationService } from './recommendation-service';

class DailyQuestScheduler {
  private isSchedulerActive = false;

  // Schedule to run every day at 12:01 AM UTC to handle quest expiration
  public startScheduler() {
    if (this.isSchedulerActive) {
      console.log('[DailyQuestScheduler] Scheduler already running');
      return;
    }

    // Schedule: Every day at 12:01 AM (1 0 * * *)
    cron.schedule('1 0 * * *', async () => {
      console.log('[DailyQuestScheduler] Starting daily quest expiration check...');
      await this.expirePreviousDayQuests();
      await this.assignNewDailyQuests();
    }, {
      timezone: 'UTC'
    });

    this.isSchedulerActive = true;
    console.log('[DailyQuestScheduler] Daily 12:01AM scheduler activated');
  }

  public stopScheduler() {
    this.isSchedulerActive = false;
    console.log('[DailyQuestScheduler] Scheduler stopped');
  }

  /**
   * Expire quests that were assigned on previous days and not completed
   */
  private async expirePreviousDayQuests() {
    try {
      console.log('[DailyQuestScheduler] Checking for previous day quests to expire...');
      
      // Get start of today in UTC
      const todayStart = new Date();
      todayStart.setUTCHours(0, 0, 0, 0);
      
      // Get today's date in YYYY-MM-DD format
      const todayDateString = this.getTodayDateString();
      
      // Update quests that were assigned before today and are still active
      const expiredQuests = await db
        .update(userQuests)
        .set({ 
          status: 'expired'
        })
        .where(
          and(
            ne(userQuests.status, 'completed'), // Don't expire completed quests
            ne(userQuests.status, 'expired'),   // Don't re-expire already expired quests
            lt(userQuests.assignedDate, todayDateString) // assignedDate before today
          )
        )
        .returning({ id: userQuests.id, userId: userQuests.userId });

      console.log(`[DailyQuestScheduler] Expired ${expiredQuests.length} quests from previous days`);
      
      return expiredQuests.length;
      
    } catch (error) {
      console.error('[DailyQuestScheduler] Error expiring previous day quests:', error);
      return 0;
    }
  }

  /**
   * Assign new daily quests to all active users
   */
  private async assignNewDailyQuests() {
    try {
      console.log('[DailyQuestScheduler] Starting daily quest assignment for all users...');
      
      // Get all users from storage
      const users = await storage.getAllUsers();
      console.log(`[DailyQuestScheduler] Found ${users.length} users to process`);

      let successCount = 0;
      let errorCount = 0;

      for (const user of users) {
        try {
          console.log(`[DailyQuestScheduler] Assigning daily quests for user ${user.id} (${user.name})`);
          
          // Assign both career and social quests daily
          const assignedCareerQuests = await storage.assignDailyQuestsToUser(user.id);
          const assignedSocialQuests = await storage.assignDailySocialQuests(user.id);
          
          // Add posting time recommendations to career quests
          if (assignedCareerQuests.length > 0) {
            await this.addPostingTimeRecommendations(user, assignedCareerQuests, 'career');
          }
          
          // Add posting time recommendations to social quests
          if (assignedSocialQuests.length > 0) {
            await this.addPostingTimeRecommendations(user, assignedSocialQuests, 'social');
          }
          
          const totalAssigned = assignedCareerQuests.length + assignedSocialQuests.length;
          console.log(`[DailyQuestScheduler] ✅ Assigned ${assignedCareerQuests.length} career + ${assignedSocialQuests.length} social = ${totalAssigned} total quests for ${user.name}`);
          
          successCount++;
          
        } catch (userError) {
          console.error(`[DailyQuestScheduler] ❌ Error assigning quests for user ${user.id}:`, userError);
          errorCount++;
        }
      }

      console.log(`[DailyQuestScheduler] Daily assignment complete: ${successCount} success, ${errorCount} errors`);
      
      return { successCount, errorCount };
      
    } catch (error) {
      console.error('[DailyQuestScheduler] Fatal error in daily assignment:', error);
      return { successCount: 0, errorCount: 1 };
    }
  }

  // Manual trigger for testing
  public async triggerDailyExpiration() {
    console.log('[DailyQuestScheduler] Manual trigger - expiring previous day quests');
    return await this.expirePreviousDayQuests();
  }

  public async triggerDailyAssignment() {
    console.log('[DailyQuestScheduler] Manual trigger - assigning new daily quests (both career and social)');
    return await this.assignNewDailyQuests();
  }

  public async triggerFullDailyProcess() {
    console.log('[DailyQuestScheduler] Manual trigger - full daily process');
    const expiredCount = await this.expirePreviousDayQuests();
    const assignmentResult = await this.assignNewDailyQuests();
    
    return {
      expiredQuests: expiredCount,
      successfulAssignments: assignmentResult.successCount,
      failedAssignments: assignmentResult.errorCount
    };
  }

  public getSchedulerStatus() {
    return {
      isActive: this.isSchedulerActive,
      nextRun: this.isSchedulerActive ? 'Daily at 12:01 AM UTC' : 'Not scheduled',
      description: 'Expires previous day quests and assigns new daily quests'
    };
  }

  /**
   * Add posting time recommendations to assigned quests
   */
  private async addPostingTimeRecommendations(user: any, quests: any[], questType: 'career' | 'social') {
    try {
      for (const quest of quests) {
        let recommendation;
        
        if (questType === 'career') {
          // Career quests post on Brandentifier
          recommendation = await recommendationService.getCareerQuestRecommendation(
            user.industry,
            user.domain
          );
          
          // Update the career quest with recommendations
          await db
            .update(userQuests)
            .set({
              recommendedPostTime: recommendation.recommendedPostTime,
              recommendationSource: recommendation.recommendationSource,
              confidenceScore: recommendation.confidenceScore
            })
            .where(eq(userQuests.id, quest.id));
            
        } else if (questType === 'social') {
          // Social quests - need to get the platform from quest definition
          const questDef = await db
            .select()
            .from(questDefinitions)
            .where(eq(questDefinitions.id, quest.questDefinitionId))
            .limit(1);
          
          const platform = questDef[0]?.platform || 'linkedin'; // Default to LinkedIn
          
          recommendation = await recommendationService.getSocialQuestRecommendation(
            platform,
            user.industry,
            user.domain
          );
          
          // Update the social quest with recommendations
          await db
            .update(generatedSocialQuests)
            .set({
              recommendedPostTime: recommendation.recommendedPostTime,
              recommendationSource: recommendation.recommendationSource,
              confidenceScore: recommendation.confidenceScore
            })
            .where(eq(generatedSocialQuests.id, quest.id));
        }
      }
      
      console.log(`[DailyQuestScheduler] Added posting time recommendations to ${quests.length} ${questType} quests for user ${user.id}`);
    } catch (error) {
      console.error(`[DailyQuestScheduler] Error adding posting time recommendations:`, error);
    }
  }

  /**
   * Get today's date in YYYY-MM-DD format for consistency
   */
  private getTodayDateString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  /**
   * Check if a quest is from today
   */
  private isQuestFromToday(assignedDate: Date): boolean {
    const today = new Date();
    const questDate = new Date(assignedDate);
    
    return (
      questDate.getUTCFullYear() === today.getUTCFullYear() &&
      questDate.getUTCMonth() === today.getUTCMonth() &&
      questDate.getUTCDate() === today.getUTCDate()
    );
  }
}

export const dailyQuestScheduler = new DailyQuestScheduler();