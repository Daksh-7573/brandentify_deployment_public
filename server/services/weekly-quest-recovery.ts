import { db, sql } from '../db';
import { userQuests, questDefinitions, users } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { storage } from '../storage';

class WeeklyQuestRecovery {
  private getCurrentDateString(): string {
    return new Date().toISOString().split('T')[0];
  }

  private async insertUserQuestWithFallback(input: {
    userId: number;
    questDefinitionId: number;
    assignedDate: string;
    weekNumber: number;
    year: number;
  }): Promise<boolean> {
    const scheduledDate = input.assignedDate || this.getCurrentDateString();
    console.log('[Quest Insert]', {
      userId: input.userId,
      questId: input.questDefinitionId,
      scheduled_date: scheduledDate,
    });

    try {
      await db.insert(userQuests).values({
        userId: input.userId,
        questDefinitionId: input.questDefinitionId,
        status: 'active',
        progress: 0,
        assignedAt: new Date(),
        assignedDate: input.assignedDate,
        scheduledDate,
        weekNumber: input.weekNumber,
        year: input.year,
      });
      return true;
    } catch (insertError) {
      const fallbackDate = this.getCurrentDateString();
      console.error(
        `[WeeklyRecovery] ❌ Failed to insert quest ${input.questDefinitionId} for user ${input.userId}. Retrying with CURRENT_DATE...`,
        insertError
      );
      try {
        console.log('[Quest Insert]', {
          userId: input.userId,
          questId: input.questDefinitionId,
          scheduled_date: fallbackDate,
        });
        await db.insert(userQuests).values({
          userId: input.userId,
          questDefinitionId: input.questDefinitionId,
          status: 'active',
          progress: 0,
          assignedAt: new Date(),
          assignedDate: fallbackDate,
          scheduledDate: fallbackDate,
          weekNumber: input.weekNumber,
          year: input.year,
        });
        return true;
      } catch (retryError) {
        console.error(
          `[WeeklyRecovery] ❌ Retry insert failed for quest ${input.questDefinitionId} user ${input.userId}:`,
          retryError
        );
        return false;
      }
    }
  }

  /**
   * Ensure all users have a full week (7 days) of quests
   * Smart logic: only generates missing days, never overwrites existing
   */
  public async ensureWeeklyQuestsForAllUsers(options: { dryRun?: boolean } = {}) {
    const dryRun = options.dryRun ?? false;
    console.log(`[WeeklyRecovery] 🔍 Ensuring weekly quests for all users${dryRun ? ' [DRY-RUN]' : ''}...`);

    try {
      const allUsers = await storage.getAllUsers();
      console.log(`[WeeklyRecovery] Found ${allUsers.length} users to check`);

      let usersChecked = 0;
      let usersWithMissingQuests = 0;
      let questsGenerated = 0;
      let usersAlreadyComplete = 0;

      for (const user of allUsers) {
        try {
          const result = await this.ensureWeeklyQuestsForUserInternal(user.id, dryRun);
          usersChecked++;

          if (result.generated > 0) {
            usersWithMissingQuests++;
            questsGenerated += result.generated;
          } else if (result.alreadyComplete) {
            usersAlreadyComplete++;
          }
        } catch (error) {
          console.error(`[WeeklyRecovery] ❌ Error checking user ${user.id}:`, error);
        }
      }

      const summary = {
        usersChecked,
        usersWithMissingQuests,
        usersAlreadyComplete,
        questsGenerated,
        dryRun,
        message: `Checked ${usersChecked} users: ${usersWithMissingQuests} had missing quests (generated ${questsGenerated}), ${usersAlreadyComplete} already complete`
      };

      console.log(
        `[WeeklyRecovery] ✅ Recovery complete: ${summary.message}`
      );
      return summary;
    } catch (error) {
      console.error('[WeeklyRecovery] ❌ Fatal error:', error);
      throw error;
    }
  }

  public async ensureWeeklyQuestsForUser(userId: number, options: { dryRun?: boolean } = {}) {
    return this.ensureWeeklyQuestsForUserInternal(userId, options.dryRun ?? false);
  }

