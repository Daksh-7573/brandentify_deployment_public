import { createContext, useState, useEffect, ReactNode, useRef } from "react";
import { 
  getNetworkConfig, 
  calculateRetryDelay, 
  getConnectionErrorMessage, 
  logNetworkPerformance,
  type NetworkConfig 
} from "../utils/network-detection";

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

  // Check authentication from server session (published domain) or sessionStorage (dev)
  useEffect(() => {
    console.log('AuthProvider: Starting auth check, current loading state:', isLoading);
    
    // Get network-aware configuration for adaptive timeouts
    const networkConfig = getNetworkConfig();
    console.log('AuthProvider: Network configuration:', {
      connectionType: networkConfig.connectionType,
      requestTimeout: `${networkConfig.requestTimeout}ms`,
      failsafeTimeout: `${networkConfig.failsafeTimeout}ms`,
      maxRetries: networkConfig.maxRetries
    });
    
    // Connection-aware failsafe timeout to prevent infinite loading
    timeoutRef.current = setTimeout(() => {
      if (loadingRef.current) {
        console.warn(`AuthProvider: Failsafe timeout (${networkConfig.failsafeTimeout}ms) - forcing loading to false`);
        setIsLoading(false);
        loadingRef.current = false;
      }
    }, networkConfig.failsafeTimeout);
    
    const checkAuth = async () => {
      console.log('AuthProvider: Running checkAuth');
      
      // Get network-aware configuration for this authentication attempt
      const networkConfig = getNetworkConfig();
      
      // Check if we're on published domain and should use server session
      const hostname = window.location.hostname;
      console.log('AuthProvider: Current hostname:', hostname);
      const isPublishedDomain = hostname.includes('replit.app') || 
                               hostname.includes('replit.dev') || 
                               hostname.includes('brandentifier.com');
      console.log('AuthProvider: Domain check result:', { 
        hostname, 
        isPublishedDomain,
        supportedDomains: ['replit.app', 'replit.dev', 'brandentifier.com']
      });
      
      if (isPublishedDomain) {
        console.log('AuthProvider: Production domain detected, checking server session', hostname);
        console.log(`AuthProvider: Using ${networkConfig.connectionType} connection profile with ${networkConfig.maxRetries} retries`);
        
        // Enhanced retry logic with connection-aware configuration
        let retryCount = 0;
        
        while (retryCount <= networkConfig.maxRetries) {
          const startTime = Date.now();
          
          try {
            console.log(`AuthProvider: Fetching server session (attempt ${retryCount + 1}/${networkConfig.maxRetries + 1})`);
            console.log(`AuthProvider: Using ${networkConfig.requestTimeout}ms timeout for ${networkConfig.connectionType} connection`);
            
            const response = await fetch('/api/auth/session', {
              method: 'GET',
              credentials: 'include',
              cache: 'no-store', // Never cache auth requests
              headers: {
                'Accept': 'application/json',
              },
              // Adaptive timeout based on connection type
              signal: AbortSignal.timeout(networkConfig.requestTimeout)
            });
          
            console.log('AuthProvider: Server session response:', {
              status: response.status,
              ok: response.ok,
              url: response.url,
              attempt: retryCount + 1
            });
            
            if (response.ok) {
              const data = await response.json();
              console.log('AuthProvider: Raw server response:', data);
              
              // Log successful network performance
              logNetworkPerformance('auth-session-check', startTime, networkConfig, true);
              
              // Handle both direct user object and wrapped {success, user} response
              let userData;
              if (data.success !== undefined && data.user) {
                // Wrapped response format: {success: true, user: {...}}
                userData = data.user;
                console.log('AuthProvider: Unwrapped user from server response');
              } else if (data.id || data.email) {
                // Direct user object format
                userData = data;
                console.log('AuthProvider: Direct user object from server');
              } else {
                console.warn('AuthProvider: Unexpected server response format:', data);
                throw new Error('Invalid session response format');
              }
              
              console.log('AuthProvider: Server session found for user:', userData.email);
              setUser(userData);
              // Store in sessionStorage for consistency
              sessionStorage.setItem('brandentifier_user', JSON.stringify(userData));
              return;
            } else if (response.status === 401 || response.status === 403) {
              // Authentication failed - don't retry
              console.log('AuthProvider: No server session found, status:', response.status);
              sessionStorage.removeItem('brandentifier_user');
              break; // Exit retry loop
            } else {
              // Server error - might be worth retrying
              console.warn(`AuthProvider: Server error (${response.status}), may retry`);
              throw new Error(`Server responded with ${response.status}`);
            }
          } catch (error) {
            // Log failed network performance
            logNetworkPerformance('auth-session-check', startTime, networkConfig, false, error as Error);
            
            console.error(`AuthProvider: Error checking server session (attempt ${retryCount + 1}):`, error);
            
            // If this was the last retry, fall back to sessionStorage
            if (retryCount >= networkConfig.maxRetries) {
              console.log('AuthProvider: Max retries reached, falling back to sessionStorage check');
              console.log(getConnectionErrorMessage(networkConfig.connectionType, false));
              break;
            }
            
            // Smart exponential backoff based on connection type
            const delay = calculateRetryDelay(retryCount, networkConfig);
            console.log(`AuthProvider: ${getConnectionErrorMessage(networkConfig.connectionType, true)}`);
            console.log(`AuthProvider: Retrying in ${delay}ms (attempt ${retryCount + 1}/${networkConfig.maxRetries + 1})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            retryCount++;
          }
        }
      }
      
      // Fallback to sessionStorage check (development or no server session)
      console.log('AuthProvider: Checking sessionStorage');
      console.log('AuthProvider: Current sessionStorage keys:', Object.keys(sessionStorage));
      
      try {
        const storedUser = sessionStorage.getItem('brandentifier_user');
        console.log('AuthProvider: Raw stored data:', storedUser);
        
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          console.log('AuthProvider: Parsed user data:', {
            email: userData.email,
            id: userData.id,
            name: userData.name
          });
          setUser(userData);
          console.log('AuthProvider: User state set, isAuthenticated should be true');
        } else {
          console.log('AuthProvider: No stored user found in sessionStorage');
        }
      } catch (error) {
        console.error('AuthProvider: Error checking stored auth:', error);
        // Clear any corrupted data
        sessionStorage.removeItem('brandentifier_user');
      } finally {
        console.log('AuthProvider: Setting isLoading to false from checkAuth');
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