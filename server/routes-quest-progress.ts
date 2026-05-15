/**
 * Quest Progress Routes - Enhanced Version
 * 
 * This file adds middleware to existing API routes to automatically track
 * user actions and update quest progress for ALL quest types including:
 * - Content creation (pulses, media, projects)
 * - Engagement (likes, comments, reactions, shares)
 * - Networking (connections, messages, profile views)
 * - Profile updates (fields, skills, experience, recommendations)
 * - Career capsule (goals, milestones, tasks)
 * - Smart connect usage
 * - Search and discovery
 */

import { Router, Request, Response, NextFunction } from "express";
import { IStorage } from "./storage";
import { pool } from "./db";
import { 
  trackUserActionEnhanced, 
  TrackingActionType 
} from "./services/enhanced-quest-progress-tracker";

// Legacy action types (for backward compatibility)
type LegacyActionType = 
  | 'create_pulse'
  | 'add_comment'
  | 'add_reaction'
  | 'share_pulse'
  | 'add_media'
  | 'add_hashtag';

/**
 * Enhanced track user action - uses the new comprehensive tracking system
 * @param userId User ID
 * @param actionType Type of action performed
 * @param count Optional count to increment by (default: 1)
 * @param metadata Optional metadata about the action
 */
export async function trackUserAction(
  userId: number,
  actionType: TrackingActionType,
  count: number = 1,
  metadata?: any
): Promise<void> {
  console.log(`[trackUserAction] User ${userId} performed action: ${actionType} (count: ${count})`);
  
  try {
    // Use the enhanced tracker
    const results = await trackUserActionEnhanced(userId, actionType, count, metadata);
    
    if (results.length > 0) {
      const completedCount = results.filter(r => r.completed).length;
      console.log(`[trackUserAction] Updated ${results.length} quests, ${completedCount} completed`);
    }
  } catch (error) {
    console.error(`[trackUserAction] Error tracking user action:`, error);
  }
}

