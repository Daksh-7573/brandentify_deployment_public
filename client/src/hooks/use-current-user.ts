import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface User {
  id: number;
  username: string;
  email: string;
  name: string | null;
  photoURL: string | null;
  title: string | null;
  location: string | null;
  industry: string | null;
  domain: string | null; 
  aboutMe: string | null;
  careerStage: string | null;
  // Add other user properties as needed
}

interface UseCurrentUserResult {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
}

/**
 * Hook to get the current authenticated user
 */
export function useCurrentUser(): UseCurrentUserResult {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchUser = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // For now, set to null as the authentication is handled by Firebase
      // The app works without this hook since user data is fetched elsewhere
      setUser(null);
    } catch (err) {
      console.error('Error fetching current user:', err);
      setError('Failed to fetch user information');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch the user on mount
  useEffect(() => {
    fetchUser();
  }, []);
  
  return {
    user,
    isLoading,
    error,
    refreshUser: fetchUser
  };
}