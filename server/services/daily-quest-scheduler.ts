import cron from 'node-cron';
import { storage } from '../storage';
import { db, sql } from '../db';
import { userQuests, generatedSocialQuests, generatedCareerQuests, questDefinitions, brandGoals, users } from '@shared/schema';
import { eq, and, lt, ne } from 'drizzle-orm';
import { recommendationService } from './recommendation-service';
import { smartQuestAllocator } from './smart-quest-allocator';
import { intelligentHashtagGenerator } from './intelligent-hashtag-generator';
import { comprehensiveQuestGenerator } from './comprehensive-quest-generator';
import { comprehensiveQuestGeneratorV2 } from './comprehensive-quest-generator-v2';
import { socialQuestGeneratorV2 } from './social-quest-generator-v2';
import { questGenerationEnhancer } from './quest-generation-enhancer';

class DailyQuestScheduler {
  private isSchedulerActive = false;
  private cronJob: any = null;
  private weeklyCronJob: any = null;

  private getCurrentDateString(): string {
    return new Date().toISOString().split('T')[0];
  }

  private async insertUserQuestWithFallback(input: {
    userId: number;
    questDefinitionId: number;
    assignedDate?: string;
    weekNumber: number;
    year: number;
    generatedQuestId?: number;
    generatedCareerQuestId?: number;
  }) {
    const scheduledDate = input.assignedDate || this.getCurrentDateString();
    
    // CRITICAL: Check for existing quest to prevent duplicates
    const existingQuest = await db
      .select()
      .from(userQuests)
      .where(and(
        eq(userQuests.userId, input.userId),
        eq(userQuests.questDefinitionId, input.questDefinitionId),
        eq(userQuests.scheduledDate, scheduledDate)
      ))
      .limit(1);

    if (existingQuest.length > 0) {
      console.log(`[Quest Insert] ⏭️ Skipping duplicate quest - User ${input.userId}, Quest ${input.questDefinitionId}, Date ${scheduledDate}`);
      return existingQuest[0]; // Return existing quest instead of creating duplicate
    }

    const values = {
      userId: input.userId,
      questDefinitionId: input.questDefinitionId,
      generatedQuestId: input.generatedQuestId,
      generatedCareerQuestId: input.generatedCareerQuestId,
      status: 'active' as const,
      progress: 0,
      assignedAt: new Date(),
      assignedDate: input.assignedDate || scheduledDate,
      scheduledDate,
      weekNumber: input.weekNumber,
      year: input.year,
    };

    console.log('[Quest Insert]', {
      userId: input.userId,
      questId: input.questDefinitionId,
      scheduled_date: scheduledDate,
    });

    try {
      const [inserted] = await db.insert(userQuests).values(values).returning();
      return inserted;
    } catch (insertError) {
      const fallbackDate = this.getCurrentDateString();
      console.error(
        `[DailyQuestScheduler] ❌ Quest insert failed for user ${input.userId}, quest ${input.questDefinitionId}. Retrying with CURRENT_DATE...`,
        insertError
      );

      console.log('[Quest Insert]', {
        userId: input.userId,
        questId: input.questDefinitionId,
        scheduled_date: fallbackDate,
      });

      const [inserted] = await db.insert(userQuests).values({
        ...values,
        assignedDate: fallbackDate,
        scheduledDate: fallbackDate,
      }).returning();
      return inserted;
    }
  }

