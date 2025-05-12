/**
 * Security Monitoring System
 * 
 * This module provides real-time monitoring and detection of suspicious activities.
 * It tracks potential security threats including:
 * - Brute force login attempts
 * - Request rate anomalies
 * - Suspicious API usage patterns
 * - Authentication failures
 * - Access attempts to restricted resources
 */

import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

// Configuration
const MAX_FAILED_LOGINS = 5; // Maximum failed login attempts before flagging
const MONITORING_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOG_FILE_PATH = path.join(process.cwd(), 'logs', 'security-events.log');
const REQUEST_RATE_THRESHOLD = 50; // Requests per minute threshold for suspicious activity

// Initialize log directory if it doesn't exist
if (!fs.existsSync(path.join(process.cwd(), 'logs'))) {
  fs.mkdirSync(path.join(process.cwd(), 'logs'), { recursive: true });
}

// Store security events in memory
const securityEvents = {
  failedLogins: new Map<string, { count: number, timestamps: number[] }>(),
  accessAttempts: new Map<string, { count: number, timestamps: number[] }>(),
  apiRequests: new Map<string, { endpoints: Map<string, number[]>, ipAddress: string }>(),
  suspiciousIPs: new Set<string>(),
  knownVulnerableEndpoints: new Set([
    '/api/users',
    '/api/admin',
    '/api/auth/login',
    '/api/auth/register',
    '/api/messaging',
    '/api/notifications',
    '/api/career-capsule',
    '/api/project-update',
  ])
};

/**
 * Log a security event to file
 */
