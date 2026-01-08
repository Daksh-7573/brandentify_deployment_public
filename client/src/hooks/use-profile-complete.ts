import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

export interface ProfileCompleteData {
  user: any;
  experiences: any[];
  educations: any[];
  skills: any[];
  projects: any[];
  services: any[];
  _meta?: {
    fetchedAt: string;
    durationMs: number;
  };
}

export function useProfileComplete(userId: string | number | undefined): UseQueryResult<ProfileCompleteData> {
  return useQuery<ProfileCompleteData>({
    queryKey: ['/api/users', userId, 'profile-complete'],
    queryFn: async () => {
      if (!userId) throw new Error("No user ID provided");
      
      const response = await fetch(`/api/users/${userId}/profile-complete`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }
      
      return response.json();
    },
    enabled: !!userId,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
  });
}

export function prefetchProfileComplete(userId: string | number) {
  if (!userId) return;
  
  queryClient.prefetchQuery({
    queryKey: ['/api/users', userId, 'profile-complete'],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/profile-complete`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to prefetch profile: ${response.status}`);
      }
      
      return response.json();
    },
    staleTime: 60000,
  });
}

export function invalidateProfileComplete(userId: string | number) {
  queryClient.invalidateQueries({ 
    queryKey: ['/api/users', userId, 'profile-complete'] 
  });
}
