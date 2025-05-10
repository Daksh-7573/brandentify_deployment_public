import { Request, Response, NextFunction } from "express";
import { SecurityMonitoringService } from "../services/security-monitoring-service";

/**
 * Middleware to log security events for sensitive operations
 * 
 * @param eventType Type of security event to log
 * @param action Description of the action being performed
 * @param severity Severity level of the event
 */
export function logSecurityEvent(
  eventType: "authentication" | "authorization" | "file_operation" | "data_access" | "admin_action" | "system" | "attack" | "api" | "vulnerability",
  action: string,
  severity: "info" | "low" | "medium" | "high" | "critical" = "info"
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get request metadata
      const metadata = SecurityMonitoringService.getRequestMetadata(req);
      
      // Get original status and handler
      const originalEnd = res.end;
      const originalStatus = res.statusCode;
      
      // Override end method to capture response status
      res.end = function (chunk?: any, encoding?: any, cb?: any) {
        // Restore original end
        res.end = originalEnd;
        
        // Get user if available
        const userId = req.user?.id ? req.user.id.toString() : null;
        
        // Determine success/failure based on status code
        const status = res.statusCode >= 400 ? "failure" : "success";
        
        // Log security event
        SecurityMonitoringService.logSecurityEvent({
          eventType,
          action,
          severity,
          status,
          userId,
          ...metadata,
          details: {
            params: req.params,
            query: req.query,
            statusCode: res.statusCode,
            originalStatus,
          },
        }).catch(err => {
          console.error("Error logging security event:", err);
        });
        
        // Call original end
        return originalEnd.call(res, chunk, encoding, cb);
      };
      
      next();
    } catch (error) {
      console.error("Error in security logging middleware:", error);
      next();
    }
  };
}

/**
 * Middleware to monitor and log system errors
 */
export function errorMonitoringMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
  try {
    // Get request metadata
    const metadata = SecurityMonitoringService.getRequestMetadata(req);
    
    // Get user if available
    const userId = req.user?.id ? req.user.id.toString() : null;
    
    // Determine severity based on status code
    let severity: "info" | "low" | "medium" | "high" | "critical" = "medium";
    
    if (res.statusCode >= 500) {
      severity = "high";
    } else if (res.statusCode >= 400) {
      severity = "medium";
    } else {
      severity = "low";
    }
    
    // Extract error details
    const errorType = err.name || "UnknownError";
    const message = err.message || "Unknown error occurred";
    const stackTrace = err.stack || "";
    
    // Log system error
    SecurityMonitoringService.logSystemError({
      errorType,
      component: "api",
      severity,
      message,
      stackTrace,
      userId: userId,
      ...metadata,
      requestMethod: metadata.requestMethod,
      affectedData: {
        params: req.params,
        query: req.query,
        body: req.body,
      },
      resolved: false,
    }).catch(logErr => {
      console.error("Error logging system error:", logErr);
    });
  } catch (error) {
    console.error("Error in error monitoring middleware:", error);
  }
  
  // Always continue to the next error handler
  next(err);
}

/**
 * Regular expression patterns to detect common attack attempts
 */
