// Import from firebase directly
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth";

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

export default app;
