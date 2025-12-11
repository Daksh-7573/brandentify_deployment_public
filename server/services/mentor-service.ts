/**
 * Mentor Service - Handles mentor follow relationships, notifications, and messaging
 */
import { storage } from "../storage";
import * as messageService from "./message-service";
import { pool } from "../db";
import { createNotification } from "./notification-service";

const MENTORSHIP_DURATION_DAYS = 30;
const REMINDER_DAYS_BEFORE_EXPIRY = 5;

export interface MentorFollowResult {
  success: boolean;
  message: string;
  follow?: any;
  conversation?: any;
}

/**
 * Follow a user as a mentor
 * - Checks quota (Free: 3, Premium: 6)
 * - Creates follow relationship with 30-day expiry
 * - Creates/gets DM conversation
 * - Sends auto-message from mentor
 * - Creates notification for mentor
 */
export async function followAsMentor(
  followerId: number,
  mentorId: number
): Promise<MentorFollowResult> {
  try {
    // Prevent self-follow
    if (followerId === mentorId) {
      return { success: false, message: "You cannot follow yourself as a mentor" };
    }

    // Check if already following
    const existingFollow = await pool.query(
      `SELECT * FROM user_follows WHERE follower_id = $1 AND followee_id = $2 AND is_active = true`,
      [followerId, mentorId]
    );
    
    if (existingFollow.rows.length > 0) {
      return { success: false, message: "You are already following this user as a mentor" };
    }

    // Check quota
    const quotaCheck = await storage.checkMentorFollowQuota(followerId);
    if (!quotaCheck.hasQuotaRemaining) {
      return { 
        success: false, 
        message: `You've reached your mentor limit (${quotaCheck.max}). ${quotaCheck.subscriptionTier === 'free' ? 'Upgrade to Premium for more mentors!' : 'Please unfollow a mentor first.'}` 
      };
    }

    // Calculate expiry date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + MENTORSHIP_DURATION_DAYS);

    // Create or get direct conversation between follower and mentor
    const conversation = await messageService.getOrCreateDirectConversation(followerId, mentorId);

    // Insert follow relationship
    const followResult = await pool.query(
      `INSERT INTO user_follows (follower_id, followee_id, expires_at, conversation_id, is_active, reminder_sent, created_at)
       VALUES ($1, $2, $3, $4, true, false, NOW())
       RETURNING *`,
      [followerId, mentorId, expiresAt, conversation.id]
    );

    const follow = followResult.rows[0];

    // Get user names for notification and message
    const follower = await storage.getUser(followerId);
    const mentor = await storage.getUser(mentorId);

    if (follower && mentor) {
      // Send auto-message from mentor to follower
      const autoMessage = "Excited to guide you on your journey — what would you like help with first?";
      await messageService.sendMessage({
        conversationId: conversation.id,
        senderId: mentorId,
        content: autoMessage,
        sentAt: new Date()
      });

      // Create notification for the mentor
      try {
        await createNotification({
          userId: mentorId,
          type: 'info',
          title: 'New Mentee',
          message: `${follower.name || follower.username} wants you to be their mentor!`,
          category: 'new_mentee',
          isRead: false,
          metadata: { followerId, followId: follow.id }
        });
      } catch (notifError) {
        console.error('[Mentor Service] Error creating notification:', notifError);
      }
    }

    return {
      success: true,
      message: "Successfully followed as mentor. Check your messages!",
      follow,
      conversation
    };
  } catch (error) {
    console.error('[Mentor Service] Error following mentor:', error);
    return { success: false, message: "Failed to follow mentor. Please try again." };
  }
}

/**
 * Unfollow a mentor (end mentorship early)
 */
export async function unfollowMentor(
  followerId: number,
  mentorId: number
): Promise<{ success: boolean; message: string }> {
  try {
    const result = await pool.query(
      `UPDATE user_follows SET is_active = false 
       WHERE follower_id = $1 AND followee_id = $2 AND is_active = true
       RETURNING *`,
      [followerId, mentorId]
    );

    if (result.rows.length === 0) {
      return { success: false, message: "No active mentorship found" };
    }

    return { success: true, message: "Successfully ended mentorship" };
  } catch (error) {
    console.error('[Mentor Service] Error unfollowing mentor:', error);
    return { success: false, message: "Failed to end mentorship" };
  }
}

/**
 * Get all active mentors for a user
 */
export async function getActiveMentors(userId: number): Promise<any[]> {
  try {
    const result = await pool.query(
      `SELECT uf.*, u.id as mentor_user_id, u.name, u.username, u.photo_url, u.headline, u.industry
       FROM user_follows uf
       JOIN users u ON u.id = uf.followee_id
       WHERE uf.follower_id = $1 AND uf.is_active = true 
       AND (uf.expires_at IS NULL OR uf.expires_at > NOW())
       ORDER BY uf.created_at DESC`,
      [userId]
    );
    return result.rows;
  } catch (error) {
    console.error('[Mentor Service] Error getting active mentors:', error);
    return [];
  }
}

