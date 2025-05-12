/**
 * Security Dashboard API Routes
 * 
 * This module provides API routes for the security dashboard
 * to view security events, suspicious activities, and system health.
 */

import express from 'express';
import { securityEvents, logSecurityEvent } from './security-monitor';
import { UserRole, authorize } from './security';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const LOG_FILE_PATH = path.join(process.cwd(), 'logs', 'security-events.log');

// Get security events (admin only)
router.get('/events', (req, res) => {
  try {
    // In a production environment, this would be protected with role-based access control:
    // authorize([UserRole.ADMIN])
    
    // Get the latest security events
    const events = {
      failedLogins: Array.from(securityEvents.failedLogins.entries()).map(([key, data]) => ({
        user: key.split(':')[0],
        ipAddress: key.split(':')[1],
        count: data.count,
        lastAttempt: data.timestamps.length > 0 ? new Date(Math.max(...data.timestamps)) : null
      })),
      suspiciousIPs: Array.from(securityEvents.suspiciousIPs),
      sensitiveEndpoints: Array.from(securityEvents.knownVulnerableEndpoints),
    };
    
    res.json({ 
      events,
      timestamp: new Date(),
      status: 'Security monitoring active'
    });
  } catch (error) {
    console.error('Error fetching security events:', error);
    res.status(500).json({ message: 'Error fetching security events' });
  }
});

// Get security logs (admin only)
router.get('/logs', (req, res) => {
  try {
    // In a production environment, this would be protected with role-based access control:
    // authorize([UserRole.ADMIN])
    
    if (!fs.existsSync(LOG_FILE_PATH)) {
      return res.json({ logs: [], message: 'No security logs yet' });
    }
    
    const logContent = fs.readFileSync(LOG_FILE_PATH, 'utf8');
    const logs = logContent.split('\n')
      .filter(line => line.trim() !== '')
      .map(line => {
        try {
          return JSON.parse(line);
        } catch (e) {
          return { error: 'Malformed log entry', raw: line };
        }
      });
    
    res.json({ 
      logs,
      count: logs.length,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error fetching security logs:', error);
    res.status(500).json({ message: 'Error fetching security logs' });
  }
});

// Create a test security event (for development/testing only)
router.post('/test-event', (req, res) => {
  try {
    // This endpoint should be disabled in production
    if (process.env.NODE_ENV === 'production') {
      return res.status(404).json({ message: 'Endpoint not found' });
    }
    
    const { event, details } = req.body;
    
    if (!event || !details) {
      return res.status(400).json({ message: 'Event and details are required' });
    }
    
    logSecurityEvent(event, details);
    
    res.json({ 
      message: 'Test security event logged',
      event,
      details
    });
  } catch (error) {
    console.error('Error creating test security event:', error);
    res.status(500).json({ message: 'Error creating test security event' });
  }
});

// Get security dashboard statistics
router.get('/stats', (req, res) => {
  try {
    // In a production environment, this would be protected with role-based access control:
    // authorize([UserRole.ADMIN])
    
    // Calculate statistics
    const failedLoginCount = Array.from(securityEvents.failedLogins.values())
      .reduce((sum, data) => sum + data.count, 0);
    
    const suspiciousIPCount = securityEvents.suspiciousIPs.size;
    
    const apiRequestCount = Array.from(securityEvents.apiRequests.values())
      .reduce((sum, data) => {
        return sum + Array.from(data.endpoints.values())
          .reduce((endpointSum, timestamps) => endpointSum + timestamps.length, 0);
      }, 0);
    
    // Read log file to count events by type
    let eventsByType = {};
    if (fs.existsSync(LOG_FILE_PATH)) {
      const logContent = fs.readFileSync(LOG_FILE_PATH, 'utf8');
      logContent.split('\n')
        .filter(line => line.trim() !== '')
        .forEach(line => {
          try {
            const logEntry = JSON.parse(line);
            if (logEntry.event) {
              eventsByType[logEntry.event] = (eventsByType[logEntry.event] || 0) + 1;
            }
          } catch (e) {
            // Skip malformed log entries
          }
        });
    }
    
    res.json({
      stats: {
        failedLoginAttempts: failedLoginCount,
        suspiciousIPs: suspiciousIPCount,
        apiRequests: apiRequestCount,
        eventsByType
      },
      timestamp: new Date(),
      monitoringStatus: 'active'
    });
  } catch (error) {
    console.error('Error fetching security statistics:', error);
    res.status(500).json({ message: 'Error fetching security statistics' });
  }
});

export default router;