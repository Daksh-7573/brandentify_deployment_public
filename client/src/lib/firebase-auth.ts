import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth';

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
  await signInWithRedirect(auth, googleProvider);
};

export const handleRedirectResult = async (): Promise<User | null> => {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      const user: User = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
      };
      
      // Store user data
      sessionStorage.setItem('brandentifier_user', JSON.stringify(user));
      localStorage.setItem('brandentifier_auth', 'true');
      
      return user;
    }
    return null;
  } catch (error) {
    console.error('Error handling redirect result:', error);
    return null;
  }
};

export const getCurrentUser = (): User | null => {
  try {
    const userData = sessionStorage.getItem('brandentifier_user');
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return !!getCurrentUser() && localStorage.getItem('brandentifier_auth') === 'true';
};

export const logout = async (): Promise<void> => {
  await signOut(auth);
  sessionStorage.removeItem('brandentifier_user');
  localStorage.removeItem('brandentifier_auth');
  window.location.href = '/';
};