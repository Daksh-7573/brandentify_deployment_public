import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface MentorshipStatus {
  isFollowing: boolean;
  followedAt: string | null;
  expiresAt: string | null;
  daysRemaining: number | null;
}

interface MentorshipQuota {
  current: number;
  max: number;
  remaining: number;
  isPremium: boolean;
}

/**
 * Hook for managing mentor follow relationships
 * Uses immediate-follow pattern (30-day duration, no approval required)
 */
export function useMentorship(userId: number, mentorId: number) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to check if user is following this mentor
  const { data: mentorshipStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/mentor/is-following', userId, mentorId],
    queryFn: async () => {
      if (!userId || !mentorId || userId === mentorId) {
        return { isFollowing: false, followedAt: null, expiresAt: null, daysRemaining: null };
      }
      const response = await fetch(`/api/mentor/is-following/${userId}/${mentorId}`);
      if (!response.ok) {
        return { isFollowing: false, followedAt: null, expiresAt: null, daysRemaining: null };
      }
      return response.json();
    },
    enabled: !!userId && !!mentorId && userId !== mentorId,
  });

  // Query to get user's mentor quota (how many more mentors they can follow)
  const { data: mentorshipQuota, isLoading: quotaLoading } = useQuery({
    queryKey: ['/api/mentor/quota', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await fetch(`/api/mentor/quota/${userId}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!userId,
  });

  // Query to check if mentor can accept more mentees (not at 100 capacity)
  const { data: mentorCapacity, isLoading: capacityLoading } = useQuery({
    queryKey: ['/api/mentor/can-accept', mentorId],
    queryFn: async () => {
      if (!mentorId) return { canAccept: true, currentCount: 0, maxCapacity: 100 };
      const response = await fetch(`/api/mentor/can-accept/${mentorId}`);
      if (!response.ok) return { canAccept: true, currentCount: 0, maxCapacity: 100 };
      return response.json();
    },
    enabled: !!mentorId,
  });

  // Mutation to follow a mentor (immediate, 30-day duration)
  const followMutation = useMutation({
    mutationFn: async () => {
      setIsSubmitting(true);
      try {
        const response = await apiRequest('POST', '/api/mentor/follow', {
          followerId: userId,
          mentorId: mentorId
        });
        return response;
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: (data: any) => {
      toast({
        title: 'Following as Mentor',
        description: data?.message || 'You are now following this mentor. Check your messages!',
        variant: 'default',
      });
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/mentor/is-following', userId, mentorId] });
      queryClient.invalidateQueries({ queryKey: ['/api/mentor/quota', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/mentor/my-mentors', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/messaging/conversations'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Could not follow',
        description: error.message || 'Failed to follow mentor. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Mutation to unfollow a mentor (end mentorship early)
  const unfollowMutation = useMutation({
    mutationFn: async () => {
      setIsSubmitting(true);
      try {
        const response = await apiRequest('DELETE', `/api/mentor/unfollow?followerId=${userId}&mentorId=${mentorId}`);
        return response;
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Mentorship Ended',
        description: 'You are no longer following this mentor.',
        variant: 'default',
      });
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/mentor/is-following', userId, mentorId] });
      queryClient.invalidateQueries({ queryKey: ['/api/mentor/quota', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/mentor/my-mentors', userId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Could not unfollow',
        description: error.message || 'Failed to end mentorship. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Mutation to renew mentorship (extend for another 30 days)
  const renewMutation = useMutation({
    mutationFn: async () => {
      setIsSubmitting(true);
      try {
        const response = await apiRequest('POST', '/api/mentor/renew', {
          followerId: userId,
          mentorId: mentorId
        });
        return response;
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Mentorship Renewed',
        description: 'The mentorship has been extended for another 30 days.',
        variant: 'default',
      });
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/mentor/is-following', userId, mentorId] });
      queryClient.invalidateQueries({ queryKey: ['/api/mentor/quota', userId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Renewal Failed',
        description: error.message || 'Failed to renew mentorship. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Check if user can follow more mentors (based on quota)
  const canRequestMoreMentors = mentorshipQuota 
    ? mentorshipQuota.remaining > 0 
    : true; // Allow if quota not loaded yet

  return {
    // Status and quota
    mentorshipStatus: mentorshipStatus as MentorshipStatus,
    mentorshipStats: {
      activeMentorsCount: mentorshipQuota?.current || 0,
      maxMentors: mentorshipQuota?.max || 3,
      remainingSlots: mentorshipQuota?.remaining || 0,
      isPremium: mentorshipQuota?.isPremium || false
    },
    isLoading: statusLoading || quotaLoading,
    isSubmitting,
    
    // Capacity checks
    canRequestMoreMentors,
    canAcceptMoreMentees: true, // No mentee limit for mentors
    
    // Actions (renamed for backwards compatibility)
    requestMentorship: followMutation.mutate,    // Follow = immediate connection
    acceptMentorship: () => {},                   // Not used in new model
    declineMentorship: () => {},                  // Not used in new model
    cancelMentorship: unfollowMutation.mutate,   // Unfollow = end mentorship
    renewMentorship: renewMutation.mutate,
    
    // New direct action names
    followMentor: followMutation.mutate,
    unfollowMentor: unfollowMutation.mutate
  };
}
