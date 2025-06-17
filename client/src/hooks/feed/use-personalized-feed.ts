/**
 * React Hook for Personalized Feed System
 * 
 * Provides comprehensive personalized feed functionality including:
 * - Followed hashtags feed
 * - Mentor/user following feed
 * - Similar hashtags recommendations
 * - Engagement-based content
 * - Industry/domain matching
 * - AI-detected interests
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface PersonalizedFeedParams {
  userId: string | number;
  limit?: number;
  offset?: number;
  types?: string[];
}

interface FeedAnalytics {
  sources: {
    followedHashtags: number;
    mentorPulses: number;
    similarHashtags: number;
    engagementBased: number;
    industryMatch: number;
    aiInterests: number;
  };
  totalItems: number;
  distribution: {
    followedHashtags: number;
    mentorPulses: number;
    similarHashtags: number;
    engagementBased: number;
    industryMatch: number;
    aiInterests: number;
  };
}

export function usePersonalizedFeed(params: PersonalizedFeedParams) {
  return useQuery({
    queryKey: ['personalized-feed', params.userId, params.limit, params.offset, params.types],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.offset) searchParams.append('offset', params.offset.toString());
      if (params.types?.length) searchParams.append('types', params.types.join(','));
      
      const response = await fetch(
        `/api/personalized-feed/users/${params.userId}/personalized-feed?${searchParams}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch personalized feed');
      }
      
      return response.json();
    },
    enabled: !!params.userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });
}

export function useHashtagFeed(userId: string | number) {
  return useQuery({
    queryKey: ['hashtag-feed', userId],
    queryFn: async () => {
      const response = await fetch(`/api/personalized-feed/users/${userId}/hashtag-feed`);
      if (!response.ok) throw new Error('Failed to fetch hashtag feed');
      return response.json();
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000
  });
}

export function useMentorFeed(userId: string | number) {
  return useQuery({
    queryKey: ['mentor-feed', userId],
    queryFn: async () => {
      const response = await fetch(`/api/personalized-feed/users/${userId}/mentor-feed`);
      if (!response.ok) throw new Error('Failed to fetch mentor feed');
      return response.json();
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000
  });
}

export function useFollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ followerId, followeeId }: { followerId: number; followeeId: number }) => {
      return apiRequest(`/personalized-feed/users/${followerId}/follow/${followeeId}`, {
        method: 'POST'
      });
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['mentor-feed', variables.followerId] });
      queryClient.invalidateQueries({ queryKey: ['personalized-feed', variables.followerId] });
      queryClient.invalidateQueries({ queryKey: ['followed-users', variables.followerId] });
    }
  });
}

export function useUnfollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ followerId, followeeId }: { followerId: number; followeeId: number }) => {
      return apiRequest(`/personalized-feed/users/${followerId}/follow/${followeeId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['mentor-feed', variables.followerId] });
      queryClient.invalidateQueries({ queryKey: ['personalized-feed', variables.followerId] });
      queryClient.invalidateQueries({ queryKey: ['followed-users', variables.followerId] });
    }
  });
}

export function useCheckFollowing(followerId: number, followeeId: number) {
  return useQuery({
    queryKey: ['following-status', followerId, followeeId],
    queryFn: async () => {
      const response = await fetch(`/api/personalized-feed/users/${followerId}/following/${followeeId}`);
      if (!response.ok) throw new Error('Failed to check following status');
      return response.json();
    },
    enabled: !!(followerId && followeeId),
    staleTime: 10 * 60 * 1000 // 10 minutes
  });
}

export function useTrackEngagement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      pulseId, 
      engagementType, 
      weight = 1.0 
    }: { 
      userId: number; 
      pulseId: number; 
      engagementType: string; 
      weight?: number;
    }) => {
      return apiRequest('/personalized-feed/engagements', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          pulseId,
          engagementType,
          weight
        })
      });
    },
    onSuccess: (_, variables) => {
      // Invalidate personalized feed to reflect engagement learning
      queryClient.invalidateQueries({ queryKey: ['personalized-feed', variables.userId] });
    }
  });
}

export function useUserInterests(userId: string | number) {
  return useQuery({
    queryKey: ['user-interests', userId],
    queryFn: async () => {
      const response = await fetch(`/api/personalized-feed/users/${userId}/interests`);
      if (!response.ok) throw new Error('Failed to fetch user interests');
      return response.json();
    },
    enabled: !!userId,
    staleTime: 30 * 60 * 1000 // 30 minutes
  });
}

export function useFollowedHashtags(userId: string | number) {
  return useQuery({
    queryKey: ['followed-hashtags', userId],
    queryFn: async () => {
      const response = await fetch(`/api/personalized-feed/users/${userId}/followed-hashtags`);
      if (!response.ok) throw new Error('Failed to fetch followed hashtags');
      return response.json();
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000
  });
}

export function useFollowedUsers(userId: string | number) {
  return useQuery({
    queryKey: ['followed-users', userId],
    queryFn: async () => {
      const response = await fetch(`/api/personalized-feed/users/${userId}/followed-users`);
      if (!response.ok) throw new Error('Failed to fetch followed users');
      return response.json();
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000
  });
}

export function useFeedAnalytics(userId: string | number): { data: FeedAnalytics | undefined; isLoading: boolean; error: Error | null } {
  return useQuery({
    queryKey: ['feed-analytics', userId],
    queryFn: async () => {
      const response = await fetch(`/api/personalized-feed/users/${userId}/feed-analytics`);
      if (!response.ok) throw new Error('Failed to fetch feed analytics');
      return response.json();
    },
    enabled: !!userId,
    staleTime: 15 * 60 * 1000 // 15 minutes
  });
}