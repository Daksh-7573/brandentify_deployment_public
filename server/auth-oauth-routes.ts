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

// Allowed redirect URIs (whitelist for security) - Using API routes to avoid client route collision
const ALLOWED_REDIRECT_URIS = [
  'https://brandentifier.replit.app/api/auth/google/callback',
  'https://brandentifier.com/api/auth/google/callback',
  'http://localhost:5000/api/auth/google/callback',
  'http://127.0.0.1:5000/api/auth/google/callback',
  // Current Replit preview domain
  'https://25d68c5d-166d-4f92-b5c1-cdfc68146e33-00-2kol6l2kz9i0s.picard.replit.dev/api/auth/google/callback'
];

// Popup-specific redirect URIs (never set cookies)
const POPUP_REDIRECT_URIS = [
  'https://brandentifier.replit.app/api/auth/google/callback-popup',
  'https://brandentifier.com/api/auth/google/callback-popup',
  'http://localhost:5000/api/auth/google/callback-popup',
  'http://127.0.0.1:5000/api/auth/google/callback-popup',
  // Current Replit preview domain
  'https://25d68c5d-166d-4f92-b5c1-cdfc68146e33-00-2kol6l2kz9i0s.picard.replit.dev/api/auth/google/callback-popup'
];

// Improved domain pattern matching for Replit environments
const REPLIT_DOMAIN_PATTERNS = [
  /^[a-zA-Z0-9-]+\.replit\.app$/,                    // Published domains like brandentifier.replit.app
  /^[a-zA-Z0-9-]+\.replit\.dev$/,                    // Preview domains like simple.replit.dev
  /^[a-f0-9-]+\.picard\.replit\.dev$/,               // Basic picard preview pattern
  /^[a-f0-9-]+-[a-f0-9-]+-[a-zA-Z0-9-]+\.picard\.replit\.dev$/ // Full picard subdomain pattern like 25d68c5d-166d-4f92-b5c1-cdfc68146e33-00-2kol6l2kz9i0s.picard.replit.dev
];

// In-memory state storage (in production, use Redis or database)
const stateStore = new Map<string, { timestamp: number, ip: string }>();

// Session exchange code storage for cross-domain handoff
interface SessionExchangeData {
  sessionToken: string;
  timestamp: number;
  returnHost: string;
  userId: number;
}

const sessionExchangeStore = new Map<string, SessionExchangeData>();

// Clean up expired states and session exchange codes every 5 minutes
setInterval(() => {
  const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  
  // Clean up expired OAuth states (15 minutes)
  let deletedStateCount = 0;
  for (const [state, data] of Array.from(stateStore.entries())) {
    if (data.timestamp < fifteenMinutesAgo) {
      stateStore.delete(state);
      deletedStateCount++;
    }
  }
  if (deletedStateCount > 0) {
    console.log(`🧹 [STATE-CLEANUP] Removed ${deletedStateCount} expired OAuth states`);
  }
  
  // Clean up expired session exchange codes (5 minutes)
  let deletedExchangeCount = 0;
  for (const [code, data] of Array.from(sessionExchangeStore.entries())) {
    if (data.timestamp < fiveMinutesAgo) {
      sessionExchangeStore.delete(code);
      deletedExchangeCount++;
    }
  }
  if (deletedExchangeCount > 0) {
    console.log(`🧹 [EXCHANGE-CLEANUP] Removed ${deletedExchangeCount} expired session exchange codes`);
  }
}, 5 * 60 * 1000);

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing Google OAuth credentials. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET');
}

/**
 * Generate Google OAuth URL for popup authentication - uses dedicated popup callback
 */
export async function createGoogleOAuthPopupURLRoute(req: Request, res: Response) {
  try {
    console.log('🚀 Creating Google OAuth Popup URL');
    console.log('🔍 [DEBUG] Client ID (first 8 chars):', CLIENT_ID?.substring(0, 8) + '...');
    
    // Set cache control headers for auth endpoint
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });
    
    if (!CLIENT_ID) {
      throw new Error('Google Client ID not configured');
    }
    
    // Use popup-specific redirect URI
    const host = req.get('Host') || '';
    const isDevelopment = host.includes('localhost') || host.includes('127.0.0.1');
    const isReplitDomain = REPLIT_DOMAIN_PATTERNS.some(pattern => pattern.test(host));
    const isBrandentifierCom = host.includes('brandentifier.com');
    
    console.log('🌐 [POPUP-OAUTH-URL] Domain analysis:', {
      host,
      isDevelopment,
      isReplitDomain,
      isBrandentifierCom
    });
    
    let popupRedirectUri;
    
    if (isDevelopment) {
      popupRedirectUri = 'http://localhost:5000/api/auth/google/callback-popup';
    } else if (isBrandentifierCom) {
      popupRedirectUri = 'https://brandentifier.com/api/auth/google/callback-popup';
    } else if (isReplitDomain) {
      if (host.includes('.picard.replit.dev') || host.includes('.replit.dev')) {
        popupRedirectUri = `https://${host}/api/auth/google/callback-popup`;
      } else {
        popupRedirectUri = 'https://brandentifier.replit.app/api/auth/google/callback-popup';
      }
    } else {
      console.log('⚠️ [POPUP-OAUTH-URL] Unknown domain, using current host as fallback');
      popupRedirectUri = `https://${host}/api/auth/google/callback-popup`;
    }
    
    console.log('✅ [POPUP-OAUTH-URL] Selected popup redirect URI:', popupRedirectUri);
    
    // Create state for popup (simplified)
    const stateData = {
      nonce: crypto.randomBytes(16).toString('base64url'),
      returnHost: host,
      timestamp: Date.now(),
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      popup: true // Mark as popup request
    };
    
    const state = Buffer.from(JSON.stringify(stateData)).toString('base64url');
    stateStore.set(state, { 
      timestamp: Date.now(), 
      ip: req.ip || req.connection.remoteAddress || 'unknown'
    });
    
    // Build OAuth URL for popup
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: popupRedirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'online',
      prompt: 'select_account',
      state: state
    });
    
    const oauthUrl = `${GOOGLE_OAUTH_BASE_URL}?${params.toString()}`;
    
    console.log('✅ Generated popup OAuth URL successfully');
    
    res.json({
      success: true,
      oauthUrl: oauthUrl,
      redirectUri: popupRedirectUri
    });
    
  } catch (error: any) {
    console.error('❌ [POPUP-OAUTH-URL-ERROR] Error creating popup OAuth URL:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to start popup authentication. Please try again.',
      errorCode: 'POPUP_OAUTH_URL_CREATION_FAILED',
      canRetry: true
    });
  }
}

/**
 * Generate Google OAuth URL - avoids Firebase routing issues
 */
