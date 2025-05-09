/**
 * Schema definitions for the messaging system
 */
import { createInsertSchema } from 'drizzle-zod';
import { 
  pgTable, 
  serial, 
  varchar, 
  text, 
  timestamp, 
  boolean, 
  integer, 
  uuid 
} from 'drizzle-orm/pg-core';
import { z } from 'zod';

/**
 * Define the conversations table
 * A conversation represents a chat thread between two or more users
 */
export const conversations = pgTable('conversations', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  isGroup: boolean('is_group').default(false).notNull(),
  creatorId: integer('creator_id').notNull()
});

/**
 * Define the conversation participants table
 * Maps users to conversations they're part of
 */
export const conversationParticipants = pgTable('conversation_participants', {
  id: serial('id').primaryKey(),
  conversationId: integer('conversation_id').notNull().references(() => conversations.id),
  userId: integer('user_id').notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  leftAt: timestamp('left_at'),
  isAdmin: boolean('is_admin').default(false).notNull(),
});

/**
 * Define the messages table
 * Contains all messages sent in conversations
 */
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: integer('conversation_id').notNull().references(() => conversations.id),
  senderId: integer('sender_id').notNull(),
  content: text('content').notNull(),
  sentAt: timestamp('sent_at').defaultNow().notNull(),
  readAt: timestamp('read_at'),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  replyToId: uuid('reply_to_id').references(() => messages.id),
});

/**
 * Define the read receipts table
 * Tracks when each user has read each message
 */
export const readReceipts = pgTable('read_receipts', {
  id: serial('id').primaryKey(),
  messageId: uuid('message_id').notNull().references(() => messages.id),
  userId: integer('user_id').notNull(),
  readAt: timestamp('read_at').defaultNow().notNull(),
});

// Types and insert schemas

// Conversation types
export type Conversation = typeof conversations.$inferSelect;
export const insertConversationSchema = createInsertSchema(conversations).omit({ id: true });
export type InsertConversation = z.infer<typeof insertConversationSchema>;

// Conversation participant types
export type ConversationParticipant = typeof conversationParticipants.$inferSelect;
export const insertConversationParticipantSchema = createInsertSchema(conversationParticipants).omit({ id: true });
export type InsertConversationParticipant = z.infer<typeof insertConversationParticipantSchema>;

// Message types
export type Message = typeof messages.$inferSelect;
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true });
export type InsertMessage = z.infer<typeof insertMessageSchema>;

// Read receipt types
export type ReadReceipt = typeof readReceipts.$inferSelect;
export const insertReadReceiptSchema = createInsertSchema(readReceipts).omit({ id: true });
export type InsertReadReceipt = z.infer<typeof insertReadReceiptSchema>;