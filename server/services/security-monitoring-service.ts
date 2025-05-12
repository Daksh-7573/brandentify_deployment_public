import { db } from "../db";
import { 
  securityAuditLogs, 
  attackAttempts, 
  systemErrors,
  vulnerabilityScanResults,
  vulnerabilities,
  penetrationTests,
  pentestFindings,
  type InsertSecurityAuditLog,
  type InsertAttackAttempt,
  type InsertSystemError,
  type InsertVulnerabilityScanResult,
  type InsertVulnerability,
  type InsertPenetrationTest,
  type InsertPentestFinding
} from "@shared/security-monitoring-schema";
import { eq, and, gte, lte, desc, asc, sql } from "drizzle-orm";
import { Request } from "express";

/**
 * Security Monitoring Service
 * 
 * This service handles all security-related logging, monitoring, and threat detection
 * for the application, providing a comprehensive view of the system's security posture.
 */
export class SecurityMonitoringService {
  /**
   * Log a security-related event to the audit log
   */
  static async logSecurityEvent(logData: InsertSecurityAuditLog) {
    try {
      const [logEntry] = await db.insert(securityAuditLogs)
        .values(logData)
        .returning();
      
      console.log(`Security event logged: ${logData.eventType} - ${logData.action}`);
      return logEntry;
    } catch (error) {
      console.error("Error logging security event:", error);
      throw error;
    }
  }

  /**
   * Extract request metadata for security logs from Express request
   */
  static getRequestMetadata(req: Request) {
    return {
      ipAddress: req.ip || req.socket.remoteAddress || "unknown",
      userAgent: req.headers["user-agent"] || "unknown",
      requestPath: req.originalUrl || req.url || "unknown",
      requestMethod: req.method || "unknown"
    };
  }

  /**
   * Log a detected attack attempt
   */
  static async logAttackAttempt(attackData: InsertAttackAttempt) {
    try {
      const [attackEntry] = await db.insert(attackAttempts)
        .values(attackData)
        .returning();
      
      // For high and critical attacks, also create a security audit log
      if (attackData.severity === "high" || attackData.severity === "critical") {
        await this.logSecurityEvent({
          eventType: "attack",
          severity: attackData.severity,
          action: `Detected ${attackData.attackType} attack`,
          status: attackData.blocked ? "blocked" : "detected",
          userId: attackData.userId,
          ipAddress: attackData.ipAddress,
          userAgent: attackData.userAgent,
          requestPath: attackData.requestPath,
          details: attackData.details
        });
      }
      
      return attackEntry;
    } catch (error) {
      console.error("Error logging attack attempt:", error);
      throw error;
    }
  }

  /**
   * Log a system error or exception
   */
  static async logSystemError(errorData: InsertSystemError) {
    try {
      const [errorEntry] = await db.insert(systemErrors)
        .values(errorData)
        .returning();
      
      // For medium and higher severity, also create a security audit log
      if (["medium", "high", "critical"].includes(errorData.severity)) {
        await this.logSecurityEvent({
          eventType: "system",
          severity: errorData.severity,
          action: `System error in ${errorData.component}`,
          status: "failure",
          userId: errorData.userId,
          ipAddress: errorData.ipAddress,
          userAgent: errorData.userAgent,
          requestPath: errorData.requestPath,
          details: { 
            errorType: errorData.errorType,
            message: errorData.message,
            affectedData: errorData.affectedData
          }
        });
      }
      
      return errorEntry;
    } catch (error) {
      console.error("Error logging system error:", error);
      throw error;
    }
  }

