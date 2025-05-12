/**
 * Security Monitoring System
 * 
 * This module integrates the various security monitoring components
 * and provides a central point for configuring and initializing them.
 */

import { Express, Request, Response, NextFunction } from 'express';
import { apiActivityLogger, logSuspiciousActivity, SeverityLevel } from './security-monitoring/activity-logger';
import { errorMonitorMiddleware, detectAttackPatterns } from './security-monitoring/error-monitor';
import dashboardApi from './security-monitoring/dashboard-api';
import { runAllScans } from './security-monitoring/vulnerability-scanner';
import fs from 'fs';
import path from 'path';

// Configuration
const LOG_DIRECTORY = path.join(process.cwd(), 'logs');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIRECTORY)) {
  fs.mkdirSync(LOG_DIRECTORY, { recursive: true });
  console.log(`Created log directory: ${LOG_DIRECTORY}`);
}

/**
 * Security monitoring middleware for real-time threat detection
 */
export const securityMonitorMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Check for attack patterns
  const isAttackAttempt = detectAttackPatterns(req);
  
  if (isAttackAttempt) {
    // Log suspicious activity
    logSuspiciousActivity(
      req,
      `Potential attack pattern detected in request to ${req.path}`,
      SeverityLevel.WARNING
    );
    
    // We don't block the request in non-breaking mode, just log it
    console.warn(`[SECURITY] Potential attack pattern detected: ${req.method} ${req.path}`);
  }
  
  next();
};

/**
 * Enhanced API endpoint protection middleware
 */
export const enhancedApiProtection = (req: Request, res: Response, next: NextFunction) => {
  // Check for suspicious headers
  const suspiciousHeaders = [
    'x-forwarded-host',
    'x-host',
    'x-original-url',
    'x-rewrite-url',
    'x-http-host-override',
    'x-raw-url'
  ];
  
  for (const header of suspiciousHeaders) {
    if (req.headers[header]) {
      // Log suspicious activity
      logSuspiciousActivity(
        req,
        `Suspicious header detected: ${header}`,
        SeverityLevel.WARNING
      );
      
      console.warn(`[SECURITY] Suspicious header detected: ${header}`);
      // Remove the suspicious header in non-breaking mode
      delete req.headers[header];
    }
  }
  
  next();
};

/**
 * Initialize the security monitoring system
 * @param app Express application
 */
export function initializeSecurityMonitoring(app: Express): void {
  console.log('Initializing Security Monitoring System...');
  
  // Use the activity logger middleware for all routes
  app.use(apiActivityLogger);
  
  // Register security dashboard API routes
  app.use('/api/admin/security', dashboardApi);
  
  // Add error monitoring middleware (should be after all routes)
  app.use(errorMonitorMiddleware);
  
  // Add basic rate limiting for security-sensitive routes
  addBasicRateLimiting(app);
  
  // Add a simple security test endpoint
  app.get('/api/admin/security-test', (req: Request, res: Response) => {
    res.json({
      status: 'active',
      monitoring: true,
      timestamp: new Date().toISOString(),
      message: 'Security monitoring system is active'
    });
  });
  
  // Schedule initial security scan
  setTimeout(() => {
    console.log('Running initial security scan...');
    runAllScans().catch(err => {
      console.error('Error in initial security scan:', err);
    });
  }, 20000); // Wait 20 seconds after startup
  
  console.log('Security Monitoring System initialized');
}

/**
 * Add basic rate limiting for security-sensitive routes
 * @param app Express application
 */
function addBasicRateLimiting(app: Express): void {
  const requestCounts: Record<string, { count: number, timestamp: number }> = {};
  const WINDOW_MS = 60 * 1000; // 1 minute
  const MAX_REQUESTS = 1000; // Max requests per IP per minute (increased from 100)
  const MAX_AUTH_ATTEMPTS = 20; // Max login attempts per IP per minute (increased from 5)
  
  app.use((req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    
    // Clean up old entries
    if (now % 10 === 0) { // Only do cleanup occasionally to reduce overhead
      for (const key in requestCounts) {
        if (now - requestCounts[key].timestamp > WINDOW_MS) {
          delete requestCounts[key];
        }
      }
    }
    
    // Initialize or update request count for this IP
    if (!requestCounts[ip]) {
      requestCounts[ip] = { count: 1, timestamp: now };
    } else {
      // Reset if outside window
      if (now - requestCounts[ip].timestamp > WINDOW_MS) {
        requestCounts[ip] = { count: 1, timestamp: now };
      } else {
        requestCounts[ip].count++;
      }
    }
    
    // Check rate limits
    if (
      // General rate limit for all routes
      requestCounts[ip].count > MAX_REQUESTS ||
      // Stricter rate limit for auth routes
      (
        (req.path.includes('/auth') || req.path.includes('/login')) && 
        requestCounts[ip].count > MAX_AUTH_ATTEMPTS
      )
    ) {
      // Log rate limit exception
      console.warn(`Rate limit exceeded for IP: ${ip}, path: ${req.path}`);
      
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.'
      });
    }
    
    next();
  });
}

export default { initializeSecurityMonitoring };