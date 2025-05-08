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
    targetAction: 'create_comment',
    routePattern: /^\/api\/comments$/,
    method: 'POST',
    progressExtractor: async (req: Request) => 1 // Increment by 1 for each comment
  },
  
  // Reaction tracker
  {
    targetAction: 'give_reaction',
    routePattern: /^\/api\/reactions$/,
    method: 'POST',
    progressExtractor: async (req: Request) => 1 // Increment by 1 for each reaction
  },
  
  // Media upload tracker
  {
    targetAction: 'upload_media',
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
  
  // Override the end method to check for successful requests
  // We need to completely redefine the signature to avoid TypeScript errors
  const endProxy = function(chunk: any, encoding?: any, callback?: any): any {
    // Only track successful requests (2xx status codes)
    if (res.statusCode >= 200 && res.statusCode < 300) {
      // If user is authenticated and we have their ID
      if (req.user?.id) {
        const userId = req.user.id;
        const path = req.path;
        const method = req.method;
        
        // Find matching tracker for this route and method
        const matchingTracker = questTrackers.find(tracker => 
          tracker.routePattern.test(path) && tracker.method === method
        );
        
        if (matchingTracker) {
          // Process in background to not block response
          (async () => {
            try {
              // Find matching quests for this action
              const matchingQuests = await findMatchingQuests(userId, matchingTracker.targetAction);
              
              if (matchingQuests.length > 0) {
                console.log(`[Quest Tracker] Found ${matchingQuests.length} matching quests for action ${matchingTracker.targetAction}`);
                
                // Extract progress increment
                const progressIncrement = await matchingTracker.progressExtractor(req);
                
                // Update progress for each matching quest
                for (const quest of matchingQuests) {
                  const newProgress = quest.progress + progressIncrement;
                  
                  console.log(`[Quest Tracker] Automatically updating quest ${quest.id} progress from ${quest.progress} to ${newProgress}`);
                  
                  await updateQuestProgress(quest.id, userId, newProgress);
                }
              }
            } catch (error) {
              console.error('[Quest Tracker] Error in quest progress tracking:', error);
            }
          })();
        }
      }
    }
    
    // Call the original end method with appropriate arguments
    if (callback && typeof callback === 'function') {
      return originalEnd.call(res, chunk, encoding, callback);
    } else if (encoding && typeof encoding === 'function') {
      return originalEnd.call(res, chunk, encoding);
    } else {
      return originalEnd.call(res, chunk);
    }
  };
  
  // @ts-ignore - Override the res.end method
  res.end = endProxy;
  
  next();
};