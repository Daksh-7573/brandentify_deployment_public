import { createContext, useState, useEffect, ReactNode, useContext } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User } from "@shared/schema";

type AuthUser = {
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
  signInWithEmail: (user: User) => void; // Function for email authentication
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  signInWithEmail: () => {},
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
      const browserInfo = { isChrome, isFirefox, isSafari, isEdge };
      
      // Log Firebase configuration for debugging
      console.log("Firebase config:", {
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
        hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
        hasAppId: !!import.meta.env.VITE_FIREBASE_APP_ID,
        currentUrl: window.location.href,
        browserInfo
      });
      
      // Check if we're on mobile - if so, use redirect flow which works better on mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      let result;
      
      // First attempt: always use redirect method for better cross-browser compatibility
      try {
        console.log("Starting Google sign-in with redirect method");
        
        // Configure auth provider with more options to prevent third-party cookie issues
        googleProvider.setCustomParameters({
          prompt: 'select_account',
          auth_type: 'rerequest',
          // Include hostname in state parameter to help with cross-domain issues
          state: encodeURIComponent(window.location.hostname)
        });
        
        await signInWithRedirect(auth, googleProvider);
        return; // We'll pick up the result in the getRedirectResult() handler
      } catch (redirectError: any) {
        // If redirect method fails, try popup as fallback
        console.error("Redirect sign-in failed, attempting popup:", redirectError);
        
        // For specific errors, try popup method
        if (
          redirectError.code === 'auth/internal-error' || 
          redirectError.code === 'auth/network-request-failed'
        ) {
          try {
            console.log("Attempting Google sign-in with popup method as fallback...");
            result = await signInWithPopup(auth, googleProvider);
          } catch (popupError: any) {
            console.error("Popup authentication also failed:", popupError);
            throw popupError; // Both methods failed
          }
        } else {
          throw redirectError; // Other errors should be handled by caller
        }
      }
      
      // If we get here, popup was successful
      console.log("Google sign-in successful:", result.user);
      
      if (result.user) {
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
            id: parseInt(result.user.uid.substring(0, 5), 36) || 999,
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
      
      // More informative error message
      let errorMessage = "There was a problem signing in with Google";
      let errorDetails = ""; // Additional details for debugging
      
      // Enhanced error handling with more specific messages
      if (error.code === 'auth/configuration-not-found') {
        errorMessage = "Firebase authentication is not properly configured.";
        errorDetails = `Project ID: ${import.meta.env.VITE_FIREBASE_PROJECT_ID}, Domain: ${window.location.hostname}`;
        console.log("Configuration details:", {
          apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? "Set (length: " + import.meta.env.VITE_FIREBASE_API_KEY.length + ")" : "Not set",
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "Not set",
          authDomain: window.location.hostname,
          appId: import.meta.env.VITE_FIREBASE_APP_ID ? "Set (length: " + import.meta.env.VITE_FIREBASE_APP_ID.length + ")" : "Not set"
        });
      } else if (error.code === 'auth/internal-error') {
        errorMessage = "There was an internal authentication error. Please check browser settings below.";
        errorDetails = "Please try one or more of these solutions:\n1. Enable third-party cookies in your browser settings\n2. Disable any ad-blockers or privacy extensions temporarily\n3. Use a different browser (Chrome recommended)\n4. Clear your browser cache and cookies";
        
        // Show a more helpful toast with detailed instructions
        toast({
          title: "Authentication Failed",
          description: "There was an internal authentication error. Please check if third-party cookies are enabled and try disabling ad-blockers.",
          variant: "destructive",
          duration: 10000, // Show for longer so user can read it
        });
      } else if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Sign-in popup was blocked or closed. Please try again.";
        errorDetails = "Ensure your browser allows popups for this website.";
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = "This domain is not authorized for Firebase authentication.";
        errorDetails = `Current domain "${window.location.hostname}" needs to be added to your Firebase console under Auth > Settings > Authorized domains.`;
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network connection issue. Please check your internet connection.";
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
      
      // First create or update the user in our backend
      const createUserResponse = await apiRequest('POST', '/api/users', {
        id: userData.id,
        username: userData.username || `user_${userData.id}`,
        email: userData.email,
        name: userData.name,
        photoURL: userData.photoURL,
        title: userData.title || null,
        location: userData.location || null,
        uid: userData.uid || `firebase_${userData.id}`
      });
      
      if (!createUserResponse.ok) {
        console.error("Error creating user in backend:", await createUserResponse.text());
        throw new Error("Failed to create user in backend");
      }
      
      // Convert database user to our AuthUser type
      setUser({
        uid: userData.uid || userData.id.toString(),
        id: userData.id,
        username: userData.username || userData.id.toString().substring(0, 8),
        email: userData.email,
        name: userData.name,
        photoURL: userData.photoURL,
        title: userData.title || undefined,
        location: userData.location || undefined
      });
      
      // Cache user data for offline use
      try {
        localStorage.setItem('userDataCache', JSON.stringify({
          uid: userData.uid || userData.id.toString(),
          id: userData.id,
          username: userData.username || userData.id.toString().substring(0, 8),
          email: userData.email,
          name: userData.name,
          photoURL: userData.photoURL,
          title: userData.title || undefined,
          location: userData.location || undefined
        }));
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
      // Normal Firebase sign out
      await firebaseSignOut(auth);
      
      // Clear all query cache to prevent stale data
      queryClient.clear();
      
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

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signInWithGoogle,
        signInWithPhone,
        signInWithEmail,
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