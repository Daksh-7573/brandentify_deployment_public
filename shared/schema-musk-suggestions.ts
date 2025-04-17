import { relations } from 'drizzle-orm';
import { pgTable, serial, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from './schema';

/**
 * Musk Suggestion Types
 */
export const suggestionTypes = [
  'daily',                // Daily suggestion at optimal time
  'inactivity',           // Re-engagement after inactivity
  'newPulse',             // When new industry-relevant Pulse is available
  'newFeature',           // When a new feature is available
  'lowEngagement',        // When posts receive low interaction
  'projectCompletion',    // When a project is completed
  'resumeUpdate',         // When resume is updated
  'goalChange'            // When career goals change
] as const;

/**
 * Musk Suggestions Table
 */
export const muskSuggestions = pgTable('musk_suggestions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  type: text('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  actionLink: text('action_link').notNull(),
  actionText: text('action_text').notNull(),
  priority: integer('priority').notNull().default(1),
  cooldownHours: integer('cooldown_hours').notNull().default(24),
  relevanceScore: integer('relevance_score'),
  shown: boolean('shown').notNull().default(false),
  dismissed: boolean('dismissed').notNull().default(false),
  actionTaken: boolean('action_taken').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
});

// Relations
export const muskSuggestionsRelations = relations(muskSuggestions, ({ one }) => ({
  user: one(users, {
    fields: [muskSuggestions.userId],
    references: [users.id],
  }),
}));

// Insertion schema
export const insertMuskSuggestionSchema = createInsertSchema(muskSuggestions)
  .extend({
    type: z.enum(suggestionTypes),
  })
  .omit({ id: true });

export type InsertMuskSuggestion = z.infer<typeof insertMuskSuggestionSchema>;
export type MuskSuggestion = typeof muskSuggestions.$inferSelect;

/**
 * Musk Behavior Tracking Table
 * Used to track user behavior for personalized suggestions
 */
export const muskBehaviorTracking = pgTable('musk_behavior_tracking', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  eventType: text('event_type').notNull(), // e.g., 'page_view', 'pulse_interaction', 'feature_usage'
  eventData: text('event_data').notNull(), // JSON stringified event data
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const muskBehaviorTrackingRelations = relations(muskBehaviorTracking, ({ one }) => ({
  user: one(users, {
    fields: [muskBehaviorTracking.userId],
    references: [users.id],
  }),
}));

export const insertMuskBehaviorTrackingSchema = createInsertSchema(muskBehaviorTracking).omit({ id: true });
export type InsertMuskBehaviorTracking = z.infer<typeof insertMuskBehaviorTrackingSchema>;
export type MuskBehaviorTracking = typeof muskBehaviorTracking.$inferSelect;