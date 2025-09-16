import { useEffect } from 'react';

/**
 * AuthCallbackHandler - DISABLED
 * Firebase authentication is disabled, using custom OAuth instead
 * This component no longer handles auth callbacks
 */
export function AuthCallbackHandler() {
  useEffect(() => {
    console.log('🔄 AuthCallbackHandler: Firebase disabled - using custom OAuth only');
    console.log('🔄 This component is disabled as we now use custom OAuth instead of Firebase');
    
    // No-op: Firebase authentication completely disabled
    // Custom OAuth handles all authentication flows through /api/auth/oauth/* endpoints
  }, []);

  return null;
}