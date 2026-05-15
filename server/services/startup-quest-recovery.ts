import { db, sql } from "../db";
import { users } from "@shared/schema";
import { dailyQuestScheduler } from "./daily-quest-scheduler";

type StartupQuestRecoveryResult = {
  usersProcessed: number;
  usersMissingQuests: number;
  usersUpdated: number;
  usersSkipped: number;
  usersFailed: number;
  questsGenerated: number;
};

/**
 * Startup fallback recovery:
 * If a user has no quests for CURRENT_DATE, generate quests immediately.
 */
export async function generateMissedQuestsForAllUsers(): Promise<StartupQuestRecoveryResult> {
  console.log("[StartupQuestRecovery] Checking for missed users");

  const result: StartupQuestRecoveryResult = {
    usersProcessed: 0,
    usersMissingQuests: 0,
    usersUpdated: 0,
    usersSkipped: 0,
    usersFailed: 0,
    questsGenerated: 0,
  };

  try {
    const allUsers = await db
      .select({ id: users.id, name: users.name })
      .from(users);

    result.usersProcessed = allUsers.length;

    for (const user of allUsers) {
      try {
        const now = new Date();
        const currentWeek = getWeekNumber(now);
        const currentYear = now.getUTCFullYear();

        // Weekly coverage check: ensure user has at least one quest in current week.
        const weekCountResult = await db.execute(sql`
          SELECT COUNT(*)::int AS count
          FROM user_quests
          WHERE user_id = ${user.id}
            AND week_number = ${currentWeek}
            AND year = ${currentYear}
        `);

        const weekCount = Number(weekCountResult.rows[0]?.count ?? 0);
        if (weekCount === 0) {
          const weeklyGenerated = await dailyQuestScheduler.triggerWeeklyAssignmentForUser(user.id, {
            force: true,
          });

          const weeklyGeneratedCount = Array.isArray(weeklyGenerated) ? weeklyGenerated.length : 0;
          if (weeklyGeneratedCount > 0) {
            result.usersUpdated++;
            result.questsGenerated += weeklyGeneratedCount;
          }
        }

        // Required missed-quest check: assigned_date = CURRENT_DATE
        const countResult = await db.execute(sql`
          SELECT COUNT(*)::int AS count
          FROM user_quests
          WHERE user_id = ${user.id}
            AND assigned_date = CURRENT_DATE
        `);

        const todayCount = Number(countResult.rows[0]?.count ?? 0);

        if (todayCount > 0) {
          result.usersSkipped++;
          continue;
        }

        result.usersMissingQuests++;
        console.log(`[StartupQuestRecovery] User ${user.id} missing quests -> generating`);

        // force=true bypasses scheduler timing/nextQuestAssignmentTime,
        // while insertion safety remains enforced in scheduler assignment path.
        const generated = await dailyQuestScheduler.triggerDailyAssignmentForUser(user.id, {
          force: true,
        });

        const generatedCount = Array.isArray(generated) ? generated.length : 0;
        if (generatedCount > 0) {
          result.usersUpdated++;
          result.questsGenerated += generatedCount;
        } else {
          // No quests generated can happen if duplicate safety blocks assignment.
          result.usersSkipped++;
        }
      } catch (userError) {
        result.usersFailed++;
        console.error(
          `[StartupQuestRecovery] Failed for user ${user.id} (${user.name ?? "unknown"}):`,
          userError
        );
      }
    }

    console.log(
      `[StartupQuestRecovery] Completed: ${result.usersUpdated} users updated, ${result.questsGenerated} quests generated`
    );

    return result;
  } catch (error) {
    console.error("[StartupQuestRecovery] Fatal error during startup recovery:", error);
    return result;
  }
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
