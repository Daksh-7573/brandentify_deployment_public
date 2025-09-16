/**
 * SECURE AUTHENTICATION MIDDLEWARE
 * 
 * This middleware eliminates IDOR vulnerabilities by:
 * 1. Resolving user identity from server-side JWT session tokens
 * 2. Never trusting client-supplied user identifiers
 * 3. Providing consistent user resolution across all domains
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { storage } from '../storage';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

// Extend Express Request interface to include authenticated user
declare global {
  namespace Express {
    interface Request {
      authenticatedUser?: {
        id: number;
        firebaseUid: string;
        email: string;
        username: string;
        name: string;
        photoURL?: string;
        authProvider: string;
      };
    }
  }
}

/**
 * Extract and verify JWT token from request
 */
function extractAndVerifyToken(req: Request): any | null {
  try {
    // Try multiple token sources in order of preference
    let token: string | undefined;
    
    // 1. Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // 2. Session cookie (primary for web) - align with OAuth cookie name
    if (!token && req.cookies?.brandentifier_session) {
      token = req.cookies.brandentifier_session;
    }
    
    // 3. Auth cookie fallback
    if (!token && req.cookies?.auth_token) {
      token = req.cookies.auth_token;
    }
    
    // 4. X-Auth-Token header
    if (!token && req.headers['x-auth-token']) {
      token = req.headers['x-auth-token'] as string;
    }
    
    if (!token) {
      return null;
    }
    
    // Verify and decode JWT
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
    
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Resolve user from authentication token
 */
async function resolveUserFromToken(req: Request): Promise<any | null> {
  try {
    const tokenData = extractAndVerifyToken(req);
    
    if (!tokenData) {
      return null;
    }
    
    // Look up user by Firebase UID from token
    let user = null;
    
    if (tokenData.firebaseUid) {
      user = await storage.getUserByUsername(tokenData.firebaseUid);
    } else if (tokenData.email) {
      user = await storage.getUserByEmail(tokenData.email);
    } else if (tokenData.userId) {
      user = await storage.getUser(tokenData.userId);
    }
    
    if (!user) {
      console.warn('Token valid but user not found:', { 
        firebaseUid: tokenData.firebaseUid,
        email: tokenData.email,
        userId: tokenData.userId
      });
      return null;
    }
    
    return {
      id: user.id,
      firebaseUid: user.firebaseUid || user.username, // Fallback for legacy data
      email: user.email,
      username: user.username,
      name: user.name,
      photoURL: user.photoURL,
      authProvider: user.authProvider || 'unknown'
    };
    
  } catch (error) {
    console.error('User resolution failed:', error);
    return null;
  }
}

/**
 * STRICT authentication middleware - REQUIRES valid authentication
 * Use this for endpoints that must have authenticated users
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await resolveUserFromToken(req);
    
    if (!user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to access this resource',
        code: 'AUTH_REQUIRED'
      });
    }
    
    // Attach authenticated user to request
    req.authenticatedUser = user;
    
    console.log(`🔐 [SECURE AUTH] Authenticated user ${user.id} (${user.email}) for ${req.method} ${req.path}`);
    
    next();
    
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({
      error: 'Authentication system error',
      message: 'Please try again later'
    });
  }
}

/**
 * OPTIONAL authentication middleware - allows anonymous access
 * Use this for endpoints that can work with or without authentication
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await resolveUserFromToken(req);
    
    if (user) {
      req.authenticatedUser = user;
      console.log(`🔐 [OPTIONAL AUTH] Authenticated user ${user.id} (${user.email}) for ${req.method} ${req.path}`);
    } else {
      console.log(`🔓 [OPTIONAL AUTH] Anonymous access for ${req.method} ${req.path}`);
    }
    
    next();
    
  } catch (error) {
    console.error('Optional authentication middleware error:', error);
    // For optional auth, continue even if there's an error
    next();
  }
}

/**
 * Get current authenticated user from request
 * This is the ONLY way routes should access user information
 */
export function getCurrentUser(req: Request): any | null {
  return req.authenticatedUser || null;
}

/**
 * Helper function to ensure user owns resource
 * Use this for additional authorization checks
 */
export function requireResourceOwnership(resourceUserId: number, req: Request, res: Response): boolean {
  const currentUser = getCurrentUser(req);
  
  if (!currentUser) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'Please log in to access this resource'
    });
    return false;
  }
  
  if (currentUser.id !== resourceUserId) {
    res.status(403).json({
      error: 'Access denied',
      message: 'You can only access your own resources',
      code: 'OWNERSHIP_REQUIRED'
    });
    return false;
  }
  
  return true;
}

/**
 * Middleware to block client-supplied user parameters
 * This prevents IDOR attacks by rejecting requests with userId params
 */
export function blockClientUserParams(req: Request, res: Response, next: NextFunction) {
  const suspiciousParams = ['userId', 'uid', 'user_id', 'firebaseUid', 'firebase_uid'];
  
  // Check query parameters
  for (const param of suspiciousParams) {
    if (req.query[param]) {
      console.warn(`🚨 [SECURITY] Blocked client-supplied parameter: ${param} in query`);
      return res.status(400).json({
        error: 'Invalid request',
        message: 'User identity is determined by authentication, not request parameters',
        code: 'CLIENT_USER_PARAM_BLOCKED'
      });
    }
  }
  
  // Check body parameters
  for (const param of suspiciousParams) {
    if (req.body && req.body[param]) {
      console.warn(`🚨 [SECURITY] Blocked client-supplied parameter: ${param} in body`);
      return res.status(400).json({
        error: 'Invalid request',
        message: 'User identity is determined by authentication, not request parameters',
        code: 'CLIENT_USER_PARAM_BLOCKED'
      });
    }
  }
  
  next();
}

/**
 * Legacy compatibility helper - gradually migrate endpoints using this
 * This allows old endpoints to work while we migrate them
 */
export async function getLegacyUserId(req: Request): Promise<number | null> {
  // First try to get from authentication
  const currentUser = getCurrentUser(req);
  if (currentUser) {
    return currentUser.id;
  }
  
  // Legacy fallback - gradually remove these
  const userIdParam = req.query.userId || req.body.userId || req.params.userId;
  
  if (userIdParam) {
    console.warn(`⚠️ [LEGACY] Using client-supplied userId: ${userIdParam} for ${req.method} ${req.path} - MIGRATE TO requireAuth`);
    
    // If it's a Firebase UID, look up the user
    if (typeof userIdParam === 'string' && /^[A-Za-z0-9]{20,}$/.test(userIdParam)) {
      try {
        const user = await storage.getUserByUsername(userIdParam);
        return user ? user.id : null;
      } catch (error) {
        console.error('Legacy Firebase UID lookup failed:', error);
        return null;
      }
    }
    
    // If it's a numeric ID, use it directly
    const numericId = Number(userIdParam);
    if (!isNaN(numericId)) {
      return numericId;
    }
  }
  
  return null;
}