/**
 * Custom hook for fetching and managing comprehensive user profile data
 * This provides a unified way to access all user-related data in one place
 */

import { useQuery } from "@tanstack/react-query";

export interface UserProfileData {
  // Basic user data
  id: number;
  username: string;
  email: string;
  name: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
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
  emailVerified: boolean;
  emailVerificationToken: string | null;
  emailVerificationExpires: string | null;
  website?: string | null;
  
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
  userId: number | undefined | null,
  options: UseUserProfileOptions = {}
) {
  return useQuery<UserProfileData>({
    queryKey: ['/api/users', userId, 'profile'],
    enabled: Boolean(userId) && options.enabled !== false,
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      console.log(`Fetching comprehensive profile data for user ${userId}`);
      const response = await fetch(`/api/users/${userId}/profile`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user profile data: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`Received comprehensive profile data for user ${userId}:`, data);
      return data;
    },
    retry: 1,
  });
}