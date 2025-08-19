import { Router, Request, Response } from 'express';
import { storage } from './storage';

const router = Router();

/**
 * Demo Sign-in Route
 * Provides authentication bypass when Firebase OAuth fails
 */
router.post('/auth/demo-signin', async (req: Request, res: Response) => {
  try {
    const { email, name, authProvider } = req.body;
    
    console.log('Demo sign-in request:', { email, name, authProvider });
    
    // Check if user already exists
    let user = await storage.getUserByEmail(email);
    
    if (!user) {
      // Create new demo user
      const userData = {
        username: email.split('@')[0] + '_demo_' + Date.now(),
        email,
        password: 'demo_password', // This will be hashed
        firstName: name.split(' ')[0] || 'Demo',
        lastName: name.split(' ')[1] || 'User',
        authProvider: authProvider || 'demo',
        isDemoUser: true,
        profileComplete: false
      };
      
      user = await storage.createUser(userData);
      console.log('Created new demo user:', user.id);
    } else {
      console.log('Using existing user:', user.id);
    }
    
    // Generate demo session token
    const sessionToken = 'demo_session_' + Date.now() + '_' + user.id;
    
    res.json({
      success: true,
      message: 'Demo authentication successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isDemoUser: true,
        authProvider: 'demo'
      },
      token: sessionToken,
      redirectUrl: '/industry-pulse'
    });
    
  } catch (error) {
    console.error('Demo sign-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Demo authentication failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;