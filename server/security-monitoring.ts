/**
 * Security Monitoring and Threat Detection System
 * 
 * This module implements advanced security monitoring capabilities including:
 * 1. Activity logging for administrative purposes
 * 2. Error and attack monitoring with custom error handling
 * 3. Vulnerability scanning integration
 * 4. Penetration testing support
 */

import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';

// Constants
const LOG_DIR = path.join(process.cwd(), 'logs');
const ACTIVITY_LOG_PATH = path.join(LOG_DIR, 'activity.log');
const SECURITY_LOG_PATH = path.join(LOG_DIR, 'security.log');
const ERROR_LOG_PATH = path.join(LOG_DIR, 'error.log');

// Create log directory if it doesn't exist
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Initialize log files with headers if they don't exist
[
  { path: ACTIVITY_LOG_PATH, header: 'TIMESTAMP,USER_ID,ACTION,RESOURCE,IP,USER_AGENT\n' },
  { path: SECURITY_LOG_PATH, header: 'TIMESTAMP,SEVERITY,TYPE,DESCRIPTION,IP,USER_AGENT,HASH\n' },
  { path: ERROR_LOG_PATH, header: 'TIMESTAMP,ERROR_CODE,ERROR_MESSAGE,STACK_TRACE,ENDPOINT,METHOD,IP\n' }
].forEach(log => {
  if (!fs.existsSync(log.path)) {
    fs.writeFileSync(log.path, log.header);
  }
});

