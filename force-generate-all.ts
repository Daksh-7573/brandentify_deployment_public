/**
 * Force generation script: Reset all users' nextQuestAssignmentTime to now,
 * then trigger immediate quest assignment for all users via the admin bulk route.
 */
import { db } from './server/db';
import { users, userQuests } from './shared/schema';
import { sql, eq } from 'drizzle-orm';
import { dailyQuestScheduler } from './server/services/daily-quest-scheduler';

async function forceGenerateAll() {
  const today = new Date().toISOString().split('T')[0];
  console.log('=== FORCE GENERATION FOR ALL USERS ===');
  console.log('Date:', today);

  // Get all users
  const allUsers = await db.execute(sql`
    SELECT id, name, timezone FROM users ORDER BY id
  `);
  console.log(`Found ${allUsers.rows.length} users\n`);

  let success = 0, failures = 0, alreadyHad = 0;

  for (const user of allUsers.rows as any[]) {
    // Check if user already has quests today
    const existing = await db.execute(sql`
      SELECT COUNT(*) as count FROM user_quests WHERE user_id = ${user.id} AND assigned_date = ${today}
    `);
    const existingCount = Number(existing.rows[0].count);
    if (existingCount > 0) {
      console.log(`⏭️ User ${user.id} (${user.name}) already has ${existingCount} quests today - skipping`);
      alreadyHad++;
      continue;
    }

    try {
      const assigned = await dailyQuestScheduler.triggerDailyAssignmentForUser(user.id, { force: true });
      if (assigned.length > 0) {
        console.log(`✅ User ${user.id} (${user.name}): ${assigned.length} quests assigned`);
        success++;
      } else {
        console.warn(`⚠️ User ${user.id} (${user.name}): 0 quests returned`);
        failures++;
      }
    } catch (err: any) {
      console.error(`❌ User ${user.id} (${user.name}) ERROR:`, err.message);
      failures++;
    }
  }

  console.log('\n=== RESULTS ===');
  console.log(`Already had quests: ${alreadyHad}`);
  console.log(`Newly assigned: ${success}`);
  console.log(`Failed (0 quests or error): ${failures}`);

  // Final count
  const total = await db.execute(sql`SELECT COUNT(*) as count FROM user_quests WHERE assigned_date = ${today}`);
  const userCount = await db.execute(sql`SELECT COUNT(DISTINCT user_id) as count FROM user_quests WHERE assigned_date = ${today}`);
  const byCat = await db.execute(sql`
    SELECT qd.quest_category, COUNT(*) as count
    FROM user_quests uq
    JOIN quest_definitions qd ON uq.quest_definition_id = qd.id
    WHERE uq.assigned_date = ${today}
    GROUP BY qd.quest_category
  `);
  console.log(`\nFinal: ${total.rows[0].count} total quests for ${userCount.rows[0].count} users today`);
  console.log('By category:', JSON.stringify(byCat.rows));

  process.exit(0);
}

forceGenerateAll().catch(e => { console.error(e); process.exit(1); });