export async function createGoogleOAuthURLRoute(req: Request, res: Response) {
  try {
    console.log('🚀 Creating Google OAuth URL');
    console.log('🔍 [DEBUG] Client ID (first 8 chars):', CLIENT_ID?.substring(0, 8) + '...');
    
    // Set cache control headers for auth endpoint
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });
    
    if (!CLIENT_ID) {
      throw new Error('Google Client ID not configured');
    }
    
    // Enhanced environment-based redirect URI determination with better domain handling
    const host = req.get('Host') || '';
    const isDevelopment = host.includes('localhost') || host.includes('127.0.0.1');
    const isReplitDomain = REPLIT_DOMAIN_PATTERNS.some(pattern => pattern.test(host));
    const isBrandentifierCom = host.includes('brandentifier.com');
    
    console.log('🌐 [OAUTH-URL] Domain analysis:', {
      host,
      isDevelopment,
      isReplitDomain,
      isBrandentifierCom,
      matchedPattern: REPLIT_DOMAIN_PATTERNS.find(pattern => pattern.test(host))?.toString()
    });
    
    // Use static redirect URI for all non-localhost domains (Google OAuth requirement)
    // Store original host in state for post-auth redirect
    let redirectUri;
    let returnHost = host;
    
    if (isDevelopment) {
      redirectUri = 'http://localhost:5000/api/auth/google/callback';
    } else if (isBrandentifierCom) {
      redirectUri = 'https://brandentifier.com/api/auth/google/callback';
    } else if (isReplitDomain) {
      // FIXED: For preview domains, use the current domain to avoid non-existent brandentifier.replit.app
      // For published domains, still use stable redirect URI
      if (host.includes('.picard.replit.dev') || host.includes('.replit.dev')) {
        // Preview domain: use current domain
        redirectUri = `https://${host}/api/auth/google/callback`;
      } else {
        // Published domain: use stable redirect URI
        redirectUri = 'https://brandentifier.replit.app/api/auth/google/callback';
      }
    } else {
      // Fallback for unknown domains - use current host if HTTPS
      console.log('⚠️ [OAUTH-URL] Unknown domain, using current host as fallback');
      redirectUri = `https://${host}/api/auth/google/callback`;
    }
    
    console.log('✅ [OAUTH-URL] Selected redirect URI:', redirectUri);
    
    // Create cryptographically secure state parameter with return host
    const stateData = {
      nonce: crypto.randomBytes(16).toString('base64url'),
      returnHost: returnHost,
      timestamp: Date.now(),
      ip: req.ip || req.connection.remoteAddress || 'unknown'
    };
    
    const state = Buffer.from(JSON.stringify(stateData)).toString('base64url');
    
    // Store state for validation (simplified since data is in state)
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
    console.error('❌ [OAUTH-URL-ERROR] Error creating OAuth URL:', {
      errorMessage: error.message,
      errorStack: error.stack,
      host: req.get('host'),
      userAgent: req.get('user-agent'),
      timestamp: new Date().toISOString()
    });
    
    // Categorize and provide user-friendly error messages
    let userMessage = 'Unable to start authentication. Please try again.';
    let errorCode = 'OAUTH_URL_CREATION_FAILED';
    
    if (error.message?.includes('Google Client ID')) {
      userMessage = 'Authentication service is temporarily unavailable. Please try again later.';
      errorCode = 'OAUTH_CONFIG_ERROR';
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      userMessage = 'Network connection issue. Please check your internet and try again.';
      errorCode = 'NETWORK_ERROR';
    }
    
    res.status(500).json({
      success: false,
      error: userMessage,
      errorCode: errorCode,
      canRetry: true,
      suggestedActions: ['Try refreshing the page', 'Check your internet connection', 'Try again in a few minutes']
    });
  }
}

/**
 * 🪟 POPUP-ONLY OAuth Callback - NEVER sets cookies, only returns exchange code
 * This endpoint is specifically for popup authentication to prevent double login
 */
