import { createContext, useState, useEffect, ReactNode, useContext } from "react";
import { 
  signInWithRedirect,
  signInWithPopup,
  getRedirectResult,
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  User as FirebaseUser,
  AuthErrorCodes
} from "firebase/auth";
// Firebase imports will be done dynamically to avoid type issues
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { logDetailedAuthError } from "@/utils/auth-error-logger";
import { logAuthError, checkFirebaseConfig } from "@/utils/auth-diagnostics";
import { 
  createEnhancedGoogleProvider, 
  isReplitDomain, 
  shouldUseRedirectAuth, 
  clearAuthStorageData 
} from "@/utils/auth-popup-fix";

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

  // Enhanced Firebase auth optimization with caching
  useEffect(() => {
    console.log('[Firebase Auth] Initializing with cached state optimization');
    const startTime = performance.now();
    
    // Check for cached auth state for immediate load
    const cachedAuth = (window as any).__brandentifier_cached_auth?.();
    if (cachedAuth) {
      console.log('[PERF] Using cached auth state for instant load');
      setUser(cachedAuth);
      setIsLoading(false);
      
      // Background refresh to ensure data is current
      fetchUserData(cachedAuth.uid || cachedAuth.id, cachedAuth.email).then(userData => {
        if (userData) {
          setUser(userData);
          // Update cache with fresh data
          try {
            // Removed localStorage auth cache for cleaner user experience
          } catch (e) {
            console.warn('[Cache] Failed to update auth cache:', e);
          }
        }
      }).catch(err => {
        console.warn('[Auth] Background refresh failed:', err);
      });
    } else {
      console.log('[Firebase Auth] No cached state, initializing fresh');
      setIsLoading(false);
    }
    
    console.log(`[PERF] Auth context initialization: ${(performance.now() - startTime).toFixed(2)}ms`);
  }, []);

  // Fetch user data from our backend
  const fetchUserData = async (userId: string | number, userEmail?: string): Promise<AuthUser | null> => {
    try {
      // Check if this is a Google/Firebase user
      const isGoogleIdentifier = typeof userId === 'string' && 
        (userId.includes('@') && userId.split('@')[1].includes('.'));
      const isFirebaseUid = typeof userId === 'string' && userId.length > 20;
      const isGoogleEmail = userEmail && userEmail.includes('@gmail.com');
      
      console.log(`Fetching user data for user ${isGoogleIdentifier ? 'email' : (isFirebaseUid ? 'Firebase UID' : 'ID')}: ${userId}`);
      console.log(`Google authentication detected: ${isGoogleEmail}`);
      
      // Include email as query parameter if provided, to help with Google authentication
      let url = `/api/users/${userId}`;
      if (userEmail) {
        console.log(`Including email in user lookup: ${userEmail}`);
        url += `?email=${encodeURIComponent(userEmail)}`;
      }
      
      // Try to fetch user data
      const response = await apiRequest('GET', url);
      
      if (response.status === 404) {
        console.log('User not found in backend by direct ID lookup');
        
        // If email is available but wasn't in the URL yet, try again with email
        if (userEmail && !url.includes('email=')) {
          console.log(`Trying again with email parameter: ${userEmail}`);
          const retryResponse = await apiRequest('GET', `/api/users/${userId}?email=${encodeURIComponent(userEmail)}`);
          
          if (retryResponse.status === 404) {
            console.log('User not found even with email parameter');
            return null;
          }
          
          const userData = await retryResponse.json();
          console.log('Backend user data (found with email parameter):', userData);
          
          // If the user has a generic "Firebase User" name but we're using a Google account, try to update
          if (isGoogleEmail && userData.name === "Firebase User") {
            console.log("Found Firebase User for Google account - will attempt to update with Google profile data");
            
            try {
              // Get the current Firebase user  
              const { auth } = await import('@/lib/firebase');
              const currentUser = auth.currentUser;
              if (currentUser) {
                // Try to get Google provider data
                const googleProviderData = currentUser.providerData?.find((provider: any) => 
                  provider.providerId === "google.com"
                );
                
                if (googleProviderData && googleProviderData.displayName) {
                  console.log("Updating user with Google display name:", googleProviderData.displayName);
                  
                  // Update the user with Google profile data
                  const updateResponse = await apiRequest('PUT', `/api/users/${userData.id}`, {
                    name: googleProviderData.displayName,
                    photoURL: googleProviderData.photoURL || currentUser.photoURL
                  });
                  
                  if (updateResponse.ok) {
                    const updatedUser = await updateResponse.json();
                    console.log("User updated with Google data:", updatedUser);
                    
                    // Return the updated user data
                    return {
                      uid: userId.toString(),
                      id: updatedUser.id,
                      username: updatedUser.username,
                      email: updatedUser.email,
                      name: updatedUser.name,
                      photoURL: updatedUser.photoURL || null,
                      title: updatedUser.title,
                      location: updatedUser.location
                    };
                  }
                }
              }
            } catch (updateError) {
              console.error("Error updating user with Google data:", updateError);
              // Continue with original data if update fails
            }
          }
          
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
        }
        
        return null;
      }
      
      const userData = await response.json();
      console.log('Backend user data:', userData);
      
      // If the user has a generic "Firebase User" name but we're using a Google account, try to update
      if (isGoogleEmail && userData.name === "Firebase User") {
        console.log("Found Firebase User for Google account - will attempt to update with Google profile data");
        
        try {
          // Get the current Firebase user
          const currentUser = auth.currentUser;
          if (currentUser) {
            // Try to get Google provider data
            const googleProvider = currentUser.providerData?.find(provider => 
              provider.providerId === "google.com"
            );
            
            if (googleProvider && googleProvider.displayName) {
              console.log("Updating user with Google display name:", googleProvider.displayName);
              
              // Update the user with Google profile data
              const updateResponse = await apiRequest('PUT', `/api/users/${userData.id}`, {
                name: googleProvider.displayName,
                photoURL: googleProvider.photoURL || currentUser.photoURL
              });
              
              if (updateResponse.ok) {
                const updatedUser = await updateResponse.json();
                console.log("User updated with Google data:", updatedUser);
                
                // Return the updated user data
                return {
                  uid: userId.toString(),
                  id: updatedUser.id,
                  username: updatedUser.username,
                  email: updatedUser.email,
                  name: updatedUser.name,
                  photoURL: updatedUser.photoURL || null,
                  title: updatedUser.title,
                  location: updatedUser.location
                };
              }
            }
          }
        } catch (updateError) {
          console.error("Error updating user with Google data:", updateError);
          // Continue with original data if update fails
        }
      }
      
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

  // Create or update a user in our backend
  const createOrUpdateUserInBackend = async (firebaseUser: FirebaseUser) => {
    try {
      // Check if we're logging in with a Google provider
      const isGoogleProvider = firebaseUser.providerData && 
        firebaseUser.providerData.some(provider => provider.providerId === "google.com");
      
      console.log(`Creating/updating user with ${isGoogleProvider ? 'Google' : 'Firebase'} profile:`, {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        providerData: firebaseUser.providerData
      });
      
      // If we have Google provider data, get the first Google provider
      const googleProvider = isGoogleProvider ? 
        firebaseUser.providerData.find(provider => provider.providerId === "google.com") : null;
      
      // Make sure required fields exist and use Google provider data when possible
      const userData = {
        // Use the Google email as username when available, fallback to UID for non-Google accounts
        username: isGoogleProvider && googleProvider?.email ? 
          googleProvider.email.split('@')[0] : firebaseUser.uid,
        
        // Use Google email when available
        email: isGoogleProvider && googleProvider?.email ? 
          googleProvider.email : 
          (firebaseUser.email || `firebase_${firebaseUser.uid.substring(0, 8)}@example.com`),
        
        // Use Google display name when available
        name: isGoogleProvider && googleProvider?.displayName ? 
          googleProvider.displayName : 
          (firebaseUser.displayName || null),
        
        // Use Google photo when available
        photoURL: isGoogleProvider && googleProvider?.photoURL ? 
          googleProvider.photoURL : 
          firebaseUser.photoURL,
          
        // Add additional profile fields
        title: null,
        location: null,
        
        // Pass the display name directly to help with the server-side update
        displayName: isGoogleProvider && googleProvider?.displayName ? 
          googleProvider.displayName : firebaseUser.displayName,
        
        // Include provider data
        provider: isGoogleProvider ? "google.com" : firebaseUser.providerId || "firebase",
        emailVerified: firebaseUser.emailVerified || false,
        
        // For Google accounts, explicitly flag it to enable special handling on the server
        isGoogleAccount: isGoogleProvider
      };
      
      // Create the user
      const response = await apiRequest('POST', '/api/users', userData);
      
      // If the user was created, return the user data from the backend
      if (response.ok) {
        const createdUser = await response.json();
        console.log("User created in backend successfully:", createdUser);
        return createdUser;
      }
      
      // If post fails (likely because user already exists), try updating instead
      console.log("User POST failed, trying to update existing user with PUT");
      const updateResponse = await apiRequest('PUT', `/api/users/${firebaseUser.uid}`, userData);
      
      if (updateResponse.ok) {
        const updatedUser = await updateResponse.json();
        console.log("User updated in backend successfully:", updatedUser);
        return updatedUser;
      }
      
      // If we get here, just fetch the user data instead
      console.log("Falling back to fetching existing user data");
      return await fetchUserData(
        firebaseUser.uid, 
        userData.email // Pass the email as well to help with Google auth
      );
    } catch (error) {
      console.error("Error in createOrUpdateUserInBackend:", error);
      return null;
    }
  };

  // Simplified authentication setup - single source of truth
  useEffect(() => {
    setIsLoading(true);
    console.log("Setting up simplified auth state listener");
    
    // Clear demo mode from localStorage to ensure Firebase auth is used
    localStorage.removeItem('demoMode');
    
    // Set up auth state listener with async import
    const setupAuth = async () => {
      try {
        console.log("Setting up auth state listener...");
        const { auth } = await import('@/lib/firebase');
        
        if (!auth) {
          console.error("Auth object is null - Firebase initialization failed");
          setIsLoading(false);
          return () => {};
        }
        
        // Set up redirect result checking for fallback authentication
        console.log("📍 Setting up authentication result handling for popup and redirect modes");
        
        // Check for redirect results (in case popup fell back to redirect)
        try {
          const { getRedirectResult } = await import('firebase/auth');
          const redirectResult = await getRedirectResult(auth as any);
          
          if (redirectResult?.user) {
            console.log("🎉 REDIRECT RESULT FOUND:", redirectResult.user.email);
            // Don't process here - let onAuthStateChanged handle it
          }
        } catch (redirectError) {
          console.log("No redirect result or redirect error:", redirectError.message);
        }
        
        console.log("Auth object available, setting up listener");
        const { onAuthStateChanged } = await import('firebase/auth');
        const unsubscribe = onAuthStateChanged(auth as any, async (firebaseUser) => {
          console.log("Auth state changed:", firebaseUser ? "User signed in" : "User signed out");
        
        if (firebaseUser) {
        // User is signed in 
        try {
          // Only update if we don't already have this user
          if (!user || user.uid !== firebaseUser.uid) {
            console.log("Processing user authentication:", firebaseUser.uid, {
              email: firebaseUser.email,
              displayName: firebaseUser.displayName
            });
            
            // Clear any auth attempt markers since we have a successful sign-in
            localStorage.removeItem('authAttemptInProgress');
            localStorage.removeItem('authAttemptTime');
            
            // Create or update the user in our backend
            console.log("Creating/updating user in backend");
            await createOrUpdateUserInBackend(firebaseUser);
            
            // Get user data from backend 
            console.log("Fetching user data from backend");
            
            // Check for Google provider data to get email
            const googleProvider = firebaseUser.providerData?.find((provider: any) => 
              provider.providerId === "google.com"
            );
            const userEmail = googleProvider?.email || firebaseUser.email || undefined;
              
            console.log(`Fetching user data for user ID: ${firebaseUser.uid}${userEmail ? ` with email: ${userEmail}` : ''}`);
            const userData = await fetchUserData(firebaseUser.uid, userEmail);
            
            if (userData) {
              console.log("Setting user state with backend data");
              setUser(userData);
              
              // Always show toast for new authentication (check by comparing UIDs)
              const isNewLogin = !user || user.uid !== userData.uid;
              if (isNewLogin) {
                console.log("New login detected, showing welcome message and redirecting");
                toast({
                  title: "Signed in successfully",
                  description: `Welcome ${userData.name || userData.email}!`,
                });
                
                // Clear the auth success flag
                sessionStorage.removeItem('authSuccess');
                
                // Navigate to industry pulse after successful authentication
                console.log("🚀 Navigating to industry pulse after successful authentication");
                console.log("Current path:", window.location.pathname);
                console.log("Current URL:", window.location.href);
                
                // Always redirect to industry pulse after successful auth, regardless of current path
                console.log("✅ Executing immediate redirect to industry pulse");
                // Use multiple redirect methods to ensure it works
                window.history.pushState(null, '', '/industry-pulse');
                window.location.href = '/industry-pulse';
              }
            } else {
              console.log("Creating fallback user");
              
              const fallbackUser = {
                uid: firebaseUser.uid,
                id: parseInt(firebaseUser.uid.substring(0, 5), 36) || 999,
                username: googleProvider?.email?.split('@')[0] || firebaseUser.uid.substring(0, 8),
                email: googleProvider?.email || firebaseUser.email,
                name: googleProvider?.displayName || firebaseUser.displayName,
                photoURL: googleProvider?.photoURL || firebaseUser.photoURL
              };
              
              setUser(fallbackUser);
              
              // Only show toast if this is a new login (not a page refresh)
              if (!user) {
                toast({
                  title: "Signed in successfully",
                  description: `Welcome ${fallbackUser.name || fallbackUser.email}!`,
                });
                
                // Clear the auth success flag
                sessionStorage.removeItem('authSuccess');
                
                // Navigate to industry pulse after successful authentication
                console.log("🚀 Navigating to industry pulse after successful authentication (fallback user)");
                console.log("Current path:", window.location.pathname);
                console.log("Current URL:", window.location.href);
                
                // Always redirect to industry pulse after successful auth (fallback user)
                console.log("✅ Executing immediate redirect to industry pulse (fallback)");
                // Use multiple redirect methods to ensure it works
                window.history.pushState(null, '', '/industry-pulse');
                window.location.href = '/industry-pulse';
              }
            }
          }
        } catch (error) {
          console.error("Error in auth state change handler:", error);
          logAuthError(error, "onAuthStateChanged");
        }
      } else {
        // User is signed out
        if (user) {
          console.log("User signed out, clearing state");
          setUser(null);
          
          toast({
            title: "Signed out",
            description: "You have been signed out successfully.",
          });
        }
      }
      
      setIsLoading(false);
        });
        
        console.log("Auth state listener set up successfully");
        return unsubscribe;
      } catch (error) {
        console.error("Failed to setup auth listener:", error);
        setIsLoading(false);
        return () => {};
      }
    };
    
    // Setup auth and cleanup
    let unsubscribe: (() => void) | null = null;
    
    setupAuth().then((unsub) => {
      unsubscribe = unsub;
    }).catch((error) => {
      console.error("Failed to setup auth:", error);
      setIsLoading(false);
    });
    
    return () => {
      if (unsubscribe) {
        console.log("Cleaning up auth state listener");
        unsubscribe();
      }
    };
  }, []); // Remove dependencies to prevent listener recreation

  // Sign in with Google - clean implementation
  const signInWithGoogle = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      console.log("Starting Google sign-in");
      
      // Use the globally configured provider from firebase.ts
      const { auth, googleProvider } = await import('@/lib/firebase');
      const { signInWithPopup } = await import('firebase/auth');
      
      console.log("Auth environment:", {
        domain: window.location.hostname,
        isReplitDomain: window.location.hostname.includes('replit'),
        usingPopup: true
      });
      
      // Clear any old auth flags before starting clean authentication
      console.log("🔧 Clearing old auth flags for clean start...");
      sessionStorage.removeItem('redirect_auth_attempt');
      sessionStorage.removeItem('redirect_auth_time');
      sessionStorage.removeItem('redirect_auth_success');
      localStorage.removeItem('redirect_auth_attempt');
      localStorage.removeItem('redirect_auth_time');
      localStorage.removeItem('redirect_auth_success');
      
      console.log("🔧 Old auth flags cleared, ready for clean popup authentication");
      
      // Configure popup with better parameters
      const { GoogleAuthProvider } = await import('firebase/auth');
      const enhancedProvider = new GoogleAuthProvider();
      enhancedProvider.addScope('email');
      enhancedProvider.addScope('profile');
      enhancedProvider.setCustomParameters({
        prompt: 'select_account',
        display: 'popup'
      });

      // Use popup method with enhanced error handling and timeout
      console.log("🚀 Initiating signInWithPopup with enhanced settings...");
      
      // Set up popup with specific dimensions for better UX
      const popupFeatures = 'width=500,height=600,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,directories=no,status=no';
      
      // Use signInWithPopup with custom popup features
      const result = await signInWithPopup(auth as any, enhancedProvider);
      
      if (result && result.user) {
        console.log("🎉 Popup authentication successful:", result.user.email);
        
        // Show success toast immediately
        toast({
          title: "Authentication successful",
          description: `Welcome ${result.user.displayName || result.user.email}!`,
        });
        
        // The onAuthStateChanged listener will handle the rest
        return;
      }
      
      console.log("Popup authentication completed successfully");
      
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      
      // Check for specific popup errors and show helpful messages
      let errorMessage = "There was a problem with Google sign-in. Please try again.";
      
      if (error.code === 'auth/popup-blocked') {
        errorMessage = "The login popup was blocked by your browser. Please allow popups and try again.";
      } else if (error.code === 'auth/popup-closed-by-user') {
        console.log("Popup closed by user - implementing automatic redirect fallback");
        
        // Show a more user-friendly message and automatically try redirect
        toast({
          title: "Popup was closed",
          description: "Switching to redirect authentication...",
          variant: "default",
        });
        
        try {
          console.log("Automatically trying redirect authentication as fallback...");
          const { signInWithRedirect } = await import('firebase/auth');
          const { GoogleAuthProvider } = await import('firebase/auth');
          const redirectProvider = new GoogleAuthProvider();
          redirectProvider.addScope('email');
          redirectProvider.addScope('profile');
          
          await signInWithRedirect(auth as any, redirectProvider);
          return; // Exit here as redirect will handle the rest
        } catch (redirectError) {
          console.error("Redirect fallback also failed:", redirectError);
          errorMessage = "Both popup and redirect authentication failed. Please check your browser settings or try again.";
        }
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = "Authentication isn't configured for this domain. Please contact support.";
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = "Another sign-in popup is already open. Please complete or close it first.";
      }
      
      // Show detailed error message to user
      toast({
        title: "Authentication Error",
        description: `${errorMessage} (Code: ${error.code || 'unknown'})`,
        variant: "destructive"
      });
      
    } finally {
      setIsLoading(false);
    }
  };

  // Demo mode sign in
  const signInWithPhone = (userData: User) => {
    setUser({
      uid: userData.id.toString(),
      id: userData.id,
      username: userData.username,
      email: userData.email,
      name: userData.name,
      photoURL: userData.photoURL,
      title: userData.title || undefined,
      location: userData.location || undefined
    });
    
    setIsDemoMode(true);
    // Removed demoMode localStorage flag for cleaner experience
    
    toast({
      title: "Demo mode activated",
      description: `Welcome ${userData.name || 'to the demo'}!`,
    });
  };

  // Email authentication
  const signInWithEmail = (userData: User) => {
    setUser({
      uid: userData.id.toString(),
      id: userData.id,
      username: userData.username,
      email: userData.email,
      name: userData.name,
      photoURL: userData.photoURL,
      title: userData.title || undefined,
      location: userData.location || undefined
    });
    
    toast({
      title: "Signed in with email",
      description: `Welcome ${userData.name || ''}!`,
    });
  };

  // Sign out
  const signOut = async () => {
    try {
      setIsLoading(true);
      console.log("Performing complete user sign-out and clearing all auth states");
      
      // Clear user state first
      setUser(null);
      
      // Clear demo mode
      setIsDemoMode(false);
      localStorage.removeItem('demoMode');
      
      // Remove all authentication attempts and data
      localStorage.removeItem('authAttemptInProgress');
      localStorage.removeItem('authAttemptTime');
      localStorage.removeItem('auth_state');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_provider');
      localStorage.removeItem('auth_redirect_attempt');
      localStorage.removeItem('auth_redirect_time');
      localStorage.removeItem('popup_auth_attempt');
      localStorage.removeItem('popup_auth_time');
      localStorage.removeItem('using_google_auth');
      
      // Clear any Firebase-specific storage
      localStorage.removeItem('firebase:authUser');
      sessionStorage.removeItem('firebase:authUser');
      
      // Clear all caches to prevent stale data
      queryClient.clear();
      
      // Always sign out from Firebase completely
      try {
        const { auth } = await import('@/lib/firebase');
        await firebaseSignOut(auth as any);
        console.log("Firebase sign-out successful");
      } catch (firebaseError) {
        console.error("Firebase sign-out error:", firebaseError);
        // Continue with local sign-out even if Firebase fails
      }
      
      // This short timeout ensures all Firebase operations complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh user data
  const refreshUserData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Include email in the refresh request to help with Google auth
      const refreshedData = await fetchUserData(user.uid, user.email || undefined);
      
      if (refreshedData) {
        setUser(refreshedData);
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    } finally {
      setIsLoading(false);
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

// Custom hook for using the auth context
export function useAuth() {
  return useContext(AuthContext);
}