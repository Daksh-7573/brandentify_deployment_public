import { db } from "../db";
import { eq, desc, and } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import {
  notifications,
  type Notification,
  type InsertNotification,
  apiErrorToNotification,
  createQuestCompletedNotification
} from "@shared/notification-schema";

/**
 * Creates a new notification in the database
 * @param notification The notification to create
 * @returns The created notification
 */
export async function createNotification(notification: InsertNotification): Promise<Notification> {
  const [createdNotification] = await db
    .insert(notifications)
    .values({
      ...notification,
      id: createId(),
      createdAt: new Date()
    })
    .returning();
  
  return createdNotification;
}

/**
 * Gets all notifications for a user, optionally filtered by read status
 * @param userId The user ID to get notifications for
 * @param onlyUnread Whether to only include unread notifications
 * @param limit The maximum number of notifications to return
 * @returns An array of notifications
 */
export async function getUserNotifications(
  userId: number,
  onlyUnread: boolean = false,
  limit: number = 50
): Promise<Notification[]> {
  const query = db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
  
  if (onlyUnread) {
    // Get unread notifications
    return await db
      .select()
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }
  
  return await query;
}

/**
 * Gets the count of unread notifications for a user
 * @param userId The user ID to get the count for
 * @returns The count of unread notifications
 */
export async function getUnreadNotificationCount(userId: number): Promise<number> {
  const result = await db
    .select()
    .from(notifications)
    .where(and(
      eq(notifications.userId, userId),
      eq(notifications.isRead, false)
    ));
  
  return result.length;
}

/**
 * Marks a notification as read
 * @param notificationId The ID of the notification to mark as read
 * @returns The updated notification
 */
export async function markNotificationAsRead(notificationId: string): Promise<Notification | null> {
  const [updatedNotification] = await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, notificationId))
    .returning();
  
  return updatedNotification || null;
}

/**
 * Marks all notifications for a user as read
 * @param userId The user ID to mark all notifications as read for
 * @returns The number of notifications marked as read
 */
export async function markAllNotificationsAsRead(userId: number): Promise<number> {
  // First find all unread notifications for this user
  const unreadNotifications = await db
    .select()
    .from(notifications)
    .where(and(
      eq(notifications.userId, userId),
      eq(notifications.isRead, false)
    ));
  
  if (unreadNotifications.length === 0) {
    return 0;
  }
  
  // Update all of them individually
  let updatedCount = 0;
  for (const notification of unreadNotifications) {
    const result = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notification.id));
    
    if (result.rowCount) {
      updatedCount++;
    }
  }
  
  return updatedCount;
}

/**
 * Deletes a notification
 * @param notificationId The ID of the notification to delete
 * @returns Whether the notification was deleted
 */
export async function deleteNotification(notificationId: string): Promise<boolean> {
  const result = await db
    .delete(notifications)
    .where(eq(notifications.id, notificationId));
  
  return !!result.rowCount;
}

/**
 * Creates a notification for when a system error occurs
 * @param userId The user ID to create the notification for
 * @param message The error message
 * @returns The created notification
 */
export async function createSystemErrorNotification(
  userId: number, 
  message: string
): Promise<Notification> {
  return await createNotification({
    userId,
    type: 'error',
    title: 'System Error',
    message,
    category: 'system_error',
    isRead: false
  });
}

/**
 * Creates a notification for when XP is earned
 * @param userId The user ID to create the notification for
 * @param amount The amount of XP earned
 * @param source The source of the XP (e.g., quest, pulse, etc.)
 * @returns The created notification
 */
export async function createXpEarnedNotification(
  userId: number,
  amount: number,
  source: string
): Promise<Notification> {
  return await createNotification({
    userId,
    type: 'success',
    title: 'XP Earned',
    message: `You earned ${amount} XP from ${source}!`,
    category: 'xp_earned',
    isRead: false
  });
}

/**
 * Creates a notification for when a new follower is gained
 * @param userId The user ID to create the notification for
 * @param followerName The name of the follower
 * @returns The created notification
 */
export async function createNewFollowerNotification(
  userId: number,
  followerName: string
): Promise<Notification> {
  return await createNotification({
    userId,
    type: 'info',
    title: 'New Follower',
    message: `${followerName} is now following you!`,
    category: 'new_follower',
    isRead: false
  });
}

/**
 * Creates a notification for when a career capsule milestone is reached
 * @param userId The user ID to create the notification for
 * @param milestoneName The name of the milestone
 * @returns The created notification
 */
export async function createMilestoneNotification(
  userId: number,
  milestoneName: string
): Promise<Notification> {
  return await createNotification({
    userId,
    type: 'success',
    title: 'Milestone Reached',
    message: `You've reached your career milestone: ${milestoneName}!`,
    category: 'new_milestone',
    isRead: false
  });
}

/**
 * Creates a notification for when someone reacts to a pulse
 * @param userId The user ID to create the notification for
 * @param reactorName The name of the person who reacted
 * @param pulseTitle The title or content of the pulse
 * @returns The created notification
 */
export async function createPulseReactionNotification(
  userId: number,
  reactorName: string,
  pulseTitle: string
): Promise<Notification> {
  return await createNotification({
    userId,
    type: 'info',
    title: 'New Reaction',
    message: `${reactorName} reacted to your pulse: "${pulseTitle.substring(0, 30)}${pulseTitle.length > 30 ? '...' : ''}"`,
    category: 'pulse_reaction',
    isRead: false
  });
}

/**
 * Creates a notification for when someone comments on a pulse
 * @param userId The user ID to create the notification for
 * @param commenterName The name of the person who commented
 * @param pulseTitle The title or content of the pulse
 * @returns The created notification
 */
export async function createPulseCommentNotification(
  userId: number,
  commenterName: string,
  pulseTitle: string
): Promise<Notification> {
  return await createNotification({
    userId,
    type: 'info',
    title: 'New Comment',
    message: `${commenterName} commented on your pulse: "${pulseTitle.substring(0, 30)}${pulseTitle.length > 30 ? '...' : ''}"`,
    category: 'pulse_comment',
    isRead: false
  });
}

/**
 * Creates a notification for when an achievement is unlocked
 * @param userId The user ID to create the notification for
 * @param achievementName The name of the achievement
 * @returns The created notification
 */
export async function createAchievementNotification(
  userId: number,
  achievementName: string
): Promise<Notification> {
  return await createNotification({
    userId,
    type: 'success',
    title: 'Achievement Unlocked',
    message: `You've unlocked the "${achievementName}" achievement!`,
    category: 'achievement',
    isRead: false
  });
}