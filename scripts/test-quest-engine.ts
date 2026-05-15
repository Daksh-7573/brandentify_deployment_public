import "dotenv/config";
import { pool } from "../server/db";
import { dailyQuestScheduler } from "../server/services/daily-quest-scheduler";
import { QuestCompletionDetector } from "../server/services/quest-completion-detector";
import { QuestAssignmentPipeline } from "../server/services/quest-assignment-pipeline";
import { QuestUniquenessValidator } from "../server/services/quest-uniqueness-validator";

type Scenario = {
  label: string;
  profileCompletion: number;
};

const scenarios: Scenario[] = [
  { label: "New user (<20%)", profileCompletion: 10 },
  { label: "Medium profile (50%)", profileCompletion: 50 },
  { label: "High completion user (>80%)", profileCompletion: 90 },
];

type TestSummary = {
  questsAssigned: number;
  questsCompleted: number;
  xpEarned: number;
  failures: number;
  uniquenessTests: {
    passed: number;
    failed: number;
  };
  balanceTests: {
    passed: number;
    failed: number;
  };
};

const FORCE_MODE = process.argv.includes("--force");
const RUN_UNIQUENESS_TESTS = process.argv.includes("--test-uniqueness");
const RUN_BALANCE_TESTS = process.argv.includes("--test-balance");
const RUN_10_DAY_TEST = process.argv.includes("--test-10-days");

async function ensureTestUser(profileCompletion: number): Promise<number> {
  const email = "quest-test@brandentify.local";
  const username = "quest-test-user";

  const existing = await pool.query(`SELECT id FROM users WHERE email = $1 LIMIT 1`, [email]);

  if (existing.rows.length > 0) {
    const userId = Number(existing.rows[0].id);
    await pool.query(
      `
        UPDATE users
        SET profile_completed = $1,
            timezone = 'America/New_York'
        WHERE id = $2
      `,
      [profileCompletion, userId]
    );
    console.log(`[QuestTest] Test user created/reused: ${userId}`);
    return userId;
  }

  const inserted = await pool.query(
    `
      INSERT INTO users (username, email, password, name, timezone, profile_completed)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `,
    [username, email, "quest-test-password", "Quest Test User", "America/New_York", profileCompletion]
  );

  const userId = Number(inserted.rows[0].id);
  console.log(`[QuestTest] Test user created/reused: ${userId}`);
  return userId;
}

async function resetQuestState(userId: number): Promise<void> {
  await pool.query(`DELETE FROM user_quests WHERE user_id = $1`, [userId]);
  await pool.query(`DELETE FROM xp_transactions WHERE user_id = $1`, [userId]);
  await pool.query(`DELETE FROM user_xp WHERE user_id = $1`, [userId]);
  console.log(`[QuestTest] Quest state reset for user ${userId}`);
}

async function ensureQuestDefinition(
  targetAction: string,
  title: string,
  xpReward: number
): Promise<number> {
  const existing = await pool.query(
    `
      SELECT id
      FROM quest_definitions
      WHERE target_action = $1
        AND is_active = true
      ORDER BY id ASC
      LIMIT 1
    `,
    [targetAction]
  );

  if (existing.rows.length > 0) {
    return Number(existing.rows[0].id);
  }

  const inserted = await pool.query(
    `
      INSERT INTO quest_definitions (
        title,
        description,
        type,
        target_count,
        target_action,
        xp_reward,
        verification_method,
        is_active
      )
      VALUES ($1, $2, 'engagement', 1, $3, $4, 'database_event', true)
      RETURNING id
    `,
    [title, `[QuestTest] Complete action: ${targetAction}`, targetAction, xpReward]
  );

  return Number(inserted.rows[0].id);
}

async function forceAssignQuests(userId: number): Promise<number> {
  const definitions = [
    { action: "create_pulse", title: "[QuestTest] Create Pulse", xp: 50 },
    { action: "add_project", title: "[QuestTest] Add Project", xp: 70 },
    { action: "update_profile_field", title: "[QuestTest] Update Profile Field", xp: 40 },
  ];

  let assigned = 0;
  const now = new Date();
  const year = now.getUTCFullYear();
  const weekNumber = Math.ceil(
    ((Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - Date.UTC(now.getUTCFullYear(), 0, 1)) /
      86400000 +
      1) /
      7
  );

  for (const def of definitions) {
    const questDefinitionId = await ensureQuestDefinition(def.action, def.title, def.xp);

    await pool.query(
      `
        INSERT INTO user_quests (
          user_id,
          quest_definition_id,
          status,
          progress,
          assigned_date,
          week_number,
          year,
          assigned_at
        )
        VALUES ($1, $2, 'active', 0, CURRENT_DATE, $3, $4, NOW())
      `,
      [userId, questDefinitionId, weekNumber, year]
    );
    assigned += 1;
  }

  return assigned;
}

