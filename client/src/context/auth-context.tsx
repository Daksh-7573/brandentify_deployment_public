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
import { auth, googleProvider } from "@/lib/firebase";
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

  // Check for authentication on mount and when redirect result is available
  useEffect(() => {
    setIsLoading(true);
    console.log("AuthProvider useEffect running - checking auth state");
    
    // Clear demo mode from localStorage to ensure Firebase auth is used
    localStorage.removeItem('demoMode');
    
    // Check if we're on the problematic domain
    const currentHostname = window.location.hostname;
    const isOnProblemDomain = currentHostname === "25d68c5d-166d-4f92-b5c1-cdfc68146e33-00-2kol6l2kz9i0s.picard.replit.dev";
    
    if (isOnProblemDomain) {
      console.log("On problematic domain, ensuring correct auth handling");
    }
    
    // First check for redirect result - this handles when users are redirected back after Google auth
    const checkRedirectResult = async () => {
      try {
        console.log("Checking for redirect result from Google auth");
        
        // getRedirectResult() checks if this page load is the result of a redirect from Google
        const result = await getRedirectResult(auth);
        
        if (result && result.user) {
          console.log("REDIRECT result found! User signed in via redirect:", {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName
          });
          
          // First create or update the user in our backend
          console.log("Creating/updating user in backend after redirect");
          const backendUser = await createOrUpdateUserInBackend(result.user);
          
          if (backendUser) {
            console.log("User created/updated in backend successfully after redirect");
            
            // Fetch complete user data from backend
            console.log("Fetching user data after redirect");
            // Check for Google provider data to get email
            const googleProvider = result.user.providerData?.find(provider => 
              provider.providerId === "google.com"
            );
            const userEmail = googleProvider?.email || result.user.email;
            
            console.log("Using Google email for data lookup if available:", userEmail);
            const userData = await fetchUserData(result.user.uid, userEmail);
            
            if (userData) {
              console.log("Setting user state with backend data after redirect");
              setUser(userData);
              toast({
                title: "Signed in successfully",
                description: `Welcome${userData.name ? ` ${userData.name}` : ''}!`,
              });
              
              // Clear any auth attempt markers
              localStorage.removeItem('authAttemptInProgress');
              localStorage.removeItem('authAttemptTime');
              
              // Important: Return early to avoid the auth state listener processing the same user
              setIsLoading(false);
              return true;
            }
          }
          
          // If backend operations failed, use Google data as last resort
          console.log("Using Google/Firebase data as fallback after redirect");
          
          // Check for Google provider data
          const isGoogleProvider = result.user.providerData && 
            result.user.providerData.some(provider => provider.providerId === "google.com");
          
          const googleProvider = isGoogleProvider ? 
            result.user.providerData.find(provider => provider.providerId === "google.com") : null;
          
          console.log("Google provider data available:", !!googleProvider);
          
          const fallbackUser = {
            uid: result.user.uid,
            id: parseInt(result.user.uid.substring(0, 5), 36) || 999,
            username: googleProvider?.email?.split('@')[0] || result.user.uid.substring(0, 8),
            email: googleProvider?.email || result.user.email,
            name: googleProvider?.displayName || result.user.displayName,
            photoURL: googleProvider?.photoURL || result.user.photoURL
          };
          
          setUser(fallbackUser);
          toast({
            title: "Signed in with limited data",
            description: `Welcome${fallbackUser.name ? ` ${fallbackUser.name}` : ''}!`,
          });
          
          // Clear any auth attempt markers
          localStorage.removeItem('authAttemptInProgress');
          localStorage.removeItem('authAttemptTime');
          
          setIsLoading(false);
          return true;
        } else {
          console.log("No redirect result found - this is a normal page load, not a redirect callback");
          return false;
        }
      } catch (error) {
        console.error("Error checking redirect result:", error);
        
        // Log detailed error information for debugging
        logAuthError(error, "checkRedirectResult");
        
        toast({
          title: "Authentication error",
          description: "Error processing Google redirect. Please try again.",
          variant: "destructive"
        });
        return false;
      }
    };
    
    // Check for redirect result and then set up auth state listener
    checkRedirectResult().then((redirectHandled) => {
      console.log("Redirect check completed, handled:", redirectHandled);
      
      // If redirect was handled, we don't need to process the auth state again
      if (redirectHandled) return;
      
      // Set up auth state listener
      console.log("Setting up auth state listener");
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        console.log("Auth state changed:", firebaseUser ? "User signed in" : "User signed out");
        
        if (firebaseUser) {
          // User is signed in 
          try {
            // Only update if we don't already have this user
            if (!user || user.uid !== firebaseUser.uid) {
              console.log("New user detected in auth state, handling login for:", firebaseUser.uid, {
                email: firebaseUser.email,
                displayName: firebaseUser.displayName
              });
              
              // Clear any auth attempt markers since we have a successful sign-in
              localStorage.removeItem('authAttemptInProgress');
              localStorage.removeItem('authAttemptTime');
              
              // First, try to create or update the user in our backend
              console.log("Creating/updating user in backend from auth state change");
              await createOrUpdateUserInBackend(firebaseUser);
              
              // Then get user data from backend 
              console.log("Fetching user data from backend");
              
              // Check for Google provider data to get email
              const googleProvider = firebaseUser.providerData?.find(provider => 
                provider.providerId === "google.com"
              );
              const userEmail = googleProvider?.email || firebaseUser.email;
                
              console.log(`Fetching user data for user ID: ${firebaseUser.uid}${userEmail ? ` with email: ${userEmail}` : ''}`);
              const userData = await fetchUserData(firebaseUser.uid, userEmail);
              
              if (userData) {
                console.log("Setting user state with backend data");
                setUser(userData);
                
                // Only show toast if this is a new login (not a page refresh)
                if (!user) {
                  toast({
                    title: "Signed in successfully",
                    description: `Welcome${userData.name ? ` ${userData.name}` : ''}!`,
                  });
                }
              } else {
                // Last resort - use Firebase data
                console.warn("Could not get user data from backend, using Firebase data as last resort");
                
                // Check for Google provider data
                const isGoogleProvider = firebaseUser.providerData && 
                  firebaseUser.providerData.some(provider => provider.providerId === "google.com");
                
                const googleProvider = isGoogleProvider ? 
                  firebaseUser.providerData.find(provider => provider.providerId === "google.com") : null;
                
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
                    title: "Signed in with limited data",
                    description: `Welcome${fallbackUser.name ? ` ${fallbackUser.name}` : ''}!`,
                  });
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
      
      // Ensure we clean up the auth state listener
      return () => unsubscribe();
    });
  }, [user, toast]);

  // Sign in with Google - using fallback authentication methods if needed
  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      
      // Clear previous auth state
      localStorage.removeItem('auth_redirect_attempt');
      localStorage.removeItem('auth_redirect_time');
      localStorage.removeItem('popup_auth_attempt');
      localStorage.removeItem('popup_auth_time');
      
      console.log("Starting Google sign-in with direct Google Authentication");
      
      // Create a dedicated Google provider configured for Google authentication
      const googleProvider = new GoogleAuthProvider();
      
      // Add extensive scopes to ensure we get complete Google profile data
      googleProvider.addScope('email');
      googleProvider.addScope('profile');
      googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
      
      // Force Google account selection with these critical parameters
      googleProvider.setCustomParameters({
        prompt: 'select_account',
        // Force reauthentication to ensure Google account selection appears
        auth_type: 'reauthenticate',
        // Additional parameters to ensure Google authentication
        access_type: 'offline',
        include_granted_scopes: 'true'
      });
      
      console.log("Configured Google provider with all required parameters");
      
      // Track this as an explicit Google authentication attempt
      localStorage.setItem('using_google_auth', 'true');
      
      let result;
      
      try {
        // Check if we should use redirect-based auth based on environment
        const shouldUseRedirect = shouldUseRedirectAuth();
        const domainIsReplit = isReplitDomain();
        
        console.log("Auth environment:", {
          domain: window.location.hostname,
          isReplitDomain: domainIsReplit,
          usingRedirect: shouldUseRedirect
        });
        
        // Create an enhanced Google provider with optimized parameters
        const enhancedProvider = createEnhancedGoogleProvider();
        
        if (shouldUseRedirect) {
          // Use redirect for Replit domains - this works better with Replit's development domains
          console.log("Using redirect method for reliable authentication");
          
          // Track this authentication attempt
          localStorage.setItem('auth_redirect_attempt', 'true');
          localStorage.setItem('auth_redirect_time', Date.now().toString());
          localStorage.setItem('dev_auth_redirect', 'true');
          
          // Clear any stale auth data
          clearAuthStorageData();
          
          // Use our enhanced provider with redirect
          await signInWithRedirect(auth, enhancedProvider);
          console.log("Redirect initiated - page will reload after Google authentication");
          return; // Function will exit here and auth will continue after redirect
        } else {
          // For other domains, try popup with enhanced provider
          console.log("Using Google authentication popup with enhanced parameters");
          result = await signInWithPopup(auth, enhancedProvider);
          
          // Verify this was actually a Google authentication
          const credential = GoogleAuthProvider.credentialFromResult(result);
          if (credential && credential.providerId === 'google.com') {
            console.log("Confirmed authentic Google authentication");
          } else {
            console.warn("Authentication succeeded but may not be Google-based");
          }
        }
      } catch (popupError: any) {
        console.log("Google authentication failed:", popupError.code);
        console.error("Error details:", popupError);
        
        // For specific errors that suggest UI issues, try redirect method
        if (
          popupError.code === 'auth/popup-blocked' || 
          popupError.code === 'auth/popup-closed-by-user' ||
          popupError.code === 'auth/cancelled-popup-request' ||
          popupError.code === 'auth/internal-error' ||
          popupError.code === 'auth/network-request-failed' ||
          // Handle any Firebase auth errors on Replit domains with redirect
          (isReplitDomain() && popupError.code?.startsWith('auth/'))
        ) {
          console.log("Falling back to Google redirect authentication with enhanced parameters");
          
          // Clear any stale auth data
          clearAuthStorageData();
          
          // Track redirect attempt
          localStorage.setItem('auth_redirect_attempt', 'true');
          localStorage.setItem('auth_redirect_time', Date.now().toString());
          localStorage.setItem('dev_auth_redirect', 'true');
          
          // Always use the enhanced provider for redirects
          const enhancedProvider = createEnhancedGoogleProvider();
          await signInWithRedirect(auth, enhancedProvider);
          
          console.log("Redirect initiated after popup failure - page will reload after authentication");
          return; // Page will reload after redirect
        } else {
          // Log detailed error information for non-standard errors
          console.error("Non-standard authentication error:", popupError);
          
          // Suggest using the dev-login page if on a Replit domain
          if (isReplitDomain()) {
            toast({
              title: "Authentication Error",
              description: "Having trouble with Google login? Try using the special dev-login page instead.",
              variant: "destructive",
              action: (
                <a href="/dev-login" className="bg-blue-600 text-white px-3 py-1 rounded text-xs">
                  Dev Login
                </a>
              )
            });
            
            // Navigate user to the dev-login page automatically after a brief delay
            setTimeout(() => {
              window.location.href = '/dev-login';
            }, 3000);
            
            setIsLoading(false);
            return; // Exit early without re-throwing
          } else {
            // For non-Replit domains, show a more general error
            toast({
              title: "Google Authentication Failed",
              description: "Please try again or contact support if the issue persists.",
              variant: "destructive"
            });
          }
          
          // Re-throw error for general case
          throw popupError;
        }
      }
      
      console.log("Google authentication successful:", result.user);
      
      if (result.user) {
        // Create or update the user in the backend
        console.log("Creating/updating user in backend after successful authentication");
        await createOrUpdateUserInBackend(result.user);
        
        // Fetch the complete user data from backend
        console.log("Fetching user data from backend");
        
        // Check for Google provider data to get email
        const googleProvider = result.user.providerData?.find(provider => 
          provider.providerId === "google.com"
        );
        const userEmail = googleProvider?.email || result.user.email;
        
        console.log(`Fetching user data with Google email if available: ${userEmail || 'not available'}`);
        const userData = await fetchUserData(result.user.uid, userEmail);
        
        if (userData) {
          // Set the user in state if we got valid data
          console.log("Setting user state with backend data");
          setUser(userData);
          
          // Show welcome toast
          toast({
            title: "Signed in successfully",
            description: `Welcome${userData.name ? ` ${userData.name}` : ''}!`,
          });
        } else {
          // If we couldn't get user data from backend, use a minimal representation
          console.warn("Could not get user data from backend after authentication");
          
          // Check for Google provider data
          const isGoogleProvider = result.user.providerData && 
            result.user.providerData.some(provider => provider.providerId === "google.com");
          
          const googleProvider = isGoogleProvider ? 
            result.user.providerData.find(provider => provider.providerId === "google.com") : null;
            
          // Create a fallback user with Google data when available
          const fallbackUser = {
            uid: result.user.uid,
            id: parseInt(result.user.uid.substring(0, 5), 36) || 999,
            username: googleProvider?.email?.split('@')[0] || result.user.uid,
            email: googleProvider?.email || result.user.email,
            name: googleProvider?.displayName || result.user.displayName,
            photoURL: googleProvider?.photoURL || result.user.photoURL
          };
          
          setUser(fallbackUser);
          
          toast({
            title: "Signed in with limited data",
            description: "Welcome! Some profile data may be missing.",
          });
        }
      }
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      
      // Log detailed error information for debugging
      logAuthError(error, "signInWithGoogle");
      
      // Check for specific errors and show helpful messages
      let errorMessage = "There was a problem with Google sign-in. Please try again.";
      
      if (error.code === 'auth/popup-blocked') {
        errorMessage = "The login popup was blocked by your browser. Please allow popups for this site.";
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Sign-in was cancelled. Please try again when you're ready.";
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = "Authentication isn't configured for this domain. Please contact support.";
      }
      
      toast({
        title: "Authentication error",
        description: errorMessage,
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
    localStorage.setItem('demoMode', 'true');
    
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
        await firebaseSignOut(auth);
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