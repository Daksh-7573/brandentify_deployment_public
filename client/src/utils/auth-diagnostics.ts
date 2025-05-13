/**
 * Firebase Authentication Diagnostics
 * 
 * This utility module provides diagnostic functions to help troubleshoot
 * Firebase authentication issues in different environments.
 */

// Function to log authentication errors with details
export function logAuthError(error: any, location: string = 'unknown') {
  console.error(`=== FIREBASE AUTH ERROR (${location}) ===`);
  
  // Basic error details
  console.error('Error object:', error);
  
  // Check for Firebase specific error properties
  if (error.code) {
    console.error('Firebase error code:', error.code);
    
    // Add specific advice for common error codes
    switch(error.code) {
      case 'auth/popup-blocked':
        console.error('ADVICE: The authentication popup was blocked by the browser. Try using redirect authentication instead.');
        break;
      case 'auth/popup-closed-by-user':
        console.error('ADVICE: The user closed the popup without completing authentication. No action needed.');
        break;
      case 'auth/cancelled-popup-request':
        console.error('ADVICE: The authentication popup request was cancelled, possibly by opening another popup.');
        break;
      case 'auth/unauthorized-domain':
        console.error('ADVICE: This domain is not authorized in Firebase Console. Add it to the authorized domains list.');
        console.error('Current hostname:', window.location.hostname);
        break;
      case 'auth/operation-not-allowed':
        console.error('ADVICE: The authentication provider is not enabled in Firebase Console.');
        break;
      case 'auth/user-disabled':
        console.error('ADVICE: The user account has been disabled by an administrator.');
        break;
      case 'auth/user-token-expired':
        console.error('ADVICE: The user\'s credential has expired. The user needs to sign in again.');
        break;
      case 'auth/web-storage-unsupported':
        console.error('ADVICE: The browser does not support web storage or it is disabled. Enable cookies/local storage.');
        break;
      default:
        console.error('No specific advice available for this error code.');
    }
  }
  
  if (error.message) {
    console.error('Error message:', error.message);
  }
  
  if (error.customData) {
    console.error('Custom data:', error.customData);
  }
  
  // Log the current URL
  console.error('Current URL:', window.location.href);
  
  // Log local storage status to check for potential issues
  try {
    const testKey = '_firebase_auth_test';
    localStorage.setItem(testKey, '1');
    const testValue = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    
    console.error('Local storage working:', testValue === '1');
  } catch (e) {
    console.error('Local storage not available:', e);
  }
}

// Function to check Firebase configuration
export function checkFirebaseConfig() {
  // Check environment variables
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID;
  
  console.log('=== FIREBASE CONFIG CHECK ===');
  console.log('API Key exists:', Boolean(apiKey));
  console.log('Project ID exists:', Boolean(projectId));
  console.log('App ID exists:', Boolean(appId));
  
  // Check if we're in a domain that might need special handling
  const hostname = window.location.hostname;
  const isProblemDomain = hostname === "25d68c5d-166d-4f92-b5c1-cdfc68146e33-00-2kol6l2kz9i0s.picard.replit.dev";
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isReplitDomain = hostname.includes('replit');
  
  console.log('Domain analysis:');
  console.log('- Current hostname:', hostname);
  console.log('- Is problematic domain:', isProblemDomain);
  console.log('- Is localhost:', isLocalhost);
  console.log('- Is Replit domain:', isReplitDomain);
  
  if (isProblemDomain) {
    console.log('RECOMMENDATION: This domain requires special handling for Firebase auth.');
    console.log('Make sure to add this domain to Firebase Console > Authentication > Settings > Authorized domains');
  }
  
  // Check browser features needed for Firebase
  const hasLocalStorage = typeof localStorage !== 'undefined';
  const hasSessionStorage = typeof sessionStorage !== 'undefined';
  const hasIndexedDB = typeof indexedDB !== 'undefined';
  
  console.log('Browser feature support:');
  console.log('- LocalStorage:', hasLocalStorage);
  console.log('- SessionStorage:', hasSessionStorage);
  console.log('- IndexedDB:', hasIndexedDB);
  
  // Overall assessment
  const hasRequiredEnvVars = apiKey && projectId && appId;
  const hasRequiredBrowserFeatures = hasLocalStorage && hasSessionStorage;
  
  console.log('Overall assessment:');
  console.log('- Required environment variables:', hasRequiredEnvVars ? 'PRESENT' : 'MISSING');
  console.log('- Required browser features:', hasRequiredBrowserFeatures ? 'SUPPORTED' : 'NOT SUPPORTED');
  
  if (!hasRequiredEnvVars) {
    console.error('CRITICAL: Firebase environment variables are missing. Authentication will not work!');
  }
  
  if (!hasRequiredBrowserFeatures) {
    console.error('CRITICAL: Required browser features are not available. Authentication will not work!');
  }
  
  return {
    hasRequiredEnvVars,
    hasRequiredBrowserFeatures,
    isProblemDomain,
    isReplitDomain
  };
}

// Export a default object for convenience
export default {
  logAuthError,
  checkFirebaseConfig
};