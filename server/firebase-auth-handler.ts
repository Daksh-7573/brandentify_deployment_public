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
  // FIREBASE COMPLETELY DISABLED - No longer intercept auth redirects
  console.log(`🚫 [Firebase Auth Handler] DISABLED - Firebase auth handler bypassed for: ${req.url}`);
  
  // Always continue to next middleware - no interception
  next();
}

export default firebaseAuthRedirectHandler;