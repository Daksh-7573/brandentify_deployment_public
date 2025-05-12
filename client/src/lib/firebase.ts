// Import from firebase directly
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from "firebase/auth";

// Check if running on Replit
const isReplit = window.location.hostname.includes('.replit.app') || 
                 window.location.hostname.includes('.repl.co') ||
                 window.location.hostname.includes('picard.replit.dev') ||
                 window.location.hostname === 'repl.it';

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

export default app;
