import { relations } from 'drizzle-orm';
import { pgTable, serial, text, timestamp, integer, boolean, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from './schema';

/**
 * User Profile Segments
 */
export const userProfileSegments = [
  'builder',        // Actively building their profile/portfolio
  'explorer',       // Exploring content and opportunites
  'jobSeeker',      // Actively looking for employment
  'passiveObserver', // Just browsing, limited engagement
  'creator',        // Creates a lot of content/pulses
  'networker',      // Focused on making connections
  'mentor'          // Helping others grow
] as const;

/**
 * User Career Levels
 */
export const careerLevels = [
  'entry',          // Entry-level, 0-2 years experience
  'mid',            // Mid-level, 3-5 years experience
  'senior',         // Senior level, 6-10 years experience
  'lead',           // Team lead/manager, 8+ years 
  'executive'       // Executive level, director and up
] as const;

/**
 * User Goal Types
 */
export const userGoalTypes = [
  'findNewJob',            // Finding new employment
  'growInfluence',         // Building industry presence
  'showcaseWork',          // Highlighting existing work
  'expandNetwork',         // Meeting new professionals
  'learnNewSkills',        // Acquiring new capabilities
  'careerTransition',      // Changing career paths
  'mentorship'             // Finding or being a mentor
] as const;

/**
 * Musk Suggestion Types - Enhanced with advanced categories
 */
export const suggestionTypes = [
  // Original suggestion types
  'daily',                // Daily suggestion at optimal time
  'inactivity',           // Re-engagement after inactivity
  'newPulse',             // When new industry-relevant Pulse is available
  'newFeature',           // When a new feature is available
  'lowEngagement',        // When posts receive low interaction
  'projectCompletion',    // When a project is completed
  'resumeUpdate',         // When resume is updated
  'goalChange',           // When career goals change
  
  // Enhanced suggestion types
  'trendingTopic',        // Industry trend that matches user's profile
  'portfolioMilestone',   // Achievement in portfolio views/engagement
  'contentImprovement',   // Suggestions to improve draft posts
  'strategicEngagement',  // Recommend engagement on specific posts
  'industryEvent',        // Industry calendar events
  'skillGap',             // Detected skill gap based on job trends
  'microGoalProgress'     // Progress updates on selected career goals
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
 * User Profile Intelligence
 * Stores enhanced user profile data for sophisticated personalization
 */
export const userProfileIntelligence = pgTable('user_profile_intelligence', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  segment: text('segment'), // Builder, Explorer, Job Seeker, etc.
  careerLevel: text('career_level'), // Entry, Mid, Senior, etc.
  primaryGoal: text('primary_goal'), // Main career goal
  secondaryGoals: text('secondary_goals'), // JSON array of secondary goals
  industryNiche: text('industry_niche'), // Specific niche within broader industry
  learningStyle: text('learning_style'), // Visual, textual, interactive
  topSkills: text('top_skills'), // JSON array of most proficient skills
  skillGaps: text('skill_gaps'), // JSON array of detected skill gaps
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
  confidenceScore: integer('confidence_score').default(50), // 0-100 confidence in profile assessment
});

export const userProfileIntelligenceRelations = relations(userProfileIntelligence, ({ one }) => ({
  user: one(users, {
    fields: [userProfileIntelligence.userId],
    references: [users.id],
  }),
}));

export const insertUserProfileIntelligenceSchema = createInsertSchema(userProfileIntelligence)
  .extend({
    segment: z.enum(userProfileSegments).optional(),
    careerLevel: z.enum(careerLevels).optional(),
    primaryGoal: z.enum(userGoalTypes).optional(),
  })
  .omit({ id: true });

export type InsertUserProfileIntelligence = z.infer<typeof insertUserProfileIntelligenceSchema>;
export type UserProfileIntelligence = typeof userProfileIntelligence.$inferSelect;

/**
 * Behavioral Heatmap
 * Tracks engagement patterns for personalized content
 */
export const behaviorHeatmap = pgTable('behavior_heatmap', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  contentType: text('content_type').notNull(), // pulse_text, pulse_image, pulse_video, etc.
  contentId: integer('content_id'), // Related content ID if applicable
  engagementType: text('engagement_type').notNull(), // view, read, like, comment, etc.
  engagementStrength: integer('engagement_strength').default(1), // 1-5 based on engagement depth
  timeSpent: integer('time_spent'), // Seconds spent engaging
  timeOfDay: integer('time_of_day'), // Hour of day (0-23)
  dayOfWeek: integer('day_of_week'), // Day of week (0-6)
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const behaviorHeatmapRelations = relations(behaviorHeatmap, ({ one }) => ({
  user: one(users, {
    fields: [behaviorHeatmap.userId],
    references: [users.id],
  }),
}));

export const insertBehaviorHeatmapSchema = createInsertSchema(behaviorHeatmap).omit({ id: true });
export type InsertBehaviorHeatmap = z.infer<typeof insertBehaviorHeatmapSchema>;
export type BehaviorHeatmap = typeof behaviorHeatmap.$inferSelect;

/**
 * Content Scoring
 * Provides analysis and improvement suggestions for user content
 */
export const contentScoring = pgTable('content_scoring', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  contentType: text('content_type').notNull(), // pulse, comment, profile_section, etc.
  contentId: integer('content_id'), // ID of the content being scored
  contentDraft: text('content_draft'), // Draft version of the content
  readabilityScore: integer('readability_score'), // 0-100 readability rating
  impactScore: integer('impact_score'), // 0-100 predicted engagement
  improvementSuggestions: text('improvement_suggestions'), // JSON array of suggestions
  keywordStrength: integer('keyword_strength'), // 0-100 rating of industry keyword usage
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const contentScoringRelations = relations(contentScoring, ({ one }) => ({
  user: one(users, {
    fields: [contentScoring.userId],
    references: [users.id],
  }),
}));

export const insertContentScoringSchema = createInsertSchema(contentScoring).omit({ id: true });
export type InsertContentScoring = z.infer<typeof insertContentScoringSchema>;
export type ContentScoring = typeof contentScoring.$inferSelect;

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

/**
 * Industry Trends Monitor
 * Tracks industry-specific trends for contextual suggestions
 */
export const industryTrendsMonitor = pgTable('industry_trends_monitor', {
  id: serial('id').primaryKey(),
  industry: text('industry').notNull(), 
  trend: text('trend').notNull(),  // Trending topic or keyword
  source: text('source'),  // Where the trend was detected (TechCrunch, LinkedIn, etc)
  relevanceScore: integer('relevance_score').default(50),  // 0-100 score for trend significance
  growthRate: integer('growth_rate'),  // Rate of trend growth in percentage
  relatedSkills: text('related_skills'),  // JSON array of skills related to trend
  relatedRoles: text('related_roles'),  // JSON array of job roles related to trend
  suggestedContentTypes: text('suggested_content_types'),  // JSON array of content types for this trend
  detectedAt: timestamp('detected_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),  // When trend is considered no longer timely
});

export const insertIndustryTrendsMonitorSchema = createInsertSchema(industryTrendsMonitor).omit({ id: true });
export type InsertIndustryTrendsMonitor = z.infer<typeof insertIndustryTrendsMonitorSchema>;
export type IndustryTrendsMonitor = typeof industryTrendsMonitor.$inferSelect;

/**
 * User Milestones
 * Tracks achievement milestones for context-aware triggers
 */ 
export const userMilestones = pgTable('user_milestones', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  milestoneType: text('milestone_type').notNull(),  // portfolio_views, connections, endorsements, etc.
  milestone: text('milestone').notNull(),  // Description of milestone reached
  value: integer('value'),  // Numeric value of milestone (100 views, 10 connections, etc)
  previousValue: integer('previous_value'),  // Value before milestone for context
  celebrationType: text('celebration_type'),  // How to celebrate this milestone
  suggestedActions: text('suggested_actions'),  // JSON array of suggested next actions
  isAcknowledged: boolean('is_acknowledged').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userMilestonesRelations = relations(userMilestones, ({ one }) => ({
  user: one(users, {
    fields: [userMilestones.userId],
    references: [users.id],
  }),
}));

export const insertUserMilestonesSchema = createInsertSchema(userMilestones).omit({ id: true });
export type InsertUserMilestones = z.infer<typeof insertUserMilestonesSchema>;
export type UserMilestones = typeof userMilestones.$inferSelect;

/**
 * Smart Post Suggestions
 * Generates intelligent post content suggestions
 */
export const smartPostSuggestions = pgTable('smart_post_suggestions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  content: text('content').notNull(),
  suggestedHashtags: text('suggested_hashtags'),  // JSON array of hashtags
  predictedEngagement: integer('predicted_engagement'),  // 0-100 engagement prediction
  industryTrendId: integer('industry_trend_id'),  // Related industry trend 
  targetAudience: text('target_audience'),  // Who would engage with this content
  bestTimeToPost: text('best_time_to_post'),  // Suggested posting time
  mediaRecommendation: text('media_recommendation'),  // Recommendation for media to include
  createdAt: timestamp('created_at').defaultNow().notNull(),
  isUsed: boolean('is_used').default(false),
  expiresAt: timestamp('expires_at'),  // When suggestion is no longer timely
});

export const smartPostSuggestionsRelations = relations(smartPostSuggestions, ({ one }) => ({
  user: one(users, {
    fields: [smartPostSuggestions.userId],
    references: [users.id],
  }),
}));

export const insertSmartPostSuggestionsSchema = createInsertSchema(smartPostSuggestions).omit({ id: true });
export type InsertSmartPostSuggestions = z.infer<typeof insertSmartPostSuggestionsSchema>;
export type SmartPostSuggestions = typeof smartPostSuggestions.$inferSelect;