import { createContext, useState, useEffect, ReactNode, useContext, useCallback, useRef } from "react";
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
  authMethod: 'cookie' | 'localStorage' | 'none';
  csrfToken: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithPhone: (user: User) => void;
  signInWithEmail: (user: User) => void;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  getAuthToken: () => string | null;
};

// Create the auth context with default values
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isDemoMode: false,
  authMethod: 'none',
  csrfToken: null,
  signInWithGoogle: async () => {},
  signInWithPhone: () => {},
  signInWithEmail: () => {},
  signOut: async () => {},
  refreshUserData: async () => {},
  refreshToken: async () => false,
  getAuthToken: () => null,
});

// localStorage keys for token storage
const STORAGE_KEYS = {
  JWT_TOKEN: 'brandentifier_jwt_token',
  USER_DATA: 'brandentifier_user_data',
  CSRF_TOKEN: 'brandentifier_csrf_token',
  AUTH_METHOD: 'brandentifier_auth_method',
  TOKEN_EXPIRY: 'brandentifier_token_expiry'
};

// Create the provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [authMethod, setAuthMethod] = useState<'cookie' | 'localStorage' | 'none'>('none');
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const { toast } = useToast();
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  // Safe localStorage operations
  const safeGetItem = useCallback((key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`[Auth Context] localStorage.getItem failed for ${key}:`, error);
      return null;
    }
  }, []);
  
  const safeSetItem = useCallback((key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn(`[Auth Context] localStorage.setItem failed for ${key}:`, error);
    }
  }, []);
  
  const safeRemoveItem = useCallback((key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`[Auth Context] localStorage.removeItem failed for ${key}:`, error);
    }
  }, []);

  // Get authentication token from localStorage or cookie
  const getAuthToken = useCallback((): string | null => {
    // Try localStorage first (localStorage auth)
    const localToken = safeGetItem(STORAGE_KEYS.JWT_TOKEN);
    if (localToken) {
      return localToken;
    }
    
    // Fallback to cookie (cookie auth) - this is handled server-side
    return null;
  }, [safeGetItem]);

  // Validate token expiry
  const isTokenExpired = useCallback((token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.warn('[Auth Context] Error parsing token for expiry check:', error);
      return true;
    }
  }, []);

  // Store JWT token in localStorage
  const storeToken = useCallback((token: string, userData: any) => {
    console.log('[Auth Context] 💾 Storing JWT token in localStorage');
    
    safeSetItem(STORAGE_KEYS.JWT_TOKEN, token);
    safeSetItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    safeSetItem(STORAGE_KEYS.AUTH_METHOD, 'localStorage');
    
    // Store token expiry for easy checking
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      safeSetItem(STORAGE_KEYS.TOKEN_EXPIRY, payload.exp.toString());
    } catch (error) {
      console.warn('[Auth Context] Error parsing token for expiry storage:', error);
    }
    
    setAuthMethod('localStorage');
    
    // Broadcast storage event for cross-tab sync
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEYS.JWT_TOKEN,
      newValue: token,
      storageArea: localStorage
    }));
  }, [safeSetItem]);

  // Clear localStorage tokens
  const clearStoredTokens = useCallback(() => {
    console.log('[Auth Context] 🧹 Clearing stored tokens');
    
    Object.values(STORAGE_KEYS).forEach(key => {
      safeRemoveItem(key);
    });
    
    setAuthMethod('none');
    setCsrfToken(null);
    
    // Broadcast storage event for cross-tab sync
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEYS.JWT_TOKEN,
      newValue: null,
      storageArea: localStorage
    }));
  }, [safeRemoveItem]);

  // Refresh JWT token
  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (isRefreshingRef.current) {
      console.log('[Auth Context] Token refresh already in progress');
      return false;
    }
    
    console.log('[Auth Context] 🔄 Attempting token refresh');
    isRefreshingRef.current = true;
    
    try {
      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(getAuthToken() && { 'Authorization': `Bearer ${getAuthToken()}` }),
          ...(csrfToken && { 'X-CSRF-Token': csrfToken })
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.token) {
          console.log('[Auth Context] ✅ Token refresh successful');
          
          // Store new token
          storeToken(data.token, data.user);
          
          // Update user data
          setUser({
            uid: data.user.id.toString(),
            ...data.user
          });
          
          // Schedule next refresh
          scheduleTokenRefresh(data.token);
          
          return true;
        }
      }
      
      console.warn('[Auth Context] ❌ Token refresh failed');
      return false;
      
    } catch (error) {
      console.error('[Auth Context] Token refresh error:', error);
      return false;
    } finally {
      isRefreshingRef.current = false;
    }
  }, [getAuthToken, csrfToken, storeToken]);

  // Schedule automatic token refresh
  const scheduleTokenRefresh = useCallback((token: string) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = payload.exp - currentTime;
      const refreshTime = Math.max(timeUntilExpiry - 300, 60); // Refresh 5 minutes before expiry, minimum 60 seconds
      
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      
      console.log(`[Auth Context] ⏰ Scheduling token refresh in ${refreshTime} seconds`);
      
      refreshTimeoutRef.current = setTimeout(() => {
        refreshToken();
      }, refreshTime * 1000);
      
    } catch (error) {
      console.warn('[Auth Context] Error scheduling token refresh:', error);
    }
  }, [refreshToken]);

  // Initialize authentication system with hybrid approach
  useEffect(() => {
    console.log('[Auth Context] 🚀 Initializing hybrid authentication system');
    
    const initAuth = async () => {
      // First, try localStorage token
      const localToken = safeGetItem(STORAGE_KEYS.JWT_TOKEN);
      
      if (localToken && !isTokenExpired(localToken)) {
        console.log('[Auth Context] 📱 Found valid localStorage token');
        
        try {
          // Validate token with server
          const response = await fetch('/api/auth/validate-token', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localToken}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.success && data.valid) {
              console.log('[Auth Context] ✅ localStorage token validated');
              
              setUser({
                uid: data.user.id.toString(),
                ...data.user
              });
              setAuthMethod('localStorage');
              
              // Schedule refresh if needed
              if (data.needsRefresh) {
                scheduleTokenRefresh(localToken);
              }
              
              setIsLoading(false);
              return;
            }
          }
          
          console.warn('[Auth Context] ❌ localStorage token validation failed');
          clearStoredTokens();
          
        } catch (error) {
          console.error('[Auth Context] localStorage token validation error:', error);
          clearStoredTokens();
        }
      }
      
      // Fallback to server-side session check (cookie auth)
      try {
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'include'
        });
        
        if (response.ok) {
          const sessionData = await response.json();
          
          if (sessionData.success && sessionData.user) {
            console.log('[Auth Context] 🍪 Found valid cookie session:', sessionData.user.email);
            
            setUser({
              uid: sessionData.user.id.toString(),
              ...sessionData.user
            });
            setAuthMethod('cookie');
            
            // Store user data for consistency (but not the token)
            safeSetItem(STORAGE_KEYS.USER_DATA, JSON.stringify(sessionData.user));
            safeSetItem(STORAGE_KEYS.AUTH_METHOD, 'cookie');
            
            setIsLoading(false);
            return;
          }
        }
        
        console.log('[Auth Context] ❌ No valid authentication found');
        
      } catch (error) {
        console.log('[Auth Context] Session check error:', error.message);
      }
      
      // No valid authentication found
      setAuthMethod('none');
      setIsLoading(false);
    };
    
    initAuth();
    
    // Cleanup timeout on unmount
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
    
  }, [safeGetItem, isTokenExpired, clearStoredTokens, scheduleTokenRefresh, safeSetItem]);

  // Cross-tab synchronization using storage events
  useEffect(() => {
    console.log('[Auth Context] 🔄 Setting up cross-tab synchronization');
    
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.JWT_TOKEN) {
        console.log('[Auth Context] 📡 Cross-tab storage event detected');
        
        if (event.newValue) {
          // Token added/updated in another tab
          const userData = safeGetItem(STORAGE_KEYS.USER_DATA);
          
          if (userData) {
            try {
              const parsedUser = JSON.parse(userData);
              setUser({
                uid: parsedUser.id.toString(),
                ...parsedUser
              });
              setAuthMethod('localStorage');
              console.log('[Auth Context] ✅ Synchronized login from another tab');
            } catch (error) {
              console.error('[Auth Context] Error parsing cross-tab user data:', error);
            }
          }
        } else {
          // Token removed in another tab
          setUser(null);
          setAuthMethod('none');
          setCsrfToken(null);
          console.log('[Auth Context] ✅ Synchronized logout from another tab');
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [safeGetItem]);

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

  // Fetch CSRF token for localStorage authentication
  const fetchCSRFToken = useCallback(async (): Promise<string | null> => {
    try {
      const token = getAuthToken();
      if (!token) return null;
      
      const response = await fetch('/api/auth/csrf-token', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Request-CSRF-Token': 'true'
        }
      });
      
      if (response.ok) {
        const csrfToken = response.headers.get('X-CSRF-Token');
        if (csrfToken) {
          safeSetItem(STORAGE_KEYS.CSRF_TOKEN, csrfToken);
          setCsrfToken(csrfToken);
          console.log('[Auth Context] ✅ CSRF token fetched');
          return csrfToken;
        }
      }
      
      return null;
    } catch (error) {
      console.error('[Auth Context] Error fetching CSRF token:', error);
      return null;
    }
  }, [getAuthToken, safeSetItem]);

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

  // Enhanced sign out function with localStorage support
  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Clear refresh timeout
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
      
      // Invalidate token on server if using localStorage auth
      if (authMethod === 'localStorage') {
        try {
          await fetch('/api/auth/logout-token', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Authorization': `Bearer ${getAuthToken()}`,
              'Content-Type': 'application/json',
              ...(csrfToken && { 'X-CSRF-Token': csrfToken })
            }
          });
        } catch (error) {
          console.warn('[Auth Context] Error invalidating token on server:', error);
        }
      }
      
      // Clear server-side session for all domains (cookie auth)
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include'
        });
      } catch (error) {
        console.warn('[Auth Context] Error clearing server session:', error);
      }
      
      // Clear all local storage and state
      clearStoredTokens();
      setUser(null);
      sessionStorage.removeItem('brandentifier_user');
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
      
      // Invalidate query cache
      queryClient.clear();
      
      // Redirect to auth page
      window.location.href = '/auth';
      
    } catch (error) {
      console.error("Sign out error:", error);
      
      // Clear local state anyway
      clearStoredTokens();
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
        authMethod,
        csrfToken,
        signInWithGoogle,
        signInWithPhone,
        signInWithEmail,
        signOut,
        refreshUserData,
        refreshToken,
        getAuthToken,
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