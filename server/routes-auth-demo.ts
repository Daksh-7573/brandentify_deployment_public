/**
 * Demo Auth Routes
 * 
 * This module provides alternative authentication methods that work
 * across all Replit domains without requiring external OAuth providers.
 */

import express, { Request, Response } from 'express';
import { storage } from './storage';

const router = express.Router();

/**
 * Demo login endpoint - works across all domains
 * Creates a user account with the given email and logs in
 */
// Set the trust proxy setting
router.use((req, res, next) => {
  req.app.set('trust proxy', true);
  next();
});

router.post("/auth/demo-login", async (req: Request, res: Response) => {
  try {
    // Try to get the demo account (email: demo@brandentifier.com)
    let user = await storage.getUserByEmail('demo@brandentifier.com');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Demo account not found. Please contact support.' 
      });
    }
    
    // Create session
    if ((req as any).session) {
      (req as any).session.userId = user.id;
      (req as any).session.user = user;
      
      // Save session explicitly
      await new Promise<void>((resolve, reject) => {
        (req as any).session!.save((err: any) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
    
    console.log(`✅ Demo login successful: ${user.name} (${user.email})`);
    
    return res.status(200).json({
      success: true,
      message: 'Demo login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        photoURL: user.photoURL
      }
    });
  } catch (error) {
    console.error('Error in demo login:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during demo login'
    });
  }
});

export default router;