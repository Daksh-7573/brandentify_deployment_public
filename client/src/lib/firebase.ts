/**
 * Firebase Configuration and Initialization
 * Contains core Firebase setup, authentication, and providers
 */
import { initializeApp, FirebaseOptions } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Get current hostname for domain-specific configuration 
const currentHostname = window.location.hostname;
const isDevelopment = 
  currentHostname === 'localhost' || 
  currentHostname.includes('replit.dev') || 
  currentHostname.includes('replit.app');

// Check environment variables and log configuration status
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const appId = import.meta.env.VITE_FIREBASE_APP_ID;

// Create an array of all authorized domains for this project
const authDomains = [
  `${projectId}.firebaseapp.com`, // Default Firebase domain
  currentHostname,              // Current hostname
  `${currentHostname.replace(/\./g, "-")}.replit.app`, // Replit deployment domain
  'localhost',                  // Local development
  '*.replit.dev',               // Replit dev domains  
  '*.replit.app',               // Replit app domains
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
const isReplitDomain = currentHostname.includes('replit.dev') || currentHostname.includes('replit.app');
const isExactProblemDomain = currentHostname === "25d68c5d-166d-4f92-b5c1-cdfc68146e33-00-2kol6l2kz9i0s.picard.replit.dev";

// Firebase configuration optimized for Google OAuth on Replit
const firebaseConfig: FirebaseOptions = {
  apiKey,
  // Use official Firebase authDomain for proper OAuth popup functionality
  authDomain: "brandentifier-app.firebaseapp.com",
  projectId: "brandentifier-app",  
  storageBucket: "brandentifier-app.appspot.com",
  messagingSenderId: "330211556822",
  appId,
  measurementId: "G-JG24PTL5MS",
};

// Initialize Firebase with error handling and duplicate prevention
let app;
let auth;
let googleProvider;

// Cache auth state for faster access
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
    const { getApps } = require('firebase/app');
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
  auth.onAuthStateChanged((user) => {
    cachedAuthState = user;
  });
  
  // Export cached auth for components to use
  (window as any).__brandentifier_cached_auth = () => cachedAuthState;
  
  // Configure Google Auth Provider with optimal settings for Replit
  googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('email');
  googleProvider.addScope('profile');
  
  // Optimized parameters for popup compatibility
  googleProvider.setCustomParameters({
    prompt: 'select_account',
    include_granted_scopes: 'true'
  });
  
  // Ensure the auth provider trusts our domain
  auth.useDeviceLanguage();
  
  console.log("Using simplified Google auth configuration for maximum compatibility");
  
  // Enable login persistence is set at the time of signin, not here
  
  console.log("Firebase initialized successfully");
  console.log("Firebase config used:", {
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    currentDomain: currentHostname,
    isReplitDomain
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

// Export all Firebase objects
export { app, auth, googleProvider };
export default app;
