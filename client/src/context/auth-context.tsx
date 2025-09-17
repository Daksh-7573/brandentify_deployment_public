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

  // Initialize authentication system with server-side session check only
  useEffect(() => {
    console.log('[Auth Context] Initializing authentication system');
    const startTime = performance.now();
    
    console.log('[Auth Context] Using server-side JWT session for all domains');
    
    // Check server-side session for all domains
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
    
  }, []);

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

  // Sign in with Google - simplified custom OAuth only
  const signInWithGoogle = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      console.log("Starting Google sign-in with custom OAuth");
      
      // Use server-side OAuth flow for all domains
      console.log("🚀 Using server-side OAuth flow for all domains");
      
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
      
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      
      let errorMessage = "There was a problem with Google sign-in. Please try again.";
      
      if (error.message && error.message.includes('OAuth URL')) {
        errorMessage = "Unable to start authentication. Please try again.";
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

  // Sign out function - simplified for all domains
  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Clear server-side session for all domains
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
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