import { db } from '../db';
import { eq, desc, and, count, sql } from 'drizzle-orm';
import { notifications, type Notification, type InsertNotification } from '@shared/notification-schema';

/**
 * Service for managing user notifications
 */
export class NotificationService {
  /**
   * Create a new notification for a user
   * @param notification The notification to create
   * @returns The created notification
   */
  static async createNotification(notification: InsertNotification): Promise<Notification> {
    try {
      const [created] = await db.insert(notifications).values(notification).returning();
      return created;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  }

  /**
   * Get all notifications for a user
   * @param userId The user ID
   * @param limit The maximum number of notifications to return
   * @param offset The offset for pagination
   * @returns An array of notifications
   */
  static async getUserNotifications(
    userId: number,
    limit = 20,
    offset = 0
  ): Promise<{ notifications: Notification[]; totalCount: number }> {
    try {
      // Get the total count for pagination
      const [countResult] = await db
        .select({ count: count() })
        .from(notifications)
        .where(eq(notifications.userId, userId));

      // Get the notifications with pagination
      const userNotifications = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt))
        .limit(limit)
        .offset(offset);

      return {
        notifications: userNotifications,
        totalCount: countResult.count,
      };
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw new Error('Failed to fetch notifications');
    }
  }

  /**
   * Get unread notification count for a user
   * @param userId The user ID
   * @returns The number of unread notifications
   */
  static async getUnreadCount(userId: number): Promise<number> {
    try {
      const [result] = await db
        .select({ count: count() })
        .from(notifications)
        .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

      return result.count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw new Error('Failed to fetch unread count');
    }
  }

  /**
   * Mark a notification as read
   * @param notificationId The notification ID
   * @param userId The user ID (for security validation)
   * @returns The updated notification
   */
  static async markAsRead(notificationId: string, userId: number): Promise<Notification> {
    try {
      const [updated] = await db
        .update(notifications)
        .set({ isRead: true })
        .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
        .returning();

      if (!updated) {
        throw new Error('Notification not found or unauthorized');
      }

      return updated;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  /**
   * Mark all notifications as read for a user
   * @param userId The user ID
   * @returns The number of notifications marked as read
   */
  static async markAllAsRead(userId: number): Promise<number> {
    try {
      const result = await db
        .update(notifications)
        .set({ isRead: true })
        .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

      return result.rowCount || 0;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  }
  
  /**
   * Delete a notification
   * @param notificationId The notification ID
   * @param userId The user ID (for security validation)
   * @returns True if deleted successfully
   */
  static async deleteNotification(notificationId: string, userId: number): Promise<boolean> {
    try {
      const result = await db
        .delete(notifications)
        .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));

      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw new Error('Failed to delete notification');
    }
  }

  /**
   * Delete all notifications for a user
   * @param userId The user ID
   * @returns The number of notifications deleted
   */
  static async deleteAllNotifications(userId: number): Promise<number> {
    try {
      const result = await db
        .delete(notifications)
        .where(eq(notifications.userId, userId));

      return result.rowCount || 0;
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      throw new Error('Failed to delete all notifications');
    }
  }

  /**
   * Get notification stats by category
   * @param userId The user ID
   * @returns Stats for each category
   */
  static async getNotificationStats(userId: number): Promise<any> {
    try {
      const stats = await db
        .select({
          category: notifications.category,
          count: count(),
          unreadCount: sql`SUM(CASE WHEN ${notifications.isRead} = false THEN 1 ELSE 0 END)::int`,
        })
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .groupBy(notifications.category);

      return stats;
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      throw new Error('Failed to fetch notification stats');
    }
  }
}