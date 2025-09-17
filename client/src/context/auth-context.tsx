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

  // Initialize authentication system with JWT session validation and force cleanup
  useEffect(() => {
    console.log('[Auth Context] 🔐 Initializing JWT authentication system');
    
    // AGGRESSIVE CLEANUP: Always clear old Firebase UID authentication data first
    const storedUser = sessionStorage.getItem('brandentifier_user');
    let shouldForceReauth = false;
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        console.log('[Auth Context] 🔍 Analyzing stored auth data:', {
          hasId: !!userData.id,
          idType: typeof userData.id,
          idLength: userData.id ? userData.id.toString().length : 0,
          isFirebaseUID: userData.id && typeof userData.id === 'string' && userData.id.length > 20
        });
        
        // Check if stored user has Firebase UID format (long string) instead of numeric ID
        if (userData.id && typeof userData.id === 'string' && userData.id.length > 20) {
          console.log('[Auth Context] 🧹 DETECTED OLD FIREBASE UID AUTH DATA - forcing complete re-authentication');
          sessionStorage.removeItem('brandentifier_user');
          shouldForceReauth = true;
        }
      } catch (e) {
        console.warn('[Auth Context] ⚠️ Error parsing stored user data, clearing:', e);
        sessionStorage.removeItem('brandentifier_user');
        shouldForceReauth = true;
      }
    }
    
    if (shouldForceReauth) {
      console.log('[Auth Context] 🚨 FORCING AUTHENTICATION RESET - clearing all auth state');
      setUser(null);
      setIsLoading(false);
      return; // Skip JWT validation, user needs to authenticate fresh
    }
    
    console.log('[Auth Context] 🍪 Validating JWT session with server');
    
    // Always check server-side JWT session first - this is the authoritative source
    fetch('/api/auth/session', {
      method: 'GET',
      credentials: 'include', // CRITICAL: Include JWT cookies
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    .then(response => {
      console.log('[Auth Context] 📊 JWT session validation response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        ok: response.ok
      });
      
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`JWT session validation failed: ${response.status}`);
      }
    })
    .then(sessionData => {
      if (sessionData.success && sessionData.user) {
        console.log('[Auth Context] ✅ VALID JWT SESSION - user authenticated successfully');
        console.log('[Auth Context] 📊 JWT Session user data:', {
          id: sessionData.user.id,
          email: sessionData.user.email,
          name: sessionData.user.name,
          idType: typeof sessionData.user.id
        });
        
        // Ensure user ID is numeric (proper format for JWT system)
        if (typeof sessionData.user.id !== 'number') {
          console.error('[Auth Context] ⚠️ Invalid user ID format in JWT response, forcing re-auth');
          throw new Error('Invalid user ID format in JWT session');
        }
        
        const authenticatedUser = {
          uid: sessionData.user.id.toString(),
          id: sessionData.user.id,
          username: sessionData.user.username,
          email: sessionData.user.email,
          name: sessionData.user.name,
          photoURL: sessionData.user.photoURL,
          title: sessionData.user.title,
          location: sessionData.user.location
        };
        
        setUser(authenticatedUser);
        setIsLoading(false);
        
        // Store in session storage for consistency (with proper numeric ID)
        sessionStorage.setItem('brandentifier_user', JSON.stringify(sessionData.user));
        
        console.log('[Auth Context] 🎉 JWT authentication complete - ready for authenticated requests');
      } else {
        throw new Error('Invalid JWT session data structure');
      }
    })
    .catch(error => {
      console.log('[Auth Context] ❌ JWT session validation failed:', error.message);
      console.log('[Auth Context] 🔄 User must authenticate via OAuth to obtain JWT tokens');
      
      // Clear any stale data completely
      sessionStorage.removeItem('brandentifier_user');
      localStorage.removeItem('brandentifier_user'); // Clear both storage types
      
      // Set unauthenticated state
      setUser(null);
      setIsLoading(false);
      
      console.log('[Auth Context] 📤 Ready for fresh OAuth authentication flow');
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

  // Sign out function - enhanced with proper error handling
  const signOut = async () => {
    try {
      setIsLoading(true);
      console.log('[Auth Context] Starting logout process');
      
      // Clear server-side session for all domains
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Include JWT cookies
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('[Auth Context] Logout response:', {
        status: response.status,
        ok: response.ok
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('[Auth Context] ✅ Logout successful:', data.message);
        
        toast({
          title: "Signed out",
          description: "You have been signed out successfully.",
        });
      } else {
        console.warn('[Auth Context] ⚠️ Logout response not OK, but proceeding with cleanup');
      }
      
    } catch (error: any) {
      console.error("[Auth Context] ❌ Sign out error:", error);
      
      // Show toast for network errors only - still proceed with cleanup
      if (error.message?.includes('fetch')) {
        toast({
          title: "Network Error",
          description: "Couldn't reach server, but you've been signed out locally.",
          variant: "destructive",
        });
      }
    } finally {
      // Always clear local state and redirect, regardless of server response
      console.log('[Auth Context] Clearing local authentication state');
      
      // Clear local state
      setUser(null);
      sessionStorage.removeItem('brandentifier_user');
      
      // Clear any cached queries that might contain user data
      queryClient.clear();
      
      // Stop loading before redirect
      setIsLoading(false);
      
      console.log('[Auth Context] ✅ Logout cleanup completed, redirecting to /auth');
      
      // Redirect to auth page
      window.location.href = '/auth';
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