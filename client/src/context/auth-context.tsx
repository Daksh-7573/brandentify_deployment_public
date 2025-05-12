import { createContext, useState, useEffect, ReactNode, useContext } from "react";
import { 
  signInWithRedirect,
  signInWithPopup,
  getRedirectResult,
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  User as FirebaseUser,
  AuthErrorCodes
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User } from "@shared/schema";

type AuthUser = {
  uid: string;
  id: number;
  username: string;
  email: string | null;
  name: string | null;
  photoURL: string | null;
  title?: string;
  location?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithPhone: (user: User) => void; // Function for phone authentication
  signInWithEmail: (user: User) => void; // Function for email authentication
  login: (user: any) => void; // Direct login function, mainly for demo users
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  signInWithGoogle: async () => {},
  signInWithPhone: () => {},
  signInWithEmail: () => {},
  login: () => {},
  signOut: async () => {},
  refreshUserData: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Set to true initially
  const { toast } = useToast();

  // Fetch user data from our backend - used for both initial load and refreshes
  const fetchUserData = async (userId: string | number) => {
    try {
      console.log(`Fetching user data for user ID: ${userId}`);
      const response = await apiRequest('GET', `/api/users/${userId}`);
      
      if (response.status === 404) {
        console.log('User not found in backend');
        return null;
      }
      
      const userData = await response.json();
      console.log('Backend user data:', userData);
      
      // Create a user with data from our backend
      return {
        uid: userId.toString(),
        id: userData.id,
        username: userData.username,
        email: userData.email,
        name: userData.name,
        photoURL: userData.photoURL || null,
        title: userData.title,
        location: userData.location
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  useEffect(() => {
    // Check for redirect result
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          // User signed in after redirect
          toast({
            title: "Successfully signed in!",
            description: "Welcome to Brandentifier"
          });
        }
      })
      .catch((error: any) => {
        console.error("Error getting redirect result:", error);
        
        // More informative error message
        let errorMessage = "There was a problem signing in with Google";
        
        if (error.code === 'auth/configuration-not-found') {
          errorMessage = "Firebase authentication is not properly configured. Please check your Firebase setup in the console.";
          console.log("Firebase auth domain:", `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`);
          console.log("Current domain:", window.location.hostname);
        } else if (error.code === 'auth/unauthorized-domain') {
          errorMessage = "This domain is not authorized for Firebase authentication. Please add it to your Firebase console under Auth > Settings > Authorized domains.";
        } else if (error.message) {
          errorMessage = `Error: ${error.message}`;
        }
        
        toast({
          title: "Sign in failed",
          description: errorMessage,
          variant: "destructive"
        });
      });
      
    // Listen for auth state changes with enhanced error handling
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      
      if (firebaseUser) {
        try {
          // First create or update the user in our backend
          await createOrUpdateUserInBackend(firebaseUser);
          
          // Then fetch the complete user data from our backend to get 
          // the latest profile picture and other information
          const backendUserData = await fetchUserData(firebaseUser.uid);
          
          // If we got data from backend, use it
          if (backendUserData) {
            setUser(backendUserData);
          } else {
            // Fallback to Firebase data if backend fetch fails
            setUser({
              uid: firebaseUser.uid,
              id: parseInt(firebaseUser.uid.substring(0, 5), 36) || 999,
              username: firebaseUser.uid.substring(0, 8),
              email: firebaseUser.email,
              name: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL
            });
          }
        } catch (error: any) {
          console.error("Error during authentication flow:", error);
          
          // Special handling for network errors with Firebase
          if (error.code === AuthErrorCodes.NETWORK_REQUEST_FAILED || 
              error.message?.includes('network') || 
              error.message?.includes('Failed to fetch')) {
            console.log("Network error detected during auth. Using cache if available.");
            
            // Look for cached user data in localStorage
            const cachedUserData = localStorage.getItem('userDataCache');
            if (cachedUserData) {
              try {
                const parsedUserData = JSON.parse(cachedUserData);
                setUser(parsedUserData);
                console.log("Using cached user data:", parsedUserData);
                
                // Don't show an error toast in this case as we've recovered
                toast({
                  title: "Using offline mode",
                  description: "You appear to be offline. Some features may be limited.",
                });
                setIsLoading(false);
                return;
              } catch (cacheError) {
                console.error("Error parsing cached user data:", cacheError);
              }
            }
          }
          
          // Fallback to basic Firebase data
          setUser({
            uid: firebaseUser.uid,
            id: parseInt(firebaseUser.uid.substring(0, 5), 36) || 999,
            username: firebaseUser.uid.substring(0, 8),
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL
          });
        }
        
        // Cache current user data for offline use
        try {
          if (user) {
            localStorage.setItem('userDataCache', JSON.stringify(user));
            localStorage.setItem('userDataCacheTimestamp', Date.now().toString());
          }
        } catch (cacheError) {
          console.error("Error caching user data:", cacheError);
        }
      } else {
        console.log("Auth state changed: User signed out");
        
        // Clear user state
        setUser(null);
        
        // Clear user data cache
        localStorage.removeItem('userDataCache');
        localStorage.removeItem('userDataCacheTimestamp');
        
        // Clear all query cache to prevent stale data
        queryClient.clear();
      }
      
      setIsLoading(false);
    }, (error) => {
      // Error handling for auth state observer
      console.error("Firebase auth state observer error:", error);
      
      // Don't set loading to false if this is a network error
      // as we might still recover with cached data
      if (!(error as any).code || (error as any).code !== AuthErrorCodes.NETWORK_REQUEST_FAILED) {
        setIsLoading(false);
      }
      
      // Check for cached user data
      try {
        const cachedUserData = localStorage.getItem('userDataCache');
        if (cachedUserData) {
          const parsedUserData = JSON.parse(cachedUserData);
          const cacheAge = Date.now() - parseInt(localStorage.getItem('userDataCacheTimestamp') || '0');
          
          // Use cached data if it's less than 24 hours old
          if (cacheAge < 1000 * 60 * 60 * 24) {
            setUser(parsedUserData);
            console.log("Using cached user data after auth error:", parsedUserData);
            
            toast({
              title: "Using cached data",
              description: "Having trouble connecting to authentication servers. Using cached data.",
            });
          }
        }
      } catch (cacheError) {
        console.error("Error recovering with cached user data:", cacheError);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const createOrUpdateUserInBackend = async (firebaseUser: FirebaseUser) => {
    try {
      // Check if user exists first
      const response = await apiRequest('POST', '/api/users', {
        username: firebaseUser.uid,
        email: firebaseUser.email || `${firebaseUser.uid}@example.com`,
        name: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL
      });
      
      return await response.json();
    } catch (error) {
      console.error("Error creating/updating user:", error);
      return null;
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      // Enhanced error handling for Google Sign-in
      
      // Set up browser compatibility checks
      const isChrome = navigator.userAgent.indexOf('Chrome') > -1;
      const isFirefox = navigator.userAgent.indexOf('Firefox') > -1;
      const isSafari = navigator.userAgent.indexOf('Safari') > -1 && !isChrome;
      const isEdge = navigator.userAgent.indexOf('Edg') > -1;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isReplit = window.location.hostname.includes('.replit.app') || 
                      window.location.hostname.includes('.repl.co') ||
                      window.location.hostname.includes('picard.replit.dev');
      
      const browserInfo = { isChrome, isFirefox, isSafari, isEdge, isMobile, isReplit };
      
      // Firebase configuration is already set up in firebase.ts
      
      let result;
      
      // Configure Google provider with specific options for Replit environment
      googleProvider.setCustomParameters({
        // Force account selection to prevent automatic sign-in
        prompt: 'select_account',
        // Improved permissions handling for cross-domain authentication
        auth_type: 'rerequest',
        // Set login hint to current email if available
        login_hint: window.location.hostname,
      });
      
      // Special handling to bypass third-party cookie and iframe restrictions
      
      try {
        // Try advanced custom popup window approach to bypass iframe restrictions
        if (window.location.hostname.includes('replit')) {
          // Create a special window configuration that allows popups to work better in Replit
          const width = 500;
          const height = 600;
          const left = window.screen.width / 2 - width / 2;
          const top = window.screen.height / 2 - height / 2;
          
          // Open a new window with specific parameters that allow it to bypass some restrictions
          const authWindow = window.open(
            `https://${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com/__/auth/handler?apiKey=${import.meta.env.VITE_FIREBASE_API_KEY}`,
            'googleAuthPopup',
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
          );
          
          if (!authWindow) {
            // If window.open failed, still try the regular popup method
            // Fall back to standard popup method if custom window fails
            result = await signInWithPopup(auth, googleProvider);
          } else {
            // Set up message listener to receive authentication result from popup
            
            // This will be a fallback in case the popup approach doesn't work
            // We'll still try the normal Firebase popup method after a timeout
            const popupTimeout = setTimeout(async () => {
              if (authWindow && !authWindow.closed) {
                authWindow.close();
                // If custom window approach times out, try standard popup
                try {
                  result = await signInWithPopup(auth, googleProvider);
                } catch (popupError: any) {
                  console.error("Standard popup also failed:", popupError);
                  throw popupError;
                }
              }
            }, 10000); // 10 second timeout
            
            try {
              // Close the popup and try the regular signInWithPopup
              clearTimeout(popupTimeout);
              if (authWindow && !authWindow.closed) {
                authWindow.close();
              }
              result = await signInWithPopup(auth, googleProvider);
            } catch (error) {
              console.error("Error during authentication:", error);
              throw error;
            }
          }
        } else {
          // Standard environment - use normal popup
          console.log("Starting standard Google sign-in with popup method");
          result = await signInWithPopup(auth, googleProvider);
        }
      } catch (popupError: any) {
        console.error("Popup authentication failed:", popupError);
          
        // If popup fails with specific errors, try redirect as fallback
        if (
          popupError.code === 'auth/popup-blocked' || 
          popupError.code === 'auth/popup-closed-by-user' ||
          popupError.code === 'auth/cancelled-popup-request'
        ) {
          try {
            console.log("Popup blocked, attempting redirect method as fallback...");
            await signInWithRedirect(auth, googleProvider);
            return; // We'll pick up the result in the getRedirectResult() handler
          } catch (redirectError: any) {
            console.error("Redirect authentication also failed:", redirectError);
            throw redirectError; // Both methods failed
          }
        } else if (popupError.code === 'auth/internal-error') {
          console.log("Internal error - this may be due to third-party cookie restrictions");
          // Try one more approach - open a new tab directly to Firebase auth
          try {
            window.open(`https://${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com/auth`, '_blank');
            throw {
              code: 'auth/custom-window-opened',
              message: "We've opened a new window for authentication. Please complete the sign-in there and then return to this page and refresh."
            };
          } catch (windowError) {
            console.error("Failed to open authentication window:", windowError);
            throw popupError;
          }
        } else {
          throw popupError; // Other errors should be handled by caller
        }
      }
      
      // If we get here, authentication was successful
      console.log("Google sign-in successful:", result?.user);
      
      if (result?.user) {
        // Create or update user in our backend
        await createOrUpdateUserInBackend(result.user);
        
        // Now fetch the complete user data from our backend
        const backendUserData = await fetchUserData(result.user.uid);
        
        // If we got data from backend, use it
        if (backendUserData) {
          setUser(backendUserData);
        } else {
          // Fallback to Firebase data if backend fetch fails
          setUser({
            uid: result.user.uid,
            id: parseInt(result.user.uid.substring(0, 5), 36) || Math.floor(Math.random() * 10000),
            username: result.user.uid.substring(0, 8),
            email: result.user.email,
            name: result.user.displayName,
            photoURL: result.user.photoURL
          });
        }
        
        toast({
          title: "Successfully signed in!",
          description: "Welcome to Brandentifier"
        });
      }
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      setIsLoading(false);
      
      // Enhanced error handling with more specific messages
      if (error.code === 'auth/configuration-not-found') {
        toast({
          title: "Authentication Error",
          description: "Firebase authentication is not properly configured. Please check your Firebase setup.",
          variant: "destructive"
        });
        
        console.log("Configuration details:", {
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "Not set",
          apiKeyPresent: !!import.meta.env.VITE_FIREBASE_API_KEY,
          appIdPresent: !!import.meta.env.VITE_FIREBASE_APP_ID,
          domain: window.location.hostname
        });
      } else if (error.code === 'auth/internal-error') {
        toast({
          title: "Google Authentication Unavailable",
          description: "Google login is currently unavailable in this environment. Please use the Demo Login option instead for the best experience.",
          variant: "destructive",
          duration: 10000, // Show for longer so user can read it
        });
      } else if (error.code === 'auth/replit-environment') {
        toast({
          title: "Authentication Notice",
          description: error.message || "Google authentication doesn't work in this environment. Please use email sign-in instead.",
          duration: 10000,
        });
      } else if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        toast({
          title: "Authentication Failed",
          description: "Sign-in popup was blocked or closed. Please allow popups for this site and try again.",
          variant: "destructive"
        });
      } else if (error.code === 'auth/unauthorized-domain') {
        toast({
          title: "Authentication Failed",
          description: `This domain (${window.location.hostname}) is not authorized for Firebase authentication. Please add it to your Firebase console.`,
          variant: "destructive"
        });
      } else if (error.code === 'auth/network-request-failed') {
        toast({
          title: "Network Error",
          description: "Network connection issue. Please check your internet connection.",
          variant: "destructive"
        });
      } else if (error.code === 'auth/timeout') {
        errorMessage = "The authentication request timed out. Please try again.";
      } else if (error.message) {
        errorMessage = `Authentication error: ${error.message}`;
      }
      
      // Log the detailed error information for debugging
      console.log("Auth error details:", {
        code: error.code,
        message: error.message,
        details: errorDetails,
        error
      });
      
      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Phone auth implementation
  const signInWithPhone = (userData: User) => {
    setIsLoading(true);
    
    try {
      // Convert database user to our AuthUser type
      setUser({
        uid: userData.id.toString(),
        id: userData.id,
        username: userData.username || userData.id.toString().substring(0, 8),
        email: userData.email,
        name: userData.name,
        photoURL: userData.photoURL,
        title: userData.title || undefined,
        location: userData.location || undefined
      });
      
      toast({
        title: "Phone verified successfully",
        description: "Welcome to Brandentifier"
      });
    } catch (error) {
      console.error("Error signing in with phone:", error);
      toast({
        title: "Sign in failed",
        description: "There was a problem signing in with phone verification",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Enhanced Email auth implementation
  const signInWithEmail = async (userData: User) => {
    setIsLoading(true);
    
    try {
      console.log("signInWithEmail received userData:", userData);
      
      if (!userData || !userData.id) {
        throw new Error("Invalid user data received");
      }
      
      // Skip the backend call for demo accounts
      const isDemoUser = typeof userData.email === 'string' && userData.email.includes('@brandentifier.demo');
      
      // Only make backend API call for non-demo users
      if (!isDemoUser) {
        // First create or update the user in our backend
        const createUserResponse = await apiRequest('POST', '/api/users', {
          id: userData.id,
          username: userData.username || `user_${userData.id}`,
          email: userData.email,
          name: userData.name,
          photoURL: userData.photoURL,
          title: userData.title || null,
          location: userData.location || null,
          // Use id as fallback for uid
          uid: userData.id.toString()
        });
        
        if (!createUserResponse.ok) {
          console.error("Error creating user in backend:", await createUserResponse.text());
          throw new Error("Failed to create user in backend");
        }
      }
      
      // Convert database user to our AuthUser type
      const authUser = {
        // Use id as uid for demo users
        uid: userData.id.toString(),
        id: userData.id,
        username: userData.username || userData.id.toString().substring(0, 8),
        email: userData.email,
        name: userData.name,
        photoURL: userData.photoURL,
        title: userData.title || undefined,
        location: userData.location || undefined,
        isDemo: isDemoUser
      };
      
      setUser(authUser);
      
      // Cache user data for offline use
      try {
        localStorage.setItem('userDataCache', JSON.stringify(authUser));
        localStorage.setItem('authMethod', 'email');
        localStorage.setItem('userDataCacheTimestamp', Date.now().toString());
      } catch (cacheError) {
        console.error("Error caching user data:", cacheError);
      }
      
      toast({
        title: "Signed in successfully",
        description: "Welcome to Brandentifier"
      });
    } catch (error) {
      console.error("Error signing in with email:", error);
      toast({
        title: "Sign in failed",
        description: "There was a problem signing in with email verification",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const signOut = async () => {
    setIsLoading(true);
    
    try {
      try {
        // Normal Firebase sign out - try/catch to handle if not using Firebase
        await firebaseSignOut(auth);
      } catch (firebaseError) {
        console.log("Firebase sign out not applicable or failed", firebaseError);
      }
      
      // Clear user state
      setUser(null);
      
      // Clear localStorage
      try {
        localStorage.removeItem('userDataCache');
        localStorage.removeItem('authMethod');
        localStorage.removeItem('userDataCacheTimestamp');
      } catch (storageError) {
        console.error("Error clearing localStorage:", storageError);
      }
      
      // Clear all query cache to prevent stale data
      queryClient.clear();
      
      // Redirect to auth page (using window.location for a full refresh)
      window.location.href = '/auth';
      
      toast({
        title: "Signed out",
        description: "You've been successfully signed out"
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Sign out failed",
        description: "There was a problem signing out",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserData = async () => {
    setIsLoading(true);
    
    try {
      if (!user) {
        console.error("Cannot refresh user data: No user is signed in");
        return;
      }
      
      // Fetch latest user data
      const refreshedData = await fetchUserData(user.uid);
      
      if (refreshedData) {
        setUser(refreshedData);
        
        // Update cache
        localStorage.setItem('userDataCache', JSON.stringify(refreshedData));
        localStorage.setItem('userDataCacheTimestamp', Date.now().toString());
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Direct login function (mainly for demo users)
  const login = (userData: any) => {
    return signInWithEmail(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signInWithGoogle,
        signInWithPhone,
        signInWithEmail,
        login,
        signOut,
        refreshUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}