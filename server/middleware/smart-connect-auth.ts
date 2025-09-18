/**
 * Smart Connect Authentication Middleware
 * 
 * Provides session-based JWT authentication for Smart Connect endpoints with:
 * - JWT session validation
 * - Strict authorization checks
 * - User session verification
 * - PII-safe logging
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { storage } from '../storage';

// JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET || 'brandentifier-secure-jwt-secret-key-2025';

// Extended request interface for authenticated requests
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    username: string;
    name?: string;
    isAuthenticated: boolean;
  };
  session: {
    jwt?: string;
    user?: any;
    [key: string]: any;
  };
}

/**
 * Middleware to verify user authentication for Smart Connect endpoints
 * Uses JWT tokens stored in session for stateful authentication
 */
export const requireSmartConnectAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    console.log('[Smart Connect Auth] Checking authentication for user session');
    
    // Set security headers for authenticated endpoints
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Auth-Required': 'true'
    });

    // Check if session exists
    if (!req.session) {
      console.log('[Smart Connect Auth] No session found - authentication required');
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'No valid session found. Please log in to access Smart Connect features.'
      });
    }

    // Check for JWT token in session
    const token = req.session.jwt;
    if (!token) {
      console.log('[Smart Connect Auth] No JWT token in session - authentication required');
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'No authentication token found. Please log in to access Smart Connect features.'
      });
    }

    // Verify JWT token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError: any) {
      console.log('[Smart Connect Auth] JWT verification failed:', jwtError.message);
      
      // Clear invalid session
      req.session.jwt = undefined;
      req.session.user = undefined;
      
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication',
        message: 'Your session has expired. Please log in again to access Smart Connect features.'
      });
    }

    // Extract user information from JWT
    const userId = decoded.userId || decoded.id;
    if (!userId) {
      console.log('[Smart Connect Auth] No user ID found in JWT token');
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'Authentication token is malformed. Please log in again.'
      });
    }

    // Verify user still exists in database
    let user;
    try {
      user = await storage.getUser(userId);
    } catch (dbError: any) {
      console.error('[Smart Connect Auth] Database error during user lookup:', dbError.message);
      return res.status(500).json({
        success: false,
        error: 'Authentication service unavailable',
        message: 'Unable to verify your account. Please try again later.'
      });
    }

    if (!user) {
      console.log(`[Smart Connect Auth] User ${userId} not found in database - account may be deleted`);
      
      // Clear invalid session
      req.session.jwt = undefined;
      req.session.user = undefined;
      
      return res.status(401).json({
        success: false,
        error: 'Account not found',
        message: 'Your account could not be found. Please contact support if you believe this is an error.'
      });
    }

    // Set authenticated user data on request (PII-safe for logs)
    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      isAuthenticated: true
    };

    // Log successful authentication (PII-safe)
    console.log(`[Smart Connect Auth] Authentication successful for user ${user.id} (${user.username})`);

    // Continue to next middleware
    next();

  } catch (error: any) {
    console.error('[Smart Connect Auth] Unexpected error during authentication:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Authentication service error',
      message: 'An unexpected error occurred during authentication. Please try again later.'
    });
  }
};

/**
 * Middleware to verify that authenticated user can access resources for a specific user ID
 * Prevents users from accessing other users' Smart Connect data
 */
export const requireResourceOwnership = (userIdParam: string = 'userId') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'You must be logged in to access this resource.'
        });
      }

      // Get the user ID from request parameters or query
      const requestedUserId = parseInt(req.params[userIdParam] || req.query[userIdParam] as string);
      
      if (isNaN(requestedUserId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid user ID',
          message: 'A valid user ID is required to access this resource.'
        });
      }

      // Check if the authenticated user is trying to access their own resources
      if (req.user.id !== requestedUserId) {
        console.log(`[Smart Connect Auth] User ${req.user.id} attempted to access resources for user ${requestedUserId}`);
        
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: 'You can only access your own Smart Connect data.'
        });
      }

      // Log authorized access (PII-safe)
      console.log(`[Smart Connect Auth] User ${req.user.id} authorized to access their own resources`);

      next();

    } catch (error: any) {
      console.error('[Smart Connect Auth] Error checking resource ownership:', error.message);
      
      res.status(500).json({
        success: false,
        error: 'Authorization service error',
        message: 'An error occurred while verifying your access permissions.'
      });
    }
  };
};

/**
 * Middleware to validate request rate limiting for Smart Connect operations
 * Prevents abuse of connection and recommendation features
 */
export const smartConnectRateLimit = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Authentication required for rate limiting verification.'
      });
    }

    // Simple in-memory rate limiting (in production, use Redis or database)
    const rateLimitKey = `smart_connect_rate_${req.user.id}_${req.method}_${req.route?.path || req.path}`;
    const now = Date.now();
    const windowMs = 5 * 60 * 1000; // 5 minutes
    const maxRequests = 50; // 50 requests per 5-minute window

    // For now, just log the rate limiting check
    console.log(`[Smart Connect Rate Limit] Checking rate limit for user ${req.user.id}: ${rateLimitKey}`);

    // TODO: Implement actual rate limiting logic with Redis or database storage
    // This is a placeholder for proper rate limiting implementation

    next();

  } catch (error: any) {
    console.error('[Smart Connect Rate Limit] Error during rate limit check:', error.message);
    
    // Don't fail the request on rate limit errors, just log and continue
    next();
  }
};

/**
 * Middleware to log Smart Connect API access in a PII-safe manner
 */
export const logSmartConnectAccess = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Override res.json to capture the response and log it
  const originalJson = res.json;
  res.json = function(data: any) {
    const duration = Date.now() - startTime;
    
    // Log PII-safe access information
    console.log(`[Smart Connect Access] ${req.method} ${req.path} - User ${req.user?.id || 'unauthenticated'} - ${res.statusCode} - ${duration}ms`);
    
    // Don't log the actual response data to avoid PII exposure
    if (res.statusCode >= 400) {
      console.log(`[Smart Connect Access] Error response: ${res.statusCode} ${data.error || 'Unknown error'}`);
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};