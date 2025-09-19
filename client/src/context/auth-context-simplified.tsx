import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut, User as FirebaseUser, Auth, GoogleAuthProvider } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from '@/lib/queryClient';

interface User {
  uid: string;
  id: number;
  username: string;
  email: string | null;
  name: string | null;
  photoURL?: string | null;
  title?: string | null;
  location?: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithPhone: (phoneNumber: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  signInWithGoogle: async () => {},
  signInWithPhone: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [authInstances, setAuthInstances] = useState<{ auth: Auth | null; googleProvider: GoogleAuthProvider | null }>({ auth: null, googleProvider: null });

  // Create or update user in backend
  const createOrUpdateUserInBackend = async (firebaseUser: FirebaseUser) => {
    try {
      const googleProvider = firebaseUser.providerData?.find(
        (provider) => provider.providerId === "google.com"
      );

      const userData = {
        uid: firebaseUser.uid,
        email: googleProvider?.email || firebaseUser.email,
        name: googleProvider?.displayName || firebaseUser.displayName || "Firebase User",
        photoURL: googleProvider?.photoURL || firebaseUser.photoURL,
      };

      console.log("Creating/updating user in backend:", userData);
      
      const response = await apiRequest('POST', '/api/users', userData);
      
      if (response.ok) {
        const backendUser = await response.json();
        console.log("User created/updated successfully:", backendUser);
        return backendUser;
      } else {
        console.log("User creation/update failed, status:", response.status);
        return null;
      }
    } catch (error) {
      console.error("Error creating/updating user:", error);
      return null;
    }
  };

  // Fetch user data from backend
  const fetchUserData = async (uid: string, email?: string | null): Promise<User | null> => {
    try {
      let url = `/api/users/${uid}`;
      if (email) {
        url += `?email=${encodeURIComponent(email)}`;
      }

      const response = await apiRequest('GET', url);
      
      if (response.ok) {
        const userData = await response.json();
        return {
          uid: uid,
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
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  // Setup auth state listener - simplified, single handler
  useEffect(() => {
    console.log("Setting up simplified auth state listener");
    
    // Import auth and googleProvider dynamically to avoid import issues
    const setupAuth = async () => {
      try {
        const { auth, googleProvider } = await import('@/lib/firebase');
        
        // Check if auth is properly initialized
        if (!auth) {
          console.error('Firebase auth not properly initialized');
          setIsLoading(false);
          return () => {}; // Return empty cleanup function
        }
        
        // Store auth instances in state for use by other functions
        setAuthInstances({ auth, googleProvider });
        
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        console.log("Auth state changed:", firebaseUser ? "User signed in" : "User signed out");
        
        if (firebaseUser) {
          try {
            // Only process if we don't already have this user
            if (!user || user.uid !== firebaseUser.uid) {
              console.log("Processing new user:", firebaseUser.uid);
              
              // Create/update user in backend first
              await createOrUpdateUserInBackend(firebaseUser);
              
              // Get Google provider data for email
              const googleProvider = firebaseUser.providerData?.find(
                provider => provider.providerId === "google.com"
              );
              const userEmail = googleProvider?.email || firebaseUser.email;
              
              // Fetch complete user data from backend
              const userData = await fetchUserData(firebaseUser.uid, userEmail);
              
              if (userData) {
                console.log("Setting user state with backend data");
                setUser(userData);
                
                if (!user) {
                  toast({
                    title: "Signed in successfully",
                    description: `Welcome ${userData.name || userData.email}!`,
                  });
                }
              } else {
                // Fallback user if backend fails
                console.log("Using fallback user data");
                const fallbackUser = {
                  uid: firebaseUser.uid,
                  id: parseInt(firebaseUser.uid.substring(0, 5), 36) || 999,
                  username: userEmail?.split('@')[0] || firebaseUser.uid.substring(0, 8),
                  email: userEmail,
                  name: googleProvider?.displayName || firebaseUser.displayName,
                  photoURL: googleProvider?.photoURL || firebaseUser.photoURL
                };
                
                setUser(fallbackUser);
                
                if (!user) {
                  toast({
                    title: "Signed in successfully", 
                    description: `Welcome ${fallbackUser.name || fallbackUser.email}!`,
                  });
                }
              }
            }
          } catch (error) {
            console.error("Error processing auth state change:", error);
          }
        } else {
          // User signed out
          if (user) {
            console.log("User signed out");
            setUser(null);
            toast({
              title: "Signed out",
              description: "You have been signed out successfully.",
            });
          }
        }
        
        setIsLoading(false);
      });

        return unsubscribe;
      } catch (error) {
        console.error('Error setting up Firebase auth:', error);
        setIsLoading(false);
        return () => {}; // Return empty cleanup function
      }
    };

    // Call setupAuth and handle the unsubscribe function
    let unsubscribeFunction: (() => void) | null = null;
    
    setupAuth().then((unsubscribe) => {
      unsubscribeFunction = unsubscribe;
    });

    return () => {
      if (unsubscribeFunction) {
        unsubscribeFunction();
      }
    };
  }, [user, toast]);

  // Simplified Google sign-in
  const signInWithGoogle = async () => {
    if (!authInstances.auth || !authInstances.googleProvider) {
      console.error('Firebase auth not initialized');
      toast({
        title: "Authentication Error",
        description: "Authentication system not ready. Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      console.log("Starting Google sign-in");
      
      try {
        // Try popup first
        const result = await signInWithPopup(authInstances.auth, authInstances.googleProvider);
        console.log("Popup sign-in successful:", result.user.email);
      } catch (popupError: any) {
        console.log("Popup failed, trying redirect:", popupError.code);
        
        if (popupError.code === 'auth/popup-blocked' || 
            popupError.code === 'auth/popup-closed-by-user') {
          await signInWithRedirect(authInstances.auth, authInstances.googleProvider);
          return; // Don't set loading false - redirect will handle it
        } else {
          throw popupError;
        }
      }
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      
      let errorMessage = "There was a problem with Google sign-in. Please try again.";
      if (error.code === 'auth/popup-blocked') {
        errorMessage = "Please allow popups for this site.";
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Sign-in was cancelled.";
      }
      
      toast({
        title: "Authentication error",
        description: errorMessage,
        variant: "destructive",
      });
      
      setIsLoading(false);
    }
  };

  // Phone auth placeholder
  const signInWithPhone = async (phoneNumber: string) => {
    console.log("Phone auth not implemented yet:", phoneNumber);
    toast({
      title: "Coming soon",
      description: "Phone authentication will be available soon.",
    });
  };

  // Logout
  const logout = async () => {
    if (!authInstances.auth) {
      console.error('Firebase auth not initialized');
      toast({
        title: "Error",
        description: "Authentication system not ready.",
        variant: "destructive",
      });
      return;
    }

    try {
      await signOut(authInstances.auth);
      console.log("User signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "There was a problem signing out.",
        variant: "destructive",
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
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};