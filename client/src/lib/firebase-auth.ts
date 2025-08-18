import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase (only once)
let app;
const existingApps = getApps();
if (existingApps.length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = existingApps[0];
}

// Initialize Auth
export const auth = getAuth(app);

// Google Auth Provider 
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// User data interface
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Authentication functions
export const signInWithGoogle = async (): Promise<void> => {
  console.log('Starting Google sign-in...');
  // Store intended redirect destination
  sessionStorage.setItem('auth_redirect_target', '/industry-pulse');
  await signInWithRedirect(auth, googleProvider);
};

// Global auth state
let currentFirebaseUser: FirebaseUser | null = null;
let authInitialized = false;

// Initialize auth state listener
const initializeAuthListener = () => {
  if (authInitialized) return;
  authInitialized = true;

  onAuthStateChanged(auth, (firebaseUser) => {
    currentFirebaseUser = firebaseUser;
    
    if (firebaseUser) {
      // User is signed in
      const user: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
      };
      
      // Store user data
      sessionStorage.setItem('brandentifier_user', JSON.stringify(user));
      localStorage.setItem('brandentifier_auth', 'true');
      console.log('Firebase user authenticated:', firebaseUser.email);
    } else {
      // User is signed out
      sessionStorage.removeItem('brandentifier_user');
      localStorage.removeItem('brandentifier_auth');
      console.log('Firebase user signed out');
    }
  });
};

export const handleRedirectResult = async (): Promise<User | null> => {
  try {
    console.log('Checking for Firebase redirect result...');
    initializeAuthListener(); // Ensure listener is set up
    
    const result = await getRedirectResult(auth);
    
    if (result && result.user) {
      console.log('Redirect result found! User:', result.user.email);
      
      // Immediately store user data and auth status
      const user: User = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
      };
      
      sessionStorage.setItem('brandentifier_user', JSON.stringify(user));
      localStorage.setItem('brandentifier_auth', 'true');
      console.log('User data stored immediately after OAuth redirect');
      
      return user;
    }
    
    console.log('No redirect result found');
    return null;
  } catch (error) {
    console.error('Error handling redirect result:', error);
    return null;
  }
};

export const getCurrentUser = (): User | null => {
  initializeAuthListener(); // Ensure listener is set up
  
  // First check if Firebase has a current user
  if (currentFirebaseUser) {
    return {
      uid: currentFirebaseUser.uid,
      email: currentFirebaseUser.email,
      displayName: currentFirebaseUser.displayName,
      photoURL: currentFirebaseUser.photoURL,
    };
  }
  
  // Fallback to stored data
  try {
    const userData = sessionStorage.getItem('brandentifier_user');
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  initializeAuthListener(); // Ensure listener is set up
  
  // Check Firebase auth state first
  if (currentFirebaseUser) {
    return true;
  }
  
  // Fallback to stored data
  return !!getCurrentUser() && localStorage.getItem('brandentifier_auth') === 'true';
};

// Wait for auth state to initialize
export const waitForAuthInit = (): Promise<FirebaseUser | null> => {
  return new Promise((resolve) => {
    if (authInitialized) {
      resolve(currentFirebaseUser);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

export const logout = async (): Promise<void> => {
  await signOut(auth);
  // Auth state listener will handle clearing stored data
  currentFirebaseUser = null;
  window.location.href = '/';
};