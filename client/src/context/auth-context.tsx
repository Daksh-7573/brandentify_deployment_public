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
import { auth, googleProvider } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { logDetailedAuthError } from "@/utils/auth-error-logger";
import { logAuthError, checkFirebaseConfig } from "@/utils/auth-diagnostics";

// Define our auth user type
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

// Define our auth context type
type AuthContextType = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithPhone: (user: User) => void;
  signInWithEmail: (user: User) => void;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
};

// Create the auth context with default values
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isDemoMode: false,
  signInWithGoogle: async () => {},
  signInWithPhone: () => {},
  signInWithEmail: () => {},
  signOut: async () => {},
  refreshUserData: async () => {},
});

// Create the provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const { toast } = useToast();

  // Fetch user data from our backend
  const fetchUserData = async (userId: string | number): Promise<AuthUser | null> => {
    try {
      console.log(`Fetching user data for user ID: ${userId}`);
      const response = await apiRequest('GET', `/api/users/${userId}`);
      
      if (response.status === 404) {
        console.log('User not found in backend');
        return null;
      }
      
      const userData = await response.json();
      console.log('Backend user data:', userData);
      
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

  // Create or update a user in our backend
  const createOrUpdateUserInBackend = async (firebaseUser: FirebaseUser) => {
    try {
      // Make sure required fields exist
      const userData = {
        username: firebaseUser.uid, // Use Firebase UID as username for consistency
        email: firebaseUser.email || `firebase_${firebaseUser.uid.substring(0, 8)}@example.com`,
        name: firebaseUser.displayName || "Firebase User",
        photoURL: firebaseUser.photoURL,
      };
      
      // Create the user
      const response = await apiRequest('POST', '/api/users', userData);
      
      // If the user was created, return the user data from the backend
      if (response.ok) {
        return await response.json();
      }
      
      // If we get here, just fetch the user data instead
      return await fetchUserData(firebaseUser.uid);
    } catch (error) {
      console.error("Error in createOrUpdateUserInBackend:", error);
      return null;
    }
  };

  // Check for authentication on mount and when redirect result is available
  useEffect(() => {
    setIsLoading(true);
    console.log("AuthProvider useEffect running - checking auth state");
    
    // Clear demo mode from localStorage to ensure Firebase auth is used
    localStorage.removeItem('demoMode');
    
    // Check if we're on the problematic domain
    const currentHostname = window.location.hostname;
    const isOnProblemDomain = currentHostname === "25d68c5d-166d-4f92-b5c1-cdfc68146e33-00-2kol6l2kz9i0s.picard.replit.dev";
    
    if (isOnProblemDomain) {
      console.log("On problematic domain, ensuring correct auth handling");
    }
    
    // First check for redirect result
    const checkRedirectResult = async () => {
      try {
        console.log("Checking for redirect result from Google auth");
        const result = await getRedirectResult(auth);
        
        if (result && result.user) {
          console.log("REDIRECT result found! User:", result.user);
          
          // Create or update user in our backend
          console.log("Creating/updating user in backend after redirect");
          await createOrUpdateUserInBackend(result.user);
          
          // Then fetch the user data
          console.log("Fetching user data after redirect");
          const userData = await fetchUserData(result.user.uid);
          
          if (userData) {
            console.log("Setting user state with backend data after redirect:", userData);
            setUser(userData);
            toast({
              title: "Signed in successfully via redirect",
              description: `Welcome${userData.name ? ` ${userData.name}` : ''}!`,
            });
          } else {
            // If we couldn't get backend data, use Firebase data as fallback
            console.log("Using Firebase data as fallback after redirect");
            const fallbackUser = {
              uid: result.user.uid,
              id: parseInt(result.user.uid.substring(0, 5), 36) || 999,
              username: result.user.uid.substring(0, 8),
              email: result.user.email,
              name: result.user.displayName,
              photoURL: result.user.photoURL
            };
            
            setUser(fallbackUser);
            toast({
              title: "Signed in successfully via redirect",
              description: `Welcome${fallbackUser.name ? ` ${fallbackUser.name}` : ''}!`,
            });
          }
          
          // Important: Return early to avoid the auth state listener processing the same user
          setIsLoading(false);
          return true;
        } else {
          console.log("No redirect result found");
          return false;
        }
      } catch (error) {
        console.error("Error checking redirect result:", error);
        toast({
          title: "Authentication error",
          description: "Error processing Google redirect. Please try again.",
          variant: "destructive"
        });
        return false;
      }
    };
    
    // Check for redirect result and then set up auth state listener
    checkRedirectResult().then((redirectHandled) => {
      console.log("Redirect check completed, handled:", redirectHandled);
      
      // If redirect was handled, we don't need to process the auth state again
      if (redirectHandled) return;
      
      // Set up auth state listener
      console.log("Setting up auth state listener");
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        console.log("Auth state changed:", firebaseUser ? "User signed in" : "User signed out");
        
        if (firebaseUser) {
          // User is signed in
          try {
            // Only update if we don't already have this user
            if (!user || user.uid !== firebaseUser.uid) {
              console.log("New user detected in auth state, updating:", firebaseUser.uid);
              
              // Get user data from backend
              const userData = await fetchUserData(firebaseUser.uid);
              
              if (userData) {
                console.log("Setting user state with backend data:", userData);
                setUser(userData);
              } else {
                // If not found, create the user first
                console.log("User not found in backend, creating...");
                await createOrUpdateUserInBackend(firebaseUser);
                
                // Try fetching user data again
                console.log("Fetching newly created user data");
                const newUserData = await fetchUserData(firebaseUser.uid);
                
                if (newUserData) {
                  console.log("Setting user state with new backend data:", newUserData);
                  setUser(newUserData);
                } else {
                  // Last resort - use Firebase data
                  console.log("Using Firebase data as last resort");
                  setUser({
                    uid: firebaseUser.uid,
                    id: parseInt(firebaseUser.uid.substring(0, 5), 36) || 999,
                    username: firebaseUser.uid.substring(0, 8),
                    email: firebaseUser.email,
                    name: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL
                  });
                }
              }
            }
          } catch (error) {
            console.error("Error in auth state change handler:", error);
          }
        } else {
          // User is signed out
          if (user) {
            console.log("User signed out, clearing state");
            setUser(null);
          }
        }
        
        setIsLoading(false);
      });
      
      // Ensure we clean up the auth state listener
      return () => unsubscribe();
    });
  }, [user, toast]);

  // Sign in with Google - simplified to use only redirect auth
  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      console.log("Starting Google sign-in flow");
      
      // Clear any previous auth state attempts
      localStorage.removeItem('authAttemptInProgress');
      
      // Mark an auth attempt in progress to help debug issues
      localStorage.setItem('authAttemptInProgress', 'true');
      localStorage.setItem('authAttemptTime', new Date().toISOString());
      
      // Get current domain info
      const currentHostname = window.location.hostname;
      const currentOrigin = window.location.origin;
      const isOnProblemDomain = currentHostname === "25d68c5d-166d-4f92-b5c1-cdfc68146e33-00-2kol6l2kz9i0s.picard.replit.dev";
      
      console.log("Using redirect auth flow with these parameters:");
      
      // Reset the provider to get a clean state
      const freshProvider = new GoogleAuthProvider();
      
      // SIMPLIFIED APPROACH: Use minimal settings for maximum compatibility
      // Store the current URL for better debugging only
      localStorage.setItem('auth_redirect_origin', currentOrigin);
      localStorage.setItem('auth_redirect_hostname', currentHostname);
      
      // Use the provider from firebase.ts with no additional customizations
      // This ensures we're using the providers that are already configured correctly
      console.log("Using simplified authentication approach with default Firebase provider");
      
      // Always ensure we get these scopes for both methods
      freshProvider.addScope('profile');
      freshProvider.addScope('email');
      
      // Check if we're using a hybrid approach (try popup first, fallback to redirect)
      const useHybridAuth = localStorage.getItem('use_hybrid_auth') === 'true';
      
      if (useHybridAuth) {
        console.log("Using hybrid authentication (popup with redirect fallback)");
        try {
          // Try popup first as it's more reliable on problematic domains
          console.log("Attempting popup authentication...");
          const result = await signInWithPopup(auth, freshProvider);
          console.log("Popup authentication successful");
          
          // If we get here, popup worked, create the user
          if (result.user) {
            const userData = await createOrUpdateUserInBackend(result.user);
            setUser(userData);
            return; // Exit the function as we're done
          }
        } catch (popupError) {
          console.warn("Popup authentication failed, falling back to redirect:", popupError);
          // Continue to redirect flow
        }
      }
      
      // Proceed with standard redirect flow
      console.log("Proceeding with redirect sign-in using configured provider");
      
      // Using fresh provider with minimal configuration
      // Let Firebase handle the redirect_uri internally
      await signInWithRedirect(auth, freshProvider);
      
      // Note: We don't expect to reach this code as the redirect should happen immediately
      console.log("Redirect initiated");
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      
      // Log detailed error information for debugging
      logAuthError(error, "signInWithGoogle");
      
      // Show error toast for all authentication errors
      toast({
        title: "Authentication error",
        description: "There was a problem with Google sign-in. Please try again.",
        variant: "destructive"
      });
      
      throw error; // Re-throw for handling in the component
    } finally {
      setIsLoading(false);
    }
  };

  // Demo mode sign in
  const signInWithPhone = (userData: User) => {
    setUser({
      uid: userData.id.toString(),
      id: userData.id,
      username: userData.username,
      email: userData.email,
      name: userData.name,
      photoURL: userData.photoURL,
      title: userData.title || undefined,
      location: userData.location || undefined
    });
    
    setIsDemoMode(true);
    localStorage.setItem('demoMode', 'true');
    
    toast({
      title: "Demo mode activated",
      description: `Welcome ${userData.name || 'to the demo'}!`,
    });
  };

  // Email authentication
  const signInWithEmail = (userData: User) => {
    setUser({
      uid: userData.id.toString(),
      id: userData.id,
      username: userData.username,
      email: userData.email,
      name: userData.name,
      photoURL: userData.photoURL,
      title: userData.title || undefined,
      location: userData.location || undefined
    });
    
    toast({
      title: "Signed in with email",
      description: `Welcome ${userData.name || ''}!`,
    });
  };

  // Sign out
  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Only sign out from Firebase if not in demo mode
      if (!isDemoMode) {
        await firebaseSignOut(auth);
      }
      
      // Clear demo mode
      setIsDemoMode(false);
      localStorage.removeItem('demoMode');
      
      // Clear user
      setUser(null);
      
      // Clear query cache
      queryClient.clear();
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh user data
  const refreshUserData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const refreshedData = await fetchUserData(user.uid);
      
      if (refreshedData) {
        setUser(refreshedData);
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
        isDemoMode,
        signInWithGoogle,
        signInWithPhone,
        signInWithEmail,
        signOut,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for using the auth context
export function useAuth() {
  return useContext(AuthContext);
}