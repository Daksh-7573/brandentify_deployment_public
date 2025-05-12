/**
 * Error Monitoring System
 * 
 * This module provides functionality to monitor and track errors
 * for security and reliability purposes.
 */

import fs from 'fs';
import path from 'path';
import { Request, Response, NextFunction } from 'express';

// Configuration
const LOG_DIRECTORY = path.join(process.cwd(), 'logs');
const ERROR_LOG_FILE = path.join(LOG_DIRECTORY, 'error.log');
const ATTACK_PATTERNS_FILE = path.join(LOG_DIRECTORY, 'attack-patterns.log');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIRECTORY)) {
  fs.mkdirSync(LOG_DIRECTORY, { recursive: true });
  console.log(`Created log directory: ${LOG_DIRECTORY}`);
}

// Initialize log files if they don't exist
if (!fs.existsSync(ERROR_LOG_FILE)) {
  fs.writeFileSync(ERROR_LOG_FILE, '# Error Log - Application errors\n');
}

if (!fs.existsSync(ATTACK_PATTERNS_FILE)) {
  fs.writeFileSync(ATTACK_PATTERNS_FILE, '# Attack Patterns Log - Detected attack patterns\n');
}

// Error types for categorization
export enum ErrorType {
  SERVER_ERROR = 'SERVER_ERROR',
  CLIENT_ERROR = 'CLIENT_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  API_ERROR = 'API_ERROR',
  SYSTEM_ERROR = 'SYSTEM_ERROR',
}

// Interface for error log entries
export interface ErrorLogEntry {
  timestamp: string;
  errorType: ErrorType;
  message: string;
  stack?: string;
  userId?: string;
  ipAddress?: string;
  path?: string;
  method?: string;
  requestParams?: any;
  requestQuery?: any;
  requestBody?: any;
  isAttackAttempt: boolean;
}

/**
 * Log an error
 * @param entry Error log entry
 */
export function logError(entry: ErrorLogEntry): void {
  const logEntry = JSON.stringify({
    ...entry,
    timestamp: entry.timestamp || new Date().toISOString(),
  });

  // Log to the appropriate file
  fs.appendFileSync(ERROR_LOG_FILE, `${logEntry}\n`);

  // If it's an attack attempt, log to attack patterns file
  if (entry.isAttackAttempt) {
    fs.appendFileSync(ATTACK_PATTERNS_FILE, `${logEntry}\n`);
  }

  // For server-side logging
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[${entry.errorType}] ${entry.message}`);
    if (entry.stack) {
      console.error(entry.stack);
    }
  }
}

/**
 * Common attack patterns to detect in requests
 */
const ATTACK_PATTERNS = [
  // SQL Injection patterns
  /'.*;--/i,
  /union\s+select/i,
  /exec\s+sp_/i,
  /insert\s+into/i,
  /select\s+.*\s+from/i,
  /delete\s+from/i,
  /drop\s+table/i,
  /update\s+.*\s+set/i,
  
  // XSS patterns
  /<script[^>]*>.*?<\/script>/i,
  /javascript:[^"]*/i,
  /on\w+\s*=\s*["']?[^"']*/i,
  /&#x\d+;/i,
  
  // Command injection
  /;\s*rm\s+-rf/i,
  /;\s*wget/i,
  /;\s*curl/i,
  /\|\s*cat\s+/i,
  
  // Path traversal
  /\.\.\/\.\.\/\.\.\//i,
  
  // Misc security patterns
  /\/etc\/passwd/i,
  /\/bin\/sh/i,
  /\/etc\/shadow/i,
];

/**
 * Check if a request contains potential attack patterns
 * @param req Express request
 * @returns Boolean indicating if attack patterns were detected
 */
export function detectAttackPatterns(req: Request): boolean {
  // Combine all request parameters into a string for matching
  const requestData = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params,
    path: req.path,
    url: req.url,
  });
  
  // Check against attack patterns
  return ATTACK_PATTERNS.some(pattern => pattern.test(requestData));
}

/**
 * Express middleware for error monitoring
 */
export function errorMonitorMiddleware(err: any, req: Request, res: Response, next: NextFunction): void {
  // Determine error type
  let errorType = ErrorType.SERVER_ERROR;
  
  if (err.name === 'ValidationError') {
    errorType = ErrorType.VALIDATION_ERROR;
  } else if (err.name === 'UnauthorizedError') {
    errorType = ErrorType.AUTHENTICATION_ERROR;
  } else if (err.name === 'ForbiddenError') {
    errorType = ErrorType.AUTHORIZATION_ERROR;
  } else if (err.name === 'RateLimitError') {
    errorType = ErrorType.RATE_LIMIT_ERROR;
  } else if (err.name === 'DatabaseError') {
    errorType = ErrorType.DATABASE_ERROR;
  }
  
  // Check for attack patterns
  const isAttackAttempt = detectAttackPatterns(req);
  
  // Log the error
  logError({
    timestamp: new Date().toISOString(),
    errorType,
    message: err.message || 'Unknown error',
    stack: err.stack,
    userId: req.user ? (typeof req.user === 'string' ? req.user : (req.user as any).id) : undefined,
    ipAddress: req.ip || req.socket.remoteAddress,
    path: req.path,
    method: req.method,
    requestParams: req.params,
    requestQuery: req.query,
    // Don't log full request body to avoid logging sensitive data
    requestBody: err.name === 'ValidationError' ? req.body : undefined,
    isAttackAttempt,
  });
  
  // Pass the error to the next middleware
  next(err);
}

/**
 * Get recent errors
 * @param limit Maximum number of entries to return
 * @returns Array of error log entries
 */
export function getRecentErrors(limit: number = 100): ErrorLogEntry[] {
  try {
    if (!fs.existsSync(ERROR_LOG_FILE)) {
      return [];
    }
    
    const content = fs.readFileSync(ERROR_LOG_FILE, 'utf8');
    const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    
    return lines
      .map(line => JSON.parse(line) as ErrorLogEntry)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Error reading recent errors:', error);
    return [];
  }
}

/**
 * Get recent attack attempts
 * @param limit Maximum number of entries to return
 * @returns Array of error log entries that are attack attempts
 */
export function getRecentAttackAttempts(limit: number = 100): ErrorLogEntry[] {
  try {
    if (!fs.existsSync(ATTACK_PATTERNS_FILE)) {
      return [];
    }
    
    const content = fs.readFileSync(ATTACK_PATTERNS_FILE, 'utf8');
    const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    
    return lines
      .map(line => JSON.parse(line) as ErrorLogEntry)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Error reading recent attack attempts:', error);
    return [];
  }
}

console.log('Error Monitor initialized');