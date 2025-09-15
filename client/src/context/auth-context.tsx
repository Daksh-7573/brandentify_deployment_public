import { createContext, useState, useEffect, ReactNode, useContext } from "react";
// CRITICAL: NO static Firebase imports in production - all dynamic imports only
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

  // Check domain to determine auth method
  const hostname = window.location.hostname;
  const isDevelopment = (hostname.includes('localhost') || hostname.includes('127.0.0.1')) && !hostname.includes('replit.dev');
  const isPublishedDomain = hostname.includes('replit.app') || hostname.includes('replit.dev');
  
  // EXPLICIT DEBUG LOGGING
  console.log('🔧 [AUTH CONTEXT] Domain Detection Debug:', {
    hostname,
    isDevelopment,
    isPublishedDomain,
    includesReplitApp: hostname.includes('replit.app'),
    includesReplitDev: hostname.includes('replit.dev'),
    includesLocalhost: hostname.includes('localhost'),
    authMethod: isPublishedDomain ? 'server-oauth-only' : (isDevelopment ? 'firebase' : 'jwt-session-first')
  });

  // Initialize authentication system based on domain
  useEffect(() => {
    console.log('[Auth Context] Initializing authentication system');
    const startTime = performance.now();
    
    console.log('[Auth Context] Domain check:', { 
      hostname: window.location.hostname, 
      isDevelopment,
      isPublishedDomain,
      authMethod: isPublishedDomain ? 'server-oauth-only' : (isDevelopment ? 'firebase' : 'jwt-session-first')
    });
    
    if (isPublishedDomain) {
      // PRODUCTION: Use server-side session only, NO Firebase
      console.log('[Auth Context] 🚀 Published domain - using server-side JWT session only');
      
      fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include' // Include cookies
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('No valid session');
        }
      })
      .then(sessionData => {
        if (sessionData.success && sessionData.user) {
          console.log('[Auth Context] ✅ Found valid JWT session:', sessionData.user.email);
          setUser({
            uid: sessionData.user.id.toString(),
            ...sessionData.user
          });
          setIsLoading(false);
          
          // Store in session storage for consistency
          sessionStorage.setItem('brandentifier_user', JSON.stringify(sessionData.user));
        } else {
          throw new Error('Invalid session data');
        }
      })
      .catch(error => {
        console.log('[Auth Context] ❌ No valid JWT session found:', error.message);
        console.log('[Auth Context] User needs to authenticate via server OAuth');
        setIsLoading(false);
      });
      
      console.log(`[Auth Context] Published domain initialization: ${(performance.now() - startTime).toFixed(2)}ms`);
      return; // Skip Firebase completely for published domains
    }
    
    if (!isDevelopment) {
      // Non-replit production domain - check server-side session first
      console.log('[Auth Context] Checking server-side JWT session...');
      
      fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include' 
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('No valid session');
        }
      })
      .then(sessionData => {
        if (sessionData.success && sessionData.user) {
          console.log('[Auth Context] ✅ Found valid JWT session:', sessionData.user.email);
          setUser({
            uid: sessionData.user.id.toString(),
            ...sessionData.user
          });
          setIsLoading(false);
          
          sessionStorage.setItem('brandentifier_user', JSON.stringify(sessionData.user));
          return;
        }
        throw new Error('Invalid session data');
      })
      .catch(error => {
        console.log('[Auth Context] ❌ No valid JWT session found:', error.message);
        setIsLoading(false);
      });
      
      console.log(`[Auth Context] Production domain initialization: ${(performance.now() - startTime).toFixed(2)}ms`);
      return;
    }
    
    // Development domain - use Firebase with caching
    console.log('[Auth Context] 🔧 Development domain - initializing Firebase');
    
    // Set up Firebase auth listener for development only
    const setupFirebaseAuth = async () => {
      try {
        console.log("Setting up Firebase auth state listener...");
        const { auth } = await import('@/lib/firebase');
        
        if (!auth) {
          console.error("Auth object is null - Firebase initialization failed");
          setIsLoading(false);
          return () => {};
        }
        
        const { onAuthStateChanged } = await import('firebase/auth');
        const unsubscribe = onAuthStateChanged(auth as any, async (firebaseUser) => {
          console.log("Auth state changed:", firebaseUser ? "User signed in" : "User signed out");
          
          if (firebaseUser) {
            // Process Firebase user for development
            const userData = await processFirebaseUser(firebaseUser);
            if (userData) {
              setUser(userData);
              
              const isNewLogin = !user || user.uid !== userData.uid;
              if (isNewLogin) {
                toast({
                  title: "Signed in successfully",
                  description: `Welcome ${userData.name || userData.email}!`,
                });
                
                const currentPath = window.location.pathname;
                if (currentPath === '/auth' || currentPath === '/') {
                  setTimeout(() => {
                    window.location.href = '/dashboard';
                  }, 200);
                }
              }
            }
          } else {
            setUser(null);
          }
          
          setIsLoading(false);
        });
        
        return unsubscribe;
      } catch (error) {
        console.error("Failed to setup Firebase auth listener:", error);
        setIsLoading(false);
        return () => {};
      }
    };
    
    // Setup Firebase and cleanup for development
    let unsubscribe: (() => void) | null = null;
    
    setupFirebaseAuth().then((unsub) => {
      unsubscribe = unsub;
    }).catch((error) => {
      console.error("Failed to setup Firebase auth:", error);
      setIsLoading(false);
    });
    
    return () => {
      if (unsubscribe) {
        console.log("Cleaning up Firebase auth state listener");
        unsubscribe();
      }
    };
    
    console.log(`[Auth Context] Development initialization: ${(performance.now() - startTime).toFixed(2)}ms`);
  }, []);

  // Process Firebase user (development only)
  const processFirebaseUser = async (firebaseUser: any): Promise<AuthUser | null> => {
    try {
      // Create user data from Firebase user
      const userData = {
        uid: firebaseUser.uid,
        id: parseInt(firebaseUser.uid.substring(0, 5), 36) || 999,
        username: firebaseUser.email?.split('@')[0] || firebaseUser.uid.substring(0, 8),
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL
      };
      
      // Try to create/update user in backend
      await apiRequest('POST', '/api/users', userData);
      
      return userData;
    } catch (error) {
      console.error("Error processing Firebase user:", error);
      return null;
    }
  };

  // Fetch user data from our backend
  const fetchUserData = async (userId: string | number, userEmail?: string): Promise<AuthUser | null> => {
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

  // Sign in with Google - domain-aware implementation
  const signInWithGoogle = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      console.log("Starting Google sign-in");
      
      if (isPublishedDomain) {
        // PRODUCTION: Use server-side OAuth flow only
        console.log("🚀 Published domain - using server-side OAuth flow");
        
        // Get OAuth URL from our server
        const response = await fetch('/api/auth/google/url', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
          throw new Error('Failed to get OAuth URL');
        }
        
        const data = await response.json();
        console.log('✅ Got OAuth URL, redirecting to Google...');
        
        // Redirect to Google OAuth (will come back to our callback)
        window.location.href = data.oauthUrl;
        return; // Will redirect
        
      } else if (isDevelopment) {
        // DEVELOPMENT: Use Firebase popup for development
        console.log("🔧 Development domain - using Firebase popup");
        
        const { auth } = await import('@/lib/firebase');
        const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
        
        if (!auth) {
          throw new Error('Firebase auth not initialized');
        }

        const provider = new GoogleAuthProvider();
        provider.addScope('email');
        provider.addScope('profile');
        provider.setCustomParameters({
          prompt: 'select_account',
          access_type: 'online'
        });
        
        const result = await signInWithPopup(auth as any, provider);
        
        if (result && result.user) {
          console.log("🎉 Firebase authentication successful:", result.user.email);
        }
      } else {
        // OTHER PRODUCTION: Use server-side OAuth
        console.log("🚀 Production domain - using server-side OAuth flow");
        
        const response = await fetch('/api/auth/google/url', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
          throw new Error('Failed to get OAuth URL');
        }
        
        const data = await response.json();
        window.location.href = data.oauthUrl;
        return;
      }
      
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      
      let errorMessage = "There was a problem with Google sign-in. Please try again.";
      
      if (error.code === 'auth/popup-blocked') {
        errorMessage = "The login popup was blocked by your browser. Please allow popups and try again.";
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "The login popup was closed. Please try again.";
      }
      
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });
      
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setIsLoading(true);
      
      if (isPublishedDomain || !isDevelopment) {
        // Clear server-side session
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include'
        });
      } else {
        // Development: sign out from Firebase
        const { auth } = await import('@/lib/firebase');
        if (auth) {
          const { signOut: firebaseSignOut } = await import('firebase/auth');
          await firebaseSignOut(auth as any);
        }
      }
      
      // Clear local state
      setUser(null);
      sessionStorage.removeItem('brandentifier_user');
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
      
      // Redirect to auth page
      window.location.href = '/auth';
      
    } catch (error) {
      console.error("Sign out error:", error);
      
      // Clear local state anyway
      setUser(null);
      sessionStorage.removeItem('brandentifier_user');
      window.location.href = '/auth';
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh user data
  const refreshUserData = async () => {
    if (!user) return;
    
    try {
      const userData = await fetchUserData(user.uid, user.email || undefined);
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  // Placeholder functions for compatibility
  const signInWithPhone = (user: User) => {
    console.log("Phone sign-in not implemented");
  };

  const signInWithEmail = (user: User) => {
    console.log("Email sign-in not implemented");
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

// Export hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}