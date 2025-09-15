import { Router } from 'express';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import type { CookieOptions } from 'express';

const router = Router();

// Types for OAuth and sessions
interface OAuthState {
  state: string;
  timestamp: number;
  redirectUrl?: string;
}

interface UserSession {
  userId: number;
  email: string;
  name: string;
  photoURL?: string;
  timestamp: number;
}

// In-memory storage (use Redis in production)
const oauthStates = new Map<string, OAuthState>();
const userSessions = new Map<string, UserSession>();

// Configuration
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
const OAUTH_STATE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const SESSION_COOKIE_NAME = 'auth_session';

// Google OAuth configuration
const getGoogleOAuthConfig = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET environment variables');
  }
  
  return { clientId, clientSecret };
};

// Get base URL for redirects
const getBaseUrl = (req: any) => {
  const protocol = req.get('X-Forwarded-Proto') || req.protocol || 'https';
  const host = req.get('Host') || req.headers.host;
  return `${protocol}://${host}`;
};

// Cookie configuration
const getCookieOptions = (req: any): CookieOptions => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isHttps = req.get('X-Forwarded-Proto') === 'https' || req.protocol === 'https';
  
  return {
    httpOnly: true,
    secure: isProduction && isHttps,
    sameSite: 'lax',
    maxAge: SESSION_EXPIRY_MS,
    path: '/'
  };
};

// Cleanup expired data
const cleanup = () => {
  const now = Date.now();
  
  for (const [key, state] of Array.from(oauthStates.entries())) {
    if (now - state.timestamp > OAUTH_STATE_EXPIRY_MS) {
      oauthStates.delete(key);
    }
  }
  
  for (const [sessionId, session] of Array.from(userSessions.entries())) {
    if (now - session.timestamp > SESSION_EXPIRY_MS) {
      userSessions.delete(sessionId);
    }
  }
};

// Run cleanup every 5 minutes
setInterval(cleanup, 5 * 60 * 1000);

// Get Google OAuth URL
router.get('/api/auth/google/url', async (req, res) => {
  try {
    const { clientId } = getGoogleOAuthConfig();
    const baseUrl = getBaseUrl(req);
    const redirectUri = `${baseUrl}/api/auth/google/callback`;
    
    // Generate CSRF state
    const state = crypto.randomBytes(32).toString('hex');
    const redirectUrl = (req.query.redirect as string) || '/';
    
    // Store state
    oauthStates.set(state, {
      state,
      timestamp: Date.now(),
      redirectUrl
    });
    
    // Build Google OAuth URL
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid profile email',
      state: state,
      access_type: 'online',
      prompt: 'select_account'
    });
    
    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    
    res.json({ 
      success: true, 
      oauthUrl,
      state 
    });
  } catch (error) {
    console.error('Error generating Google OAuth URL:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate OAuth URL' 
    });
  }
});

// Handle Google OAuth callback
router.get('/api/auth/google/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;
    
    if (error) {
      console.error('OAuth error from Google:', error);
      return res.redirect('/?error=oauth_error');
    }
    
    if (!code || !state) {
      return res.redirect('/?error=missing_code_or_state');
    }
    
    // Verify state
    const storedState = oauthStates.get(state as string);
    if (!storedState) {
      console.error('Invalid or expired OAuth state:', state);
      return res.redirect('/?error=invalid_state');
    }
    
    oauthStates.delete(state as string);
    
    const { clientId, clientSecret } = getGoogleOAuthConfig();
    const baseUrl = getBaseUrl(req);
    const redirectUri = `${baseUrl}/api/auth/google/callback`;
    
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code as string,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });
    
    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', await tokenResponse.text());
      return res.redirect('/?error=token_exchange_failed');
    }
    
    const tokens = await tokenResponse.json();
    
    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });
    
    if (!userResponse.ok) {
      console.error('Failed to get user info:', await userResponse.text());
      return res.redirect('/?error=user_info_failed');
    }
    
    const googleUser = await userResponse.json();
    
    // Find or create user in database
    let user = await db.select().from(users).where(eq(users.email, googleUser.email)).limit(1);
    
    if (user.length === 0) {
      // Create new user
      const [newUser] = await db.insert(users).values({
        email: googleUser.email,
        name: googleUser.name,
        photoURL: googleUser.picture,
        authProvider: 'google',
        googleId: googleUser.id,
      }).returning();
      
      user = [newUser];
    } else {
      // Update existing user
      await db.update(users)
        .set({
          name: googleUser.name,
          photoURL: googleUser.picture,
          googleId: googleUser.id,
        })
        .where(eq(users.id, user[0].id));
      
      user[0] = { ...user[0], name: googleUser.name, photoURL: googleUser.picture };
    }
    
    // Create session
    const sessionId = crypto.randomBytes(32).toString('hex');
    userSessions.set(sessionId, {
      userId: user[0].id,
      email: user[0].email!,
      name: user[0].name!,
      photoURL: user[0].photoURL || undefined,
      timestamp: Date.now(),
    });
    
    // Set secure cookie
    res.cookie(SESSION_COOKIE_NAME, sessionId, getCookieOptions(req));
    
    // Redirect to app
    const redirectUrl = storedState.redirectUrl || '/';
    res.redirect(redirectUrl);
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect('/?error=callback_error');
  }
});

// Get current session
router.get('/api/auth/session', (req, res) => {
  try {
    const sessionId = req.cookies[SESSION_COOKIE_NAME];
    
    if (!sessionId) {
      return res.status(401).json({ 
        success: false, 
        error: 'No session found' 
      });
    }
    
    const session = userSessions.get(sessionId);
    
    if (!session) {
      res.clearCookie(SESSION_COOKIE_NAME);
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid session' 
      });
    }
    
    // Check if session is expired
    if (Date.now() - session.timestamp > SESSION_EXPIRY_MS) {
      userSessions.delete(sessionId);
      res.clearCookie(SESSION_COOKIE_NAME);
      return res.status(401).json({ 
        success: false, 
        error: 'Session expired' 
      });
    }
    
    // Update session timestamp
    session.timestamp = Date.now();
    
    res.json({
      success: true,
      user: {
        id: session.userId,
        email: session.email,
        name: session.name,
        photoURL: session.photoURL,
      }
    });
  } catch (error) {
    console.error('Session check error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
});

// Logout
router.post('/api/auth/logout', (req, res) => {
  try {
    const sessionId = req.cookies[SESSION_COOKIE_NAME];
    
    if (sessionId) {
      userSessions.delete(sessionId);
    }
    
    res.clearCookie(SESSION_COOKIE_NAME);
    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
});

export default router;