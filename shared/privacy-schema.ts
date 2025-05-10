import { relations } from "drizzle-orm";
import { boolean, pgEnum, pgTable, text, timestamp, integer, json, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./schema";

/**
 * Enums for privacy-related data
 */

// User consent categories
export const consentCategoryEnum = pgEnum("consent_category", [
  "essential",       // Required for site function
  "functional",      // Enhanced features
  "analytics",       // Site analytics and performance
  "advertising",     // Personalized ads
  "social",          // Social media features
]);

// Data deletion statuses
export const deletionStatusEnum = pgEnum("deletion_status", [
  "requested",       // User has requested deletion
  "processing",      // Deletion in progress
  "completed",       // Deletion completed
  "failed",          // Deletion failed
  "partial",         // Partial deletion (some data retained)
]);

// Consent status
export const consentStatusEnum = pgEnum("consent_status", [
  "granted",         // User has granted consent
  "denied",          // User has denied consent
  "withdrawn",       // User has withdrawn previous consent
  "expired",         // Consent has expired
]);

// Geographic regions for data residency and compliance rules
export const geoRegionEnum = pgEnum("geo_region", [
  "global",          // No specific region
  "eu",              // European Union (GDPR)
  "india",           // India (IT Rules 2021)
  "california",      // California (CCPA)
  "other",           // Other regions
]);

/**
 * Cookie consent table to store user preferences
 */
export const cookieConsents = pgTable("cookie_consents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").references(() => users.username),
  category: consentCategoryEnum("category").notNull(),
  status: consentStatusEnum("status").notNull().default("denied"),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

// Relations for cookie consents
export const cookieConsentsRelations = relations(cookieConsents, ({ one }) => ({
  user: one(users, {
    fields: [cookieConsents.userId],
    references: [users.username],
  }),
}));

/**
 * Data access requests (used for GDPR compliance)
 */
export const dataRequests = pgTable("data_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").references(() => users.username),
  requestType: text("request_type").notNull(), // download, delete, correct, etc.
  status: text("status").notNull().default("pending"),
  requestDate: timestamp("request_date").notNull().defaultNow(),
  completionDate: timestamp("completion_date"),
  requestData: json("request_data"),
  verificationToken: text("verification_token"),
  requestIp: text("request_ip"),
});

// Relations for data requests
export const dataRequestsRelations = relations(dataRequests, ({ one }) => ({
  user: one(users, {
    fields: [dataRequests.userId],
    references: [users.username],
  }),
}));

/**
 * Privacy policy acknowledgments
 */
export const policyAcknowledgments = pgTable("policy_acknowledgments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").references(() => users.username),
  policyVersion: text("policy_version").notNull(),
  acknowledgedAt: timestamp("acknowledged_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

// Relations for policy acknowledgments
export const policyAcknowledgmentsRelations = relations(policyAcknowledgments, ({ one }) => ({
  user: one(users, {
    fields: [policyAcknowledgments.userId],
    references: [users.username],
  }),
}));

/**
 * Data deletion records
 */
export const dataDeletions = pgTable("data_deletions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id"),
  requestId: integer("request_id").references(() => dataRequests.id),
  status: deletionStatusEnum("status").notNull().default("processing"),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  retentionReason: text("retention_reason"), // If some data is legally required to be kept
  logs: json("logs"),
});

/**
 * Data residency preferences
 */
export const dataResidency = pgTable("data_residency", {
  userId: text("user_id").references(() => users.username),
  preferredRegion: geoRegionEnum("preferred_region").notNull().default("global"),
  detectedRegion: geoRegionEnum("detected_region"),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId] }),
  };
});

// Relations for data residency
export const dataResidencyRelations = relations(dataResidency, ({ one }) => ({
  user: one(users, {
    fields: [dataResidency.userId],
    references: [users.username],
  }),
}));

/**
 * User communication preferences
 */
export const communicationPreferences = pgTable("communication_preferences", {
  userId: text("user_id").references(() => users.username),
  marketingEmails: boolean("marketing_emails").notNull().default(false),
  productUpdates: boolean("product_updates").notNull().default(true),
  securityAlerts: boolean("security_alerts").notNull().default(true),
  newsletterFrequency: text("newsletter_frequency").default("weekly"),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId] }),
  };
});

// Relations for communication preferences
export const communicationPreferencesRelations = relations(communicationPreferences, ({ one }) => ({
  user: one(users, {
    fields: [communicationPreferences.userId],
    references: [users.username],
  }),
}));

/**
 * Log of all privacy-related actions for auditing purposes
 */
export const privacyAuditLogs = pgTable("privacy_audit_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").references(() => users.username),
  action: text("action").notNull(),
  performedAt: timestamp("performed_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  details: json("details"),
});

// Relations for privacy audit logs
export const privacyAuditLogsRelations = relations(privacyAuditLogs, ({ one }) => ({
  user: one(users, {
    fields: [privacyAuditLogs.userId],
    references: [users.username],
  }),
}));

// Insert schemas for all tables
export const insertCookieConsentSchema = createInsertSchema(cookieConsents).omit({
  id: true,
  lastUpdated: true,
});

export const insertDataRequestSchema = createInsertSchema(dataRequests).omit({
  id: true,
  requestDate: true,
  completionDate: true,
});

export const insertPolicyAcknowledgmentSchema = createInsertSchema(policyAcknowledgments).omit({
  id: true,
  acknowledgedAt: true,
});

export const insertDataDeletionSchema = createInsertSchema(dataDeletions).omit({
  id: true,
  startedAt: true,
  completedAt: true,
});

export const insertDataResidencySchema = createInsertSchema(dataResidency).omit({
  lastUpdated: true,
});

export const insertCommunicationPreferencesSchema = createInsertSchema(communicationPreferences).omit({
  lastUpdated: true,
});

export const insertPrivacyAuditLogSchema = createInsertSchema(privacyAuditLogs).omit({
  id: true,
  performedAt: true,
});

// Types
export type CookieConsent = typeof cookieConsents.$inferSelect;
export type InsertCookieConsent = z.infer<typeof insertCookieConsentSchema>;

export type DataRequest = typeof dataRequests.$inferSelect;
export type InsertDataRequest = z.infer<typeof insertDataRequestSchema>;

export type PolicyAcknowledgment = typeof policyAcknowledgments.$inferSelect;
export type InsertPolicyAcknowledgment = z.infer<typeof insertPolicyAcknowledgmentSchema>;

export type DataDeletion = typeof dataDeletions.$inferSelect;
export type InsertDataDeletion = z.infer<typeof insertDataDeletionSchema>;

export type DataResidencyPreference = typeof dataResidency.$inferSelect;
export type InsertDataResidencyPreference = z.infer<typeof insertDataResidencySchema>;

export type CommunicationPreference = typeof communicationPreferences.$inferSelect;
export type InsertCommunicationPreference = z.infer<typeof insertCommunicationPreferencesSchema>;

export type PrivacyAuditLog = typeof privacyAuditLogs.$inferSelect;
export type InsertPrivacyAuditLog = z.infer<typeof insertPrivacyAuditLogSchema>;