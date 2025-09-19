/**
 * JWT Token Refresh Routes
 * 
 * Implements secure token refresh functionality for both cookie and localStorage-based authentication
 * with comprehensive security measures and rate limiting
 */

import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { storage } from './storage';
import rateLimit from 'express-rate-limit';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');

// Rate limiting for token refresh - more restrictive than regular API calls
const tokenRefreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Only 10 refresh attempts per IP per 15 minutes
  message: {
    success: false,
    error: 'Too many token refresh attempts',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: 15 * 60 // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// In-memory blacklist for invalidated tokens (in production, use Redis)
const tokenBlacklist = new Set<string>();

// Clean up expired blacklisted tokens every hour
setInterval(() => {
  // Since we can't easily check token expiry without decoding each token,
  // we'll clear the entire blacklist every 24 hours to prevent memory leaks
  // In production, use Redis with TTL
  if (tokenBlacklist.size > 1000) {
    console.log(`🧹 [TOKEN-REFRESH] Clearing token blacklist (${tokenBlacklist.size} tokens)`);
    tokenBlacklist.clear();
  }
}, 60 * 60 * 1000);

/**
 * Validate if a token is blacklisted
 */
function isTokenBlacklisted(token: string): boolean {
  return tokenBlacklist.has(token);
}

/**
 * Add token to blacklist
 */
function blacklistToken(token: string): void {
  tokenBlacklist.add(token);
  console.log('🚫 [TOKEN-REFRESH] Token blacklisted');
}

/**
 * Extract and validate JWT token from request
 */
function extractAndValidateToken(req: Request): { token: string; decoded: any; source: 'cookie' | 'bearer' } | null {
  let token: string | null = null;
  let source: 'cookie' | 'bearer' = 'cookie';
  
  // Try cookie first (primary auth method)
  const cookieToken = req.cookies?.brandentifier_session;
  if (cookieToken) {
    token = cookieToken;
    source = 'cookie';
  }
  
  // If no cookie, try Bearer token (localStorage auth)
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      source = 'bearer';
    }
  }
  
  if (!token) {
    return null;
  }
  
  // Check if token is blacklisted
  if (isTokenBlacklisted(token)) {
    console.warn('❌ [TOKEN-REFRESH] Attempted to refresh blacklisted token');
    return null;
  }
  
  try {
    // Verify token signature and get payload
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (!decoded || !decoded.userId) {
      return null;
    }
    
    return { token, decoded, source };
    
  } catch (error) {
    console.warn('❌ [TOKEN-REFRESH] Token validation failed:', error.message);
    return null;
  }
}

/**
 * Generate new JWT token with extended expiry
 */
function generateNewToken(userId: number, userEmail: string, userName: string): string {
  const tokenPayload = {
    userId: userId,
    email: userEmail,
    name: userName,
    authProvider: 'google',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
  };
  
  return jwt.sign(tokenPayload, JWT_SECRET, { algorithm: 'HS256' });
}

/**
 * POST /api/auth/refresh-token
 * Refresh JWT token with proper validation and security checks
 */
router.post('/refresh-token', tokenRefreshLimiter, async (req: Request, res: Response) => {
  try {
    console.log('🔄 [TOKEN-REFRESH] Processing token refresh request');
    
    // Set security headers
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });
    
    // Extract and validate current token
    const tokenData = extractAndValidateToken(req);
    
    if (!tokenData) {
      console.warn('❌ [TOKEN-REFRESH] No valid token found for refresh');
      return res.status(401).json({
        success: false,
        error: 'Invalid or missing authentication token',
        code: 'INVALID_TOKEN'
      });
    }
    
    const { token: currentToken, decoded, source } = tokenData;
    const userId = decoded.userId;
    
    console.log(`🔄 [TOKEN-REFRESH] Refreshing token for user ${userId} (source: ${source})`);
    
    // Verify user still exists and is active
    const user = await storage.getUser(userId);
    
    if (!user) {
      console.warn(`❌ [TOKEN-REFRESH] User ${userId} not found during refresh`);
      blacklistToken(currentToken);
      
      return res.status(401).json({
        success: false,
        error: 'User account not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Check if token is close to expiry (refresh only if less than 2 days remaining)
    const currentTime = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = decoded.exp - currentTime;
    const twoDaysInSeconds = 2 * 24 * 60 * 60;
    
    if (timeUntilExpiry > twoDaysInSeconds) {
      console.log(`ℹ️ [TOKEN-REFRESH] Token for user ${userId} doesn't need refresh yet (${Math.floor(timeUntilExpiry / 60 / 60)} hours remaining)`);
      
      return res.json({
        success: true,
        message: 'Token is still valid',
        code: 'TOKEN_STILL_VALID',
        token: currentToken,
        expiresAt: new Date(decoded.exp * 1000).toISOString(),
        refreshNeeded: false
      });
    }
    
    // Generate new token
    const newToken = generateNewToken(user.id, user.email || '', user.name || '');
    
    // Blacklist old token to prevent reuse
    blacklistToken(currentToken);
    
    // Update user's last login time
    await storage.updateUser(user.id, {
      lastLoginAt: new Date()
    });
    
    console.log(`✅ [TOKEN-REFRESH] Token refreshed successfully for user ${userId}`);
    
    // Set new token in cookie if original was from cookie
    if (source === 'cookie') {
      const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
      const cookieOptions = {
        httpOnly: true,
        secure: isHttps,
        sameSite: 'lax' as const,
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      };
      
      res.cookie('brandentifier_session', newToken, cookieOptions);
      console.log(`🍪 [TOKEN-REFRESH] Updated session cookie for user ${userId}`);
    }
    
    // Return new token in response (for localStorage usage)
    const newDecoded = jwt.verify(newToken, JWT_SECRET) as any;
    
    res.json({
      success: true,
      message: 'Token refreshed successfully',
      token: newToken,
      expiresAt: new Date(newDecoded.exp * 1000).toISOString(),
      refreshNeeded: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        photoURL: user.photoURL
      }
    });
    
  } catch (error: any) {
    console.error('❌ [TOKEN-REFRESH] Error during token refresh:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error during token refresh',
      code: 'REFRESH_ERROR',
      message: 'An error occurred while refreshing your authentication token. Please sign in again.'
    });
  }
});

