import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text, timestamp, integer, json, primaryKey, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./schema";

/**
 * Enums for security monitoring and threat detection
 */

// Security log severity levels
export const securitySeverityEnum = pgEnum("security_severity", [
  "info",            // General information, no security impact
  "low",             // Low severity issue, minimal security impact
  "medium",          // Medium severity issue, moderate security impact
  "high",            // High severity issue, significant security impact
  "critical",        // Critical severity issue, severe security impact
]);

// Security event types
export const securityEventTypeEnum = pgEnum("security_event_type", [
  "authentication",  // Login attempts, password changes, 2FA events
  "authorization",   // Permission changes, access attempts
  "file_operation",  // File uploads, downloads, modifications
  "data_access",     // User data access, exports, API calls
  "admin_action",    // Admin-level operations
  "system",          // System-level events (startup, shutdown, etc.)
  "attack",          // Detected attack attempts
  "api",             // API-related events
  "vulnerability",   // Detected vulnerabilities
]);

// Attack types
export const attackTypeEnum = pgEnum("attack_type", [
  "xss",             // Cross-site scripting
  "sql_injection",   // SQL injection
  "csrf",            // Cross-site request forgery
  "path_traversal",  // Path traversal
  "file_upload",     // Malicious file upload
  "dos",             // Denial of service
  "brute_force",     // Brute force login attempt
  "prompt_injection", // AI prompt injection
  "other",           // Other attack types
]);

/**
 * Security audit logs table for monitoring and threat detection
 */
export const securityAuditLogs = pgTable("security_audit_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  userId: text("user_id").references(() => users.username),
  eventType: securityEventTypeEnum("event_type").notNull(),
  severity: securitySeverityEnum("severity").notNull().default("info"),
  action: text("action").notNull(),
  status: text("status").notNull(), // success, failure, blocked
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  requestPath: text("request_path"),
  requestMethod: text("request_method"),
  details: json("details"),
});

// Relations for security audit logs
export const securityAuditLogsRelations = relations(securityAuditLogs, ({ one }) => ({
  user: one(users, {
    fields: [securityAuditLogs.userId],
    references: [users.username],
  }),
}));

/**
 * Detected attack attempts table
 */
export const attackAttempts = pgTable("attack_attempts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  userId: text("user_id").references(() => users.username),
  attackType: attackTypeEnum("attack_type").notNull(),
  severity: securitySeverityEnum("severity").notNull(),
  blocked: boolean("blocked").notNull().default(true),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  requestPath: text("request_path"),
  requestData: json("request_data"),
  headers: json("headers"),
  mitigationApplied: text("mitigation_applied"),
  details: json("details"),
});

// Relations for attack attempts
export const attackAttemptsRelations = relations(attackAttempts, ({ one }) => ({
  user: one(users, {
    fields: [attackAttempts.userId],
    references: [users.username],
  }),
}));

/**
 * System errors and exceptions table
 */
export const systemErrors = pgTable("system_errors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  errorType: text("error_type").notNull(),
  component: text("component").notNull(), // Which part of the system
  severity: securitySeverityEnum("severity").notNull().default("medium"),
  message: text("message").notNull(),
  stackTrace: text("stack_trace"),
  userId: text("user_id").references(() => users.username),
  requestPath: text("request_path"),
  requestMethod: text("request_method"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  affectedData: json("affected_data"),
  resolved: boolean("resolved").notNull().default(false),
  resolutionNotes: text("resolution_notes"),
});

// Relations for system errors
export const systemErrorsRelations = relations(systemErrors, ({ one }) => ({
  user: one(users, {
    fields: [systemErrors.userId],
    references: [users.username],
  }),
}));

/**
 * Vulnerability scan results table
 */
export const vulnerabilityScanResults = pgTable("vulnerability_scan_results", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  scanId: text("scan_id").notNull(), // Unique identifier for the scan
  scanType: text("scan_type").notNull(), // Dependency, code, infrastructure
  scannerName: text("scanner_name").notNull(), // Name of scanner
  scanDate: timestamp("scan_date").notNull().defaultNow(),
  completedDate: timestamp("completed_date"),
  vulnerabilityCount: integer("vulnerability_count").notNull().default(0),
  criticalCount: integer("critical_count").notNull().default(0),
  highCount: integer("high_count").notNull().default(0),
  mediumCount: integer("medium_count").notNull().default(0),
  lowCount: integer("low_count").notNull().default(0),
  status: text("status").notNull(), // completed, failed, in-progress
  scanResults: json("scan_results"),
  scanConfig: json("scan_config"),
  initiatedBy: text("initiated_by").references(() => users.username),
});

/**
 * Individual vulnerabilities found during scans
 */
