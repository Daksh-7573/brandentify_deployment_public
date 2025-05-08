/**
 * Quest Progress Routes
 * 
 * This file adds middleware to existing API routes to automatically track
 * user actions and update quest progress for engagement-related quests.
 */

import { Router, Request, Response, NextFunction } from "express";
import { IStorage } from "./storage";
import { pool } from "./db";

// Action types that can trigger quest progress updates
type ActionType = 
  | 'create_pulse'
  | 'add_comment'
  | 'add_reaction'
  | 'share_pulse'
  | 'add_media'
  | 'add_hashtag';

/**
 * Update quest progress when user performs an action
 * @param storage The storage interface
 * @param userId User ID
 * @param actionType Type of action performed
 * @param count Optional count to increment by (default: 1)
 */
export async function trackUserAction(
  storage: IStorage,
  userId: number,
  actionType: ActionType,
  count: number = 1
): Promise<void> {
  console.log(`[trackUserAction] User ${userId} performed action: ${actionType} (count: ${count})`);
  
  try {
    // 1. Get user's active quests for the current week
    const currentWeekQuests = await storage.getCurrentWeekUserQuests(userId);
    if (!currentWeekQuests || currentWeekQuests.length === 0) {
      console.log(`[trackUserAction] No active quests found for user ${userId}`);
      return;
    }

    // 2. Get all quest definitions to match actions to target_action
    const questDefinitions = await storage.getQuestDefinitions();
    if (!questDefinitions || questDefinitions.length === 0) {
      console.log(`[trackUserAction] No quest definitions found`);
      return;
    }

    // 3. Map the user action to quest target_action values
    const targetActionMapping: Record<ActionType, string> = {
      'create_pulse': 'create_pulse',
      'add_hashtag': 'add_hashtag',
      'add_comment': 'add_comment',
      'add_reaction': 'give_reaction',
      'share_pulse': 'share_profile',
      'add_media': 'upload_media'
    };

    const targetAction = targetActionMapping[actionType];
    
    if (!targetAction) {
      console.log(`[trackUserAction] Unknown action type: ${actionType}`);
      return;
    }
    
    // 4. Find matching quests that track this type of action
    const matchingQuests = currentWeekQuests.filter((quest: any) => {
      // Get the definition for this quest
      const definition = questDefinitions.find(
        def => def.id === quest.questDefinitionId
      );
      
      // Only return quests that are active and match the target action
      return (
        quest.status === 'active' && 
        definition?.targetAction === targetAction
      );
    });

    if (matchingQuests.length === 0) {
      console.log(`[trackUserAction] No matching quests found for action ${actionType}`);
      return;
    }

    // 5. Update progress for each matching quest
    for (const quest of matchingQuests) {
      console.log(`[trackUserAction] Updating progress for quest ${quest.id}, action ${actionType}`);
      
      // Get current progress and definition
      const currentProgress = quest.progress || 0;
      const definition = questDefinitions.find(def => def.id === quest.questDefinitionId);
      if (!definition) continue;

      // Calculate new progress
      const newProgress = currentProgress + count;
      
      // If new progress meets or exceeds target, complete the quest
      if (newProgress >= definition.targetCount) {
        console.log(`[trackUserAction] Quest ${quest.id} completed! New progress: ${newProgress}, Target: ${definition.targetCount}`);
        await storage.completeUserQuest(quest.id, definition.xpReward);
      } else {
        // Otherwise just update the progress
        console.log(`[trackUserAction] Updating quest ${quest.id} progress to ${newProgress}`);
        await storage.updateUserQuest(quest.id, { progress: newProgress });
      }
    }

    console.log(`[trackUserAction] Successfully processed action ${actionType} for user ${userId}`);
  } catch (error) {
    console.error(`[trackUserAction] Error tracking user action:`, error);
  }
}

// Factory function to create tracking middleware for different actions
function createActionTrackingMiddleware(
  actionType: ActionType,
  userIdExtractor: (body: any) => number | undefined,
  countExtractor: (body: any) => number = () => 1
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    res.send = function(body) {
      // Check if response is successful (status 2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          // Parse response body if it's a string
          const responseBody = typeof body === 'string' ? JSON.parse(body) : body;
          
          // Extract user ID
          const userId = userIdExtractor(responseBody);
          
          if (userId) {
            console.log(`[trackAction:${actionType}] Tracking for user ${userId}`);
            
            // Extract count (if applicable)
            const count = countExtractor(responseBody);
            
            // Track action asynchronously (don't wait for completion)
            trackUserAction(req.app.locals.storage, userId, actionType, count)
              .catch(err => console.error(`[trackAction:${actionType}] Error tracking:`, err));
          }
        } catch (error) {
          console.error(`[trackAction:${actionType}] Error processing response:`, error);
        }
      }
      
      // Continue with the original send
      return originalSend.call(this, body);
    };
    
    next();
  };
}

export function setupQuestProgressMiddleware(apiRouter: Router, storage: IStorage) {
  console.log("Setting up Quest Progress Middleware");
  
  // Make storage available to middleware
  apiRouter.use((req, _res, next) => {
    req.app.locals.storage = storage;
    next();
  });
  
  // Create middleware for each action type
  
  // Pulse creation tracking - tracks creating posts
  const trackPulseCreation = createActionTrackingMiddleware(
    'create_pulse',
    body => body?.userId,
  );
  
  // Comment tracking - tracks commenting on pulses
  const trackPulseComment = createActionTrackingMiddleware(
    'add_comment',
    body => body?.userId,
  );
  
  // Reaction tracking - tracks giving reactions
  const trackPulseReaction = createActionTrackingMiddleware(
    'add_reaction',
    body => body?.userId,
  );
  
  // Share tracking - tracks sharing pulses
  const trackPulseShare = createActionTrackingMiddleware(
    'share_pulse',
    body => body?.senderId,
  );
  
  // Media upload tracking - tracks adding media to pulses
  const trackMediaUpload = createActionTrackingMiddleware(
    'add_media',
    body => body?.userId,
    body => body?.mediaUrls?.length || 1
  );
  
  // Hashtag tracking - tracks adding hashtags
  const trackHashtags = createActionTrackingMiddleware(
    'add_hashtag',
    body => body?.userId,
    body => {
      if (body?.content && typeof body.content === 'string') {
        const matches = body.content.match(/#[a-zA-Z0-9_]+/g);
        return matches ? matches.length : 0;
      }
      return 0;
    }
  );
  
  // Apply middleware to relevant routes
  
  // Pulse creation tracking
  apiRouter.post("/pulses", trackPulseCreation);
  apiRouter.post("/news-pulses", trackPulseCreation);
  
  // Comment tracking
  apiRouter.post("/pulse-comments", trackPulseComment);
  apiRouter.post("/comments", trackPulseComment);
  
  // Reaction tracking
  apiRouter.post("/pulse-reactions", trackPulseReaction);
  apiRouter.post("/reactions", trackPulseReaction);
  
  // Share tracking
  apiRouter.post("/pulse-shares", trackPulseShare);
  apiRouter.post("/shares", trackPulseShare);
  
  // Media tracking
  apiRouter.post("/media", trackMediaUpload);
  
  // Track hashtags on pulse creation too
  apiRouter.post("/pulses", trackHashtags);
  
  console.log("Quest Progress Middleware setup complete");
}