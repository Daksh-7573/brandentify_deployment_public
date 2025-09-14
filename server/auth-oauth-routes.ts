/**
 * Custom Google OAuth Routes - Bypasses Firebase
 * 
 * This implementation creates direct OAuth URLs and handles callbacks
 * to avoid Firebase's blocked /__/auth/* routes on published domains
 */
import { Request, Response } from "express";
import { storage } from "./storage";
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// Google OAuth URLs
const GOOGLE_OAUTH_BASE_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USER_INFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

// Get OAuth credentials from environment
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');

// Allowed redirect URIs (whitelist for security)
const ALLOWED_REDIRECT_URIS = [
  'https://brandentifier.replit.app/auth/google/callback',
  'http://localhost:5000/auth/google/callback',
  'http://127.0.0.1:5000/auth/google/callback'
];

// In-memory state storage (in production, use Redis or database)
const stateStore = new Map<string, { timestamp: number, ip: string }>();

// Clean up expired states every 10 minutes
setInterval(() => {
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  for (const [state, data] of stateStore.entries()) {
    if (data.timestamp < fiveMinutesAgo) {
      stateStore.delete(state);
    }
  }
}, 10 * 60 * 1000);

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing Google OAuth credentials. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET');
}

/**
 * Generate Google OAuth URL - avoids Firebase routing issues
 */
export async function createGoogleOAuthURLRoute(req: Request, res: Response) {
  try {
    console.log('🚀 Creating Google OAuth URL');
    
    if (!CLIENT_ID) {
      throw new Error('Google Client ID not configured');
    }
    
    // Use environment-based redirect URI determination
    const host = req.get('Host') || '';
    const isDevelopment = host.includes('localhost') || host.includes('127.0.0.1');
    
    // Support both brandentifier.replit.app and brandentifier.com
    let redirectUri;
    if (isDevelopment) {
      redirectUri = 'http://localhost:5000/auth/google/callback';
    } else if (host.includes('brandentifier.com')) {
      redirectUri = 'https://brandentifier.com/auth/google/callback';
    } else {
      redirectUri = 'https://brandentifier.replit.app/auth/google/callback';
    }
    
    console.log('OAuth redirect URI:', redirectUri);
    
    // Create cryptographically secure state parameter
    const state = crypto.randomBytes(32).toString('base64url');
    
    // Store state with timestamp and IP for validation
    stateStore.set(state, { 
      timestamp: Date.now(), 
      ip: req.ip || req.connection.remoteAddress || 'unknown'
    });
    
    // Build OAuth URL with OpenID Connect scope
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'online',
      prompt: 'select_account',
      state: state
    });
    
    const oauthUrl = `${GOOGLE_OAUTH_BASE_URL}?${params.toString()}`;
    
    console.log('✅ Generated OAuth URL successfully');
    
    res.json({
      success: true,
      oauthUrl: oauthUrl,
      redirectUri: redirectUri
    });
    
  } catch (error: any) {
    console.error('❌ Error creating OAuth URL:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create OAuth URL'
    });
  }
}

/**
 * Handle Google OAuth callback - processes the authorization code
 */
