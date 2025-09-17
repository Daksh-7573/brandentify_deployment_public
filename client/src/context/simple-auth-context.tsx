import { createContext, useState, useEffect, ReactNode, useRef } from "react";

// Simple auth user type
type AuthUser = {
  id: number;
  username: string;
  email: string;
  name: string;
  photoURL?: string;
  uid?: string; // Add Firebase UID for profile queries
};

// Simple auth context type
type AuthContextType = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (user: AuthUser) => void;
  signOut: () => void;
};

// Create the auth context
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  signIn: () => {},
  signOut: () => {},
});

// Simple auth provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const loadingRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // JWT authentication system with aggressive Firebase UID cleanup
  useEffect(() => {
    console.log('[JWT Auth] 🔐 Initializing JWT authentication system');
    
    // Failsafe timeout to prevent infinite loading - cleared when auth check completes
    timeoutRef.current = setTimeout(() => {
      if (loadingRef.current) {
        console.warn('AuthProvider: Failsafe timeout - forcing loading to false');
        setIsLoading(false);
        loadingRef.current = false;
      }
    }, 3000); // 3 second maximum loading time
    
    const checkAuth = async () => {
      console.log('[JWT Auth] 🔍 Starting authentication check');
      
      // AGGRESSIVE CLEANUP: Always detect and clear old Firebase UID authentication data first
      const storedUser = sessionStorage.getItem('brandentifier_user');
      let shouldForceReauth = false;
      
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          console.log('[JWT Auth] 🔍 Analyzing stored auth data:', {
            hasId: !!userData.id,
            idType: typeof userData.id,
            idLength: userData.id ? userData.id.toString().length : 0,
            hasUsername: !!userData.username,
            isFirebaseUID: userData.id && typeof userData.id === 'string' && userData.id.length > 20,
            usernameFormat: userData.username ? userData.username.substring(0, 10) + '...' : null
          });
          
          // Check if stored user has Firebase UID format in either ID or username
          const hasFirebaseUID = (userData.id && typeof userData.id === 'string' && userData.id.length > 20) ||
                                (userData.username && typeof userData.username === 'string' && userData.username.length > 20);
          
          if (hasFirebaseUID) {
            console.log('[JWT Auth] 🧹 DETECTED OLD FIREBASE UID AUTH DATA - forcing complete re-authentication');
            sessionStorage.removeItem('brandentifier_user');
            localStorage.removeItem('brandentifier_user'); // Clear both storage types
            shouldForceReauth = true;
          }
        } catch (e) {
          console.warn('[JWT Auth] ⚠️ Error parsing stored user data, clearing:', e);
          sessionStorage.removeItem('brandentifier_user');
          localStorage.removeItem('brandentifier_user');
          shouldForceReauth = true;
        }
      }
      
      if (shouldForceReauth) {
        console.log('[JWT Auth] 🚨 FORCING AUTHENTICATION RESET - clearing all auth state');
        setUser(null);
        setIsLoading(false);
        loadingRef.current = false;
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        console.log('[JWT Auth] 📤 Ready for fresh OAuth authentication flow');
        return; // Skip JWT validation, user needs to authenticate fresh
      }
      
      // Always check server-side JWT session first (for all domains, not just published)
      console.log('[JWT Auth] 🍪 Validating JWT session with server for all domains');
      
      try {
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'include', // CRITICAL: Include JWT cookies
          cache: 'no-store', // Never cache auth requests
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        console.log('[JWT Auth] 📊 JWT session validation response:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          ok: response.ok
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('[JWT Auth] 📊 Raw JWT session response:', data);
          
          // Handle both direct user object and wrapped {success, user} response
          let userData;
          if (data.success !== undefined && data.user) {
            // Wrapped response format: {success: true, user: {...}}
            userData = data.user;
            console.log('[JWT Auth] ✅ Unwrapped user from JWT session response');
          } else if (data.id || data.email) {
            // Direct user object format
            userData = data;
            console.log('[JWT Auth] ✅ Direct user object from JWT session');
          } else {
            console.warn('[JWT Auth] ⚠️ Unexpected JWT session response format:', data);
            throw new Error('Invalid JWT session response format');
          }
          
          // Ensure user ID is numeric (proper format for JWT system)
          if (typeof userData.id !== 'number') {
            console.error('[JWT Auth] ⚠️ Invalid user ID format in JWT response, forcing re-auth');
            throw new Error('Invalid user ID format in JWT session');
          }
          
          console.log('[JWT Auth] ✅ VALID JWT SESSION - user authenticated successfully:', {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            idType: typeof userData.id
          });
          
          setUser(userData);
          // Store in sessionStorage for consistency (with proper numeric ID)
          sessionStorage.setItem('brandentifier_user', JSON.stringify(userData));
          
          console.log('[JWT Auth] 🎉 JWT authentication complete - ready for authenticated requests');
          return;
        } else {
          console.log('[JWT Auth] ❌ JWT session validation failed with status:', response.status);
          // Clear any stale sessionStorage
          sessionStorage.removeItem('brandentifier_user');
          localStorage.removeItem('brandentifier_user');
        }
      } catch (error) {
        console.error('[JWT Auth] ❌ JWT session validation error:', error);
        console.log('[JWT Auth] 🔄 User must authenticate via OAuth to obtain JWT tokens');
        
        // Clear any stale data completely
        sessionStorage.removeItem('brandentifier_user');
        localStorage.removeItem('brandentifier_user');
      } finally {
        console.log('[JWT Auth] 📤 Ready for fresh OAuth authentication flow');
        setIsLoading(false);
        loadingRef.current = false;
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current); // Clear the failsafe timeout since auth check completed
          timeoutRef.current = null;
        }
      }
    };

    // Handle Google auth success event
    const handleGoogleAuthSuccess = (event: CustomEvent) => {
      const { user: userData } = event.detail;
      console.log('Google auth success event received:', userData.email);
      setUser(userData);
      setIsLoading(false);
      sessionStorage.setItem('brandentifier_user', JSON.stringify(userData));
    };

    window.addEventListener('googleAuthSuccess', handleGoogleAuthSuccess as EventListener);
    
    // Run auth check (async for server session support)
    checkAuth();

    return () => {
      window.removeEventListener('googleAuthSuccess', handleGoogleAuthSuccess as EventListener);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current); // Clean up timeout on component unmount
        timeoutRef.current = null;
      }
    };
  }, []);

  const signIn = (userData: AuthUser) => {
    console.log('Signing in user:', userData.email);
    setUser(userData);
    setIsLoading(false);
    sessionStorage.setItem('brandentifier_user', JSON.stringify(userData));
  };

  const signOut = async () => {
    console.log('AuthProvider: Signing out user');
    
    // Check if we're on published domain and should call server logout
    const hostname = window.location.hostname;
    const isPublishedDomain = hostname.includes('replit.app') || hostname.includes('brandentifier.com');
    
    if (isPublishedDomain) {
      console.log('AuthProvider: Published domain detected, calling server logout');
      try {
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        console.log('AuthProvider: Logout response:', {
          status: response.status,
          ok: response.ok
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('AuthProvider: ✅ Server logout successful:', data.message);
        } else {
          console.warn('AuthProvider: ⚠️ Server logout response not OK, but proceeding with cleanup');
        }
      } catch (error) {
        console.error('AuthProvider: ❌ Server logout error:', error);
        console.log('AuthProvider: Continuing with local cleanup despite server error');
      }
    } else {
      console.log('AuthProvider: Development domain, skipping server logout call');
    }
    
    // Always clear local state
    console.log('AuthProvider: Clearing local authentication state');
    setUser(null);
    sessionStorage.removeItem('brandentifier_user');
    sessionStorage.removeItem('auth_return_url');
    sessionStorage.removeItem('auth_timestamp');
    sessionStorage.removeItem('auth_initiated');
    console.log('AuthProvider: ✅ Local logout cleanup completed');
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signOut,
  };
  
  // Debug authentication state changes
  console.log('AuthProvider: Current state:', {
    hasUser: !!user,
    isAuthenticated: !!user,
    isLoading,
    userEmail: user?.email
  });

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}