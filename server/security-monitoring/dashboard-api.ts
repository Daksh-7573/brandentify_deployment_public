/**
 * Security Dashboard API
 * 
 * This module provides API endpoints for the security dashboard,
 * allowing administrators to view security events and metrics.
 */

import { Router, Request, Response } from 'express';
import { 
  getSuspiciousActivities, 
  getUserActivities, 
  getAdminActions 
} from './activity-logger';
import { 
  getRecentErrors, 
  getRecentAttackAttempts 
} from './error-monitor';
import { 
  getVulnerabilityReports, 
  runAllScans 
} from './vulnerability-scanner';

// Create router
const router = Router();

// Middleware to check admin authorization
// This is a placeholder - in a real system, you'd use proper role-based auth
const checkAdminAuth = (req: Request, res: Response, next: Function) => {
  // In a real implementation, this would check user roles/permissions
  // For now, we just pass through in dev mode, but require auth in production
  if (process.env.NODE_ENV === 'production') {
    // Check for admin token/role
    const isAdmin = req.headers['x-admin-token'] === process.env.ADMIN_SECRET_KEY;
    if (!isAdmin) {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }
  }
  next();
};

// Apply admin check to all dashboard routes
router.use(checkAdminAuth);

// Get security overview
router.get('/overview', async (req: Request, res: Response) => {
  try {
    // Get the last 24 hours of data
    const lastDay = new Date();
    lastDay.setDate(lastDay.getDate() - 1);
    
    // Get various security metrics
    const suspiciousActivities = getSuspiciousActivities();
    const recentErrors = getRecentErrors();
    const recentAttacks = getRecentAttackAttempts();
    const vulnerabilityReports = getVulnerabilityReports(1)[0] || null;
    
    // Calculate metrics for the last 24 hours
    const last24Hours = {
      suspiciousActivities: suspiciousActivities.filter(
        a => new Date(a.timestamp) > lastDay
      ).length,
      errors: recentErrors.filter(
        e => new Date(e.timestamp) > lastDay
      ).length,
      attackAttempts: recentAttacks.filter(
        a => new Date(a.timestamp) > lastDay
      ).length,
    };
    
    // Response with the overview
    res.json({
      timestamp: new Date().toISOString(),
      last24Hours,
      totalSuspiciousActivities: suspiciousActivities.length,
      totalErrors: recentErrors.length,
      totalAttackAttempts: recentAttacks.length,
      latestVulnerabilityScan: vulnerabilityReports,
      securityStatus: determineSecurityStatus(last24Hours, vulnerabilityReports),
    });
  } catch (error) {
    console.error('Error generating security overview:', error);
    res.status(500).json({ error: 'Failed to generate security overview' });
  }
});

// Helper function to determine overall security status
function determineSecurityStatus(
  metrics: { suspiciousActivities: number; errors: number; attackAttempts: number },
  vulnerabilityReport: any
): 'good' | 'warning' | 'critical' {
  
  // Critical status if:
  // - High number of attack attempts (>10) or
  // - Critical vulnerabilities found
  if (
    metrics.attackAttempts > 10 ||
    (vulnerabilityReport && vulnerabilityReport.summary.critical > 0)
  ) {
    return 'critical';
  }
  
  // Warning status if:
  // - Moderate number of issues or
  // - High vulnerabilities found
  if (
    metrics.suspiciousActivities > 5 ||
    metrics.attackAttempts > 0 ||
    (vulnerabilityReport && vulnerabilityReport.summary.high > 0)
  ) {
    return 'warning';
  }
  
  // Otherwise, status is good
  return 'good';
}

// Get suspicious activities
router.get('/suspicious-activities', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const activities = getSuspiciousActivities(limit);
    res.json(activities);
  } catch (error) {
    console.error('Error fetching suspicious activities:', error);
    res.status(500).json({ error: 'Failed to fetch suspicious activities' });
  }
});

// Get recent errors
router.get('/errors', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const errors = getRecentErrors(limit);
    res.json(errors);
  } catch (error) {
    console.error('Error fetching recent errors:', error);
    res.status(500).json({ error: 'Failed to fetch recent errors' });
  }
});

// Get recent attack attempts
router.get('/attack-attempts', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const attackAttempts = getRecentAttackAttempts(limit);
    res.json(attackAttempts);
  } catch (error) {
    console.error('Error fetching attack attempts:', error);
    res.status(500).json({ error: 'Failed to fetch attack attempts' });
  }
});

// Get vulnerability reports
router.get('/vulnerabilities', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const reports = getVulnerabilityReports(limit);
    res.json(reports);
  } catch (error) {
    console.error('Error fetching vulnerability reports:', error);
    res.status(500).json({ error: 'Failed to fetch vulnerability reports' });
  }
});

// Get user activities
router.get('/user-activities/:userId', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;
    const activities = getUserActivities(userId, limit);
    res.json(activities);
  } catch (error) {
    console.error('Error fetching user activities:', error);
    res.status(500).json({ error: 'Failed to fetch user activities' });
  }
});

// Get admin actions
router.get('/admin-actions', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const actions = getAdminActions(limit);
    res.json(actions);
  } catch (error) {
    console.error('Error fetching admin actions:', error);
    res.status(500).json({ error: 'Failed to fetch admin actions' });
  }
});

// Trigger vulnerability scan
router.post('/trigger-scan', async (req: Request, res: Response) => {
  try {
    // Trigger scan in the background
    runAllScans().catch(err => {
      console.error('Error in triggered vulnerability scan:', err);
    });
    
    res.json({ 
      message: 'Vulnerability scan initiated',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error triggering vulnerability scan:', error);
    res.status(500).json({ error: 'Failed to trigger vulnerability scan' });
  }
});

export default router;