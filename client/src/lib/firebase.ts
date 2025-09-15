/**
 * Firebase Configuration and Initialization
 * Contains core Firebase setup, authentication, and providers
 */
import { initializeApp, FirebaseOptions, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Get current hostname for domain-specific configuration 
const currentHostname = window.location.hostname;
const isDevelopment = 
  currentHostname === 'localhost' || 
  currentHostname.includes('replit.dev');

// CRITICAL: Completely disable Firebase on published Replit domains
const isPublishedDomain = currentHostname.includes('replit.app');
const shouldDisableFirebase = isPublishedDomain;

// Initialize variables that will be exported
let app: any = null;
let auth: any = null;
let googleProvider: any = null;

// EARLY EXIT: Disable Firebase completely on published domains to prevent redirect loops
if (shouldDisableFirebase) {
  console.log("🚫 Firebase disabled on published domain to prevent redirect loops");
  console.log("Using server-side OAuth instead of Firebase auth");
  
  // Set up null implementations to prevent crashes
  app = null;
  auth = null;
  googleProvider = null;
} else {
  // Development mode - initialize Firebase normally
  console.log("🔥 Initializing Firebase for development domain");
  
  // Check environment variables and log configuration status
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID;

  // Debug environment variables
  console.log("Firebase Environment Check:", {
    apiKey: apiKey ? `Present (${apiKey.length} chars)` : 'Missing',
    projectId: projectId || 'Missing',
    appId: appId ? `Present (${appId.length} chars)` : 'Missing',
    envVarsDetected: {
      VITE_FIREBASE_API_KEY: !!import.meta.env.VITE_FIREBASE_API_KEY,
      VITE_FIREBASE_PROJECT_ID: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
      VITE_FIREBASE_APP_ID: !!import.meta.env.VITE_FIREBASE_APP_ID
    }
  });

  // Enhanced debugging for production troubleshooting
  console.log("🔧 Firebase Domain Check:", {
    currentDomain: window.location.hostname,
    isReplitDomain: currentHostname.includes('replit'),
    authDomain: `${projectId}.firebaseapp.com`
  });

  // Create an array of all authorized domains for this project
  const authDomains = [
    `${projectId}.firebaseapp.com`, // Default Firebase domain
    currentHostname,              // Current hostname
    'localhost',                  // Local development
    '*.replit.dev',               // Replit dev domains  
    '25d68c5d-166d-4f92-b5c1-cdfc68146e33-00-2kol6l2kz9i0s.picard.replit.dev', // Specific problematic domain
  ];

  // Allow additional test domains in development
  if (isDevelopment) {
    authDomains.push('127.0.0.1');
  }

  // Comprehensive logging for debugging Firebase configuration issues
  console.log("Firebase initialization:", {
    environment: isDevelopment ? "development" : "production",
    hostname: currentHostname,
    projectId: projectId || "MISSING",
    apiKeyPresent: !!apiKey,
    apiKeyLength: apiKey?.length || 0,
    appIdPresent: !!appId, 
    appIdLength: appId?.length || 0,
    domains: authDomains
  });

  // Check if we're on a Replit domain
  const isReplitDomain = currentHostname.includes('replit.dev');

  // Validate required environment variables
  if (!apiKey || !projectId || !appId) {
    const missingVars = [];
    if (!apiKey) missingVars.push('VITE_FIREBASE_API_KEY');
    if (!projectId) missingVars.push('VITE_FIREBASE_PROJECT_ID');
    if (!appId) missingVars.push('VITE_FIREBASE_APP_ID');
    
    console.error("Missing required Firebase environment variables:", missingVars);
    throw new Error(`Missing Firebase configuration: ${missingVars.join(', ')}`);
  }

  const firebaseConfig: FirebaseOptions = {
    apiKey,
    authDomain: `${projectId}.firebaseapp.com`, // Use proper Firebase domain
    projectId,  
    storageBucket: `${projectId}.appspot.com`,
    appId,
  };

  // Initialize Firebase with error handling and duplicate prevention
  let cachedAuthState: any = null;

  try {
    // Check if Firebase is already initialized to prevent duplicate app error
    try {
      app = initializeApp(firebaseConfig);
    } catch (error: any) {
      if (error.code === 'app/duplicate-app') {
        console.log('Firebase already initialized, using existing instance');
        // Use existing app instance
        app = null; // Will be handled by getApps check below
      } else {
        throw error;
      }
    }
    
    // Fallback to existing app if available
    if (!app) {
      const existingApps = getApps();
      if (existingApps.length > 0) {
        app = existingApps[0];
        console.log('Using existing Firebase app instance');
      } else {
        throw new Error('Failed to initialize or find existing Firebase app');
      }
    }
    
    // Initialize Firebase Auth
    auth = getAuth(app);
    
    // Cache auth state for faster access
    auth.onAuthStateChanged((user: any) => {
      cachedAuthState = user;
    });
    
    // Export cached auth for components to use
    (window as any).__brandentifier_cached_auth = () => cachedAuthState;
    
    // Configure Google Auth Provider for maximum compatibility
    googleProvider = new GoogleAuthProvider();
    
    // Simplified configuration for maximum compatibility with Replit
    googleProvider.setCustomParameters({
      prompt: 'select_account',
      access_type: 'online'
    });
    
    // Add essential OAuth scopes only
    googleProvider.addScope('email');
    googleProvider.addScope('profile');
    
    // Ensure the auth provider trusts our domain
    auth.useDeviceLanguage();
    
    console.log("Using simplified Google auth configuration for maximum compatibility");
    
    console.log("Firebase initialized successfully");
    console.log("Firebase config used:", {
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      currentDomain: currentHostname,
      isReplitDomain,
      googleProviderScopes: ['email', 'profile'],
      customParameters: { prompt: 'select_account', access_type: 'online' }
    });
  } catch (error) {
    console.error("CRITICAL: Firebase initialization failed:", error);
    console.error("Firebase config used:", firebaseConfig);
    console.error("Environment variables:", {
      apiKey: !!apiKey,
      projectId,
      appId: !!appId
    });
    
    // Create fallbacks for failed initialization to prevent app crashes
    if (!app) app = {} as any; 
    if (!auth) auth = { 
      currentUser: null,
      onAuthStateChanged: () => () => {},
      signOut: async () => {}
    } as any;
    if (!googleProvider) googleProvider = {} as any;
  }
}

// Export all Firebase objects (will be null on published domains)
export { app, auth, googleProvider };
export default app;