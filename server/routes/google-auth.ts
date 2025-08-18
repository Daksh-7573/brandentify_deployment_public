import { Router } from 'express';
import { storage } from '../storage';
import jwt from 'jsonwebtoken';

const router = Router();

// JWT secret (in production, use a proper secret from environment)
const JWT_SECRET = process.env.JWT_SECRET || 'brandentifier-secret-key';

/**
 * Google Authentication Endpoint
 * Processes Google OAuth user data and creates/updates Brandentifier user accounts
 */
router.post('/google-login', async (req, res) => {
  try {
    console.log('Google login attempt:', req.body);
    
    const { email, name, photoURL, googleId, provider } = req.body;

    // Validate required fields
    if (!email || !googleId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required authentication data'
      });
    }

    // Check if user already exists by email
    let user = await storage.getUserByEmail(email);
    
    if (user) {
      console.log('Existing user found:', user.email);
      
      // Update user with Google data if not already set
      const updateData: any = {};
      if (!user.photoURL && photoURL) updateData.photoURL = photoURL;
      if (!user.name && name) updateData.name = name;
      
      if (Object.keys(updateData).length > 0) {
        console.log('Updating user with Google data:', updateData);
        user = await storage.updateUser(user.id, updateData);
      }
    } else {
      console.log('Creating new user:', email);
      
      // Generate username from email
      const username = email.split('@')[0].toLowerCase() + Math.random().toString(36).substring(2, 6);
      
      // Create new user
      user = await storage.createUser({
        username,
        email,
        name: name || email.split('@')[0],
        photoURL: photoURL || null,
        password: null, // Google OAuth users don't have passwords
        emailVerified: true, // Google accounts are pre-verified
        title: 'Professional', // Default title
        industry: 'Technology', // Default industry
        lookingFor: 'Networking', // Default networking preference
        profileCompleted: 25 // Basic profile completion
      });
      
      console.log('Created new user:', user.id);
    }

    // Generate JWT token for session management
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '7d' } // Token valid for 7 days
    );

    // Set HTTP-only cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax'
    });

    console.log('Authentication successful for user:', user.id);

    // Return user data (without sensitive info)
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        photoURL: user.photoURL,
        username: user.username,
        title: user.title,
        industry: user.industry,
        profileCompleted: user.profileCompleted
      },
      message: 'Authentication successful'
    });

  } catch (error: any) {
    console.error('Google authentication error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * Check Authentication Status
 * Verifies JWT token and returns current user data
 */
router.get('/status', async (req, res) => {
  try {
    const token = req.cookies.auth_token;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        authenticated: false,
        message: 'No authentication token'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Get fresh user data
    const user = await storage.getUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        authenticated: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        photoURL: user.photoURL,
        username: user.username,
        title: user.title,
        industry: user.industry,
        profileCompleted: user.profileCompleted
      }
    });

  } catch (error: any) {
    console.error('Auth status check error:', error);
    
    res.status(401).json({
      success: false,
      authenticated: false,
      message: 'Invalid authentication token'
    });
  }
});

/**
 * Logout Endpoint
 * Clears authentication cookie
 */
router.post('/logout', (req, res) => {
  res.clearCookie('auth_token');
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

export default router;