  /**
   * Ensure a single user has full week (7 days) of quests
   * Cases:
   * 1. No quests at all → generate full 7 days
   * 2. Partial quests → generate only missing days
   * 3. Full week → do nothing
   */
  private async ensureWeeklyQuestsForUserInternal(
    userId: number,
    dryRun: boolean = false
  ): Promise<{ generated: number; alreadyComplete: boolean }> {
    const weekDates = this.getCurrentWeekDates();
    const weekStart = new Date(`${weekDates[0]}T00:00:00.000Z`);
    const currentWeekNumber = this.getWeekNumber(weekStart);
    const currentYear = weekStart.getUTCFullYear();

    // Get all quests for this user in current week
    const [userProfile] = await db.select().from(users).where(eq(users.id, userId));
    if (!userProfile) {
      console.warn(`[WeeklyRecovery] User ${userId} not found`);
      return { generated: 0, alreadyComplete: false };
    }

    const existingQuests = await db
      .select({
        id: userQuests.id,
        assignedDate: userQuests.assignedDate,
      })
      .from(userQuests)
      .where(
        and(
          eq(userQuests.userId, userId),
          eq(userQuests.weekNumber, currentWeekNumber),
          eq(userQuests.year, currentYear)
        )
      );

    // Build set of dates that already have quests
    const existingDates = new Set(existingQuests.map((q) => q.assignedDate));

    // Find missing dates
    const missingDates = weekDates.filter((dateStr) => !existingDates.has(dateStr));

    // Case 1: Complete coverage - do nothing
    if (missingDates.length === 0) {
      console.log(
        `[WeeklyRecovery] ✅ User ${userId} already has full week (${existingQuests.length} quests across 7 days)`
      );
      return { generated: 0, alreadyComplete: true };
    }

    // Case 2: Partial or no coverage - generate missing days
    console.log(
      `[WeeklyRecovery] 🟡 User ${userId} missing ${missingDates.length} day(s) (has ${existingQuests.length} quests)`
    );

    if (existingQuests.length === 0) {
      console.log(`[WeeklyRecovery] 🔴 User ${userId} has NO quests for current week → generating full week`);
    }

    let questsGeneratedCount = 0;

    for (const dateStr of missingDates) {
      try {
        const generated = await this.generateQuestsForUserOnDate(userId, dateStr, dryRun);
        questsGeneratedCount += generated;
      } catch (dayError) {
        console.error(
          `[WeeklyRecovery] ❌ Error generating quests for user ${userId} on ${dateStr}:`,
          dayError
        );
      }
    }

    return { generated: questsGeneratedCount, alreadyComplete: false };
  }

