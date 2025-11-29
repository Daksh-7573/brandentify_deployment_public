import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut as firebaseSignOut, User as FirebaseUser, Auth } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from "@/lib/queryClient";

// Firebase instance references - using useRef pattern via module-level storage
let firebaseInitPromise: Promise<{ auth: Auth; googleProvider: any }> | null = null;

// Initialize Firebase once and cache the promise
const initializeFirebase = async () => {
  if (!firebaseInitPromise) {
    firebaseInitPromise = import('@/lib/firebase');
  }
  return firebaseInitPromise;
};

interface User {
  uid: string;
  id: number;
  username: string;
  email: string | null;
  name: string | null;
  photoURL?: string | null;
  title?: string | null;
  location?: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithPhone: (phoneNumber: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  signInWithGoogle: async () => {},
  signInWithPhone: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Track if component is mounted to prevent state updates on unmounted component
  const isMountedRef = useRef(true);
  
  // Track logout state to prevent race conditions
  const isLoggingOutRef = useRef(false);

  // Create or update user in backend
  const createOrUpdateUserInBackend = async (firebaseUser: FirebaseUser) => {
    try {
      const googleProvider = firebaseUser.providerData?.find(
        (provider) => provider.providerId === "google.com"
      );

      const userData = {
        uid: firebaseUser.uid,
        email: googleProvider?.email || firebaseUser.email,
        name: googleProvider?.displayName || firebaseUser.displayName || "Firebase User",
        photoURL: googleProvider?.photoURL || firebaseUser.photoURL,
      };

      console.log("Creating/updating user in backend:", userData);
      
      const response = await apiRequest('POST', '/api/users', userData);
      
      if (response.ok) {
        const backendUser = await response.json();
        console.log("User created/updated successfully:", backendUser);
        return backendUser;
      } else {
        console.log("User creation/update failed, status:", response.status);
        return null;
      }
    } catch (error) {
      console.error("Error creating/updating user:", error);
      return null;
    }
  };

  // Fetch user data from backend
  const fetchUserData = async (uid: string, email?: string | null): Promise<User | null> => {
    try {
      let url = `/api/users/${uid}`;
      if (email) {
        url += `?email=${encodeURIComponent(email)}`;
      }

      const response = await apiRequest('GET', url);
      
      if (response.ok) {
        const userData = await response.json();
        return {
          uid: uid,
          id: userData.id,
          username: userData.username,
          email: userData.email,
          name: userData.name,
          photoURL: userData.photoURL || null,
          title: userData.title,
          location: userData.location
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  // Clear all cached data when user logs out
  const clearAllCaches = () => {
    console.log("Clearing all caches after logout");
    
    // Clear React Query cache
    queryClient.clear();
    
    // Clear localStorage
    try {
      const keysToKeep = ['theme', 'language']; // Keep non-auth related settings
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
    
    // Clear sessionStorage
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error("Error clearing sessionStorage:", error);
    }
    
    console.log("Cache cleanup complete");
  };

  // Setup auth state listener - runs only once on component mount
  useEffect(() => {
    console.log("Setting up auth state listener");
    let unsubscribe: (() => void) | null = null;

    // Setup auth listener
    const setupAuthListener = async () => {
      try {
        const { auth } = await initializeFirebase();
        
        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          // Don't process if logging out
          if (isLoggingOutRef.current) {
            console.log("Auth state changed during logout, skipping processing");
            return;
          }
          
          console.log("Auth state changed:", firebaseUser ? "User signed in" : "User signed out");
          
          if (firebaseUser) {
            try {
              console.log("Processing new user:", firebaseUser.uid);
              
              // Create/update user in backend first
              await createOrUpdateUserInBackend(firebaseUser);
              
              // Get Google provider data for email
              const googleProvider = firebaseUser.providerData?.find(
                provider => provider.providerId === "google.com"
              );
              const userEmail = googleProvider?.email || firebaseUser.email;
              
              // Fetch complete user data from backend
              const userData = await fetchUserData(firebaseUser.uid, userEmail);
              
              if (isMountedRef.current) {
                if (userData) {
                  console.log("Setting user state with backend data");
                  setUser(userData);
                  toast({
                    title: "Signed in successfully",
                    description: `Welcome ${userData.name || userData.email}!`,
                  });
                } else {
                  // Fallback user if backend fails
                  console.log("Using fallback user data");
                  const fallbackUser = {
                    uid: firebaseUser.uid,
                    id: parseInt(firebaseUser.uid.substring(0, 5), 36) || 999,
                    username: userEmail?.split('@')[0] || firebaseUser.uid.substring(0, 8),
                    email: userEmail,
                    name: googleProvider?.displayName || firebaseUser.displayName,
                    photoURL: googleProvider?.photoURL || firebaseUser.photoURL
                  };
                  
                  setUser(fallbackUser);
                  toast({
                    title: "Signed in successfully", 
                    description: `Welcome ${fallbackUser.name || fallbackUser.email}!`,
                  });
                }
              }
            } catch (error) {
              console.error("Error processing auth state change:", error);
            }
          } else {
            // User signed out
            if (isMountedRef.current && user) {
              console.log("User signed out - clearing state");
              setUser(null);
              clearAllCaches();
              toast({
                title: "Signed out",
                description: "You have been signed out successfully.",
              });
            }
          }
          
          if (isMountedRef.current) {
            setIsLoading(false);
          }
        });
      } catch (error) {
        console.error("Error setting up auth listener:", error);
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    setupAuthListener();

    return () => {
      isMountedRef.current = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []); // Empty dependency array - setup only once on mount
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Simplified Google sign-in
  const signInWithGoogle = async () => {
    try {
      if (isMountedRef.current) {
        setIsLoading(true);
      }
      console.log("Starting Google sign-in");
      
      const { auth, googleProvider } = await initializeFirebase();
      
      try {
        // Try popup first
        const result = await signInWithPopup(auth, googleProvider);
        console.log("Popup sign-in successful:", result.user.email);
      } catch (popupError: any) {
        console.log("Popup failed, trying redirect:", popupError.code);
        
        if (popupError.code === 'auth/popup-blocked' || 
            popupError.code === 'auth/popup-closed-by-user') {
          await signInWithRedirect(auth, googleProvider);
          return; // Don't set loading false - redirect will handle it
        } else {
          throw popupError;
        }
      }
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      
      let errorMessage = "There was a problem with Google sign-in. Please try again.";
      if (error.code === 'auth/popup-blocked') {
        errorMessage = "Please allow popups for this site.";
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Sign-in was cancelled.";
      }
      
      toast({
        title: "Authentication error",
        description: errorMessage,
        variant: "destructive",
      });
      
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  // Phone auth placeholder
  const signInWithPhone = async (phoneNumber: string) => {
    console.log("Phone auth not implemented yet:", phoneNumber);
    toast({
      title: "Coming soon",
      description: "Phone authentication will be available soon.",
    });
  };

  // Complete logout with proper sequencing and race condition prevention
  const signOut = async () => {
    // Prevent multiple simultaneous logouts
    if (isLoggingOutRef.current) {
      console.log("Logout already in progress, skipping duplicate request");
      return;
    }
    
    isLoggingOutRef.current = true;
    
    try {
      console.log("Starting logout process");
      if (isMountedRef.current) {
        setIsLoading(true);
      }
      
      const { auth } = await initializeFirebase();
      
      // Step 1: Sign out from Firebase
      await firebaseSignOut(auth);
      console.log("Firebase sign out completed");
      
      // Step 2: Clear all caches immediately after Firebase signout
      clearAllCaches();
      
      // Step 3: Update UI state to reflect logout
      if (isMountedRef.current) {
        setUser(null);
        console.log("User state cleared");
      }
      
      // Step 4: Clear browser history to prevent back button issues
      window.history.replaceState({}, '', '/auth');
      console.log("Browser history cleared, redirecting to auth");
      
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      
    } catch (error) {
      console.error("Error during logout:", error);
      
      // Even if logout fails, clear the user state for security
      if (isMountedRef.current) {
        setUser(null);
        clearAllCaches();
        setIsLoading(false);
      }
      
      // Still try to redirect to auth page
      window.history.replaceState({}, '', '/auth');
      
      toast({
        title: "Logout Error",
        description: "You've been signed out, but there was an issue. Please refresh if needed.",
        variant: "destructive",
      });
    } finally {
      // Reset logout flag
      isLoggingOutRef.current = false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signInWithGoogle,
        signInWithPhone,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
