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
  const [isLoading, setIsLoading] = useState(false); // Set to false initially
  const [isDemoMode, setIsDemoMode] = useState(false);
  const { toast } = useToast();
  const fetchDemoUserData = async () => {
    try {
      const response = await apiRequest('GET', '/api/users/1');
      const userData = await response.json();
      
      // Create a demo user with real data if available
      setUser({
        uid: '1',
        email: userData.email || 'demo@brandentifier.com',
        name: userData.name || 'Demo User',
        photoURL: userData.photoURL || null,
        title: userData.title || 'Software Engineer',
        location: userData.location || 'San Francisco, CA'
      });
      
      console.log('Successfully fetched demo user data:', userData);
    } catch (error) {
      console.log('Could not fetch user data, using default demo user');
      // Fallback to default demo user if API fails
      setUser({
        uid: '1',
        email: 'demo@brandentifier.com',
        name: 'Demo User',
        photoURL: null,
        title: 'Software Engineer',
        location: 'San Francisco, CA'
      });
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
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setIsLoading(true);
      if (firebaseUser) {
        // Convert Firebase user to our AuthUser type
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        });
        
        // Create or update user in our backend
        createOrUpdateUserInBackend(firebaseUser).catch(error => {
          console.error("Failed to create/update user in backend:", error);
        });
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
      // This is a simplified example - in a real app you'd have proper endpoints
      await apiRequest('POST', '/api/users', {
        username: firebaseUser.uid,
        email: firebaseUser.email || `${firebaseUser.uid}@example.com`,
        name: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL
      });
    } catch (error) {
      console.error("Error creating/updating user:", error);
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
      
      // Convert Firebase user to our AuthUser type
      if (result.user) {
        setUser({
          uid: result.user.uid,
          email: result.user.email,
          name: result.user.displayName,
          photoURL: result.user.photoURL
        });
        
        // Create or update user in our backend
        await createOrUpdateUserInBackend(result.user);
        
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
    
    // Try to fetch the actual user data from the API
    try {
      const response = await apiRequest('GET', '/api/users/1');
      const userData = await response.json();
      
      // Create a demo user with real data if available
      setUser({
        uid: '1',
        email: userData.email || 'demo@brandentifier.com',
        name: userData.name || 'Demo User',
        photoURL: userData.photoURL || null,
        title: userData.title || 'Software Engineer',
        location: userData.location || 'San Francisco, CA'
      });
    } catch (error) {
      console.log('Could not fetch user data, using default demo user');
      // Fallback to default demo user if API fails
      setUser({
        uid: '1',
        email: 'demo@brandentifier.com',
        name: 'Demo User',
        photoURL: null,
        title: 'Software Engineer',
        location: 'San Francisco, CA'
      });
    }
    
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
    const userId = isDemoMode ? 1 : (user?.uid ? parseInt(user.uid) : null);
    
    if (isDemoMode) {
      console.log("Refreshing demo user data");
      await fetchDemoUserData();
      
      // Also invalidate and immediately refetch all related queries for the profile components
      if (userId) {
        console.log("AGGRESSIVE CACHE CLEAR AND DATA REFRESH");
        
        // Reset the entire query cache
        console.log("Completely clearing React Query cache");
        queryClient.clear();
        
        // Manually fetch ALL data directly using fetch API to bypass any caching
        try {
          console.log("Manually fetching all profile data using direct API requests");
          
          // Add manual fetch to ensure we get the latest data
          const experiencesResponse = await fetch(`/api/users/${userId}/experiences`, {
            method: 'GET',
            headers: { 'Cache-Control': 'no-cache, no-store' }
          });
          
          const educationsResponse = await fetch(`/api/users/${userId}/educations`, {
            method: 'GET',
            headers: { 'Cache-Control': 'no-cache, no-store' }
          });
          
          const skillsResponse = await fetch(`/api/users/${userId}/skills`, {
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
          queryClient.setQueryData([`/api/users/${userId}/experiences`], experiences);
          queryClient.setQueryData([`/api/users/${userId}/educations`], educations);
          queryClient.setQueryData([`/api/users/${userId}/skills`], skills);
          
          // Give it a small delay to ensure all components receive fresh data
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error("Error during direct manual data refresh:", error);
        }
      }
      return;
    }
    
    // Handle regular user refresh if needed
    if (user && !isDemoMode) {
      // For non-demo users, we would fetch their profile from our backend
      console.log("Regular user data refresh not implemented");
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
