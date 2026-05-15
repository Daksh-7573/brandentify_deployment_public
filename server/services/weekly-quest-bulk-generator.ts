import { db, sql } from '../db';
import { userQuests, questDefinitions, users } from '@shared/schema';
import { eq, and, lt, gte } from 'drizzle-orm';
import { storage } from '../storage';
import { smartQuestAllocator } from './smart-quest-allocator';

class WeeklyQuestBulkGenerator {
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
        `[WeeklyBulkGen] ❌ Failed to insert quest ${input.questDefinitionId} for user ${input.userId}. Retrying with CURRENT_DATE...`,
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
          `[WeeklyBulkGen] ❌ Retry insert failed for quest ${input.questDefinitionId} user ${input.userId}:`,
          retryError
        );
        return false;
      }
    }
  }

  /**
   * Generate quests for ALL users for all 7 days of the current week (Mon-Sun)
   * If a day already has quests for a user, skip (unless force=true)
   * Ensures career + social mix for each day
   */
  public async generateWeeklyQuestsForAllUsers(force = false) {
    console.log('[WeeklyBulkGen] 🚀 Starting bulk weekly quest generation for all users...');

    try {
      const allUsers = await storage.getAllUsers();
      console.log(`[WeeklyBulkGen] Found ${allUsers.length} users to process`);

      let successCount = 0;
      let skippedCount = 0;
      let errorCount = 0;
      let totalGenerated = 0;

      for (const user of allUsers) {
        try {
          const result = await this.generateWeeklyQuestsForUser(user.id, force);
          if (result.generated > 0) {
            successCount++;
            totalGenerated += result.generated;
          } else {
            skippedCount++;
          }
        } catch (error) {
          errorCount++;
          console.error(
            `[WeeklyBulkGen] ❌ Failed weekly generation for user ${user.id}:`,
            error
          );
        }
      }

      const summary = {
        successCount,
        skippedCount,
        errorCount,
        totalGenerated,
        message: `Generated quests for ${successCount} users, skipped ${skippedCount}, errors: ${errorCount}, total quests: ${totalGenerated}`
      };

      console.log(
        `[WeeklyBulkGen] ✅ Bulk generation complete: ${summary.message}`
      );
      return summary;
    } catch (error) {
      console.error('[WeeklyBulkGen] ❌ Fatal bulk generation error:', error);
      throw error;
    }
  }

  /**
   * Generate weekly quests for a single user
   * Ensures each day (Mon-Sun) of current week has quests
   */
  private async generateWeeklyQuestsForUser(userId: number, force = false) {
    const [userProfile] = await db.select().from(users).where(eq(users.id, userId));
    if (!userProfile) {
      console.warn(`[WeeklyBulkGen] User ${userId} not found`);
      return { generated: 0, skipped: 0 };
    }

    const timezone = userProfile.timezone || 'UTC';
    const weekDates = this.getCurrentWeekDates();

    if (weekDates.length === 0) {
      console.warn(`[WeeklyBulkGen] No week dates calculated for user ${userId}`);
      return { generated: 0, skipped: 0 };
    }

    let totalGenerated = 0;
    let totalSkipped = 0;

    console.log(
      `[WeeklyBulkGen] Processing user ${userId} across ${weekDates.length} days`
    );

    // Process each day of the week
    for (const dateString of weekDates) {
      try {
        const existingQuests = await db
          .select({ id: userQuests.id })
          .from(userQuests)
          .where(
            and(
              eq(userQuests.userId, userId),
              eq(userQuests.assignedDate, dateString)
            )
          );

        if (existingQuests.length > 0 && !force) {
          console.log(
            `[WeeklyBulkGen]   ⏭️ User ${userId} already has ${existingQuests.length} quests for ${dateString}, skipping`
          );
          totalSkipped++;
          continue;
        }

        const generated = await this.generateQuestsForUserOnDate(
          userId,
          dateString,
          force
        );
        totalGenerated += generated;

        console.log(
          `[WeeklyBulkGen]   ✅ Generated ${generated} quests for user ${userId} on ${dateString}`
        );
      } catch (dayError) {
        console.error(
          `[WeeklyBulkGen]   ❌ Error generating quests for user ${userId} on ${dateString}:`,
          dayError
        );
      }
    }

    console.log(
      `[WeeklyBulkGen] User ${userId} complete: ${totalGenerated} generated, ${totalSkipped} skipped`
    );
    return { generated: totalGenerated, skipped: totalSkipped };
  }

  /**
   * Generate quests for a specific user on a specific date
   * Ensures career + social mix
   */
  private async generateQuestsForUserOnDate(
    userId: number,
    dateString: string,
    force: boolean
  ): Promise<number> {
    const dateObj = new Date(`${dateString}T00:00:00.000Z`);
    const weekNumber = this.getWeekNumber(dateObj);
    const year = dateObj.getUTCFullYear();

    // Delete existing quests for this date if force=true
    if (force) {
      await db
        .delete(userQuests)
        .where(
          and(
            eq(userQuests.userId, userId),
            eq(userQuests.assignedDate, dateString)
          )
        );
      console.log(
        `[WeeklyBulkGen]   🔄 Force mode: cleared existing quests for user ${userId} on ${dateString}`
      );
    }

    // Target: 1-2 quests per day (1 career, 1 social for balanced diet)
    const targetPerDay = 2;

    // Get blocked quests (assigned in last 7 days OR same week)
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
        `[WeeklyBulkGen]   ⚠️ No eligible quests for user ${userId} on ${dateString}`
      );
      return 0;
    }

    // Split into career and social
    const socialPool = available.filter((q) => this.isLikelySocialQuest(q));
    const careerPool = available.filter((q) => !this.isLikelySocialQuest(q));

    // Select 1 career + 1 social if available
    const selected: typeof available = [];

    if (careerPool.length > 0) {
      selected.push(careerPool[Math.floor(Math.random() * careerPool.length)]);
    }

    if (socialPool.length > 0) {
      selected.push(socialPool[Math.floor(Math.random() * socialPool.length)]);
    }

    // If we don't have both, add fallback from remaining
    if (selected.length < targetPerDay && available.length > selected.length) {
      const selectedIds = new Set(selected.map((q) => q.id));
      const remaining = available.filter((q) => !selectedIds.has(q.id));
      if (remaining.length > 0) {
        selected.push(remaining[Math.floor(Math.random() * remaining.length)]);
      }
    }

    if (selected.length === 0) {
      return 0;
    }

    // Create quest records
    let createdCount = 0;
    for (const questDef of selected) {
      const inserted = await this.insertUserQuestWithFallback({
        userId,
        questDefinitionId: questDef.id,
        assignedDate: dateString,
        weekNumber,
        year,
      });
      if (inserted) {
        createdCount++;
      }
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
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
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

export const weeklyQuestBulkGenerator = new WeeklyQuestBulkGenerator();
