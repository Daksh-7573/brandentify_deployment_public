import cron from 'node-cron';
import { storage } from '../storage';
import { db } from '../db';
import { userQuests, generatedSocialQuests, generatedCareerQuests, questDefinitions, brandGoals, users } from '@shared/schema';
import { eq, and, lt, ne } from 'drizzle-orm';
import { recommendationService } from './recommendation-service';
import { smartQuestAllocator } from './smart-quest-allocator';
import { intelligentHashtagGenerator } from './intelligent-hashtag-generator';
import { comprehensiveQuestGenerator } from './comprehensive-quest-generator';
import { comprehensiveQuestGeneratorV2 } from './comprehensive-quest-generator-v2';
import { socialQuestGeneratorV2 } from './social-quest-generator-v2';

class DailyQuestScheduler {
  private isSchedulerActive = false;
  private cronJob: cron.ScheduledTask | null = null;

  // Schedule to run every day at 12:01 AM UTC to handle quest expiration
  public startScheduler() {
    if (this.isSchedulerActive) {
      console.log('[DailyQuestScheduler] Scheduler already running');
      return;
    }

    // Schedule: Every day at 12:01 AM (1 0 * * *)
    this.cronJob = cron.schedule('1 0 * * *', async () => {
      console.log('[DailyQuestScheduler] 🕛 Starting daily quest expiration check at 12:01 AM UTC...');
      await this.expirePreviousDayQuests();
      await this.assignNewDailyQuests();
    }, {
      timezone: 'UTC'
    });

    this.isSchedulerActive = true;
    console.log('[DailyQuestScheduler] ✅ Daily 12:01 AM UTC cron job activated');
  }

