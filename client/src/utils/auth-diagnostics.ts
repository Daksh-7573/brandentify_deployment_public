/**
 * Firebase Authentication Diagnostics
 * 
 * This utility module provides diagnostic functions to help troubleshoot
 * Firebase authentication issues in different environments.
 */

// Function to get a user-friendly error message for auth errors
export function getFriendlyAuthErrorMessage(error: any): string {
  // Handle common Firebase error codes
  if (error.code) {
    switch(error.code) {
      case 'auth/popup-blocked':
        return 'The login popup was blocked by your browser. Please allow popups or try signing in with a different method.';
        
      case 'auth/popup-closed-by-user':
        return 'The login popup was closed before authentication was completed. Please try again.';
        
      case 'auth/cancelled-popup-request':
        return 'The authentication process was cancelled. Please try again.';
        
      case 'auth/unauthorized-domain':
        return 'This website is not authorized to use Firebase authentication. Please contact support.';
        
      case 'auth/operation-not-allowed':
        return 'This login method is not enabled. Please try a different sign-in method.';
        
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
        
      case 'auth/user-token-expired':
        return 'Your login session has expired. Please sign in again.';
        
      case 'auth/web-storage-unsupported':
        return 'Authentication requires cookies or local storage. Please enable them in your browser settings.';
        
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with the same email but different sign-in credentials. Please sign in using the original method.';
      
      case 'auth/invalid-credential':
        return 'The authentication credentials are invalid. Please try again.';
      
      case 'auth/user-not-found':
        return 'No account found with this email. Please check your email or sign up.';
      
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again or reset your password.';
      
      case 'auth/too-many-requests':
        return 'Too many unsuccessful login attempts. Please try again later or reset your password.';
      
      case 'auth/network-request-failed':
        return 'A network error occurred. Please check your internet connection and try again.';
      
      default:
        return `Authentication error: ${error.message || 'Unknown error'}`;
    }
  }
  
  // If no code, use the message or a default
  return error.message || 'An unknown authentication error occurred. Please try again.';
}

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
  
  // Start collecting issues
  const issues: string[] = [];
  
  if (isProblemDomain) {
    console.log('RECOMMENDATION: This domain requires special handling for Firebase auth.');
    console.log('Make sure to add this domain to Firebase Console > Authentication > Settings > Authorized domains');
    issues.push(`Domain "${hostname}" needs to be added to authorized domains in Firebase Console`);
  }
  
  // Check browser features needed for Firebase
  const hasLocalStorage = typeof localStorage !== 'undefined';
  const hasSessionStorage = typeof sessionStorage !== 'undefined';
  const hasIndexedDB = typeof indexedDB !== 'undefined';
  
  console.log('Browser feature support:');
  console.log('- LocalStorage:', hasLocalStorage);
  console.log('- SessionStorage:', hasSessionStorage);
  console.log('- IndexedDB:', hasIndexedDB);
  
  // Check required features
  if (!hasLocalStorage) {
    issues.push('LocalStorage is not available - required for authentication');
  }
  
  if (!hasSessionStorage) {
    issues.push('SessionStorage is not available - required for authentication');
  }
  
  // Check required environment variables
  if (!apiKey) {
    issues.push('VITE_FIREBASE_API_KEY environment variable is missing');
  }
  
  if (!projectId) {
    issues.push('VITE_FIREBASE_PROJECT_ID environment variable is missing');
  }
  
  if (!appId) {
    issues.push('VITE_FIREBASE_APP_ID environment variable is missing');
  }
  
  // Overall assessment
  const hasRequiredEnvVars = apiKey && projectId && appId;
  const hasRequiredBrowserFeatures = hasLocalStorage && hasSessionStorage;
  const isConfigured = hasRequiredEnvVars && hasRequiredBrowserFeatures && issues.length === 0;
  
  console.log('Overall assessment:');
  console.log('- Required environment variables:', hasRequiredEnvVars ? 'PRESENT' : 'MISSING');
  console.log('- Required browser features:', hasRequiredBrowserFeatures ? 'SUPPORTED' : 'NOT SUPPORTED');
  console.log('- Is properly configured:', isConfigured ? 'YES' : 'NO');
  console.log('- Issues found:', issues.length > 0 ? issues.join(', ') : 'None');
  
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
    isReplitDomain,
    isConfigured,
    issues
  };
}

// Export a default object for convenience
export default {
  logAuthError,
  checkFirebaseConfig,
  getFriendlyAuthErrorMessage
};