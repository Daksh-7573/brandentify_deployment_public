/**
 * Activity Logger for Security Monitoring
 * 
 * This module provides functionality to log and monitor user activities
 * for security and compliance purposes.
 */

import fs from 'fs';
import path from 'path';
import { Request, Response, NextFunction } from 'express';

// Configuration
const LOG_DIRECTORY = path.join(process.cwd(), 'logs');
const ACTIVITY_LOG_FILE = path.join(LOG_DIRECTORY, 'security-activity.log');
const SUSPICIOUS_LOG_FILE = path.join(LOG_DIRECTORY, 'suspicious-activity.log');
const ADMIN_ACTIONS_LOG_FILE = path.join(LOG_DIRECTORY, 'admin-actions.log');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIRECTORY)) {
  fs.mkdirSync(LOG_DIRECTORY, { recursive: true });
  console.log(`Created log directory: ${LOG_DIRECTORY}`);
}

// Activity types for logging
export enum ActivityType {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  PROFILE_UPDATE = 'PROFILE_UPDATE',
  CONTENT_CREATION = 'CONTENT_CREATION',
  CONTENT_MODIFICATION = 'CONTENT_MODIFICATION',
  CONTENT_DELETION = 'CONTENT_DELETION',
  ADMIN_ACTION = 'ADMIN_ACTION',
  FAILED_LOGIN = 'FAILED_LOGIN',
  API_USAGE = 'API_USAGE',
  FILE_UPLOAD = 'FILE_UPLOAD',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  EMAIL_CHANGE = 'EMAIL_CHANGE',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
}

// Severity levels for activities
export enum SeverityLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ALERT = 'ALERT',
  CRITICAL = 'CRITICAL',
}

// Interface for activity log entries
export interface ActivityLogEntry {
  timestamp: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  activityType: ActivityType;
  details: string;
  severityLevel: SeverityLevel;
  resourceId?: string;
  resourceType?: string;
}

/**
 * Log user activity
 * @param entry Activity log entry
 */
export function logActivity(entry: ActivityLogEntry): void {
  const logEntry = JSON.stringify({
    ...entry,
    timestamp: entry.timestamp || new Date().toISOString(),
  });

  // Log all activities to main log file
  fs.appendFileSync(ACTIVITY_LOG_FILE, `${logEntry}\n`);

  // Log suspicious activities separately
  if (entry.severityLevel === SeverityLevel.WARNING || 
      entry.severityLevel === SeverityLevel.ALERT || 
      entry.severityLevel === SeverityLevel.CRITICAL ||
      entry.activityType === ActivityType.SUSPICIOUS_ACTIVITY) {
    fs.appendFileSync(SUSPICIOUS_LOG_FILE, `${logEntry}\n`);
  }

  // Log admin actions separately
  if (entry.activityType === ActivityType.ADMIN_ACTION) {
    fs.appendFileSync(ADMIN_ACTIONS_LOG_FILE, `${logEntry}\n`);
  }
}

/**
 * Get client IP address from request
 * @param req Express request
 * @returns IP address string
 */
export function getClientIp(req: Request): string {
  return req.ip || 
    (req.headers['x-forwarded-for'] as string) || 
    req.socket.remoteAddress || 
    'unknown';
}

/**
 * Get user agent from request
 * @param req Express request
 * @returns User agent string
 */
export function getUserAgent(req: Request): string {
  return req.headers['user-agent'] || 'unknown';
}

/**
 * Get user ID from request (compatible with both cookie-based and JWT auth)
 * @param req Express request
 * @returns User ID string or 'anonymous'
 */
export function getUserId(req: Request): string {
  // Try to get user ID from various sources
  if (req.user && typeof req.user === 'object' && 'id' in req.user) {
    return (req.user as any).id;
  }
  
  if (req.user && typeof req.user === 'string') {
    return req.user;
  }
  
  if (req.body && req.body.userId) {
    return req.body.userId;
  }
  
  if (req.query && req.query.userId) {
    return req.query.userId as string;
  }

  if (req.params && req.params.userId) {
    return req.params.userId;
  }
  
  return 'anonymous';
}

/**
 * Express middleware for logging API usage
 */
