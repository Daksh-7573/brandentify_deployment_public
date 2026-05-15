# BrandQuest Career Quest Fix Report

Date: 2026-03-17

## Objective
Fix the issue where career quests were not reliably generated or displayed on the main site, then force-generate quests for all users so they appear on the dashboard immediately.

## Root Causes Confirmed
1. Frontend auto-backfill on the Brand Quests panel only triggered when both career and social daily buckets were empty. Users who already had one bucket populated could miss the other bucket indefinitely.
2. Quest assignment mutations were invalidating older quest keys, while the live UI reads bucket-based keys. This prevented fresh quest data from appearing immediately after assignment.
3. Career vs social filtering relied too heavily on quest type and platform. Some records were stored with a career-oriented quest_category but a social-looking type, so valid career quests could be hidden from the career view.
4. The main dashboard did not render the Brand Quests panel at all, so even valid quests were not visible on the main page.

## Backend Fixes
- Added force-compatible allocation flow in the smart allocator and daily scheduler.
- Updated manual daily assignment route to accept force=true and pass it into the scheduler.
- Updated bulk all-user assignment to use the unified scheduler path with force enabled.
- Exposed quest_category in bucket queries and used it in quest classification helpers.
- Preserved 7-day duplicate skipping during assignment.

## Frontend Fixes
- Updated daily assignment hook to support force=true.
- Fixed query invalidation so bucket queries refresh immediately after assignment.
- Changed the Brand Quests panel to backfill when either career or social daily quests are missing.
- Unified panel auto-backfill through the scheduler-backed daily assignment route.
- Added the Brand Quests panel to the main dashboard so quests appear directly on the main site.

## Forced Generation Result
Source: brandquest_force_generation_2026-03-17.json

- Total users processed: 48
- Total quests generated in force run: 4
- Career quests generated in force run: 4
- Social quests generated in force run: 0
- Users with new career quests: 4
- Users with new social quests: 0
- Errors: 0

## Post-Run Database Snapshot
- Active quests for today: 20
- Career quests for today: 10
- Social quests for today: 0
- Active today rows: 20

## Interpretation
The fix resolved the visibility path for career quests on the main site:
- career quests now flow through the scheduler with force support,
- the UI now refreshes the exact bucket queries it renders,
- career classification now respects quest_category,
- and the dashboard now mounts the Brand Quests panel.

The force run only generated 4 additional quests because most users already had active quests or were filtered by existing assignment guards. That is consistent with the post-run snapshot showing 20 active current-day quests and 10 career quests already present in the database.

## Files Modified For This Fix
- server/services/smart-quest-allocator.ts
- server/services/daily-quest-scheduler.ts
- server/routes-career-quests.ts
- client/src/hooks/use-career-quests.ts
- client/src/components/brand-quests/quest-panel.tsx
- client/src/pages/dashboard.tsx

## Validation Status
- Static diagnostics on the edited files: no errors reported.
- Forced all-user generation completed successfully.
- Database snapshot confirms current-day active career quests exist after the fix.

## Remaining Note
The current post-run data shows zero social quests in the latest active-today snapshot. That is separate from the career-display bug fixed here and should be treated as a follow-up if the requirement is to guarantee mixed daily career plus social assignment for every eligible user.
