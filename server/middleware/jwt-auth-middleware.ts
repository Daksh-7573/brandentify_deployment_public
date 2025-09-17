/**
 * JWT Authentication Middleware
 * 
 * Replaces disabled Firebase authentication with JWT-based authentication.
 * Validates JWT tokens from cookies or Authorization headers and attaches user info to request.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getJWTSecret } from '../jwt-secret-manager';
import { storage } from '../storage';
import type { User } from '@shared/schema';

// JWT Token payload interface (matches the structure from auth-oauth-routes.ts)
export interface JWTTokenPayload {
  userId: number;
  email: string;
  name: string;
  authProvider: 'google';
  iat: number;
  exp: number;
}

// Extended Request interface with authenticated user
export interface AuthenticatedRequest extends Request {
  user: User;
  tokenPayload: JWTTokenPayload;
}

// Optional auth request interface (user may or may not exist)
export interface OptionalAuthRequest extends Request {
  user?: User;
  tokenPayload?: JWTTokenPayload;
}

/**
 * Extracts JWT token from request cookies or Authorization header
 * @param req Express request object
 * @returns JWT token string or null if not found
 */
function extractJWTToken(req: Request): string | null {
  // Priority 1: Check for session cookie (primary method)
  const sessionCookie = req.cookies?.brandentifier_session;
  if (sessionCookie && typeof sessionCookie === 'string') {
    console.log('🔐 [JWT Auth] Found session cookie');
    return sessionCookie;
  }
  
  // Priority 2: Check Authorization header (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('🔐 [JWT Auth] Found Authorization header token');
    return token;
  }
  
  console.log('🔐 [JWT Auth] No JWT token found in cookies or headers');
  return null;
}

/**
 * Validates JWT token and extracts payload
 * @param token JWT token string
 * @returns Decoded JWT payload or null if invalid
 */
async function validateJWTToken(token: string): Promise<JWTTokenPayload | null> {
  try {
    const jwtSecret = getJWTSecret();
    const decoded = jwt.verify(token, jwtSecret, {
      algorithms: ['HS256']
    }) as JWTTokenPayload;
    
    // Validate required fields exist
    if (!decoded.userId || !decoded.email || !decoded.name) {
      console.error('🔐 [JWT Auth] Invalid token payload - missing required fields');
      return null;
    }
    
    // Check if token is expired (additional check beyond jwt.verify)
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      console.error('🔐 [JWT Auth] Token is expired');
      return null;
    }
    
    console.log('✅ [JWT Auth] Token validation successful for user:', {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name
    });
    
    return decoded;
    
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      console.error('🔐 [JWT Auth] Invalid JWT token signature');
    } else if (error.name === 'TokenExpiredError') {
      console.error('🔐 [JWT Auth] JWT token has expired');
    } else {
      console.error('🔐 [JWT Auth] JWT token validation error:', error.message);
    }
    return null;
  }
}

/**
 * Fetches full user data from database using token payload
 * @param tokenPayload Validated JWT token payload
 * @returns User object from database or null if not found
 */
async function fetchUserFromToken(tokenPayload: JWTTokenPayload): Promise<User | null> {
  try {
    const user = await storage.getUserById(tokenPayload.userId);
    
    if (!user) {
      console.error('🔐 [JWT Auth] User not found in database for ID:', tokenPayload.userId);
      return null;
    }
    
    // Verify email matches (additional security check)
    if (user.email !== tokenPayload.email) {
      console.error('🔐 [JWT Auth] Email mismatch between token and database');
      return null;
    }
    
    console.log('✅ [JWT Auth] User data loaded from database:', {
      id: user.id,
      email: user.email,
      username: user.username
    });
    
    return user;
    
  } catch (error) {
    console.error('🔐 [JWT Auth] Error fetching user from database:', error);
    return null;
  }
}

/**
 * STRICT Authentication Middleware
 * Requires valid JWT token - returns 401 if missing or invalid
 * Attaches user data to req.user and token payload to req.tokenPayload
 */
