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
      console.log("Creating/updating user with Google profile:", {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL
      });
      
      // Make sure required fields exist and use all available Google profile data
      const userData = {
        username: firebaseUser.uid, // Use Firebase UID as username for consistency
        email: firebaseUser.email || `firebase_${firebaseUser.uid.substring(0, 8)}@example.com`,
        name: firebaseUser.displayName || "Google User",
        photoURL: firebaseUser.photoURL,
        // Include provider data for more detail
        provider: "google",
        emailVerified: firebaseUser.emailVerified || false,
      };
      
      // Create the user
      const response = await apiRequest('POST', '/api/users', userData);
      
      // If the user was created, return the user data from the backend
      if (response.ok) {
        const createdUser = await response.json();
        console.log("User created in backend successfully:", createdUser);
        return createdUser;
      }
      
      // If post fails (likely because user already exists), try updating instead
      console.log("User POST failed, trying to update existing user with PUT");
      const updateResponse = await apiRequest('PUT', `/api/users/${firebaseUser.uid}`, userData);
      
      if (updateResponse.ok) {
        const updatedUser = await updateResponse.json();
        console.log("User updated in backend successfully:", updatedUser);
        return updatedUser;
      }
      
      // If we get here, just fetch the user data instead
      console.log("Falling back to fetching existing user data");
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
    
    // First check for redirect result - this handles when users are redirected back after Google auth
    const checkRedirectResult = async () => {
      try {
        console.log("Checking for redirect result from Google auth");
        
        // getRedirectResult() checks if this page load is the result of a redirect from Google
        const result = await getRedirectResult(auth);
        
        if (result && result.user) {
          console.log("REDIRECT result found! User signed in via redirect:", {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName
          });
          
          // First create or update the user in our backend
          console.log("Creating/updating user in backend after redirect");
          const backendUser = await createOrUpdateUserInBackend(result.user);
          
          if (backendUser) {
            console.log("User created/updated in backend successfully after redirect");
            
            // Fetch complete user data from backend
            console.log("Fetching user data after redirect");
            const userData = await fetchUserData(result.user.uid);
            
            if (userData) {
              console.log("Setting user state with backend data after redirect");
              setUser(userData);
              toast({
                title: "Signed in successfully",
                description: `Welcome${userData.name ? ` ${userData.name}` : ''}!`,
              });
              
              // Clear any auth attempt markers
              localStorage.removeItem('authAttemptInProgress');
              localStorage.removeItem('authAttemptTime');
              
              // Important: Return early to avoid the auth state listener processing the same user
              setIsLoading(false);
              return true;
            }
          }
          
          // If backend operations failed, use Firebase user data as last resort
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
            title: "Signed in with limited data",
            description: `Welcome${fallbackUser.name ? ` ${fallbackUser.name}` : ''}!`,
          });
          
          // Clear any auth attempt markers
          localStorage.removeItem('authAttemptInProgress');
          localStorage.removeItem('authAttemptTime');
          
          setIsLoading(false);
          return true;
        } else {
          console.log("No redirect result found - this is a normal page load, not a redirect callback");
          return false;
        }
      } catch (error) {
        console.error("Error checking redirect result:", error);
        
        // Log detailed error information for debugging
        logAuthError(error, "checkRedirectResult");
        
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
              console.log("New user detected in auth state, handling login for:", firebaseUser.uid, {
                email: firebaseUser.email,
                displayName: firebaseUser.displayName
              });
              
              // Clear any auth attempt markers since we have a successful sign-in
              localStorage.removeItem('authAttemptInProgress');
              localStorage.removeItem('authAttemptTime');
              
              // First, try to create or update the user in our backend
              console.log("Creating/updating user in backend from auth state change");
              await createOrUpdateUserInBackend(firebaseUser);
              
              // Then get user data from backend 
              console.log("Fetching user data from backend");
              const userData = await fetchUserData(firebaseUser.uid);
              
              if (userData) {
                console.log("Setting user state with backend data");
                setUser(userData);
                
                // Only show toast if this is a new login (not a page refresh)
                if (!user) {
                  toast({
                    title: "Signed in successfully",
                    description: `Welcome${userData.name ? ` ${userData.name}` : ''}!`,
                  });
                }
              } else {
                // Last resort - use Firebase data
                console.warn("Could not get user data from backend, using Firebase data as last resort");
                const fallbackUser = {
                  uid: firebaseUser.uid,
                  id: parseInt(firebaseUser.uid.substring(0, 5), 36) || 999,
                  username: firebaseUser.uid.substring(0, 8),
                  email: firebaseUser.email,
                  name: firebaseUser.displayName,
                  photoURL: firebaseUser.photoURL
                };
                
                setUser(fallbackUser);
                
                // Only show toast if this is a new login (not a page refresh)
                if (!user) {
                  toast({
                    title: "Signed in with limited data",
                    description: `Welcome${fallbackUser.name ? ` ${fallbackUser.name}` : ''}!`,
                  });
                }
              }
            }
          } catch (error) {
            console.error("Error in auth state change handler:", error);
            logAuthError(error, "onAuthStateChanged");
          }
        } else {
          // User is signed out
          if (user) {
            console.log("User signed out, clearing state");
            setUser(null);
            
            toast({
              title: "Signed out",
              description: "You have been signed out successfully.",
            });
          }
        }
        
        setIsLoading(false);
      });
      
      // Ensure we clean up the auth state listener
      return () => unsubscribe();
    });
  }, [user, toast]);

  // Sign in with Google - using our optimized popup authentication
  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      
      // Import the enhanced popup authentication utility
      const { googlePopupAuth, clearAuthAttemptData } = await import('@/utils/auth-popup-fix');
      
      // Clear any previous auth state tracking
      clearAuthAttemptData();
      
      console.log("Starting Google sign-in with enhanced popup authentication");
      
      // Use our specialized popup authentication function
      const result = await googlePopupAuth(auth);
      console.log("Google authentication successful:", result.user);
      
      if (result.user) {
        // Create or update the user in the backend
        console.log("Creating/updating user in backend after successful authentication");
        await createOrUpdateUserInBackend(result.user);
        
        // Fetch the complete user data from backend
        console.log("Fetching user data from backend");
        const userData = await fetchUserData(result.user.uid);
        
        if (userData) {
          // Set the user in state if we got valid data
          console.log("Setting user state with backend data");
          setUser(userData);
          
          // Show welcome toast
          toast({
            title: "Signed in successfully",
            description: `Welcome${userData.name ? ` ${userData.name}` : ''}!`,
          });
        } else {
          // If we couldn't get user data from backend, use a minimal representation
          console.warn("Could not get user data from backend after authentication");
          
          // Create a fallback user with minimal data
          const fallbackUser = {
            uid: result.user.uid,
            id: parseInt(result.user.uid.substring(0, 5), 36) || 999,
            username: result.user.uid,
            email: result.user.email,
            name: result.user.displayName,
            photoURL: result.user.photoURL
          };
          
          setUser(fallbackUser);
          
          toast({
            title: "Signed in with limited data",
            description: "Welcome! Some profile data may be missing.",
          });
        }
      }
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      
      // Log detailed error information for debugging
      logAuthError(error, "signInWithGoogle");
      
      // Check for specific errors and show helpful messages
      let errorMessage = "There was a problem with Google sign-in. Please try again.";
      
      if (error.code === 'auth/popup-blocked') {
        errorMessage = "The login popup was blocked by your browser. Please allow popups for this site.";
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Sign-in was cancelled. Please try again when you're ready.";
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = "Authentication isn't configured for this domain. Please contact support.";
      }
      
      toast({
        title: "Authentication error",
        description: errorMessage,
        variant: "destructive"
      });
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