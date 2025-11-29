import { createContext, useState, useEffect, ReactNode, useRef, useContext, useCallback } from "react";
import { queryClient } from "@/lib/queryClient";

// Simple auth user type
type AuthUser = {
  id: number;
  username: string;
  email: string;
  name: string;
  photoURL?: string;
  uid?: string;
  profileCompleted?: number;
};

// Simple auth context type
type AuthContextType = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (user: AuthUser) => void;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<AuthUser | null>;
};

// Create the auth context
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  signIn: () => {},
  signOut: async () => {},
  refreshSession: async () => null,
});

// Server-session based auth provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const loadingRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSigningOutRef = useRef(false);

  // Fetch session from server - this is the ONLY source of truth
  const fetchServerSession = useCallback(async (): Promise<AuthUser | null> => {
    try {
      console.log('[Auth] Fetching session from server...');
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
        }
      });

      console.log('[Auth] Server session response:', {
        status: response.status,
        ok: response.ok,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[Auth] Raw server response:', data);

        // Handle both direct user object and wrapped {success, user} response
        let userData: AuthUser | null = null;
        if (data.success !== undefined && data.user) {
          userData = data.user;
          console.log('[Auth] Unwrapped user from server response');
        } else if (data.id || data.email) {
          userData = data;
          console.log('[Auth] Direct user object from server');
        }

        if (userData) {
          console.log('[Auth] Valid session found for:', userData.email);
          return userData;
        }
      }

      console.log('[Auth] No valid session found');
      return null;
    } catch (error) {
      console.error('[Auth] Error fetching server session:', error);
      return null;
    }
  }, []);

  // Refresh session - callable from components
  const refreshSession = useCallback(async (): Promise<AuthUser | null> => {
    console.log('[Auth] Refreshing session...');
    const userData = await fetchServerSession();
    setUser(userData);
    return userData;
  }, [fetchServerSession]);

  // Check authentication on mount - ALWAYS from server
  useEffect(() => {
    console.log('[Auth] Starting auth check');

    // Failsafe timeout to prevent infinite loading
    timeoutRef.current = setTimeout(() => {
      if (loadingRef.current) {
        console.warn('[Auth] Failsafe timeout - forcing loading to false');
        setIsLoading(false);
        loadingRef.current = false;
      }
    }, 5000);

    const checkAuth = async () => {
      try {
        const userData = await fetchServerSession();
        setUser(userData);
      } catch (error) {
        console.error('[Auth] Error during auth check:', error);
        setUser(null);
      } finally {
        console.log('[Auth] Auth check complete');
        setIsLoading(false);
        loadingRef.current = false;
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    };

    // Handle Google auth success event (for OAuth callback)
    const handleGoogleAuthSuccess = async (event: Event) => {
      const customEvent = event as CustomEvent<{ user: AuthUser }>;
      const { user: userData } = customEvent.detail;
      console.log('[Auth] Google auth success event received:', userData.email);
      
      // Verify with server session after OAuth callback
      const verifiedUser = await fetchServerSession();
      if (verifiedUser) {
        setUser(verifiedUser);
        setIsLoading(false);
        
        // Process pending referral if exists
        const referralCode = sessionStorage.getItem('referral_code');
        if (referralCode && verifiedUser.id) {
          console.log('[Referral] Found pending referral code, processing...');
          processReferral(verifiedUser.id, referralCode);
        }
      }
    };

    window.addEventListener('googleAuthSuccess', handleGoogleAuthSuccess);
    checkAuth();

    return () => {
      window.removeEventListener('googleAuthSuccess', handleGoogleAuthSuccess);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [fetchServerSession]);

  const processReferral = async (userId: number, referralCode: string) => {
    try {
      console.log('[Referral] Processing referral for user:', userId, 'code:', referralCode);

      const response = await fetch('/api/referral/process-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          referralCode,
          newUserId: userId
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[Referral] Referral processed successfully:', data);
        sessionStorage.removeItem('referral_code');
        return true;
      } else {
        console.warn('[Referral] Failed to process referral:', response.status);
        return false;
      }
    } catch (error) {
      console.error('[Referral] Error processing referral:', error);
      return false;
    }
  };

  // Sign in - called after successful OAuth, verifies with server
  const signIn = useCallback(async (userData: AuthUser) => {
    console.log('[Auth] Sign in called for:', userData.email);
    
    // Verify the session with the server
    const verifiedUser = await fetchServerSession();
    if (verifiedUser) {
      setUser(verifiedUser);
      
      // Process pending referral
      const referralCode = sessionStorage.getItem('referral_code');
      if (referralCode && verifiedUser.id) {
        console.log('[Referral] Found pending referral code, processing...');
        processReferral(verifiedUser.id, referralCode);
      }
    } else {
      console.warn('[Auth] Sign in failed - no valid server session');
      setUser(null);
    }
    setIsLoading(false);
  }, [fetchServerSession]);

  // Sign out - calls server logout endpoint
  const signOut = useCallback(async () => {
    if (isSigningOutRef.current) {
      console.log('[Auth] Logout already in progress');
      return;
    }

    isSigningOutRef.current = true;

    try {
      console.log('[Auth] Starting logout process');

      // Call server logout endpoint to clear session cookie
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        });
        console.log('[Auth] Server logout successful');
      } catch (error) {
        console.error('[Auth] Server logout error:', error);
      }

      // Clear React Query cache
      queryClient.clear();
      console.log('[Auth] React Query cache cleared');

      // Clear any client-side storage (for cleanup, not security)
      sessionStorage.removeItem('referral_code');
      sessionStorage.removeItem('auth_return_url');

      // Update UI state
      setUser(null);
      console.log('[Auth] User state cleared');

      // Redirect to auth page
      window.location.href = '/auth';

    } catch (error) {
      console.error('[Auth] Error during logout:', error);
      setUser(null);
      window.location.href = '/auth';
    } finally {
      isSigningOutRef.current = false;
    }
  }, []);

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signOut,
    refreshSession,
  };

  console.log('[Auth] Current state:', {
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

// Export useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
