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

  // Sign in with Google - use popup authentication as primary method
  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      console.log("Starting Google sign-in flow");
      
      // Clear any previous auth state attempts
      localStorage.removeItem('authAttemptInProgress');
      
      // Mark an auth attempt in progress to help debug issues
      localStorage.setItem('authAttemptInProgress', 'true');
      localStorage.setItem('authAttemptTime', new Date().toISOString());
      
      console.log("Initiating popup auth flow");
      
      // Use popup as the primary method since it's more reliable for this app
      const result = await signInWithPopup(auth, googleProvider);
      
      if (result && result.user) {
        console.log("Popup sign-in successful! User:", result.user.uid);
        
        // Create or update user in our backend
        console.log("Creating/updating user in backend after popup");
        await createOrUpdateUserInBackend(result.user);
        
        // Then fetch the user data
        console.log("Fetching user data after popup");
        const userData = await fetchUserData(result.user.uid);
        
        if (userData) {
          console.log("Setting user state with backend data after popup:", userData);
          setUser(userData);
          toast({
            title: "Signed in successfully",
            description: `Welcome${userData.name ? ` ${userData.name}` : ''}!`,
          });
        } else {
          // If we couldn't get backend data, use Firebase data as fallback
          console.log("Using Firebase data as fallback after popup");
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
            title: "Signed in successfully",
            description: `Welcome${fallbackUser.name ? ` ${fallbackUser.name}` : ''}!`,
          });
        }
      }
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      
      // Log detailed error information for debugging
      logAuthError(error, "signInWithGoogle");
      
      // Try redirect as a fallback if popup fails
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        try {
          console.log("Popup blocked or closed, trying redirect as fallback");
          toast({
            title: "Popup was blocked",
            description: "Trying alternative sign-in method...",
          });
          
          // Try redirect instead
          await signInWithRedirect(auth, googleProvider);
          // Code after this line won't execute until redirect completes and user returns
          console.log("Redirect initiated");
        } catch (redirectError: any) {
          console.error("Redirect fallback also failed:", redirectError);
          logAuthError(redirectError, "signInWithGoogle.redirectFallback");
          throw redirectError;
        }
      } else {
        // Only show toast for errors that aren't handled by the GoogleAuth component
        toast({
          title: "Authentication error",
          description: "There was a problem with Google sign-in. Please try again.",
          variant: "destructive"
        });
        
        throw error; // Re-throw for handling in the component
      }
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