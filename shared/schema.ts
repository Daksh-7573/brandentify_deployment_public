// Last part of file - append to existing content

// ============================================
// MUSK FOLLOW-UP SYSTEM
// ============================================

// Follow-up Templates - Pre-written, intent-driven templates for Musk chat
export const followupTemplates = pgTable("followup_templates", {
  id: serial("id").primaryKey(),
  industry: text("industry").notNull(), // "Technology", "Finance", "Healthcare", etc.
  type: text("type").notNull(), // "action", "probe", "resource", "clarify", "confirm", "alternative", "close"
  text: text("text").notNull(), // The actual follow-up question/statement
  why: text("why"), // Brief explanation of why this template is useful
  actionHint: text("action_hint"), // Optional action to trigger (e.g., "generate_post", "schedule_call")
  tags: text("tags").array(), // Tags for filtering (e.g., ["resume", "portfolio", "networking"])
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFollowupTemplateSchema = createInsertSchema(followupTemplates).omit({
  id: true,
  createdAt: true
});

export type FollowupTemplate = typeof followupTemplates.$inferSelect;
export type InsertFollowupTemplate = z.infer<typeof insertFollowupTemplateSchema>;

// Follow-up Feedback - Track user reactions to follow-up suggestions
export const followupFeedback = pgTable("followup_feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  followupText: text("followup_text").notNull(), // The suggested follow-up text
  followupType: text("followup_type"), // The intent type of the follow-up
  helpful: boolean("helpful"), // true for thumbs up, false for thumbs down
  templateId: integer("template_id").references(() => followupTemplates.id), // Which template was used (if any)
  context: jsonb("context"), // Store context: {"userMessage", "intent", "industry", ...}
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFollowupFeedbackSchema = createInsertSchema(followupFeedback).omit({
  id: true,
  createdAt: true
});

export type FollowupFeedback = typeof followupFeedback.$inferSelect;
export type InsertFollowupFeedback = z.infer<typeof insertFollowupFeedbackSchema>;
