/**
 * Firebase Authentication Diagnostics Utility
 * 
 * This module provides detailed logging and diagnostic functions
 * to help troubleshoot Firebase authentication issues.
 */

import { FirebaseError } from "firebase/app";

// Common Firebase auth error codes with friendly descriptions
const AUTH_ERROR_CODES: Record<string, string> = {
  "auth/user-disabled": "This user account has been disabled by an administrator.",
  "auth/user-not-found": "No account found with this email address.",
  "auth/wrong-password": "The password is invalid.",
  "auth/email-already-in-use": "This email address is already in use.",
  "auth/weak-password": "The password is too weak.",
  "auth/invalid-email": "The email address is not valid.",
  "auth/account-exists-with-different-credential": "An account already exists with the same email address but different sign-in credentials.",
  "auth/invalid-credential": "The authentication credential is malformed or has expired.",
  "auth/operation-not-allowed": "This operation is not allowed. Enable the sign-in method in the Firebase console.",
  "auth/popup-blocked": "The authentication popup was blocked by the browser.",
  "auth/popup-closed-by-user": "The authentication popup was closed before the operation completed.",
  "auth/unauthorized-domain": "This domain is not authorized for OAuth operations.",
  "auth/network-request-failed": "A network error occurred. Check your internet connection.",
  "auth/too-many-requests": "Too many unsuccessful login attempts. Try again later.",
  "auth/internal-error": "An internal authentication error occurred.",
  "auth/requires-recent-login": "This operation requires re-authentication. Please log in again.",
};

// Log detailed information about Firebase auth errors
export function logAuthError(error: FirebaseError | Error | unknown, source: string = "auth"): void {
  if (!error) {
    console.error("[Auth Diagnostics] No error provided");
    return;
  }

  const isFirebaseError = error instanceof FirebaseError || (error as any)?.code?.startsWith("auth/");
  
  const errorDetails: Record<string, any> = {
    timestamp: new Date().toISOString(),
    source,
    type: isFirebaseError ? "FirebaseError" : error instanceof Error ? "Error" : typeof error,
  };

  // Extract Firebase specific error details
  if (isFirebaseError) {
    const firebaseError = error as FirebaseError;
    const errorCode = firebaseError.code || "unknown";
    
    errorDetails.code = errorCode;
    errorDetails.message = firebaseError.message;
    errorDetails.friendlyMessage = AUTH_ERROR_CODES[errorCode] || firebaseError.message;
    
    if (firebaseError.customData) {
      errorDetails.customData = firebaseError.customData;
    }
  } else if (error instanceof Error) {
    errorDetails.name = error.name;
    errorDetails.message = error.message;
    errorDetails.stack = error.stack;
  } else {
    errorDetails.error = error;
  }

  // Add environment diagnostics
  errorDetails.environment = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    cookiesEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    windowSize: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    hostname: window.location.hostname,
    pathname: window.location.pathname,
    hasLocalStorage: !!window.localStorage,
    hasSessionStorage: !!window.sessionStorage,
    timestamp: new Date().toISOString(),
  };

  // Check Firebase configuration in environment
  errorDetails.firebaseConfig = {
    apiKeyExists: !!import.meta.env.VITE_FIREBASE_API_KEY,
    apiKeyLength: import.meta.env.VITE_FIREBASE_API_KEY?.length || 0,
    projectIdExists: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appIdExists: !!import.meta.env.VITE_FIREBASE_APP_ID,
    appIdLength: import.meta.env.VITE_FIREBASE_APP_ID?.length || 0,
  };

  // Add any current auth attempt info from localStorage
  try {
    errorDetails.authAttempt = {
      inProgress: localStorage.getItem("authAttemptInProgress"),
      time: localStorage.getItem("authAttemptTime"),
      elapsed: localStorage.getItem("authAttemptTime") 
        ? Math.round((Date.now() - new Date(localStorage.getItem("authAttemptTime") || "").getTime()) / 1000) + "s"
        : "n/a"
    };
  } catch (e) {
    errorDetails.authAttempt = "Error reading localStorage";
  }

  // Create log prefix to make logs easier to filter
  const prefix = isFirebaseError 
    ? `[Auth Error ${errorDetails.code}]` 
    : `[Auth Diagnostic Error]`;

  // Log the full detailed diagnostic info
  console.error(prefix, errorDetails);

  // Log user-friendly message separately for easier reading
  if (isFirebaseError && AUTH_ERROR_CODES[errorDetails.code]) {
    console.warn(`${prefix} ${AUTH_ERROR_CODES[errorDetails.code]}`);
  }

  // Clear the auth attempt info if this was a completed attempt
  if (isFirebaseError && (
    errorDetails.code === 'auth/popup-closed-by-user' || 
    errorDetails.code === 'auth/cancelled-popup-request' ||
    errorDetails.code === 'auth/timeout')) {
    try {
      localStorage.removeItem("authAttemptInProgress");
      localStorage.removeItem("authAttemptTime");
    } catch (e) {
      // Ignore localStorage errors
    }
  }
}

// Check if Firebase is properly configured
export function checkFirebaseConfig(): {
  isConfigured: boolean;
  issues: string[];
  configDetails: Record<string, any>;
} {
  const issues: string[] = [];
  
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID;
  
  if (!apiKey) issues.push("Missing Firebase API Key");
  else if (apiKey.length < 30) issues.push("Firebase API Key appears to be invalid (too short)");
  
  if (!projectId) issues.push("Missing Firebase Project ID");
  
  if (!appId) issues.push("Missing Firebase App ID");
  else if (appId.length < 20) issues.push("Firebase App ID appears to be invalid (too short)");
  
  const configDetails = {
    apiKeyExists: !!apiKey,
    apiKeyLength: apiKey?.length || 0,
    projectIdExists: !!projectId,
    projectId: projectId || "undefined",
    appIdExists: !!appId,
    appIdLength: appId?.length || 0,
    authDomain: projectId ? `${projectId}.firebaseapp.com` : "undefined",
  };
  
  return {
    isConfigured: issues.length === 0,
    issues,
    configDetails
  };
}

// Get a user-friendly error message for Firebase auth errors
export function getFriendlyAuthErrorMessage(error: FirebaseError | Error | unknown): string {
  if (!error) return "An unknown authentication error occurred";
  
  if (error instanceof FirebaseError || (error as any)?.code?.startsWith("auth/")) {
    const errorCode = (error as FirebaseError).code || "unknown";
    return AUTH_ERROR_CODES[errorCode] || (error as FirebaseError).message || "An authentication error occurred";
  }
  
  if (error instanceof Error) {
    // Check for common network-related errors
    if (error.message.includes("network") || error.message.includes("connection")) {
      return "A network error occurred. Please check your internet connection and try again.";
    }
    
    if (error.message.includes("timeout")) {
      return "The authentication request timed out. Please try again.";
    }
    
    return error.message;
  }
  
  return "An unexpected authentication error occurred";
}