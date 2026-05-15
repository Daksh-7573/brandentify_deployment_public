import type { Express, Request, Response, NextFunction } from "express";
import { pool } from "./db";
import jwt from "jsonwebtoken";

/**
 * Authentication middleware - allows both authenticated and anonymous users
 * Extracts user ID if logged in, otherwise allows null viewerId
 */
const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.brandentifier_session;
    
    if (token) {
      const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
      
      if (decoded && decoded.userId) {
        (req as any).userId = decoded.userId;
      }
    }
    
    next();
  } catch (error) {
    // Token invalid or expired, continue as anonymous user
    next();
  }
};

/**
 * Share Tracking API Routes
 * Handles quantum card share open tracking and unlock rewards
 */
export function registerShareTrackingRoutes(app: Express) {
  
  /**
   * Track quantum card share link open
   * POST /api/share/quantum-open
   * 
   * When someone opens a shared quantum card link with ?ref={userId},
   * this endpoint:
   * 1. Prevents self-referral
   * 2. Prevents duplicate rewards
   * 3. Records the share event
   * 4. Unlocks quantum cards for the sharer
   */
  app.post('/api/share/quantum-open', optionalAuth, async (req, res) => {
    const client = await pool.connect();
    
    try {
      const { refUser, cardId } = req.body;
      const viewerId = (req as any).userId || null;
      
      console.log('[Share Tracking] POST /api/share/quantum-open', { refUser, cardId, viewerId });
      
      // Validation
      if (!refUser) {
        return res.status(400).json({ success: false, error: 'No ref parameter provided' });
      }
      
      // 1. Prevent self-referral (only if viewer is logged in)
      if (viewerId && viewerId === parseInt(refUser)) {
        console.log('[Share Tracking] Self-referral blocked', { viewerId, refUser });
        return res.json({ success: true, message: 'Self-referral blocked' });
      }
      
      // 2. Check if this exact combination was already tracked
      const existingCheck = await client.query(
        `SELECT id, reward_granted FROM share_events 
         WHERE ref_user = $1 AND (viewer_id = $2 OR $2 IS NULL) AND card_id = $3`,
        [refUser, viewerId, cardId || null]
      );
      
      if (existingCheck.rows.length > 0) {
        console.log('[Share Tracking] Duplicate share event detected', existingCheck.rows[0]);
        return res.json({ 
          success: true, 
          message: 'Already counted',
          alreadyRewarded: existingCheck.rows[0].reward_granted 
        });
      }
      
      // 3. Record the share event
      await client.query('BEGIN');
      
      const insertResult = await client.query(
        `INSERT INTO share_events (ref_user, viewer_id, card_id, reward_granted)
         VALUES ($1, $2, $3, true)
         RETURNING id`,
        [refUser, viewerId, cardId || null]
      );
      
      const shareEventId = insertResult.rows[0].id;
      console.log('[Share Tracking] Share event recorded', { shareEventId, refUser, viewerId, cardId });
      
      // 4. Grant unlock reward to the sharer
      // Get current share count for this user
      const shareCountResult = await client.query(
        `SELECT COUNT(*) as count FROM share_events 
         WHERE ref_user = $1 AND reward_granted = true`,
        [refUser]
      );
      
      const shareCount = parseInt(shareCountResult.rows[0].count);
      console.log('[Share Tracking] Share count for user', { refUser, shareCount });
      
      // Unlock logic: 1 share = unlock 1st premium card, 2 shares = 2nd, etc.
      // Available premium cards in order (excluding free 'professional' and 'quantum')
      const PREMIUM_QUANTUM_CARDS = [
        '3d-animated',
        'holographic',
        'neoglow',
        'creative',
        'glassmorphism',
        'minimalist',
        'vibrant',
        'elegant',
        'cosmic',
        'retro'
      ];
      
      // Determine which card to unlock based on share count
      const cardToUnlock = PREMIUM_QUANTUM_CARDS[shareCount - 1]; // shareCount is 1-indexed
      
      if (cardToUnlock) {
        // Check if user already has this specific unlock
        const existingUnlock = await client.query(
          `SELECT id FROM user_unlocks 
           WHERE user_id = $1 AND unlock_type = 'quantum_card' AND unlock_id = $2`,
          [refUser, cardToUnlock]
        );
        
        if (existingUnlock.rows.length === 0) {
          // Grant the unlock
          await client.query(
            `INSERT INTO user_unlocks (user_id, unlock_type, unlock_id, unlock_source)
             VALUES ($1, 'quantum_card', $2, 'share')`,
            [refUser, cardToUnlock]
          );
          
          console.log('[Share Tracking] ✅ Quantum Card unlocked', { 
            refUser, 
            unlockedCard: cardToUnlock,
            shareCount 
          });
        } else {
          console.log('[Share Tracking] Card already unlocked', { refUser, cardToUnlock });
        }
      } else {
        console.log('[Share Tracking] All cards already unlocked', { refUser, shareCount });
      }
      
      await client.query('COMMIT');
      
      res.json({ 
        success: true, 
        message: 'Share tracked and reward granted',
        shareCount,
        unlockedCard: cardToUnlock || 'all_unlocked'
      });
      
    } catch (error: any) {
      await client.query('ROLLBACK');
      console.error('[Share Tracking] Error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to track share' 
      });
    } finally {
      client.release();
    }
  });
  
  /**
   * Get share statistics for a user
   * GET /api/share/stats
   */
  app.get('/api/share/stats', optionalAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      // Get total shares and unlocked cards
      const statsResult = await pool.query(
        `SELECT 
          COUNT(*) as total_shares,
          COUNT(CASE WHEN reward_granted = true THEN 1 END) as rewarded_shares
         FROM share_events
         WHERE ref_user = $1`,
        [userId]
      );
      
      const unlocksResult = await pool.query(
        `SELECT unlock_id FROM user_unlocks
         WHERE user_id = $1 AND unlock_type = 'quantum_card' AND unlock_source = 'share'
         ORDER BY unlocked_at DESC`,
        [userId]
      );
      
      res.json({
        success: true,
        totalShares: parseInt(statsResult.rows[0].total_shares),
        rewardedShares: parseInt(statsResult.rows[0].rewarded_shares),
        unlockedCards: unlocksResult.rows.map(r => r.unlock_id)
      });
      
    } catch (error: any) {
      console.error('[Share Tracking] Get stats error:', error);
      res.status(500).json({ error: error.message || 'Failed to get share stats' });
    }
  });
  
  console.log('[Share Tracking Routes] Registered successfully');
}
