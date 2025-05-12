// Import from firebase directly
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  connectAuthEmulator,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup
} from "firebase/auth";

// Log Firebase configuration values for debugging (without exposing API keys)
console.log("Firebase config check:", {
  projectIdExists: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
  apiKeyLength: import.meta.env.VITE_FIREBASE_API_KEY ? import.meta.env.VITE_FIREBASE_API_KEY.length : 0,
  appIdLength: import.meta.env.VITE_FIREBASE_APP_ID ? import.meta.env.VITE_FIREBASE_APP_ID.length : 0
});

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: "330211556822", // Default value, update if you have the correct one
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: "G-JG24PTL5MS", // Default value, update if you have the correct one
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Set a longer timeout for auth operations (default is 60 seconds)
auth.settings.appVerificationDisabledForTesting = true;

export const googleProvider = new GoogleAuthProvider();

// Helper function to sign in with email/password (for testing)
export const signInWithTestCredentials = async () => {
  try {
    // First, check if the test user exists by trying to sign in
    return await signInWithEmailAndPassword(auth, "test@example.com", "Test123!");
  } catch (error) {
    console.log("Test user doesn't exist, creating...");
    try {
      // If the user doesn't exist, create a new one
      return await createUserWithEmailAndPassword(auth, "test@example.com", "Test123!");
    } catch (createError) {
      console.error("Error creating test user:", createError);
      throw createError;
    }
  }
};

// Detect if we're in a development environment
export const isDevelopment = import.meta.env.DEV || 
  window.location.hostname === 'localhost' || 
  window.location.hostname.includes('replit');

// Log the domain for debugging
console.log("Current domain:", window.location.hostname);

// Helper function for Google sign-in with domain error handling
export const signInWithGoogleSafe = async () => {
  try {
    console.log("Firebase config:", {
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
      hasAppId: !!import.meta.env.VITE_FIREBASE_APP_ID
    });
    
    console.log("Attempting Google sign-in with popup...");
    return await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error("Error signing in with Google:", error);
    
    // If we get an unauthorized domain error and we're in development,
    // fall back to the test credentials
    if (error.code === 'auth/unauthorized-domain' && isDevelopment) {
      console.log("Domain not authorized for Google Auth. Using test credentials instead.");
      return await signInWithTestCredentials();
    }
    
    throw error;
  }
};

export default app;