// Factory function to create tracking middleware for different actions
function createActionTrackingMiddleware(
  actionType: TrackingActionType,
  userIdExtractor: (req: Request, body: any) => number | undefined,
  countExtractor: (req: Request, body: any) => number = () => 1,
  metadataExtractor?: (req: Request, body: any) => any
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    res.send = function(body) {
      // Check if response is successful (status 2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          // Parse response body if it's a string
          const responseBody = typeof body === 'string' ? JSON.parse(body) : body;
          
          // Extract user ID from request or response
          const userId = userIdExtractor(req, responseBody);
          
          if (userId) {
            console.log(`[trackAction:${actionType}] Tracking for user ${userId}`);
            
            // Extract count (if applicable)
            const count = countExtractor(req, responseBody);
            
            // Extract metadata (if applicable)
            const metadata = metadataExtractor ? metadataExtractor(req, responseBody) : undefined;
            
            // Track action asynchronously (don't wait for completion)
            trackUserAction(userId, actionType, count, metadata)
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

// Enhanced user ID extractor that checks both request and response
function extractUserId(req: Request, body: any): number | undefined {
  // Try request body first
  if (req.body?.userId) return req.body.userId;
  if (req.body?.senderId) return req.body.senderId;
  if (req.body?.authorId) return req.body.authorId;
  
  // Try response body
  if (body?.userId) return body.userId;
  if (body?.senderId) return body.senderId;
  if (body?.authorId) return body.authorId;
  if (body?.id && body?.username) return body.id; // If full user object returned
  
  // Try query params
  if (req.query?.userId) return parseInt(req.query.userId as string);
  
  return undefined;
}

export function setupQuestProgressMiddleware(apiRouter: Router, storage: IStorage) {
  console.log("Setting up Quest Progress Middleware");
  
  // Make storage available to middleware
  apiRouter.use((req, _res, next) => {
    req.app.locals.storage = storage;
    next();
  });
  
  // Create middleware for each action type using enhanced tracking
  
  // Pulse creation tracking - tracks creating posts
  const trackPulseCreation = createActionTrackingMiddleware(
    'pulse_created',
    extractUserId,
    () => 1
  );
  
  // Pulse with media tracking
  const trackPulseWithMedia = createActionTrackingMiddleware(
    'pulse_with_media_created',
    extractUserId,
    (req) => req.body?.mediaUrls?.length || 1
  );
  
  // Comment tracking - tracks commenting on pulses
  const trackPulseComment = createActionTrackingMiddleware(
    'post_commented',
    extractUserId,
    () => 1
  );
  
  // Reaction tracking - tracks giving reactions
  const trackPulseReaction = createActionTrackingMiddleware(
    'post_liked',
    extractUserId,
    () => 1
  );
  
  // Share tracking - tracks sharing pulses
  const trackPulseShare = createActionTrackingMiddleware(
    'post_shared',
    extractUserId,
    () => 1
  );
  
  // Profile update tracking
  const trackProfileUpdate = createActionTrackingMiddleware(
    'profile_field_updated',
    extractUserId,
    () => 1,
    (req) => ({ fieldName: req.body?.fieldName })
  );
  
  // Connection request tracking
  const trackConnectionRequest = createActionTrackingMiddleware(
    'connection_request_sent',
    extractUserId,
    () => 1,
    (req, body) => ({ targetUserId: body?.receiverId || body?.targetUserId })
  );
  
  // Work experience added tracking
  const trackWorkExperience = createActionTrackingMiddleware(
    'work_experience_added',
    extractUserId,
    () => 1
  );
  
  // Skill added tracking
  const trackSkillAdded = createActionTrackingMiddleware(
    'skill_added',
    extractUserId,
    () => 1,
    (req) => ({ skillName: req.body?.skillName })
  );
  
  // Career goal tracking
  const trackCareerGoal = createActionTrackingMiddleware(
    'career_goal_created',
    extractUserId,
    () => 1
  );
  
  // Smart connect usage tracking
  const trackSmartConnect = createActionTrackingMiddleware(
    'smart_connect_used',
    extractUserId,
    () => 1
  );
  
  // Search tracking
  const trackSearch = createActionTrackingMiddleware(
    'search_performed',
    extractUserId,
    () => 1,
    (req) => ({ searchQuery: req.query?.q || req.body?.query })
  );
  
  // Resume update tracking
  const trackResumeUpdate = createActionTrackingMiddleware(
    'resume_updated',
    extractUserId,
    () => 1
  );
  
  // Apply middleware to relevant routes
  
  // === CONTENT CREATION ROUTES ===
  // Pulse creation tracking
  apiRouter.post("/pulses", trackPulseCreation);
  apiRouter.post("/news-pulses", trackPulseCreation);
  apiRouter.post("/pulses", trackPulseWithMedia); // Also track media
  
  // === ENGAGEMENT ROUTES ===
  // Comment tracking
  apiRouter.post("/pulse-comments", trackPulseComment);
  apiRouter.post("/comments", trackPulseComment);
  apiRouter.post("/pulses/:id/comments", trackPulseComment);
  
  // Reaction tracking
  apiRouter.post("/pulse-reactions", trackPulseReaction);
  apiRouter.post("/reactions", trackPulseReaction);
  apiRouter.post("/pulses/:id/reactions", trackPulseReaction);
  
  // Share tracking
  apiRouter.post("/pulse-shares", trackPulseShare);
  apiRouter.post("/shares", trackPulseShare);
  
  // === PROFILE UPDATE ROUTES ===
  // Profile field updates
  apiRouter.put("/users/:id", trackProfileUpdate);
  apiRouter.patch("/users/:id", trackProfileUpdate);
  
  // Work experience
  apiRouter.post("/work-experiences", trackWorkExperience);
  apiRouter.post("/users/:id/work-experiences", trackWorkExperience);
  
  // Skills
  apiRouter.post("/skills", trackSkillAdded);
  apiRouter.post("/users/:id/skills", trackSkillAdded);
  
  // === NETWORKING ROUTES ===
  // Connection requests
  apiRouter.post("/connection-requests", trackConnectionRequest);
  apiRouter.post("/users/:userId/follow", trackConnectionRequest);
  apiRouter.post("/users/:userId/connect", trackConnectionRequest);
  
  // === CAREER CAPSULE ROUTES ===
  apiRouter.post("/career-goals", trackCareerGoal);
  apiRouter.post("/career-capsule/goals", trackCareerGoal);
  apiRouter.post("/api/career-capsule/goals", trackCareerGoal);
  
  // === SMART CONNECT ROUTES ===
  apiRouter.post("/smart-connect", trackSmartConnect);
  apiRouter.post("/smart-suggestions/connect", trackSmartConnect);
  
  // === SEARCH ROUTES ===
  apiRouter.get("/search", trackSearch);
  apiRouter.get("/users/search", trackSearch);
  apiRouter.get("/search-users", trackSearch);
  
  // === RESUME ROUTES ===
  apiRouter.post("/resumes", trackResumeUpdate);
  apiRouter.post("/resume/parse", trackResumeUpdate);
  apiRouter.put("/users/:userId/resume", trackResumeUpdate);
  
  console.log("✅ Enhanced Quest Progress Middleware setup complete");
  console.log("📊 Tracking: Content, Engagement, Networking, Profile, Career, Search, Resume");
}