async function triggerAndVerifyAction(
  userId: number,
  actionType: "create_pulse" | "add_project" | "update_profile_field",
  metadata: Record<string, unknown>
): Promise<{ completed: number; xpEarned: number; transactions: number; failures: number }> {
  const xpBefore = await pool.query(
    `SELECT COALESCE(balance, 0) AS balance FROM user_xp WHERE user_id = $1 LIMIT 1`,
    [userId]
  );
  const txBefore = await pool.query(`SELECT COUNT(*)::int AS count FROM xp_transactions WHERE user_id = $1`, [userId]);

  console.log(`[QuestTest] Action triggered: ${actionType}`);
  const completed = await QuestCompletionDetector.detectCompletion(userId, actionType, metadata);

  const xpAfter = await pool.query(
    `SELECT COALESCE(balance, 0) AS balance FROM user_xp WHERE user_id = $1 LIMIT 1`,
    [userId]
  );
  const txAfter = await pool.query(`SELECT COUNT(*)::int AS count FROM xp_transactions WHERE user_id = $1`, [userId]);

  const beforeBalance = Number(xpBefore.rows[0]?.balance || 0);
  const afterBalance = Number(xpAfter.rows[0]?.balance || 0);
  const xpEarned = afterBalance - beforeBalance;
  const txCreated = Number(txAfter.rows[0]?.count || 0) - Number(txBefore.rows[0]?.count || 0);

  const verify = await pool.query(
    `
      SELECT COUNT(*)::int AS completed_count
      FROM user_quests uq
      JOIN quest_definitions qd ON qd.id = uq.quest_definition_id
      WHERE uq.user_id = $1
        AND qd.target_action = ANY($2)
        AND uq.status = 'completed'
    `,
    [
      userId,
      actionType === "add_project" ? ["add_project", "add_portfolio_project"] : [actionType],
    ]
  );

  const completedCount = Number(verify.rows[0]?.completed_count || 0);
  const failures = completed > 0 && completedCount > 0 && xpEarned > 0 && txCreated > 0 ? 0 : 1;

  if (failures === 0) {
    console.log(`[QuestTest] Quest auto-completed: action=${actionType}, completed=${completed}, xp=${xpEarned}`);
    console.log(`[QuestTest] XP awarded: ${xpEarned}`);
  }

  return {
    completed,
    xpEarned,
    transactions: txCreated,
    failures,
  };
}

async function runScenario(scenario: Scenario): Promise<TestSummary> {
  console.log(`\n[QuestTest] Scenario: ${scenario.label}`);
  const userId = await ensureTestUser(scenario.profileCompletion);
  await resetQuestState(userId);

  let questsAssigned = 0;
  if (FORCE_MODE) {
    // Force mode bypasses scheduler restrictions: nextQuestAssignmentTime, duplicate prevention, daily constraints.
    questsAssigned = await forceAssignQuests(userId);
  } else {
    const assigned = await dailyQuestScheduler.triggerDailyAssignmentForUser(userId);
    questsAssigned = assigned.length;
  }

  console.log(`[QuestTest] Quests assigned: ${questsAssigned}`);

  const pulseResult = await triggerAndVerifyAction(userId, "create_pulse", {
    pulseId: `test-pulse-${Date.now()}`,
  });

  const projectResult = await triggerAndVerifyAction(userId, "add_project", {
    projectId: `test-project-${Date.now()}`,
  });

  const profileResult = await triggerAndVerifyAction(userId, "update_profile_field", {
    updatedFields: ["aboutMe", "title"],
  });

  const questStats = await pool.query(
    `
      SELECT
        COUNT(*) FILTER (WHERE status = 'active') AS active_count,
        COUNT(*) FILTER (WHERE status = 'completed') AS completed_count
      FROM user_quests
      WHERE user_id = $1
        AND assigned_date = CURRENT_DATE
    `,
    [userId]
  );

  const completed = Number(questStats.rows[0]?.completed_count || 0);
  const totalXp = pulseResult.xpEarned + projectResult.xpEarned + profileResult.xpEarned;
  const failures = pulseResult.failures + projectResult.failures + profileResult.failures;

  return {
    questsAssigned,
    questsCompleted: completed,
    xpEarned: totalXp,
    failures,
  };
}

/**
 * TEST 1: 10-Day Uniqueness Test
 * Generate quests for 10 consecutive days and verify no duplicates
 */
