/**
 * Hook for loading shadow resume data from server
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';

// Custom hook for loading shadow resume data from server
export function useShadowResume(userId: string | number | undefined, options?: UseQueryOptions<any, Error>) {
  const enabled = !!userId;
  
  const query = useQuery({
    queryKey: ['/api/users', userId, 'shadow-resume'],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      console.log(`Fetching shadow resume data for user ${userId}`);
      
      const response = await fetch(`/api/users/${userId}/shadow-resume`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to load resume data');
      }
      
      return await response.json();
    },
    enabled,
    ...options,
  });
  
  const data = query.data;
  
  return {
    ...query,
    data,
  };
}