/**
 * Smart Quest Routes
 * API endpoints for weekly quest generation and post suggestions
 */

import { Router } from 'express';
import { smartQuestController } from './controllers/smart-quest.controller';

const router = Router();

/**
 * GET /api/smart-quests/weekly
 * Get or generate weekly quest for authenticated user
 * Returns existing quest if already generated this week
 */
router.get('/weekly', smartQuestController.getWeeklyQuest);

/**
 * GET /api/smart-quests/post-suggestions
 * Get AI-powered post suggestions based on user profile
 * Query params:
 *  - count: number of suggestions (default: 3)
 */
router.get('/post-suggestions', smartQuestController.getPostSuggestions);

/**
 * GET /api/smart-quests/weekly-status
 * Check weekly quest status without generating
 * Returns: hasQuestThisWeek, canGenerateNew, nextAvailableDate
 */
router.get('/weekly-status', smartQuestController.getWeeklyQuestStatus);

/**
 * GET /api/smart-quests/debug/generate-quest
 * Debug helper for testing quest uniqueness and lock windows.
 * Query params:
 *  - lockWindowMinutes=1 (fast-cycle test)
 */
router.get('/debug/generate-quest', smartQuestController.debugGenerateQuest);

export default router;
