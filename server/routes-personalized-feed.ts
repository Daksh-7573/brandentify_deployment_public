/**
 * Personalized Feed API Routes
 * 
 * This module provides endpoints for the comprehensive personalized feed system
 * including all requested features: hashtag following, mentor following,
 * similar hashtags, engagement-based recommendations, industry matching,
 * and AI-detected interests.
 */

import { Router, Request, Response } from "express";
import { storage } from "./storage";
import { personalizedFeedService } from "./services/personalized-feed-service";
import { createNotification } from "./services/notification-service";

const router = Router();

/**
 * Get personalized feed for a user
 * Combines all personalization sources: followed hashtags, mentors, 
 * similar hashtags, engagement patterns, industry match, and AI interests
 */
router.get("/users/:userId/personalized-feed", async (req: Request, res: Response) => {
  try {
    const userIdParam = req.params.userId;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const includeTypes = req.query.types ? (req.query.types as string).split(',') : undefined;
    
    let userId: number;
    let userProfile: any = {};

    console.log(`[PersonalizedFeed] Getting feed for user ${userIdParam}`);
    
    // Handle Firebase UID or numeric ID
    if (userIdParam.length > 20) {
      const user = await storage.getUserByUsername(userIdParam);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      userId = user.id;
      userProfile = {
        industry: user.industry,
        domain: user.domain,
        location: user.location,
        title: user.title
      };
    } else {
      userId = parseInt(userIdParam);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Get user profile for industry/domain matching
      const user = await storage.getUser(userId);
      if (user) {
        userProfile = {
          industry: user.industry,
          domain: user.domain,
          location: user.location,
          title: user.title
        };
      }
    }

    // Generate personalized feed
    const feedResult = await personalizedFeedService.generatePersonalizedFeed(storage, {
      userId,
      userProfile,
      limit,
      offset,
      includeTypes
    });

    console.log(`[PersonalizedFeed] Generated ${feedResult.items.length} items for user ${userId}`);
    
    res.json(feedResult);
  } catch (error) {
    console.error("[PersonalizedFeed] Error generating feed:", error instanceof Error ? error.message : String(error));
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Get feed based on followed hashtags only
 */
router.get("/users/:userId/hashtag-feed", async (req: Request, res: Response) => {
  try {
    const userIdParam = req.params.userId;
    let userId: number;
    
    if (userIdParam.length > 20) {
      const user = await storage.getUserByUsername(userIdParam);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      userId = user.id;
    } else {
      userId = parseInt(userIdParam);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
    }

    const pulses = await storage.getPulsesByFollowedHashtags(userId);
    res.json(pulses);
  } catch (error) {
    console.error("[HashtagFeed] Error:", error instanceof Error ? error.message : String(error));
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Get feed based on followed mentors/users
 */
router.get("/users/:userId/mentor-feed", async (req: Request, res: Response) => {
  try {
    const userIdParam = req.params.userId;
    let userId: number;
    
    if (userIdParam.length > 20) {
      const user = await storage.getUserByUsername(userIdParam);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      userId = user.id;
    } else {
      userId = parseInt(userIdParam);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
    }

    const followedUsers = await storage.getFollowedUsersByUserId(userId);
    const userIds = followedUsers.map(fu => fu.followeeId);
    
    if (userIds.length === 0) {
      return res.json([]);
    }
    
    const pulses = await storage.getPulsesByUserIds(userIds);
    res.json(pulses);
  } catch (error) {
    console.error("[MentorFeed] Error:", error instanceof Error ? error.message : String(error));
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Follow a user (mentor)
 */
router.post("/users/:followerId/follow/:followeeId", async (req: Request, res: Response) => {
  try {
    const followerId = parseInt(req.params.followerId);
    const followeeId = parseInt(req.params.followeeId);
    
    if (isNaN(followerId) || isNaN(followeeId)) {
      return res.status(400).json({ message: "Invalid user IDs" });
    }
    
    if (followerId === followeeId) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    const result = await storage.followUser(followerId, followeeId);
    
    // Create notification for the user being followed
    try {
      const follower = await storage.getUser(followerId);
      const followerName = follower?.name || 'Someone';
      
      await createNotification({
        userId: followeeId,
        type: 'info',
        category: 'new_follower',
        title: 'New Follower',
        message: `${followerName} started following you`,
        isRead: false
      });
      
      console.log(`[POST /follow] ✅ Notification created for user ${followeeId} - new follower: ${followerId}`);
    } catch (notifError) {
      console.error('[POST /follow] ❌ Failed to create follower notification:', {
        error: notifError instanceof Error ? notifError.message : String(notifError),
        followerId: followerId,
        followeeId: followeeId
      });
      // Don't fail the follow if notification fails
    }
    
    res.json({ success: true, result });
  } catch (error) {
    console.error("[FollowUser] Error:", error instanceof Error ? error.message : String(error));
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Unfollow a user
 */
router.delete("/users/:followerId/follow/:followeeId", async (req: Request, res: Response) => {
  try {
    const followerId = parseInt(req.params.followerId);
    const followeeId = parseInt(req.params.followeeId);
    
    if (isNaN(followerId) || isNaN(followeeId)) {
      return res.status(400).json({ message: "Invalid user IDs" });
    }

    const success = await storage.unfollowUser(followerId, followeeId);
    res.json({ success });
  } catch (error) {
    console.error("[UnfollowUser] Error:", error instanceof Error ? error.message : String(error));
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Check if user is following another user
 */
router.get("/users/:followerId/following/:followeeId", async (req: Request, res: Response) => {
  try {
    const followerId = parseInt(req.params.followerId);
    const followeeId = parseInt(req.params.followeeId);
    
    if (isNaN(followerId) || isNaN(followeeId)) {
      return res.status(400).json({ message: "Invalid user IDs" });
    }

    const isFollowing = await storage.isUserFollowing(followerId, followeeId);
    res.json({ isFollowing });
  } catch (error) {
    console.error("[CheckFollowing] Error:", error instanceof Error ? error.message : String(error));
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Track user engagement for personalization learning
 */
router.post("/engagements", async (req: Request, res: Response) => {
  try {
    const { userId, pulseId, engagementType, weight } = req.body;
    
    if (!userId || !pulseId || !engagementType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Track engagement in database
    await personalizedFeedService.trackEngagement(
      storage,
      userId,
      pulseId,
      engagementType,
      weight || 1.0
    );

    res.json({ success: true });
  } catch (error) {
    console.error("[TrackEngagement] Error:", error instanceof Error ? error.message : String(error));
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Get user's AI-detected interests
 */
router.get("/users/:userId/interests", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const interests = await storage.getUserInterests(userId);
    res.json(interests);
  } catch (error) {
    console.error("[GetUserInterests] Error:", error instanceof Error ? error.message : String(error));
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Get user's followed hashtags
 */
router.get("/users/:userId/followed-hashtags", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const hashtags = await storage.getFollowedHashtagsByUserId(userId);
    res.json(hashtags);
  } catch (error) {
    console.error("[GetFollowedHashtags] Error:", error instanceof Error ? error.message : String(error));
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Get user's followed mentors/users
 */
router.get("/users/:userId/followed-users", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const users = await storage.getFollowedUsersByUserId(userId);
    res.json(users);
  } catch (error) {
    console.error("[GetFollowedUsers] Error:", error instanceof Error ? error.message : String(error));
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Get feed analytics showing breakdown by sources
 */
router.get("/users/:userId/feed-analytics", async (req: Request, res: Response) => {
  try {
    const userIdParam = req.params.userId;
    let userId: number;
    let userProfile: any = {};

    if (userIdParam.length > 20) {
      const user = await storage.getUserByUsername(userIdParam);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      userId = user.id;
      userProfile = {
        industry: user.industry,
        domain: user.domain,
        location: user.location,
        title: user.title
      };
    } else {
      userId = parseInt(userIdParam);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      if (user) {
        userProfile = {
          industry: user.industry,
          domain: user.domain,
          location: user.location,
          title: user.title
        };
      }
    }

    // Generate feed to get analytics
    const feedResult = await personalizedFeedService.generatePersonalizedFeed(storage, {
      userId,
      userProfile,
      limit: 100, // Get more items for better analytics
      offset: 0
    });

    // Return only the analytics
    res.json({
      sources: feedResult.sources,
      totalItems: feedResult.totalItems,
      distribution: {
        followedHashtags: Math.round((feedResult.sources.followedHashtags / feedResult.totalItems) * 100),
        mentorPulses: Math.round((feedResult.sources.mentorPulses / feedResult.totalItems) * 100),
        similarHashtags: Math.round((feedResult.sources.similarHashtags / feedResult.totalItems) * 100),
        engagementBased: Math.round((feedResult.sources.engagementBased / feedResult.totalItems) * 100),
        industryMatch: Math.round((feedResult.sources.industryMatch / feedResult.totalItems) * 100),
        aiInterests: Math.round((feedResult.sources.aiInterests / feedResult.totalItems) * 100)
      }
    });
  } catch (error) {
    console.error("[FeedAnalytics] Error:", error instanceof Error ? error.message : String(error));
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;