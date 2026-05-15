# BrandQuest System Audit Report
Date: 2026-03-17
Workspace: D:/01 Projects/Brandentifier

## Executive Outcome
BrandQuest is partially working, but not fully compliant with required rules.

- Generation pipeline exists and executes: PASS
- Assignment to users works: PASS
- Duplicate prevention is complete and reliable: FAIL
- Social + Normal quest generation exists: PASS
- Force generate for all users with explicit force option: FAIL (no force parameter implemented)

Controlled runtime audit artifacts generated:
- brandquest_audit_runtime.json
- brandquest_postcheck.json

---

## Step 1: Files Involved In Quest Generation
Core scheduler/allocation/generation:
- server/services/timezone-aware-quest-scheduler.ts
- server/services/daily-quest-scheduler.ts
- server/services/smart-quest-allocator.ts
- server/services/comprehensive-quest-generator-v2.ts
- server/services/social-quest-generator-v2.ts
- server/services/profile-completeness-checker.ts
- server/services/brand-goal-quest-mapper.ts
- server/services/quest-progress-service.ts
- server/services/local-ai-service.ts

Schema/storage/routes:
- shared/schema.ts
- server/routes-career-quests.ts
- server/routes-smart-quests.ts
- server/routes.ts

Frontend dashboard/quest panel:
- client/src/pages/brand-quests.tsx
- client/src/components/brand-quests/quest-panel.tsx
- client/src/hooks/use-career-quests.ts

Auxiliary scripts discovered:
- assign-all-users-current-week-quests.ts
- assign-current-week-quests.ts
- assign-quests.ts
- server/populate-quest-definitions.ts
- scripts/test-quest-engine.ts

---

## Step 2: Pipeline Verification
Verified pipeline sequence in code:
1. Scheduler trigger exists:
   - timezone-aware-quest-scheduler checks due users and delegates assignment.
2. Profile completeness check exists:
   - smart-quest-allocator calls ProfileCompletenessChecker.
3. Brand goals evaluation exists:
   - smart-quest-allocator filters quest types via BrandGoalQuestMapper.
4. Quest generation exists:
   - daily-quest-scheduler calls comprehensive-quest-generator-v2 and social-quest-generator-v2.
5. DB persistence exists:
   - daily-quest-scheduler inserts into generated_career_quests/generated_social_quests and user_quests.
6. Dashboard delivery exists:
   - routes-career-quests exposes user quest APIs; frontend hooks and quest panel consume them.

Status: PASS

---

## Step 3: Database Structure Verification
Verified table presence from live database information_schema:
- quest_definitions: present
- user_quests: present
- user_xp: present
- user_badges: present

Required fields check:
- title: present on quest_definitions
- description: present on quest_definitions
- xpReward (xp_reward): present on quest_definitions
- difficultyLevel (difficulty_level): present on quest_definitions
- category: present on quest_definitions (legacy) and quest_category also present
- assignedDate (assigned_date): present on user_quests
- status: present on user_quests
- weekNumber (week_number): present on user_quests
- year: present on user_quests

Linkage check:
- user_quests.user_id references users.id
- user_quests.quest_definition_id references quest_definitions.id

Status: PASS

---

## Step 4: Duplicate Prevention Verification
Required rules:
- Same quest should NOT repeat within 7 days
- Same questDefinitionId should not be assigned twice in same week
- Check weekNumber + year

What exists:
- daily-quest-scheduler enforces skip if quest_definition_id appears in last 7 days during selected assignment.
- Same-day protection exists by excluding today-assigned quest definitions in allocator query.

Critical findings from live DB:
- duplicateWithin7Days count: 6 (see brandquest_postcheck.json)
- duplicateWeekYear count: many historical duplicates (sample includes counts up to 14 for same user_id + quest_definition_id + week_number + year)

Interpretation:
- Duplicate prevention is not consistently enforced across all assignment paths/history.
- weekNumber+year uniqueness is not guaranteed at DB level.
- quest-uniqueness-validator exists but is not wired into active scheduler path.

Status: FAIL

---

## Step 5: Quest Type Verification (Social + Normal)
Live DB coverage for current day:
- total today: 16
- social today: 2
- normal today: 14
- by type observed today: profile_update, networking, social_quest

Code coverage:
- smart-quest-allocator allocates balanced mixes including social_quest/social_post + normal categories.

Status: PASS

---

