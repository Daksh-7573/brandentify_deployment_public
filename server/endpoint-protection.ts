/**
 * Endpoint Protection for Security-Critical APIs
 * 
 * This module provides specialized protection for security-critical endpoints
 * with adaptive rate limiting and enhanced validation.
 */

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { SeverityLevel } from './security-monitoring/activity-logger';
import { logSuspiciousActivity } from './security-monitoring/activity-logger';

/**
 * Specific endpoint protection middleware for security-critical endpoints
 */
export const endpointProtectionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // List of security-critical endpoints that require extra protection
  const securityCriticalEndpoints = [
    { path: '/api/auth/login', method: 'POST' },
    { path: '/api/auth/register', method: 'POST' },
    { path: '/api/users/password-reset', method: 'POST' },
    { path: '/api/admin', method: 'ALL' },
    { path: '/api/musk-ai', method: 'ALL' },
  ];
  
  // Check if the current request targets a security-critical endpoint
  const isSecurityCritical = securityCriticalEndpoints.some(endpoint => {
    return req.path.startsWith(endpoint.path) && 
           (endpoint.method === 'ALL' || req.method === endpoint.method);
  });
  
  if (isSecurityCritical) {
    // Add extra scrutiny for security-critical endpoints
    
    // 1. Check for unusual request patterns
    const hasUnusualPatterns = checkForUnusualPatterns(req);
    
    if (hasUnusualPatterns) {
      // Log suspicious activity but don't block in non-breaking mode
      logSuspiciousActivity(
        req,
        `Unusual request pattern detected for security-critical endpoint: ${req.path}`,
        SeverityLevel.WARNING
      );
      
      console.warn(`[SECURITY] Unusual request pattern for ${req.method} ${req.path}`);
    }
    
    // 2. Add additional headers for security logging
    res.setHeader('X-Security-Critical', 'true');
  }
  
  // Always continue in non-breaking mode
  next();
};

/**
 * Check for unusual request patterns that may indicate security threats
 */
function checkForUnusualPatterns(req: Request): boolean {
  // Check for suspicious headers or query parameters
  const suspiciousParams = [
    'debug', 'test', 'admin', 'console', 'cmd', 'exec', 'shell', 'access'
  ];
  
  // Check query parameters
  for (const param of suspiciousParams) {
    if (req.query[param] !== undefined) {
      return true;
    }
  }
  
  // Check unusual user agent patterns
  const userAgent = req.headers['user-agent'] || '';
  if (
    userAgent.includes('sqlmap') ||
    userAgent.includes('nikto') ||
    userAgent.includes('nmap') ||
    userAgent.includes('burpsuite') ||
    userAgent.includes('OWASP') ||
    userAgent.includes('ZAP')
  ) {
    return true;
  }
  
  return false;
}

/**
 * Create specialized rate limiters for different types of endpoints
 */
export function createEndpointRateLimiters(app: any) {
  // Rate limiter for authentication endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      message: 'Too many authentication attempts. Please try again later.'
    },
    skipSuccessfulRequests: true // Only count failed authentication attempts
  });
  
  // Rate limiter for sensitive data access
  const sensitiveDataLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // Limit each IP to 100 requests per hour
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      message: 'Too many sensitive data requests. Please try again later.'
    }
  });
  
  // Rate limiter for API endpoints
  const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // Limit each IP to 60 requests per minute (1 req/sec)
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      message: 'Too many API requests. Please try again later.'
    }
  });
  
  // Apply rate limiters to specific routes
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);
  app.use('/api/users/password-reset', authLimiter);
  
  app.use('/api/users/profile', sensitiveDataLimiter);
  app.use('/api/admin', sensitiveDataLimiter);
  
  app.use('/api/musk-ai', apiLimiter);
}

export default { endpointProtectionMiddleware, createEndpointRateLimiters };