export function logSecurityEvent(event: string, details: any): void {
  const timestamp = new Date().toISOString();
  const logEntry = JSON.stringify({
    timestamp,
    event,
    details
  });
  
  fs.appendFile(LOG_FILE_PATH, logEntry + '\n', (err) => {
    if (err) {
      console.error('Failed to write security log:', err);
    }
  });
  
  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[SECURITY] ${event}:`, details);
  }
}

/**
 * Track failed login attempts
 */
export function trackFailedLogin(username: string, ipAddress: string): void {
  const key = `${username}:${ipAddress}`;
  const now = Date.now();
  
  if (!securityEvents.failedLogins.has(key)) {
    securityEvents.failedLogins.set(key, { count: 0, timestamps: [] });
  }
  
  const failedLogin = securityEvents.failedLogins.get(key)!;
  
  // Remove timestamps older than the monitoring window
  failedLogin.timestamps = failedLogin.timestamps.filter(
    timestamp => now - timestamp < MONITORING_WINDOW_MS
  );
  
  // Add the new timestamp
  failedLogin.timestamps.push(now);
  failedLogin.count = failedLogin.timestamps.length;
  
  // Check if this exceeds the threshold
  if (failedLogin.count >= MAX_FAILED_LOGINS) {
    securityEvents.suspiciousIPs.add(ipAddress);
    
    logSecurityEvent('BRUTE_FORCE_ATTEMPT', {
      username,
      ipAddress,
      attemptCount: failedLogin.count,
      timeWindow: `${MONITORING_WINDOW_MS / 60000} minutes`
    });
  }
}

/**
 * Track API usage patterns
 */
export function trackAPIRequest(userId: string, endpoint: string, ipAddress: string): void {
  const now = Date.now();
  
  if (!securityEvents.apiRequests.has(userId)) {
    securityEvents.apiRequests.set(userId, { 
      endpoints: new Map<string, number[]>(),
      ipAddress
    });
  }
  
  const userRequests = securityEvents.apiRequests.get(userId)!;
  
  if (!userRequests.endpoints.has(endpoint)) {
    userRequests.endpoints.set(endpoint, []);
  }
  
  const endpointTimestamps = userRequests.endpoints.get(endpoint)!;
  
  // Remove timestamps older than the monitoring window
  const filteredTimestamps = endpointTimestamps.filter(
    timestamp => now - timestamp < MONITORING_WINDOW_MS
  );
  
  // Add the new timestamp
  filteredTimestamps.push(now);
  userRequests.endpoints.set(endpoint, filteredTimestamps);
  
  // Check for unusual request rate
  const requestsInLastMinute = filteredTimestamps.filter(
    timestamp => now - timestamp < 60000
  ).length;
  
  if (requestsInLastMinute > REQUEST_RATE_THRESHOLD) {
    securityEvents.suspiciousIPs.add(ipAddress);
    
    logSecurityEvent('HIGH_REQUEST_RATE', {
      userId,
      ipAddress,
      endpoint,
      requestRate: `${requestsInLastMinute} requests/minute`,
      threshold: REQUEST_RATE_THRESHOLD
    });
  }
}

/**
 * Track unauthorized access attempts
 */
export function trackUnauthorizedAccess(userId: string | null, endpoint: string, ipAddress: string): void {
  const key = `${userId || 'anonymous'}:${ipAddress}`;
  const now = Date.now();
  
  if (!securityEvents.accessAttempts.has(key)) {
    securityEvents.accessAttempts.set(key, { count: 0, timestamps: [] });
  }
  
  const accessAttempt = securityEvents.accessAttempts.get(key)!;
  
  // Remove timestamps older than the monitoring window
  accessAttempt.timestamps = accessAttempt.timestamps.filter(
    timestamp => now - timestamp < MONITORING_WINDOW_MS
  );
  
  // Add the new timestamp
  accessAttempt.timestamps.push(now);
  accessAttempt.count = accessAttempt.timestamps.length;
  
  // Log the event if this is a sensitive endpoint
  if (securityEvents.knownVulnerableEndpoints.has(endpoint) || endpoint.includes('admin')) {
    logSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', {
      userId: userId || 'anonymous',
      ipAddress,
      endpoint,
      attemptCount: accessAttempt.count
    });
    
    // Flag IP as suspicious after multiple attempts
    if (accessAttempt.count >= 3) {
      securityEvents.suspiciousIPs.add(ipAddress);
    }
  }
}

/**
 * Check if an IP is considered suspicious
 */
export function isSuspiciousIP(ipAddress: string): boolean {
  return securityEvents.suspiciousIPs.has(ipAddress);
}

/**
 * Middleware to monitor suspicious activity
 */
export function securityMonitorMiddleware(req: Request, res: Response, next: NextFunction): void {
  const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
  const userId = (req as any).user?.id || null;
  const endpoint = req.originalUrl;
  
  // Check for known suspicious IPs
  if (isSuspiciousIP(ipAddress)) {
    logSecurityEvent('REQUEST_FROM_SUSPICIOUS_IP', {
      ipAddress,
      endpoint,
      method: req.method
    });
    
    // In non-breaking mode, allow the request but log it
    // In production, you might want to block or challenge these requests
  }
  
  // Track API request pattern
  if (userId) {
    trackAPIRequest(userId, endpoint, ipAddress);
  }
  
  // Check for potentially sensitive operations
  if (req.method !== 'GET' && securityEvents.knownVulnerableEndpoints.has(endpoint)) {
    logSecurityEvent('SENSITIVE_OPERATION', {
      userId: userId || 'anonymous',
      ipAddress,
      endpoint,
      method: req.method
    });
  }
  
  // Continue processing the request
  next();
}

/**
 * Enhanced API endpoint protection middleware
 */
export function enhancedApiProtection(req: Request, res: Response, next: NextFunction): void {
  const endpoint = req.originalUrl;
  const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
  const userId = (req as any).user?.id || null;
  
  // Check if this is a sensitive endpoint
  const isSensitiveEndpoint = securityEvents.knownVulnerableEndpoints.has(endpoint) || 
    endpoint.includes('admin') || 
    endpoint.includes('delete') || 
    endpoint.includes('update');
  
  if (isSensitiveEndpoint) {
    // Check for authentication if this is a sensitive endpoint
    if (!userId && req.method !== 'GET') {
      trackUnauthorizedAccess(userId, endpoint, ipAddress);
      
      // In non-breaking mode, allow the request but log it
      logSecurityEvent('UNAUTHENTICATED_SENSITIVE_REQUEST', {
        ipAddress,
        endpoint,
        method: req.method
      });
      
      // In production, you might want to return a 401 here
      // return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Check for known suspicious IPs trying to access sensitive endpoints
    if (isSuspiciousIP(ipAddress)) {
      logSecurityEvent('SUSPICIOUS_IP_SENSITIVE_ACCESS', {
        ipAddress,
        endpoint,
        method: req.method,
        userId: userId || 'anonymous'
      });
      
      // In non-breaking mode, allow the request but log it
      // In production, you might want to block these requests
      // return res.status(403).json({ message: 'Access denied' });
    }
  }
  
  // Continue processing the request
  next();
}

/**
 * Clean up old security events periodically
 */
function cleanupSecurityEvents(): void {
  const now = Date.now();
  
  // Clean up failed logins
  for (const [key, data] of securityEvents.failedLogins.entries()) {
    data.timestamps = data.timestamps.filter(
      timestamp => now - timestamp < MONITORING_WINDOW_MS
    );
    
    if (data.timestamps.length === 0) {
      securityEvents.failedLogins.delete(key);
    } else {
      data.count = data.timestamps.length;
    }
  }
  
  // Clean up access attempts
  for (const [key, data] of securityEvents.accessAttempts.entries()) {
    data.timestamps = data.timestamps.filter(
      timestamp => now - timestamp < MONITORING_WINDOW_MS
    );
    
    if (data.timestamps.length === 0) {
      securityEvents.accessAttempts.delete(key);
    } else {
      data.count = data.timestamps.length;
    }
  }
  
  // Clean up API requests
  for (const [userId, userData] of securityEvents.apiRequests.entries()) {
    let hasEndpoints = false;
    
    for (const [endpoint, timestamps] of userData.endpoints.entries()) {
      const filteredTimestamps = timestamps.filter(
        timestamp => now - timestamp < MONITORING_WINDOW_MS
      );
      
      if (filteredTimestamps.length === 0) {
        userData.endpoints.delete(endpoint);
      } else {
        userData.endpoints.set(endpoint, filteredTimestamps);
        hasEndpoints = true;
      }
    }
    
    if (!hasEndpoints) {
      securityEvents.apiRequests.delete(userId);
    }
  }
}

// Set up periodic cleanup
setInterval(cleanupSecurityEvents, MONITORING_WINDOW_MS / 2);

// Export the security events for monitoring
export { securityEvents };