import { createContext, useState, useEffect, ReactNode, useContext } from "react";
import { 
  signInWithRedirect,
  signInWithPopup,
  getRedirectResult,
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  User as FirebaseUser,
  Auth
} from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User } from "@shared/schema";

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

  // Create or update a user in our backend
  const createOrUpdateUserInBackend = async (firebaseUser: FirebaseUser) => {
    try {
      const userData = {
        username: firebaseUser.email?.split('@')[0] || firebaseUser.uid,
        email: firebaseUser.email || `firebase_${firebaseUser.uid.substring(0, 8)}@example.com`,
        name: firebaseUser.displayName || null,
        photoURL: firebaseUser.photoURL,
        title: null,
        location: null,
      };
      
      const response = await apiRequest('POST', '/api/users', userData);
      
      if (response.ok) {
        return await response.json();
      }
      
      // If post fails, try updating
      const updateResponse = await apiRequest('PUT', `/api/users/${firebaseUser.uid}`, userData);
      
      if (updateResponse.ok) {
        return await updateResponse.json();
      }
      
      return null;
    } catch (error) {
      console.error("Error in createOrUpdateUserInBackend:", error);
      return null;
    }
  };

  // Fetch user data from our backend
  const fetchUserData = async (userId: string, userEmail?: string): Promise<AuthUser | null> => {
    try {
      let url = `/api/users/${userId}`;
      if (userEmail) {
        url += `?email=${encodeURIComponent(userEmail)}`;
      }
      
      const response = await apiRequest('GET', url);
      
      if (response.status === 404) {
        return null;
      }
      
      const userData = await response.json();
      
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

  // Initialize authentication on mount
  useEffect(() => {
    console.log("🔥 AuthProvider initializing...");
    
    const initAuth = async () => {
      try {
        // Import Firebase objects with proper typing
        const firebaseModule = await import('@/lib/firebase');
        const auth = firebaseModule.auth as Auth;
        const googleProvider = firebaseModule.googleProvider as GoogleAuthProvider;
        
        // First check for redirect result
        const redirectAttempt = localStorage.getItem('google_auth_redirect_attempt');
        if (redirectAttempt) {
          console.log("🔄 Checking for redirect result...");
          try {
            const result = await getRedirectResult(auth);
            if (result?.user) {
              console.log("✅ Redirect successful:", result.user.email);
              
              // Clear redirect markers
              localStorage.removeItem('google_auth_redirect_attempt');
              localStorage.removeItem('google_auth_redirect_time');
              
              // Process the authenticated user
              await createOrUpdateUserInBackend(result.user);
              const userData = await fetchUserData(result.user.uid, result.user.email || undefined);
              
              if (userData) {
                setUser(userData);
                toast({
                  title: "Signed in successfully",
                  description: `Welcome ${userData.name || userData.email}!`,
                });
              }
              
              setIsLoading(false);
              return;
            }
          } catch (error) {
            console.error("❌ Redirect result error:", error);
            localStorage.removeItem('google_auth_redirect_attempt');
            localStorage.removeItem('google_auth_redirect_time');
          }
        }

        // Set up auth state listener
        console.log("👂 Setting up auth state listener...");
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          console.log("🔄 Auth state changed:", firebaseUser ? `User: ${firebaseUser.email}` : "User signed out");
          
          if (firebaseUser) {
            // User is signed in
            if (!user || user.uid !== firebaseUser.uid) {
              console.log("👤 Processing new user sign-in...");
              
              await createOrUpdateUserInBackend(firebaseUser);
              const userData = await fetchUserData(firebaseUser.uid, firebaseUser.email || undefined);
              
              if (userData) {
                setUser(userData);
                if (!user) {
                  toast({
                    title: "Signed in successfully",
                    description: `Welcome ${userData.name || userData.email}!`,
                  });
                }
              } else {
                // Fallback user
                const fallbackUser = {
                  uid: firebaseUser.uid,
                  id: parseInt(firebaseUser.uid.substring(0, 8), 36) || 999,
                  username: firebaseUser.email?.split('@')[0] || firebaseUser.uid,
                  email: firebaseUser.email,
                  name: firebaseUser.displayName || firebaseUser.email,
                  photoURL: firebaseUser.photoURL
                };
                setUser(fallbackUser);
              }
            }
          } else {
            // User is signed out
            if (user) {
              setUser(null);
              toast({
                title: "Signed out",
                description: "You have been signed out successfully.",
              });
            }
          }
          
          setIsLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error("❌ Auth initialization error:", error);
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Sign in with Google
  const signInWithGoogle = async () => {
    console.log("🚀 signInWithGoogle called!");
    try {
      setIsLoading(true);
      console.log("🔐 Starting Google sign-in...");
      
      const firebaseModule = await import('@/lib/firebase');
      const auth = firebaseModule.auth as Auth;
      const googleProvider = firebaseModule.googleProvider as GoogleAuthProvider;
      console.log("Firebase objects loaded:", { auth: !!auth, googleProvider: !!googleProvider });
      
      const isReplitDomain = window.location.hostname.includes('replit');
      console.log("Domain check:", { hostname: window.location.hostname, isReplitDomain });
      
      if (isReplitDomain) {
        console.log("🔄 Using redirect method for Replit domain");
        localStorage.setItem('google_auth_redirect_attempt', 'true');
        localStorage.setItem('google_auth_redirect_time', Date.now().toString());
        
        await signInWithRedirect(auth, googleProvider);
        return;
      } else {
        console.log("🪟 Using popup method");
        const result = await signInWithPopup(auth, googleProvider);
        
        if (result?.user) {
          await createOrUpdateUserInBackend(result.user);
          const userData = await fetchUserData(result.user.uid, result.user.email || undefined);
          
          if (userData) {
            setUser(userData);
            toast({
              title: "Signed in successfully",
              description: `Welcome ${userData.name || userData.email}!`,
            });
          }
        }
      }
    } catch (error: any) {
      console.error("❌ Google sign-in error:", error);
      toast({
        title: "Authentication error",
        description: "There was a problem with Google sign-in. Please try again.",
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
      title: "Signed in successfully",
      description: `Welcome ${userData.name || userData.email}!`,
    });
  };

  // Sign out
  const signOut = async () => {
    try {
      setIsLoading(true);
      const firebaseModule = await import('@/lib/firebase');
      const auth = firebaseModule.auth as Auth;
      await firebaseSignOut(auth);
      setUser(null);
      setIsDemoMode(false);
      localStorage.removeItem('demoMode');
      queryClient.clear();
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh user data
  const refreshUserData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const refreshedData = await fetchUserData(user.uid, user.email || undefined);
      
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