/**
 * Get mentor follower count (people who follow this user as a mentor)
 */
export async function getMentorFollowerCount(mentorId: number): Promise<number> {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM user_follows 
       WHERE followee_id = $1 AND is_active = true 
       AND (expires_at IS NULL OR expires_at > NOW())`,
      [mentorId]
    );
    return parseInt(result.rows[0]?.count || '0');
  } catch (error) {
    console.error('[Mentor Service] Error getting follower count:', error);
    return 0;
  }
}

/**
 * Check if user is following another user as mentor
 */
export async function isFollowingAsMentor(followerId: number, mentorId: number): Promise<boolean> {
  try {
    const result = await pool.query(
      `SELECT 1 FROM user_follows 
       WHERE follower_id = $1 AND followee_id = $2 AND is_active = true 
       AND (expires_at IS NULL OR expires_at > NOW())`,
      [followerId, mentorId]
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error('[Mentor Service] Error checking follow status:', error);
    return false;
  }
}

/**
 * Get mentorship details (including days remaining)
 */
export async function getMentorshipDetails(followerId: number, mentorId: number): Promise<any> {
  try {
    const result = await pool.query(
      `SELECT uf.*, u.name, u.username, u.photo_url
       FROM user_follows uf
       JOIN users u ON u.id = uf.followee_id
       WHERE uf.follower_id = $1 AND uf.followee_id = $2 AND uf.is_active = true`,
      [followerId, mentorId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const follow = result.rows[0];
    const now = new Date();
    const expiresAt = new Date(follow.expires_at);
    const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      ...follow,
      daysRemaining: Math.max(0, daysRemaining),
      isExpiringSoon: daysRemaining <= REMINDER_DAYS_BEFORE_EXPIRY
    };
  } catch (error) {
    console.error('[Mentor Service] Error getting mentorship details:', error);
    return null;
  }
}

/**
 * Submit a mentor review
 */
export async function submitMentorReview(
  mentorId: number,
  reviewerId: number,
  followId: number | null,
  rating: number,
  comment?: string
): Promise<{ success: boolean; message: string; review?: any }> {
  try {
    // Validate rating
    if (rating < 1 || rating > 5) {
      return { success: false, message: "Rating must be between 1 and 5" };
    }

    // Check if review already exists for this follow
    if (followId) {
      const existingReview = await pool.query(
        `SELECT * FROM mentor_reviews WHERE follow_id = $1`,
        [followId]
      );
      if (existingReview.rows.length > 0) {
        return { success: false, message: "You have already reviewed this mentorship" };
      }
    }

    // Insert review
    const result = await pool.query(
      `INSERT INTO mentor_reviews (mentor_id, reviewer_id, follow_id, rating, comment, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [mentorId, reviewerId, followId, rating, comment || null]
    );

    return {
      success: true,
      message: "Thank you for your review!",
      review: result.rows[0]
    };
  } catch (error) {
    console.error('[Mentor Service] Error submitting review:', error);
    return { success: false, message: "Failed to submit review" };
  }
}

/**
 * Get average rating for a mentor
 */
export async function getMentorAverageRating(mentorId: number): Promise<{ average: number; count: number }> {
  try {
    const result = await pool.query(
      `SELECT AVG(rating) as average, COUNT(*) as count FROM mentor_reviews WHERE mentor_id = $1`,
      [mentorId]
    );
    return {
      average: parseFloat(result.rows[0]?.average || '0'),
      count: parseInt(result.rows[0]?.count || '0')
    };
  } catch (error) {
    console.error('[Mentor Service] Error getting average rating:', error);
    return { average: 0, count: 0 };
  }
}

/**
 * Get reviews for a mentor
 */
export async function getMentorReviews(mentorId: number, limit = 10): Promise<any[]> {
  try {
    const result = await pool.query(
      `SELECT mr.*, u.name as reviewer_name, u.photo_url as reviewer_photo
       FROM mentor_reviews mr
       JOIN users u ON u.id = mr.reviewer_id
       WHERE mr.mentor_id = $1
       ORDER BY mr.created_at DESC
       LIMIT $2`,
      [mentorId, limit]
    );
    return result.rows;
  } catch (error) {
    console.error('[Mentor Service] Error getting reviews:', error);
    return [];
  }
}

/**
 * Get expired mentorships that need review notifications (for scheduler)
 */
