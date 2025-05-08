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
  // Store the original end method so we can hook into it
  const originalEnd = res.end;
  
  // Override the end method
  // @ts-ignore - TypeScript doesn't understand this pattern, but it works
  res.end = function() {
    // Only process on successful responses
    if (res.statusCode >= 200 && res.statusCode < 300) {
      try {
        // Extract userId using a more reliable approach
        const userId = req.user?.id || // First try to get from authenticated user
                      req.body?.userId || 
                      parseInt(req.params?.userId as string, 10) || 
                      parseInt(req.query?.userId as string, 10);
        
        if (!userId) {
          // Skip if no userId found - quietly exit without error
          return originalEnd.apply(res, arguments);
        }
        
        const path = req.originalUrl || req.url || req.path;
        const method = req.method;
        
        // Find matching tracker for this route and method
        const matchingTracker = questTrackers.find(tracker => 
          tracker.routePattern.test(path) && tracker.method === method
        );
        
        if (matchingTracker) {
          // Process in background to not block response
          (async () => {
            try {
              console.log(`[Quest Tracker] Engagement activity detected: ${matchingTracker.targetAction} by user ${userId}`);
              
              // Find matching quests for this action
              const matchingQuests = await findMatchingQuests(userId, matchingTracker.targetAction);
              
              if (matchingQuests.length === 0) {
                // Skip further processing if no matching quests
                return;
              }
              
              // Extract progress increment - always 1 for engagement quests
              const progressIncrement = await matchingTracker.progressExtractor(req);
              
              // Update progress for each matching quest
              for (const quest of matchingQuests) {
                const newProgress = quest.progress + progressIncrement;
                console.log(`[Quest Tracker] Updating quest ${quest.id} progress: ${quest.progress} → ${newProgress} (target: ${quest.targetCount})`);
                
                try {
                  await updateQuestProgress(quest.id, userId, newProgress);
                } catch (updateError) {
                  console.error(`[Quest Tracker] Error updating quest ${quest.id}:`, updateError);
                  // Continue with other quests even if one fails
                }
              }
            } catch (trackingError) {
              console.error('[Quest Tracker] Error processing quest activity:', trackingError);
            }
          })();
        }
      } catch (error) {
        console.error('[Quest Tracker] Error in quest tracking middleware:', error);
        // Continue normal response flow even if tracking fails
      }
    }
    
    // Call the original end function with all original arguments
    // @ts-ignore - TypeScript doesn't like this, but it works
    return originalEnd.apply(res, arguments);
  };
  
  next();
};