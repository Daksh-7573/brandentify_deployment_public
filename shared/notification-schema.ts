import { createId } from '@paralleldrive/cuid2';
import { pgTable, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Notification types
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

// Notification categories
export type NotificationCategory = 
  | 'quest_completed'       // When a brand quest is completed
  | 'xp_earned'             // When XP is earned
  | 'system_error'          // System errors
  | 'new_milestone'         // Career capsule milestone reached
  | 'new_follower'          // When someone follows the user
  | 'pulse_reaction'        // When someone reacts to a pulse
  | 'pulse_comment'         // When someone comments on a pulse
  | 'achievement'           // Achievement unlocked
  | 'api_error';            // API errors

// Notification table schema
export const notifications = pgTable('notifications', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: integer('user_id').notNull(),
  type: text('type', { enum: ['success', 'error', 'info', 'warning'] }).notNull(),
  category: text('category', { 
    enum: [
      'quest_completed', 
      'xp_earned', 
      'system_error', 
      'new_milestone', 
      'new_follower', 
      'pulse_reaction', 
      'pulse_comment', 
      'achievement',
      'api_error'
    ] 
  }).notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  link: text('link'),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Insert schema for notifications
export const insertNotificationSchema = createInsertSchema(notifications)
  .omit({ id: true, createdAt: true })
  .extend({
    // Additional validation if needed
    message: z.string().min(1).max(500),
    title: z.string().min(1).max(100),
  });

// Types for our schemas
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Helper function to convert API errors to notifications
export function apiErrorToNotification(userId: number, error: any): InsertNotification {
  return {
    userId,
    type: 'error',
    category: 'api_error',
    title: 'API Error',
    message: error.message || 'An unknown error occurred',
    isRead: false,
  };
}

// Helper function to create quest completed notification
export function createQuestCompletedNotification(
  userId: number, 
  questTitle: string, 
  xpEarned: number
): InsertNotification {
  return {
    userId,
    type: 'success',
    category: 'quest_completed',
    title: 'Quest Completed!',
    message: `You've completed the "${questTitle}" quest and earned ${xpEarned} XP!`,
    isRead: false,
  };
}