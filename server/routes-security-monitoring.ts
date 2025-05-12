import express, { Request, Response } from "express";
import { SecurityMonitoringService } from "./services/security-monitoring-service";
import { authenticateJWT, authorize } from "./middleware/auth-middleware";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { logSecurityEvent } from "./middleware/security-monitoring-middleware";
import { db } from "./db";
import { 
  vulnerabilityScanResults, 
  vulnerabilities, 
  penetrationTests, 
  pentestFindings 
} from "@shared/security-monitoring-schema";
import { eq } from "drizzle-orm";

const router = express.Router();

// Admin-only routes protected by requireAdmin middleware
// =====================================================

/**
 * Get security audit logs with filtering
 */
router.get("/api/admin/security/logs", 
  authenticateJWT,
  authorize(['admin']), 
  logSecurityEvent("admin_action", "View security audit logs", "medium"),
  async (req: Request, res: Response) => {
    try {
      const { 
        userId, 
        eventType, 
        severity, 
        startDate, 
        endDate,
        page = "1", 
        limit = "50",
        sortBy = "timestamp",
        sortOrder = "desc"
      } = req.query;
      
      // Parse query parameters
      const filters = {
        userId: userId as string | undefined,
        eventType: eventType as string | undefined,
        severity: severity as string | undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        sortBy: sortBy as string,
        sortOrder: (sortOrder as 'asc' | 'desc') || 'desc'
      };
      
      const result = await SecurityMonitoringService.getSecurityAuditLogs(filters);
      
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error getting security audit logs:", error);
      return res.status(500).json({ 
        error: "Failed to retrieve security audit logs",
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  }
);

/**
 * Get attack attempts with filtering
 */
router.get("/api/admin/security/attacks", 
  authenticateJWT,
  authorize(['admin']), 
  logSecurityEvent("admin_action", "View attack attempts", "medium"),
  async (req: Request, res: Response) => {
    try {
      const { 
        userId, 
        attackType, 
        severity, 
        startDate, 
        endDate,
        page = "1", 
        limit = "50",
        sortBy = "timestamp",
        sortOrder = "desc"
      } = req.query;
      
      // Parse query parameters
      const filters = {
        userId: userId as string | undefined,
        attackType: attackType as string | undefined,
        severity: severity as string | undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        sortBy: sortBy as string,
        sortOrder: (sortOrder as 'asc' | 'desc') || 'desc'
      };
      
      const result = await SecurityMonitoringService.getAttackAttempts(filters);
      
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error getting attack attempts:", error);
      return res.status(500).json({ 
        error: "Failed to retrieve attack attempts",
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  }
);

/**
 * Get system errors with filtering
 */
router.get("/api/admin/security/errors", 
  authenticateJWT,
  authorize(['admin']), 
  logSecurityEvent("admin_action", "View system errors", "medium"),
  async (req: Request, res: Response) => {
    try {
      const { 
        component, 
        errorType, 
        severity,
        resolved,
        startDate, 
        endDate,
        page = "1", 
        limit = "50",
        sortBy = "timestamp",
        sortOrder = "desc"
      } = req.query;
      
      // Parse query parameters
      const filters = {
        component: component as string | undefined,
        errorType: errorType as string | undefined,
        severity: severity as string | undefined,
        resolved: resolved === "true" ? true : resolved === "false" ? false : undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        sortBy: sortBy as string,
        sortOrder: (sortOrder as 'asc' | 'desc') || 'desc'
      };
      
      const result = await SecurityMonitoringService.getSystemErrors(filters);
      
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error getting system errors:", error);
      return res.status(500).json({ 
        error: "Failed to retrieve system errors",
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  }
);

/**
 * Mark a system error as resolved
 */
router.patch("/api/admin/security/errors/:id", 
  authenticateJWT,
  authorize(['admin']), 
  logSecurityEvent("admin_action", "Update system error status", "medium"),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { resolved, resolutionNotes } = req.body;
      
      // Validate request data
      if (resolved === undefined) {
        return res.status(400).json({ error: "Resolved status is required" });
      }
      
      // Update the error in the database
      await db.update(SystemErrors)
        .set({ 
          resolved: !!resolved,
          resolutionNotes: resolutionNotes || null
        })
        .where(eq(SystemErrors.id, parseInt(id, 10)));
      
      return res.status(200).json({ 
        success: true, 
        message: "System error updated successfully" 
      });
    } catch (error) {
      console.error("Error updating system error:", error);
      return res.status(500).json({ 
        error: "Failed to update system error",
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  }
);

/**
 * Get security statistics for dashboard
 */
router.get("/api/admin/security/statistics", 
  authenticateJWT,
  authorize(['admin']), 
  async (req: Request, res: Response) => {
    try {
      const { timeRange = "week" } = req.query;
      
      const validTimeRanges = ["day", "week", "month"];
      const validatedTimeRange = validTimeRanges.includes(timeRange as string) 
        ? timeRange as "day" | "week" | "month" 
        : "week";
      
      const statistics = await SecurityMonitoringService.getSecurityStatistics(validatedTimeRange);
      
      return res.status(200).json(statistics);
    } catch (error) {
      console.error("Error getting security statistics:", error);
      return res.status(500).json({ 
        error: "Failed to retrieve security statistics",
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  }
);

/**
 * Get vulnerability scans
 */
router.get("/api/admin/security/vulnerability-scans", 
  authenticateJWT,
  authorize(['admin']), 
  logSecurityEvent("admin_action", "View vulnerability scans", "medium"),
  async (req: Request, res: Response) => {
    try {
      const { 
        scanType, 
        status, 
        startDate, 
        endDate,
        page = "1", 
        limit = "20"
      } = req.query;
      
      // Parse query parameters
      const filters = {
        scanType: scanType as string | undefined,
        status: status as string | undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10)
      };
      
      const result = await SecurityMonitoringService.getVulnerabilityScans(filters);
      
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error getting vulnerability scans:", error);
      return res.status(500).json({ 
        error: "Failed to retrieve vulnerability scans",
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  }
);

/**
 * Create a new vulnerability scan
 */
router.post("/api/admin/security/vulnerability-scans", 
  authenticateJWT,
  authorize(['admin']), 
  logSecurityEvent("admin_action", "Create vulnerability scan", "medium"),
  async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        scanType: z.string(),
        scannerName: z.string(),
        status: z.string().default("in-progress"),
        scanConfig: z.any().optional(),
      });
      
      const validated = schema.parse(req.body);
      const user = req.user!;
      
      const scanData = {
        ...validated,
        scanId: `scan-${uuidv4()}`,
        initiatedBy: user.username,
      };
      
      const result = await SecurityMonitoringService.createVulnerabilityScan(scanData);
      
      return res.status(201).json(result);
    } catch (error) {
      console.error("Error creating vulnerability scan:", error);
      return res.status(500).json({ 
        error: "Failed to create vulnerability scan",
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  }
);

/**
 * Get vulnerabilities for a scan
 */
router.get("/api/admin/security/vulnerability-scans/:scanId/vulnerabilities", 
  authenticateJWT,
  authorize(['admin']), 
  async (req: Request, res: Response) => {
    try {
      const { scanId } = req.params;
      const { 
        severity, 
        status, 
        page = "1", 
        limit = "100"
      } = req.query;
      
      // Parse query parameters
      const filters = {
        severity: severity as string | undefined,
        status: status as string | undefined,
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10)
      };
      
      const result = await SecurityMonitoringService.getVulnerabilitiesForScan(scanId, filters);
      
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error getting vulnerabilities for scan:", error);
      return res.status(500).json({ 
        error: "Failed to retrieve vulnerabilities",
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  }
);

/**
 * Add a vulnerability to a scan
 */
router.post("/api/admin/security/vulnerability-scans/:scanId/vulnerabilities", 
  authenticateJWT,
  authorize(['admin']), 
  logSecurityEvent("admin_action", "Add vulnerability", "medium"),
  async (req: Request, res: Response) => {
    try {
      const { scanId } = req.params;
      
      const schema = z.object({
        title: z.string(),
        description: z.string(),
        severity: z.enum(["critical", "high", "medium", "low", "info"]),
        affectedComponent: z.string(),
        cveId: z.string().optional(),
        status: z.string().default("open"),
        technicalDetails: z.any().optional(),
        mitigationSteps: z.string().optional(),
      });
      
      const validated = schema.parse(req.body);
      
      const vulnerabilityData = {
        ...validated,
        scanId
      };
      
      const result = await SecurityMonitoringService.addVulnerability(vulnerabilityData);
      
      return res.status(201).json(result);
    } catch (error) {
      console.error("Error adding vulnerability:", error);
      return res.status(500).json({ 
        error: "Failed to add vulnerability",
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  }
);

/**
 * Update a vulnerability
 */
router.patch("/api/admin/security/vulnerabilities/:id", 
  authenticateJWT,
  authorize(['admin']), 
  logSecurityEvent("admin_action", "Update vulnerability", "medium"),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, fixedInVersion, fixDetails, mitigationSteps } = req.body;
      const user = req.user!;
      
      const updateData: any = {};
      
      if (status !== undefined) {
        updateData.status = status;
      }
      
      if (fixedInVersion !== undefined) {
        updateData.fixedInVersion = fixedInVersion;
      }
      
      if (fixDetails !== undefined) {
        updateData.fixDetails = fixDetails;
      }
      
      if (mitigationSteps !== undefined) {
        updateData.mitigationSteps = mitigationSteps;
      }
      
      // If status is being set to fixed, add fixedDate and fixedBy
      if (status === "fixed") {
        updateData.fixedDate = new Date();
        updateData.fixedByUserId = user.username;
      }
      
      // Update the vulnerability in the database
      await db.update(vulnerabilities)
        .set(updateData)
        .where(eq(vulnerabilities.id, parseInt(id, 10)));
      
      return res.status(200).json({ 
        success: true, 
        message: "Vulnerability updated successfully" 
      });
    } catch (error) {
      console.error("Error updating vulnerability:", error);
      return res.status(500).json({ 
        error: "Failed to update vulnerability",
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  }
);

/**
 * Get penetration tests
 */
router.get("/api/admin/security/pentest", 
  authenticateJWT,
  authorize(['admin']), 
  logSecurityEvent("admin_action", "View penetration tests", "medium"),
  async (req: Request, res: Response) => {
    try {
      const { 
        status, 
        startDate, 
        endDate,
        page = "1", 
        limit = "20"
      } = req.query;
      
      // Parse query parameters
      const filters = {
        status: status as string | undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10)
      };
      
      const result = await SecurityMonitoringService.getPenetrationTests(filters);
      
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error getting penetration tests:", error);
      return res.status(500).json({ 
        error: "Failed to retrieve penetration tests",
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  }
);

/**
 * Create a new penetration test
 */
router.post("/api/admin/security/pentest", 
  authenticateJWT,
  authorize(['admin']), 
  logSecurityEvent("admin_action", "Create penetration test", "medium"),
  async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        testName: z.string(),
        tester: z.string(),
        scope: z.string(),
        methodologies: z.string(),
        status: z.string().default("planned"),
        summary: z.string().optional(),
        reportUrl: z.string().optional(),
      });
      
      const validated = schema.parse(req.body);
      const user = req.user!;
      
      const testData = {
        ...validated,
        requestedBy: user.username,
      };
      
      const result = await SecurityMonitoringService.createPenetrationTest(testData);
      
      return res.status(201).json(result);
    } catch (error) {
      console.error("Error creating penetration test:", error);
      return res.status(500).json({ 
        error: "Failed to create penetration test",
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  }
);

/**
 * Get findings for a penetration test
 */
router.get("/api/admin/security/pentest/:id/findings", 
  authenticateJWT,
  authorize(['admin']), 
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { 
        severity, 
        status, 
        page = "1", 
        limit = "100"
      } = req.query;
      
      // Parse query parameters
      const filters = {
        severity: severity as string | undefined,
        status: status as string | undefined,
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10)
      };
      
      const result = await SecurityMonitoringService.getPentestFindings(parseInt(id, 10), filters);
      
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error getting pentest findings:", error);
      return res.status(500).json({ 
        error: "Failed to retrieve pentest findings",
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  }
);

/**
 * Add a finding to a penetration test
 */
router.post("/api/admin/security/pentest/:id/findings", 
  authenticateJWT,
  authorize(['admin']), 
  logSecurityEvent("admin_action", "Add pentest finding", "medium"),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const schema = z.object({
        title: z.string(),
        description: z.string(),
        severity: z.enum(["critical", "high", "medium", "low", "info"]),
        affectedComponent: z.string(),
        status: z.string().default("open"),
        technicalDetails: z.any().optional(),
        recommendedMitigation: z.string().optional(),
        proofOfConcept: z.string().optional(),
      });
      
      const validated = schema.parse(req.body);
      
      const findingData = {
        ...validated,
        pentestId: parseInt(id, 10)
      };
      
      const result = await SecurityMonitoringService.addPentestFinding(findingData);
      
      return res.status(201).json(result);
    } catch (error) {
      console.error("Error adding pentest finding:", error);
      return res.status(500).json({ 
        error: "Failed to add pentest finding",
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  }
);

/**
 * Update a penetration test finding
 */
router.patch("/api/admin/security/pentest/findings/:id", 
  authenticateJWT,
  authorize(['admin']), 
  logSecurityEvent("admin_action", "Update pentest finding", "medium"),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, fixDetails, recommendedMitigation } = req.body;
      const user = req.user!;
      
      const updateData: any = {};
      
      if (status !== undefined) {
        updateData.status = status;
      }
      
      if (fixDetails !== undefined) {
        updateData.fixDetails = fixDetails;
      }
      
      if (recommendedMitigation !== undefined) {
        updateData.recommendedMitigation = recommendedMitigation;
      }
      
      // If status is being set to fixed, add fixedDate and fixedBy
      if (status === "fixed") {
        updateData.fixedDate = new Date();
        updateData.fixedByUserId = user.username;
      }
      
      // Update the finding in the database
      await db.update(pentestFindings)
        .set(updateData)
        .where(eq(pentestFindings.id, parseInt(id, 10)));
      
      return res.status(200).json({ 
        success: true, 
        message: "Pentest finding updated successfully" 
      });
    } catch (error) {
      console.error("Error updating pentest finding:", error);
      return res.status(500).json({ 
        error: "Failed to update pentest finding",
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  }
);

/**
 * Update a vulnerability scan status
 */
router.patch("/api/admin/security/vulnerability-scans/:scanId", 
  authenticateJWT,
  authorize(['admin']), 
  logSecurityEvent("admin_action", "Update vulnerability scan", "medium"),
  async (req: Request, res: Response) => {
    try {
      const { scanId } = req.params;
      const { status, scanResults, completedDate } = req.body;
      
      const updateData: any = {};
      
      if (status !== undefined) {
        updateData.status = status;
      }
      
      if (scanResults !== undefined) {
        updateData.scanResults = scanResults;
      }
      
      if (completedDate || status === "completed") {
        updateData.completedDate = completedDate ? new Date(completedDate) : new Date();
      }
      
      // Update the scan in the database
      await db.update(vulnerabilityScanResults)
        .set(updateData)
        .where(eq(vulnerabilityScanResults.scanId, scanId));
      
      return res.status(200).json({ 
        success: true, 
        message: "Vulnerability scan updated successfully" 
      });
    } catch (error) {
      console.error("Error updating vulnerability scan:", error);
      return res.status(500).json({ 
        error: "Failed to update vulnerability scan",
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  }
);

/**
 * Update a penetration test
 */
router.patch("/api/admin/security/pentest/:id", 
  authenticateJWT,
  authorize(['admin']), 
  logSecurityEvent("admin_action", "Update penetration test", "medium"),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { 
        status, 
        reportUrl, 
        summary, 
        completedDate 
      } = req.body;
      
      const updateData: any = {};
      
      if (status !== undefined) {
        updateData.status = status;
      }
      
      if (reportUrl !== undefined) {
        updateData.reportUrl = reportUrl;
      }
      
      if (summary !== undefined) {
        updateData.summary = summary;
      }
      
      if (completedDate || status === "completed") {
        updateData.completedDate = completedDate ? new Date(completedDate) : new Date();
      }
      
      // Update the test in the database
      await db.update(penetrationTests)
        .set(updateData)
        .where(eq(penetrationTests.id, parseInt(id, 10)));
      
      return res.status(200).json({ 
        success: true, 
        message: "Penetration test updated successfully" 
      });
    } catch (error) {
      console.error("Error updating penetration test:", error);
      return res.status(500).json({ 
        error: "Failed to update penetration test",
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  }
);

export default router;