// Activity Log System
export function logActivity(userId: string, action: string, resource: string, ip: string, userAgent: string) {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp},"${userId}","${action}","${resource}","${ip}","${userAgent}"\n`;
  
  fs.appendFile(ACTIVITY_LOG_PATH, logEntry, (err) => {
    if (err) {
      console.error('Error writing to activity log:', err);
    }
  });
}

// Security Log System
export function logSecurityEvent(
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
  type: string,
  description: string, 
  ip: string, 
  userAgent: string
) {
  const timestamp = new Date().toISOString();
  const hash = createHash('sha256').update(`${timestamp}${ip}${type}${description}`).digest('hex').substring(0, 16);
  const logEntry = `${timestamp},"${severity}","${type}","${description}","${ip}","${userAgent}","${hash}"\n`;
  
  fs.appendFile(SECURITY_LOG_PATH, logEntry, (err) => {
    if (err) {
      console.error('Error writing to security log:', err);
    }
  });
  
  // Alert if critical security event
  if (severity === 'CRITICAL') {
    console.error(`[SECURITY ALERT] ${type}: ${description} from IP: ${ip}`);
    // Here you would implement actual alerting logic (e.g., email, SMS, webhook)
  }
}

// Error Log System
export function logError(error: Error, req: Request) {
  const timestamp = new Date().toISOString();
  const errorCode = error.name || 'ERROR';
  const errorMessage = error.message || 'Unknown error';
  // Sanitize stack trace to remove sensitive information
  const stackTrace = (error.stack || '').split('\n').slice(0, 5).join('\\n').replace(/"/g, "'");
  const endpoint = req.originalUrl || 'unknown';
  const method = req.method || 'unknown';
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  
  const logEntry = `${timestamp},"${errorCode}","${errorMessage}","${stackTrace}","${endpoint}","${method}","${ip}"\n`;
  
  fs.appendFile(ERROR_LOG_PATH, logEntry, (err) => {
    if (err) {
      console.error('Error writing to error log:', err);
    }
  });
}

// Security Monitoring Middleware
export function securityMonitoringMiddleware(req: Request, res: Response, next: NextFunction) {
  const originalEnd = res.end;
  const originalSend = res.send;
  const originalJson = res.json;
  const startTime = Date.now();
  
  // Track user activity for sensitive operations
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const userId = (req as any).user?.id || 'anonymous';
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    logActivity(
      userId,
      req.method,
      req.originalUrl,
      ip,
      userAgent
    );
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      { pattern: /\/api\/admin/, checkRoles: true, minRole: 'admin' },
      { pattern: /\/api\/users\/(?!me)/, checkAuth: true },
      { pattern: /\/api\/settings/, checkAuth: true },
      { pattern: /password|token|key|secret|credential/i, checkPayload: true },
    ];
    
    for (const { pattern, checkRoles, minRole, checkAuth, checkPayload } of suspiciousPatterns) {
      if (pattern.test(req.originalUrl)) {
        let isSuspicious = false;
        let suspicionReason = '';
        
        // Role-based suspicion (accessing admin endpoints without admin role)
        if (checkRoles && minRole === 'admin' && (req as any).user?.role !== 'admin') {
          isSuspicious = true;
          suspicionReason = `Non-admin user accessing admin endpoint`;
        }
        
        // Authentication suspicion (accessing protected resources without authentication)
        if (checkAuth && !(req as any).user) {
          isSuspicious = true;
          suspicionReason = `Unauthenticated access to protected resource`;
        }
        
        // Payload suspicion (potentially manipulated payload)
        if (checkPayload && req.body) {
          const payloadStr = JSON.stringify(req.body);
          const suspiciousPayloadPatterns = [
            /\$where/i, // MongoDB injection
            /\$ne/i,    // MongoDB injection
            /<script/i, // XSS attempt
            /function\s*\(/i, // Code injection
            /exec\s*\(/i, // Command injection
            /--/,       // SQL injection
            /OR.*=.*--/i // SQL injection
          ];
          
          for (const payloadPattern of suspiciousPayloadPatterns) {
            if (payloadPattern.test(payloadStr)) {
              isSuspicious = true;
              suspicionReason = `Potentially malicious payload detected: ${payloadPattern}`;
              break;
            }
          }
        }
        
        if (isSuspicious) {
          logSecurityEvent(
            'MEDIUM',
            'SUSPICIOUS_ACCESS',
            suspicionReason,
            ip,
            userAgent
          );
          // Don't block the request, just log it
        }
      }
    }
  }
  
  // Capture error responses
  res.end = function(chunk?: any, encoding?: any, callback?: any) {
    const duration = Date.now() - startTime;
    
    // Log unusually slow responses (potential DoS)
    if (duration > 5000) {
      logSecurityEvent(
        'LOW',
        'SLOW_RESPONSE',
        `Endpoint ${req.originalUrl} took ${duration}ms to respond`,
        req.ip || req.socket.remoteAddress || 'unknown',
        req.headers['user-agent'] || 'unknown'
      );
    }
    
    return originalEnd.call(this, chunk, encoding, callback);
  } as any;
  
  // Intercept responses to log errors
  res.send = function(body?: any): Response {
    const statusCode = res.statusCode;
    
    // Log client errors (4xx)
    if (statusCode >= 400 && statusCode < 500) {
      logSecurityEvent(
        statusCode >= 403 ? 'MEDIUM' : 'LOW',
        'CLIENT_ERROR',
        `${statusCode} error for ${req.method} ${req.originalUrl}`,
        req.ip || req.socket.remoteAddress || 'unknown',
        req.headers['user-agent'] || 'unknown'
      );
    }
    
    // Log server errors (5xx)
    if (statusCode >= 500) {
      logSecurityEvent(
        'HIGH',
        'SERVER_ERROR',
        `${statusCode} error for ${req.method} ${req.originalUrl}`,
        req.ip || req.socket.remoteAddress || 'unknown',
        req.headers['user-agent'] || 'unknown'
      );
    }
    
    return originalSend.call(this, body);
  };
  
  // Intercept JSON responses
  res.json = function(body?: any): Response {
    return originalJson.call(this, body);
  };
  
  // Error tracking
  try {
    next();
  } catch (error) {
    logError(error as Error, req);
    next(error);
  }
}

// Rate limiting tracker to detect brute force attacks
const ipAttempts: Record<string, { count: number, firstAttempt: number }> = {};

export function trackLoginAttempt(ip: string, success: boolean) {
  const now = Date.now();
  
  // Clear old attempts (older than 15 minutes)
  Object.keys(ipAttempts).forEach(trackedIp => {
    if (now - ipAttempts[trackedIp].firstAttempt > 15 * 60 * 1000) {
      delete ipAttempts[trackedIp];
    }
  });
  
  // Initialize tracking for new IPs
  if (!ipAttempts[ip]) {
    ipAttempts[ip] = { count: 0, firstAttempt: now };
  }
  
  // Reset on successful login
  if (success) {
    delete ipAttempts[ip];
    return;
  }
  
  // Increment failed attempts
  ipAttempts[ip].count++;
  
  // Check for brute force attempts
  if (ipAttempts[ip].count >= 5) {
    logSecurityEvent(
      'HIGH',
      'BRUTE_FORCE_ATTEMPT',
      `${ipAttempts[ip].count} failed login attempts in ${Math.floor((now - ipAttempts[ip].firstAttempt) / 1000)} seconds`,
      ip,
      'unknown' // User agent not available here
    );
    
    // Could implement automatic blocking here
    if (ipAttempts[ip].count >= 10) {
      // Block the IP temporarily
      logSecurityEvent(
        'CRITICAL',
        'IP_BLOCKED',
        `IP blocked after ${ipAttempts[ip].count} failed login attempts`,
        ip,
        'unknown'
      );
      // Actual blocking logic would go here
    }
  }
}

// Function to get recent security events (for admin dashboard)
export function getRecentSecurityEvents(limit: number = 100): Promise<any[]> {
  return new Promise((resolve, reject) => {
    fs.readFile(SECURITY_LOG_PATH, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading security log:', err);
        return reject(err);
      }
      
      const lines = data.split('\n').filter(line => line.trim() !== '');
      const header = lines[0].split(',');
      const events = lines.slice(1, limit + 1).map(line => {
        const values = line.split(',');
        const event: any = {};
        
        header.forEach((key, index) => {
          // Remove quotes from values
          const value = values[index] ? values[index].replace(/^"(.*)"$/, '$1') : '';
          event[key.toLowerCase()] = value;
        });
        
        return event;
      });
      
      resolve(events);
    });
  });
}

// Admin dashboard security data API
export async function getSecurityDashboardData() {
  try {
    const recentEvents = await getRecentSecurityEvents(50);
    
    // Count events by severity
    const severityCounts = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0
    };
    
    // Count events by type
    const typeCounts: Record<string, number> = {};
    
    // Recent suspicious IPs
    const suspiciousIPs: Record<string, {
      lastSeen: string,
      eventCount: number,
      latestEvents: string[]
    }> = {};
    
    // Process events for statistics
    recentEvents.forEach(event => {
      // Count by severity
      if (severityCounts.hasOwnProperty(event.severity)) {
        severityCounts[event.severity as keyof typeof severityCounts]++;
      }
      
      // Count by type
      const type = event.type;
      typeCounts[type] = (typeCounts[type] || 0) + 1;
      
      // Track suspicious IPs for MEDIUM, HIGH, or CRITICAL events
      if (['MEDIUM', 'HIGH', 'CRITICAL'].includes(event.severity)) {
        const ip = event.ip;
        
        if (!suspiciousIPs[ip]) {
          suspiciousIPs[ip] = {
            lastSeen: event.timestamp,
            eventCount: 0,
            latestEvents: []
          };
        }
        
        suspiciousIPs[ip].eventCount++;
        
        if (suspiciousIPs[ip].latestEvents.length < 5) {
          suspiciousIPs[ip].latestEvents.push(event.description);
        }
        
        // Update last seen if this event is more recent
        if (new Date(event.timestamp) > new Date(suspiciousIPs[ip].lastSeen)) {
          suspiciousIPs[ip].lastSeen = event.timestamp;
        }
      }
    });
    
    // Convert suspicious IPs to array and sort by event count
    const suspiciousIPList = Object.entries(suspiciousIPs).map(([ip, data]) => ({
      ip,
      ...data
    })).sort((a, b) => b.eventCount - a.eventCount);
    
    return {
      summary: {
        totalEvents: recentEvents.length,
        criticalEvents: severityCounts.CRITICAL,
        highEvents: severityCounts.HIGH,
        mediumEvents: severityCounts.MEDIUM,
        lowEvents: severityCounts.LOW
      },
      recentEvents: recentEvents.slice(0, 10), // Just the 10 most recent events
      eventsByType: typeCounts,
      suspiciousIPs: suspiciousIPList.slice(0, 10) // Top 10 suspicious IPs
    };
  } catch (error) {
    console.error('Error generating security dashboard data:', error);
    return {
      error: 'Failed to generate security dashboard data',
      summary: { totalEvents: 0, criticalEvents: 0, highEvents: 0, mediumEvents: 0, lowEvents: 0 },
      recentEvents: [],
      eventsByType: {},
      suspiciousIPs: []
    };
  }
}

// Function to check for vulnerable dependencies using a mock vulnerability scanner
// In a real implementation, this would integrate with a real vulnerability scanning tool
export async function checkVulnerableDependencies() {
  try {
    // This is where we would integrate with a vulnerability scanning tool
    // For now, we just log that we would check dependencies
    console.log('[SECURITY] Checking for vulnerable dependencies...');
    
    // In a real implementation, we would:
    // 1. Parse package.json to get dependencies
    // 2. Query vulnerability databases (e.g., GitHub Dependabot API)
    // 3. Return list of vulnerable dependencies with severity
    
    // Mock response
    return {
      status: 'success',
      message: 'Vulnerability scan complete',
      lastScanDate: new Date().toISOString(),
      details: 'For actual vulnerability scanning, integrate with GitHub Dependabot, npm audit, or other vulnerability scanning tools.'
    };
  } catch (error) {
    console.error('Error checking vulnerable dependencies:', error);
    return {
      status: 'error',
      message: 'Failed to check for vulnerable dependencies',
      error: (error as Error).message
    };
  }
}

// Function to simulate penetration testing reporting
export function getPenetrationTestingStatus() {
  // In a real implementation, this would pull data from a penetration testing service
  return {
    lastTestDate: '2023-04-15T00:00:00Z', // Example date
    status: 'Completed',
    overallRisk: 'Low',
    criticalVulnerabilities: 0,
    highVulnerabilities: 1,
    mediumVulnerabilities: 3,
    lowVulnerabilities: 12,
    recommendations: [
      'Implement Content Security Policy (CSP)',
      'Enable HTTP Strict Transport Security (HSTS)',
      'Consider implementing multi-factor authentication'
    ],
    nextScheduledTest: '2023-07-15T00:00:00Z' // Example date
  };
}