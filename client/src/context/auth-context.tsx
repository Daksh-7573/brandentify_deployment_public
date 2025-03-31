import { createContext, useState, useEffect, ReactNode } from "react";
import { 
  signInWithRedirect, 
  getRedirectResult,
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  User as FirebaseUser 
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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
  signOut: () => Promise<void>;
  enterDemoMode: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isDemoMode: false,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  enterDemoMode: () => {},
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
      .catch((error) => {
        console.error("Error getting redirect result:", error);
        toast({
          title: "Sign in failed",
          description: "There was a problem signing in with Google",
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
      // Use redirect instead of popup for better compatibility
      await signInWithRedirect(auth, googleProvider);
      // Note: We won't reach this point immediately as the page will redirect
    } catch (error) {
      console.error("Error signing in with Google:", error);
      toast({
        title: "Sign in failed",
        description: "There was a problem signing in with Google",
        variant: "destructive"
      });
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

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user || isDemoMode,
        isLoading,
        isDemoMode,
        signInWithGoogle,
        signOut,
        enterDemoMode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