export const vulnerabilities = pgTable("vulnerabilities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  scanId: text("scan_id").notNull().references(() => vulnerabilityScanResults.scanId),
  cveId: text("cve_id"), // If it has a CVE
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: securitySeverityEnum("severity").notNull(),
  affectedComponent: text("affected_component").notNull(),
  status: text("status").notNull().default("open"), // open, fixed, false-positive, accepted-risk
  detectionDate: timestamp("detection_date").notNull().defaultNow(),
  fixedDate: timestamp("fixed_date"),
  fixedInVersion: text("fixed_in_version"),
  fixedByUserId: text("fixed_by_user_id").references(() => users.username),
  fixDetails: text("fix_details"),
  mitigationSteps: text("mitigation_steps"),
  technicalDetails: json("technical_details"),
});

/**
 * Penetration testing campaigns table
 */
export const penetrationTests = pgTable("penetration_tests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  testName: text("test_name").notNull(),
  testDate: timestamp("test_date").notNull().defaultNow(),
  completedDate: timestamp("completed_date"),
  tester: text("tester").notNull(), // Name of tester or company
  scope: text("scope").notNull(), // What was tested
  methodologies: text("methodologies").notNull(), // How it was tested
  findingsCount: integer("findings_count").notNull().default(0),
  criticalCount: integer("critical_count").notNull().default(0),
  highCount: integer("high_count").notNull().default(0),
  mediumCount: integer("medium_count").notNull().default(0),
  lowCount: integer("low_count").notNull().default(0),
  status: text("status").notNull(), // planned, in-progress, completed, cancelled
  reportUrl: text("report_url"), // URL to the pentest report
  summary: text("summary"),
  requestedBy: text("requested_by").references(() => users.username),
});

// Individual pentest findings
export const pentestFindings = pgTable("pentest_findings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pentestId: integer("pentest_id").notNull().references(() => penetrationTests.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: securitySeverityEnum("severity").notNull(),
  affectedComponent: text("affected_component").notNull(),
  status: text("status").notNull().default("open"), // open, fixed, in-progress, accepted-risk
  reportedDate: timestamp("reported_date").notNull().defaultNow(),
  fixedDate: timestamp("fixed_date"),
  fixedByUserId: text("fixed_by_user_id").references(() => users.username),
  fixDetails: text("fix_details"),
  recommendedMitigation: text("recommended_mitigation"),
  technicalDetails: json("technical_details"),
  proofOfConcept: text("proof_of_concept"),
});

// Insert schemas
export const insertSecurityAuditLogSchema = createInsertSchema(securityAuditLogs).omit({
  id: true,
  timestamp: true,
});

export const insertAttackAttemptSchema = createInsertSchema(attackAttempts).omit({
  id: true,
  timestamp: true,
});

export const insertSystemErrorSchema = createInsertSchema(systemErrors).omit({
  id: true,
  timestamp: true,
});

export const insertVulnerabilityScanResultSchema = createInsertSchema(vulnerabilityScanResults).omit({
  id: true,
  scanDate: true,
  completedDate: true,
});

export const insertVulnerabilitySchema = createInsertSchema(vulnerabilities).omit({
  id: true,
  detectionDate: true,
  fixedDate: true,
});

export const insertPenetrationTestSchema = createInsertSchema(penetrationTests).omit({
  id: true,
  testDate: true,
  completedDate: true,
});

export const insertPentestFindingSchema = createInsertSchema(pentestFindings).omit({
  id: true,
  reportedDate: true,
  fixedDate: true,
});

// Types
export type SecurityAuditLog = typeof securityAuditLogs.$inferSelect;
export type InsertSecurityAuditLog = z.infer<typeof insertSecurityAuditLogSchema>;

export type AttackAttempt = typeof attackAttempts.$inferSelect;
export type InsertAttackAttempt = z.infer<typeof insertAttackAttemptSchema>;

export type SystemError = typeof systemErrors.$inferSelect;
export type InsertSystemError = z.infer<typeof insertSystemErrorSchema>;

export type VulnerabilityScanResult = typeof vulnerabilityScanResults.$inferSelect;
export type InsertVulnerabilityScanResult = z.infer<typeof insertVulnerabilityScanResultSchema>;

export type Vulnerability = typeof vulnerabilities.$inferSelect;
export type InsertVulnerability = z.infer<typeof insertVulnerabilitySchema>;

export type PenetrationTest = typeof penetrationTests.$inferSelect;
export type InsertPenetrationTest = z.infer<typeof insertPenetrationTestSchema>;

export type PentestFinding = typeof pentestFindings.$inferSelect;
export type InsertPentestFinding = z.infer<typeof insertPentestFindingSchema>;