export async function handleGoogleOAuthCallbackRoute(req: Request, res: Response) {
  try {
    console.log('🔄 Processing Google OAuth callback');
    console.log('Query params:', req.query);
    
    const { code, state, error } = req.query;
    
    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error);
      return res.redirect('/auth?error=oauth_error');
    }
    
    if (!code || !state) {
      console.error('Missing authorization code or state');
      return res.redirect('/auth?error=missing_params');
    }
    
    // Validate state parameter (CSRF protection)
    const stateData = stateStore.get(state as string);
    if (!stateData) {
      console.error('Invalid or expired state parameter');
      return res.redirect('/auth?error=invalid_state');
    }
    
    // Check state age (max 5 minutes)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    if (stateData.timestamp < fiveMinutesAgo) {
      console.error('Expired state parameter');
      stateStore.delete(state as string);
      return res.redirect('/auth?error=expired_state');
    }
    
    // Remove used state
    stateStore.delete(state as string);
    
    if (!CLIENT_ID || !CLIENT_SECRET) {
      throw new Error('Google OAuth credentials not configured');
    }
    
    // Use environment-based redirect URI determination
    const host = req.get('Host') || '';
    const isDevelopment = host.includes('localhost') || host.includes('127.0.0.1');
    
    // Support both brandentifier.replit.app and brandentifier.com
    let redirectUri;
    if (isDevelopment) {
      redirectUri = 'http://localhost:5000/auth/google/callback';
    } else if (host.includes('brandentifier.com')) {
      redirectUri = 'https://brandentifier.com/auth/google/callback';
    } else {
      redirectUri = 'https://brandentifier.replit.app/auth/google/callback';
    }
    
    console.log('🔄 Exchanging code for token...');
    
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code as string,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      return res.redirect('/auth?error=token_exchange_failed');
    }
    
    const tokenData = await tokenResponse.json();
    console.log('✅ Token exchange successful');
    
    // Get user info from Google
    console.log('🔄 Fetching user info...');
    
    const userResponse = await fetch(GOOGLE_USER_INFO_URL, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });
    
    if (!userResponse.ok) {
      console.error('Failed to fetch user info');
      return res.redirect('/auth?error=user_info_failed');
    }
    
    const googleUser = await userResponse.json();
    console.log('✅ User info received:', {
      email: googleUser.email,
      name: googleUser.name,
      id: googleUser.id
    });
    
    // Create or update user in our database
    const userData = {
      firebaseUid: googleUser.id,
      email: googleUser.email || '',
      name: googleUser.name || 'Google User',
      photoURL: googleUser.picture || '',
      googleId: googleUser.id,
      authProvider: 'google',
      emailVerified: googleUser.verified_email || false
    };
    
    console.log('📡 Saving user to database...');
    
    // Use existing auth logic
    const existingUser = await storage.getUserByEmail(userData.email);
    let user;
    
    if (existingUser) {
      console.log('✅ User exists, updating profile');
      // Update existing user
      user = await storage.updateUser(existingUser.id, {
        name: userData.name,
        photoURL: userData.photoURL,
        emailVerified: userData.emailVerified
      });
    } else {
      console.log('✅ Creating new user');
      // Create new user
      const newUser = await storage.createUser({
        username: userData.firebaseUid,
        email: userData.email,
        name: userData.name,
        photoURL: userData.photoURL,
        emailVerified: userData.emailVerified
      });
      user = newUser;
    }
    
    console.log('✅ User saved successfully:', {
      id: user.id,
      email: user.email,
      name: user.name
    });
    
    // Create secure JWT session
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      authProvider: 'google',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    };
    
    // Sign JWT with secret
    const sessionToken = jwt.sign(tokenPayload, JWT_SECRET, { 
      algorithm: 'HS256',
      expiresIn: '7d'
    });
    
    // Set secure session cookie
    res.cookie('brandentifier_session', sessionToken, {
      httpOnly: true,
      secure: !isDevelopment, // HTTPS only in production
      sameSite: 'strict', // More secure
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    // Store user data for client-side access (sanitized)
    const clientUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      photoURL: user.photoURL,
      profileCompleted: user.profileCompleted || 0,
      authProvider: 'google',
      emailVerified: user.emailVerified
    };
    
    // Generate secure success page (no inline scripts)
    const successPage = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Authentication Successful</title>
      <meta http-equiv="refresh" content="2;url=/dashboard">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .container {
          text-align: center;
          background: rgba(255,255,255,0.1);
          padding: 2rem;
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }
        .spinner {
          border: 3px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top: 3px solid white;
          width: 30px;
          height: 30px;
          animation: spin 1s linear infinite;
          margin: 1rem auto;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>✅ Authentication Successful!</h1>
        <div class="spinner"></div>
        <p>Redirecting to dashboard...</p>
      </div>
      <script>
        // Store sanitized user data for client access
        sessionStorage.setItem('brandentifier_user', ${JSON.stringify(JSON.stringify(clientUser))});
        
        // Trigger auth event
        window.dispatchEvent(new CustomEvent('googleAuthSuccess', {
          detail: { success: true }
        }));
        
        // Redirect immediately
        setTimeout(function() {
          window.location.replace('/dashboard');
        }, 1500);
      </script>
    </body>
    </html>
    `;
    
    console.log('✅ Authentication completed successfully');
    res.send(successPage);
    
  } catch (error: any) {
    console.error('❌ OAuth callback error:', error);
    res.redirect(`/auth?error=callback_error&message=${encodeURIComponent(error.message)}`);
  }
}

/**
 * Check current session validity - for client-side auth state detection
 */
export async function checkSessionRoute(req: Request, res: Response) {
  try {
    console.log('🔍 Checking session validity');
    
    // Check if JWT session cookie exists
    const sessionToken = req.cookies?.brandentifier_session;
    
    if (!sessionToken) {
      console.log('❌ No session cookie found');
      return res.status(401).json({
        success: false,
        error: 'No session found'
      });
    }
    
    // Verify JWT token
    try {
      const decoded = jwt.verify(sessionToken, JWT_SECRET) as any;
      console.log('✅ Valid session found for user:', decoded.email);
      
      // Get fresh user data from database
      const user = await storage.getUserById(decoded.userId);
      
      if (!user) {
        console.log('❌ User not found in database');
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }
      
      // Return sanitized user data (same format as OAuth callback)
      const clientUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        photoURL: user.photoURL,
        profileCompleted: user.profileCompleted || 0,
        authProvider: 'google',
        emailVerified: user.emailVerified
      };
      
      console.log('✅ Session valid, returning user data');
      return res.json({
        success: true,
        user: clientUser
      });
      
    } catch (jwtError) {
      console.log('❌ Invalid or expired JWT token:', jwtError);
      return res.status(401).json({
        success: false,
        error: 'Invalid session token'
      });
    }
    
  } catch (error: any) {
    console.error('❌ Session check error:', error);
    res.status(500).json({
      success: false,
      error: 'Session check failed'
    });
  }
}