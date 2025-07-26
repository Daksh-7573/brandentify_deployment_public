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
      console.log("🔧 Creating/updating user in backend:", firebaseUser.email);
      
      const userData = {
        username: firebaseUser.email?.split('@')[0] || firebaseUser.uid.substring(0, 20),
        email: firebaseUser.email || `firebase_${firebaseUser.uid.substring(0, 8)}@example.com`,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "Google User",
        photoURL: firebaseUser.photoURL,
        title: "",
        location: "",
        uid: firebaseUser.uid
      };
      
      console.log("📤 Sending user data to backend:", userData);
      
      const response = await apiRequest('POST', '/api/users', userData);
      
      if (response.ok) {
        const result = await response.json();
        console.log("✅ User created successfully:", result);
        return result;
      }
      
      console.log("⚠️ POST failed, trying PUT method");
      // If post fails, try to get the user first, then create with proper ID
      console.log("⚠️ POST failed, trying to get existing user by email");
      try {
        const existingUserResponse = await apiRequest('GET', `/api/users/email/${encodeURIComponent(firebaseUser.email || '')}`);
        if (existingUserResponse.ok) {
          const existingUser = await existingUserResponse.json();
          console.log("✅ Found existing user:", existingUser);
          return existingUser;
        }
      } catch (e) {
        console.log("User lookup failed, creating new user");
      }
      
      // Try with a simplified user creation approach
      const simpleUserData = {
        username: firebaseUser.email?.split('@')[0] || firebaseUser.uid.substring(0, 15),
        email: firebaseUser.email || `firebase_${firebaseUser.uid.substring(0, 8)}@example.com`,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "Google User"
      };
      
      const simpleResponse = await apiRequest('POST', '/api/users', simpleUserData);
      if (simpleResponse.ok) {
        const result = await simpleResponse.json();
        console.log("✅ User created with simple approach:", result);
        return result;
      }
      
      console.error("❌ All user creation attempts failed");
      return null;
    } catch (error) {
      console.error("❌ Error in createOrUpdateUserInBackend:", error);
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
      
      console.log("🔍 Fetching user data from:", url);
      const response = await apiRequest('GET', url);
      console.log("📡 User fetch response status:", response.status);
      
      if (response.status === 404) {
        console.log("❌ User not found (404)");
        return null;
      }
      
      if (!response.ok) {
        console.error("❌ User fetch failed with status:", response.status);
        return null;
      }
      
      const userData = await response.json();
      console.log("✅ User data fetched:", userData);
      
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
      console.error('❌ Error fetching user data:', error);
      return null;
    }
  };

  // Initialize authentication on mount
  useEffect(() => {
    console.log("🔥 AuthProvider initializing...");
    console.log("Environment check:", {
      firebaseApiKey: import.meta.env.VITE_FIREBASE_API_KEY ? "Present" : "Missing",
      firebaseProjectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? "Present" : "Missing",
      hostname: window.location.hostname
    });
    
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
              console.log("🔄 Processing redirect authentication result...");
              await createOrUpdateUserInBackend(result.user);
              const userData = await fetchUserData(result.user.uid, result.user.email || undefined);
              console.log("📊 User data retrieved:", userData ? "Success" : "Failed");
              
              if (userData) {
                setUser(userData);
                toast({
                  title: "Signed in successfully",
                  description: `Welcome ${userData.name || userData.email}!`,
                });
                
                // Redirect to Industry Pulse after successful authentication
                console.log("🚀 Redirecting to Industry Pulse after successful auth");
                setTimeout(() => {
                  window.location.href = '/industry-pulse';
                }, 1000);
              } else {
                // Fallback: create a basic user if backend fails
                console.log("⚠️ Using fallback user creation");
                const fallbackUser = {
                  uid: result.user.uid,
                  id: parseInt(result.user.uid.substring(0, 8), 36) || Math.floor(Math.random() * 10000),
                  username: result.user.email?.split('@')[0] || result.user.uid.substring(0, 15),
                  email: result.user.email,
                  name: result.user.displayName || result.user.email?.split('@')[0] || "Google User",
                  photoURL: result.user.photoURL
                };
                setUser(fallbackUser);
                toast({
                  title: "Signed in successfully",
                  description: `Welcome ${fallbackUser.name}!`,
                });
                
                console.log("🚀 Redirecting to Industry Pulse with fallback user");
                setTimeout(() => {
                  window.location.href = '/industry-pulse';
                }, 1000);
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
              console.log("📊 Auth state change - User data:", userData ? "Retrieved" : "Failed");
              
              if (userData) {
                setUser(userData);
                if (!user) {
                  toast({
                    title: "Signed in successfully",
                    description: `Welcome ${userData.name || userData.email}!`,
                  });
                  
                  // Redirect to Industry Pulse after successful authentication
                  console.log("🚀 Redirecting to Industry Pulse after auth state change");
                  setTimeout(() => {
                    window.location.href = '/industry-pulse';
                  }, 1000);
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
            
            // Redirect to Industry Pulse after successful authentication  
            console.log("🚀 Redirecting to Industry Pulse after popup auth");
            setTimeout(() => {
              window.location.href = '/industry-pulse';
            }, 1000);
          } else {
            // Fallback: create a basic user if backend fails
            console.log("⚠️ Using fallback user creation for popup");
            const fallbackUser = {
              uid: result.user.uid,
              id: parseInt(result.user.uid.substring(0, 8), 36) || Math.floor(Math.random() * 10000),
              username: result.user.email?.split('@')[0] || result.user.uid.substring(0, 15),
              email: result.user.email,
              name: result.user.displayName || result.user.email?.split('@')[0] || "Google User",
              photoURL: result.user.photoURL
            };
            setUser(fallbackUser);
            toast({
              title: "Signed in successfully",
              description: `Welcome ${fallbackUser.name}!`,
            });
            
            console.log("🚀 Redirecting to Industry Pulse with fallback user");
            setTimeout(() => {
              window.location.href = '/industry-pulse';
            }, 1000);
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