  /**
   * Generate quests for a specific user on a specific date
   * Ensures career + social mix, no duplicates
   * Returns count of quests created
   */
  private async generateQuestsForUserOnDate(
    userId: number,
    dateStr: string,
    dryRun: boolean = false
  ): Promise<number> {
    // Double-check this date doesn't already have quests
    const existing = await db
      .select({ id: userQuests.id })
      .from(userQuests)
      .where(
        and(
          eq(userQuests.userId, userId),
          eq(userQuests.assignedDate, dateStr)
        )
      );

    if (existing.length > 0) {
      console.log(
        `[WeeklyRecovery] ⏭️ User ${userId} already has ${existing.length} quest(s) on ${dateStr}, skipping`
      );
      return 0;
    }

    const dateObj = new Date(`${dateStr}T00:00:00.000Z`);
    const weekNumber = this.getWeekNumber(dateObj);
    const year = dateObj.getUTCFullYear();

    // Get available quest definitions (active quests not blocked by recent usage)
    const [blockedLast7, blockedSameWeek, activeDefs] = await Promise.all([
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

    const blockedIds = new Set<number>([
      ...blockedLast7.rows.map((row: any) => Number(row.quest_definition_id)),
      ...blockedSameWeek.rows.map((row: any) => Number(row.quest_definition_id))
    ]);

    const available = activeDefs.filter((q) => !blockedIds.has(q.id));

    if (available.length === 0) {
      console.warn(
        `[WeeklyRecovery] ⚠️ No eligible quests available for user ${userId} on ${dateStr}`
      );
      return 0;
    }

    // Split into career and social
    const careerPool = available.filter((q) => !this.isLikelySocialQuest(q));
    const socialPool = available.filter((q) => this.isLikelySocialQuest(q));

    // Fallback pools ensure category coverage if blocked filters depleted one category.
    const allCareerDefs = activeDefs.filter((q) => !this.isLikelySocialQuest(q));
    const allSocialDefs = activeDefs.filter((q) => this.isLikelySocialQuest(q));

    // Select quests: enforce 1 career + 1 social whenever possible.
    const selected: typeof available = [];
    const selectedIds = new Set<number>();
    const selectedTypes = new Set<string>();

    const pickUnique = (pool: typeof activeDefs): (typeof activeDefs)[number] | null => {
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      for (const candidate of shuffled) {
        const questType = String(candidate.type || '').toLowerCase();
        if (selectedIds.has(candidate.id)) continue;
        if (questType && selectedTypes.has(questType)) continue;
        return candidate;
      }
      return null;
    };

    const careerQuest = pickUnique(careerPool) || pickUnique(allCareerDefs);
    if (careerQuest) {
      selected.push(careerQuest);
      selectedIds.add(careerQuest.id);
      selectedTypes.add(String(careerQuest.type || '').toLowerCase());
    }

    const socialQuest = pickUnique(socialPool) || pickUnique(allSocialDefs);
    if (socialQuest) {
      selected.push(socialQuest);
      selectedIds.add(socialQuest.id);
      selectedTypes.add(String(socialQuest.type || '').toLowerCase());
    }

    // Backfill one extra unique quest if one of the categories was unavailable.
    if (selected.length < 2) {
      const fallback = pickUnique(available) || pickUnique(activeDefs);
      if (fallback) {
        selected.push(fallback);
        selectedIds.add(fallback.id);
        selectedTypes.add(String(fallback.type || '').toLowerCase());
      }
    }

    if (selected.length === 0) {
      console.warn(`[WeeklyRecovery] ⚠️ Could not select any quests for user ${userId}`);
      return 0;
    }

    // Create quest records
    let createdCount = 0;

    if (dryRun) {
      console.log(
        `[WeeklyRecovery] [DRY-RUN] Would create ${selected.length} quest(s) for user ${userId} on ${dateStr}`
      );
      createdCount = selected.length;
    } else {
      for (const questDef of selected) {
        const inserted = await this.insertUserQuestWithFallback({
          userId,
          questDefinitionId: questDef.id,
          assignedDate: dateStr,
          weekNumber,
          year,
        });
        if (inserted) {
          createdCount++;
        }
      }

      console.log(
        `[WeeklyRecovery] ✅ Generated ${createdCount} quest(s) for user ${userId} on ${dateStr}`
      );
    }

    return createdCount;
  }

  /**
   * Get all 7 days of current week (Monday - Sunday)
   */
  private getCurrentWeekDates(): string[] {
    const now = new Date();
    // UTC day: 0 = Sunday, 1 = Monday, ... 6 = Saturday
    const dayOfWeek = now.getUTCDay();
    // Calculate Monday of current week
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(now);
    monday.setUTCDate(now.getUTCDate() - daysFromMonday);
    monday.setUTCHours(0, 0, 0, 0);

    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setUTCDate(monday.getUTCDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }

    return dates;
  }

  /**
   * Get ISO week number for a given date
   */
  private getWeekNumber(date: Date): number {
    const d = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  /**
   * Check if a quest is likely a social quest
   */
  private isLikelySocialQuest(quest: any): boolean {
    const questCategory = (quest.questCategory || '').toLowerCase();
    const type = (quest.type || '').toLowerCase();
    const platform = (quest.platform || '').toLowerCase();

    if (questCategory === 'social') return true;
    if (type === 'social_quest' || type === 'social_post') return true;
    if (
      [
        'linkedin',
        'instagram',
        'twitter',
        'x',
        'youtube',
        'facebook',
        'tiktok',
        'threads'
      ].includes(platform)
    ) {
      return true;
    }

    return false;
  }
}

export const weeklyQuestRecovery = new WeeklyQuestRecovery();

// Export function for direct imports
export async function ensureWeeklyQuestsForAllUsers(options?: { dryRun?: boolean }) {
  return weeklyQuestRecovery.ensureWeeklyQuestsForAllUsers(options);
}

export async function ensureWeeklyQuestsForUser(userId: number, options?: { dryRun?: boolean }) {
  return weeklyQuestRecovery.ensureWeeklyQuestsForUser(userId, options);
}
