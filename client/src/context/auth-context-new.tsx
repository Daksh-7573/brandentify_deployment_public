import { createContext, useState, useEffect, ReactNode, useContext } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User } from "@shared/schema";

type AuthUser = {
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
  signInWithEmail: (user: User) => void; // Function for email authentication
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  signInWithEmail: () => {},
  signOut: async () => {},
  refreshUserData: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in by querying the backend
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          if (userData) {
            setUser({
              id: userData.id,
              username: userData.username,
              email: userData.email,
              name: userData.name,
              photoURL: userData.photoURL,
              title: userData.title || undefined,
              location: userData.location || undefined
            });
          }
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Fetch user data from our backend - used for refreshes
  const fetchUserData = async (userId: number) => {
    try {
      const response = await apiRequest('GET', `/api/users/${userId}`);
      
      if (response.status === 404) {
        return null;
      }
      
      const userData = await response.json();
      
      // Create a user with data from our backend
      return {
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

  const refreshUserData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      // Get updated user data from backend
      const userData = await fetchUserData(user.id);
      
      if (userData) {
        // Update local state with new data
        setUser(userData);
      } else {
        throw new Error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      toast({
        title: "Error",
        description: "Failed to refresh your profile data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithEmail = async (userData: User) => {
    setIsLoading(true);
    
    try {
      if (!userData || !userData.id) {
        throw new Error("Invalid user data received");
      }
      
      // First create or update the user in our backend
      const createUserResponse = await apiRequest('POST', '/api/users', {
        id: userData.id,
        username: userData.username || `user_${userData.id}`,
        email: userData.email,
        name: userData.name,
        photoURL: userData.photoURL,
        title: userData.title || null,
        location: userData.location || null
      });
      
      if (!createUserResponse.ok) {
        console.error("Error creating user in backend:", await createUserResponse.text());
        throw new Error("Failed to create user in backend");
      }
      
      // Convert database user to our AuthUser type
      setUser({
        id: userData.id,
        username: userData.username || userData.id.toString().substring(0, 8),
        email: userData.email,
        name: userData.name,
        photoURL: userData.photoURL,
        title: userData.title || undefined,
        location: userData.location || undefined
      });
      
      // Cache user data for offline use
      try {
        localStorage.setItem('userDataCache', JSON.stringify({
          id: userData.id,
          username: userData.username || userData.id.toString().substring(0, 8),
          email: userData.email,
          name: userData.name,
          photoURL: userData.photoURL,
          title: userData.title || undefined,
          location: userData.location || undefined
        }));
        localStorage.setItem('userDataCacheTimestamp', Date.now().toString());
      } catch (cacheError) {
        console.error("Error caching user data:", cacheError);
      }
      
      toast({
        title: "Signed in successfully",
        description: "Welcome to Brandentifier"
      });
    } catch (error) {
      console.error("Error signing in with email:", error);
      toast({
        title: "Sign in failed",
        description: error instanceof Error ? error.message : "Failed to sign in",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    
    try {
      // Call the backend logout endpoint
      await apiRequest('POST', '/api/auth/logout');
      
      // Clear all query cache to prevent stale data
      queryClient.clear();
      
      // Clear user state
      setUser(null);
      
      // Clear user data cache
      localStorage.removeItem('userDataCache');
      localStorage.removeItem('userDataCacheTimestamp');
      
      toast({
        title: "Signed out",
        description: "You've been successfully signed out"
      });
      
      // Redirect to home page after logout
      window.location.href = '/';
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Sign out failed",
        description: "There was a problem signing out",
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
  return useContext(AuthContext);
}