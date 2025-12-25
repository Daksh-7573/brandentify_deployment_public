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
  creatorId: integer('creator_id').notNull(),
  isMuskConversation: boolean('is_musk_conversation').default(false).notNull(),
  isEncryptionEnabled: boolean('is_encryption_enabled').default(true).notNull(),
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
 * Supports end-to-end encryption with isEncrypted flag
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
  isEncrypted: boolean('is_encrypted').default(false).notNull(),
  encryptedForUsers: text('encrypted_for_users'),
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

/**
 * Define user encryption keys table
 * Stores public keys for E2E encryption (private keys stored client-side only for true E2E)
 * For convenience, we also store an encrypted version of private key that user can recover
 */
export const userEncryptionKeys = pgTable('user_encryption_keys', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().unique(),
  publicKey: text('public_key').notNull(),
  encryptedPrivateKey: text('encrypted_private_key'),
  keyVersion: integer('key_version').default(1).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Define conversation encryption keys table
 * For group chats, stores shared symmetric key encrypted for each participant
 */
export const conversationEncryptionKeys = pgTable('conversation_encryption_keys', {
  id: serial('id').primaryKey(),
  conversationId: integer('conversation_id').notNull().references(() => conversations.id),
  userId: integer('user_id').notNull(),
  encryptedSymmetricKey: text('encrypted_symmetric_key').notNull(),
  keyVersion: integer('key_version').default(1).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Types and insert schemas

// User encryption keys types
export type UserEncryptionKey = typeof userEncryptionKeys.$inferSelect;
export const insertUserEncryptionKeySchema = createInsertSchema(userEncryptionKeys).omit({ id: true });
export type InsertUserEncryptionKey = z.infer<typeof insertUserEncryptionKeySchema>;

// Conversation encryption keys types
export type ConversationEncryptionKey = typeof conversationEncryptionKeys.$inferSelect;
export const insertConversationEncryptionKeySchema = createInsertSchema(conversationEncryptionKeys).omit({ id: true });
export type InsertConversationEncryptionKey = z.infer<typeof insertConversationEncryptionKeySchema>;

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