export async function handleGoogleOAuthPopupCallbackRoute(req: Request, res: Response) {
  try {
    console.log('🪟 [POPUP-CALLBACK] Processing popup-only OAuth callback');
    console.log('🔍 [POPUP-CALLBACK] Query params:', req.query);
    
    // CRITICAL: Set headers to prevent caching and ensure no session cookies
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store',
      'X-Auth-Handler': 'popup-only-callback',
      'X-Auth-Timestamp': new Date().toISOString(),
      'X-Popup-Flow': 'true',
      'X-Popup-Mode': 'true'
    });

    // CRITICAL: Clear any session cookies that might have been set
    res.clearCookie('session');
    res.clearCookie('brandentifier_session');
    
    const { code, state, error } = req.query;
    
    // Handle OAuth errors
    if (error) {
      console.error('❌ [POPUP-CALLBACK] OAuth error:', error);
      const errorHtml = `
        <!DOCTYPE html>
        <html>
        <head><title>Authentication Error</title></head>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'oauth:error',
                error: '${error}',
                message: 'Authentication failed. Please try again.'
              }, '*');
              window.close();
            }
          </script>
        </body>
        </html>
      `;
      return res.send(errorHtml);
    }
    
    if (!code || !state) {
      console.error('❌ [POPUP-CALLBACK] Missing code or state');
      const errorHtml = `
        <!DOCTYPE html>
        <html>
        <head><title>Authentication Error</title></head>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'oauth:error',
                error: 'missing_params',
                message: 'Authentication response incomplete. Please try again.'
              }, '*');
              window.close();
            }
          </script>
        </body>
        </html>
      `;
      return res.send(errorHtml);
    }
    
    // Basic state validation 
    const stateData = stateStore.get(state as string);
    if (!stateData || stateData.timestamp < Date.now() - 15 * 60 * 1000) {
      console.error('❌ [POPUP-CALLBACK] Invalid or expired state');
      const errorHtml = `
        <!DOCTYPE html>
        <html>
        <head><title>Authentication Error</title></head>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'oauth:error',
                error: 'invalid_state',
                message: 'Authentication session invalid. Please try again.'
              }, '*');
              window.close();
            }
          </script>
        </body>
        </html>
      `;
      return res.send(errorHtml);
    }
    
    stateStore.delete(state as string);
    
    // Get popup redirect URI for token exchange
    const host = req.get('Host') || '';
    const isDevelopment = host.includes('localhost') || host.includes('127.0.0.1');
    const isReplitDomain = REPLIT_DOMAIN_PATTERNS.some(pattern => pattern.test(host));
    const isBrandentifierCom = host.includes('brandentifier.com');
    
    let popupRedirectUri;
    if (isDevelopment) {
      popupRedirectUri = 'http://localhost:5000/api/auth/google/callback-popup';
    } else if (isBrandentifierCom) {
      popupRedirectUri = 'https://brandentifier.com/api/auth/google/callback-popup';
    } else if (isReplitDomain) {
      if (host.includes('.picard.replit.dev') || host.includes('.replit.dev')) {
        popupRedirectUri = `https://${host}/api/auth/google/callback-popup`;
      } else {
        popupRedirectUri = 'https://brandentifier.replit.app/api/auth/google/callback-popup';
      }
    } else {
      popupRedirectUri = `https://${host}/api/auth/google/callback-popup`;
    }
    
    console.log('🔄 [POPUP-CALLBACK] Exchanging code for token...');
    
    // Exchange code for token
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID!,
        client_secret: CLIENT_SECRET!,
        code: code as string,
        grant_type: 'authorization_code',
        redirect_uri: popupRedirectUri,
      }),
    });
    
    if (!tokenResponse.ok) {
      console.error('❌ [POPUP-CALLBACK] Token exchange failed');
      const errorHtml = `
        <!DOCTYPE html>
        <html>
        <head><title>Authentication Error</title></head>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'oauth:error',
                error: 'token_exchange_failed',
                message: 'Authentication failed. Please try again.'
              }, '*');
              window.close();
            }
          </script>
        </body>
        </html>
      `;
      return res.send(errorHtml);
    }
    
    const tokenData = await tokenResponse.json();
    
    // Get user info from Google
    const userResponse = await fetch(GOOGLE_USER_INFO_URL, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });
    
    if (!userResponse.ok) {
      console.error('❌ [POPUP-CALLBACK] Failed to fetch user info');
      const errorHtml = `
        <!DOCTYPE html>
        <html>
        <head><title>Authentication Error</title></head>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'oauth:error',
                error: 'user_info_failed',
                message: 'Failed to retrieve profile. Please try again.'
              }, '*');
              window.close();
            }
          </script>
        </body>
        </html>
      `;
      return res.send(errorHtml);
    }
    
    const googleUser = await userResponse.json();
    console.log('✅ [POPUP-CALLBACK] User info received:', {
      email: googleUser.email,
      name: googleUser.name,
      id: googleUser.id
    });
    
    // Create or get user (but DON'T create session yet)
    const userData = {
      firebaseUid: googleUser.id,
      email: googleUser.email || '',
      name: googleUser.name || 'Google User',
      photoURL: googleUser.picture || '',
      googleId: googleUser.id,
      authProvider: 'google',
      emailVerified: googleUser.verified_email || false
    };
    
    // Find or create user
    let existingUser = await storage.getUserByGoogleId(userData.googleId);
    let user;
    
    if (existingUser) {
      console.log('✅ [POPUP-CALLBACK] Found existing user:', existingUser.id);
      
      // Preserve custom uploaded photos
      let finalPhotoURL = existingUser.photoURL;
      if (existingUser.photoURL && existingUser.photoURL.startsWith('data:image/')) {
        finalPhotoURL = existingUser.photoURL;
      } else if (userData.photoURL && userData.photoURL.startsWith('http')) {
        finalPhotoURL = userData.photoURL;
      }
      
      user = await storage.updateUser(existingUser.id, {
        name: userData.name,
        photoURL: finalPhotoURL,
        googleId: userData.googleId,
        firebaseUid: userData.firebaseUid,
        authProvider: 'google',
        lastLoginAt: new Date()
      });
    } else {
      console.log('🆕 [POPUP-CALLBACK] Creating new user');
      user = await storage.createUser({
        firebaseUid: userData.firebaseUid,
        username: userData.firebaseUid,
        email: userData.email,
        name: userData.name,
        photoURL: userData.photoURL,
        googleId: userData.googleId,
        authProvider: userData.authProvider,
        profileCompleted: 0,
        lastLoginAt: new Date()
      });
    }
    
    if (!user) {
      throw new Error('Failed to create or update user');
    }
    
    // Create session token (but DON'T set cookie here)
    const sessionToken = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        name: user.name,
        authProvider: 'google'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Create single-use exchange code for main window
    const exchangeCode = crypto.randomBytes(32).toString('base64url');
    sessionExchangeStore.set(exchangeCode, {
      sessionToken,
      timestamp: Date.now(),
      returnHost: host,
      userId: user.id
    });
    
    console.log('✅ [POPUP-CALLBACK] Created exchange code for main window');
    
    // Return minimal HTML that sends exchange code to opener and closes popup
    const successHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authentication Successful</title>
        <meta name="popup-callback" content="true">
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 2s linear infinite; margin: 20px auto; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <h2>Completing authentication...</h2>
        <div class="spinner"></div>
        <script>
          // CRITICAL: Prevent any navigation or app loading
          console.log('[POPUP-CALLBACK] This is a popup callback, preventing app load');
          
          // Block any attempts to navigate or load the main app
          window.addEventListener('beforeunload', (e) => {
            console.log('[POPUP-CALLBACK] Popup closing as expected');
          });

          // Prevent any router initialization
          if (window.history && window.history.replaceState) {
            window.history.replaceState(null, '', window.location.href);
          }

          console.log('[POPUP-CALLBACK] Sending exchange code to opener window');
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage({
              type: 'oauth:success',
              exchangeCode: '${exchangeCode}'
            }, '*');
            console.log('[POPUP-CALLBACK] Exchange code sent, closing popup');
            setTimeout(() => {
              window.close();
            }, 500);
          } else {
            console.error('[POPUP-CALLBACK] No opener window found');
            document.body.innerHTML = '<h2>Error: Unable to complete authentication</h2><p>Please close this window and try again.</p>';
          }
        </script>
      </body>
      </html>
    `;
    
    // CRITICAL: Send HTML response, NO cookies set
    res.send(successHtml);
    
  } catch (error: any) {
    console.error('❌ [POPUP-CALLBACK] Critical error:', error);
    const errorHtml = `
      <!DOCTYPE html>
      <html>
      <head><title>Authentication Error</title></head>
      <body>
        <script>
          if (window.opener) {
            window.opener.postMessage({
              type: 'oauth:error',
              error: 'callback_error',
              message: 'Authentication failed. Please try again.'
            }, '*');
            window.close();
          }
        </script>
      </body>
      </html>
    `;
    res.send(errorHtml);
  }
}

/**
 * ⚡ CRITICAL POPUP FIX: Lightweight popup authentication flow
 * Processes Google OAuth for popup windows WITHOUT database session creation
 */
async function handlePopupAuthenticationFlow(req: Request, res: Response, code: string, state: string) {
  try {
    console.log('🪟 [POPUP-FLOW] Starting lightweight popup authentication');
    
    // Basic state validation (simplified for popup)
    const stateData = stateStore.get(state);
    if (!stateData || stateData.timestamp < Date.now() - 15 * 60 * 1000) {
      console.error('❌ [POPUP-FLOW] Invalid or expired state');
      return res.send(`
        <script>
          if (window.opener) {
            window.opener.postMessage({
              type: 'GOOGLE_AUTH_ERROR',
              error: 'invalid_state',
              message: 'Authentication session expired'
            }, window.location.origin);
          }
          window.close();
        </script>
      `);
    }
    
    // Clean up state
    stateStore.delete(state);
    
    // Exchange code for token (minimal processing)
    const host = req.get('host') || 'localhost:5000';
    const isDevelopment = host.includes('localhost') || host.includes('127.0.0.1');
    
    let redirectUri;
    if (isDevelopment) {
      redirectUri = 'http://localhost:5000/api/auth/google/callback';
    } else {
      redirectUri = `https://${host}/api/auth/google/callback`;
    }
    
    console.log('🪟 [POPUP-FLOW] Exchanging code for token...');
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID!,
        client_secret: CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });
    
    if (!tokenResponse.ok) {
      console.error('❌ [POPUP-FLOW] Token exchange failed');
      return res.send(`
        <script>
          if (window.opener) {
            window.opener.postMessage({
              type: 'GOOGLE_AUTH_ERROR',
              error: 'token_exchange_failed',
              message: 'Authentication failed'
            }, window.location.origin);
          }
          window.close();
        </script>
      `);
    }
    
    const tokenData = await tokenResponse.json();
    
    // Get user info from Google (lightweight)
    console.log('🪟 [POPUP-FLOW] Fetching user info...');
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` },
    });
    
    if (!userResponse.ok) {
      console.error('❌ [POPUP-FLOW] User info fetch failed');
      return res.send(`
        <script>
          if (window.opener) {
            window.opener.postMessage({
              type: 'GOOGLE_AUTH_ERROR',
              error: 'user_info_failed',
              message: 'Failed to get user information'
            }, window.location.origin);
          }
          window.close();
        </script>
      `);
    }
    
    const googleUser = await userResponse.json();
    console.log('✅ [POPUP-FLOW] Got user info:', { email: googleUser.email, name: googleUser.name });
    
    // Find or create user (simplified lookup)
    let user = await storage.getUserByGoogleId(googleUser.id);
    if (!user) {
      user = await storage.getUserByEmail(googleUser.email);
    }
    if (!user) {
      // Create minimal user record for popup
      user = await storage.createUser({
        username: googleUser.id,
        email: googleUser.email,
        name: googleUser.name || 'Google User',
        photoURL: googleUser.picture || '',
        googleId: googleUser.id,
        firebaseUid: googleUser.id,
        authProvider: 'google',
        lastLoginAt: new Date()
      });
    }
    
    // Create session token for parent window
    const sessionToken = jwt.sign({
      userId: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
    }, JWT_SECRET);
    
    console.log('✅ [POPUP-FLOW] Sending session token to parent window for user:', user.email);
    
    // Return HTML that sends token to parent window and closes popup
    const popupResponseHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Successful</title>
          <style>
            body { 
              font-family: system-ui, sans-serif;
              display: flex; 
              align-items: center; 
              justify-content: center; 
              height: 100vh; 
              margin: 0; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .container { text-align: center; }
            .checkmark { font-size: 48px; margin-bottom: 16px; }
            .message { font-size: 18px; margin-bottom: 8px; }
            .submessage { font-size: 14px; opacity: 0.8; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="checkmark">✅</div>
            <div class="message">Authentication Successful!</div>
            <div class="submessage">Closing popup and logging you in...</div>
          </div>
          <script>
            console.log('[POPUP-FLOW] Sending success message to parent window');
            try {
              if (window.opener && !window.opener.closed) {
                window.opener.postMessage({
                  type: 'GOOGLE_AUTH_SUCCESS',
                  data: {
                    success: true,
                    sessionToken: '${sessionToken}',
                    user: {
                      id: ${user.id},
                      email: '${user.email}',
                      name: '${user.name?.replace(/'/g, "\\'")}',
                      username: '${user.username}',
                      photoURL: '${user.photoURL || ''}'
                    },
                    timestamp: new Date().toISOString()
                  }
                }, window.location.origin);
                
                console.log('[POPUP-FLOW] Message sent, closing popup in 500ms');
                setTimeout(() => window.close(), 500);
              } else {
                console.warn('[POPUP-FLOW] No parent window, redirecting to dashboard');
                window.location.href = '/dashboard';
              }
            } catch (error) {
              console.error('[POPUP-FLOW] Error:', error);
              window.location.href = '/dashboard';
            }
          </script>
        </body>
      </html>
    `;
    
    res.set('Content-Type', 'text/html');
    return res.send(popupResponseHTML);
    
  } catch (error: any) {
    console.error('❌ [POPUP-FLOW] Critical error:', error);
    return res.send(`
      <script>
        if (window.opener) {
          window.opener.postMessage({
            type: 'GOOGLE_AUTH_ERROR',
            error: 'popup_auth_failed',
            message: 'Popup authentication failed'
          }, window.location.origin);
        }
        window.close();
      </script>
    `);
  }
}

