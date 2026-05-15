import type { Express, Request, Response, NextFunction } from "express";
import { referralService } from "./services/referral-service";
import jwt from "jsonwebtoken";
import { pool } from "./db";

// In-memory cache for referral status to reduce database load
const referralStatusCache = new Map<number, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 30000; // 30 seconds cache TTL

function getCachedReferralStatus(userId: number): any | null {
  const cached = referralStatusCache.get(userId);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
    console.log(`[Cache] Referral status HIT for user ${userId}`);
    return cached.data;
  }
  return null;
}

function setCachedReferralStatus(userId: number, data: any): void {
  referralStatusCache.set(userId, { data, timestamp: Date.now() });
  console.log(`[Cache] Referral status cached for user ${userId}`);
}

// Invalidate cache when referral-related changes happen
export function invalidateReferralCache(userId: number): void {
  referralStatusCache.delete(userId);
  console.log(`[Cache] Referral status invalidated for user ${userId}`);
}

/**
 * Authentication middleware for referral routes
 * Extracts and validates user session
 */
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from cookie
    const token = req.cookies.brandentifier_session;
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Verify token
    const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
    
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: 'Invalid session' });
    }
    
    // Attach userId to request for use in route handlers
    (req as any).userId = decoded.userId;
    next();
  } catch (error) {
    console.error('[Auth Middleware] Error:', error);
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
};

/**
 * Referral System API Routes
 * Handles share-to-unlock mechanics
 */
export function registerReferralRoutes(app: Express) {
  
  /**
   * Generate referral link for current authenticated user
   * GET /api/referral/generate-link
   */
  app.get('/api/referral/generate-link', requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      
      // Build the base URL from the request
      const protocol = req.protocol || 'https';
      const host = req.get('host') || 'brandentify.replit.app';
      const baseUrl = `${protocol}://${host}`;
      
      console.log('[Referral] Generating link with baseUrl:', baseUrl);
      
      const result = await referralService.generateReferralLink(userId, baseUrl);
      
      res.json({
        success: true,
        code: result.code,
        link: result.link
      });
    } catch (error: any) {
      console.error('[API] Generate referral link error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate referral link' });
    }
  });
  
  /**
   * Process referral signup (called during new user registration)
   * POST /api/referral/process-signup
   * Note: This is intentionally not auth-protected as it's called during signup
   */
  app.post('/api/referral/process-signup', async (req, res) => {
    try {
      const { referralCode, newUserId } = req.body;
      
      if (!referralCode || !newUserId) {
        return res.status(400).json({ error: 'Referral code and new user ID are required' });
      }
      
      const success = await referralService.processReferralSignup(referralCode, newUserId);
      
      res.json({
        success,
        message: success ? 'Referral processed successfully' : 'Referral could not be processed'
      });
    } catch (error: any) {
      console.error('[API] Process referral signup error:', error);
      res.status(500).json({ error: error.message || 'Failed to process referral' });
    }
  });
  
  /**
   * Initialize default unlocks for current authenticated user
   * POST /api/referral/initialize-unlocks
   * Note: Called automatically after user registration
   */
  app.post('/api/referral/initialize-unlocks', requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      
      await referralService.initializeDefaultUnlocks(userId);
      
      res.json({
        success: true,
        message: 'Default unlocks initialized'
      });
    } catch (error: any) {
      console.error('[API] Initialize unlocks error:', error);
      res.status(500).json({ error: error.message || 'Failed to initialize unlocks' });
    }
  });
  
  /**
   * Get current authenticated user's unlock status and progress
   * GET /api/referral/status
   */
  app.get('/api/referral/status', requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      console.log(`[API] GET /api/referral/status - userId: ${userId}`);
      
      // Check cache first for fast response
      const cachedResponse = getCachedReferralStatus(userId);
      if (cachedResponse) {
        return res.json(cachedResponse);
      }
      
      // Fetch user's subscription tier from database
      const userResult = await pool.query(
        `SELECT subscription_tier FROM users WHERE id = $1`,
        [userId]
      );
      
      const subscriptionTier = userResult.rows.length > 0 
        ? userResult.rows[0].subscription_tier || 'free'
        : 'free';
      
      console.log(`[API] User ${userId} subscriptionTier: ${subscriptionTier}`);
      
      const status = await referralService.getAvailabilityStatus(userId, subscriptionTier);
      
      console.log(`[API] Referral status response for user ${userId}:`, {
        quantumCardsCount: status.quantumCards.length,
        portfoliosCount: status.portfolios.length,
        progress: status.progress
      });
      
      const response = {
        success: true,
        ...status
      };
      
      // Cache the response for future requests
      setCachedReferralStatus(userId, response);
      
      res.json(response);
    } catch (error: any) {
      console.error('[API] Get referral status error:', error);
      res.status(500).json({ error: error.message || 'Failed to get referral status' });
    }
  });
  
  /**
   * Validate referral code (check if valid before signup)
   * GET /api/referral/validate-code/:code
   * Note: Not auth-protected as it's checked before signup
   */
  app.get('/api/referral/validate-code/:code', async (req, res) => {
    try {
      const { code } = req.params;
      
      if (!code) {
        return res.status(400).json({ error: 'Referral code is required' });
      }
      
      const isValid = await referralService.validateReferralCode(code);
      
      if (!isValid) {
        return res.status(404).json({
          success: false,
          valid: false,
          message: 'Referral code not found or invalid'
        });
      }
      
      res.json({
        success: true,
        valid: true,
        message: 'Referral code is valid'
      });
    } catch (error: any) {
      console.error('[API] Validate referral code error:', error);
      res.status(500).json({ error: error.message || 'Failed to validate referral code' });
    }
  });
  
  console.log('[Referral Routes] Registered successfully');
}