  public stopScheduler() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }
    this.isSchedulerActive = false;
    console.log('[DailyQuestScheduler] Scheduler stopped and cron job destroyed');
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
      let skippedCount = 0;

      for (const user of users) {
        try {
          // CRITICAL: Check if user already has quests assigned today
          const todayDateString = this.getTodayDateString();
          const existingTodayQuests = await db
            .select()
            .from(userQuests)
            .where(and(
              eq(userQuests.userId, user.id),
              eq(userQuests.assignedDate, todayDateString)
            ));
          
          if (existingTodayQuests.length > 0) {
            console.log(`[DailyQuestScheduler] ⏭️ Skipping user ${user.id} (${user.name}) - already has ${existingTodayQuests.length} quests assigned today`);
            skippedCount++;
            continue;
          }
          
          console.log(`[DailyQuestScheduler] Assigning daily quests for user ${user.id} (${user.name})`);
          
          // Use Smart Quest Allocator to determine optimal quest quantity (1-4)
          const allocation = await smartQuestAllocator.allocateDailyQuests(user.id);
          
          console.log(`[DailyQuestScheduler] 🎯 Smart Allocation: ${allocation.totalQuests} quests (${allocation.careerQuests} career, ${allocation.socialQuests} social) - Strategy: ${allocation.allocationStrategy}`);
          
          // Assign quests based on smart allocation
          const assignedQuests = await this.assignSelectedQuests(user.id, allocation);
          
          // Add posting time recommendations and intelligent hashtags
          if (assignedQuests.length > 0) {
            await this.enhanceQuestsWithRecommendations(user, assignedQuests);
          }
          
          console.log(`[DailyQuestScheduler] ✅ Assigned ${assignedQuests.length} total quests for ${user.name}`);
          
          successCount++;
          
        } catch (userError) {
          console.error(`[DailyQuestScheduler] ❌ Error assigning quests for user ${user.id}:`, userError);
          errorCount++;
        }
      }

      console.log(`[DailyQuestScheduler] Daily assignment complete: ${successCount} success, ${skippedCount} skipped (already assigned), ${errorCount} errors`);
      
      return { successCount, errorCount, skippedCount };
      
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
  
  /**
   * Trigger daily quest assignment for a specific user (V2 generator)
   * Used by manual API endpoints
   */
  public async triggerDailyAssignmentForUser(userId: number) {
    console.log(`[DailyQuestScheduler] Manual assignment for user ${userId} using V2 generator`);
    
    // Get user profile and brand goals
    const [userProfile] = await db.select().from(users).where(eq(users.id, userId));
    const [userBrandGoals] = await db.select().from(brandGoals).where(eq(brandGoals.userId, userId));
    
    if (!userProfile) {
      throw new Error(`User ${userId} not found`);
    }
    
    // Use Smart Quest Allocator to determine optimal quest quantity (1-4)
    const allocation = await smartQuestAllocator.allocateDailyQuests(userId);
    
    console.log(`[DailyQuestScheduler] 🎯 Allocation: ${allocation.totalQuests} quests (${allocation.careerQuests} career, ${allocation.socialQuests} social)`);
    
    // Assign quests using V2 generator
    const assignedQuests = await this.assignSelectedQuests(userId, allocation);
    
    // Add posting time recommendations
    if (assignedQuests.length > 0) {
      await this.enhanceQuestsWithRecommendations(userProfile, assignedQuests);
    }
    
    console.log(`[DailyQuestScheduler] ✅ Assigned ${assignedQuests.length} quests to user ${userId}`);
    return assignedQuests;
  }

  public getSchedulerStatus() {
    return {
      isActive: this.isSchedulerActive,
      hasCronJob: this.cronJob !== null,
      nextRun: this.isSchedulerActive ? 'Daily at 12:01 AM UTC' : 'Not scheduled',
      description: 'Expires previous day quests and assigns new daily quests',
      scheduledTime: '12:01 AM UTC'
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
   * Assign selected quests from smart allocator
   * For career quests: Generate fully detailed AI specifications using comprehensiveQuestGenerator
   * For social quests: Use existing template-based generation
   */
  private async assignSelectedQuests(userId: number, allocation: any): Promise<any[]> {
    const assignedQuests: any[] = [];
    const todayDateString = this.getTodayDateString();
    const currentWeek = this.getWeekNumber(new Date());
    const currentYear = new Date().getFullYear();

    // Fetch user profile and brand goals for variables_used metadata
    const [userProfile] = await db.select().from(users).where(eq(users.id, userId));
    const [userBrandGoals] = await db.select().from(brandGoals).where(eq(brandGoals.userId, userId));

    try {
      for (const selectedQuest of allocation.selectedQuests) {
        
        // If this is a career quest, generate detailed AI specifications using V2 generator
        if (selectedQuest.category === 'career') {
          console.log(`[DailyQuestScheduler] 🎯 Generating AI-detailed career quest (V2) for user ${userId}: ${selectedQuest.questType}`);
          
          let detailedQuest;
          
          try {
            // Generate REAL, achievable quest using V2 generator
            detailedQuest = await comprehensiveQuestGeneratorV2.generatePersonalizedQuest(
              userId,
              selectedQuest.questDefinitionId,
              userProfile,
              userBrandGoals?.selectedGoals || []
            );
            
            console.log(`[DailyQuestScheduler] ✅ V2 Generated: "${detailedQuest.title}"`);
            console.log(`[DailyQuestScheduler] 📋 Platform Activity: ${detailedQuest.platformConstraints}`);
            console.log(`[DailyQuestScheduler] ⏱️ Time: ${detailedQuest.estimatedTimeMinutes} min`);
          
          } catch (generateError) {
            console.error(`[DailyQuestScheduler] ⚠️ V2 generation failed, falling back to standard assignment:`, generateError);
            // Fallback to standard quest assignment
            const [quest] = await db
              .insert(userQuests)
              .values({
                userId,
                questDefinitionId: selectedQuest.questDefinitionId,
                status: 'active',
                progress: 0,
                assignedAt: new Date(),
                assignedDate: todayDateString,
                weekNumber: currentWeek,
                year: currentYear
              })
              .returning();
            
            assignedQuests.push({
              ...quest,
              category: selectedQuest.category,
              questType: selectedQuest.questType
            });
            continue;
          }
          
          // Prepare variables_used metadata (IMPORTANT: jsonb expects object, not JSON string!)
          const variablesUsed = {
            user_name: userProfile?.name || 'Professional',
            user_industry: userProfile?.industry || 'Technology',
            user_domain: userProfile?.domain || 'General',
            user_location: userProfile?.location || 'Global',
            primary_audience: userProfile?.primaryAudience || ['professionals'],
            brand_goals: userBrandGoals?.selectedGoals || []
          };
          
          // Insert the detailed quest specifications into generatedCareerQuests
          const [generatedCareerQuest] = await db
            .insert(generatedCareerQuests)
            .values({
              userId,
              questDefinitionId: selectedQuest.questDefinitionId,
              questType: detailedQuest.type,
              variablesUsed, // Pass object directly for jsonb type
              personalizedTitle: detailedQuest.title,
              personalizedDescription: detailedQuest.description,
              deliverableFormat: detailedQuest.deliverableFormat,
              quantityValue: detailedQuest.quantityValue,
              quantityType: detailedQuest.quantityType,
              platformConstraints: detailedQuest.platformConstraints,
              guidanceSnippet: detailedQuest.guidanceSnippet,
              personalizedMuskTip: detailedQuest.muskTip,
              estimatedTimeMinutes: detailedQuest.estimatedTimeMinutes,
              difficultyLevel: detailedQuest.difficultyLevel,
              assignedDate: todayDateString,
              assignedAt: new Date(),
              status: 'active'
            })
            .returning();
          
          console.log(`[DailyQuestScheduler] ✅ Generated detailed career quest ${generatedCareerQuest.id}: "${detailedQuest.title}"`);
          console.log(`[DailyQuestScheduler] 📋 Deliverable: ${detailedQuest.deliverableFormat}`);
          console.log(`[DailyQuestScheduler] ⏱️ Time: ${detailedQuest.estimatedTimeMinutes} min`);
          
          // Insert into userQuests (standard quest tracking)
          const [quest] = await db
            .insert(userQuests)
            .values({
              userId,
              questDefinitionId: selectedQuest.questDefinitionId,
              status: 'active',
              progress: 0,
              assignedAt: new Date(),
              assignedDate: todayDateString,
              weekNumber: currentWeek,
              year: currentYear
            })
            .returning();
          
          assignedQuests.push({
            ...quest,
            category: selectedQuest.category,
            questType: selectedQuest.questType,
            generatedCareerQuestId: generatedCareerQuest.id
          });
          
        } else {
          // Social quest - use V2 AI generator for platform-specific content
          console.log(`[DailyQuestScheduler] 🎯 Generating AI-detailed social quest (V2) for user ${userId}: ${selectedQuest.questType}`);
          
          // Get platform from quest definition
          const [questDefForPlatform] = await db
            .select()
            .from(questDefinitions)
            .where(eq(questDefinitions.id, selectedQuest.questDefinitionId))
            .limit(1);
          
          const platform = questDefForPlatform?.platform || 'LinkedIn';
          
          let detailedSocialQuest;
          
          try {
            // Generate AI-powered social quest using V2 generator
            detailedSocialQuest = await socialQuestGeneratorV2.generateSocialQuest(
              userId,
              selectedQuest.questDefinitionId,
              platform
            );
            
            console.log(`[DailyQuestScheduler] ✅ V2 Generated social: "${detailedSocialQuest.personalizedTitle}" for ${platform}`);
            
          } catch (generateError) {
            console.error(`[DailyQuestScheduler] ⚠️ Social V2 generation failed, falling back:`, generateError);
            // Fallback to standard quest assignment
            const [quest] = await db
              .insert(userQuests)
              .values({
                userId,
                questDefinitionId: selectedQuest.questDefinitionId,
                status: 'active',
                progress: 0,
                assignedAt: new Date(),
                assignedDate: todayDateString,
                weekNumber: currentWeek,
                year: currentYear
              })
              .returning();
            
            assignedQuests.push({
              ...quest,
              category: selectedQuest.category,
              questType: selectedQuest.questType
            });
            continue;
          }
          
          // Insert the detailed quest specifications into generatedSocialQuests
          const [generatedSocialQuest] = await db
            .insert(generatedSocialQuests)
            .values({
              userId,
              templateId: detailedSocialQuest.templateId,
              questDefinitionId: selectedQuest.questDefinitionId,
              variablesUsed: detailedSocialQuest.variablesUsed,
              personalizedTitle: detailedSocialQuest.personalizedTitle,
              personalizedDescription: detailedSocialQuest.personalizedDescription,
              personalizedMuskTip: detailedSocialQuest.personalizedMuskTip,
              assignedDate: todayDateString,
              assignedAt: new Date(),
              status: 'active'
            })
            .returning();
          
          console.log(`[DailyQuestScheduler] ✅ Generated detailed social quest ${generatedSocialQuest.id}: "${detailedSocialQuest.personalizedTitle}" for ${platform}`);
          
          // Insert into userQuests (standard quest tracking)
          const [quest] = await db
            .insert(userQuests)
            .values({
              userId,
              questDefinitionId: selectedQuest.questDefinitionId,
              status: 'active',
              progress: 0,
              assignedAt: new Date(),
              assignedDate: todayDateString,
              weekNumber: currentWeek,
              year: currentYear
            })
            .returning();
          
          assignedQuests.push({
            ...quest,
            category: selectedQuest.category,
            questType: selectedQuest.questType,
            generatedSocialQuestId: generatedSocialQuest.id
          });
        }
      }

      console.log(`[DailyQuestScheduler] Successfully assigned ${assignedQuests.length} quests for user ${userId}`);
      return assignedQuests;
      
    } catch (error) {
      console.error('[DailyQuestScheduler] Error assigning selected quests:', error);
      return assignedQuests;
    }
  }

  /**
   * Enhance quests with posting time recommendations and intelligent hashtags
   */
  private async enhanceQuestsWithRecommendations(user: any, quests: any[]): Promise<void> {
    try {
      // Fetch user's brand goals once for all quests
      const [userBrandGoals] = await db
        .select()
        .from(brandGoals)
        .where(eq(brandGoals.userId, user.id))
        .limit(1);
      
      const userGoals = userBrandGoals?.selectedGoals || [];
      
      for (const quest of quests) {
        // Get quest definition for details
        const [questDef] = await db
          .select()
          .from(questDefinitions)
          .where(eq(questDefinitions.id, quest.questDefinitionId))
          .limit(1);

        if (!questDef) continue;

        // Determine platform (career quests use Brandentifier, social quests have platform field)
        const platform = quest.category === 'social' ? (questDef.platform || 'LinkedIn') : 'Brandentifier';
        
        // Get posting time recommendation
        const recommendation = quest.category === 'career'
          ? await recommendationService.getCareerQuestRecommendation(user.industry, user.domain)
          : await recommendationService.getSocialQuestRecommendation(platform, user.industry, user.domain);

        // Generate intelligent hashtags with user's actual brand goals
        const hashtagResult = await intelligentHashtagGenerator.generateIntelligentHashtags({
          userId: user.id,
          platform,
          contentType: questDef.type || 'post',
          questType: quest.questType || questDef.targetAction || 'default',
          userGoals: userGoals // Pass actual brand goals from database
        });

        // Update quest with recommendations and hashtags
        await db
          .update(userQuests)
          .set({
            recommendedPostTime: recommendation.recommendedPostTime,
            recommendationSource: recommendation.recommendationSource,
            confidenceScore: recommendation.confidenceScore,
            suggestedHashtags: hashtagResult.hashtags,
            hashtagContext: hashtagResult.context
          })
          .where(eq(userQuests.id, quest.id));

        console.log(`[DailyQuestScheduler] Enhanced quest ${quest.id}: Time: ${recommendation.recommendedPostTime}, Hashtags: ${hashtagResult.hashtags.join(', ')}`);
      }
    } catch (error) {
      console.error('[DailyQuestScheduler] Error enhancing quests:', error);
    }
  }

  /**
   * Get week number for quest tracking
   */
  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
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