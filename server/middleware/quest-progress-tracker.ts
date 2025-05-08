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
 */
async function findMatchingQuests(userId: number, targetAction: string): Promise<any[]> {
  try {
    // Find all active quests for this user that match the target action
    const result = await pool.query(`
      SELECT 
        uq.id,
        uq.user_id as "userId",
        uq.progress,
        qd.target_count as "targetCount"
      FROM user_quests uq
      JOIN quest_definitions qd ON uq.quest_definition_id = qd.id
      WHERE 
        uq.user_id = $1 AND
        uq.status = 'active' AND
        qd.target_action = $2
    `, [userId, targetAction]);
    
    return result.rows;
  } catch (error) {
    console.error(`[Quest Tracker] Error finding matching quests for action ${targetAction}:`, error);
    return [];
  }
}

/**
 * The quest progress tracking middleware - optimized version
 */
export const questProgressMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Store the original end method so we can hook into it
  const originalEnd = res.end;
  
  // Override the end method
  // @ts-ignore - TypeScript doesn't understand this pattern, but it works
  res.end = function() {
    // Only track successful requests (2xx status codes)
    if (res.statusCode >= 200 && res.statusCode < 300) {
      try {
        // Get userId from request body, params, or query
        const userId = req.body?.userId || 
                      parseInt(req.params?.userId as string, 10) || 
                      parseInt(req.query?.userId as string, 10);
        
        if (userId) {
          const path = req.originalUrl || req.url || req.path;
          const method = req.method;
          
          // Find matching tracker for this route and method
          const matchingTracker = questTrackers.find(tracker => 
            tracker.routePattern.test(path) && tracker.method === method
          );
          
          if (matchingTracker) {
            console.log(`[Quest Tracker] Activity detected: ${matchingTracker.targetAction} by user ${userId} at ${path}`);
            
            // Process in background to not block response
            (async () => {
              try {
                // Find matching quests for this action
                const matchingQuests = await findMatchingQuests(userId, matchingTracker.targetAction);
                
                if (matchingQuests.length > 0) {
                  // Extract progress increment
                  const progressIncrement = await matchingTracker.progressExtractor(req);
                  
                  // Update progress for each matching quest
                  for (const quest of matchingQuests) {
                    const newProgress = quest.progress + progressIncrement;
                    console.log(`[Quest Tracker] Updating quest ${quest.id} progress from ${quest.progress} to ${newProgress} (target: ${quest.targetCount})`);
                    
                    await updateQuestProgress(quest.id, userId, newProgress);
                  }
                }
              } catch (error) {
                console.error('[Quest Tracker] Error in quest progress tracking:', error);
              }
            })();
          }
        }
      } catch (error) {
        console.error('[Quest Tracker] Error extracting userId:', error);
      }
    }
    
    // Call the original end function with all original arguments
    // @ts-ignore - TypeScript doesn't like this, but it works
    return originalEnd.apply(res, arguments);
  };
  
  next();
};