## Step 6: Context Personalization Verification
Generator prompt includes:
- industry
- domain
- location
- primary audience
- brand goal label
- profile completeness/field alignment pathing

Verified in comprehensive-quest-generator-v2 prompt-building logic and profile alignment logic.

Status: PASS

---

## Step 7: Force Generate For All Users Verification
Requested contract:
- smartQuestAllocator.allocateDailyQuests(userId, { force: true })
- bypass timing/cooldown restrictions, still respect duplicate prevention

Actual code:
- smartQuestAllocator.allocateDailyQuests arity is 1 (no force options object).
- No explicit force flag implementation in allocator.

Controlled forced run performed via manual per-user assignment entrypoint:
- Used dailyQuestScheduler.triggerDailyAssignmentForUser for all users.
- Users processed: 48
- Succeeded: 48
- Failed: 0
- New rows created: 4

Status: FAIL for specified force API contract
Status: PASS for practical all-user manual generation execution path

---

## Step 8: Post-Generation DB Result Verification
Post-run checks:
- New quests created: yes (4 new rows)
- Users received quests: yes (subset, constrained by duplicate/window logic and available pool)
- XP rewards populated: yes in sampled latest rows (xp_reward present)
- Duplicate issues remain historically and within 7-day probe.

Status: PARTIAL PASS

---

## Step 9: Dashboard Display Verification
Backend endpoints exist and are consumed by frontend:
- /api/users/:userId/quests/current-day
- /api/users/:userId/social-quests/current-day
- /api/users/:userId/quests/assign-daily
- /api/users/:userId/social-quests/assign-daily

Frontend:
- brand-quests page renders QuestPanel
- QuestPanel auto-assigns when empty and loads daily/completed/missed buckets

Static verification: PASS
Runtime browser verification in this audit: NOT EXECUTED

---

## Step 10: Error Handling Verification
Verified in code and runtime logs:
- Ollama timeout handling with AbortController and 15s timeout
- OpenAI fallback attempted when key present
- 429 handling disables OpenAI for session
- deterministic fallback path used when both AI providers fail
- Scheduler catches per-user errors and continues
- Neon/database paused handling exists in scheduler loops

Status: PASS (with resilience caveat below)

Caveat:
- In observed run, deterministic fallback text caused JSON parse fallback path in quest generator. System recovered via fallback quest creation, but this is a quality/reliability risk for AI-structured quest generation.

---

## Step 11: Sample User Completion-Bucket Behavior
Observed current dataset buckets:
- <20% completion: 29 users, avg quests today 0.34 (min 0, max 4)
- 20-80% completion: 19 users, avg quests today 0.32 (min 0, max 3)
- >80% completion: 0 users in dataset

Required expectation:
- Low: 1 quest
- Medium: 2-3 quests
- High: 3-4 quests

Result:
- Dataset did not satisfy required distribution expectations in aggregate current-day state.
- Also could not validate high-completion cohort due zero users >80%.

Status: FAIL (requirement not demonstrated)

---

## Step 12: Summary Metrics
- Total users processed: 48
- Total quests generated in controlled run: 4 new user_quests rows
- Average quests per user (controlled run): 0.08
- Errors during run: 0 hard failures
- Duplicate quests detected:
  - Within 7-day probe: 6 duplicate user+quest_definition pairs
  - Same week+year duplicates: present historically in significant counts

---

## Files Needing Fixes
1. server/services/smart-quest-allocator.ts
   - Add explicit options parameter with force mode support.
2. server/services/daily-quest-scheduler.ts
   - Enforce duplicate checks consistently (include same week+year + quest_definition_id guard before insert).
3. shared/schema.ts and/or migrations
   - Add DB-level unique constraint/index for duplicate prevention strategy.
4. server/services/quest-assignment-pipeline.ts (or active scheduler path)
   - Wire QuestUniquenessValidator into active assignment execution path.
5. server/services/comprehensive-quest-generator-v2.ts
   - Harden deterministic fallback parse path for strict JSON contract.

---

## Final Verdict
BrandQuest is operational but not compliant with all required audit criteria.

Working:
- Core generation pipeline
- Social + normal type generation
- Scheduler + assignment execution
- Dashboard data wiring

Broken or incomplete:
- Required force API contract with explicit force option
- Robust duplicate prevention guarantees (especially historical week/year duplication)
- Required completion-bucket quest-count behavior validation
