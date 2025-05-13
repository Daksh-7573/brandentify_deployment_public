/**
 * Advanced Firebase Authentication Error Logger
 * 
 * This utility provides comprehensive debugging for Firebase authentication issues,
 * especially those related to the OAuth redirect flow.
 */

// Function to log OAuth flow details
export function logOAuthFlowDetails() {
  // Check for URL parameters that might indicate OAuth flow issues
  const urlParams = new URLSearchParams(window.location.search);
  
  // Log the current URL and any query parameters
  console.log('=== OAuth Flow Debug Info ===');
  console.log('Current URL:', window.location.href);
  console.log('Query parameters:', Object.fromEntries(urlParams.entries()));
  
  // Check for error parameters in the URL
  const error = urlParams.get('error');
  const errorCode = urlParams.get('error_code');
  const errorMessage = urlParams.get('error_message');
  
  if (error || errorCode || errorMessage) {
    console.error('OAuth Error detected in URL:', {
      error,
      errorCode,
      errorMessage
    });
  }
  
  // Check for common auth parameters
  const authCode = urlParams.get('code');
  const state = urlParams.get('state');
  const mode = urlParams.get('mode');
  
  if (authCode) {
    console.log('Auth code present in URL:', authCode.substring(0, 5) + '...');
  }
  
  if (state) {
    console.log('State parameter present in URL');
  }
  
  if (mode) {
    console.log('Mode parameter:', mode);
  }
  
  // Check for previous auth attempts in localStorage
  const previousAttempt = localStorage.getItem('authAttemptInProgress');
  const attemptTime = localStorage.getItem('authAttemptTime');
  
  if (previousAttempt) {
    console.log('Previous auth attempt found. Started at:', attemptTime);
  }
  
  // Log domain information
  const currentHostname = window.location.hostname;
  const isProblemDomain = currentHostname === "25d68c5d-166d-4f92-b5c1-cdfc68146e33-00-2kol6l2kz9i0s.picard.replit.dev";
  
  console.log('Domain information:', {
    hostname: currentHostname,
    origin: window.location.origin,
    isProblemDomain,
    protocol: window.location.protocol
  });
  
  // Check for service worker registration that might interfere with auth
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      console.log('Service worker registrations:', registrations.length);
    }).catch(err => {
      console.error('Error checking service workers:', err);
    });
  }
  
  // Check for errors stored in sessionStorage (from previous redirect attempts)
  const storedError = sessionStorage.getItem('firebase_auth_error');
  if (storedError) {
    try {
      const parsedError = JSON.parse(storedError);
      console.error('Stored Firebase auth error found:', parsedError);
    } catch (e) {
      console.error('Raw stored error:', storedError);
    }
  }
  
  // Log feature detection for storage APIs
  console.log('Browser storage support:', {
    localStorage: typeof localStorage !== 'undefined',
    sessionStorage: typeof sessionStorage !== 'undefined',
    indexedDB: typeof indexedDB !== 'undefined'
  });
  
  // Log console debugging help message
  console.log('%c ⚠️ FIREBASE DOMAIN SETUP INFORMATION ⚠️ ', 'background: #ff0000; color: white; font-size: 16px; font-weight: bold; padding: 4px;');
  console.log('%c Add these domains to Firebase Auth > Settings > Authorized domains: ', 'background: #333; color: white; font-size: 14px; padding: 4px;');
  console.log('%c 1. 25d68c5d-166d-4f92-b5c1-cdfc68146e33-00-2kol6l2kz9i0s.picard.replit.dev ', 'background: #007bff; color: white; font-size: 14px; font-weight: bold; padding: 4px;');
  console.log('%c 2. 25d68c5d-166d-4f92-b5c1-cdfc68146e33-00-2kol6l2kz9i0s.picard.replit.dev.replit.app ', 'background: #007bff; color: white; font-size: 14px; font-weight: bold; padding: 4px;');
  console.log('%c 3. *.replit.dev ', 'background: #007bff; color: white; font-size: 14px; font-weight: bold; padding: 4px;');
  console.log('%c 4. *.replit.app ', 'background: #007bff; color: white; font-size: 14px; font-weight: bold; padding: 4px;');
}

// Detailed error logger for auth errors
export function logDetailedAuthError(error: any, location: string = 'unknown') {
  console.error(`=== FIREBASE AUTH ERROR (${location}) ===`);
  
  // Grab the current URL in case this is a redirect error
  const currentUrl = window.location.href;
  console.error('Current URL:', currentUrl);
  
  // Basic error details
  console.error('Error object:', error);
  
  // Check for Firebase specific error properties
  if (error.code) {
    console.error('Firebase error code:', error.code);
  }
  
  if (error.message) {
    console.error('Error message:', error.message);
  }
  
  if (error.customData) {
    console.error('Custom data:', error.customData);
  }
  
  // Store the error in sessionStorage for post-redirect debugging
  try {
    sessionStorage.setItem('firebase_auth_error', JSON.stringify({
      code: error.code,
      message: error.message,
      location,
      timestamp: new Date().toISOString(),
      url: currentUrl
    }));
  } catch (e) {
    console.error('Could not store error in sessionStorage:', e);
  }
  
  // Log additional helpful information for debugging
  console.error('For the problematic domain, try using:');
  console.error('1. Add domain to Firebase Console: https://console.firebase.google.com/');
  console.error('2. Use a non-Replit domain for testing');
  console.error('3. Try using the popup auth method instead of redirect');
}

// Initialize the logger - call this early in the application lifecycle
export function initAuthErrorLogger() {
  // Check if this appears to be a redirect URL
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('error') || urlParams.has('code') || urlParams.has('state')) {
    logOAuthFlowDetails();
  }
  
  // Check for stored error from previous redirects
  const storedError = sessionStorage.getItem('firebase_auth_error');
  if (storedError) {
    console.error('Previous auth error detected:', storedError);
    // Clear after logging to avoid repeated errors
    sessionStorage.removeItem('firebase_auth_error');
  }
  
  // Log general init information
  console.log('Auth error logger initialized');
}

// Export a default function for convenience
export default {
  logOAuthFlowDetails,
  logDetailedAuthError,
  initAuthErrorLogger
};