export async function getExpiredMentorshipsNeedingReview(): Promise<any[]> {
  try {
    const result = await pool.query(
      `SELECT uf.*, u.name as mentor_name, u.username as mentor_username
       FROM user_follows uf
       JOIN users u ON u.id = uf.followee_id
       WHERE uf.is_active = true AND uf.expires_at <= NOW()
       AND NOT EXISTS (
         SELECT 1 FROM mentor_reviews mr WHERE mr.follow_id = uf.id
       )`
    );
    return result.rows;
  } catch (error) {
    console.error('[Mentor Service] Error getting expired mentorships:', error);
    return [];
  }
}

/**
 * Get mentorships expiring soon (for reminder notifications)
 */
export async function getMentorshipsExpiringSoon(): Promise<any[]> {
  try {
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + REMINDER_DAYS_BEFORE_EXPIRY);

    const result = await pool.query(
      `SELECT uf.*, u.name as mentor_name, u.username as mentor_username, follower.name as follower_name
       FROM user_follows uf
       JOIN users u ON u.id = uf.followee_id
       JOIN users follower ON follower.id = uf.follower_id
       WHERE uf.is_active = true 
       AND uf.reminder_sent = false
       AND uf.expires_at <= $1 
       AND uf.expires_at > NOW()`,
      [reminderDate]
    );
    return result.rows;
  } catch (error) {
    console.error('[Mentor Service] Error getting expiring mentorships:', error);
    return [];
  }
}

/**
 * Mark reminder as sent
 */
export async function markReminderSent(followId: number): Promise<void> {
  try {
    await pool.query(
      `UPDATE user_follows SET reminder_sent = true WHERE id = $1`,
      [followId]
    );
  } catch (error) {
    console.error('[Mentor Service] Error marking reminder sent:', error);
  }
}

/**
 * Deactivate expired mentorships
 */
export async function deactivateExpiredMentorships(): Promise<number> {
  try {
    const result = await pool.query(
      `UPDATE user_follows SET is_active = false 
       WHERE is_active = true AND expires_at <= NOW()
       RETURNING id`
    );
    return result.rows.length;
  } catch (error) {
    console.error('[Mentor Service] Error deactivating expired mentorships:', error);
    return 0;
  }
}

/**
 * Get pending mentor reviews for a user
 * Returns expired mentorships that the user hasn't reviewed yet
 */
export async function getPendingMentorReviews(userId: number): Promise<any[]> {
  try {
    const result = await pool.query(
      `SELECT 
        uf.id as follow_id,
        uf.followee_id as mentor_id,
        uf.created_at as followed_at,
        uf.expires_at,
        u.name as mentor_name,
        u.username as mentor_username,
        u.photo_url as mentor_photo_url
       FROM user_follows uf
       JOIN users u ON u.id = uf.followee_id
       WHERE uf.follower_id = $1
       AND uf.is_active = false
       AND uf.expires_at <= NOW()
       AND NOT EXISTS (
         SELECT 1 FROM mentor_reviews mr 
         WHERE mr.follow_id = uf.id
       )
       ORDER BY uf.expires_at DESC
       LIMIT 5`,
      [userId]
    );
    return result.rows;
  } catch (error) {
    console.error('[Mentor Service] Error getting pending reviews:', error);
    return [];
  }
}

/**
 * Renew mentorship for another 30 days
 */
export async function renewMentorship(
  followerId: number,
  mentorId: number
): Promise<{ success: boolean; message: string; expiresAt?: Date }> {
  try {
    // Find the existing follow relationship
    const existing = await pool.query(
      `SELECT * FROM user_follows WHERE follower_id = $1 AND followee_id = $2 AND is_active = true`,
      [followerId, mentorId]
    );

    if (existing.rows.length === 0) {
      return { success: false, message: "No active mentorship found to renew" };
    }

    // Calculate new expiry date (30 days from now)
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + MENTORSHIP_DURATION_DAYS);

    // Update the expiry date and reset reminder flag
    await pool.query(
      `UPDATE user_follows 
       SET expires_at = $1, reminder_sent = false 
       WHERE follower_id = $2 AND followee_id = $3 AND is_active = true`,
      [newExpiresAt, followerId, mentorId]
    );

    // Get mentor name for notification
    const mentor = await storage.getUser(mentorId);
    const follower = await storage.getUser(followerId);

    // Notify the mentor about the renewal
    if (mentor && follower) {
      try {
        await createNotification({
          userId: mentorId,
          type: 'success',
          title: 'Mentorship Renewed',
          message: `${follower.name || follower.username} has renewed their mentorship with you for another 30 days!`,
          category: 'mentorship_renewed',
          isRead: false,
          metadata: { followerId, mentorId }
        });
      } catch (notifError) {
        console.error('[Mentor Service] Error creating renewal notification:', notifError);
      }
    }

    return {
      success: true,
      message: "Mentorship renewed for another 30 days!",
      expiresAt: newExpiresAt
    };
  } catch (error) {
    console.error('[Mentor Service] Error renewing mentorship:', error);
    return { success: false, message: "Failed to renew mentorship. Please try again." };
  }
}