  // Schedule to run every day at 12:01 AM UTC to handle quest expiration
  public startScheduler() {
    if (this.isSchedulerActive) {
      console.log('[DailyQuestScheduler] Scheduler already running');
      return;
    }

    // Schedule: Every day at 12:01 AM (1 0 * * *)
    this.cronJob = cron.schedule('1 0 * * *', async () => {
      console.log('[DailyQuestScheduler] 🕛 Starting daily quest assignment at 12:01 AM UTC...');
      // CRITICAL FIX: Assign new quests BEFORE expiring old ones to prevent empty quest state
      await this.assignNewDailyQuests();
      await this.expirePreviousDayQuests();
    }, {
      timezone: 'UTC'
    });

    // Schedule: Every Monday at 12:00 AM UTC (0 0 * * 1)
    this.weeklyCronJob = cron.schedule('0 0 * * 1', async () => {
      console.log('[DailyQuestScheduler] 📅 Starting weekly quest generation at Monday 12:00 AM UTC...');
      await this.generateWeeklyQuestsForAllUsers();
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
    if (this.weeklyCronJob) {
      this.weeklyCronJob.stop();
      this.weeklyCronJob = null;
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
            
            // AUTO-FIX: If user has quests but next_quest_assignment_time is stuck in the past, push it to tomorrow
            const now = new Date();
            if (user.nextQuestAssignmentTime && new Date(user.nextQuestAssignmentTime) < now) {
              console.log(`[DailyQuestScheduler] 🔧 AUTO-FIX: User ${user.id} has quests today but stale timestamp. Pushing timestamp to tomorrow.`);
              const nextMidnight = new Date();
              nextMidnight.setUTCHours(24, 0, 1, 0); // Tomorrow 00:00:01 UTC
              
              // Use direct SQL for safety since types are being tricky
              await db.execute(sql`
                UPDATE users 
                SET next_quest_assignment_time = ${nextMidnight}
                WHERE id = ${user.id}
              `);
            }
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
          
        } catch (userError: any) {
          // Graceful handling of Neon paused errors - don't crash the entire scheduler
          const isNeonPaused = 
            userError.message?.includes("endpoint has been disabled") ||
            userError.message?.includes("Database temporarily unavailable") ||
            userError.message?.includes("endpoint is paused");
          
          if (isNeonPaused) {
            console.warn(`[DailyQuestScheduler] ⏸️  Database paused for user ${user.id} - skipping (will retry on next scheduled run)`);
            skippedCount++;
          } else {
            console.error(`[DailyQuestScheduler] ❌ Error assigning quests for user ${user.id}:`, userError);
            errorCount++;
          }
        }
      }

      console.log(`[DailyQuestScheduler] Daily assignment complete: ${successCount} success, ${skippedCount} skipped (already assigned or DB paused), ${errorCount} errors`);
      
      return { successCount, errorCount, skippedCount };
      
    } catch (error: any) {
      // Graceful handling for global scheduler errors
      const isNeonPaused = 
        error.message?.includes("endpoint has been disabled") ||
        error.message?.includes("Database temporarily unavailable") ||
        error.message?.includes("endpoint is paused");
      
      if (isNeonPaused) {
        console.warn('[DailyQuestScheduler] ⏸️  Database paused during quest assignment. Skipping this cycle - will retry on next scheduled run.');
        return { successCount: 0, errorCount: 0, skippedCount: 0 };
      } else {
        console.error('[DailyQuestScheduler] ❌ Fatal error in daily assignment:', error);
        return { successCount: 0, errorCount: 1, skippedCount: 0 };
      }
    }
  }

  // Manual trigger for testing
  public async triggerDailyExpiration() {
    console.log('[DailyQuestScheduler] Manual trigger - expiring previous day quests');
    return await this.expirePreviousDayQuests();
  }

  /**
   * Mark all missed active quests from prior days as expired.
   * Exposed as a public method so routes/recovery flows can trigger it safely.
   */
  public async markMissedQuests() {
    return await this.expirePreviousDayQuests();
  }

  public async triggerDailyAssignment() {
    console.log('[DailyQuestScheduler] Manual trigger - assigning new daily quests (both career and social)');
    return await this.assignNewDailyQuests();
  }

  public async triggerWeeklyAssignmentForUser(userId: number, options: { force?: boolean; targetWeeklyQuests?: number } = {}) {
    console.log(`[DailyQuestScheduler] Manual weekly assignment for user ${userId}${options.force ? ' [FORCE]' : ''}`);
    return await this.generateWeeklyQuestsForUser(userId, options);
  }

