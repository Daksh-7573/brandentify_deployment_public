/**
 * Firebase Authentication Redirect Handler
 * 
 * This module provides middleware to detect and handle Firebase auth redirects
 * that might be coming to URLs that our SPA router doesn't handle.
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Detects if this is a request that looks like a Firebase auth redirect
 * and handles it appropriately by redirecting to our auth-callback route
 */
export function firebaseAuthRedirectHandler(req: Request, res: Response, next: NextFunction) {
  // Firebase auth can be enabled via environment variable
  const isFirebaseEnabled = process.env.FIREBASE_AUTH_ENABLED === 'true';
  
  if (!isFirebaseEnabled) {
    console.log(`🚫 [Firebase Auth Handler] DISABLED - Firebase auth handler bypassed for: ${req.url}`);
    return next();
  }
  
  // Firebase auth is enabled - add your Firebase redirect handling logic here
  // For now, just continue to next middleware
  next();
}

export default firebaseAuthRedirectHandler;