export function apiActivityLogger(req: Request, res: Response, next: NextFunction): void {
  // Save original end method
  const originalEnd = res.end;
  
  // Override end method to log activity after response
  res.end = function(chunk?: any, encoding?: BufferEncoding | (() => void), callback?: () => void): Response {
    // Get basic info
    const userId = getUserId(req);
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);
    
    // Determine severity based on response status
    let severity = SeverityLevel.INFO;
    if (res.statusCode >= 400 && res.statusCode < 500) {
      severity = SeverityLevel.WARNING;
    } else if (res.statusCode >= 500) {
      severity = SeverityLevel.ALERT;
    }
    
    // Skip logging for static content and health checks
    const skipPaths = ['/public', '/static', '/assets', '/health', '/favicon.ico'];
    const shouldSkip = skipPaths.some(path => req.path.startsWith(path));
    
    if (!shouldSkip) {
      // Log the activity
      logActivity({
        timestamp: new Date().toISOString(),
        userId,
        ipAddress,
        userAgent,
        activityType: ActivityType.API_USAGE,
        details: `${req.method} ${req.path} - Status: ${res.statusCode}`,
        severityLevel: severity,
        resourceId: req.path,
        resourceType: 'API',
      });
    }
    
    // Call the original end method
    return originalEnd.call(this, chunk, encoding as BufferEncoding, callback);
  };
  
  next();
}

/**
 * Log authentication activities (login/logout)
 */
export function logAuthActivity(
  req: Request, 
  userId: string, 
  activityType: ActivityType.LOGIN | ActivityType.LOGOUT | ActivityType.FAILED_LOGIN,
  details: string = ''
): void {
  logActivity({
    timestamp: new Date().toISOString(),
    userId,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
    activityType,
    details,
    severityLevel: activityType === ActivityType.FAILED_LOGIN ? SeverityLevel.WARNING : SeverityLevel.INFO,
  });
}

/**
 * Log admin actions
 */
export function logAdminAction(
  req: Request,
  userId: string,
  details: string,
  resourceType?: string,
  resourceId?: string,
  severityLevel: SeverityLevel = SeverityLevel.INFO
): void {
  logActivity({
    timestamp: new Date().toISOString(),
    userId,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
    activityType: ActivityType.ADMIN_ACTION,
    details,
    severityLevel,
    resourceType,
    resourceId,
  });
}

/**
 * Log suspicious activity
 */
export function logSuspiciousActivity(
  req: Request,
  details: string,
  severityLevel: SeverityLevel = SeverityLevel.WARNING
): void {
  const userId = getUserId(req);
  
  logActivity({
    timestamp: new Date().toISOString(),
    userId,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
    activityType: ActivityType.SUSPICIOUS_ACTIVITY,
    details,
    severityLevel,
  });
}

/**
 * Get recent activities for a specific user
 * @param userId User ID
 * @param limit Maximum number of entries to return
 * @returns Array of activity log entries
 */
export function getUserActivities(userId: string, limit: number = 100): ActivityLogEntry[] {
  try {
    if (!fs.existsSync(ACTIVITY_LOG_FILE)) {
      return [];
    }
    
    const content = fs.readFileSync(ACTIVITY_LOG_FILE, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    
    return lines
      .map(line => JSON.parse(line) as ActivityLogEntry)
      .filter(entry => entry.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Error reading user activities:', error);
    return [];
  }
}

/**
 * Get all suspicious activities
 * @param limit Maximum number of entries to return
 * @returns Array of suspicious activity log entries
 */
export function getSuspiciousActivities(limit: number = 100): ActivityLogEntry[] {
  try {
    if (!fs.existsSync(SUSPICIOUS_LOG_FILE)) {
      return [];
    }
    
    const content = fs.readFileSync(SUSPICIOUS_LOG_FILE, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    
    return lines
      .map(line => JSON.parse(line) as ActivityLogEntry)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Error reading suspicious activities:', error);
    return [];
  }
}

/**
 * Get all admin actions
 * @param limit Maximum number of entries to return
 * @returns Array of admin action log entries
 */
export function getAdminActions(limit: number = 100): ActivityLogEntry[] {
  try {
    if (!fs.existsSync(ADMIN_ACTIONS_LOG_FILE)) {
      return [];
    }
    
    const content = fs.readFileSync(ADMIN_ACTIONS_LOG_FILE, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    
    return lines
      .map(line => JSON.parse(line) as ActivityLogEntry)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Error reading admin actions:', error);
    return [];
  }
}

// Initialize logs with headers if they don't exist
if (!fs.existsSync(ACTIVITY_LOG_FILE)) {
  fs.writeFileSync(ACTIVITY_LOG_FILE, '# Activity Log - All user activities\n');
}

if (!fs.existsSync(SUSPICIOUS_LOG_FILE)) {
  fs.writeFileSync(SUSPICIOUS_LOG_FILE, '# Suspicious Activity Log - Potential security threats\n');
}

if (!fs.existsSync(ADMIN_ACTIONS_LOG_FILE)) {
  fs.writeFileSync(ADMIN_ACTIONS_LOG_FILE, '# Admin Actions Log - Administrative operations\n');
}

console.log('Activity Logger initialized');