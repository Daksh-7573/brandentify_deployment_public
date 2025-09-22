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
  const { toast } = useToast();

  // POPUP COMMUNICATION FIX: Reusable function to fetch auth state
  const fetchAuthState = async () => {
    try {
      console.log('[Auth Context] Checking authentication state...');
      
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include' // Include cookies
      });
      
      if (response.ok) {
        const sessionData = await response.json();
        if (sessionData.success && sessionData.user) {
          console.log('[Auth Context] ✅ Valid session found:', sessionData.user.email);
          
          // PROFILE PICTURE PERSISTENCE FIX: Enhanced photo URL handling
          const userData = sessionData.user;
          let finalPhotoURL = userData.photoURL;
          
          // Log photo source information from backend
          if (userData.photoSource) {
            console.log('[Auth Context] 📸 Photo source from backend:', userData.photoSource);
          }
          
          // Apply photo URL priority logic on frontend as well
          if (userData.photoURL) {
            if (userData.photoURL.startsWith('data:image/')) {
              console.log('[Auth Context] ✅ Using custom uploaded profile picture');
            } else if (userData.photoURL.startsWith('http')) {
              console.log('[Auth Context] ✅ Using Google OAuth profile picture');
            }
          } else {
            console.log('[Auth Context] ℹ️ No profile picture available');
          }

          const authUser = {
            uid: userData.id.toString(),
            ...userData,
            photoURL: finalPhotoURL
          };
          
          setUser(authUser);
          setIsLoading(false);
          
          // Store in session storage for consistency with photo source tracking
          sessionStorage.setItem('photoSource', userData.photoSource || 'none');
          
          // Trigger cache refresh for user data
          queryClient.invalidateQueries({ queryKey: ['/api/users'] });
          
          console.log('[Auth Context] 🔄 User data and cache updated');
          return authUser;
        }
      }
      
      console.log('[Auth Context] No valid session found');
      setUser(null);
      setIsLoading(false);
      return null;
      
    } catch (error) {
      console.error('[Auth Context] Error checking auth state:', error);
      setUser(null);
      setIsLoading(false);
      return null;
    }
  };

  // Initialize authentication system with server-side session check only
  useEffect(() => {
    console.log('[Auth Context] Initializing authentication system');
    const startTime = performance.now();
    
    console.log('[Auth Context] Using server-side JWT session for all domains');
    
    // Use the reusable fetchAuthState function
    fetchAuthState().then(user => {
      const endTime = performance.now();
      console.log(`[Auth Context] Initialization completed in ${endTime - startTime}ms`);
    }).catch(error => {
      console.error('[Auth Context] Initialization failed:', error);
      setIsLoading(false);
    });
  }, []);

  // PROFILE PICTURE PERSISTENCE FIX: Listen for profile picture updates
  useEffect(() => {
    const handleProfilePictureUpdate = (event: CustomEvent) => {
      if (!user) return;
      
      const { newPhotoURL } = event.detail;
      console.log('[Auth Context] 🖼️ Profile picture updated, refreshing user data');
      
      // Update the current user with new photo URL
      setUser(prevUser => prevUser ? {
        ...prevUser,
        photoURL: newPhotoURL
      } : null);
      
      // Also refresh full user data to ensure backend sync
      fetchAuthState();
    };

    window.addEventListener('profile-picture-updated', handleProfilePictureUpdate as EventListener);
    
    return () => {
      window.removeEventListener('profile-picture-updated', handleProfilePictureUpdate as EventListener);
    };
  }, [user]);

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

  // POPUP COMMUNICATION FIX: Sign in with Google using NEW popup-only flow
  const signInWithGoogle = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      console.log("🔐 Starting Google sign-in with NEW popup-only flow");
      
      // Get popup-specific OAuth URL from our server (NEW ENDPOINT)
      const response = await fetch('/api/auth/google/popup/url', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error('Failed to get popup OAuth URL');
      }
      
      const data = await response.json();
      console.log('✅ Got popup OAuth URL, opening popup...');
      
      // Open popup with popup-specific URL (no query parameter needed)
      console.log('[POPUP AUTH NEW] Opening popup with dedicated popup callback URL');
      
      const popup = window.open(
        data.oauthUrl,
        'google-auth-popup',
        'width=500,height=600,left=' + 
        (window.screen.width / 2 - 250) + 
        ',top=' + (window.screen.height / 2 - 300) + 
        ',scrollbars=yes,resizable=yes'
      );
      
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        // Popup blocked or failed, use redirect method
        console.log('Popup blocked, using redirect method');
        const redirectResponse = await fetch('/api/auth/google/url');
        const redirectData = await redirectResponse.json();
        window.location.href = redirectData.oauthUrl;
        return;
      }
      
      console.log('[POPUP AUTH NEW] OAuth popup opened, waiting for exchange code...');
      
      // NEW: Listen for exchange code from popup
      const handleAuthMessage = async (event: MessageEvent) => {
        console.log('[POPUP AUTH NEW] Received message from popup:', event.data);
        
        // Verify origin for security
        if (event.origin !== window.location.origin) {
          console.warn('[POPUP AUTH NEW] Ignoring message from unauthorized origin:', event.origin);
          return;
        }
        
        if (event.data.type === 'oauth:success' && event.data.exchangeCode) {
          console.log('[POPUP AUTH NEW] ✅ Got exchange code, exchanging for session in main window');
          
          // Close popup immediately
          if (popup && !popup.closed) {
            popup.close();
          }
          
          // Remove event listener
          window.removeEventListener('message', handleAuthMessage);
          
          try {
            // NEW: Exchange code for session in main window only
            const exchangeResponse = await fetch('/api/auth/session/exchange', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                exchangeCode: event.data.exchangeCode
              })
            });
            
            const exchangeData = await exchangeResponse.json();
            
            if (exchangeData.success && exchangeData.user) {
              console.log('[POPUP AUTH NEW] ✅ Session exchange successful - ONLY main window authenticated');
              
              // Update user state with exchanged session
              const authUser = {
                uid: exchangeData.user.id.toString(),
                id: exchangeData.user.id,
                username: exchangeData.user.username,
                email: exchangeData.user.email,
                name: exchangeData.user.name,
                photoURL: exchangeData.user.photoURL || null
              };
              
              console.log('[POPUP AUTH NEW] 🎉 Main window authenticated (NO DOUBLE LOGIN):', authUser.email);
              setUser(authUser);
              setIsLoading(false);
              
              // Trigger cache refresh for consistency
              queryClient.invalidateQueries({ queryKey: ['/api/users'] });
              
            } else {
              console.error('[POPUP AUTH NEW] ❌ Session exchange failed:', exchangeData);
              toast({
                title: "Authentication Failed",
                description: exchangeData.error || "Session exchange failed. Please try again.",
                variant: "destructive"
              });
              setIsLoading(false);
            }
          } catch (exchangeError) {
            console.error('[POPUP AUTH NEW] ❌ Exchange request failed:', exchangeError);
            toast({
              title: "Authentication Failed",
              description: "Session exchange failed. Please try again.",
              variant: "destructive"
            });
            setIsLoading(false);
          }
          
        } else if (event.data.type === 'oauth:error') {
          console.error('[POPUP AUTH NEW] ❌ Authentication failed:', event.data.error);
          
          // Close popup
          if (popup && !popup.closed) {
            popup.close();
          }
          
          // Remove event listener
          window.removeEventListener('message', handleAuthMessage);
          
          toast({
            title: "Authentication Failed",
            description: event.data.message || "Google authentication failed. Please try again.",
            variant: "destructive"
          });
          
          setIsLoading(false);
        }
      };
      
      // Add message listener
      window.addEventListener('message', handleAuthMessage);
      
      // Monitor popup closure as fallback
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleAuthMessage);
          console.log('[POPUP AUTH NEW] Popup closed without message, authentication cancelled');
          setIsLoading(false);
        }
      }, 1000);
      
    } catch (popupError) {
      // If popup fails completely, use redirect
      console.log('Popup failed, using redirect method:', popupError);
      const redirectResponse = await fetch('/api/auth/google/url');
      const redirectData = await redirectResponse.json();
      window.location.href = redirectData.oauthUrl;
      return;
    }
      
    } catch (error: any) {
      console.error("[Auth Context] Google sign-in error:", {
        errorMessage: error.message,
        errorStack: error.stack,
        timestamp: new Date().toISOString(),
        currentUrl: window.location.href,
        userAgent: navigator.userAgent.substring(0, 50),
        cookiesEnabled: navigator.cookieEnabled,
        onlineStatus: navigator.onLine
      });
      
      // Enhanced error categorization and user-friendly messages
      let errorMessage = "There was a problem with Google sign-in. Please try again.";
      let canRetry = true;
      let suggestions = ['Try refreshing the page', 'Check your internet connection'];
      
      if (error.message && error.message.includes('OAuth URL')) {
        errorMessage = "Unable to start authentication. Please try again.";
        suggestions = ['Refresh the page and try again', 'Clear browser cache', 'Try in incognito mode'];
      } else if (error.message && error.message.includes('network')) {
        errorMessage = "Network connection issue. Please check your internet and try again.";
        suggestions = ['Check your internet connection', 'Try again in a few moments'];
      } else if (error.message && error.message.includes('blocked')) {
        errorMessage = "Authentication was blocked. Please enable popups and try again.";
        suggestions = ['Enable popups for this site', 'Try in a different browser', 'Disable ad blockers temporarily'];
        canRetry = true;
      } else if (!navigator.onLine) {
        errorMessage = "You appear to be offline. Please check your internet connection.";
        suggestions = ['Check your internet connection', 'Try again when back online'];
        canRetry = false;
      } else if (!navigator.cookieEnabled) {
        errorMessage = "Cookies are disabled. Please enable cookies and try again.";
        suggestions = ['Enable cookies in your browser settings', 'Try in incognito mode'];
        canRetry = false;
      }
      
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Log detailed error information for debugging
      console.error('[Auth Context] Detailed error analysis:', {
        canRetry,
        suggestions,
        browserInfo: {
          cookiesEnabled: navigator.cookieEnabled,
          onlineStatus: navigator.onLine,
          userAgent: navigator.userAgent,
          language: navigator.language
        }
      });
      
      setIsLoading(false);
    }
  };

  // Sign in with Phone/Email (placeholder implementations)
  const signInWithPhone = (user: User) => {
    console.log('Phone sign-in not implemented yet', user);
  };

  const signInWithEmail = (user: User) => {
    console.log('Email sign-in not implemented yet', user);
  };

  // Refresh user data
  const refreshUserData = async () => {
    if (!user) return;
    
    try {
      const userData = await fetchUserData(user.id);
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      console.log('[Auth Context] Initiating sign out');
      
      // Clear the server-side session
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      // Clear local state
      setUser(null);
      sessionStorage.removeItem('photoSource');
      
      // Invalidate all queries to clear cached data
      queryClient.clear();
      
      console.log('[Auth Context] ✅ Sign out completed');
      
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
      
    } catch (error) {
      console.error('[Auth Context] Sign out error:', error);
      
      // Even if server request fails, clear local state
      setUser(null);
      sessionStorage.removeItem('photoSource');
      queryClient.clear();
      
      toast({
        title: "Signed out",
        description: "You have been logged out.",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
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

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};