/**
 * Handle Google OAuth callback - processes the authorization code
 */
export async function handleGoogleOAuthCallbackRoute(req: Request, res: Response) {
  try {
    console.log('🔄 [OAUTH CALLBACK] Processing Google OAuth callback');
    console.log('🔄 [OAUTH CALLBACK] Query params:', req.query);
    console.log('🔄 [OAUTH CALLBACK] Request URL:', req.url);
    console.log('🔄 [OAUTH CALLBACK] Request method:', req.method);
    console.log('🔄 [OAUTH CALLBACK] Request headers:', {
      host: req.get('host'),
      'user-agent': req.get('user-agent'),
      referer: req.get('referer'),
      origin: req.get('origin')
    });
    
    // Set cache control headers for auth callback endpoint
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store',
      'X-Auth-Handler': 'server-oauth-callback',
      'X-Auth-Timestamp': new Date().toISOString(),
      'X-Auth-Host': req.get('host') || 'unknown',
      'X-Debug-Firebase-Disabled': 'true'
    });
    
    const { code, state, error } = req.query;
    
    // ⚡ CRITICAL FIX: Detect popup requests IMMEDIATELY before any authentication
    const isPopupRequest = req.query.popup === 'true';
    console.log('🔍 [POPUP-DETECTION-CRITICAL] Popup detection at START of callback:', {
      popupQuery: req.query.popup,
      isPopupRequest,
      code: !!code,
      state: !!state,
      timestamp: new Date().toISOString()
    });
    
    // Handle OAuth errors with detailed logging
    if (error) {
      console.error('❌ [OAUTH-ERROR] Google OAuth error:', {
        error: error,
        host: req.get('host'),
        referer: req.get('referer'),
        userAgent: req.get('user-agent'),
        timestamp: new Date().toISOString()
      });
      
      // Provide specific error messages based on OAuth error types
      let errorMessage = 'Authentication was cancelled or failed. Please try again.';
      if (error === 'access_denied') {
        errorMessage = 'Authentication was cancelled. You need to grant permission to continue.';
      } else if (error === 'invalid_request') {
        errorMessage = 'Authentication request was invalid. Please try again.';
      }
      
      return res.redirect(`/auth?error=oauth_error&message=${encodeURIComponent(errorMessage)}&canRetry=true`);
    }
    
    if (!code || !state) {
      console.error('❌ [OAUTH-CALLBACK-ERROR] Missing authorization code or state:', {
        hasCode: !!code,
        hasState: !!state,
        query: req.query,
        host: req.get('host'),
        timestamp: new Date().toISOString()
      });
      return res.redirect('/auth?error=missing_params&message=Authentication%20response%20incomplete.%20Please%20try%20signing%20in%20again.&canRetry=true');
    }
    
    // ⚡ CRITICAL POPUP FIX: Handle popup authentication IMMEDIATELY, skip normal database flow
    if (isPopupRequest) {
      console.log('🪟 [POPUP-AUTH-CRITICAL] POPUP REQUEST DETECTED - Starting lightweight popup-only flow');
      return handlePopupAuthenticationFlow(req, res, code as string, state as string);
    }
    
    console.log('🌐 [NORMAL-AUTH] Non-popup request, continuing with full authentication flow');
    
    // Enhanced state parameter validation with detailed logging
    const stateData = stateStore.get(state as string);
    const currentTime = Date.now();
    
    console.log('🔐 [STATE-VALIDATION] Validating OAuth state:', {
      stateExists: !!stateData,
      stateStoreSize: stateStore.size,
      currentHost: req.get('host'),
      timestamp: new Date().toISOString()
    });
    
    if (!stateData) {
      console.error('❌ [STATE-VALIDATION] Invalid or missing state parameter:', {
        providedState: state ? `${(state as string).substring(0, 10)}...` : 'null',
        storeHasStates: stateStore.size > 0,
        allStates: Array.from(stateStore.keys()).map(k => k.substring(0, 10) + '...')
      });
      return res.redirect('/auth?error=invalid_state&message=Authentication%20session%20invalid.%20Please%20try%20signing%20in%20again.&canRetry=true');
    }
    
    // Check state age (max 15 minutes) - Extended from 5 minutes
    const fifteenMinutesAgo = currentTime - 15 * 60 * 1000;
    const stateAge = currentTime - stateData.timestamp;
    
    console.log('⏰ [STATE-VALIDATION] State age check:', {
      stateTimestamp: new Date(stateData.timestamp).toISOString(),
      currentTimestamp: new Date(currentTime).toISOString(),
      stateAgeSeconds: Math.floor(stateAge / 1000),
      maxAgeSeconds: 15 * 60,
      isExpired: stateData.timestamp < fifteenMinutesAgo
    });
    
    if (stateData.timestamp < fifteenMinutesAgo) {
      console.error('❌ [STATE-VALIDATION] Expired state parameter:', {
        stateAge: Math.floor(stateAge / 1000) + ' seconds',
        maxAge: '900 seconds (15 minutes)',
        expiredBy: Math.floor((fifteenMinutesAgo - stateData.timestamp) / 1000) + ' seconds'
      });
      stateStore.delete(state as string);
      return res.redirect('/auth?error=expired_state&message=Authentication%20session%20expired.%20Please%20try%20signing%20in%20again.&canRetry=true');
    }
    
    console.log('✅ [STATE-VALIDATION] State validation successful');
    
    // Remove used state
    stateStore.delete(state as string);
    
    if (!CLIENT_ID || !CLIENT_SECRET) {
      throw new Error('Google OAuth credentials not configured');
    }
    
    // Enhanced environment-based redirect URI determination in callback (matches URL generation)
    const host = req.get('Host') || '';
    const isDevelopment = host.includes('localhost') || host.includes('127.0.0.1');
    const isReplitDomain = REPLIT_DOMAIN_PATTERNS.some(pattern => pattern.test(host));
    const isBrandentifierCom = host.includes('brandentifier.com');
    
    console.log('🌐 [OAUTH-CALLBACK] Domain analysis for token exchange:', {
      host,
      isDevelopment,
      isReplitDomain,
      isBrandentifierCom,
      matchedPattern: REPLIT_DOMAIN_PATTERNS.find(pattern => pattern.test(host))?.toString()
    });
    
    // Use static redirect URI for all non-localhost domains (Google OAuth requirement)
    let redirectUri;
    
    if (isDevelopment) {
      redirectUri = 'http://localhost:5000/api/auth/google/callback';
    } else if (isBrandentifierCom) {
      redirectUri = 'https://brandentifier.com/api/auth/google/callback';
    } else if (isReplitDomain) {
      // FIXED: For preview domains, use the current domain to avoid non-existent brandentifier.replit.app
      // For published domains, still use stable redirect URI
      if (host.includes('.picard.replit.dev') || host.includes('.replit.dev')) {
        // Preview domain: use current domain
        redirectUri = `https://${host}/api/auth/google/callback`;
      } else {
        // Published domain: use stable redirect URI
        redirectUri = 'https://brandentifier.replit.app/api/auth/google/callback';
      }
    } else {
      // Fallback for unknown domains - use current host if HTTPS
      console.log('⚠️ [OAUTH-CALLBACK] Unknown domain, using current host as fallback');
      redirectUri = `https://${host}/api/auth/google/callback`;
    }
    
    console.log('🔄 [OAUTH CALLBACK] Exchanging code for token...');
    console.log('✅ [OAUTH CALLBACK] Using redirect URI:', redirectUri);
    console.log('🔍 [OAUTH CALLBACK] Host detected:', host);
    console.log('🔧 [OAUTH CALLBACK] Development mode:', isDevelopment);
    
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
      console.error('❌ [TOKEN-EXCHANGE-ERROR] Token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        errorText: errorText,
        host: req.get('host'),
        redirectUri: redirectUri,
        timestamp: new Date().toISOString()
      });
      
      let errorMessage = 'Authentication failed during token exchange. Please try again.';
      if (tokenResponse.status === 400) {
        errorMessage = 'Invalid authentication request. Please try signing in again.';
      } else if (tokenResponse.status === 401) {
        errorMessage = 'Authentication expired. Please try signing in again.';
      } else if (tokenResponse.status >= 500) {
        errorMessage = 'Authentication service temporarily unavailable. Please try again later.';
      }
      
      return res.redirect(`/auth?error=token_exchange_failed&message=${encodeURIComponent(errorMessage)}&canRetry=true`);
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
      console.error('❌ [USER-INFO-ERROR] Failed to fetch user info:', {
        status: userResponse.status,
        statusText: userResponse.statusText,
        host: req.get('host'),
        timestamp: new Date().toISOString()
      });
      
      let errorMessage = 'Unable to retrieve your profile information. Please try again.';
      if (userResponse.status === 401) {
        errorMessage = 'Authentication token expired. Please try signing in again.';
      } else if (userResponse.status === 403) {
        errorMessage = 'Insufficient permissions to access profile. Please try signing in again.';
      }
      
      return res.redirect(`/auth?error=user_info_failed&message=${encodeURIComponent(errorMessage)}&canRetry=true`);
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
    console.log('🔍 [AUTH-FIX] Looking up user by Google ID first:', userData.googleId);
    
    // FIXED: Check by Google ID first to prevent duplicate users across domains
    let existingUser = await storage.getUserByGoogleId(userData.googleId);
    let user;
    
    if (existingUser) {
      console.log('✅ [AUTH-FIX] Found existing user by Google ID:', {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        googleId: existingUser.googleId
      });
      
      // PROFILE PICTURE PERSISTENCE FIX: Preserve custom uploaded photos
      // Only use Google photo if user hasn't uploaded a custom one
      let finalPhotoURL = existingUser.photoURL;
      
      if (existingUser.photoURL && existingUser.photoURL.startsWith('data:image/')) {
        // User has custom uploaded image - preserve it
        finalPhotoURL = existingUser.photoURL;
        console.log('🖼️ [AUTH-FIX] Preserving custom uploaded profile picture');
      } else if (userData.photoURL && userData.photoURL.startsWith('http')) {
        // No custom image, use latest Google photo  
        finalPhotoURL = userData.photoURL;
        console.log('🖼️ [AUTH-FIX] Using Google profile picture');
      }
      
      // Update existing user with latest Google info but preserve photo priority
      user = await storage.updateUser(existingUser.id, {
        name: userData.name,
        photoURL: finalPhotoURL,
        googleId: userData.googleId,
        firebaseUid: userData.firebaseUid,
        authProvider: 'google',
        lastLoginAt: new Date()
      });
      console.log('✅ [AUTH-FIX] Updated existing user profile with photo preservation');
    } else {
      // Fallback: check by email for legacy users who may not have googleId stored
      console.log('🔍 [AUTH-FIX] No user found by Google ID, checking by email as fallback');
      const userByEmail = await storage.getUserByEmail(userData.email);
      
      if (userByEmail) {
        console.log('✅ [AUTH-FIX] Found legacy user by email, updating with Google ID');
        
        // PROFILE PICTURE PERSISTENCE FIX: Preserve custom uploaded photos for legacy users too
        let finalPhotoURL = userByEmail.photoURL;
        
        if (userByEmail.photoURL && userByEmail.photoURL.startsWith('data:image/')) {
          // User has custom uploaded image - preserve it
          finalPhotoURL = userByEmail.photoURL;
          console.log('🖼️ [AUTH-FIX] Preserving custom uploaded profile picture (legacy user)');
        } else if (userData.photoURL && userData.photoURL.startsWith('http')) {
          // No custom image, use latest Google photo  
          finalPhotoURL = userData.photoURL;
          console.log('🖼️ [AUTH-FIX] Using Google profile picture (legacy user)');
        }
        
        // Update legacy user with Google ID fields
        user = await storage.updateUser(userByEmail.id, {
          name: userData.name,
          photoURL: finalPhotoURL,
          googleId: userData.googleId,
          firebaseUid: userData.firebaseUid,
          authProvider: 'google',
          lastLoginAt: new Date()
        });
      } else {
        console.log('✅ [AUTH-FIX] Creating new user with Google ID');
        // Create new user with all Google fields
        user = await storage.createUser({
          username: userData.firebaseUid,
          email: userData.email,
          name: userData.name,
          photoURL: userData.photoURL,
          googleId: userData.googleId,
          firebaseUid: userData.firebaseUid,
          authProvider: 'google',
          lastLoginAt: new Date()
        });

        // Assign starter quests immediately for new users
        if (user && user.id) {
          try {
            console.log(`🎯 [STARTER-QUESTS] Assigning starter quests to new user ${user.id} (${user.name})`);
            
            // Assign both career and social starter quests
            const starterCareerQuests = await storage.assignDailyQuestsToUser(user.id);
            const starterSocialQuests = await storage.assignDailySocialQuests(user.id);
            
            const totalStarterQuests = starterCareerQuests.length + starterSocialQuests.length;
            console.log(`✅ [STARTER-QUESTS] Successfully assigned ${starterCareerQuests.length} career + ${starterSocialQuests.length} social = ${totalStarterQuests} starter quests to new user ${user.name}`);
          } catch (starterError) {
            console.error(`❌ [STARTER-QUESTS] Error assigning starter quests to new user ${user.id}:`, starterError);
            // Don't fail the user creation if quest assignment fails
          }
        }
      }
    }
    
    if (!user) {
      throw new Error('Failed to create or update user');
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
      algorithm: 'HS256'
    });
    
    // Parse state to get return host for cross-domain session handoff
    let returnHost = req.get('host') || 'localhost:5000';
    
    try {
      const decodedState = JSON.parse(Buffer.from(state as string, 'base64url').toString());
      if (decodedState.returnHost) {
        returnHost = decodedState.returnHost;
      }
    } catch (error) {
      console.log('⚠️ [OAUTH CALLBACK] Could not parse state for return host, using current host');
    }
    
    console.log('✅ [OAUTH CALLBACK] Authentication completed successfully');
    console.log('✅ [OAUTH CALLBACK] User authenticated:', {
      email: user.email,
      id: user.id,
      username: user.username,
      authProvider: 'google'
    });
    
    // POPUP COMMUNICATION FIX: Get current host for processing
    const currentHost = req.get('host') || 'localhost:5000';
    
    // ⚠️ NOTE: Popup requests are now handled at the START of OAuth callback function
    // This code should never execute as popup requests exit early via handlePopupAuthenticationFlow()
    if (isPopupRequest) {
      console.error('🚨 [CRITICAL-ERROR] Popup request reached normal auth flow - this should never happen!');
      
      // Create session token for parent window communication (but don't set cookie here)
      const sessionData = {
        userId: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
      };
      
      const sessionToken = jwt.sign(sessionData, JWT_SECRET);
      
      // Return HTML page that sends user data and token to parent window
      const popupResponseHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Authentication Successful</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex; 
              align-items: center; 
              justify-content: center; 
              height: 100vh; 
              margin: 0; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .container { text-align: center; }
            .checkmark { font-size: 48px; margin-bottom: 16px; }
            .message { font-size: 18px; margin-bottom: 8px; }
            .submessage { font-size: 14px; opacity: 0.8; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="checkmark">✅</div>
            <div class="message">Authentication Successful!</div>
            <div class="submessage">Redirecting back to main window...</div>
          </div>
          
          <script>
            console.log('[POPUP AUTH] Popup callback page loaded, sending success message to parent');
            
            // Send success message with session token to parent window
            try {
              if (window.opener && !window.opener.closed) {
                console.log('[POPUP AUTH] Sending GOOGLE_AUTH_SUCCESS with session token to parent window');
                window.opener.postMessage({
                  type: 'GOOGLE_AUTH_SUCCESS',
                  data: {
                    success: true,
                    sessionToken: '${sessionToken}',
                    user: {
                      id: ${user.id},
                      email: '${user.email}',
                      name: '${user.name?.replace(/'/g, "\\'")}',
                      username: '${user.username}',
                      photoURL: '${user.photoURL || ''}'
                    },
                    timestamp: new Date().toISOString()
                  }
                }, window.location.origin);
                
                // Close popup after a short delay to ensure message is received
                setTimeout(() => {
                  console.log('[POPUP AUTH] Closing popup window');
                  window.close();
                }, 500);
                
              } else {
                console.warn('[POPUP AUTH] No valid parent window found, redirecting instead');
                // Fallback: redirect to dashboard if no parent window
                window.location.href = '/dashboard';
              }
            } catch (error) {
              console.error('[POPUP AUTH] Error sending message to parent:', error);
              // Fallback: redirect to dashboard if messaging fails
              window.location.href = '/dashboard';
            }
          </script>
        </body>
        </html>
      `;
      
      res.set('Content-Type', 'text/html');
      return res.send(popupResponseHTML);
    }
    
    // ORIGINAL REDIRECT FLOW: Continue with normal redirect for non-popup requests
    console.log('🌐 [NORMAL-AUTH] Non-popup request, proceeding with standard redirect flow');
    
    // Check if cross-domain session handoff is needed
    const needsCrossDomainHandoff = returnHost !== currentHost;
    
    console.log('🔍 [SESSION-HANDOFF] Domain analysis:', {
      currentHost,
      returnHost,
      needsCrossDomainHandoff
    });
    
    if (needsCrossDomainHandoff) {
      // Generate secure session exchange code for cross-domain handoff
      const exchangeCode = crypto.randomBytes(32).toString('base64url');
      
      // Store session exchange data (expires in 5 minutes, single-use)
      sessionExchangeStore.set(exchangeCode, {
        sessionToken,
        timestamp: Date.now(),
        returnHost,
        userId: user.id
      });
      
      // Build session acceptance URL on return domain
      const sessionAcceptUrl = returnHost.includes('localhost') 
        ? `http://${returnHost}/auth/accept-session?code=${exchangeCode}`
        : `https://${returnHost}/auth/accept-session?code=${exchangeCode}`;
      
      console.log('🔄 [SESSION-HANDOFF] Cross-domain handoff initiated');
      console.log('✅ [SESSION-HANDOFF] Generated exchange code and redirecting to:', sessionAcceptUrl);
      
      return res.redirect(303, sessionAcceptUrl);
    } else {
      // Same domain - set cookie directly and redirect to dashboard
      const isSecure = currentHost.includes('replit.app') || currentHost.includes('replit.dev') || currentHost.includes('brandentifier.com');
      
      const cookieOptions = {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax' as const, // Use 'lax' for better compatibility - fixed for Replit domains
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      };
      
      console.log('🍪 [SESSION-HANDOFF] Same domain - setting cookie directly:', {
        domain: (cookieOptions as any).domain || 'omitted',
        sameSite: cookieOptions.sameSite,
        secure: cookieOptions.secure,
        host: currentHost
      });
      
      res.cookie('brandentifier_session', sessionToken, cookieOptions);
      
      console.log('✅ [SESSION-HANDOFF] Same domain redirect to dashboard');
      return res.redirect(303, '/dashboard');
    }
    
  } catch (error: any) {
    console.error('❌ [OAUTH-CALLBACK-CRITICAL] OAuth callback critical error:', {
      errorMessage: error.message,
      errorStack: error.stack,
      host: req.get('host'),
      userAgent: req.get('user-agent'),
      referer: req.get('referer'),
      timestamp: new Date().toISOString(),
      query: req.query
    });
    
    // Categorize critical errors
    let userMessage = 'Authentication failed due to an unexpected error. Please try again.';
    if (error.message?.includes('database') || error.message?.includes('storage')) {
      userMessage = 'Unable to save your authentication. Please try again.';
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      userMessage = 'Network error during authentication. Please check your connection and try again.';
    } else if (error.message?.includes('Google OAuth')) {
      userMessage = 'Google authentication service error. Please try again later.';
    }
    
    res.redirect(`/auth?error=callback_error&message=${encodeURIComponent(userMessage)}&canRetry=true&errorCode=OAUTH_CALLBACK_ERROR`);
  }
}

