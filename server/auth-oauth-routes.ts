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
const CSRF_SECRET = process.env.CSRF_SECRET || 'brandentifier-csrf-secret-key-2025';

// Allowed redirect URIs (whitelist for security) - Using API routes to avoid client route collision
// Note: Dynamic Replit domains rely on brandentifier.replit.app + cross-domain handoff
const ALLOWED_REDIRECT_URIS = [
  'https://brandentifier.replit.app/api/auth/google/callback',
  'https://brandentifier.com/api/auth/google/callback',
  'http://localhost:5000/api/auth/google/callback',
  'http://127.0.0.1:5000/api/auth/google/callback'
];

// Improved domain pattern matching for Replit environments
const REPLIT_DOMAIN_PATTERNS = [
  /^[a-zA-Z0-9-]+\.replit\.app$/,                    // Published domains like brandentifier.replit.app
  /^[a-zA-Z0-9-]+\.replit\.dev$/,                    // Preview domains like simple.replit.dev
  /^[a-f0-9-]+\.picard\.replit\.dev$/,               // Basic picard preview pattern
  /^[a-f0-9-]+-[a-f0-9-]+-[a-zA-Z0-9-]+\.picard\.replit\.dev$/ // Full picard subdomain pattern like 25d68c5d-166d-4f92-b5c1-cdfc68146e33-00-2kol6l2kz9i0s.picard.replit.dev
];

/**
 * Determine the correct redirect URI based on the requesting domain
 * Uses requesting domain if whitelisted, otherwise falls back to brandentifier.replit.app
 */
function getRedirectUriForHost(host: string): string {
  const isDevelopment = host.includes('localhost') || host.includes('127.0.0.1');
  const isBrandentifierCom = host.includes('brandentifier.com');
  const isReplitDomain = REPLIT_DOMAIN_PATTERNS.some(pattern => pattern.test(host));
  
  // Check if current domain has a whitelisted redirect URI
  const potentialRedirectUri = isDevelopment 
    ? `http://${host}/api/auth/google/callback`
    : `https://${host}/api/auth/google/callback`;
  
  if (ALLOWED_REDIRECT_URIS.includes(potentialRedirectUri)) {
    console.log('✅ [REDIRECT-URI] Using current domain redirect URI (whitelisted):', potentialRedirectUri);
    return potentialRedirectUri;
  }
  
  // Domain-specific logic for non-whitelisted domains
  if (isDevelopment) {
    return 'http://localhost:5000/api/auth/google/callback';
  } else if (isBrandentifierCom) {
    return 'https://brandentifier.com/api/auth/google/callback';
  } else if (isReplitDomain) {
    console.log('⚠️ [REDIRECT-URI] Replit domain not whitelisted, using fallback:', host);
    return 'https://brandentifier.replit.app/api/auth/google/callback';
  } else {
    console.log('⚠️ [REDIRECT-URI] Unknown domain, using fallback:', host);
    return 'https://brandentifier.replit.app/api/auth/google/callback';
  }
}

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

// Clean up expired states and session exchange codes every 10 minutes
setInterval(() => {
  const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;
  const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
  const eightMinutesAgo = Date.now() - 8 * 60 * 1000;
  
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
  
  // Clean up expired session exchange codes (10 minutes) with expiration warnings (8 minutes)
  let deletedExchangeCount = 0;
  let warningCount = 0;
  for (const [code, data] of Array.from(sessionExchangeStore.entries())) {
    if (data.timestamp < tenMinutesAgo) {
      sessionExchangeStore.delete(code);
      deletedExchangeCount++;
    } else if (data.timestamp < eightMinutesAgo) {
      console.warn(`⚠️ [EXCHANGE-WARNING] Session exchange code expiring soon: ${code.substring(0, 10)}... (${Math.floor((Date.now() - data.timestamp) / 1000)}s old)`);
      warningCount++;
    }
  }
  if (deletedExchangeCount > 0) {
    console.log(`🧹 [EXCHANGE-CLEANUP] Removed ${deletedExchangeCount} expired session exchange codes`);
  }
  if (warningCount > 0) {
    console.log(`⏰ [EXCHANGE-WARNING] ${warningCount} session exchange codes will expire in 2 minutes`);
  }
}, 10 * 60 * 1000);

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing Google OAuth credentials. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET');
}

