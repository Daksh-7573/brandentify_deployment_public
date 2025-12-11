/**
 * Mentor Routes - API endpoints for mentor follow system
 */
import { Router } from "express";
import { z } from "zod";
import * as mentorService from "./services/mentor-service";
import { storage } from "./storage";

const router = Router();

/**
 * POST /mentor/follow
 * Follow a user as a mentor
 */
router.post("/follow", async (req, res) => {
  try {
    const schema = z.object({
      followerId: z.number(),
      mentorId: z.number()
    });

    const { followerId, mentorId } = schema.parse(req.body);

    const result = await mentorService.followAsMentor(followerId, mentorId);

    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    res.status(201).json(result);
  } catch (error) {
    console.error("[POST /mentor/follow] Error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Failed to follow mentor" });
  }
});

/**
 * POST /mentor/renew
 * Renew mentorship for another 30 days
 */
router.post("/renew", async (req, res) => {
  try {
    const schema = z.object({
      followerId: z.number(),
      mentorId: z.number()
    });

    const { followerId, mentorId } = schema.parse(req.body);

    const result = await mentorService.renewMentorship(followerId, mentorId);

    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    res.json(result);
  } catch (error) {
    console.error("[POST /mentor/renew] Error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Failed to renew mentorship" });
  }
});

/**
 * DELETE /mentor/unfollow
 * Unfollow a mentor (end mentorship early)
 */
router.delete("/unfollow", async (req, res) => {
  try {
    const schema = z.object({
      followerId: z.number(),
      mentorId: z.number()
    });

    const { followerId, mentorId } = schema.parse(req.body);

    const result = await mentorService.unfollowMentor(followerId, mentorId);

    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    res.json(result);
  } catch (error) {
    console.error("[DELETE /mentor/unfollow] Error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Failed to unfollow mentor" });
  }
});

/**
 * GET /mentor/quota/:userId
 * Get mentor follow quota for a user
 */
router.get("/quota/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const quota = await storage.checkMentorFollowQuota(userId);
    res.json(quota);
  } catch (error) {
    console.error("[GET /mentor/quota] Error:", error);
    res.status(500).json({ error: "Failed to get mentor quota" });
  }
});

/**
 * GET /mentor/my-mentors/:userId
 * Get all active mentors for a user
 */
router.get("/my-mentors/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const mentors = await mentorService.getActiveMentors(userId);
    res.json(mentors);
  } catch (error) {
    console.error("[GET /mentor/my-mentors] Error:", error);
    res.status(500).json({ error: "Failed to get mentors" });
  }
});

/**
 * GET /mentor/follower-count/:mentorId
 * Get how many people follow this user as a mentor
 */
router.get("/follower-count/:mentorId", async (req, res) => {
  try {
    const mentorId = parseInt(req.params.mentorId);
    if (isNaN(mentorId)) {
      return res.status(400).json({ error: "Invalid mentor ID" });
    }

    const count = await mentorService.getMentorFollowerCount(mentorId);
    res.json({ count });
  } catch (error) {
    console.error("[GET /mentor/follower-count] Error:", error);
    res.status(500).json({ error: "Failed to get follower count" });
  }
});

/**
 * GET /mentor/is-following/:followerId/:mentorId
 * Check if a user is following another as a mentor
 */
router.get("/is-following/:followerId/:mentorId", async (req, res) => {
  try {
    const followerId = parseInt(req.params.followerId);
    const mentorId = parseInt(req.params.mentorId);
    
    if (isNaN(followerId) || isNaN(mentorId)) {
      return res.status(400).json({ error: "Invalid user IDs" });
    }

    const isFollowing = await mentorService.isFollowingAsMentor(followerId, mentorId);
    res.json({ isFollowing });
  } catch (error) {
    console.error("[GET /mentor/is-following] Error:", error);
    res.status(500).json({ error: "Failed to check follow status" });
  }
});

/**
 * GET /mentor/details/:followerId/:mentorId
 * Get mentorship details including days remaining
 */
router.get("/details/:followerId/:mentorId", async (req, res) => {
  try {
    const followerId = parseInt(req.params.followerId);
    const mentorId = parseInt(req.params.mentorId);
    
    if (isNaN(followerId) || isNaN(mentorId)) {
      return res.status(400).json({ error: "Invalid user IDs" });
    }

    const details = await mentorService.getMentorshipDetails(followerId, mentorId);
    
    if (!details) {
      return res.status(404).json({ error: "Mentorship not found" });
    }
    
    res.json(details);
  } catch (error) {
    console.error("[GET /mentor/details] Error:", error);
    res.status(500).json({ error: "Failed to get mentorship details" });
  }
});

/**
 * POST /mentor/review
 * Submit a review for a mentor
 */
router.post("/review", async (req, res) => {
  try {
    const schema = z.object({
      mentorId: z.number(),
      reviewerId: z.number(),
      followId: z.number().nullable().optional(),
      rating: z.number().min(1).max(5),
      comment: z.string().optional()
    });

    const { mentorId, reviewerId, followId, rating, comment } = schema.parse(req.body);

    const result = await mentorService.submitMentorReview(
      mentorId,
      reviewerId,
      followId || null,
      rating,
      comment
    );

    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    res.status(201).json(result);
  } catch (error) {
    console.error("[POST /mentor/review] Error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Failed to submit review" });
  }
});

/**
 * GET /mentor/rating/:mentorId
 * Get average rating for a mentor
 */
router.get("/rating/:mentorId", async (req, res) => {
  try {
    const mentorId = parseInt(req.params.mentorId);
    if (isNaN(mentorId)) {
      return res.status(400).json({ error: "Invalid mentor ID" });
    }

    const rating = await mentorService.getMentorAverageRating(mentorId);
    res.json(rating);
  } catch (error) {
    console.error("[GET /mentor/rating] Error:", error);
    res.status(500).json({ error: "Failed to get rating" });
  }
});

/**
 * GET /mentor/pending-reviews/:userId
 * Get expired mentorships that haven't been reviewed yet
 */
router.get("/pending-reviews/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const pendingReviews = await mentorService.getPendingMentorReviews(userId);
    res.json(pendingReviews);
  } catch (error) {
    console.error("[GET /mentor/pending-reviews] Error:", error);
    res.status(500).json({ error: "Failed to get pending reviews" });
  }
});

/**
 * GET /mentor/reviews/:mentorId
 * Get reviews for a mentor
 */
router.get("/reviews/:mentorId", async (req, res) => {
  try {
    const mentorId = parseInt(req.params.mentorId);
    const limit = parseInt(req.query.limit as string) || 10;
    
    if (isNaN(mentorId)) {
      return res.status(400).json({ error: "Invalid mentor ID" });
    }

    const reviews = await mentorService.getMentorReviews(mentorId, limit);
    res.json(reviews);
  } catch (error) {
    console.error("[GET /mentor/reviews] Error:", error);
    res.status(500).json({ error: "Failed to get reviews" });
  }
});

export default router;
