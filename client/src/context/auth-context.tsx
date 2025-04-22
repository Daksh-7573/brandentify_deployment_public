import { createContext, useState, useEffect, ReactNode, useContext } from "react";
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
  id: number;
  username: string;
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
  signInWithGoogle: () => Promise<void>;
  signInWithPhone: (user: User) => void; // Function for phone authentication
  signInWithEmail: (user: User) => void; // Function for email authentication
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
};

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Set to true initially
  const { toast } = useToast();

  // Fetch user data from our backend - used for both initial load and refreshes
  const fetchUserData = async (userId: string | number) => {
    try {
      console.log(`Fetching user data for user ID: ${userId}`);
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
      
    // Remove any demo mode flags if they exist
    localStorage.removeItem('demoMode');
      
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      
      if (firebaseUser) {
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
              id: parseInt(firebaseUser.uid.substring(0, 5), 36) || 999,
              username: firebaseUser.uid.substring(0, 8),
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
            id: parseInt(firebaseUser.uid.substring(0, 5), 36) || 999,
            username: firebaseUser.uid.substring(0, 8),
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL
          });
        }
      } else {
        console.log("Auth state changed: User signed out");
        
        // Clear user state
        setUser(null);
        
        // Clear all query cache to prevent stale data
        queryClient.clear();
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
            id: parseInt(result.user.uid.substring(0, 5), 36) || 999,
            username: result.user.uid.substring(0, 8),
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
        id: userData.id,
        username: userData.username || userData.id.toString().substring(0, 8),
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
        id: userData.id,
        username: userData.username || userData.id.toString().substring(0, 8),
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
      // Clear user state explicitly before Firebase signout
      setUser(null);
      
      // Clear query client cache
      queryClient.clear();
      
      // Then sign out from Firebase
      await firebaseSignOut(auth);
      
      // Add a brief delay to allow state updates to propagate
      setTimeout(() => {
        // Force a page reload to ensure all auth state is cleared
        window.location.href = "/";
      }, 100);
      
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

  // Add the refreshUserData function to update user profile data
  const refreshUserData = async () => {
    // Get the user ID
    const userId = user?.uid;
    
    if (!userId) {
      console.log("Cannot refresh user data: No user ID available");
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Refreshing user data with ID:", userId);
      
      // Invalidate the user data query to ensure fresh data on next fetch - using consistent array format
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId] });
      
      // Fetch latest user data from the backend
      const updatedUser = await fetchUserData(userId);
      if (updatedUser) {
        setUser(updatedUser);
        console.log("Updated user state with fresh data:", updatedUser);
      }
      
      // Also invalidate other related queries for the profile components using consistent array format
      console.log("Refreshing profile data queries");
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'resume'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'experiences'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'educations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'skills'] });
      
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
            
            // Update the user data cache with consistent array format
            queryClient.setQueryData(['/api/users', userId], userData);
          } else {
            console.error(`Failed to fetch user data for ID ${userId}:`, userResponse.statusText);
          }
        } catch (userFetchError) {
          console.error("Error fetching user profile data:", userFetchError);
        }
        
        // For other data, we need to make sure we're using the correct user ID
        // We need the numeric ID for backend queries
        const backendUserId = user?.id || (parseInt(userId.toString().substring(0, 5), 36) || 999);
        
        // Fetch resume data
        try {
          const resumeResponse = await fetch(`/api/users/${backendUserId}/resume`, {
            method: 'GET',
            headers: { 'Cache-Control': 'no-cache, no-store' }
          });
          
          if (resumeResponse.ok) {
            const resumeData = await resumeResponse.json();
            console.log(`Successfully fetched resume data:`, resumeData);
            queryClient.setQueryData(['/api/users', backendUserId, 'resume'], resumeData);
          }
        } catch (resumeFetchError) {
          console.error("Error fetching resume data:", resumeFetchError);
        }
        
        // Fetch experiences data
        try {
          const expResponse = await fetch(`/api/users/${backendUserId}/experiences`, {
            method: 'GET',
            headers: { 'Cache-Control': 'no-cache, no-store' }
          });
          
          if (expResponse.ok) {
            const expData = await expResponse.json();
            console.log(`Successfully fetched experiences data:`, expData);
            queryClient.setQueryData(['/api/users', backendUserId, 'experiences'], expData);
          }
        } catch (expFetchError) {
          console.error("Error fetching experiences data:", expFetchError);
        }
        
        // Fetch educations data
        try {
          const eduResponse = await fetch(`/api/users/${backendUserId}/educations`, {
            method: 'GET',
            headers: { 'Cache-Control': 'no-cache, no-store' }
          });
          
          if (eduResponse.ok) {
            const eduData = await eduResponse.json();
            console.log(`Successfully fetched educations data:`, eduData);
            queryClient.setQueryData([`/api/users/${backendUserId}/educations`], eduData);
          }
        } catch (eduFetchError) {
          console.error("Error fetching educations data:", eduFetchError);
        }
        
        // Fetch skills data
        try {
          const skillsResponse = await fetch(`/api/users/${backendUserId}/skills`, {
            method: 'GET',
            headers: { 'Cache-Control': 'no-cache, no-store' }
          });
          
          if (skillsResponse.ok) {
            const skillsData = await skillsResponse.json();
            console.log(`Successfully fetched skills data:`, skillsData);
            queryClient.setQueryData([`/api/users/${backendUserId}/skills`], skillsData);
          }
        } catch (skillsFetchError) {
          console.error("Error fetching skills data:", skillsFetchError);
        }
        
        // Fetch portfolios
        try {
          const portfoliosResponse = await fetch(`/api/users/${backendUserId}/portfolio`, {
            method: 'GET',
            headers: { 'Cache-Control': 'no-cache, no-store' }
          });
          
          if (portfoliosResponse.ok) {
            const portfoliosData = await portfoliosResponse.json();
            console.log(`Successfully fetched portfolio data:`, portfoliosData);
            queryClient.setQueryData([`/api/users/${backendUserId}/portfolio`], portfoliosData);
          }
        } catch (portfoliosFetchError) {
          console.error("Error fetching portfolio data:", portfoliosFetchError);
        }
        
        // Fetch projects
        try {
          const projectsResponse = await fetch(`/api/users/${backendUserId}/projects`, {
            method: 'GET',
            headers: { 'Cache-Control': 'no-cache, no-store' }
          });
          
          if (projectsResponse.ok) {
            const projectsData = await projectsResponse.json();
            console.log(`Successfully fetched projects data:`, projectsData);
            queryClient.setQueryData([`/api/users/${backendUserId}/projects`], projectsData);
          }
        } catch (projectsFetchError) {
          console.error("Error fetching projects data:", projectsFetchError);
        }
        
        // Fetch services
        try {
          const servicesResponse = await fetch(`/api/users/${backendUserId}/services`, {
            method: 'GET',
            headers: { 'Cache-Control': 'no-cache, no-store' }
          });
          
          if (servicesResponse.ok) {
            const servicesData = await servicesResponse.json();
            console.log(`Successfully fetched services data:`, servicesData);
            queryClient.setQueryData([`/api/users/${backendUserId}/services`], servicesData);
          }
        } catch (servicesFetchError) {
          console.error("Error fetching services data:", servicesFetchError);
        }
      } catch (error) {
        console.error("Error manually refreshing data:", error);
      }
      
      toast({
        title: "Profile refreshed",
        description: "Your profile data has been refreshed"
      });
    } catch (error) {
      console.error("Error refreshing user data:", error);
      toast({
        title: "Refresh failed",
        description: "Failed to refresh your profile data",
        variant: "destructive"
      });
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
        signInWithGoogle,
        signInWithPhone,
        signInWithEmail,
        signOut,
        refreshUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}