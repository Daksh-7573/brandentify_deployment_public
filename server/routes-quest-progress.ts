/**
 * Quest Progress Routes
 * 
 * This file adds middleware to existing API routes to automatically track
 * user actions and update quest progress for engagement-related quests.
 */

import { Router, Request, Response, NextFunction } from "express";
import { IStorage } from "./storage";
import { trackUserAction } from "./services/quest-progress-tracker";

export function setupQuestProgressMiddleware(apiRouter: Router, storage: IStorage) {
  console.log("Setting up Quest Progress Middleware");
  
  // Middleware to track pulse creation
  const trackPulseCreation = async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    res.send = function(body) {
      // Check if response is successful (status 2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          // Parse response body if it's a string
          const responseBody = typeof body === 'string' ? JSON.parse(body) : body;
          
          // Check if we have a valid pulse with userId
          if (responseBody?.id && responseBody?.userId) {
            console.log(`[trackPulseCreation] Tracking pulse creation for user ${responseBody.userId}`);
            
            // Track pulse creation asynchronously (don't wait for completion)
            trackUserAction(storage, responseBody.userId, 'create_pulse')
              .catch(err => console.error('[trackPulseCreation] Error tracking pulse creation:', err));
            
            // Track hashtags if present in content
            if (responseBody.content && responseBody.content.includes('#')) {
              // Count the number of hashtags in the content
              const hashtagMatches = responseBody.content.match(/#[a-zA-Z0-9_]+/g);
              if (hashtagMatches && hashtagMatches.length > 0) {
                console.log(`[trackPulseCreation] Tracking ${hashtagMatches.length} hashtags for user ${responseBody.userId}`);
                trackUserAction(storage, responseBody.userId, 'add_hashtag', hashtagMatches.length)
                  .catch(err => console.error('[trackPulseCreation] Error tracking hashtags:', err));
              }
            }
            
            // Track media if this is a media pulse
            if (responseBody.type === 'media-pulse' && responseBody.mediaUrls && responseBody.mediaUrls.length > 0) {
              console.log(`[trackPulseCreation] Tracking media addition for user ${responseBody.userId}`);
              trackUserAction(storage, responseBody.userId, 'add_media', responseBody.mediaUrls.length)
                .catch(err => console.error('[trackPulseCreation] Error tracking media addition:', err));
            }
          }
        } catch (error) {
          console.error('[trackPulseCreation] Error processing response:', error);
        }
      }
      
      // Continue with the original send
      return originalSend.call(this, body);
    };
    
    next();
  };
  
  // Middleware to track pulse comments
  const trackPulseComment = async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    res.send = function(body) {
      // Check if response is successful (status 2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          // Parse response body if it's a string
          const responseBody = typeof body === 'string' ? JSON.parse(body) : body;
          
          // Check if we have a valid comment with userId
          if (responseBody?.id && responseBody?.userId) {
            console.log(`[trackPulseComment] Tracking comment creation for user ${responseBody.userId}`);
            
            // Track comment creation asynchronously
            trackUserAction(storage, responseBody.userId, 'add_comment')
              .catch(err => console.error('[trackPulseComment] Error tracking comment creation:', err));
          }
        } catch (error) {
          console.error('[trackPulseComment] Error processing response:', error);
        }
      }
      
      // Continue with the original send
      return originalSend.call(this, body);
    };
    
    next();
  };
  
  // Middleware to track pulse reactions
  const trackPulseReaction = async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    res.send = function(body) {
      // Check if response is successful (status 2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          // Parse response body if it's a string
          const responseBody = typeof body === 'string' ? JSON.parse(body) : body;
          
          // Check if we have a valid reaction with userId and reactionType
          if (responseBody?.id && responseBody?.userId && responseBody?.reactionType) {
            console.log(`[trackPulseReaction] Tracking ${responseBody.reactionType} reaction for user ${responseBody.userId}`);
            
            // Track reaction creation asynchronously
            const actionType = responseBody.reactionType === 'insightful' 
              ? 'add_reaction_insightful' 
              : 'add_reaction_misinformed';
              
            trackUserAction(storage, responseBody.userId, actionType)
              .catch(err => console.error(`[trackPulseReaction] Error tracking ${responseBody.reactionType} reaction:`, err));
          }
        } catch (error) {
          console.error('[trackPulseReaction] Error processing response:', error);
        }
      }
      
      // Continue with the original send
      return originalSend.call(this, body);
    };
    
    next();
  };
  
  // Middleware to track pulse shares
  const trackPulseShare = async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    res.send = function(body) {
      // Check if response is successful (status 2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          // Parse response body if it's a string
          const responseBody = typeof body === 'string' ? JSON.parse(body) : body;
          
          // Check if we have a valid share with senderId
          if (responseBody?.id && responseBody?.senderId) {
            console.log(`[trackPulseShare] Tracking pulse share for user ${responseBody.senderId}`);
            
            // Track share creation asynchronously
            trackUserAction(storage, responseBody.senderId, 'share_pulse')
              .catch(err => console.error('[trackPulseShare] Error tracking pulse share:', err));
          }
        } catch (error) {
          console.error('[trackPulseShare] Error processing response:', error);
        }
      }
      
      // Continue with the original send
      return originalSend.call(this, body);
    };
    
    next();
  };
  
  // Apply middleware to relevant routes
  
  // Pulse creation tracking
  apiRouter.post("/pulses", trackPulseCreation);
  apiRouter.post("/news-pulses", trackPulseCreation);
  
  // Comment tracking
  apiRouter.post("/pulse-comments", trackPulseComment);
  
  // Reaction tracking
  apiRouter.post("/pulse-reactions", trackPulseReaction);
  
  // Share tracking
  apiRouter.post("/pulse-shares", trackPulseShare);
  
  console.log("Quest Progress Middleware setup complete");
}