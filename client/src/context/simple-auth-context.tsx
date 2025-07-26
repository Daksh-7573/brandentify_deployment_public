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
        try {
          const result = await getRedirectResult(auth);
          if (result?.user) {
            console.log("✅ Google redirect authentication successful");
            const userData = createUserFromFirebase(result.user);
            setUser(userData);
            
            toast({
              title: "Signed in successfully",
              description: `Welcome ${userData.name}!`,
            });
            
            // Direct redirect without timeout
            window.location.href = '/industry-pulse';
            return;
          }
        } catch (error) {
          console.log("No redirect result or error:", error);
        }

        // Set up auth state listener
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          console.log("🔄 Auth state changed:", firebaseUser ? `User: ${firebaseUser.email}` : "User signed out");
          
          if (firebaseUser) {
            console.log("👤 Firebase user detected, processing...");
            const userData = createUserFromFirebase(firebaseUser);
            console.log("📊 Created user data:", userData);
            
            // Always set user data and redirect for authenticated users
            setUser(userData);
            
            // Set user but don't force redirect here - let AuthRedirectGuard handle it
            console.log("✅ User data set, AuthRedirectGuard will handle redirect");
          } else {
            console.log("👋 User signed out");
            setUser(null);
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
  }, [user, toast]);

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      console.log("🚀 Starting Google sign-in...");
      
      const firebaseModule = await import('@/lib/firebase');
      const auth = firebaseModule.auth as Auth;
      const googleProvider = firebaseModule.googleProvider as GoogleAuthProvider;

      console.log("🔥 Firebase modules loaded:", { 
        hasAuth: !!auth, 
        hasProvider: !!googleProvider,
        hostname: window.location.hostname 
      });

      // Determine if we should use popup or redirect
      const isReplit = window.location.hostname.includes('replit.dev') || 
                       window.location.hostname.includes('replit.app') ||
                       window.location.hostname.includes('replit.co');

      if (isReplit) {
        console.log("🔄 Using redirect method for Replit domain");
        await signInWithRedirect(auth, googleProvider);
      } else {
        console.log("🪟 Using popup method for non-Replit domain");
        const result = await signInWithPopup(auth, googleProvider);
        
        if (result?.user) {
          console.log("✅ Google popup authentication successful:", result.user.email);
          const userData = createUserFromFirebase(result.user);
          console.log("👤 Created user data:", userData);
          setUser(userData);
          
          toast({
            title: "Signed in successfully",
            description: `Welcome ${userData.name}!`,
          });
          
          // Force redirect using replace to prevent back button issues
          console.log("🚀 Force redirecting to Industry Pulse...");
          window.location.replace('/industry-pulse');
        } else {
          console.log("⚠️ No user returned from popup result");
        }
      }
    } catch (error) {
      console.error("❌ Google sign-in error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Please try again.';
      toast({
        title: "Sign-in failed",  
        description: `Failed to sign in with Google: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
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