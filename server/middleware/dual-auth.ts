/**
 * Dual Authentication Middleware
 * 
 * Supports both cookie-based JWT authentication (primary/secure method)
 * and localStorage-based Bearer token authentication (cross-domain compatibility)
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { storage } from '../storage';

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');

// Extend Express Request type to include authenticated user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    userId: number;
    email: string;
    name: string;
    username: string;
    authMethod: 'cookie' | 'bearer';
    authProvider: string;
  };
  authMethod?: 'cookie' | 'bearer' | 'none';
}

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/api/auth/google/url',
  '/api/auth/google/callback',
  '/api/auth/session',
  '/api/auth/logout',
  '/api/auth/refresh-token',
  '/api/auth/validate-token',
  '/api/brands-of-the-day',
  '/api/demo',
  '/api/nowboard-items',
  '/api/pulses',
  '/api/csp-report'
];

// Routes that should use strict authentication (always required)
const PROTECTED_ROUTES = [
  '/api/admin',
  '/api/users/update',
  '/api/projects/create',
  '/api/musk/chat'
];

/**
 * Extract JWT token from cookie
 */
function extractCookieToken(req: Request): string | null {
  const cookieToken = req.cookies?.brandentifier_session;
  if (!cookieToken) {
    return null;
  }
  return cookieToken;
}

/**
 * Extract JWT token from Authorization header
 */
function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Verify JWT token and return decoded payload
 */
function verifyJWTToken(token: string): any {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Validate required fields
    if (!decoded || !decoded.userId || !decoded.email) {
      console.warn('❌ [DUAL-AUTH] Invalid token payload structure');
      return null;
    }
    
    // Check token expiry
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      console.warn('❌ [DUAL-AUTH] Token expired');
      return null;
    }
    
    return decoded;
    
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      console.warn('❌ [DUAL-AUTH] Token expired during verification');
    } else if (error.name === 'JsonWebTokenError') {
      console.warn('❌ [DUAL-AUTH] Invalid token signature');
    } else {
      console.warn('❌ [DUAL-AUTH] Token verification failed:', error.message);
    }
    return null;
  }
}

/**
 * Validate user still exists and is active
 */
async function validateUserExists(userId: number): Promise<any> {
  try {
    const user = await storage.getUser(userId);
    if (!user) {
      console.warn(`❌ [DUAL-AUTH] User ${userId} not found in database`);
      return null;
    }
    return user;
  } catch (error) {
    console.error('❌ [DUAL-AUTH] Error validating user existence:', error);
    return null;
  }
}

/**
 * Check if route is public (doesn't require authentication)
 */
function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some(route => path.startsWith(route));
}

/**
 * Check if route requires strict authentication
 */
function isProtectedRoute(path: string): boolean {
  return PROTECTED_ROUTES.some(route => path.startsWith(route));
}

/**
 * Main dual authentication middleware
 */
export async function dualAuthMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const path = req.path;
    const method = req.method;
    
    console.log(`🔐 [DUAL-AUTH] Checking auth for ${method} ${path}`);
    
    // Skip authentication for public routes
    if (isPublicRoute(path)) {
      console.log(`🔓 [DUAL-AUTH] Public route, skipping auth: ${path}`);
      req.authMethod = 'none';
      return next();
    }
    
    // Try cookie authentication first (primary method)
    let authResult = await attemptCookieAuth(req);
    
    // If cookie auth failed, try Bearer token authentication
    if (!authResult.success) {
      authResult = await attemptBearerAuth(req);
    }
    
    // Handle authentication result
    if (authResult.success && authResult.user) {
      // Authentication successful
      req.user = {
        id: authResult.user.id,
        userId: authResult.user.id,
        email: authResult.user.email || '',
        name: authResult.user.name || '',
        username: authResult.user.username || '',
        authMethod: authResult.method,
        authProvider: 'google'
      };
      req.authMethod = authResult.method;
      
      console.log(`✅ [DUAL-AUTH] Authenticated user ${req.user.id} via ${authResult.method}: ${path}`);
      return next();
    }
    
    // Authentication failed
    const isStrictRoute = isProtectedRoute(path);
    
    if (isStrictRoute) {
      // Strict route - authentication is required
      console.warn(`❌ [DUAL-AUTH] Authentication required for protected route: ${path}`);
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
        message: 'You must be signed in to access this resource.'
      });
    }
    
    // Non-strict route - allow through but mark as unauthenticated
    console.log(`⚠️ [DUAL-AUTH] Unauthenticated access to non-strict route: ${path}`);
    req.authMethod = 'none';
    next();
    
  } catch (error: any) {
    console.error('❌ [DUAL-AUTH] Middleware error:', error);
    
    // For critical errors, deny access to protected routes
    if (isProtectedRoute(req.path)) {
      return res.status(500).json({
        success: false,
        error: 'Authentication service error',
        code: 'AUTH_ERROR'
      });
    }
    
    // For non-protected routes, allow through
    req.authMethod = 'none';
    next();
  }
}

