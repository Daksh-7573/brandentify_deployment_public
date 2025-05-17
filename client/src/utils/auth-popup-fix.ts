/**
 * Google Authentication Popup Fix
 * 
 * This utility ensures that Google authentication works consistently across
 * different domains, especially in Replit environments.
 * 
 * It provides a dedicated popup authentication mechanism that is more reliable
 * than the standard Firebase auth methods in certain environments.
 */

import { Auth, GoogleAuthProvider, signInWithPopup, UserCredential } from "firebase/auth";
import { logAuthError } from "./auth-diagnostics";

/**
 * Performs Google authentication using a popup window with additional error handling
 * and browser compatibility fixes specific to the Replit environment.
 * 
 * @param auth Firebase Auth instance
 * @returns A promise resolving to the UserCredential on success
 */
export async function googlePopupAuth(auth: Auth): Promise<UserCredential> {
  try {
    console.log("Starting enhanced Google popup authentication");
    
    // Create a fresh Google provider and explicitly force Google provider
    const provider = new GoogleAuthProvider();
    
    // Force Google selection - this is critical for ensuring Google auth is used
    provider.setCustomParameters({
      prompt: 'select_account',
      // Force Google auth selection to prevent Firebase auto-selection
      auth_type: 'reauthenticate',
      // Ensure login UI shows all accounts, including Google accounts
      select_account: 'true'
    });
    
    // Add standard scopes
    provider.addScope('email');
    provider.addScope('profile');
    // Additional scope for better Google account access
    provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
    
    // Track the authentication attempt
    localStorage.setItem('popup_auth_attempt', 'true');
    localStorage.setItem('popup_auth_time', new Date().toISOString());
    localStorage.setItem('auth_provider', 'google');
    
    // Use the popup method with the specially configured provider
    console.log("Initiating Google popup authentication...");
    const result = await signInWithPopup(auth, provider);
    
    // Verify this is a Google sign-in
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential) {
      console.warn("Google credential not found in result");
    } else {
      console.log("Confirmed Google authentication");
    }
    
    // Clean up tracking variables on success
    localStorage.removeItem('popup_auth_attempt');
    localStorage.removeItem('popup_auth_time');
    localStorage.removeItem('auth_provider');
    
    console.log("Google popup authentication successful");
    return result;
  } catch (error: any) {
    console.error("Error in enhanced Google popup authentication:", error);
    
    // Log detailed error diagnostics
    logAuthError(error, "googlePopupAuth");
    
    // Clean up tracking
    localStorage.removeItem('popup_auth_attempt');
    localStorage.removeItem('popup_auth_time');
    localStorage.removeItem('auth_provider');
    
    // Re-throw to allow caller to handle or display error
    throw error;
  }
}

/**
 * Checks if the current page is likely a redirect result page from Google authentication
 */
export function isGoogleAuthRedirect(): boolean {
  // Check for common OAuth redirect parameters
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has('code') || urlParams.has('state') || urlParams.has('error');
}

/**
 * Checks for any previous authentication attempts
 */
export function hasPreviousAuthAttempt(): boolean {
  return localStorage.getItem('popup_auth_attempt') === 'true';
}

/**
 * Clears any stored authentication attempt data
 */
export function clearAuthAttemptData(): void {
  localStorage.removeItem('popup_auth_attempt');
  localStorage.removeItem('popup_auth_time');
  localStorage.removeItem('authAttemptInProgress');
  localStorage.removeItem('authAttemptTime');
  localStorage.removeItem('auth_redirect_origin');
  localStorage.removeItem('auth_redirect_hostname');
}

export default {
  googlePopupAuth,
  isGoogleAuthRedirect,
  hasPreviousAuthAttempt,
  clearAuthAttemptData
};