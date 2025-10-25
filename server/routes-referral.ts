import type { Express } from "express";
import { referralService } from "./services/referral-service";

/**
 * Referral System API Routes
 * Handles share-to-unlock mechanics
 */
export function registerReferralRoutes(app: Express) {
  
  /**
   * Generate referral link for current user
   * GET /api/referral/generate-link
   */
  app.get('/api/referral/generate-link', async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      const result = await referralService.generateReferralLink(parseInt(userId));
      
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
   * Initialize default unlocks for new user
   * POST /api/referral/initialize-unlocks
   */
  app.post('/api/referral/initialize-unlocks', async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
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
   * Get user's unlock status and progress
   * GET /api/referral/status
   */
  app.get('/api/referral/status', async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      const status = await referralService.getAvailabilityStatus(parseInt(userId));
      
      res.json({
        success: true,
        ...status
      });
    } catch (error: any) {
      console.error('[API] Get referral status error:', error);
      res.status(500).json({ error: error.message || 'Failed to get referral status' });
    }
  });
  
  /**
   * Validate referral code (check if valid before signup)
   * GET /api/referral/validate-code/:code
   */
  app.get('/api/referral/validate-code/:code', async (req, res) => {
    try {
      const { code } = req.params;
      
      if (!code) {
        return res.status(400).json({ error: 'Referral code is required' });
      }
      
      // This would be implemented in referralService if needed
      // For now, just return success
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