export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    console.log('🔐 [JWT Auth] requireAuth - Checking authentication for:', req.method, req.url);
    console.log('🔐 [JWT Auth] requireAuth - Request headers:', {
      cookie: req.headers.cookie ? 'present' : 'missing',
      authorization: req.headers.authorization ? 'present' : 'missing',
      host: req.get('host'),
      userAgent: req.get('user-agent')?.substring(0, 50) + '...'
    });
    
    // Extract JWT token from request
    const token = extractJWTToken(req);
    if (!token) {
      console.log('❌ [JWT Auth] requireAuth - No JWT token found');
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'No authentication token provided. Please log in.',
        code: 'NO_TOKEN'
      });
    }
    
    // Validate JWT token
    const tokenPayload = await validateJWTToken(token);
    if (!tokenPayload) {
      console.log('❌ [JWT Auth] requireAuth - Invalid JWT token');
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: 'Invalid or expired authentication token. Please log in again.',
        code: 'INVALID_TOKEN'
      });
    }
    
    // Fetch full user data from database
    const user = await fetchUserFromToken(tokenPayload);
    if (!user) {
      console.log('❌ [JWT Auth] requireAuth - User not found or email mismatch');
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: 'User account not found or invalid. Please log in again.',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Attach user and token data to request
    req.user = user;
    req.tokenPayload = tokenPayload;
    
    console.log('✅ [JWT Auth] requireAuth - Authentication successful for user:', {
      userId: user.id,
      email: user.email,
      username: user.username,
      route: req.url
    });
    
    next();
    
  } catch (error) {
    console.error('❌ [JWT Auth] requireAuth - Unexpected error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication error',
      message: 'An error occurred during authentication. Please try again.',
      code: 'AUTH_ERROR'
    });
  }
}

/**
 * OPTIONAL Authentication Middleware
 * Attempts to authenticate user but continues even if token is missing/invalid
 * Attaches user data to req.user if token is valid, undefined otherwise
 */
export async function optionalAuth(req: OptionalAuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    console.log('🔐 [JWT Auth] optionalAuth - Attempting optional authentication for:', req.method, req.url);
    
    // Extract JWT token from request
    const token = extractJWTToken(req);
    if (!token) {
      console.log('🔐 [JWT Auth] optionalAuth - No JWT token found, continuing without auth');
      req.user = undefined;
      req.tokenPayload = undefined;
      return next();
    }
    
    // Validate JWT token
    const tokenPayload = await validateJWTToken(token);
    if (!tokenPayload) {
      console.log('🔐 [JWT Auth] optionalAuth - Invalid JWT token, continuing without auth');
      req.user = undefined;
      req.tokenPayload = undefined;
      return next();
    }
    
    // Fetch full user data from database
    const user = await fetchUserFromToken(tokenPayload);
    if (!user) {
      console.log('🔐 [JWT Auth] optionalAuth - User not found, continuing without auth');
      req.user = undefined;
      req.tokenPayload = undefined;
      return next();
    }
    
    // Attach user and token data to request
    req.user = user;
    req.tokenPayload = tokenPayload;
    
    console.log('✅ [JWT Auth] optionalAuth - Optional authentication successful for user:', {
      userId: user.id,
      email: user.email,
      username: user.username,
      route: req.url
    });
    
    next();
    
  } catch (error) {
    console.error('⚠️ [JWT Auth] optionalAuth - Error during optional authentication:', error);
    // For optional auth, continue without authentication on error
    req.user = undefined;
    req.tokenPayload = undefined;
    next();
  }
}

/**
 * Utility function to check if request is authenticated
 * @param req Request object (should be AuthenticatedRequest or OptionalAuthRequest)
 * @returns true if user is authenticated, false otherwise
 */
export function isAuthenticated(req: OptionalAuthRequest): req is AuthenticatedRequest {
  return !!req.user && !!req.tokenPayload;
}

/**
 * Utility function to get authenticated user ID safely
 * @param req Request object
 * @returns User ID if authenticated, null otherwise
 */
export function getAuthenticatedUserId(req: OptionalAuthRequest): number | null {
  return req.user?.id || null;
}

/**
 * Express type augmentation for TypeScript
 * This allows TypeScript to recognize the user property on Request objects
 */
declare global {
  namespace Express {
    interface Request {
      user?: User;
      tokenPayload?: JWTTokenPayload;
    }
  }
}

console.log('✅ [JWT Auth] JWT Authentication middleware loaded successfully');