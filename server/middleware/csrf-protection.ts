/**
 * CSRF Protection Middleware
 * 
 * Implements comprehensive Cross-Site Request Forgery protection for localStorage-based sessions
 * with fallback to cookie-based authentication
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

/**
 * SECURITY FIX: Centralized secure CSRF secret management
 * In production, CSRF_SECRET MUST be explicitly set as environment variable
 */
function generateSecureCSRFSecret(): string {
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  if (nodeEnv === 'production' && !process.env.CSRF_SECRET) {
    console.error('❌ [SECURITY-ERROR] CSRF_SECRET is required in production environment');
    console.error('❌ [SECURITY-ERROR] Server startup failed - set CSRF_SECRET environment variable');
    console.error('❌ [SECURITY-ERROR] Generate a secure secret: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
    process.exit(1); // Hard fail in production
  }
  
  if (process.env.CSRF_SECRET) {
    console.log('✅ [CSRF-SECRET] Using explicitly set CSRF_SECRET from environment');
    return process.env.CSRF_SECRET;
  }
  
  // Development fallback: generate cryptographically random secret per-process
  const generatedSecret = crypto.randomBytes(64).toString('hex');
  console.warn('⚠️ [CSRF-SECRET] No CSRF_SECRET set - generated secure per-process secret (development only)');
  console.warn('⚠️ [CSRF-SECRET] For production: set CSRF_SECRET environment variable');
  return generatedSecret;
}

/**
 * Export function to get CSRF secret for universal use across the application
 */
export function getCSRFSecret(): string {
  return CSRF_SECRET;
}

const CSRF_SECRET = generateSecureCSRFSecret();
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');

// In-memory store for CSRF tokens (in production, use Redis or database)
const csrfTokenStore = new Map<string, { token: string; timestamp: number; userId?: number }>();

// Clean up expired CSRF tokens every 30 minutes
setInterval(() => {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  let deletedCount = 0;
  
  for (const [key, data] of Array.from(csrfTokenStore.entries())) {
    if (data.timestamp < oneHourAgo) {
      csrfTokenStore.delete(key);
      deletedCount++;
    }
  }
  
  if (deletedCount > 0) {
    console.log(`🧹 [CSRF-CLEANUP] Removed ${deletedCount} expired CSRF tokens`);
  }
}, 30 * 60 * 1000);

/**
 * Generate a CSRF token for a user session
 */
export function generateCSRFToken(userId?: number): string {
  const tokenId = crypto.randomBytes(32).toString('hex');
  const timestamp = Date.now();
  
  const csrfData = {
    tokenId,
    userId,
    timestamp,
    nonce: crypto.randomBytes(16).toString('hex')
  };
  
  // Sign the CSRF data to prevent tampering
  const signedToken = jwt.sign(csrfData, CSRF_SECRET, { 
    algorithm: 'HS256',
    expiresIn: '1h'  // CSRF tokens expire in 1 hour
  });
  
  // Store in memory with tokenId as key
  csrfTokenStore.set(tokenId, {
    token: signedToken,
    timestamp,
    userId
  });
  
  console.log(`🛡️ [CSRF] Generated CSRF token for user ${userId || 'anonymous'}`);
  return signedToken;
}

/**
 * Validate a CSRF token
 */
export function validateCSRFToken(token: string, userId?: number): boolean {
  try {
    // Verify JWT signature
    const decoded = jwt.verify(token, CSRF_SECRET) as any;
    
    if (!decoded || !decoded.tokenId) {
      console.warn('❌ [CSRF] Invalid token format');
      return false;
    }
    
    // Check if token exists in store
    const storedData = csrfTokenStore.get(decoded.tokenId);
    if (!storedData) {
      console.warn('❌ [CSRF] Token not found in store');
      return false;
    }
    
    // Verify token matches stored token
    if (storedData.token !== token) {
      console.warn('❌ [CSRF] Token mismatch');
      return false;
    }
    
    // If userId is provided, verify it matches
    if (userId && decoded.userId !== userId) {
      console.warn('❌ [CSRF] User ID mismatch');
      return false;
    }
    
    // Check token age (1 hour max)
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    if (decoded.timestamp < oneHourAgo) {
      console.warn('❌ [CSRF] Token expired');
      // Clean up expired token
      csrfTokenStore.delete(decoded.tokenId);
      return false;
    }
    
    console.log(`✅ [CSRF] Valid token for user ${userId || 'anonymous'}`);
    return true;
    
  } catch (error) {
    console.warn('❌ [CSRF] Token validation error:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

/**
 * Middleware to generate and include CSRF tokens in responses
 */
export function csrfTokenGenerator(req: Request, res: Response, next: NextFunction) {
  // Only generate CSRF tokens for GET requests or when explicitly requested
  if (req.method === 'GET' || req.headers['x-request-csrf-token']) {
    try {
      // Try to get user ID from JWT token (cookie or bearer)
      let userId: number | undefined;
      
      // Check for JWT in cookie first (primary auth method)
      const cookieToken = req.cookies?.brandentifier_session;
      if (cookieToken) {
        try {
          const decoded = jwt.verify(cookieToken, JWT_SECRET) as any;
          userId = decoded.userId;
        } catch (error) {
          // Cookie token invalid, continue without user ID
        }
      }
      
      // If no cookie token, check Bearer token (localStorage auth)
      if (!userId) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const bearerToken = authHeader.substring(7);
          try {
            const decoded = jwt.verify(bearerToken, JWT_SECRET) as any;
            userId = decoded.userId;
          } catch (error) {
            // Bearer token invalid, continue without user ID
          }
        }
      }
      
      // Generate CSRF token
      const csrfToken = generateCSRFToken(userId);
      
      // Set CSRF token in response header
      res.setHeader('X-CSRF-Token', csrfToken);
      
      // For API requests, also include in JSON response if not already set
      const originalJson = res.json;
      res.json = function(data: any) {
        if (data && typeof data === 'object' && !data.csrfToken) {
          data.csrfToken = csrfToken;
        }
        return originalJson.call(this, data);
      };
      
    } catch (error) {
      console.error('Error generating CSRF token:', error);
    }
  }
  
  next();
}

/**
 * Middleware to validate CSRF tokens for state-changing operations
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Skip CSRF check for safe HTTP methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // Skip CSRF check for public routes that don't need protection
  const publicRoutes = [
    '/api/auth/google/url',
    '/api/auth/google/callback',
    '/api/auth/logout',
    '/api/demo',
    '/api/brands-of-the-day'
  ];
  
  const isPublicRoute = publicRoutes.some(route => req.path.startsWith(route));
  if (isPublicRoute) {
    console.log(`🔓 [CSRF] Skipping CSRF check for public route: ${req.path}`);
    return next();
  }
  
  // Skip CSRF check for cookie-only authentication (existing secure method)
  const hasCookieAuth = req.cookies?.brandentifier_session;
  const hasBearerAuth = req.headers.authorization?.startsWith('Bearer ');
  
  // Only enforce CSRF for localStorage-based authentication (Bearer tokens)
  if (!hasBearerAuth) {
    if (hasCookieAuth) {
      console.log(`🍪 [CSRF] Using cookie auth, skipping CSRF check: ${req.path}`);
      return next();
    } else {
      console.log(`🔓 [CSRF] No authentication found, allowing public access: ${req.path}`);
      return next();
    }
  }
  
  console.log(`🛡️ [CSRF] Validating CSRF token for Bearer auth: ${req.method} ${req.path}`);
  
  // Get CSRF token from headers or body
  const csrfToken = req.headers['x-csrf-token'] as string || 
                   req.body?._csrf as string ||
                   req.query?.csrf as string;
  
  if (!csrfToken) {
    console.warn(`❌ [CSRF] Missing CSRF token for protected route: ${req.path}`);
    return res.status(403).json({ 
      success: false,
      error: 'CSRF token required',
      code: 'CSRF_TOKEN_MISSING',
      message: 'CSRF token is required for this operation when using localStorage authentication.'
    });
  }
  
  // Get user ID from Bearer token for validation
  let userId: number | undefined;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.substring(7);
    try {
      const decoded = jwt.verify(bearerToken, JWT_SECRET) as any;
      userId = decoded.userId;
    } catch (error) {
      console.warn('❌ [CSRF] Invalid Bearer token during CSRF validation');
      return res.status(401).json({ 
        success: false,
        error: 'Invalid authentication token',
        code: 'INVALID_AUTH_TOKEN'
      });
    }
  }
  
  // Validate CSRF token
  const isValid = validateCSRFToken(csrfToken, userId);
  
  if (!isValid) {
    console.warn(`❌ [CSRF] Invalid CSRF token for user ${userId}: ${req.path}`);
    return res.status(403).json({ 
      success: false,
      error: 'Invalid CSRF token',
      code: 'CSRF_TOKEN_INVALID',
      message: 'The CSRF token is invalid or expired. Please refresh the page and try again.'
    });
  }
  
  console.log(`✅ [CSRF] CSRF validation successful for user ${userId}: ${req.path}`);
  next();
}

/**
 * Enhanced CSRF middleware that combines token generation and validation
 */
export function enhancedCSRFMiddleware(req: Request, res: Response, next: NextFunction) {
  // First, try to generate CSRF token for GET requests
  if (req.method === 'GET' || req.headers['x-request-csrf-token']) {
    csrfTokenGenerator(req, res, () => {
      // Then apply CSRF protection for state-changing operations
      csrfProtection(req, res, next);
    });
  } else {
    // For non-GET requests, just apply CSRF protection
    csrfProtection(req, res, next);
  }
}

/**
 * Get CSRF statistics for monitoring
 */
export function getCSRFStats() {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  
  let activeTokens = 0;
  let expiredTokens = 0;
  
  for (const [, data] of Array.from(csrfTokenStore.entries())) {
    if (data.timestamp >= oneHourAgo) {
      activeTokens++;
    } else {
      expiredTokens++;
    }
  }
  
  return {
    totalTokens: csrfTokenStore.size,
    activeTokens,
    expiredTokens,
    timestamp: new Date().toISOString()
  };
}

export default {
  generateCSRFToken,
  validateCSRFToken,
  csrfTokenGenerator,
  csrfProtection,
  enhancedCSRFMiddleware,
  getCSRFStats,
  getCSRFSecret
};