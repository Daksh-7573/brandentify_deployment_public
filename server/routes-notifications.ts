import { Router } from 'express';
import { NotificationService } from './services/notification-service';
import { insertNotificationSchema } from '@shared/notification-schema';
import { z } from 'zod';

const router = Router();

// Create a notification (for testing or other services to use)
router.post('/api/notifications', async (req, res) => {
  try {
    const validatedData = insertNotificationSchema.parse(req.body);
    const notification = await NotificationService.createNotification(validatedData);
    res.status(201).json(notification);
  } catch (error: any) {
    console.error('Error creating notification:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Invalid notification data', errors: error.errors });
    }
    res.status(500).json({ message: 'Failed to create notification' });
  }
});

// Get notifications for the current user with pagination
router.get('/api/notifications', async (req, res) => {
  try {
    const userId = parseInt(req.query.userId as string);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const result = await NotificationService.getUserNotifications(userId, limit, offset);
    res.json(result);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// Get unread notification count
router.get('/api/notifications/unread-count', async (req, res) => {
  try {
    const userId = parseInt(req.query.userId as string);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const count = await NotificationService.getUnreadCount(userId);
    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Failed to fetch unread count' });
  }
});

// Mark notification as read
router.patch('/api/notifications/:id/read', async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = parseInt(req.body.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const notification = await NotificationService.markAsRead(notificationId, userId);
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.patch('/api/notifications/mark-all-read', async (req, res) => {
  try {
    const { userId } = z.object({ userId: z.number() }).parse(req.body);
    const count = await NotificationService.markAllAsRead(userId);
    res.json({ count });
  } catch (error: any) {
    console.error('Error marking all notifications as read:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Invalid user ID', errors: error.errors });
    }
    res.status(500).json({ message: 'Failed to mark all notifications as read' });
  }
});

// Delete a notification
router.delete('/api/notifications/:id', async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = parseInt(req.query.userId as string);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const success = await NotificationService.deleteNotification(notificationId, userId);
    
    if (!success) {
      return res.status(404).json({ message: 'Notification not found or unauthorized' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Failed to delete notification' });
  }
});

// Delete all notifications
router.delete('/api/notifications', async (req, res) => {
  try {
    const userId = parseInt(req.query.userId as string);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const count = await NotificationService.deleteAllNotifications(userId);
    res.json({ count });
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    res.status(500).json({ message: 'Failed to delete all notifications' });
  }
});

// Get notification statistics
router.get('/api/notifications/stats', async (req, res) => {
  try {
    const userId = parseInt(req.query.userId as string);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const stats = await NotificationService.getNotificationStats(userId);
    res.json({ stats });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({ message: 'Failed to fetch notification stats' });
  }
});

export default router;