// Replit Authentication Integration - blueprint:javascript_log_in_with_replit
import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// Environment check moved to setupAuth function to avoid startup crashes

const getOidcConfig = memoize(
  async () => {
    // Validate REPL_ID is available before making OIDC discovery call
    if (!process.env.REPL_ID) {
      throw new Error('REPL_ID environment variable is required for OIDC configuration');
    }
    
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only secure in production
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
): Promise<any> {
  // Use the mapping approach to create/update user auth mapping
  const user = await storage.upsertUserAuthMapping({
    replitUserId: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
  return user;
}

export async function setupAuth(app: Express) {
  // Environment validation - critical auth variables must be present
  const requiredEnvVars = {
    REPLIT_DOMAINS: process.env.REPLIT_DOMAINS,
    REPL_ID: process.env.REPL_ID,
    SESSION_SECRET: process.env.SESSION_SECRET,
    DATABASE_URL: process.env.DATABASE_URL
  };
  
  const missingVars = Object.entries(requiredEnvVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key);
  
  if (missingVars.length > 0) {
    const isProduction = process.env.NODE_ENV === 'production';
    const errorMessage = `Missing critical auth environment variables: ${missingVars.join(', ')}`;
    
    console.error(`🚨 AUTH SECURITY ERROR: ${errorMessage}`);
    
    if (isProduction) {
      // In production, fail closed - add middleware that returns 503 for protected routes
      console.error('🚨 PRODUCTION SECURITY: Auth disabled due to missing env vars');
      
      app.use('/api/login', (req, res) => {
        res.status(503).json({
          error: 'Authentication Service Unavailable',
          message: 'Authentication is temporarily unavailable due to configuration issues.',
          code: 'AUTH_CONFIG_ERROR'
        });
      });
      
      app.use('/api/callback', (req, res) => {
        res.status(503).json({
          error: 'Authentication Service Unavailable',
          message: 'Authentication is temporarily unavailable due to configuration issues.',
          code: 'AUTH_CONFIG_ERROR'
        });
      });
      
      app.use('/api/logout', (req, res) => {
        res.status(503).json({
          error: 'Authentication Service Unavailable',
          message: 'Authentication is temporarily unavailable due to configuration issues.',
          code: 'AUTH_CONFIG_ERROR'
        });
      });
      
      console.log('🔒 Production auth endpoints disabled - returning 503 Service Unavailable');
      return; // Skip setting up auth
    } else {
      // In development, throw error to help developers fix the issue
      throw new Error(errorMessage);
    }
  }
  
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  for (const domain of process.env
    .REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // Check if auth is properly configured first
  const requiredEnvVars = ['REPL_ID', 'SESSION_SECRET', 'REPLIT_DOMAINS'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    const isProduction = process.env.NODE_ENV === 'production';
    console.error(`🚨 AUTH MIDDLEWARE ERROR: Missing env vars: ${missingVars.join(', ')}`);
    
    if (isProduction) {
      // Fail closed in production
      return res.status(503).json({
        error: 'Authentication Service Unavailable',
        message: 'Authentication is temporarily unavailable.',
        code: 'AUTH_CONFIG_ERROR'
      });
    } else {
      // More detailed error in development
      return res.status(500).json({
        error: 'Authentication Configuration Error',
        message: `Missing required environment variables: ${missingVars.join(', ')}`,
        code: 'AUTH_CONFIG_ERROR'
      });
    }
  }
  
  const user = req.user as any;

  if (!user || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    console.error('🚨 Token refresh failed:', error);
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};