/**
 * CSRF Protection Middleware
 * 
 * Implements CSRF protection for cookie-based JWT authentication.
 * Generates and validates CSRF tokens for state-changing requests (POST, PUT, PATCH, DELETE).
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// CSRF token store (in production, use Redis or database)
const csrfTokenStore = new Map<string, { token: string, timestamp: number, userId?: number }>();

// Clean up expired tokens every 15 minutes
setInterval(() => {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  for (const [sessionId, data] of Array.from(csrfTokenStore.entries())) {
    if (data.timestamp < oneHourAgo) {
      csrfTokenStore.delete(sessionId);
    }
  }
}, 15 * 60 * 1000);

/**
 * Generate CSRF token for the current session
 */
export function generateCSRFToken(req: Request): string {
  // Use session cookie or create temporary session ID
  const sessionId = req.cookies?.brandentifier_session || crypto.randomBytes(32).toString('hex');
  
  // Generate cryptographically secure CSRF token
  const token = crypto.randomBytes(32).toString('hex');
  
  // Store token with session and timestamp
  csrfTokenStore.set(sessionId, {
    token,
    timestamp: Date.now(),
    userId: (req as any).user?.id
  });
  
  return token;
}

/**
 * Validate CSRF token for the current session
 */
export function validateCSRFToken(req: Request, providedToken: string): boolean {
  const sessionId = req.cookies?.brandentifier_session;
  
  if (!sessionId) {
    console.warn('🚨 [CSRF] No session cookie found for CSRF validation');
    return false;
  }
  
  const storedData = csrfTokenStore.get(sessionId);
  
  if (!storedData) {
    console.warn('🚨 [CSRF] No CSRF token found for session');
    return false;
  }
  
  // Check token age (max 1 hour)
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  if (storedData.timestamp < oneHourAgo) {
    console.warn('🚨 [CSRF] CSRF token expired');
    csrfTokenStore.delete(sessionId);
    return false;
  }
  
  // Validate token match
  if (storedData.token !== providedToken) {
    console.warn('🚨 [CSRF] CSRF token mismatch');
    return false;
  }
  
  // Optional: Validate user ID match if available
  if (storedData.userId && (req as any).user?.id && storedData.userId !== (req as any).user.id) {
    console.warn('🚨 [CSRF] CSRF token user ID mismatch');
    return false;
  }
  
  return true;
}

/**
 * Middleware to provide CSRF token to client
 */
export function provideCSRFToken(req: Request, res: Response, next: NextFunction) {
  // Only provide token for authenticated requests
  if ((req as any).user) {
    const token = generateCSRFToken(req);
    res.setHeader('X-CSRF-Token', token);
  }
  next();
}

/**
 * Middleware to validate CSRF token for state-changing requests
 */
export function validateCSRFMiddleware(req: Request, res: Response, next: NextFunction) {
  // Only validate CSRF for state-changing methods
  const stateChangingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  
  if (!stateChangingMethods.includes(req.method)) {
    return next();
  }
  
  // Skip CSRF validation for these auth routes (they have their own protection)
  const skipPaths = [
    '/api/auth/',
    '/api/oauth/',
    '/auth',
    '/fix-auth'
  ];
  
  if (skipPaths.some(path => req.path.startsWith(path))) {
    return next();
  }
  
  // Get CSRF token from multiple possible sources
  const csrfToken = 
    req.headers['x-csrf-token'] as string ||
    req.headers['x-xsrf-token'] as string ||
    req.body?.csrfToken ||
    req.query.csrfToken as string;
  
  if (!csrfToken) {
    console.warn('🚨 [CSRF] Missing CSRF token for state-changing request:', {
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
    
    return res.status(403).json({
      error: 'CSRF token required',
      message: 'CSRF token must be provided for state-changing requests',
      code: 'CSRF_TOKEN_MISSING'
    });
  }
  
  if (!validateCSRFToken(req, csrfToken)) {
    console.error('🚨 [SECURITY ALERT] Invalid CSRF token detected:', {
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      providedToken: csrfToken.substring(0, 8) + '...',
      timestamp: new Date().toISOString()
    });
    
    return res.status(403).json({
      error: 'Invalid CSRF token',
      message: 'CSRF token validation failed',
      code: 'CSRF_TOKEN_INVALID'
    });
  }
  
  console.log('✅ [CSRF] Token validated successfully for:', req.method, req.path);
  next();
}

/**
 * Route to get CSRF token for authenticated users
 */
export function getCSRFTokenRoute(req: Request, res: Response) {
  if (!(req as any).user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'You must be logged in to get a CSRF token'
    });
  }
  
  const token = generateCSRFToken(req);
  
  res.json({
    csrfToken: token,
    expiresIn: 3600000, // 1 hour in milliseconds
    message: 'Include this token in X-CSRF-Token header for state-changing requests'
  });
}