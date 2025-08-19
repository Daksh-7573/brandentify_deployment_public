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

  // Ultra-fast stored user check
  useEffect(() => {
    const checkStoredAuth = () => {
      try {
        const storedUser = sessionStorage.getItem('brandentifier_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          console.log('Found stored user:', userData.email);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error checking stored auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Handle Google auth success event
    const handleGoogleAuthSuccess = (event: CustomEvent) => {
      const { user: userData } = event.detail;
      console.log('Google auth success event received:', userData.email);
      setUser(userData);
      sessionStorage.setItem('brandentifier_user', JSON.stringify(userData));
    };

    window.addEventListener('googleAuthSuccess', handleGoogleAuthSuccess as EventListener);
    checkStoredAuth();

    return () => {
      window.removeEventListener('googleAuthSuccess', handleGoogleAuthSuccess as EventListener);
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