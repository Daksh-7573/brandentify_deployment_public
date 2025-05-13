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
  const url = req.url;
  
  // Common Firebase auth redirect paths
  const authPaths = [
    '/__/auth/handler',
    '/_/auth/callback',
    '/auth/action'
  ];
  
  // Check if this request looks like a Firebase auth redirect
  const isAuthPath = authPaths.some(path => url.startsWith(path));
  
  // Check for auth parameters in the URL
  const hasAuthParams = req.query.apiKey || 
                        req.query.mode || 
                        req.query.oobCode ||
                        req.query.state || 
                        req.query.code;
  
  if (isAuthPath || hasAuthParams) {
    console.log(`[Firebase Auth Handler] Detected auth redirect to: ${url}`);
    
    // Rebuild the query string
    const queryString = Object.keys(req.query)
      .map(key => `${key}=${encodeURIComponent(String(req.query[key]))}`)
      .join('&');
    
    // Redirect to our SPA auth-callback route
    const redirectTo = `/auth-callback${queryString ? '?' + queryString : ''}`;
    console.log(`[Firebase Auth Handler] Redirecting to: ${redirectTo}`);
    
    return res.redirect(redirectTo);
  }
  
  // Not an auth redirect, continue
  next();
}

export default firebaseAuthRedirectHandler;