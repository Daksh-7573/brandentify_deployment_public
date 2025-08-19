import { createContext, useState, useEffect, ReactNode } from "react";

// Simple auth user type
type AuthUser = {
  id: number;
  username: string;
  email: string;
  name: string;
  photoURL?: string;
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

  // Check for stored user on mount
  useEffect(() => {
    const checkStoredAuth = () => {
      try {
        // Check for bypass/demo authentication first
        const bypassAuth = localStorage.getItem('auth_bypass');
        const demoUser = localStorage.getItem('demo_user');
        
        if (bypassAuth === 'true' && demoUser) {
          const userData = JSON.parse(demoUser);
          console.log('Found demo/bypass user:', userData.email);
          setUser(userData);
          setIsLoading(false);
          return;
        }
        
        // Check for regular stored user
        const storedUser = sessionStorage.getItem('brandentifier_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          console.log('Found stored user:', userData.email);
          setUser(userData);
        } else {
          console.log('No stored user found');
        }
      } catch (error) {
        console.error('Error checking stored auth:', error);
      } finally {
        console.log('Auth check complete, setting isLoading to false');
        setIsLoading(false);
      }
    };

    // Add a timeout to ensure loading state doesn't get stuck
    const timeoutId = setTimeout(() => {
      console.log('Auth timeout triggered, forcing isLoading to false');
      setIsLoading(false);
    }, 2000); // 2 second timeout

    // Handle Google auth success event
    const handleGoogleAuthSuccess = (event: CustomEvent) => {
      const { user: userData } = event.detail;
      console.log('Google auth success event received:', userData.email);
      setUser(userData);
      sessionStorage.setItem('brandentifier_user', JSON.stringify(userData));
    };

    // Handle bypass auth state changes
    const handleAuthStateChange = (event: CustomEvent) => {
      if (event.detail.bypass && event.detail.isAuthenticated) {
        console.log('Demo auth event received:', event.detail.user.email);
        setUser(event.detail.user);
        setIsLoading(false);
      }
    };

    window.addEventListener('googleAuthSuccess', handleGoogleAuthSuccess as EventListener);
    window.addEventListener('authStateChanged', handleAuthStateChange as EventListener);
    checkStoredAuth();

    return () => {
      window.removeEventListener('googleAuthSuccess', handleGoogleAuthSuccess as EventListener);
      window.removeEventListener('authStateChanged', handleAuthStateChange as EventListener);
      clearTimeout(timeoutId);
    };
  }, []);

  const signIn = (userData: AuthUser) => {
    console.log('Signing in user:', userData.email);
    setUser(userData);
    sessionStorage.setItem('brandentifier_user', JSON.stringify(userData));
  };

  const signOut = () => {
    console.log('Signing out user');
    setUser(null);
    sessionStorage.removeItem('brandentifier_user');
    sessionStorage.removeItem('auth_return_url');
    sessionStorage.removeItem('auth_timestamp');
    sessionStorage.removeItem('auth_initiated');
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}