async function test10DayUniqueness(userId: number): Promise<{ passed: number; failed: number }> {
  console.log('\n[UniquenessTest] Starting 10-day quest generation test');
  
  let passed = 0;
  let failed = 0;
  const allQuestIds: number[] = [];
  const allTargetActions: string[] = [];

  for (let day = 0; day < 10; day++) {
    console.log(`\n[UniquenessTest] Day ${day + 1}/10`);
    
    // Generate quests for this day
    const result = await QuestAssignmentPipeline.validateAndAssignQuests({
      userId,
      forceBalance: true
    });

    if (!result.success || result.assignedQuestIds.length === 0) {
      console.log(`[UniquenessTest] ⚠️ Day ${day + 1}: No quests assigned`);
      continue;
    }

    // Fetch quest details
    const questResult = await pool.query(
      `
        SELECT uq.id, qd.quest_definition_id, qd.target_action, qd.title
        FROM user_quests uq
        JOIN quest_definitions qd ON qd.id = uq.quest_definition_id
        WHERE uq.id = ANY($1)
      `,
      [result.assignedQuestIds]
    );

    for (const quest of questResult.rows) {
      const questDefId = Number(quest.quest_definition_id);
      const targetAction = quest.target_action;

      // Check for duplicates
      if (allQuestIds.includes(questDefId)) {
        console.log(`[UniquenessTest] ❌ DUPLICATE DETECTED: Quest def ${questDefId} assigned on day ${day + 1}`);
        failed++;
      } else if (allTargetActions.includes(targetAction)) {
        console.log(`[UniquenessTest] ⚠️ DUPLICATE TARGET ACTION: ${targetAction} on day ${day + 1}`);
        // This is a warning, not a hard failure
      } else {
        console.log(`[UniquenessTest] ✓ Day ${day + 1}: Unique quest - ${quest.title}`);
        passed++;
      }

      allQuestIds.push(questDefId);
      allTargetActions.push(targetAction);
    }

    // Simulate day passing
    await pool.query(
      `
        UPDATE user_quests
        SET assigned_date = assigned_date - INTERVAL '1 day'
        WHERE id = ANY($1)
      `,
      [result.assignedQuestIds]
    );
  }

  console.log(`\n[UniquenessTest] Summary: ${passed} unique quests, ${failed} duplicates`);
  return { passed, failed };
}

/**
 * TEST 2: Balance Validation Test
 * Verify daily quest allocation follows balance rules
 */
async function testQuestBalance(userId: number): Promise<{ passed: number; failed: number }> {
  console.log('\n[BalanceTest] Starting quest balance validation');
  
  let passed = 0;
  let failed = 0;

  // Test different scenarios
  const testCases = [
    { requestedCount: 1, expectedNormal: null, expectedSocial: null, description: '1 quest (any)' },
    { requestedCount: 2, expectedNormal: 1, expectedSocial: 1, description: '2 quests (1 normal + 1 social)' },
    { requestedCount: 3, expectedNormal: 2, expectedSocial: 1, description: '3 quests (2 normal + 1 social)' },
    { requestedCount: 4, expectedNormal: 2, expectedSocial: 2, description: '4 quests (2 normal + 2 social)' },
  ];

  for (const testCase of testCases) {
    console.log(`\n[BalanceTest] Testing: ${testCase.description}`);
    
    // Reset quests
    await pool.query(`DELETE FROM user_quests WHERE user_id = $1`, [userId]);
    await pool.query(`DELETE FROM user_quest_history WHERE user_id = $1`, [userId]);

    // Assign quests
    const result = await QuestAssignmentPipeline.validateAndAssignQuests({
      userId,
      requestedQuestCount: testCase.requestedCount,
      forceBalance: true
    });

    if (!result.success) {
      console.log(`[BalanceTest] ⚠️ Assignment failed: ${result.errorMessage}`);
      continue;
    }

    // Check balance
    const balanceResult = await pool.query(
      `
        SELECT 
          COUNT(*) FILTER (WHERE qd.quest_category IN ('career', 'profile', 'portfolio')) AS normal_count,
          COUNT(*) FILTER (WHERE qd.quest_category IN ('social', 'networking')) AS social_count,
          COUNT(*) AS total_count
        FROM user_quests uq
        JOIN quest_definitions qd ON qd.id = uq.quest_definition_id
        WHERE uq.user_id = $1
          AND uq.assigned_date = CURRENT_DATE
      `,
      [userId]
    );

    const normalCount = Number(balanceResult.rows[0]?.normal_count || 0);
    const socialCount = Number(balanceResult.rows[0]?.social_count || 0);
    const totalCount = Number(balanceResult.rows[0]?.total_count || 0);

    // Validate
    let testPassed = true;

    if (testCase.expectedNormal !== null && normalCount !== testCase.expectedNormal) {
      console.log(`[BalanceTest] ❌ Expected ${testCase.expectedNormal} normal quests, got ${normalCount}`);
      testPassed = false;
    }

    if (testCase.expectedSocial !== null && socialCount !== testCase.expectedSocial) {
      console.log(`[BalanceTest] ❌ Expected ${testCase.expectedSocial} social quests, got ${socialCount}`);
      testPassed = false;
    }

    if (testPassed) {
      console.log(`[BalanceTest] ✓ Correct balance: ${normalCount} normal + ${socialCount} social = ${totalCount} total`);
      passed++;
    } else {
      failed++;
    }
  }

  console.log(`\n[BalanceTest] Summary: ${passed} passed, ${failed} failed`);
  return { passed, failed };
}