  /**
   * Create a new vulnerability scan result
   */
  static async createVulnerabilityScan(scanData: InsertVulnerabilityScanResult) {
    try {
      const [scan] = await db.insert(vulnerabilityScanResults)
        .values(scanData)
        .returning();
      
      // Log a security audit event
      await this.logSecurityEvent({
        eventType: "vulnerability",
        severity: scan.criticalCount > 0 ? "critical" : 
                  scan.highCount > 0 ? "high" : 
                  scan.mediumCount > 0 ? "medium" : "low",
        action: `Vulnerability scan ${scan.scanType} initiated`,
        status: "success",
        userId: scanData.initiatedBy,
        details: { 
          scanId: scan.scanId,
          scanType: scan.scanType,
          scannerName: scan.scannerName
        }
      });
      
      return scan;
    } catch (error) {
      console.error("Error creating vulnerability scan:", error);
      throw error;
    }
  }

  /**
   * Add a vulnerability to the database
   */
  static async addVulnerability(vulnerabilityData: InsertVulnerability) {
    try {
      const [vulnerability] = await db.insert(vulnerabilities)
        .values(vulnerabilityData)
        .returning();
      
      // Update vulnerability counts in the scan results
      await this.updateVulnerabilityCounts(vulnerabilityData.scanId);
      
      return vulnerability;
    } catch (error) {
      console.error("Error adding vulnerability:", error);
      throw error;
    }
  }

  /**
   * Update the counts of vulnerabilities for a scan
   */
  private static async updateVulnerabilityCounts(scanId: string) {
    try {
      // Calculate counts by severity
      const counts = await db.select({
        total: sql`COUNT(*)`,
        critical: sql`SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END)`,
        high: sql`SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END)`,
        medium: sql`SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END)`,
        low: sql`SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END)`
      })
      .from(vulnerabilities)
      .where(eq(vulnerabilities.scanId, scanId));
      
      if (counts.length > 0) {
        // Update the scan result with the new counts
        await db.update(vulnerabilityScanResults)
          .set({
            vulnerabilityCount: Number(counts[0].total) || 0,
            criticalCount: Number(counts[0].critical) || 0,
            highCount: Number(counts[0].high) || 0,
            mediumCount: Number(counts[0].medium) || 0,
            lowCount: Number(counts[0].low) || 0
          })
          .where(eq(vulnerabilityScanResults.scanId, scanId));
      }
    } catch (error) {
      console.error("Error updating vulnerability counts:", error);
      throw error;
    }
  }

  /**
   * Create a new penetration test record
   */
  static async createPenetrationTest(testData: InsertPenetrationTest) {
    try {
      const [test] = await db.insert(penetrationTests)
        .values(testData)
        .returning();
      
      // Log a security audit event
      await this.logSecurityEvent({
        eventType: "vulnerability",
        severity: "info",
        action: `Penetration test "${test.testName}" created`,
        status: "success",
        userId: testData.requestedBy,
        details: { 
          testId: test.id,
          testName: test.testName,
          scope: test.scope
        }
      });
      
      return test;
    } catch (error) {
      console.error("Error creating penetration test:", error);
      throw error;
    }
  }

  /**
   * Add a penetration test finding
   */
  static async addPentestFinding(findingData: InsertPentestFinding) {
    try {
      const [finding] = await db.insert(pentestFindings)
        .values(findingData)
        .returning();
      
      // Update finding counts in the penetration test
      await this.updatePentestFindingCounts(findingData.pentestId);
      
      return finding;
    } catch (error) {
      console.error("Error adding pentest finding:", error);
      throw error;
    }
  }

  /**
   * Update the counts of findings for a penetration test
   */
  private static async updatePentestFindingCounts(pentestId: number) {
    try {
      // Calculate counts by severity
      const counts = await db.select({
        total: sql`COUNT(*)`,
        critical: sql`SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END)`,
        high: sql`SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END)`,
        medium: sql`SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END)`,
        low: sql`SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END)`
      })
      .from(pentestFindings)
      .where(eq(pentestFindings.pentestId, pentestId));
      
      if (counts.length > 0) {
        // Update the pentest with the new counts
        await db.update(penetrationTests)
          .set({
            findingsCount: Number(counts[0].total) || 0,
            criticalCount: Number(counts[0].critical) || 0,
            highCount: Number(counts[0].high) || 0,
            mediumCount: Number(counts[0].medium) || 0,
            lowCount: Number(counts[0].low) || 0
          })
          .where(eq(penetrationTests.id, pentestId));
      }
    } catch (error) {
      console.error("Error updating pentest finding counts:", error);
      throw error;
    }
  }

