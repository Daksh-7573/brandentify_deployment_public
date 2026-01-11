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
        const sessionUserData = {
          ...userData,
          photoURL: finalPhotoURL,
          photoSource: userData.photoSource || 'unknown'
        };
        sessionStorage.setItem('brandentifier_user', JSON.stringify(sessionUserData));
        
        console.log('[Auth Context] 💾 Updated session storage with photo source tracking');
      } else {
        throw new Error('Invalid session data');
      }
    })
    .catch(error => {
      console.log('[Auth Context] ❌ No valid JWT session found:', {
        errorMessage: error.message,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent.substring(0, 50),
        currentDomain: window.location.hostname,
        cookiesEnabled: navigator.cookieEnabled,
        sessionStorageAvailable: typeof(Storage) !== "undefined" && sessionStorage
      });
      console.log('[Auth Context] User needs to authenticate via server OAuth');
      
      // Clear any stale session data
      sessionStorage.removeItem('brandentifier_user');
      setIsLoading(false);
    });
    
  }, []);

  // Listen for profile picture updates to sync auth state
  useEffect(() => {
    const handleProfilePictureUpdate = (event: any) => {
      console.log('[Auth Context] 🔄 Profile picture updated, syncing auth context');
      const { newPhotoURL, photoSource } = event.detail;
      
      if (user && newPhotoURL) {
        const updatedUser = {
          ...user,
          photoURL: newPhotoURL,
          photoSource: photoSource || 'custom_upload' // Default to custom upload
        };
        setUser(updatedUser);
        
        // PROFILE PICTURE PERSISTENCE FIX: Update session storage immediately
        const currentSessionData = sessionStorage.getItem('brandentifier_user');
        if (currentSessionData) {
          try {
            const sessionUser = JSON.parse(currentSessionData);
            const updatedSessionUser = {
              ...sessionUser,
              photoURL: newPhotoURL,
              photoSource: photoSource || 'custom_upload'
            };
            sessionStorage.setItem('brandentifier_user', JSON.stringify(updatedSessionUser));
            console.log('[Auth Context] 💾 Updated session storage with new profile picture');
          } catch (error) {
            console.error('[Auth Context] ❌ Failed to update session storage:', error);
          }
        }
        
        console.log('[Auth Context] ✅ Auth context synced with new profile picture');
      }
    };

    // Listen for profile picture update events
    window.addEventListener('profile-picture-updated', handleProfilePictureUpdate);
    
    // Cleanup event listener
    return () => {
      window.removeEventListener('profile-picture-updated', handleProfilePictureUpdate);
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
      
      // Try popup first, fallback to redirect if popup is blocked
      try {
        const popup = window.open(
          data.oauthUrl,
          'google-auth',
          'width=500,height=600,left=' + 
          (window.screen.width / 2 - 250) + 
          ',top=' + (window.screen.height / 2 - 300) + 
          ',scrollbars=yes,resizable=yes'
        );
        
        if (!popup || popup.closed || typeof popup.closed === 'undefined') {
          // Popup blocked or failed, use redirect method
          console.log('Popup blocked, using redirect method');
          window.location.href = data.oauthUrl;
          return;
        }
        
        // Listen for postMessage from popup indicating successful authentication
        const handlePostMessage = async (event: MessageEvent) => {
          // Verify the message came from same origin
          if (event.origin !== window.location.origin) {
            return;
          }
          
          // Check if this is our oauth_success message
          if (event.data?.type === "oauth_success" && event.data?.provider === "google") {
            console.log("✅ Received oauth_success postMessage from popup");
            
            // Remove listener first to prevent duplicate handling
            window.removeEventListener("message", handlePostMessage);
            
            // DEV FIX: Wait for cookie to propagate, then fetch and update auth state
            // This ensures the session is properly set before redirecting
            try {
              // Wait a bit for cookie propagation
              await new Promise(resolve => setTimeout(resolve, 300));
              
              // Fetch session to update auth state
              const sessionResponse = await fetch('/api/auth/session', {
                method: 'GET',
                credentials: 'include'
              });
              
              if (sessionResponse.ok) {
                const sessionData = await sessionResponse.json();
                if (sessionData.success && sessionData.user) {
                  console.log('[Auth Context] ✅ Session verified after OAuth, updating state');
                  const userData = sessionData.user;
                  const authUser = {
                    uid: userData.id.toString(),
                    ...userData,
                    photoURL: userData.photoURL
                  };
                  setUser(authUser);
                  sessionStorage.setItem('brandentifier_user', JSON.stringify(userData));
                }
              }
              
              setIsLoading(false);
              
              // Now redirect to dashboard with auth state properly set
              window.location.href = "/dashboard";
            } catch (error) {
              console.error('[Auth Context] Error fetching session after OAuth:', error);
              setIsLoading(false);
              // Still redirect - the page load will re-fetch session
              window.location.href = "/dashboard";
            }
          }
        };
        
        // Listen for postMessage from popup
        window.addEventListener("message", handlePostMessage);
        
        // Clean up listener after 30 seconds if no message received (timeout)
        const timeoutId = setTimeout(() => {
          window.removeEventListener("message", handlePostMessage);
          setIsLoading(false);
        }, 30000);
        
        return;
        
      } catch (popupError) {
        // If popup fails completely, use redirect
        console.log('Popup failed, using redirect method:', popupError);
        window.location.href = data.oauthUrl;
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
      
    } catch (error: any) {
      console.error("[Auth Context] Sign out error:", {
        errorMessage: error.message,
        timestamp: new Date().toISOString(),
        currentUrl: window.location.href,
        userAgent: navigator.userAgent.substring(0, 50)
      });
      
      // Provide user feedback about sign out issues
      let signOutMessage = "Sign out completed locally. You may need to clear your browser data.";
      if (error.message && error.message.includes('network')) {
        signOutMessage = "Network issue during sign out. You have been signed out locally.";
      } else if (error.message && error.message.includes('server')) {
        signOutMessage = "Server error during sign out. You have been signed out locally.";
      }
      
      toast({
        title: "Signed out",
        description: signOutMessage,
        variant: "default", // Not destructive since local signout succeeded
      });
      
      // Clear local state anyway - prioritize user security
      setUser(null);
      sessionStorage.removeItem('brandentifier_user');
      window.location.href = '/auth';
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh user data with profile picture persistence fix
  const refreshUserData = async () => {
    if (!user) return;
    
    try {
      console.log('[Auth Context] 🔄 Refreshing user data with photo persistence logic');
      
      // Check server-side session again to get latest data
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const sessionData = await response.json();
        if (sessionData.success && sessionData.user) {
          // PROFILE PICTURE PERSISTENCE FIX: Apply same photo priority logic
          const userData = sessionData.user;
          let finalPhotoURL = userData.photoURL;
          
          // Log photo source information from backend
          if (userData.photoSource) {
            console.log('[Auth Context] 🔄 Refresh - Photo source from backend:', userData.photoSource);
          }
          
          // Apply photo URL priority logic
          if (userData.photoURL) {
            if (userData.photoURL.startsWith('data:image/')) {
              console.log('[Auth Context] 🔄 Refresh - Using custom uploaded profile picture');
            } else if (userData.photoURL.startsWith('http')) {
              console.log('[Auth Context] 🔄 Refresh - Using Google OAuth profile picture');
            }
          }

          const authUser = {
            uid: userData.id.toString(),
            ...userData,
            photoURL: finalPhotoURL
          };
          
          setUser(authUser);
          
          // Update session storage
          const sessionUserData = {
            ...userData,
            photoURL: finalPhotoURL,
            photoSource: userData.photoSource || 'unknown'
          };
          sessionStorage.setItem('brandentifier_user', JSON.stringify(sessionUserData));
          
          console.log('[Auth Context] ✅ User data refreshed with photo persistence logic');
        }
      } else {
        // Fallback to old method if session check fails
        const userData = await fetchUserData(user.uid, user.email || undefined);
        if (userData) {
          setUser(userData);
          console.log('[Auth Context] ✅ User data refreshed via fallback method');
        }
      }
    } catch (error) {
      console.error("[Auth Context] Error refreshing user data:", error);
    }
  };

  // Placeholder functions for compatibility
  const signInWithPhone = (user: User) => {
    console.log("Phone sign-in not implemented");
  };

  const signInWithEmail = (userData: User) => {
    console.log("[Auth Context] Email sign-in:", userData.email);
    
    // Map User to AuthUser type
    const authUser: AuthUser = {
      uid: userData.firebaseUid || userData.googleId || String(userData.id),
      id: userData.id,
      username: userData.username,
      email: userData.email,
      name: userData.name,
      photoURL: userData.photoURL || null,
      title: userData.title || undefined,
      location: userData.location || undefined,
    };
    
    // Set the user in state
    setUser(authUser);
    setIsLoading(false);
    
    // Store in sessionStorage
    sessionStorage.setItem('brandentifier_user', JSON.stringify(authUser));
    
    // Check for pending referral code (backup - should be processed during registration)
    const referralCode = sessionStorage.getItem('referral_code');
    if (referralCode && userData.id) {
      console.log('[Auth Context] Processing pending referral code on login:', referralCode);
      
      // Process referral asynchronously (don't block the login)
      fetch('/api/referral/process-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referralCode,
          newUserId: userData.id
        })
      })
      .then(response => {
        if (response.ok) {
          console.log('[Auth Context] Referral processed successfully');
          sessionStorage.removeItem('referral_code');
        } else {
          console.warn('[Auth Context] Failed to process referral on login');
        }
      })
      .catch(error => {
        console.error('[Auth Context] Error processing referral on login:', error);
      });
    }
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