/**
 * Canonicalize host for secure comparison
 * - Converts to lowercase for case-insensitive comparison
 * - Strips default ports (80 for HTTP, 443 for HTTPS)
 * - Handles edge cases for localhost and development environments
 */
function canonicalizeHost(host: string): string {
  if (!host) return '';
  
  // Convert to lowercase for case-insensitive comparison
  let canonicalHost = host.toLowerCase().trim();
  
  // Handle common edge cases
  if (canonicalHost === 'localhost' || canonicalHost === '127.0.0.1') {
    return canonicalHost;
  }
  
  // Strip default ports
  if (canonicalHost.endsWith(':80')) {
    canonicalHost = canonicalHost.replace(':80', '');
  } else if (canonicalHost.endsWith(':443')) {
    canonicalHost = canonicalHost.replace(':443', '');
  }
  
  return canonicalHost;
}

/**
 * Generate CSRF token for localStorage authentication
 */
function generateCSRFToken(userId?: number): string {
  const tokenId = crypto.randomBytes(32).toString('hex');
  const timestamp = Date.now();
  
  const csrfData = {
    tokenId,
    userId,
    timestamp,
    nonce: crypto.randomBytes(16).toString('hex')
  };
  
  // Sign the CSRF data to prevent tampering
  const signedToken = jwt.sign(csrfData, CSRF_SECRET, { 
    algorithm: 'HS256',
    expiresIn: '1h'  // CSRF tokens expire in 1 hour
  });
  
  console.log(`🛡️ [CSRF-OAUTH] Generated CSRF token for user ${userId || 'anonymous'}`);
  return signedToken;
}

/**
 * Send hybrid authentication response with both cookie and localStorage token
 * Returns HTML page that sets up localStorage auth and redirects to dashboard
 */
function sendHybridAuthResponse(res: Response, sessionToken: string, userOrId: any) {
  const userId = typeof userOrId === 'object' ? userOrId.id : userOrId;
  const csrfToken = generateCSRFToken(userId);
  
  console.log('🔄 [HYBRID-AUTH] Setting up hybrid authentication response');
  
  const hybridAuthHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Brandentifier - Authentication Setup</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .auth-container {
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            padding: 2rem;
            border-radius: 12px;
            backdrop-filter: blur(10px);
        }
        .spinner {
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top: 3px solid white;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .message {
            font-size: 18px;
            margin-bottom: 0.5rem;
        }
        .sub-message {
            font-size: 14px;
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div class="auth-container">
        <div class="spinner"></div>
        <div class="message">Setting up your account...</div>
        <div class="sub-message">Configuring cross-domain authentication</div>
    </div>
    
    <script>
        console.log('🚀 [HYBRID-AUTH] Initializing hybrid authentication setup');
        
        try {
            // Store JWT token in localStorage for cross-domain compatibility
            const token = '${sessionToken}';
            const csrfToken = '${csrfToken}';
            const userData = ${JSON.stringify(typeof userOrId === 'object' ? {
              id: userOrId.id,
              email: userOrId.email,
              name: userOrId.name,
              photoURL: userOrId.photoURL,
              username: userOrId.username
            } : { id: userOrId })};
            
            // Storage keys (matching auth-context.tsx)
            const STORAGE_KEYS = {
                JWT_TOKEN: 'brandentifier_jwt_token',
                USER_DATA: 'brandentifier_user_data',
                CSRF_TOKEN: 'brandentifier_csrf_token',
                AUTH_METHOD: 'brandentifier_auth_method',
                TOKEN_EXPIRY: 'brandentifier_token_expiry'
            };
            
            // Store authentication data in localStorage
            localStorage.setItem(STORAGE_KEYS.JWT_TOKEN, token);
            localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
            localStorage.setItem(STORAGE_KEYS.CSRF_TOKEN, csrfToken);
            localStorage.setItem(STORAGE_KEYS.AUTH_METHOD, 'localStorage');
            
            // Store token expiry for easy checking
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, payload.exp.toString());
            } catch (error) {
                console.warn('[HYBRID-AUTH] Error parsing token for expiry storage:', error);
            }
            
            console.log('✅ [HYBRID-AUTH] Authentication data stored successfully');
            console.log('🔄 [HYBRID-AUTH] Redirecting to dashboard');
            
            // Broadcast storage event for cross-tab sync
            window.dispatchEvent(new StorageEvent('storage', {
                key: STORAGE_KEYS.JWT_TOKEN,
                newValue: token,
                storageArea: localStorage
            }));
            
            // Redirect to dashboard after successful setup
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);
            
        } catch (error) {
            console.error('❌ [HYBRID-AUTH] Error setting up authentication:', error);
            
            // Fallback redirect even if localStorage setup fails
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 2000);
        }
    </script>
