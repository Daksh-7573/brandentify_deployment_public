/**
 * Firebase Domain Validation Helper
 * 
 * This module provides utilities to diagnose Firebase domain configuration issues
 * which are a common cause of authentication failures.
 */

/**
 * Checks if the current domain is likely to be authorized in Firebase
 * 
 * @returns Information about domain configuration
 */
export function checkDomainAuthorization(): { 
  isValid: boolean; 
  currentDomain: string;
  reasons: string[];
  suggestedDomains: string[];
} {
  const currentDomain = window.location.hostname;
  
  // Default response structure
  const result = {
    isValid: false,
    currentDomain,
    reasons: [] as string[],
    suggestedDomains: [] as string[]
  };
  
  // Add domain variations that should be added to Firebase authorized domains
  if (currentDomain.includes('replit')) {
    result.suggestedDomains.push(currentDomain);
    
    // For Replit domains, also suggest the .replit.dev domain
    if (currentDomain.endsWith('.repl.co')) {
      const replitDevDomain = currentDomain.replace('.repl.co', '.replit.dev');
      result.suggestedDomains.push(replitDevDomain);
    }
  } else {
    result.suggestedDomains.push(currentDomain);
  }
  
  // Check if it's a localhost domain
  if (currentDomain === 'localhost' || currentDomain === '127.0.0.1') {
    result.isValid = true;
    return result;
  }
  
  // Replit domains need to be explicitly added to Firebase
  if (currentDomain.includes('replit') || currentDomain.includes('repl.co')) {
    result.reasons.push(
      'Replit domains must be explicitly added to Firebase authorized domains.'
    );
    result.isValid = false;
    return result;
  }
  
  // Other non-localhost domains
  result.reasons.push(
    'This domain must be added to your Firebase project\'s authorized domains list.'
  );
  result.isValid = false;
  
  return result;
}

/**
 * Checks if Firebase configuration environment variables are properly set
 */
export function checkFirebaseConfig(): {
  isConfigured: boolean;
  issues: string[];
  configDetails: {
    apiKey: boolean;
    apiKeyLength: number;
    projectId: boolean;
    projectIdValue?: string;
    appId: boolean;
    appIdLength: number;
  };
} {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID;
  
  const issues: string[] = [];
  
  if (!apiKey) {
    issues.push('Missing Firebase API Key (VITE_FIREBASE_API_KEY)');
  } else if (apiKey.length < 10) {
    issues.push('Firebase API Key appears to be invalid (too short)');
  }
  
  if (!projectId) {
    issues.push('Missing Firebase Project ID (VITE_FIREBASE_PROJECT_ID)');
  }
  
  if (!appId) {
    issues.push('Missing Firebase App ID (VITE_FIREBASE_APP_ID)');
  } else if (!appId.includes(':')) {
    issues.push('Firebase App ID appears to be invalid (missing format)');
  }
  
  const configDetails = {
    apiKey: !!apiKey,
    apiKeyLength: apiKey?.length || 0,
    projectId: !!projectId,
    projectIdValue: projectId,
    appId: !!appId,
    appIdLength: appId?.length || 0,
  };
  
  return {
    isConfigured: issues.length === 0,
    issues,
    configDetails
  };
}

/**
 * Creates instructions for setting up Firebase authentication
 */
export function getFirebaseSetupInstructions(): string[] {
  const domainInfo = checkDomainAuthorization();
  
  return [
    '1. Go to the Firebase Console: https://console.firebase.google.com/',
    '2. Select your project',
    '3. Go to Authentication → Sign-in method',
    '4. Make sure Google is enabled as a sign-in provider',
    '5. Go to Authentication → Settings → Authorized domains',
    '6. Add the following domain(s) to the list:',
    ...domainInfo.suggestedDomains.map(domain => `   - ${domain}`),
    '7. Click "Save" to apply changes',
    '8. Ensure your Firebase config variables are set correctly in the app'
  ];
}