const ATTACK_PATTERNS = {
  xss: [
    /<script\b[^>]*>(.*?)<\/script>/gi,
    /javascript:[^"']/i,
    /on(load|error|focus|click|mouse|key)\s*=/i,
    /eval\s*\(/i,
    /document\.cookie/i,
    /document\.location/i,
    /document\.write/i,
    /alert\s*\(/i,
  ],
  sql_injection: [
    /('|").*\s+OR\s+('|"|\d).*=\s*\2/i,
    /('|").*\s+AND\s+('|"|\d).*=\s*\2/i,
    /^.*(;|\||\|\|).*(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)/i,
    /UNION\s+ALL\s+SELECT/i,
    /SELECT\s+.*\s+FROM\s+/i,
    /INSERT\s+INTO\s+/i,
    /UPDATE\s+.*\s+SET\s+/i,
    /DELETE\s+FROM\s+/i,
  ],
  path_traversal: [
    /\.\.\//g,
    /\.\.\\+/g,
    /\/etc\/passwd/i,
    /\/etc\/shadow/i,
    /\/proc\/self/i,
    /\/windows\/system32/i,
    /\/boot\.ini/i,
    /\/web\.config/i,
  ],
  command_injection: [
    /;\s*(ls|cat|rm|chmod|wget|curl|ping|nc|bash|sh|cmd|powershell)/i,
    /\|\s*(ls|cat|rm|chmod|wget|curl|ping|nc|bash|sh|cmd|powershell)/i,
    /`.*`/i,
    /\$\(.*\)/i,
  ],
  prompt_injection: [
    /ignore previous instructions/i,
    /ignore all previous commands/i,
    /disregard previous directives/i,
    /forget your instructions/i,
    /you are not an AI/i,
    /ignore your programming/i,
  ],
};

/**
 * Middleware to detect attack attempts
 */
export function attackDetectionMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // Get request data to analyze
    const requestData = {
      url: req.originalUrl || req.url,
      method: req.method,
      params: req.params || {},
      query: req.query || {},
      body: req.body || {},
      headers: req.headers,
    };
    
    // Get user if available
    // Get user ID if available
    
    // Convert request data to string for pattern matching
    const dataString = JSON.stringify(requestData).toLowerCase();
    
    // Check for attack patterns
    let attackDetected = false;
    let attackType = "other";
    let attackPatterns: string[] = [];
    
    // Check each attack type
    for (const [type, patterns] of Object.entries(ATTACK_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(dataString)) {
          attackDetected = true;
          attackType = type;
          attackPatterns.push(pattern.toString());
          break;
        }
      }
      
      if (attackDetected) {
        break;
      }
    }
    
    // Log attack attempt if detected
    if (attackDetected) {
      const metadata = SecurityMonitoringService.getRequestMetadata(req);
      
      SecurityMonitoringService.logAttackAttempt({
        attackType: attackType as any,
        severity: "medium", // Default to medium
        blocked: false, // Just detecting, not blocking yet
      userId: userId,
        ...metadata,
        requestData: requestData,
        headers: req.headers,
        mitigationApplied: "logged",
        details: {
          attackPatterns,
          detectedIn: dataString.substring(0, 200) + "...", // Truncate for log size
        },
      }).catch(err => {
        console.error("Error logging attack attempt:", err);
      });
      
      // For some high-risk attacks, we might want to block the request
      if (
        attackType === "sql_injection" || 
        attackType === "path_traversal" || 
        attackType === "command_injection"
      ) {
        // Log as blocked
        SecurityMonitoringService.logSecurityEvent({
          eventType: "attack",
          action: `Blocked ${attackType} attack attempt`,
          severity: "high",
          status: "blocked",
      userId: userId,
          ...metadata,
          details: {
            attackType,
            attackPatterns,
          },
        }).catch(err => {
          console.error("Error logging blocked attack:", err);
        });
        
        // Return a 403 Forbidden response
        return res.status(403).json({
          error: "Security violation detected",
          message: "This request has been blocked for security reasons.",
          code: "SECURITY_VIOLATION",
        });
      }
    }
    
    next();
  } catch (error) {
    console.error("Error in attack detection middleware:", error);
    next();
  }
}

/**
 * Middleware to log admin actions
 */
export function adminActionLoggingMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // Check if this is an admin route
    const isAdminRoute = req.originalUrl.includes('/admin/') || req.originalUrl.includes('/api/admin/');
    
    if (isAdminRoute) {
      // Get request metadata
      const metadata = SecurityMonitoringService.getRequestMetadata(req);
      
      // Get user
    // Get user ID if available
      
      if (!user) {
        // If no user is found for an admin route, log as a security event
        SecurityMonitoringService.logSecurityEvent({
          eventType: "authorization",
          action: "Unauthorized admin access attempt",
          severity: "high",
          status: "blocked",
          ...metadata,
          details: {
            route: req.originalUrl,
            method: req.method,
          },
        }).catch(err => {
          console.error("Error logging unauthorized admin access:", err);
        });
        
        return res.status(401).json({
          error: "Unauthorized",
          message: "You must be logged in as an administrator to access this resource.",
        });
      }
      
      // For admin actions, use a different middleware to capture all request details
      const originalEnd = res.end;
      
      res.end = function (chunk?: any, encoding?: any, cb?: any) {
        // Restore original end
        res.end = originalEnd;
        
        // Log admin action
        SecurityMonitoringService.logSecurityEvent({
          eventType: "admin_action",
          action: `Admin ${req.method} ${req.originalUrl}`,
          severity: "medium",
          status: res.statusCode >= 400 ? "failure" : "success",
          userId: user.username,
          ...metadata,
          details: {
            route: req.originalUrl,
            method: req.method,
            params: req.params,
            query: req.query,
            body: req.body,
            statusCode: res.statusCode,
          },
        }).catch(err => {
          console.error("Error logging admin action:", err);
        });
        
        // Call original end
        return originalEnd.call(res, chunk, encoding, cb);
      };
    }
    
    next();
  } catch (error) {
    console.error("Error in admin action logging middleware:", error);
    next();
  }
}

/**
 * Middleware to gather system-wide request metrics
 */
export function requestMetricsMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // Store request start time
    const startTime = Date.now();
    
    // Override end method to capture metrics
    const originalEnd = res.end;
    
    res.end = function (chunk?: any, encoding?: any, cb?: any) {
      // Restore original end
      res.end = originalEnd;
      
      // Calculate request duration
      const duration = Date.now() - startTime;
      
      // Log to console for now (can be enhanced to store in database or metrics system)
      if (duration > 1000) {
        console.warn(`Slow request detected: ${req.method} ${req.originalUrl} took ${duration}ms`);
        
        // For very slow requests, log as a system event for investigation
        if (duration > 5000) {
          const metadata = SecurityMonitoringService.getRequestMetadata(req);
          const userId = req.user?.id ? req.user.id.toString() : null;
          
          SecurityMonitoringService.logSystemError({
            errorType: "PerformanceIssue",
            component: "api",
            severity: "medium",
            message: `Slow request detected: ${req.method} ${req.originalUrl} took ${duration}ms`,
      userId: userId,
            ...metadata,
            requestMethod: metadata.requestMethod,
            affectedData: {
              duration,
              statusCode: res.statusCode,
            },
            resolved: false,
          }).catch(err => {
            console.error("Error logging performance issue:", err);
          });
        }
      }
      
      // Call original end
      return originalEnd.call(res, chunk, encoding, cb);
    };
    
    next();
  } catch (error) {
    console.error("Error in request metrics middleware:", error);
    next();
  }
}