</body>
</html>`;
  
  res.set({
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'X-Auth-Method': 'hybrid',
    'X-CSRF-Token': csrfToken
  });
  
  console.log('📤 [HYBRID-AUTH] Sending hybrid authentication response');
  return res.send(hybridAuthHtml);
}

/**
 * Check if two hosts match after canonicalization
 * Provides robust host comparison with tolerance for case and default ports
 */
function hostsMatch(host1: string, host2: string): boolean {
  const canonical1 = canonicalizeHost(host1);
  const canonical2 = canonicalizeHost(host2);
  
  console.log('🔍 [HOST-COMPARISON] Comparing hosts:', {
    original1: host1,
    original2: host2,
    canonical1,
    canonical2,
    match: canonical1 === canonical2
  });
  
  return canonical1 === canonical2;
}

/**
 * Determine secure cookie options for the given host
 * SECURITY: Never sets domain attribute to parent domains - always host-only or exact FQDN
 */
function getSecureCookieOptions(host: string, isHttps: boolean) {
  const canonicalHost = canonicalizeHost(host);
  
  console.log('🍪 [COOKIE-SECURITY] Analyzing host for secure cookie options:', {
    originalHost: host,
    canonicalHost,
    isHttps,
    isDevelopment: canonicalHost.includes('localhost') || canonicalHost.includes('127.0.0.1')
  });
  
  // CRITICAL SECURITY: Validate domain patterns to prevent parent domain vulnerabilities
  const isPicardDomain = canonicalHost.includes('.picard.replit.dev');
  const isReplitAppDomain = canonicalHost.includes('.replit.app');
  const isBrandentifierCom = canonicalHost.includes('brandentifier.com');
  const isDevelopment = canonicalHost.includes('localhost') || canonicalHost.includes('127.0.0.1');
  
  // Base cookie options with security defaults
  const cookieOptions = {
    httpOnly: true,
    secure: isHttps,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  
  // SECURITY RULE: Always use host-only cookies (no domain attribute) for maximum security
  // This prevents cookie sharing across subdomains which could be a security vulnerability
  console.log('🔒 [COOKIE-SECURITY] Using host-only cookie (no domain attribute) for maximum security');
  
  // Validate that we're not accidentally setting parent domains
  if (isPicardDomain) {
    console.log('✅ [COOKIE-SECURITY] Picard domain detected - using host-only cookie');
  } else if (isReplitAppDomain) {
    console.log('✅ [COOKIE-SECURITY] Replit.app domain detected - using host-only cookie');  
  } else if (isBrandentifierCom) {
    console.log('✅ [COOKIE-SECURITY] Brandentifier.com domain detected - using host-only cookie');
  } else if (isDevelopment) {
    console.log('✅ [COOKIE-SECURITY] Development environment detected - using host-only cookie');
  } else {
    console.warn('⚠️ [COOKIE-SECURITY] Unknown domain pattern - using host-only cookie for safety');
  }
  
  return cookieOptions;
}

/**
 * Generate Google OAuth URL - avoids Firebase routing issues
 */
export async function createGoogleOAuthURLRoute(req: Request, res: Response) {
  try {
    console.log('🚀 Creating Google OAuth URL');
    
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
    
    // Use requesting domain as redirect URI when whitelisted, otherwise fallback
    const redirectUri = getRedirectUriForHost(host);
    const returnHost = host;
    
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
    console.log('🔄 [OAUTH CALLBACK] Processing Google OAuth callback');
    console.log('🔄 [OAUTH CALLBACK] Request initiated from host:', req.get('host'));
    console.log('🔄 [OAUTH CALLBACK] Request method:', req.method);
    
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
    
    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error);
      return res.redirect('/auth?error=oauth_error');
    }
    
    if (!code || !state) {
      console.error('Missing authorization code or state');
      return res.redirect('/auth?error=missing_params');
    }
    
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
      return res.redirect('/auth?error=invalid_state');
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
      return res.redirect('/auth?error=expired_state');
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
    
    // Use requesting domain as redirect URI when whitelisted, otherwise fallback (must match URL generation)
    const redirectUri = getRedirectUriForHost(host);
    
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
    console.log('✅ User info received from Google OAuth');
    
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
    console.log('🔍 [AUTH-FIX] Looking up existing user by Google ID');
    
    // FIXED: Check by Google ID first to prevent duplicate users across domains
    let existingUser = await storage.getUserByGoogleId(userData.googleId);
    let user;
    
    if (existingUser) {
      console.log('✅ [AUTH-FIX] Found existing user by Google ID:', {
        id: existingUser.id,
        hasEmail: !!existingUser.email,
        hasName: !!existingUser.name
      });
      // Update existing user with latest Google info
      user = await storage.updateUser(existingUser.id, {
        name: userData.name,
        photoURL: userData.photoURL,
        googleId: userData.googleId,
        firebaseUid: userData.firebaseUid,
        authProvider: 'google',
        lastLoginAt: new Date()
      });
      console.log('✅ [AUTH-FIX] Updated existing user profile');
    } else {
      // Fallback: check by email for legacy users who may not have googleId stored
      console.log('🔍 [AUTH-FIX] No user found by Google ID, checking by email as fallback');
      const userByEmail = await storage.getUserByEmail(userData.email);
      
      if (userByEmail) {
        console.log('✅ [AUTH-FIX] Found legacy user by email, updating with Google ID');
        // Update legacy user with Google ID fields
        user = await storage.updateUser(userByEmail.id, {
          name: userData.name,
          photoURL: userData.photoURL,
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
      }
    }
    
    if (!user) {
      throw new Error('Failed to create or update user');
    }
    
    console.log('✅ User saved successfully:', {
      id: user.id,
      hasEmail: !!user.email,
      hasName: !!user.name
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
      id: user.id,
      hasUsername: !!user.username,
      authProvider: 'google'
    });
    
    // Check if cross-domain session handoff is needed
    const currentHost = req.get('host') || 'localhost:5000';
    const needsCrossDomainHandoff = returnHost !== currentHost;
    
    console.log('🔍 [SESSION-HANDOFF] Domain analysis:', {
      currentHost,
      returnHost,
      needsCrossDomainHandoff
    });
    
    if (needsCrossDomainHandoff) {
      const handoffStartTime = Date.now();
      
      // Generate secure session exchange code for cross-domain handoff
      const exchangeCode = crypto.randomBytes(32).toString('base64url');
      
      console.log('🔄 [SESSION-HANDOFF] Cross-domain handoff initiated:', {
        startTime: new Date(handoffStartTime).toISOString(),
        currentHost,
        returnHost,
        userId: user.id,
        exchangeCodePrefix: exchangeCode.substring(0, 10) + '...'
      });
      
      // Store session exchange data (expires in 10 minutes, single-use)
      const exchangeData = {
        sessionToken,
        timestamp: handoffStartTime,
        returnHost,
        userId: user.id
      };
      
      sessionExchangeStore.set(exchangeCode, exchangeData);
      
      console.log('💾 [SESSION-HANDOFF] Exchange data stored:', {
        exchangeCodePrefix: exchangeCode.substring(0, 10) + '...',
        expiresAt: new Date(handoffStartTime + 10 * 60 * 1000).toISOString(),
        storeSize: sessionExchangeStore.size,
        returnHostPattern: REPLIT_DOMAIN_PATTERNS.find(p => p.test(returnHost))?.toString() || 'no-pattern-match'
      });
      
      // Build session acceptance URL on return domain
      const sessionAcceptUrl = returnHost.includes('localhost') 
        ? `http://${returnHost}/auth/accept-session?code=${exchangeCode}`
        : `https://${returnHost}/auth/accept-session?code=${exchangeCode}`;
      
      console.log('🚀 [SESSION-HANDOFF] Redirecting to session accept URL:', {
        url: sessionAcceptUrl,
        protocol: sessionAcceptUrl.startsWith('https') ? 'HTTPS' : 'HTTP',
        timingMs: Date.now() - handoffStartTime
      });
      
      return res.redirect(303, sessionAcceptUrl);
    } else {
      // Same domain - set cookie and provide token for localStorage (hybrid auth)
      const isHttps = req.secure || req.get('X-Forwarded-Proto') === 'https';
      
      // SECURITY FIX: Use secure cookie options with host-only setting
      const cookieOptions = getSecureCookieOptions(currentHost, isHttps);
      
      console.log('🍪 [SESSION-HANDOFF] Same domain - setting secure host-only cookie:', {
        host: currentHost,
        sameSite: cookieOptions.sameSite,
        secure: cookieOptions.secure,
        isHttps: isHttps,
        hostOnlyMode: true // No domain attribute = host-only cookie
      });
      
      res.cookie('brandentifier_session', sessionToken, cookieOptions);
      
      console.log('✅ [SESSION-HANDOFF] Same domain hybrid auth setup (cookie + localStorage)');
      return sendHybridAuthResponse(res, sessionToken, user);
    }
    
  } catch (error: any) {
    console.error('❌ OAuth callback error:', error);
    res.redirect(`/auth?error=callback_error&message=${encodeURIComponent(error.message)}`);
  }
}