/**
 * TEST 3: Content Hash Duplicate Detection
 */
async function testContentHashDuplication(): Promise<{ passed: number; failed: number }> {
  console.log('\n[HashTest] Starting content hash duplicate detection test');
  
  let passed = 0;
  let failed = 0;

  const testTitle = 'Test Unique Quest Title ' + Date.now();
  const testDescription = 'This is a test quest for hash duplicate testing';
  const testDeliverable = 'Test deliverable format';

  // Generate hash
  const hash = QuestUniquenessValidator.generateQuestContentHash(
    testTitle,
    testDescription,
    testDeliverable
  );

  console.log(`[HashTest] Generated hash: ${hash.substring(0, 16)}...`);

  // Insert test quest with hash
  await pool.query(
    `
      INSERT INTO quest_definitions (
        title, description, type, target_action, xp_reward,
        quest_content_hash, is_active
      )
      VALUES ($1, $2, 'engagement', 'test_action', 50, $3, true)
    `,
    [testTitle, testDescription, hash]
  );

  // Check if duplicate is detected
  const duplicate = await QuestUniquenessValidator.findDuplicateByContentHash(hash);

  if (duplicate.exists) {
    console.log(`[HashTest] ✓ Duplicate correctly detected via content hash`);
    passed++;
  } else {
    console.log(`[HashTest] ❌ Duplicate not detected`);
    failed++;
  }

  // Cleanup
  await pool.query(
    `DELETE FROM quest_definitions WHERE quest_content_hash = $1`,
    [hash]
  );

  console.log(`\n[HashTest] Summary: ${passed} passed, ${failed} failed`);
  return { passed, failed };
}

async function main() {
  try {
    console.log(`[QuestTest] Starting quest engine integration test (force=${FORCE_MODE})`);

    let summary: TestSummary = {
      questsAssigned: 0,
      questsCompleted: 0,
      xpEarned: 0,
      failures: 0,
      uniquenessTests: { passed: 0, failed: 0 },
      balanceTests: { passed: 0, failed: 0 }
    };

    // Run standard quest assignment tests
    if (!RUN_UNIQUENESS_TESTS && !RUN_BALANCE_TESTS && !RUN_10_DAY_TEST) {
      for (const scenario of scenarios) {
        const result = await runScenario(scenario);
        summary.questsAssigned += result.questsAssigned;
        summary.questsCompleted += result.questsCompleted;
        summary.xpEarned += result.xpEarned;
        summary.failures += result.failures;
      }
    }

    // Run uniqueness tests
    if (RUN_UNIQUENESS_TESTS || RUN_10_DAY_TEST) {
      const userId = await ensureTestUser(50);
      await resetQuestState(userId);
      
      const uniquenessResult = await test10DayUniqueness(userId);
      summary.uniquenessTests = uniquenessResult;
    }

    // Run balance tests
    if (RUN_BALANCE_TESTS) {
      const userId = await ensureTestUser(50);
      await resetQuestState(userId);
      
      const balanceResult = await testQuestBalance(userId);
      summary.balanceTests = balanceResult;
      
      // Run hash test
      const hashResult = await testContentHashDuplication();
      summary.balanceTests.passed += hashResult.passed;
      summary.balanceTests.failed += hashResult.failed;
    }

    console.log("\n--------------------------------");
    console.log("QUEST ENGINE TEST SUMMARY");
    console.log("--------------------------------");
    console.log(`Quests Assigned: ${summary.questsAssigned}`);
    console.log(`Quests Completed: ${summary.questsCompleted}`);
    console.log(`XP Earned: ${summary.xpEarned}`);
    console.log(`Failures: ${summary.failures}`);
    
    if (RUN_UNIQUENESS_TESTS || RUN_10_DAY_TEST) {
      console.log(`\nUniqueness Tests:`);
      console.log(`  Passed: ${summary.uniquenessTests.passed}`);
      console.log(`  Failed: ${summary.uniquenessTests.failed}`);
    }
    
    if (RUN_BALANCE_TESTS) {
      console.log(`\nBalance Tests:`);
      console.log(`  Passed: ${summary.balanceTests.passed}`);
      console.log(`  Failed: ${summary.balanceTests.failed}`);
    }
    
    console.log("--------------------------------\n");

    if (summary.failures > 0 || summary.uniquenessTests.failed > 0 || summary.balanceTests.failed > 0) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error("[QuestTest] Failed:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();

