import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut, User as FirebaseUser, Auth, GoogleAuthProvider } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from '@/lib/queryClient';
import { clearCSRFTokenCache } from '@/hooks/use-csrf-token';

interface User {
  uid?: string; // Make uid optional for JWT users
  id: number;
  username: string;
  email: string | null;
  name: string | null;
  photoURL?: string | null;
  title?: string | null;
  location?: string | null;
  profileCompleted?: number;
  authProvider?: string;
  emailVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithPhone: (phoneNumber: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  signInWithGoogle: async () => {},
  signInWithPhone: async () => {},
  logout: async () => {},
  refreshSession: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [googleProvider, setGoogleProvider] = useState<GoogleAuthProvider | null>(null);
  const { toast } = useToast();

  // JWT Session Management Functions

  // Check if JWT session exists and is valid
  const checkJWTSession = async (): Promise<User | null> => {
    try {
      console.log('🔍 [AUTH CONTEXT] Checking JWT session...');
      
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include', // Include cookies
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          console.log('✅ [AUTH CONTEXT] Valid JWT session found:', data.user.email);
          return data.user;
        }
      } else if (response.status === 401) {
        console.log('❌ [AUTH CONTEXT] No valid JWT session found');
      } else {
        console.warn('⚠️ [AUTH CONTEXT] Session check failed:', response.status);
      }
      
      return null;
    } catch (error) {
      console.error('❌ [AUTH CONTEXT] Error checking JWT session:', error);
      return null;
    }
  };

  // SECURITY: Firebase migration disabled to prevent account spoofing
  // This function is kept for backwards compatibility but should never be called
  const migrateFirebaseToJWT = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    console.log('🚨 [SECURITY] Firebase migration is disabled for security - use Google OAuth instead');
    return null;
  };

  // Refresh session - check current JWT status
  const refreshSession = async (): Promise<void> => {
    console.log('🔄 [AUTH CONTEXT] Refreshing session...');
    const jwtUser = await checkJWTSession();
    if (jwtUser) {
      setUser(jwtUser);
    } else {
      setUser(null);
    }
  };

  // Legacy Firebase functions - kept for migration compatibility but not actively used

  // OAuth completion detection - check for JWT session after OAuth redirect
  useEffect(() => {
    const handleOAuthCompletion = async () => {
      // Check if we're returning from an OAuth flow (URL contains success indicators)
      const urlParams = new URLSearchParams(window.location.search);
      const currentPath = window.location.pathname;
      
      // Check for OAuth completion indicators
      const isOAuthReturn = (
        currentPath === '/dashboard' ||
        currentPath === '/industry-pulse' ||
        urlParams.has('auth_success') ||
        localStorage.getItem('oauth_in_progress')
      );
      
      if (isOAuthReturn) {
        console.log('🔍 [AUTH CONTEXT] Detected potential OAuth return, checking JWT session...');
        localStorage.removeItem('oauth_in_progress'); // Clean up
        
        // Give the backend a moment to set cookies
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const jwtUser = await checkJWTSession();
        if (jwtUser) {
          console.log('✅ [AUTH CONTEXT] OAuth success - JWT session found');
          setUser(jwtUser);
          setIsLoading(false);
          
          toast({
            title: "Signed in successfully",
            description: `Welcome ${jwtUser.name || jwtUser.email}!`,
          });
          return true; // OAuth completed successfully
        }
      }
      return false; // No OAuth completion detected
    };
    
    // Run OAuth completion check on component mount
    handleOAuthCompletion();
    
    // Also listen for page focus events (user returning from OAuth redirect)
    const handleFocus = () => {
      handleOAuthCompletion();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [toast]);

  // Setup authentication state management - JWT first, Firebase fallback
  useEffect(() => {
    console.log("🚀 [AUTH CONTEXT] Setting up JWT-first authentication");
    
    const initializeAuth = async () => {
      try {
        // STEP 1: Check for existing JWT session
        console.log("🔍 [AUTH CONTEXT] Checking for existing JWT session...");
        const jwtUser = await checkJWTSession();
        
        if (jwtUser) {
          console.log("✅ [AUTH CONTEXT] JWT session found, user authenticated");
          setUser(jwtUser);
          setIsLoading(false);
          return; // Don't set up Firebase listener if JWT session exists
        }
        
        console.log("❌ [AUTH CONTEXT] No JWT session found, setting up Firebase fallback...");
        
        // STEP 2: Set up Firebase authentication as fallback/migration path
        const { auth: firebaseAuth, googleProvider: firebaseGoogleProvider } = await import('@/lib/firebase');
        
        if (!firebaseAuth) {
          console.error('Firebase auth failed to initialize');
          setIsLoading(false);
          return;
        }
        
        setAuth(firebaseAuth);
        setGoogleProvider(firebaseGoogleProvider);
        
        // Firebase state listener for migration
        const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser: FirebaseUser | null) => {
          console.log("🔄 [FIREBASE] Auth state changed:", firebaseUser ? "User signed in" : "User signed out");
          
          if (firebaseUser) {
            try {
              // Check if we already have a JWT session first
              const existingJWTUser = await checkJWTSession();
              if (existingJWTUser) {
                console.log("✅ [AUTH CONTEXT] JWT session already exists, skipping Firebase migration");
                setUser(existingJWTUser);
                setIsLoading(false);
                return;
              }
              
              // Migrate Firebase user to JWT session
              console.log("🔄 [AUTH CONTEXT] Migrating Firebase user to JWT session...");
              const migratedUser = await migrateFirebaseToJWT(firebaseUser);
              
              if (migratedUser) {
                console.log("✅ [AUTH CONTEXT] Firebase to JWT migration successful");
                setUser(migratedUser);
                
                toast({
                  title: "Signed in successfully",
                  description: `Welcome ${migratedUser.name || migratedUser.email}!`,
                });
              } else {
                console.error("❌ [AUTH CONTEXT] Firebase to JWT migration failed");
                // Keep Firebase user as fallback (this should not happen in production)
                const fallbackUser = {
                  uid: firebaseUser.uid,
                  id: parseInt(firebaseUser.uid.substring(0, 5), 36) || 999,
                  username: firebaseUser.email?.split('@')[0] || firebaseUser.uid.substring(0, 8),
                  email: firebaseUser.email,
                  name: firebaseUser.displayName,
                  photoURL: firebaseUser.photoURL
                };
                
                setUser(fallbackUser);
                
                toast({
                  title: "Signed in (fallback mode)",
                  description: `Welcome ${fallbackUser.name || fallbackUser.email}!`,
                  variant: "default"
                });
              }
            } catch (error) {
              console.error("❌ [AUTH CONTEXT] Error processing Firebase user:", error);
            }
          } else {
            // Firebase user signed out - check if JWT session still exists
            const jwtUser = await checkJWTSession();
            if (!jwtUser && user) {
              console.log("🔄 [AUTH CONTEXT] User signed out from both Firebase and JWT");
              setUser(null);
              toast({
                title: "Signed out",
                description: "You have been signed out successfully.",
              });
            }
          }
          
          setIsLoading(false);
        });

        return () => unsubscribe();
        
      } catch (error) {
        console.error("❌ [AUTH CONTEXT] Error initializing authentication:", error);
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, [toast]); // Removed 'user' dependency to prevent loops

  // Updated Google sign-in with JWT session creation
  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      console.log("🚀 [AUTH CONTEXT] Starting Google OAuth sign-in...");
      
      // Mark OAuth as in progress for completion detection
      localStorage.setItem('oauth_in_progress', 'true');
      
      // Get OAuth URL from backend
      const oauthResponse = await fetch('/api/auth/google', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!oauthResponse.ok) {
        throw new Error('Failed to get OAuth URL');
      }
      
      const oauthData = await oauthResponse.json();
      if (!oauthData.success || !oauthData.oauthUrl) {
        throw new Error('Invalid OAuth response');
      }
      
      console.log("🔗 [AUTH CONTEXT] Redirecting to Google OAuth...");
      console.log("🔗 [AUTH CONTEXT] OAuth completion will be detected on return");
      
      // Redirect to Google OAuth (backend handles JWT session creation)
      window.location.href = oauthData.oauthUrl;
      
    } catch (error: any) {
      console.error("❌ [AUTH CONTEXT] Google sign-in error:", error);
      
      // Clean up OAuth progress flag on error
      localStorage.removeItem('oauth_in_progress');
      
      toast({
        title: "Authentication error",
        description: error.message || "There was a problem with Google sign-in. Please try again.",
        variant: "destructive",
      });
      
      setIsLoading(false);
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

  // Updated logout with JWT session clearing
  const logout = async () => {
    try {
      console.log("🔄 [AUTH CONTEXT] Starting logout process...");
      setIsLoading(true);
      
      // Call backend logout endpoint to clear JWT session
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        console.log("✅ [AUTH CONTEXT] JWT session cleared successfully");
      } else {
        console.warn("⚠️ [AUTH CONTEXT] Backend logout returned:", response.status);
      }
      
      // Sign out from Firebase if auth exists (for migration cases)
      if (auth) {
        try {
          await signOut(auth);
          console.log("✅ [AUTH CONTEXT] Firebase sign-out successful");
        } catch (firebaseError) {
          console.warn("⚠️ [AUTH CONTEXT] Firebase sign-out error:", firebaseError);
          // Don't block logout if Firebase fails
        }
      }
      
      // Clear user state and CSRF token cache
      setUser(null);
      clearCSRFTokenCache();
      console.log("✅ [AUTH CONTEXT] User state cleared");
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
      
    } catch (error) {
      console.error("❌ [AUTH CONTEXT] Error during logout:", error);
      
      // Still clear user state and CSRF token cache even if logout fails
      setUser(null);
      clearCSRFTokenCache();
      
      toast({
        title: "Signed out",
        description: "You have been signed out (with errors).",
        variant: "destructive",
      });
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
        logout,
        refreshSession,
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