/**
 * Accept session exchange code and set authentication cookie in main window
 * This is called by the main window after receiving exchange code from popup
 */
export async function acceptSessionExchangeRoute(req: Request, res: Response) {
  try {
    console.log('🔄 [SESSION-EXCHANGE] Processing session exchange from popup');
    
    const { exchangeCode } = req.body;
    
    if (!exchangeCode) {
      console.error('❌ [SESSION-EXCHANGE] Missing exchange code');
      return res.status(400).json({
        success: false,
        error: 'Exchange code required',
        errorCode: 'MISSING_EXCHANGE_CODE'
      });
    }
    
    // Get session data from exchange code
    const exchangeData = sessionExchangeStore.get(exchangeCode);
    
    if (!exchangeData) {
      console.error('❌ [SESSION-EXCHANGE] Invalid or expired exchange code');
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired exchange code',
        errorCode: 'INVALID_EXCHANGE_CODE'
      });
    }
    
    // Check if exchange code is expired (5 minutes)
    if (exchangeData.timestamp < Date.now() - 5 * 60 * 1000) {
      console.error('❌ [SESSION-EXCHANGE] Exchange code expired');
      sessionExchangeStore.delete(exchangeCode);
      return res.status(400).json({
        success: false,
        error: 'Exchange code expired',
        errorCode: 'EXCHANGE_CODE_EXPIRED'
      });
    }
    
    // Remove exchange code (single use)
    sessionExchangeStore.delete(exchangeCode);
    
    console.log('✅ [SESSION-EXCHANGE] Valid exchange code, setting session cookie');
    
    // Set session cookie in main window
    res.cookie('session', exchangeData.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });
    
    // Get user info for response  
    const user = await storage.getUserByFirebaseUid(exchangeData.userId.toString());
    
    if (!user) {
      console.error('❌ [SESSION-EXCHANGE] User not found');
      return res.status(400).json({
        success: false,
        error: 'User not found',
        errorCode: 'USER_NOT_FOUND'
      });
    }
    
    console.log('✅ [SESSION-EXCHANGE] Session created successfully for user:', user.id);
    
    // Return user data for frontend
    const clientUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      photoURL: user.photoURL,
      profileCompleted: user.profileCompleted || 0,
      authProvider: user.authProvider || 'google',
      emailVerified: user.emailVerified
    };
    
    res.json({
      success: true,
      user: clientUser,
      message: 'Authentication successful'
    });
    
  } catch (error: any) {
    console.error('❌ [SESSION-EXCHANGE] Critical error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
      errorCode: 'SESSION_EXCHANGE_ERROR'
    });
  }
}

