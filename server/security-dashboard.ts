/**
 * Security Dashboard API Module
 * 
 * This module provides APIs for security monitoring, dashboards, and administrative security controls.
 * It exposes security event data and monitoring information for administrative interfaces.
 */

import { Router, Request, Response } from 'express';
import { getSecurityDashboardData, getRecentSecurityEvents, checkVulnerableDependencies, getPenetrationTestingStatus } from './security-monitoring';

const router = Router();

// Middleware to verify admin access
function requireAdmin(req: Request, res: Response, next: Function) {
  // This is a simplified check - in a real application, this would be more robust
  // and would check against roles stored in a database
  if (!(req as any).user || (req as any).user.role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'You do not have permission to access this resource'
    });
  }
  next();
}

// Get security dashboard data (requires admin)
router.get('/dashboard', requireAdmin, async (req: Request, res: Response) => {
  try {
    const dashboardData = await getSecurityDashboardData();
    res.json(dashboardData);
  } catch (error) {
    console.error('Error getting security dashboard data:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve security dashboard data'
    });
  }
});

// Get recent security events (requires admin)
router.get('/events', requireAdmin, async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
    const events = await getRecentSecurityEvents(limit);
    res.json({ events });
  } catch (error) {
    console.error('Error getting security events:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve security events'
    });
  }
});

// Run vulnerability scan (requires admin)
router.post('/scan/vulnerabilities', requireAdmin, async (req: Request, res: Response) => {
  try {
    const result = await checkVulnerableDependencies();
    res.json(result);
  } catch (error) {
    console.error('Error running vulnerability scan:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to run vulnerability scan'
    });
  }
});

// Get penetration testing status (requires admin)
router.get('/penetration-testing', requireAdmin, (req: Request, res: Response) => {
  try {
    const status = getPenetrationTestingStatus();
    res.json(status);
  } catch (error) {
    console.error('Error getting penetration testing status:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve penetration testing status'
    });
  }
});

// Get block list status (requires admin)
router.get('/block-list', requireAdmin, (req: Request, res: Response) => {
  // This would be implemented to show currently blocked IPs
  const mockBlockList = [
    {
      ip: '192.168.1.1',
      reason: 'Brute force attempt',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
    }
  ];
  
  res.json({ blockedIPs: mockBlockList });
});

export default router;