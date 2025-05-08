import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

// Simple user interface matching what we use in the application
export interface User {
  id: number;
  name: string | null;
  email: string;
  username: string;
  photoURL: string | null;
  title: string | null;
  industry: string | null;
  domain: string | null;
  location: string | null;
  company: string | null;
  aboutMe: string | null;
  lookingFor: string | null;
}

export function useCurrentUser() {
  const [userId, setUserId] = useState<number | null>(null);
  
  // Attempt to get user ID from localStorage on mount
  useEffect(() => {
    try {
      // Try to get the demo user ID (for development/testing)
      const savedUserId = localStorage.getItem('demoUserId') || localStorage.getItem('userId');
      if (savedUserId) {
        setUserId(parseInt(savedUserId));
      } else {
        // Default to user ID 1 for demo/testing
        setUserId(1);
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      // Fallback to user ID 1 for demo/testing
      setUserId(1);
    }
  }, []);
  
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['users', userId],
    queryFn: async () => {
      if (!userId) throw new Error('No user ID available');
      
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.status}`);
      }
      
      return response.json();
    },
    enabled: !!userId,
    // Stale time of 5 minutes
    staleTime: 1000 * 60 * 5,
  });
  
  return {
    user,
    userId,
    isLoading,
    error,
    // Utility function to set a different user ID (for testing)
    setCurrentUserId: setUserId
  };
}