/**
 * Accept session from cross-domain handoff - validates exchange code and sets session cookie
 */
export async function acceptSessionRoute(req: Request, res: Response) {
  try {
    console.log('🔄 [SESSION-ACCEPT] Processing session acceptance');
    
    // Set cache control headers
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store',
      'X-Auth-Handler': 'session-accept',
      'X-Auth-Timestamp': new Date().toISOString(),
      'X-Auth-Host': req.get('host') || 'unknown'
    });
    
    const { code } = req.query;
    
    if (!code || typeof code !== 'string') {
      console.error('❌ [SESSION-ACCEPT] Missing or invalid exchange code');
      return res.redirect('/auth?error=invalid_exchange_code&message=Authentication%20session%20code%20invalid.%20Please%20try%20signing%20in%20again.&canRetry=true');
    }
    
    // Look up session exchange data
    const exchangeData = sessionExchangeStore.get(code);
    
    if (!exchangeData) {
      console.error('❌ [SESSION-ACCEPT] Exchange code not found or already used:', {
        codeProvided: code.substring(0, 10) + '...',
        storeSize: sessionExchangeStore.size,
        allCodes: Array.from(sessionExchangeStore.keys()).map(k => k.substring(0, 10) + '...')
      });
      return res.redirect('/auth?error=exchange_code_not_found&message=Authentication%20session%20not%20found%20or%20already%20used.%20Please%20try%20signing%20in%20again.&canRetry=true');
    }
    
    // Check exchange code age (max 5 minutes)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    if (exchangeData.timestamp < fiveMinutesAgo) {
      console.error('❌ [SESSION-ACCEPT] Exchange code expired:', {
        codeAge: Math.floor((Date.now() - exchangeData.timestamp) / 1000) + ' seconds',
        maxAge: '300 seconds (5 minutes)'
      });
      sessionExchangeStore.delete(code);
      return res.redirect('/auth?error=exchange_code_expired&message=Authentication%20session%20expired.%20Please%20try%20signing%20in%20again.&canRetry=true');
    }
    
    // Validate that we're on the correct return host
    const currentHost = req.get('host') || '';
    if (exchangeData.returnHost !== currentHost) {
      console.error('❌ [SESSION-ACCEPT] Host mismatch:', {
        expectedHost: exchangeData.returnHost,
        actualHost: currentHost
      });
      return res.redirect('/auth?error=host_mismatch&message=Authentication%20domain%20mismatch.%20Please%20try%20signing%20in%20again.&canRetry=true');
    }
    
    console.log('✅ [SESSION-ACCEPT] Exchange code valid, setting session cookie');
    
    // Remove used exchange code (single-use)
    sessionExchangeStore.delete(code);
    
    // Set session cookie on the correct domain with cross-domain compatibility
    const isSecure = currentHost.includes('replit.app') || currentHost.includes('replit.dev') || currentHost.includes('brandentifier.com');
    
    const cookieOptions = {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax' as const, // Use 'lax' for better compatibility - fixed for Replit domains
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };
    
    console.log('🍪 [SESSION-ACCEPT] Setting session cookie:', {
      domain: (cookieOptions as any).domain || 'omitted',
      sameSite: cookieOptions.sameSite,
      secure: cookieOptions.secure,
      host: currentHost
    });
    
    res.cookie('brandentifier_session', exchangeData.sessionToken, cookieOptions);
    
    console.log('✅ [SESSION-ACCEPT] Session handoff completed successfully');
    console.log('✅ [SESSION-ACCEPT] User ID:', exchangeData.userId);
    console.log('✅ [SESSION-ACCEPT] Redirecting to dashboard');
    
    // Redirect to dashboard on the correct domain
    return res.redirect(303, '/dashboard');
    
  } catch (error: any) {
    console.error('❌ [SESSION-ACCEPT-ERROR] Session acceptance critical error:', {
      errorMessage: error.message,
      errorStack: error.stack,
      host: req.get('host'),
      userAgent: req.get('user-agent'),
      timestamp: new Date().toISOString(),
      query: req.query
    });
    
    let userMessage = 'Failed to complete authentication session. Please try signing in again.';
    if (error.message?.includes('cookie')) {
      userMessage = 'Unable to set authentication cookie. Please enable cookies and try again.';
    } else if (error.message?.includes('domain')) {
      userMessage = 'Authentication domain error. Please try signing in again.';
    }
    
    res.redirect(`/auth?error=session_accept_error&message=${encodeURIComponent(userMessage)}&canRetry=true&errorCode=SESSION_ACCEPT_ERROR`);
  }
}

