/**
 * Replit-specific authentication workarounds
 * 
 * This utility contains special functions to fix authentication issues
 * that occur specifically in Replit development environments.
 */

import { GoogleAuthProvider } from 'firebase/auth';

/**
 * Creates a Google auth provider with enhanced parameters for Replit domains
 * This helps solve issues with popup/redirect authentication on Replit preview domains
 */
export function createEnhancedGoogleProvider(): GoogleAuthProvider {
  // Create a fresh Google provider for this attempt
  const provider = new GoogleAuthProvider();
  
  // Add required scopes for comprehensive authentication
  provider.addScope('email');
  provider.addScope('profile');
  
  // Force account selection to ensure proper auth flow
  provider.setCustomParameters({
    // Force selection UI even if already logged in
    prompt: 'select_account',
    // Request fresh authentication
    auth_type: 'reauthenticate',
    // Clear any previous login hint
    login_hint: '',
    // Include all previously granted scopes
    include_granted_scopes: 'true'
  });
  
  return provider;
}

/**
 * Check if the current domain is a Replit development domain
 * This helps determine when to use special authentication methods
 */
export function isReplitDomain(): boolean {
  const hostname = window.location.hostname;
  return hostname.includes('.replit.dev') || 
         hostname.includes('.repl.co') || 
         hostname.includes('.repl.run') ||
         hostname.includes('.id.repl.co') ||
         hostname.includes('.replit.app') ||
         hostname.includes('replit.dev') ||
         hostname.endsWith('.repl.it');
}

/**
 * Determines whether to use redirect-based authentication
 * Redirect auth is more reliable on Replit domains than popup auth
 */
export function shouldUseRedirectAuth(): boolean {
  // Always use redirect auth on Replit domains
  if (isReplitDomain()) {
    return true;
  }
  
  // Also use redirect on mobile devices
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    return true;
  }
  
  // Use redirect if the window is inside an iframe
  if (window !== window.top) {
    return true;
  }
  
  // Default to popup auth in other cases
  return false;
}

/**
 * Clear any stale authentication data from local storage
 */
export function clearAuthStorageData(): void {
  // Clear redirect attempt tracking
  localStorage.removeItem('auth_redirect_attempt');
  localStorage.removeItem('auth_redirect_time');
  localStorage.removeItem('dev_auth_redirect');
  localStorage.removeItem('dev_auth_time');
  
  // Clear any Firebase auth persistence data that might be problematic
  localStorage.removeItem('firebase:authUser');
  
  // Clear other auth-related data
  localStorage.removeItem('auth_state');
  localStorage.removeItem('auth_error');
}