/**
 * Custom hook for fetching and managing comprehensive user profile data
 * This provides a unified way to access all user-related data in one place
 */

import { useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useState } from 'react';

export interface UserProfileData {
  // Basic user data
  id: number;
  username: string;
  email: string;
  name: string | null;
  photoURL: string | null;
  title: string | null;
  aboutMe: string | null;
  location: string | null;
  industry: string | null;
  domain: string | null;
  lookingFor: string | null;
  whatIOffer: string | null;
  visitingCardType: string | null;
  profileCompleted: number | null;
  createdAt: string | null;
  
  // Related data
  workExperiences: any[]; // Work experience data
  education: any[]; // Education data
  skills: any[]; // Skills data
  projects: any[]; // Projects data
  services: any[]; // Services data
}

interface UseUserProfileOptions {
  enabled?: boolean;
}

/**
 * Hook to fetch and manage comprehensive user profile data
 * @param userId The ID of the user whose profile data to fetch
 * @param options Optional configuration options
 * @returns Query result with the comprehensive user profile data
 */
export function useUserProfile(
  userId: number | string | null | undefined,
  options: UseUserProfileOptions = {}
) {
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);

  // Normalize userId to a number or null
  const normalizedUserId = userId 
    ? (typeof userId === 'string' ? parseInt(userId, 10) : userId) 
    : null;

  // Only enable the query if we have a valid userId and it's explicitly enabled
  const enabled = !!normalizedUserId && options.enabled !== false;

  const query = useQuery({
    queryKey: ['/api/users', normalizedUserId, 'profile'],
    enabled,
    queryFn: async () => {
      if (!normalizedUserId) {
        throw new Error('User ID is required');
      }

      const response = await fetch(`/api/users/${normalizedUserId}/profile`);
      
      if (!response.ok) {
        // If the response is not ok, try to parse the error message
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || 
          `Failed to fetch user profile data: ${response.status} ${response.statusText}`
        );
      }
      
      const data = await response.json();
      setProfileData(data);
      return data;
    },
  });

  // Helper functions to update the cache when data changes
  const updateCache = (updatedData: Partial<UserProfileData>) => {
    if (!normalizedUserId) return;

    queryClient.setQueryData(
      ['/api/users', normalizedUserId, 'profile'], 
      (oldData: UserProfileData | undefined) => {
        if (!oldData) return updatedData;
        return { ...oldData, ...updatedData };
      }
    );
  };

  return {
    ...query,
    profileData,
    updateCache,
  };
}

export default useUserProfile;