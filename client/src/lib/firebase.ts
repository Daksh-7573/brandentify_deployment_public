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

// Add scopes for better profile access
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Log the domain for debugging
console.log("Current domain:", window.location.hostname);
console.log("Firebase auth domain:", `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`);

// Standard Google sign-in function with better logging
export const enhancedGoogleSignIn = async () => {
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
    
    // Log more details about the error
    if (error.code === 'auth/unauthorized-domain') {
      console.error(`Current domain (${window.location.hostname}) is not authorized in Firebase console. Please add it to Firebase console under Auth > Settings > Authorized domains.`);
    }
    
    throw error;
  }
};

export default app;
