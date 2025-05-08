/**
 * Quest Progress Tracker Middleware
 * 
 * This middleware automatically tracks user progress for engagement quests
 * by intercepting relevant API calls and updating quest progress.
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
}

// List of trackers for different engagement activities
const questTrackers: QuestTracker[] = [
  // Comment creation tracker
  {
    targetAction: 'comment_on_pulse',
    routePattern: /^\/api\/comments$/,
    method: 'POST',
    progressExtractor: async (req: Request) => 1 // Increment by 1 for each comment
  },
  
  // Reaction tracker
  {
    targetAction: 'react_to_pulse',
    routePattern: /^\/api\/reactions$/,
    method: 'POST',
    progressExtractor: async (req: Request) => 1 // Increment by 1 for each reaction
  },
  
  // Media upload tracker
  {
    targetAction: 'add_media_to_pulse',
    routePattern: /^\/api\/media$/,
    method: 'POST',
    progressExtractor: async (req: Request) => 1 // Increment by 1 for each media upload
  },
  
  // Pulse creation tracker
  {
    targetAction: 'create_pulse',
    routePattern: /^\/api\/pulses$/,
    method: 'POST',
    progressExtractor: async (req: Request) => 1 // Increment by 1 for each post
  },
  
  // Profile sharing tracker
  {
    targetAction: 'share_profile',
    routePattern: /^\/api\/shares$/,
    method: 'POST',
    progressExtractor: async (req: Request) => 1 // Increment by 1 for each share
  }
];

/**
 * Finds active quests for a user that match the given target action
 */
async function findMatchingQuests(userId: number, targetAction: string): Promise<any[]> {
  try {
    // Find all active quests for this user that match the target action
    const result = await pool.query(`
      SELECT 
        uq.id,
        uq.user_id as "userId",
        uq.quest_definition_id as "questDefinitionId",
        uq.status,
        uq.progress,
        qd.target_count as "targetCount",
        qd.target_action as "targetAction"
      FROM user_quests uq
      JOIN quest_definitions qd ON uq.quest_definition_id = qd.id
      WHERE 
        uq.user_id = $1 AND
        uq.status = 'active' AND
        qd.target_action = $2
    `, [userId, targetAction]);
    
    return result.rows;
  } catch (error) {
    console.error(`Error finding matching quests for action ${targetAction}:`, error);
    return [];
  }
}

/**
 * The main quest progress tracking middleware
 */
export const questProgressMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Store the original end method so we can hook into it
  const originalEnd = res.end;
  
  // A simpler approach: just override the end method with a simpler function
  // that calls the original end after doing our tracking work
  // @ts-ignore - TypeScript doesn't understand this pattern, so we ignore the error
  res.end = function() {
    // Only track successful requests (2xx status codes)
    if (res.statusCode >= 200 && res.statusCode < 300) {
      try {
        // Get userId from request body or query parameters
        // For JSON requests, we use the userId in the request body
        const userId = req.body?.userId || parseInt(req.query?.userId as string, 10);
        
        if (userId) {
          console.log(`[Quest Tracker] Processing request with userId: ${userId}`);
          const path = req.path;
          const method = req.method;
          
          // Log all trackers for debugging
          console.log(`[Quest Tracker] Available trackers: ${questTrackers.map(t => t.targetAction).join(', ')}`);
          
          // Find matching tracker for this route and method
          const matchingTracker = questTrackers.find(tracker => 
            tracker.routePattern.test(path) && tracker.method === method
          );
          
          if (matchingTracker) {
            console.log(`[Quest Tracker] Found matching tracker for ${path} (${method}): ${matchingTracker.targetAction}`);
            
            // Process in background to not block response
            (async () => {
              try {
                // Get all quest definitions for debugging
                const allDefinitions = await pool.query(`
                  SELECT id, title, target_action, target_count 
                  FROM quest_definitions 
                  WHERE target_action = $1
                `, [matchingTracker.targetAction]);
                
                console.log(`[Quest Tracker] Quest definitions for action ${matchingTracker.targetAction}:`, 
                  allDefinitions.rows.map(r => `${r.id}: ${r.title} (${r.target_action})`).join(', '));
                
                // Find matching quests for this action
                const matchingQuests = await findMatchingQuests(userId, matchingTracker.targetAction);
                
                if (matchingQuests.length > 0) {
                  console.log(`[Quest Tracker] Found ${matchingQuests.length} matching quests for action ${matchingTracker.targetAction}:`, 
                    matchingQuests.map(q => `${q.id} (progress: ${q.progress}/${q.targetCount})`).join(', '));
                  
                  // Extract progress increment
                  const progressIncrement = await matchingTracker.progressExtractor(req);
                  console.log(`[Quest Tracker] Progress increment: ${progressIncrement}`);
                  
                  // Update progress for each matching quest
                  for (const quest of matchingQuests) {
                    const newProgress = quest.progress + progressIncrement;
                    
                    console.log(`[Quest Tracker] Automatically updating quest ${quest.id} progress from ${quest.progress} to ${newProgress}`);
                    
                    await updateQuestProgress(quest.id, userId, newProgress);
                  }
                } else {
                  console.log(`[Quest Tracker] No matching quests found for userId ${userId} and action ${matchingTracker.targetAction}`);
                  
                  // Check all user quests for debugging
                  const userQuests = await pool.query(`
                    SELECT uq.id, uq.quest_definition_id, uq.status, uq.progress, qd.title, qd.target_action, qd.target_count
                    FROM user_quests uq
                    JOIN quest_definitions qd ON uq.quest_definition_id = qd.id
                    WHERE uq.user_id = $1 AND uq.status = 'active'
                  `, [userId]);
                  
                  console.log(`[Quest Tracker] All active quests for user ${userId}:`, 
                    userQuests.rows.map(q => `${q.id}: ${q.title} (${q.target_action})`).join(', '));
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