/**
 * POST /api/auth/validate-token
 * Validate current token and return user info if valid
 */
router.post('/validate-token', async (req: Request, res: Response) => {
  try {
    console.log('🔍 [TOKEN-VALIDATE] Processing token validation request');
    
    // Set security headers
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    // Extract and validate token
    const tokenData = extractAndValidateToken(req);
    
    if (!tokenData) {
      console.warn('❌ [TOKEN-VALIDATE] No valid token found');
      return res.status(401).json({
        success: false,
        valid: false,
        error: 'Invalid or missing authentication token'
      });
    }
    
    const { decoded } = tokenData;
    const userId = decoded.userId;
    
    // Verify user still exists
    const user = await storage.getUser(userId);
    
    if (!user) {
      console.warn(`❌ [TOKEN-VALIDATE] User ${userId} not found during validation`);
      return res.status(401).json({
        success: false,
        valid: false,
        error: 'User account not found'
      });
    }
    
    // Check if token is close to expiry
    const currentTime = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = decoded.exp - currentTime;
    const needsRefresh = timeUntilExpiry < (2 * 24 * 60 * 60); // Less than 2 days
    
    console.log(`✅ [TOKEN-VALIDATE] Token valid for user ${userId} (expires in ${Math.floor(timeUntilExpiry / 60 / 60)} hours)`);
    
    res.json({
      success: true,
      valid: true,
      needsRefresh,
      expiresAt: new Date(decoded.exp * 1000).toISOString(),
      timeUntilExpiry,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        photoURL: user.photoURL
      }
    });
    
  } catch (error: any) {
    console.error('❌ [TOKEN-VALIDATE] Error during token validation:', error);
    
    res.status(500).json({
      success: false,
      valid: false,
      error: 'Internal server error during token validation'
    });
  }
});

/**
 * POST /api/auth/logout-token
 * Invalidate current token (blacklist it)
 */
router.post('/logout-token', async (req: Request, res: Response) => {
  try {
    console.log('🚪 [TOKEN-LOGOUT] Processing token logout request');
    
    // Extract current token
    const tokenData = extractAndValidateToken(req);
    
    if (tokenData) {
      const { token, decoded } = tokenData;
      
      // Blacklist the token
      blacklistToken(token);
      
      console.log(`✅ [TOKEN-LOGOUT] Token blacklisted for user ${decoded.userId}`);
    }
    
    // Clear session cookie regardless
    res.clearCookie('brandentifier_session', {
      path: '/',
      httpOnly: true,
      secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
      sameSite: 'lax'
    });
    
    res.json({
      success: true,
      message: 'Token invalidated successfully'
    });
    
  } catch (error: any) {
    console.error('❌ [TOKEN-LOGOUT] Error during token logout:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error during logout'
    });
  }
});

/**
 * GET /api/auth/token-stats (Admin/Debug endpoint)
 * Get token refresh statistics
 */
router.get('/token-stats', async (req: Request, res: Response) => {
  try {
    // Basic auth check - only allow for development or admin users
    const isAdmin = process.env.NODE_ENV === 'development' || req.headers['x-admin-key'] === process.env.ADMIN_KEY;
    
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      stats: {
        blacklistedTokens: tokenBlacklist.size,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error getting token stats:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;