import { createContext, useState, useEffect, ReactNode } from "react";
import { 
  signInWithRedirect,
  signInWithPopup,
  getRedirectResult,
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  User as FirebaseUser 
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User } from "@shared/schema";

type AuthUser = {
  uid: string;
  email: string | null;
  name: string | null;
  photoURL: string | null;
  title?: string;
  location?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithPhone: (user: User) => void; // Function for phone authentication
  signInWithEmail: (user: User) => void; // Function for email authentication
  signOut: () => Promise<void>;
  enterDemoMode: () => void;
  refreshUserData: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isDemoMode: false,
  signInWithGoogle: async () => {},
  signInWithPhone: () => {},
  signInWithEmail: () => {},
  signOut: async () => {},
  enterDemoMode: () => {},
  refreshUserData: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Set to true initially
  const [isDemoMode, setIsDemoMode] = useState(false);
  const { toast } = useToast();

  // Fetch user data from our backend - used for both initial load and refreshes
  const fetchUserData = async (userId: string | number, isDemo: boolean = false) => {
    try {
      console.log(`Fetching user data for user ID: ${userId}, isDemo: ${isDemo}`);
      const response = await apiRequest('GET', `/api/users/${userId}`);
      
      if (response.status === 404) {
        console.log('User not found in backend');
        return null;
      }
      
      const userData = await response.json();
      console.log('Backend user data:', userData);
      
      // Create a user with data from our backend
      return {
        uid: userId.toString(),
        email: userData.email || (isDemo ? 'demo@brandentifier.com' : null),
        name: userData.name || (isDemo ? 'Demo User' : null),
        photoURL: userData.photoURL || null,
        title: userData.title || (isDemo ? 'Software Engineer' : undefined),
        location: userData.location || (isDemo ? 'San Francisco, CA' : undefined)
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (isDemo) {
        // Fallback to default demo user if API fails
        return {
          uid: '1',
          email: 'demo@brandentifier.com',
          name: 'Demo User',
          photoURL: null,
          title: 'Software Engineer',
          location: 'San Francisco, CA'
        };
      }
      return null;
    }
  };

  // Specialized function for demo user data
  const fetchDemoUserData = async () => {
    const demoUser = await fetchUserData(1, true);
    if (demoUser) {
      setUser(demoUser);
    }
  };

  useEffect(() => {
    // Check for redirect result
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          // User signed in after redirect
          toast({
            title: "Successfully signed in!",
            description: "Welcome to Brandentifier"
          });
        }
      })
      .catch((error: any) => {
        console.error("Error getting redirect result:", error);
        
        // More informative error message
        let errorMessage = "There was a problem signing in with Google";
        
        if (error.code === 'auth/configuration-not-found') {
          errorMessage = "Firebase authentication is not properly configured. Please check your Firebase setup in the console.";
          console.log("Firebase auth domain:", `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`);
          console.log("Current domain:", window.location.hostname);
        } else if (error.code === 'auth/unauthorized-domain') {
          errorMessage = "This domain is not authorized for Firebase authentication. Please add it to your Firebase console under Auth > Settings > Authorized domains.";
        } else if (error.message) {
          errorMessage = `Error: ${error.message}`;
        }
        
        toast({
          title: "Sign in failed",
          description: errorMessage,
          variant: "destructive"
        });
      });
      
    // Check if we were in demo mode before a page reload
    const storedDemoMode = localStorage.getItem('demoMode') === 'true';
    if (storedDemoMode) {
      console.log("Restoring demo mode after reload");
      setIsDemoMode(true);
      // Fetch actual user data if it exists
      fetchDemoUserData();
    }
      
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      
      if (firebaseUser && !storedDemoMode) {
        try {
          // First create or update the user in our backend
          await createOrUpdateUserInBackend(firebaseUser);
          
          // Then fetch the complete user data from our backend to get 
          // the latest profile picture and other information
          const backendUserData = await fetchUserData(firebaseUser.uid);
          
          // If we got data from backend, use it
          if (backendUserData) {
            setUser(backendUserData);
          } else {
            // Fallback to Firebase data if backend fetch fails
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL
            });
          }
        } catch (error) {
          console.error("Error during authentication flow:", error);
          // Fallback to basic Firebase data
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL
          });
        }
      } else if (!storedDemoMode) {
        // Only clear user if we're not in demo mode
        setUser(null);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const createOrUpdateUserInBackend = async (firebaseUser: FirebaseUser) => {
    try {
      // Check if user exists first
      const response = await apiRequest('POST', '/api/users', {
        username: firebaseUser.uid,
        email: firebaseUser.email || `${firebaseUser.uid}@example.com`,
        name: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL
      });
      
      return await response.json();
    } catch (error) {
      console.error("Error creating/updating user:", error);
      return null;
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      // Log Firebase configuration for debugging
      console.log("Firebase config:", {
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
        hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
        hasAppId: !!import.meta.env.VITE_FIREBASE_APP_ID
      });
      
      // Add some scopes for Google auth
      googleProvider.addScope('email');
      googleProvider.addScope('profile');
      
      // Try popup instead of redirect
      console.log("Attempting Google sign-in with popup...");
      const result = await signInWithPopup(auth, googleProvider);
      
      // If we get here, popup was successful
      console.log("Google sign-in successful:", result.user);
      
      if (result.user) {
        // Create or update user in our backend
        await createOrUpdateUserInBackend(result.user);
        
        // Now fetch the complete user data from our backend
        const backendUserData = await fetchUserData(result.user.uid);
        
        // If we got data from backend, use it
        if (backendUserData) {
          setUser(backendUserData);
        } else {
          // Fallback to Firebase data if backend fetch fails
          setUser({
            uid: result.user.uid,
            email: result.user.email,
            name: result.user.displayName,
            photoURL: result.user.photoURL
          });
        }
        
        toast({
          title: "Successfully signed in!",
          description: "Welcome to Brandentifier"
        });
      }
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      
      // More informative error message
      let errorMessage = "There was a problem signing in with Google";
      
      if (error.code === 'auth/configuration-not-found') {
        errorMessage = "Firebase authentication is not properly configured. Please check your Firebase setup in the console.";
        console.log("Detailed error:", error);
      } else if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Sign-in popup was blocked or closed. Please try again.";
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = "This domain is not authorized for Firebase authentication. Please add it to your Firebase console under Auth > Settings > Authorized domains.";
        console.log("Current domain:", window.location.hostname);
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Phone auth implementation
  const signInWithPhone = (userData: User) => {
    setIsLoading(true);
    
    try {
      // Convert database user to our AuthUser type
      setUser({
        uid: userData.id.toString(),
        email: userData.email,
        name: userData.name,
        photoURL: userData.photoURL,
        title: userData.title || undefined,
        location: userData.location || undefined
      });
      
      toast({
        title: "Phone verified successfully",
        description: "Welcome to Brandentifier"
      });
    } catch (error) {
      console.error("Error signing in with phone:", error);
      toast({
        title: "Sign in failed",
        description: "There was a problem signing in with phone verification",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Email auth implementation
  const signInWithEmail = (userData: User) => {
    setIsLoading(true);
    
    try {
      console.log("signInWithEmail received userData:", userData);
      
      if (!userData || !userData.id) {
        throw new Error("Invalid user data received");
      }
      
      // Convert database user to our AuthUser type
      setUser({
        uid: userData.id.toString(),
        email: userData.email,
        name: userData.name,
        photoURL: userData.photoURL,
        title: userData.title || undefined,
        location: userData.location || undefined
      });
      
      toast({
        title: "Login successful",
        description: "Welcome to Brandentifier"
      });
    } catch (error) {
      console.error("Error signing in with email:", error);
      toast({
        title: "Sign in failed",
        description: "There was a problem signing in with email and password",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const signOut = async () => {
    try {
      if (isDemoMode) {
        // Clear demo mode from localStorage
        localStorage.removeItem('demoMode');
        setIsDemoMode(false);
        setUser(null);
        toast({
          title: "Exited demo mode"
        });
        return;
      }
      
      await firebaseSignOut(auth);
      toast({
        title: "Signed out successfully"
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Sign out failed",
        description: "There was a problem signing out",
        variant: "destructive"
      });
    }
  };

  const enterDemoMode = async () => {
    setIsLoading(true);
    
    // Store demo mode status in localStorage for persistence across reloads
    localStorage.setItem('demoMode', 'true');
    
    // Try to fetch demo user data
    await fetchDemoUserData();
    
    setIsDemoMode(true);
    setIsLoading(false);
    
    toast({
      title: "Demo mode activated",
      description: "You're now using Brandentifier in demo mode"
    });
  };

  // Add the refreshUserData function to update user profile data
  const refreshUserData = async () => {
    // Get the user ID
    const userId = isDemoMode ? 1 : (user?.uid ? user.uid : null);
    
    if (!userId) {
      console.log("Cannot refresh user data: No user ID available");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Fetch latest user data from the backend
      if (isDemoMode) {
        await fetchDemoUserData();
      } else {
        const updatedUser = await fetchUserData(userId);
        if (updatedUser) {
          setUser(updatedUser);
        }
      }
      
      // Also invalidate and immediately refetch all related queries for the profile components
      console.log("Refreshing profile data queries");
      
      // Reset the entire query cache
      queryClient.clear();
      
      // Manually fetch ALL data directly using fetch API to bypass any caching
      try {
        console.log("Manually fetching all profile data using direct API requests");
        
        // First, let's try to get the user's profile data directly
        try {
          const userResponse = await fetch(`/api/users/${userId}`, {
            method: 'GET',
            headers: { 'Cache-Control': 'no-cache, no-store' }
          });
          
          // If the user is found, update the cache
          if (userResponse.ok) {
            const userData = await userResponse.json();
            console.log(`Successfully fetched user data:`, userData);
            
            // Update the user data cache
            queryClient.setQueryData([`/api/users/${userId}`], userData);
          } else {
            console.error(`Failed to fetch user data for ID ${userId}:`, userResponse.statusText);
          }
        } catch (userFetchError) {
          console.error("Error fetching user profile data:", userFetchError);
        }
        
        // For other data, use numeric user ID
        // Convert user ID to number for API calls (if it's a Firebase UID, use 0 as placeholder)
        const numericUserId = isDemoMode ? 1 : 0;
        
        // Add manual fetch to ensure we get the latest data
        const experiencesResponse = await fetch(`/api/users/${numericUserId}/experiences`, {
          method: 'GET',
          headers: { 'Cache-Control': 'no-cache, no-store' }
        });
        
        const educationsResponse = await fetch(`/api/users/${numericUserId}/educations`, {
          method: 'GET',
          headers: { 'Cache-Control': 'no-cache, no-store' }
        });
        
        const skillsResponse = await fetch(`/api/users/${numericUserId}/skills`, {
          method: 'GET',
          headers: { 'Cache-Control': 'no-cache, no-store' }
        });
        
        // Get the responses as JSON
        const experiences = await experiencesResponse.json();
        const educations = await educationsResponse.json();
        const skills = await skillsResponse.json();
        
        // Log the fetched data
        console.log("Manual fetch experiences:", experiences);
        console.log("Manual fetch educations:", educations);
        console.log("Manual fetch skills:", skills);
        
        // Explicitly set these in the query cache
        queryClient.setQueryData([`/api/users/${numericUserId}/experiences`], experiences);
        queryClient.setQueryData([`/api/users/${numericUserId}/educations`], educations);
        queryClient.setQueryData([`/api/users/${numericUserId}/skills`], skills);
        
        // Give it a small delay to ensure all components receive fresh data
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error("Error during direct manual data refresh:", error);
      }
    } catch (error) {
      console.error("Error during user data refresh:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user || isDemoMode,
        isLoading,
        isDemoMode,
        signInWithGoogle,
        signInWithPhone,
        signInWithEmail,
        signOut,
        enterDemoMode,
        refreshUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
