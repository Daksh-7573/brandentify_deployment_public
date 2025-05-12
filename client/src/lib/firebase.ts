// Import from firebase directly
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from "firebase/auth";

// Log Firebase configuration values for debugging (without exposing API keys)
console.log("Firebase config check:", {
  projectIdExists: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
  apiKeyLength: import.meta.env.VITE_FIREBASE_API_KEY ? import.meta.env.VITE_FIREBASE_API_KEY.length : 0,
  appIdLength: import.meta.env.VITE_FIREBASE_APP_ID ? import.meta.env.VITE_FIREBASE_APP_ID.length : 0
});

// Check if running on Replit
const isReplit = window.location.hostname.includes('.replit.app') || 
                 window.location.hostname.includes('.repl.co') ||
                 window.location.hostname.includes('picard.replit.dev') ||
                 window.location.hostname === 'repl.it';

// Get the current domain for AUTH configuration
const currentDomain = window.location.hostname;

// Configure Firebase with Replit optimization settings
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  // Important: For Replit we explicitly set the authDomain to the Firebase project domain
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with specific settings
export const auth = getAuth(app);

// Configure auth to use local persistence 
// This avoids the need for third-party cookies in many cases
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Firebase auth persistence set to browserLocalPersistence for better Replit compatibility");
  })
  .catch((error) => {
    console.error("Error setting auth persistence:", error);
  });

// Enhanced configuration for Google Sign-in
export const googleProvider = new GoogleAuthProvider();

// Add additional scopes to improve sign-in reliability
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Set custom parameters to optimize for Replit environment
googleProvider.setCustomParameters({
  // These parameters help bypass some third-party cookie restrictions
  prompt: 'consent',  // Always ask for consent to improve compatibility
  access_type: 'offline', // Request a refresh token for offline access
  include_granted_scopes: 'true', // Include previously granted scopes
  // Use this Replit domain as the login hint to help with redirection
  login_hint: window.location.hostname
});

// For debugging - log current domain
console.log(`Current auth domain is: ${currentDomain}`);

// Log detailed configuration
console.log("Firebase config:", {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  authDomain: firebaseConfig.authDomain,
  hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
  hasAppId: !!import.meta.env.VITE_FIREBASE_APP_ID
});

export default app;
