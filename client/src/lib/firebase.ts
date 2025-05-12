// Import from firebase directly
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, browserSessionPersistence, setPersistence, connectAuthEmulator } from "firebase/auth";

// Enable debug mode for development in Replit
const BYPASS_SECURITY = true; // IMPORTANT: For development only, remove in production
const USE_AUTH_EMULATOR = true; // Use local auth emulator to avoid third-party cookies

// Check if running on Replit
const isReplit = window.location.hostname.includes('.replit.app') || 
                 window.location.hostname.includes('.repl.co') ||
                 window.location.hostname.includes('picard.replit.dev') ||
                 window.location.hostname === 'repl.it';

// Get the current domain for AUTH configuration
const currentDomain = window.location.hostname;

// Configure Firebase with minimal security settings for development
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  // For Replit development, we'll use a special configuration that avoids third-party cookies
  authDomain: BYPASS_SECURITY ? currentDomain : `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

console.log("Firebase config for development:", {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  authDomain: firebaseConfig.authDomain,
  securityBypassed: BYPASS_SECURITY,
  usingEmulator: USE_AUTH_EMULATOR
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with development settings
export const auth = getAuth(app);

// For development in Replit, disable security features that block authentication
if (USE_AUTH_EMULATOR && isReplit) {
  // Use local auth emulator to avoid third-party cookie restrictions
  // Note: This simulates authentication without actual Google servers
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  console.log("Connected to auth emulator for development");
}

// Use session persistence for development (easier testing)
setPersistence(auth, browserSessionPersistence)
  .then(() => {
    console.log("Firebase auth persistence set to session persistence for development");
  })
  .catch((error) => {
    console.error("Error setting auth persistence:", error);
  });

// Configure Google Sign-in with development settings
export const googleProvider = new GoogleAuthProvider();

// Add scopes for development
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Set development-friendly parameters
googleProvider.setCustomParameters({
  // Minimal security parameters that work in Replit environment
  prompt: 'select_account',
  // Avoid advanced security features during development
  access_type: 'online',
  // Disable same-origin enforcement for development
  disable_same_origin_enforcement: 'true',
});

// For debugging in development
console.log(`Development auth domain: ${currentDomain}`);

// Log detailed debug configuration
console.log("Firebase auth configuration for development:", {
  authDomain: firebaseConfig.authDomain,
  currentDomain: currentDomain,
  bypassCookieRestrictions: BYPASS_SECURITY,
  allowInsecureRequests: true
});

export default app;
