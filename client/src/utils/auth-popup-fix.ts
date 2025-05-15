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
    
    // Create a fresh Google provider
    const provider = new GoogleAuthProvider();
    
    // Set minimum necessary custom parameters
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    // Add standard scopes
    provider.addScope('email');
    provider.addScope('profile');
    
    // Track the authentication attempt
    localStorage.setItem('popup_auth_attempt', 'true');
    localStorage.setItem('popup_auth_time', new Date().toISOString());
    
    // Use the popup method
    console.log("Initiating popup authentication...");
    const result = await signInWithPopup(auth, provider);
    
    // Clean up tracking variables on success
    localStorage.removeItem('popup_auth_attempt');
    localStorage.removeItem('popup_auth_time');
    
    console.log("Popup authentication successful");
    return result;
  } catch (error: any) {
    console.error("Error in enhanced popup authentication:", error);
    
    // Log detailed error diagnostics
    logAuthError(error, "googlePopupAuth");
    
    // Clean up tracking
    localStorage.removeItem('popup_auth_attempt');
    localStorage.removeItem('popup_auth_time');
    
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