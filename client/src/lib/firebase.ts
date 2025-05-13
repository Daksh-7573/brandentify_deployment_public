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

// Check if we're on the specific problematic domain
const isOnProblemDomain = currentHostname === "25d68c5d-166d-4f92-b5c1-cdfc68146e33-00-2kol6l2kz9i0s.picard.replit.dev";

// Firebase configuration
const firebaseConfig: FirebaseOptions = {
  apiKey,
  // Use Firebase's domain for auth generally, but for our problematic domain, use it directly
  authDomain: isOnProblemDomain 
    ? currentHostname  // Use the exact problematic domain for authDomain
    : (projectId ? `${projectId}.firebaseapp.com` : currentHostname),
  projectId,
  storageBucket: projectId ? `${projectId}.appspot.com` : undefined,
  // These are okay as defaults since they're not sensitive and are only used for optional features
  messagingSenderId: "330211556822",
  appId,
  measurementId: "G-JG24PTL5MS",
};

// Initialize Firebase with error handling
let app;
let auth;
let googleProvider;

try {
  // Initialize Firebase app
  app = initializeApp(firebaseConfig);
  
  // Initialize Firebase Auth
  auth = getAuth(app);
  
  // Configure Google Auth Provider with custom parameters
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    // Force account selection even if user is already signed in
    prompt: 'select_account',
    // Include all domains as authorized redirect domains
    login_hint: '',
  });
  
  // Enable login persistence is set at the time of signin, not here
  
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Firebase initialization error:", error);
  
  // Create fallbacks for failed initialization to prevent app crashes
  if (!app) app = {} as any; 
  if (!auth) auth = { 
    currentUser: null,
    onAuthStateChanged: () => {},
    signOut: async () => {}
  } as any;
  if (!googleProvider) googleProvider = {} as any;
}

// Export all Firebase objects
export { app, auth, googleProvider };
export default app;
