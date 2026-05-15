
import { db } from "./server/db";
import { users, userQuests } from "./shared/schema";
import { dailyQuestScheduler } from "./server/services/daily-quest-scheduler";
import { eq, and, sql, count } from "drizzle-orm";
import { format } from "date-fns";

async function run() {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.isSystem, false)
    });

    if (!user) {
      console.log(JSON.stringify({ error: "No non-system user found" }));
      return;
    }
    console.log(JSON.stringify({ step: 1, userId: user.id }));

    await dailyQuestScheduler.triggerDailyAssignmentForUser(user.id, { force: true });
    console.log(JSON.stringify({ step: 2, status: "Triggered" }));

    const today = format(new Date(), "yyyy-MM-dd");

    const stats = await db.select({
      scheduledDate: userQuests.scheduledDate,
      questType: userQuests.questType,
      count: count(),
    })
    .from(userQuests)
    .where(and(eq(userQuests.userId, user.id), eq(userQuests.scheduledDate, today)))
    .groupBy(userQuests.scheduledDate, userQuests.questType);
    
    console.log(JSON.stringify({ step: 3, stats }));

    const duplicates = await db.select({
      scheduledDate: userQuests.scheduledDate,
      questType: userQuests.questType,
      title: userQuests.title,
      count: count(),
    })
    .from(userQuests)
    .where(and(eq(userQuests.userId, user.id), eq(userQuests.scheduledDate, today)))
    .groupBy(userQuests.scheduledDate, userQuests.questType, userQuests.title)
    .having(sql`count(*) > 1`);

    console.log(JSON.stringify({ step: 4, duplicates }));
  } catch (error: any) {
    console.log(JSON.stringify({ error: error.message }));
  }
}

run().then(() => process.exit(0));