/**
 * Attempt cookie-based authentication
 */
async function attemptCookieAuth(req: Request): Promise<{ success: boolean; user?: any; method?: 'cookie' }> {
  const cookieToken = extractCookieToken(req);
  
  if (!cookieToken) {
    console.log('🍪 [DUAL-AUTH] No cookie token found');
    return { success: false };
  }
  
  const decoded = verifyJWTToken(cookieToken);
  if (!decoded) {
    console.warn('🍪 [DUAL-AUTH] Invalid cookie token');
    return { success: false };
  }
  
  const user = await validateUserExists(decoded.userId);
  if (!user) {
    console.warn('🍪 [DUAL-AUTH] Cookie token user validation failed');
    return { success: false };
  }
  
  console.log(`✅ [DUAL-AUTH] Cookie authentication successful for user ${user.id}`);
  return { success: true, user, method: 'cookie' };
}

/**
 * Attempt Bearer token authentication
 */
async function attemptBearerAuth(req: Request): Promise<{ success: boolean; user?: any; method?: 'bearer' }> {
  const bearerToken = extractBearerToken(req);
  
  if (!bearerToken) {
    console.log('🔑 [DUAL-AUTH] No Bearer token found');
    return { success: false };
  }
  
  const decoded = verifyJWTToken(bearerToken);
  if (!decoded) {
    console.warn('🔑 [DUAL-AUTH] Invalid Bearer token');
    return { success: false };
  }
  
  const user = await validateUserExists(decoded.userId);
  if (!user) {
    console.warn('🔑 [DUAL-AUTH] Bearer token user validation failed');
    return { success: false };
  }
  
  console.log(`✅ [DUAL-AUTH] Bearer authentication successful for user ${user.id}`);
  return { success: true, user, method: 'bearer' };
}

/**
 * Middleware to require authentication (for specific routes)
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    console.warn(`❌ [DUAL-AUTH] Authentication required but user not found: ${req.path}`);
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      code: 'AUTH_REQUIRED',
      message: 'You must be signed in to access this resource.'
    });
  }
  
  console.log(`✅ [DUAL-AUTH] Authentication verified for user ${req.user.id}: ${req.path}`);
  next();
}

/**
 * Middleware to prefer cookie authentication over Bearer token
 */
export function preferCookieAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.user && req.user.authMethod === 'bearer') {
    console.log(`ℹ️ [DUAL-AUTH] Recommending cookie auth upgrade for user ${req.user.id}`);
    res.setHeader('X-Auth-Recommendation', 'upgrade-to-cookie');
  }
  next();
}

/**
 * Get authentication statistics for monitoring
 */
export function getAuthStats() {
  return {
    publicRoutes: PUBLIC_ROUTES.length,
    protectedRoutes: PROTECTED_ROUTES.length,
    timestamp: new Date().toISOString()
  };
}

export default {
  dualAuthMiddleware,
  requireAuth,
  preferCookieAuth,
  getAuthStats
};