/**
 * Check current session validity - for client-side auth state detection
 */
export async function checkSessionRoute(req: Request, res: Response) {
  try {
    console.log('🔍 Checking session validity');
    
    // Set cache control headers for session endpoint
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });
    
    // Enhanced debug logging for session validation
    const requestHost = req.get('host');
    const sessionCookie = req.cookies?.brandentifier_session;
    const allCookies = req.cookies || {};
    const cookieHeader = req.get('cookie');
    
    console.log('🍪 [SESSION-DEBUG] Enhanced session validation debug:', {
      host: requestHost,
      timestamp: new Date().toISOString(),
      // Cookie analysis
      cookiePresent: !!sessionCookie,
      cookieStart: sessionCookie ? sessionCookie.substring(0, 10) + '...' : 'none',
      cookieLength: sessionCookie ? sessionCookie.length : 0,
      allCookiesCount: Object.keys(allCookies).length,
      cookieNames: Object.keys(allCookies),
      rawCookieHeader: cookieHeader ? cookieHeader.substring(0, 100) + '...' : 'none',
      // Request context
      userAgent: req.get('user-agent')?.substring(0, 50) || 'none',
      origin: req.get('origin') || 'none',
      referer: req.get('referer') || 'none',
      // Security headers
      secFetchSite: req.get('sec-fetch-site') || 'none',
      secFetchMode: req.get('sec-fetch-mode') || 'none',
      // Cross-domain analysis
      isDevelopment: requestHost?.includes('localhost') || requestHost?.includes('127.0.0.1'),
      isReplitDomain: REPLIT_DOMAIN_PATTERNS.some(pattern => pattern.test(requestHost || '')),
      isBrandentifierCom: requestHost?.includes('brandentifier.com')
    });
    
    // Check if JWT session cookie exists
    const sessionToken = req.cookies?.brandentifier_session;
    
    if (!sessionToken) {
      console.log('❌ [SESSION-DEBUG] No session cookie found - detailed analysis:', {
        cookiePresent: !!sessionCookie,
        cookieType: typeof sessionCookie,
        allCookiesPresent: Object.keys(allCookies).length > 0,
        cookieHeaderPresent: !!cookieHeader,
        possibleCookieIssues: [
          !cookieHeader ? 'No cookie header in request' : null,
          cookieHeader && !sessionCookie ? 'Cookie header present but session cookie missing' : null,
          sessionCookie && typeof sessionCookie !== 'string' ? 'Session cookie wrong type' : null
        ].filter(Boolean),
        suggestedFixes: [
          'Check if cookies are enabled in browser',
          'Verify cookie domain settings',
          'Check if sameSite policy is blocking cookies',
          'Ensure HTTPS is used for secure cookies'
        ]
      });
      
      return res.status(401).json({ 
        success: false, 
        error: 'No session found',
        debug: {
          cookieAnalysis: {
            present: !!sessionCookie,
            type: typeof sessionCookie,
            allCookiesCount: Object.keys(allCookies).length
          },
          suggestions: [
            'Clear browser cookies and try signing in again',
            'Enable cookies in your browser settings',
            'Try signing in from a different browser or incognito mode'
          ]
        }
      });
    }
    
    // Verify JWT token
    try {
      const decoded = jwt.verify(sessionToken, JWT_SECRET) as any;
      console.log('✅ Valid session found for user:', decoded.email);
      console.log('🔍 [SESSION-CHECK] Token payload:', {
        userId: decoded.userId,
        email: decoded.email,
        authProvider: decoded.authProvider
      });
      
      // Get fresh user data from database - try multiple lookup methods
      let user;
      
      // If we have userId in token, try that first (most reliable)
      if (decoded.userId) {
        console.log('🔍 [SESSION-CHECK] Looking up user by ID:', decoded.userId);
        user = await storage.getUser(decoded.userId);
      }
      
      // Fallback to email lookup if no user found by ID
      if (!user) {
        console.log('🔍 [SESSION-CHECK] Fallback: Looking up user by email:', decoded.email);
        user = await storage.getUserByEmail(decoded.email);
      }
      
      if (!user) {
        console.log('❌ [SESSION-CHECK] User not found in database with ID or email');
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }
      
      console.log('✅ [SESSION-CHECK] Found user:', {
        id: user.id,
        email: user.email,
        name: user.name,
        authProvider: user.authProvider || 'unknown'
      });
      
      // PROFILE PICTURE PERSISTENCE FIX: Determine photo URL with priority logic
      // Priority: 1. Custom uploaded (base64) 2. Google photo 3. Null
      let finalPhotoURL = null;
      let photoSource = 'none';
      
      if (user.photoURL) {
        if (user.photoURL.startsWith('data:image/')) {
          // Custom uploaded base64 image - highest priority
          finalPhotoURL = user.photoURL;
          photoSource = 'custom_upload';
          console.log('✅ [SESSION-CHECK] Using custom uploaded profile picture');
        } else if (user.photoURL.startsWith('http')) {
          // Google/external URL - lower priority
          finalPhotoURL = user.photoURL;
          photoSource = 'google_oauth';
          console.log('✅ [SESSION-CHECK] Using Google OAuth profile picture');
        } else {
          // Unknown format - log for debugging
          console.log('⚠️ [SESSION-CHECK] Unknown photoURL format:', user.photoURL.substring(0, 50) + '...');
          finalPhotoURL = user.photoURL;
          photoSource = 'unknown';
        }
      }
      
      console.log('🖼️ [SESSION-CHECK] Photo resolution:', {
        hasPhoto: !!finalPhotoURL,
        photoSource,
        photoLength: finalPhotoURL ? finalPhotoURL.length : 0
      });

      // Return sanitized user data (same format as OAuth callback)
      const clientUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        photoURL: finalPhotoURL,
        profileCompleted: user.profileCompleted || 0,
        authProvider: user.authProvider || 'google', // Use actual auth provider from database
        emailVerified: user.emailVerified,
        photoSource // Add photo source tracking for frontend
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