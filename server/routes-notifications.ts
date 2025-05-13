import express from 'express';
import * as NotificationService from './services/notification-service';
import { z } from 'zod';

const router = express.Router();

/**
 * GET /api/notifications/:userId
 * Get all notifications for a user, optionally filtered by read status
 */
router.get('/:userId', async (req, res) => {
  try {
    const userIdParam = req.params.userId;
    
    // First check if this is a Firebase UID (string) or a numeric ID
    const isFirebaseUid = /^[A-Za-z0-9]{20,}$/.test(userIdParam);
    let userId: number;
    
    if (isFirebaseUid) {
      // If this is a Firebase UID, try to find the user in the database
      console.log(`[GET /notifications/:userId] Looking up user with Firebase UID: ${userIdParam}`);
      
      try {
        // Look up the user by the Firebase UID which is stored as the username
        const storage = (await import('./storage')).storage;
        const user = await storage.getUserByUsername(userIdParam);
        
        if (!user) {
          console.log(`[GET /notifications/:userId] No user found with Firebase UID: ${userIdParam}`);
          // Return empty array rather than error for better UX
          return res.status(200).json([]);
        }
        
        // Use the numeric user ID from the database
        userId = user.id;
        console.log(`[GET /notifications/:userId] Found user with ID: ${userId} for Firebase UID: ${userIdParam}`);
      } catch (lookupError) {
        console.error('Error looking up user by Firebase UID:', lookupError);
        // Return empty array rather than error for better UX
        return res.status(200).json([]);
      }
    } else {
      // If this is a numeric ID, parse it
      userId = parseInt(userIdParam);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
    }

    const onlyUnread = req.query.onlyUnread === 'true';
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    const notifications = await NotificationService.getUserNotifications(userId, onlyUnread, limit);
    
    return res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

/**
 * GET /api/notifications/:userId/count
 * Get the count of unread notifications for a user
 */
router.get('/:userId/count', async (req, res) => {
  try {
    const userIdParam = req.params.userId;
    
    // First check if this is a Firebase UID (string) or a numeric ID
    const isFirebaseUid = /^[A-Za-z0-9]{20,}$/.test(userIdParam);
    let userId: number;
    
    if (isFirebaseUid) {
      // If this is a Firebase UID, try to find the user in the database
      console.log(`[GET /notifications/:userId/count] Looking up user with Firebase UID: ${userIdParam}`);
      
      try {
        // Look up the user by the Firebase UID which is stored as the username
        const db = (await import('./db')).db;
        const storage = (await import('./storage')).storage;
        const user = await storage.getUserByUsername(userIdParam);
        
        if (!user) {
          console.log(`[GET /notifications/:userId/count] No user found with Firebase UID: ${userIdParam}`);
          // Return 0 count rather than error for better UX
          return res.status(200).json({ count: 0 });
        }
        
        // Use the numeric user ID from the database
        userId = user.id;
        console.log(`[GET /notifications/:userId/count] Found user with ID: ${userId} for Firebase UID: ${userIdParam}`);
      } catch (lookupError) {
        console.error('Error looking up user by Firebase UID:', lookupError);
        // Return 0 count rather than error for better UX
        return res.status(200).json({ count: 0 });
      }
    } else {
      // If this is a numeric ID, parse it
      userId = parseInt(userIdParam);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
    }

    const count = await NotificationService.getUnreadNotificationCount(userId);
    
    return res.status(200).json({ count });
  } catch (error) {
    console.error('Error counting notifications:', error);
    return res.status(500).json({ message: 'Failed to count notifications' });
  }
});

/**
 * PATCH /api/notifications/:notificationId/read
 * Mark a notification as read
 */
router.patch('/:notificationId/read', async (req, res) => {
  try {
    const notificationId = req.params.notificationId;
    
    const success = await NotificationService.markNotificationAsRead(notificationId);
    if (!success) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    return res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error updating notification:', error);
    return res.status(500).json({ message: 'Failed to update notification' });
  }
});

/**
 * POST /api/notifications/:userId/read-all
 * Mark all notifications as read for a user
 */
router.post('/:userId/read-all', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const count = await NotificationService.markAllNotificationsAsRead(userId);
    
    return res.status(200).json({ 
      message: `${count} notifications marked as read`,
      count 
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return res.status(500).json({ message: 'Failed to mark notifications as read' });
  }
});

/**
 * DELETE /api/notifications/:notificationId
 * Delete a notification
 */
router.delete('/:notificationId', async (req, res) => {
  try {
    const notificationId = req.params.notificationId;
    
    const success = await NotificationService.deleteNotification(notificationId);
    if (!success) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    return res.status(200).json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return res.status(500).json({ message: 'Failed to delete notification' });
  }
});

/**
 * POST /api/notifications
 * Create a new notification (for testing or system-generated notifications)
 */
router.post('/', async (req, res) => {
  try {
    const notificationSchema = z.object({
      userId: z.number(),
      type: z.enum(['success', 'error', 'info', 'warning']),
      category: z.enum([
        'quest_completed', 
        'xp_earned', 
        'system_error', 
        'new_milestone', 
        'new_follower', 
        'pulse_reaction', 
        'pulse_comment', 
        'achievement',
        'api_error'
      ]),
      title: z.string().min(1).max(100),
      message: z.string().min(1).max(500),
      link: z.string().optional(),
      isRead: z.boolean().default(false)
    });

    const validatedData = notificationSchema.parse(req.body);
    const notification = await NotificationService.createNotification(validatedData);
    
    return res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid notification data', errors: error.errors });
    }
    return res.status(500).json({ message: 'Failed to create notification' });
  }
});

export default router;