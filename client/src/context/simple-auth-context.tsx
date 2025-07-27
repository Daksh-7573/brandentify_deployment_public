import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  onAuthStateChanged,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
  type Auth,
  type GoogleAuthProvider
} from 'firebase/auth';
import { useToast } from "@/hooks/use-toast";

interface AuthUser {
  uid: string;
  id: number;
  username: string;
  email: string | null;
  name: string | null;
  photoURL: string | null;
  title?: string | null;
  location?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const SimpleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const isAuthenticated = !!user;

  const createUserFromFirebase = (firebaseUser: FirebaseUser): AuthUser => {
    return {
      uid: firebaseUser.uid,
      id: parseInt(firebaseUser.uid.substring(0, 8), 36) || Math.floor(Math.random() * 10000),
      username: firebaseUser.email?.split('@')[0] || firebaseUser.uid.substring(0, 15),
      email: firebaseUser.email,
      name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "Google User",
      photoURL: firebaseUser.photoURL,
      title: null,
      location: null
    };
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log("🔥 Initializing Simple Auth...");
        
        const firebaseModule = await import('@/lib/firebase');
        const auth = firebaseModule.auth as Auth;
        const googleProvider = firebaseModule.googleProvider as GoogleAuthProvider;

        // Check for redirect result first
        console.log("🔍 Checking for redirect result...");
        try {
          const result = await getRedirectResult(auth);
          console.log("📋 Redirect result:", result ? "Found" : "None");
          
          if (result?.user) {
            console.log("✅ Google redirect authentication successful");
            console.log("👤 Firebase user details:", {
              uid: result.user.uid,
              email: result.user.email,
              displayName: result.user.displayName,
              photoURL: result.user.photoURL
            });
            
            const userData = createUserFromFirebase(result.user);
            console.log("📊 Created user data:", userData);
            
            setUser(userData);
            setIsLoading(false);
            
            toast({
              title: "Signed in successfully",
              description: `Welcome ${userData.name}!`,
            });
            
            // Force redirect for redirect result with delay to ensure state persistence
            console.log("🚀 Redirect result - scheduling navigation to Industry Pulse");
            setTimeout(() => {
              console.log("🚀 Executing redirect result navigation");
              window.location.replace('/industry-pulse');
            }, 1000);
            return;
          } else {
            console.log("🔍 No redirect result found");
          }
        } catch (error: any) {
          console.error("❌ Redirect result error:", error);
          console.error("Error details:", {
            code: error.code,
            message: error.message,
            customData: error.customData
          });
        }

        // Set up auth state listener
        console.log("👂 Setting up auth state listener...");
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          console.log("🔄 Auth state changed:", firebaseUser ? `User: ${firebaseUser.email}` : "User signed out");
          console.log("📍 Current location:", window.location.pathname);
          console.log("🔍 Auth state details:", {
            hasFirebaseUser: !!firebaseUser,
            currentPath: window.location.pathname,
            timestamp: new Date().toLocaleTimeString()
          });
          
          if (firebaseUser) {
            console.log("👤 Firebase user detected, processing...");
            console.log("👤 Firebase user full details:", {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              emailVerified: firebaseUser.emailVerified
            });
            
            const userData = createUserFromFirebase(firebaseUser);
            console.log("📊 Created user data:", userData);
            
            setUser(userData);
            console.log("✅ User state set successfully");
            
            // Only redirect if we're on the auth page to avoid infinite loops
            if (window.location.pathname === '/' || window.location.pathname === '/auth') {
              console.log("🚀 User authenticated on auth page, redirecting to Industry Pulse");
              setTimeout(() => {
                console.log("🚀 Executing auth page redirect");
                window.location.replace('/industry-pulse');
              }, 500);
            } else {
              console.log("✅ User authenticated, staying on current page:", window.location.pathname);
            }
          } else {
            console.log("👋 User signed out");
            setUser(null);
          }
          
          setIsLoading(false);
          console.log("⏳ Loading state set to false");
        });

        return unsubscribe;
      } catch (error) {
        console.error("❌ Auth initialization error:", error);
        setIsLoading(false);
      }
    };

    initAuth();
  }, [toast]);

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      console.log("🚀 Starting Google sign-in...");
      console.log("Current page URL:", window.location.href);
      
      const firebaseModule = await import('@/lib/firebase');
      const auth = firebaseModule.auth as Auth;
      const googleProvider = firebaseModule.googleProvider as GoogleAuthProvider;

      console.log("🔥 Firebase modules loaded:", { 
        hasAuth: !!auth, 
        hasProvider: !!googleProvider,
        hostname: window.location.hostname 
      });

      // Always use redirect method to avoid popup interference issues
      console.log("🔄 Using redirect method for clean authentication flow");
      await signInWithRedirect(auth, googleProvider);
      // Exit here - redirect will handle the authentication and onAuthStateChanged will process the result
    } catch (error) {
      console.error("❌ Google sign-in error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Please try again.';
      
      toast({
        title: "Sign-in failed",  
        description: `Failed to sign in with Google: ${errorMessage}`,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const firebaseModule = await import('@/lib/firebase');
      const auth = firebaseModule.auth as Auth;
      await firebaseSignOut(auth);
      setUser(null);
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      signInWithGoogle,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};