// Import from firebase directly
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth";

// Log Firebase configuration values for debugging (without exposing API keys)
console.log("Firebase config check:", {
  projectIdExists: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
  apiKeyLength: import.meta.env.VITE_FIREBASE_API_KEY ? import.meta.env.VITE_FIREBASE_API_KEY.length : 0,
  appIdLength: import.meta.env.VITE_FIREBASE_APP_ID ? import.meta.env.VITE_FIREBASE_APP_ID.length : 0
});

// Check if running on Replit
const isReplit = window.location.hostname.includes('.replit.app') || 
                 window.location.hostname.includes('.repl.co') ||
                 window.location.hostname === 'repl.it';

// Get the current domain for AUTH configuration
const currentDomain = window.location.hostname;

// Configure Firebase with proper settings - optimized for Replit environment
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  // For Replit, use the current domain as authDomain to avoid third-party cookie issues
  authDomain: isReplit ? window.location.hostname : `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Enhanced configuration for Google Sign-in
export const googleProvider = new GoogleAuthProvider();

// Add additional scopes to improve sign-in reliability
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Set custom parameters to improve sign-in UX
googleProvider.setCustomParameters({
  // Force account selection to prevent automatic sign-in with cached credentials
  prompt: 'select_account', 
  // Allow sign-in across domains/iframes
  auth_type: 'rerequest',
});

// For Replit environment, add the current domain to the list of authorized domains
// The domain must be added to Firebase Console > Authentication > Sign-in method > 
// Authorized domains as well
console.log(`Current auth domain is: ${currentDomain}`);

// Log detailed configuration for debugging
console.log("Firebase config:", {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
  hasAppId: !!import.meta.env.VITE_FIREBASE_APP_ID
});

export default app;