  /**
   * Get security audit logs with filtering options
   */
  static async getSecurityAuditLogs(options: {
    userId?: string;
    eventType?: string;
    severity?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    try {
      const {
        userId,
        eventType,
        severity,
        startDate,
        endDate,
        page = 1,
        limit = 50,
        sortBy = 'timestamp',
        sortOrder = 'desc'
      } = options;
      
      // Build query conditions
      let query = db.select().from(securityAuditLogs);
      
      if (userId) {
        query = query.where(eq(securityAuditLogs.userId, userId));
      }
      
      if (eventType) {
        query = query.where(eq(securityAuditLogs.eventType, eventType as any));
      }
      
      if (severity) {
        query = query.where(eq(securityAuditLogs.severity, severity as any));
      }
      
      if (startDate) {
        query = query.where(gte(securityAuditLogs.timestamp, startDate));
      }
      
      if (endDate) {
        query = query.where(lte(securityAuditLogs.timestamp, endDate));
      }
      
      // Calculate pagination
      const offset = (page - 1) * limit;
      
      // Add sorting
      if (sortOrder === 'asc') {
        query = query.orderBy(asc(securityAuditLogs[sortBy as keyof typeof securityAuditLogs]));
      } else {
        query = query.orderBy(desc(securityAuditLogs[sortBy as keyof typeof securityAuditLogs]));
      }
      
      // Add pagination
      query = query.limit(limit).offset(offset);
      
      // Execute query
      const logs = await query;
      
      // Get total count for pagination
      const countQuery = db.select({ count: sql`COUNT(*)` })
        .from(securityAuditLogs);
      
      if (userId) {
        countQuery.where(eq(securityAuditLogs.userId, userId));
      }
      
      if (eventType) {
        countQuery.where(eq(securityAuditLogs.eventType, eventType as any));
      }
      
      if (severity) {
        countQuery.where(eq(securityAuditLogs.severity, severity as any));
      }
      
      if (startDate) {
        countQuery.where(gte(securityAuditLogs.timestamp, startDate));
      }
      
      if (endDate) {
        countQuery.where(lte(securityAuditLogs.timestamp, endDate));
      }
      
      const [{ count }] = await countQuery;
      const totalCount = Number(count);
      
      return {
        logs,
        pagination: {
          page,
          limit,
          totalItems: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      console.error("Error getting security audit logs:", error);
      throw error;
    }
  }

  /**
   * Get attack attempts with filtering options
   */
  static async getAttackAttempts(options: {
    userId?: string;
    attackType?: string;
    severity?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    try {
      const {
        userId,
        attackType,
        severity,
        startDate,
        endDate,
        page = 1,
        limit = 50,
        sortBy = 'timestamp',
        sortOrder = 'desc'
      } = options;
      
      // Build query conditions
      let query = db.select().from(attackAttempts);
      
      if (userId) {
        query = query.where(eq(attackAttempts.userId, userId));
      }
      
      if (attackType) {
        query = query.where(eq(attackAttempts.attackType, attackType as any));
      }
      
      if (severity) {
        query = query.where(eq(attackAttempts.severity, severity as any));
      }
      
      if (startDate) {
        query = query.where(gte(attackAttempts.timestamp, startDate));
      }
      
      if (endDate) {
        query = query.where(lte(attackAttempts.timestamp, endDate));
      }
      
      // Calculate pagination
      const offset = (page - 1) * limit;
      
      // Add sorting
      if (sortOrder === 'asc') {
        query = query.orderBy(asc(attackAttempts[sortBy as keyof typeof attackAttempts]));
      } else {
        query = query.orderBy(desc(attackAttempts[sortBy as keyof typeof attackAttempts]));
      }
      
      // Add pagination
      query = query.limit(limit).offset(offset);
      
      // Execute query
      const attacks = await query;
      
      // Get total count for pagination
      const countQuery = db.select({ count: sql`COUNT(*)` })
        .from(attackAttempts);
      
      if (userId) {
        countQuery.where(eq(attackAttempts.userId, userId));
      }
      
      if (attackType) {
        countQuery.where(eq(attackAttempts.attackType, attackType as any));
      }
      
      if (severity) {
        countQuery.where(eq(attackAttempts.severity, severity as any));
      }
      
      if (startDate) {
        countQuery.where(gte(attackAttempts.timestamp, startDate));
      }
      
      if (endDate) {
        countQuery.where(lte(attackAttempts.timestamp, endDate));
      }
      
      const [{ count }] = await countQuery;
      const totalCount = Number(count);
      
      return {
        attacks,
        pagination: {
          page,
          limit,
          totalItems: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      console.error("Error getting attack attempts:", error);
      throw error;
    }
  }

  /**
   * Get system errors with filtering options
   */
  static async getSystemErrors(options: {
    component?: string;
    errorType?: string;
    severity?: string;
    resolved?: boolean;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    try {
      const {
        component,
        errorType,
        severity,
        resolved,
        startDate,
        endDate,
        page = 1,
        limit = 50,
        sortBy = 'timestamp',
        sortOrder = 'desc'
      } = options;
      
      // Build query conditions
      let query = db.select().from(systemErrors);
      
      if (component) {
        query = query.where(eq(systemErrors.component, component));
      }
      
      if (errorType) {
        query = query.where(eq(systemErrors.errorType, errorType));
      }
      
      if (severity) {
        query = query.where(eq(systemErrors.severity, severity as any));
      }
      
      if (resolved !== undefined) {
        query = query.where(eq(systemErrors.resolved, resolved));
      }
      
      if (startDate) {
        query = query.where(gte(systemErrors.timestamp, startDate));
      }
      
      if (endDate) {
        query = query.where(lte(systemErrors.timestamp, endDate));
      }
      
      // Calculate pagination
      const offset = (page - 1) * limit;
      
      // Add sorting
      if (sortOrder === 'asc') {
        query = query.orderBy(asc(systemErrors[sortBy as keyof typeof systemErrors]));
      } else {
        query = query.orderBy(desc(systemErrors[sortBy as keyof typeof systemErrors]));
      }
      
      // Add pagination
      query = query.limit(limit).offset(offset);
      
      // Execute query
      const errors = await query;
      
      // Get total count for pagination
      const countQuery = db.select({ count: sql`COUNT(*)` })
        .from(systemErrors);
      
      if (component) {
        countQuery.where(eq(systemErrors.component, component));
      }
      
      if (errorType) {
        countQuery.where(eq(systemErrors.errorType, errorType));
      }
      
      if (severity) {
        countQuery.where(eq(systemErrors.severity, severity as any));
      }
      
      if (resolved !== undefined) {
        countQuery.where(eq(systemErrors.resolved, resolved));
      }
      
      if (startDate) {
        countQuery.where(gte(systemErrors.timestamp, startDate));
      }
      
      if (endDate) {
        countQuery.where(lte(systemErrors.timestamp, endDate));
      }
      
      const [{ count }] = await countQuery;
      const totalCount = Number(count);
      
      return {
        errors,
        pagination: {
          page,
          limit,
          totalItems: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      console.error("Error getting system errors:", error);
      throw error;
    }
  }

  /**
   * Get vulnerability scan results
   */
  static async getVulnerabilityScans(options: {
    scanType?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    try {
      const {
        scanType,
        status,
        startDate,
        endDate,
        page = 1,
        limit = 20
      } = options;
      
      // Build query
      let query = db.select().from(vulnerabilityScanResults);
      
      if (scanType) {
        query = query.where(eq(vulnerabilityScanResults.scanType, scanType));
      }
      
      if (status) {
        query = query.where(eq(vulnerabilityScanResults.status, status));
      }
      
      if (startDate) {
        query = query.where(gte(vulnerabilityScanResults.scanDate, startDate));
      }
      
      if (endDate) {
        query = query.where(lte(vulnerabilityScanResults.scanDate, endDate));
      }
      
      // Pagination
      const offset = (page - 1) * limit;
      query = query.orderBy(desc(vulnerabilityScanResults.scanDate))
        .limit(limit)
        .offset(offset);
      
      const scans = await query;
      
      // Get total count
      const [{ count }] = await db.select({ count: sql`COUNT(*)` })
        .from(vulnerabilityScanResults);
      
      return {
        scans,
        pagination: {
          page,
          limit,
          totalItems: Number(count),
          totalPages: Math.ceil(Number(count) / limit)
        }
      };
    } catch (error) {
      console.error("Error getting vulnerability scans:", error);
      throw error;
    }
  }

  /**
   * Get vulnerabilities for a scan
   */
  static async getVulnerabilitiesForScan(scanId: string, options: {
    severity?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const {
        severity,
        status,
        page = 1,
        limit = 100
      } = options;
      
      // Build query
      let query = db.select().from(vulnerabilities)
        .where(eq(vulnerabilities.scanId, scanId));
      
      if (severity) {
        query = query.where(eq(vulnerabilities.severity, severity as any));
      }
      
      if (status) {
        query = query.where(eq(vulnerabilities.status, status));
      }
      
      // Pagination
      const offset = (page - 1) * limit;
      query = query.orderBy([
        desc(vulnerabilities.severity),
        asc(vulnerabilities.title)
      ])
        .limit(limit)
        .offset(offset);
      
      const items = await query;
      
      // Get total count
      const [{ count }] = await db.select({ count: sql`COUNT(*)` })
        .from(vulnerabilities)
        .where(eq(vulnerabilities.scanId, scanId));
      
      return {
        vulnerabilities: items,
        pagination: {
          page,
          limit,
          totalItems: Number(count),
          totalPages: Math.ceil(Number(count) / limit)
        }
      };
    } catch (error) {
      console.error("Error getting vulnerabilities for scan:", error);
      throw error;
    }
  }

  /**
   * Get penetration tests
   */
  static async getPenetrationTests(options: {
    status?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    try {
      const {
        status,
        startDate,
        endDate,
        page = 1,
        limit = 20
      } = options;
      
      // Build query
      let query = db.select().from(penetrationTests);
      
      if (status) {
        query = query.where(eq(penetrationTests.status, status));
      }
      
      if (startDate) {
        query = query.where(gte(penetrationTests.testDate, startDate));
      }
      
      if (endDate) {
        query = query.where(lte(penetrationTests.testDate, endDate));
      }
      
      // Pagination
      const offset = (page - 1) * limit;
      query = query.orderBy(desc(penetrationTests.testDate))
        .limit(limit)
        .offset(offset);
      
      const tests = await query;
      
      // Get total count
      const [{ count }] = await db.select({ count: sql`COUNT(*)` })
        .from(penetrationTests);
      
      return {
        tests,
        pagination: {
          page,
          limit,
          totalItems: Number(count),
          totalPages: Math.ceil(Number(count) / limit)
        }
      };
    } catch (error) {
      console.error("Error getting penetration tests:", error);
      throw error;
    }
  }

  /**
   * Get findings for a penetration test
   */
  static async getPentestFindings(pentestId: number, options: {
    severity?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const {
        severity,
        status,
        page = 1,
        limit = 100
      } = options;
      
      // Build query
      let query = db.select().from(pentestFindings)
        .where(eq(pentestFindings.pentestId, pentestId));
      
      if (severity) {
        query = query.where(eq(pentestFindings.severity, severity as any));
      }
      
      if (status) {
        query = query.where(eq(pentestFindings.status, status));
      }
      
      // Pagination
      const offset = (page - 1) * limit;
      query = query.orderBy([
        desc(pentestFindings.severity),
        asc(pentestFindings.title)
      ])
        .limit(limit)
        .offset(offset);
      
      const items = await query;
      
      // Get total count
      const [{ count }] = await db.select({ count: sql`COUNT(*)` })
        .from(pentestFindings)
        .where(eq(pentestFindings.pentestId, pentestId));
      
      return {
        findings: items,
        pagination: {
          page,
          limit,
          totalItems: Number(count),
          totalPages: Math.ceil(Number(count) / limit)
        }
      };
    } catch (error) {
      console.error("Error getting pentest findings:", error);
      throw error;
    }
  }

  /**
   * Get security statistics for dashboard
   */
  static async getSecurityStatistics(timeRange: 'day' | 'week' | 'month' = 'week') {
    try {
      const endDate = new Date();
      let startDate = new Date();
      
      if (timeRange === 'day') {
        startDate.setDate(startDate.getDate() - 1);
      } else if (timeRange === 'week') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (timeRange === 'month') {
        startDate.setMonth(startDate.getMonth() - 1);
      }
      
      // Get security events count
      const [securityEventsCount] = await db.select({ count: sql`COUNT(*)` })
        .from(securityAuditLogs)
        .where(and(
          gte(securityAuditLogs.timestamp, startDate),
          lte(securityAuditLogs.timestamp, endDate)
        ));
      
      // Get attack attempts count
      const [attackAttemptsCount] = await db.select({ count: sql`COUNT(*)` })
        .from(attackAttempts)
        .where(and(
          gte(attackAttempts.timestamp, startDate),
          lte(attackAttempts.timestamp, endDate)
        ));
      
      // Get system errors count
      const [systemErrorsCount] = await db.select({ count: sql`COUNT(*)` })
        .from(systemErrors)
        .where(and(
          gte(systemErrors.timestamp, startDate),
          lte(systemErrors.timestamp, endDate)
        ));
      
      // Get event types distribution
      const eventTypesDistribution = await db.select({
        eventType: securityAuditLogs.eventType,
        count: sql`COUNT(*)`
      })
        .from(securityAuditLogs)
        .where(and(
          gte(securityAuditLogs.timestamp, startDate),
          lte(securityAuditLogs.timestamp, endDate)
        ))
        .groupBy(securityAuditLogs.eventType);
      
      // Get severity distribution
      const severityDistribution = await db.select({
        severity: securityAuditLogs.severity,
        count: sql`COUNT(*)`
      })
        .from(securityAuditLogs)
        .where(and(
          gte(securityAuditLogs.timestamp, startDate),
          lte(securityAuditLogs.timestamp, endDate)
        ))
        .groupBy(securityAuditLogs.severity);
      
      // Get attack types distribution
      const attackTypesDistribution = await db.select({
        attackType: attackAttempts.attackType,
        count: sql`COUNT(*)`
      })
        .from(attackAttempts)
        .where(and(
          gte(attackAttempts.timestamp, startDate),
          lte(attackAttempts.timestamp, endDate)
        ))
        .groupBy(attackAttempts.attackType);
      
      return {
        timeRange,
        counts: {
          securityEvents: Number(securityEventsCount.count),
          attackAttempts: Number(attackAttemptsCount.count),
          systemErrors: Number(systemErrorsCount.count)
        },
        distributions: {
          eventTypes: eventTypesDistribution.map(item => ({
            type: item.eventType,
            count: Number(item.count)
          })),
          severity: severityDistribution.map(item => ({
            level: item.severity,
            count: Number(item.count)
          })),
          attackTypes: attackTypesDistribution.map(item => ({
            type: item.attackType,
            count: Number(item.count)
          }))
        }
      };
    } catch (error) {
      console.error("Error getting security statistics:", error);
      throw error;
    }
  }
}