/**
 * Accept session from cross-domain handoff - validates exchange code and sets session cookie
 */
export async function acceptSessionRoute(req: Request, res: Response) {
  let acceptStartTime = Date.now();
  
  try {
    const currentHost = req.get('host') || 'unknown';
    
    console.log('🔄 [SESSION-ACCEPT] Processing session acceptance:', {
      startTime: new Date(acceptStartTime).toISOString(),
      host: currentHost,
      userAgent: req.get('user-agent')?.substring(0, 50) || 'unknown',
      ip: req.ip || 'unknown',
      hasExchangeCode: !!req.query.code
    });
    
    // Set cache control headers
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store',
      'X-Auth-Handler': 'session-accept',
      'X-Auth-Timestamp': new Date().toISOString(),
      'X-Auth-Host': currentHost,
      'X-Session-Accept-Start': acceptStartTime.toString()
    });
    
    const { code } = req.query;
    
    // Enhanced validation for missing or malformed exchange codes
    if (!code) {
      console.error('❌ [SESSION-ACCEPT] Missing exchange code parameter:', {
        queryParams: Object.keys(req.query),
        url: req.url,
        referer: req.get('referer') || 'none'
      });
      
      // UX FIX: Return proper redirect instead of JSON response
      const redirectUrl = '/auth?error=missing_exchange_code&retry=true';
      console.log('🚀 [SESSION-ACCEPT] Redirecting to auth page with missing code error:', redirectUrl);
      return res.redirect(302, redirectUrl);
    }
    
    if (typeof code !== 'string' || code.length < 10) {
      console.error('❌ [SESSION-ACCEPT] Invalid exchange code format:', {
        codeType: typeof code,
        codeLength: typeof code === 'string' ? code.length : 'N/A',
        codePreview: typeof code === 'string' ? code.substring(0, 5) + '...' : 'N/A'
      });
      
      // UX FIX: Return proper redirect instead of JSON response
      const redirectUrl = '/auth?error=invalid_exchange_code&retry=true';
      console.log('🚀 [SESSION-ACCEPT] Redirecting to auth page with invalid code error:', redirectUrl);
      return res.redirect(302, redirectUrl);
    }
    
    // Enhanced exchange code lookup with detailed diagnostics
    console.log('🔍 [SESSION-ACCEPT] Looking up exchange code:', {
      codePrefix: code.substring(0, 10) + '...',
      storeSize: sessionExchangeStore.size,
      lookupTime: new Date().toISOString()
    });
    
    const exchangeData = sessionExchangeStore.get(code);
    
    if (!exchangeData) {
      const diagnosticInfo = {
        codeProvided: code.substring(0, 10) + '...',
        storeSize: sessionExchangeStore.size,
        allCodes: Array.from(sessionExchangeStore.keys()).map(k => k.substring(0, 10) + '...'),
        possibleCauses: [
          sessionExchangeStore.size === 0 ? 'No exchange codes in store' : null,
          'Code already used (single-use)',
          'Code expired and cleaned up',
          'Code never generated (OAuth flow incomplete)'
        ].filter(Boolean)
      };
      
      console.error('❌ [SESSION-ACCEPT] Exchange code not found or already used:', diagnosticInfo);
      
      // UX FIX: Return proper redirect instead of JSON response
      const redirectUrl = '/auth?error=exchange_code_not_found&retry=true';
      console.log('🚀 [SESSION-ACCEPT] Redirecting to auth page with code not found error:', redirectUrl);
      return res.redirect(302, redirectUrl);
    }
    
    console.log('✅ [SESSION-ACCEPT] Exchange code found:', {
      userId: exchangeData.userId,
      returnHost: exchangeData.returnHost,
      generatedAt: new Date(exchangeData.timestamp).toISOString(),
      ageSeconds: Math.floor((Date.now() - exchangeData.timestamp) / 1000)
    });
    
    // Enhanced exchange code validation with detailed timing
    acceptStartTime = Date.now();
    const codeAge = acceptStartTime - exchangeData.timestamp;
    const tenMinutesAgo = acceptStartTime - 10 * 60 * 1000;
    const eightMinutesAgo = acceptStartTime - 8 * 60 * 1000;
    
    console.log('⏱️ [SESSION-ACCEPT] Exchange code timing analysis:', {
      codeGeneratedAt: new Date(exchangeData.timestamp).toISOString(),
      currentTime: new Date(acceptStartTime).toISOString(),
      ageSeconds: Math.floor(codeAge / 1000),
      maxAgeSeconds: 10 * 60,
      isExpired: exchangeData.timestamp < tenMinutesAgo,
      isNearExpiry: exchangeData.timestamp < eightMinutesAgo
    });
    
    // Check exchange code age (max 10 minutes)
    if (exchangeData.timestamp < tenMinutesAgo) {
      const errorDetails = {
        codeAge: Math.floor(codeAge / 1000) + ' seconds',
        maxAge: '600 seconds (10 minutes)',
        expiredBy: Math.floor((tenMinutesAgo - exchangeData.timestamp) / 1000) + ' seconds',
        codePrefix: code.substring(0, 10) + '...'
      };
      
      console.error('❌ [SESSION-ACCEPT] Exchange code expired:', errorDetails);
      
      // CLEANUP FIX: Delete expired code immediately since it's clearly expired
      sessionExchangeStore.delete(code);
      
      // UX FIX: Return proper redirect instead of JSON response
      const redirectUrl = '/auth?error=exchange_code_expired&retry=true';
      console.log('🚀 [SESSION-ACCEPT] Redirecting to auth page with expired code error:', redirectUrl);
      return res.redirect(302, redirectUrl);
    }
    
    // Warning for codes nearing expiry
    if (exchangeData.timestamp < eightMinutesAgo) {
      console.warn('⚠️ [SESSION-ACCEPT] Exchange code is nearing expiry:', {
        ageSeconds: Math.floor(codeAge / 1000),
        remainingSeconds: 600 - Math.floor(codeAge / 1000)
      });
    }
    
    // SECURITY FIX: Enhanced host validation with canonicalized comparison
    const expectedHost = exchangeData.returnHost;
    
    console.log('🌐 [SESSION-ACCEPT] Host validation with canonicalization:', {
      expectedHost,
      actualHost: currentHost,
      expectedCanonical: canonicalizeHost(expectedHost),
      actualCanonical: canonicalizeHost(currentHost),
      currentHostPattern: REPLIT_DOMAIN_PATTERNS.find(p => p.test(currentHost))?.toString() || 'no-pattern-match',
      expectedHostPattern: REPLIT_DOMAIN_PATTERNS.find(p => p.test(expectedHost))?.toString() || 'no-pattern-match'
    });
    
    // Use robust host comparison with canonicalization
    if (!hostsMatch(expectedHost, currentHost)) {
      const errorDetails = {
        expectedHost,
        actualHost: currentHost,
        expectedCanonical: canonicalizeHost(expectedHost),
        actualCanonical: canonicalizeHost(currentHost),
        isPicardDomain: currentHost.includes('.picard.replit.dev'),
        isReplitDomain: REPLIT_DOMAIN_PATTERNS.some(p => p.test(currentHost))
      };
      
      console.error('❌ [SESSION-ACCEPT] Host mismatch after canonicalization:', errorDetails);
      
      // UX FIX: Return proper redirect instead of JSON response
      const redirectUrl = `/auth?error=host_mismatch&expected=${encodeURIComponent(expectedHost)}&actual=${encodeURIComponent(currentHost)}&retry=true`;
      console.log('🚀 [SESSION-ACCEPT] Redirecting to auth page with host mismatch error:', redirectUrl);
      return res.redirect(302, redirectUrl);
    }
    
    const validationEndTime = Date.now();
    
    console.log('✅ [SESSION-ACCEPT] All validations passed, proceeding with cookie setup:', {
      validationDurationMs: validationEndTime - acceptStartTime,
      exchangeCodePrefix: code.substring(0, 10) + '...',
      validatedAt: new Date(validationEndTime).toISOString()
    });
    
    // EXCHANGE CODE CLEANUP FIX: Don't delete exchange code yet - only after successful operations
    
    // SECURITY FIX: Use secure cookie options with host-only setting
    const isHttps = req.secure || req.get('X-Forwarded-Proto') === 'https';
    const cookieOptions = getSecureCookieOptions(currentHost, isHttps);
    
    console.log('🍪 [SESSION-ACCEPT] Setting secure host-only cookie:', {
      host: currentHost,
      sameSite: cookieOptions.sameSite,
      secure: cookieOptions.secure,
      isHttps: isHttps,
      hostOnlyMode: true, // No domain attribute = host-only cookie for maximum security
      isPicardDomain: currentHost.includes('.picard.replit.dev'),
      isReplitDomain: REPLIT_DOMAIN_PATTERNS.some(p => p.test(currentHost))
    });
    
    // Set the session cookie with enhanced security settings
    res.cookie('brandentifier_session', exchangeData.sessionToken, cookieOptions);
    
    console.log('🍪 [SESSION-ACCEPT] Session cookie set successfully:', {
      cookieName: 'brandentifier_session',
      tokenLength: exchangeData.sessionToken.length,
      domain: currentHost,
      options: cookieOptions,
      setAt: new Date().toISOString()
    });
    
    const handoffDuration = Date.now() - acceptStartTime;
    const totalSessionHandoffTime = Date.now() - exchangeData.timestamp;
    
    console.log('✅ [SESSION-ACCEPT] Session handoff completed successfully:', {
      userId: exchangeData.userId,
      handoffDurationMs: handoffDuration,
      totalSessionHandoffMs: totalSessionHandoffTime,
      completedAt: new Date().toISOString(),
      finalHost: currentHost,
      cookieSecure: cookieOptions.secure
    });
    
    // Performance tracking for cross-domain handoffs
    if (totalSessionHandoffTime > 30000) { // More than 30 seconds
      console.warn('⚠️ [SESSION-ACCEPT] Slow session handoff detected:', {
        totalTimeMs: totalSessionHandoffTime,
        threshold: 30000,
        possibleCause: 'Network latency or user delay'
      });
    }
    
    // EXCHANGE CODE CLEANUP FIX: Only delete exchange code after successful cookie setting and redirect
    // This improves error recovery - if redirect fails, code is still available for retry
    sessionExchangeStore.delete(code);
    console.log('✅ [SESSION-ACCEPT] Exchange code deleted after successful operations:', {
      codePrefix: code.substring(0, 10) + '...',
      remainingCodes: sessionExchangeStore.size
    });
    
    // Hybrid auth setup (cookie + localStorage) and redirect to dashboard
    console.log('✅ [SESSION-ACCEPT] Setting up hybrid authentication (cookie + localStorage)');
    return sendHybridAuthResponse(res, exchangeData.sessionToken, exchangeData.userId);
    
  } catch (error: any) {
    console.error('❌ [SESSION-ACCEPT] Unexpected session acceptance error:', {
      errorMessage: error.message,
      errorStack: error.stack?.substring(0, 500), // Truncated stack trace
      host: req.get('host'),
      exchangeCodeProvided: !!req.query.code,
      timestamp: new Date().toISOString()
    });
    
    // UX FIX: Return proper redirect instead of JSON response for unexpected errors
    const redirectUrl = '/auth?error=session_accept_error&retry=true';
    console.log('🚀 [SESSION-ACCEPT] Redirecting to auth page with unexpected error:', redirectUrl);
    return res.redirect(302, redirectUrl);
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
    
    // Debug logging for session validation
    const requestHost = req.get('host');
    console.log('🍪 Session Debug:', {
      host: requestHost,
      cookiePresent: !!req.cookies?.brandentifier_session,
      cookieStart: req.cookies?.brandentifier_session ? req.cookies.brandentifier_session.substring(0, 20) + '...' : 'none',
      userAgent: req.get('user-agent')?.substring(0, 50)
    });
    
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
      
      // Include CSRF token for localStorage auth requests
      const csrfToken = generateCSRFToken(user.id);
      
      return res.json({
        success: true,
        user: clientUser,
        csrfToken: csrfToken
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