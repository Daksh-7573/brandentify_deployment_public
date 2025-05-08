/**
 * Quest Progress Tracker Middleware
 * 
 * This middleware automatically tracks user progress for engagement quests
 * by intercepting relevant API calls and updating quest progress.
 * 
 * OPTIMIZED VERSION:
 * - Reduced unnecessary debug logging
 * - Simplified quest tracking logic
 * - Focused on core engagement quests only
 */

import { Request, Response, NextFunction } from 'express';
import { pool } from '../db';
import { updateQuestProgress } from '../services/quest-progress-service';

// Extend Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        [key: string]: any;
      };
    }
  }
}

interface QuestTracker {
  targetAction: string;
  routePattern: RegExp;
  method: string;
  progressExtractor: (req: Request) => Promise<number>;
  routeName: string; // Made required for better clarity
}

// List of trackers for the core engagement activities
const questTrackers: QuestTracker[] = [
  // Comment creation tracker
  {
    targetAction: 'comment_on_pulse',
    routePattern: /^\/api\/comments(?:\/.*)?$/,
    method: 'POST',
    progressExtractor: async () => 1, // Increment by 1 for each comment
    routeName: 'comments'
  },
  
  // Reaction tracker
  {
    targetAction: 'react_to_pulse',
    routePattern: /^\/api\/reactions(?:\/.*)?$/,
    method: 'POST',
    progressExtractor: async () => 1, // Increment by 1 for each reaction
    routeName: 'reactions'
  },
  
  // Media upload tracker
  {
    targetAction: 'add_media_to_pulse',
    routePattern: /^\/api\/media(?:\/.*)?$/,
    method: 'POST',
    progressExtractor: async () => 1, // Increment by 1 for each media upload
    routeName: 'media'
  }
];

/**
 * Finds active quests for a user that match the given target action
 * Optimized to only fetch the necessary data
 * Simplified to handle the core engagement quests only
 */
async function findMatchingQuests(userId: number, targetAction: string): Promise<any[]> {
  try {
    // Using the updated SQL query with simplified WHERE clause
    const result = await pool.query(`
      SELECT 
        uq.id,
        uq.user_id as "userId",
        uq.progress,
        qd.target_count as "targetCount",
        qd.target_action
      FROM user_quests uq
      JOIN quest_definitions qd ON uq.quest_definition_id = qd.id
      WHERE 
        uq.user_id = $1 AND
        uq.status = 'active' AND
        qd.target_action = $2 AND
        qd.is_active = true
    `, [userId, targetAction]);
    
    console.log(`[Quest Tracker] Found ${result.rows.length} active quests for action '${targetAction}'`);
    return result.rows;
  } catch (error) {
    console.error(`[Quest Tracker] Error finding matching quests for action ${targetAction}:`, error);
    return [];
  }
}

/**
 * The quest progress tracking middleware - optimized and simplified version
 * Focuses only on tracking the core engagement quests (comments, reactions, media)
 */
export const questProgressMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Get originalEnd before we modify anything
  const originalResEnd = res.end;
  
  // Replace res.end with our custom version
  // @ts-ignore: Ignore TS checking on this method override
  res.end = function() {
    // Only track successful responses
    if (res.statusCode >= 200 && res.statusCode < 300) {
      // Try to find a user ID from various sources
      const userId = 
        req.user?.id || 
        req.body?.userId || 
        (req.params?.userId ? parseInt(req.params.userId, 10) : null) || 
        (req.query?.userId ? parseInt(req.query.userId as string, 10) : null);
      
      if (userId) {
        const path = req.originalUrl || req.url || '';
        const method = req.method || 'GET';
        
        // Find a tracker that matches this request
        const tracker = questTrackers.find(t => 
          t.routePattern.test(path) && t.method === method
        );
        
        if (tracker) {
          // Use setTimeout to process asynchronously
          setTimeout(() => {
            // This runs after the response is sent
            processQuestProgress(userId, tracker, req).catch(err => {
              console.error('[Quest Tracker] Error:', err);
            });
          }, 10);
        }
      }
    }
    
    // Call the original method with the original context and arguments
    // @ts-ignore: Allow using arguments
    return originalResEnd.apply(res, arguments);
  };
  
  next();
};

/**
 * Helper function to process quest progress asynchronously
 * Extracted to separate function to keep the middleware clean
 */
async function processQuestProgress(userId: number, tracker: QuestTracker, req: Request): Promise<void> {
  try {
    console.log(`[Quest Tracker] Activity detected: ${tracker.targetAction} by user ${userId}`);
    
    // Find matching quests
    const matchingQuests = await findMatchingQuests(userId, tracker.targetAction);
    
    if (matchingQuests.length === 0) {
      return; // No matching quests, nothing to do
    }
    
    // Get progress increment
    const progressIncrement = await tracker.progressExtractor(req);
    
    // Update each matching quest
    for (const quest of matchingQuests) {
      const newProgress = quest.progress + progressIncrement;
      console.log(`[Quest Tracker] Updating quest ${quest.id}: ${quest.progress} → ${newProgress} (target: ${quest.targetCount})`);
      
      try {
        await updateQuestProgress(quest.id, userId, newProgress);
      } catch (error) {
        console.error(`[Quest Tracker] Failed to update quest ${quest.id}:`, error);
      }
    }
  } catch (error) {
    console.error('[Quest Tracker] Error processing quest activity:', error);
  }
}