  public async generateWeeklyQuestsForAllUsers(options: { force?: boolean; targetWeeklyQuests?: number } = {}) {
    console.log('[DailyQuestScheduler] Starting weekly quest generation for all users...');

    try {
      const allUsers = await storage.getAllUsers();
      let successCount = 0;
      let skippedCount = 0;
      let errorCount = 0;
      let totalGenerated = 0;

      for (const user of allUsers) {
        try {
          const quests = await this.generateWeeklyQuestsForUser(user.id, options);
          if (quests.length > 0) {
            successCount++;
            totalGenerated += quests.length;
          } else {
            skippedCount++;
          }
        } catch (error) {
          errorCount++;
          console.error(`[DailyQuestScheduler] Failed weekly generation for user ${user.id}:`, error);
        }
      }

      console.log(`[DailyQuestScheduler] Weekly generation complete: ${successCount} users updated, ${skippedCount} skipped, ${errorCount} failed, ${totalGenerated} quests created`);
      return { successCount, skippedCount, errorCount, totalGenerated };
    } catch (error) {
      console.error('[DailyQuestScheduler] Fatal weekly generation error:', error);
      return { successCount: 0, skippedCount: 0, errorCount: 1, totalGenerated: 0 };
    }
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

  private isLikelySocialQuest(quest: any): boolean {
    const questCategory = (quest.questCategory || '').toLowerCase();
    const type = (quest.type || '').toLowerCase();
    const platform = (quest.platform || '').toLowerCase();

    if (questCategory === 'social') return true;
    if (type === 'social_quest' || type === 'social_post') return true;
    if (['linkedin', 'instagram', 'twitter', 'x', 'youtube', 'facebook', 'tiktok', 'threads'].includes(platform)) {
      return true;
    }

    return false;
  }

  private getRemainingWeekDates(timezone: string, now = new Date()): string[] {
    const { todayDateString } = this.getQuestDateContext(timezone, now);
    const today = new Date(`${todayDateString}T00:00:00.000Z`);
    const dayOfWeek = today.getUTCDay(); // 0 Sunday ... 6 Saturday
    const daysUntilSunday = (7 - dayOfWeek) % 7;

    const dates: string[] = [];
    for (let i = 0; i <= daysUntilSunday; i++) {
      const date = new Date(today);
      date.setUTCDate(today.getUTCDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  }

  private async generateWeeklyQuestsForUser(userId: number, options: { force?: boolean; targetWeeklyQuests?: number } = {}) {
    const [userProfile] = await db.select().from(users).where(eq(users.id, userId));
    if (!userProfile) {
      return [];
    }

    const timezone = userProfile.timezone || 'UTC';
    const weekDates = this.getRemainingWeekDates(timezone);
    if (weekDates.length === 0) {
      return [];
    }

    const firstDay = new Date(`${weekDates[0]}T00:00:00.000Z`);
    const weekNumber = this.getWeekNumber(firstDay);
    const year = firstDay.getUTCFullYear();

    if (!options.force) {
      const existingWeek = await db
        .select({ id: userQuests.id })
        .from(userQuests)
        .where(and(
          eq(userQuests.userId, userId),
          eq(userQuests.weekNumber, weekNumber),
          eq(userQuests.year, year)
        ));

      if (existingWeek.length > 0) {
        console.log(`[DailyQuestScheduler] Weekly quests already exist for user ${userId} week ${weekNumber}/${year}`);
        return [];
      }
    }

    const targetWeekly = options.targetWeeklyQuests ?? 8;
    const proportionalTarget = Math.round((targetWeekly * weekDates.length) / 7);
    const totalQuests = Math.max(weekDates.length, Math.min(weekDates.length * 2, proportionalTarget));

    const [last7DaysResult, sameWeekResult, activeDefs] = await Promise.all([
      db.execute(sql`
        SELECT DISTINCT quest_definition_id
        FROM user_quests
        WHERE user_id = ${userId}
          AND assigned_date >= (CURRENT_DATE - INTERVAL '7 days')
      `),
      db.execute(sql`
        SELECT DISTINCT quest_definition_id
        FROM user_quests
        WHERE user_id = ${userId}
          AND week_number = ${weekNumber}
          AND year = ${year}
      `),
      db
        .select({
          id: questDefinitions.id,
          type: questDefinitions.type,
          platform: questDefinitions.platform,
          questCategory: questDefinitions.questCategory,
        })
        .from(questDefinitions)
        .where(eq(questDefinitions.isActive, true))
    ]);

    const blockedQuestIds = new Set<number>([
      ...last7DaysResult.rows.map((row: any) => Number(row.quest_definition_id)),
      ...sameWeekResult.rows.map((row: any) => Number(row.quest_definition_id))
    ]);

    const available = activeDefs.filter((q) => !blockedQuestIds.has(q.id));
    if (available.length === 0) {
      console.log(`[DailyQuestScheduler] No eligible weekly quests for user ${userId}`);
      return [];
    }

    const socialPool = available.filter((q) => this.isLikelySocialQuest(q));
    const careerPool = available.filter((q) => !this.isLikelySocialQuest(q));

    let careerTarget = Math.round(totalQuests * 0.6);
    let socialTarget = totalQuests - careerTarget;

    if (totalQuests >= 2) {
      if (careerPool.length > 0) {
        careerTarget = Math.max(careerTarget, 1);
      }
      if (socialPool.length > 0) {
        socialTarget = Math.max(socialTarget, 1);
      }
      if (careerTarget + socialTarget > totalQuests) {
        if (careerTarget > socialTarget) {
          careerTarget--;
        } else {
          socialTarget--;
        }
      }
    }

    const pickRandom = (pool: typeof available, count: number) => {
      const copy = [...pool];
      const picked: typeof available = [];
      while (picked.length < count && copy.length > 0) {
        const index = Math.floor(Math.random() * copy.length);
        picked.push(copy[index]);
        copy.splice(index, 1);
      }
      return picked;
    };

    const selectedCareer = pickRandom(careerPool, careerTarget);
    const selectedSocial = pickRandom(socialPool, socialTarget);
    let selected = [...selectedCareer, ...selectedSocial];

    if (selected.length < totalQuests) {
      const selectedIds = new Set(selected.map((q) => q.id));
      const fallbackPool = available.filter((q) => !selectedIds.has(q.id));
      selected = [...selected, ...pickRandom(fallbackPool, totalQuests - selected.length)];
    }

    if (selected.length === 0) {
      return [];
    }

    const dailyTargets = Array.from({ length: weekDates.length }, () => 1);
    let remaining = selected.length - weekDates.length;
    let dayIndex = 0;
    while (remaining > 0) {
      if (dailyTargets[dayIndex] < 2) {
        dailyTargets[dayIndex] += 1;
        remaining--;
      }
      dayIndex = (dayIndex + 1) % dailyTargets.length;
    }

    // Shuffle for better category spread across weekdays.
    selected.sort(() => Math.random() - 0.5);

    const createdQuests: any[] = [];
    let cursor = 0;

    for (let i = 0; i < weekDates.length; i++) {
      const dateString = weekDates[i];
      const dateObj = new Date(`${dateString}T00:00:00.000Z`);
      const dayWeek = this.getWeekNumber(dateObj);
      const dayYear = dateObj.getUTCFullYear();

      for (let j = 0; j < dailyTargets[i] && cursor < selected.length; j++) {
        const questDef = selected[cursor++];
        const inserted = await this.insertUserQuestWithFallback({
          userId,
          questDefinitionId: questDef.id,
          assignedDate: dateString,
          weekNumber: dayWeek,
          year: dayYear,
        });

        createdQuests.push(inserted);
      }
    }

    console.log(`[DailyQuestScheduler] Generated ${createdQuests.length} weekly quests for user ${userId} across ${weekDates.length} remaining days`);
    return createdQuests;
  }
  
  /**
   * Trigger daily quest assignment for a specific user (V2 generator)
   * Used by manual API endpoints
   */
  public async triggerDailyAssignmentForUser(userId: number, options: { force?: boolean } = {}) {
    console.log(`[QuestScheduler] Running daily quest generation for user ${userId}${options.force ? ' [FORCE]' : ''}`);
    console.log(`[DailyQuestScheduler] Manual assignment for user ${userId} using V2 generator${options.force ? ' [FORCE]' : ''}`);
    
    // Get user profile and brand goals
    const [userProfile] = await db.select().from(users).where(eq(users.id, userId));
    const [userBrandGoals] = await db.select().from(brandGoals).where(eq(brandGoals.userId, userId));
    
    if (!userProfile) {
      throw new Error(`User ${userId} not found`);
    }

    const questDateContext = this.getQuestDateContext(userProfile.timezone || 'UTC');

    // Duplicate safety: never generate again if today's quests already exist.
    const existingTodayQuests = await db
      .select({ id: userQuests.id })
      .from(userQuests)
      .where(and(
        eq(userQuests.userId, userId),
        eq(userQuests.assignedDate, questDateContext.todayDateString)
      ));

    if (existingTodayQuests.length > 0) {
      console.log(`[DailyQuestScheduler] ⏭️ User ${userId} already has ${existingTodayQuests.length} quests for ${questDateContext.todayDateString}; skipping`);
      return [];
    }
    
    // Use Smart Quest Allocator to determine optimal quest quantity (1-4)
    console.log(`[QuestAllocator] Assigning quests to user ${userId}`);
    const allocation = await smartQuestAllocator.allocateDailyQuests(userId, options);
    
    console.log(`[DailyQuestScheduler] 🎯 Allocation: ${allocation.totalQuests} quests (${allocation.careerQuests} career, ${allocation.socialQuests} social)`);
    
    // Assign quests using V2 generator
    const assignedQuests = await this.assignSelectedQuests(userId, allocation, questDateContext);
    
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
          // Career quests post on Brandentify
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
  private async assignSelectedQuests(
    userId: number,
    allocation: any,
    questDateContext: { todayDateString: string; currentWeek: number; currentYear: number }
  ): Promise<any[]> {
    const assignedQuests: any[] = [];
    const { todayDateString, currentWeek, currentYear } = questDateContext;

    // Fetch user profile and brand goals for variables_used metadata
    const [userProfile] = await db.select().from(users).where(eq(users.id, userId));
    const [userBrandGoals] = await db.select().from(brandGoals).where(eq(brandGoals.userId, userId));

    const cutoffDate = new Date();
    cutoffDate.setUTCDate(cutoffDate.getUTCDate() - 7);
    const cutoffDateString = cutoffDate.toISOString().split('T')[0];
    const recentResult = await db.execute(sql`
      SELECT DISTINCT quest_definition_id
      FROM user_quests
      WHERE user_id = ${userId} AND assigned_date >= ${cutoffDateString}
    `);
    const recentQuestIds = new Set(recentResult.rows.map((row: any) => row.quest_definition_id));

    const weeklyResult = await db.execute(sql`
      SELECT DISTINCT quest_definition_id
      FROM user_quests
      WHERE user_id = ${userId}
        AND week_number = ${currentWeek}
        AND year = ${currentYear}
    `);
    const sameWeekQuestIds = new Set(weeklyResult.rows.map((row: any) => row.quest_definition_id));

    try {
      for (const selectedQuest of allocation.selectedQuests) {
        if (recentQuestIds.has(selectedQuest.questDefinitionId)) {
          console.log(`[DailyQuestScheduler] ⏭️ Skipping quest ${selectedQuest.questDefinitionId} - assigned within last 7 days`);
          continue;
        }

        if (sameWeekQuestIds.has(selectedQuest.questDefinitionId)) {
          console.log(`[DailyQuestScheduler] ⏭️ Skipping quest ${selectedQuest.questDefinitionId} - already assigned in week ${currentWeek}/${currentYear}`);
          continue;
        }
        
        // If this is a career quest, generate detailed AI specifications using V2 generator
        if (selectedQuest.category === 'career') {
          console.log(`[DailyQuestScheduler] 🎯 Generating AI-detailed career quest (V2) for user ${userId}: ${selectedQuest.questType}`);
          
          let detailedQuest;
          let generationSource = 'unknown';
          
          try {
            // Use ENHANCED quest generation with robust fallback
            const genResult = await questGenerationEnhancer.generateCareerQuestWithFallback(
              userId,
              selectedQuest.questDefinitionId,
              userProfile,
              userBrandGoals?.selectedGoals || [],
              selectedQuest.questType
            );
            
            detailedQuest = questGenerationEnhancer.ensureQuestDetail(genResult.quest);
            generationSource = genResult.source;
            
            // SMART FILTERING: Skip if quest returned null (field already satisfied)
            if (!detailedQuest) {
              console.log(`[DailyQuestScheduler] ⏭️ Skipping quest ${selectedQuest.questType} - profile field already satisfied (filled and aligned with brand goals)`);
              continue; // Move to next quest in allocation
            }
            
            if (generationSource === 'ai') {
              console.log(`[DailyQuestScheduler] ✅ AI Generated: "${detailedQuest.title}"`);
            } else {
              console.log(`[DailyQuestScheduler] ✅ Fallback Generated: "${detailedQuest.title}"`);
            }
            console.log(`[QuestGenerator] Generated 1 quest for user ${userId}`);
            console.log(`[DailyQuestScheduler] 📋 Deliverable: ${detailedQuest.deliverableFormat}`);
            console.log(`[DailyQuestScheduler] ⏱️ Time: ${detailedQuest.estimatedTimeMinutes} min`);
          
          } catch (generateError) {
            console.error(`[DailyQuestScheduler] ⚠️ Career generation failed, using simple fallback:`, generateError);
            // Fallback to standard quest assignment
            const quest = await this.insertUserQuestWithFallback({
              userId,
              questDefinitionId: selectedQuest.questDefinitionId,
              assignedDate: todayDateString,
              weekNumber: currentWeek,
              year: currentYear,
            });
            
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
          
          // Insert into userQuests (standard quest tracking) - LINK to generated career quest
          const quest = await this.insertUserQuestWithFallback({
            userId,
            questDefinitionId: selectedQuest.questDefinitionId,
            generatedCareerQuestId: generatedCareerQuest.id,
            assignedDate: todayDateString,
            weekNumber: currentWeek,
            year: currentYear,
          });
          
          assignedQuests.push({
            ...quest,
            category: selectedQuest.category,
            questType: selectedQuest.questType,
            generatedCareerQuestId: generatedCareerQuest.id
          });
          recentQuestIds.add(selectedQuest.questDefinitionId);
          sameWeekQuestIds.add(selectedQuest.questDefinitionId);
          
        } else {
          // Social quest - use ENHANCED V2 AI generator with robust fallback
          console.log(`[DailyQuestScheduler] 🎯 Generating AI-detailed social quest (V2) for user ${userId}: ${selectedQuest.questType}`);
          
          // Get platform from quest definition
          const [questDefForPlatform] = await db
            .select()
            .from(questDefinitions)
            .where(eq(questDefinitions.id, selectedQuest.questDefinitionId))
            .limit(1);
          
          const platform = questDefForPlatform?.platform || 'LinkedIn';
          
          let detailedSocialQuest;
          let generationSource = 'unknown';
          
          try {
            // Use ENHANCED social quest generation with fallback
            const genResult = await questGenerationEnhancer.generateSocialQuestWithFallback(
              userId,
              selectedQuest.questDefinitionId,
              platform
            );
            
            detailedSocialQuest = questGenerationEnhancer.ensureQuestDetail(genResult.quest);
            generationSource = genResult.source;
            
            if (generationSource === 'ai') {
              console.log(`[DailyQuestScheduler] ✅ AI Generated social: "${detailedSocialQuest.personalizedTitle || detailedSocialQuest.title}" for ${platform}`);
            } else {
              console.log(`[DailyQuestScheduler] ✅ Fallback Generated social: "${detailedSocialQuest.personalizedTitle || detailedSocialQuest.title}" for ${platform}`);
            }
            console.log(`[QuestGenerator] Generated 1 quest for user ${userId}`);
            
          } catch (generateError) {
            console.error(`[DailyQuestScheduler] ⚠️ Social generation failed, using simple fallback:`, generateError);
            // Fallback to standard quest assignment
            const quest = await this.insertUserQuestWithFallback({
              userId,
              questDefinitionId: selectedQuest.questDefinitionId,
              assignedDate: todayDateString,
              weekNumber: currentWeek,
              year: currentYear,
            });
            
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
          
          // Insert into userQuests (standard quest tracking) - LINK to generated social quest
          const quest = await this.insertUserQuestWithFallback({
            userId,
            questDefinitionId: selectedQuest.questDefinitionId,
            generatedQuestId: generatedSocialQuest.id,
            assignedDate: todayDateString,
            weekNumber: currentWeek,
            year: currentYear,
          });
          
          assignedQuests.push({
            ...quest,
            category: selectedQuest.category,
            questType: selectedQuest.questType,
            generatedSocialQuestId: generatedSocialQuest.id
          });
          recentQuestIds.add(selectedQuest.questDefinitionId);
          sameWeekQuestIds.add(selectedQuest.questDefinitionId);
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

        // Determine platform (career quests use Brandentify, social quests have platform field)
        const platform = quest.category === 'social' ? (questDef.platform || 'LinkedIn') : 'Brandentify';
        
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

  private getQuestDateContext(timezone: string, now = new Date()) {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });

    const parts = formatter.formatToParts(now);
    const year = parts.find(part => part.type === 'year')?.value;
    const month = parts.find(part => part.type === 'month')?.value;
    const day = parts.find(part => part.type === 'day')?.value;

    if (!year || !month || !day) {
      const fallbackDate = this.getTodayDateString();
      return {
        todayDateString: fallbackDate,
        currentWeek: this.getWeekNumber(new Date(`${fallbackDate}T00:00:00.000Z`)),
        currentYear: new Date().getUTCFullYear()
      };
    }

    const todayDateString = `${year}-${month}-${day}`;
    const localDate = new Date(`${todayDateString}T00:00:00.000Z`);

    return {
      todayDateString,
      currentWeek: this.getWeekNumber(localDate),
      currentYear: Number(year)
    };
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
