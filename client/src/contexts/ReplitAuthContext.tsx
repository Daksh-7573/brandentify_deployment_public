import { createContext, useContext, ReactNode, useState, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Define the auth context type
interface ReplitAuthContextType {
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

// Create the context with a default value
const ReplitAuthContext = createContext<ReplitAuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

// Custom hook to use the auth context
export const useReplitAuthContext = () => useContext(ReplitAuthContext);

interface ReplitAuthProviderProps {
  children: ReactNode;
}

export const ReplitAuthProvider = ({ children }: ReplitAuthProviderProps) => {
  const queryClient = useQueryClient();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Fetch the user data
  const { 
    data: user, 
    isLoading: isUserLoading,
    error,
    refetch 
  } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000, // Refresh token every 5 minutes
  });

  useEffect(() => {
    // Mark initial load as complete after first query finishes
    if (!isUserLoading && !initialLoadComplete) {
      setInitialLoadComplete(true);
    }
  }, [isUserLoading, initialLoadComplete]);

  // Define login function
  const login = useCallback(() => {
    window.location.href = "/api/login";
  }, []);

  // Define logout function
  const logout = useCallback(() => {
    window.location.href = "/api/logout";
  }, []);

  // Determine if authenticated
  const isAuthenticated = !!user;
  // Only show loading state during initial load
  const isLoading = isUserLoading && !initialLoadComplete;

  // Provide the auth context to children
  return (
    <ReplitAuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </ReplitAuthContext.Provider>
  );
};