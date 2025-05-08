import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface MentorshipStatus {
  isPending: boolean;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
}

interface MentorshipStats {
  activeMentorsCount: number;
  activeMenteesCount: number;
  pendingMentorRequestsCount: number;
  pendingMenteeRequestsCount: number;
}

// This hook provides mentorship functionality that can be used across all templates
export function useMentorship(userId: number, mentorId: number) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to get the current mentorship status between user and mentor
  const { data: mentorshipStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/mentorship/status', userId, mentorId],
    enabled: !!userId && !!mentorId && userId !== mentorId,
  });

  // Query to get user's mentorship stats (active mentors/mentees, pending requests)
  const { data: mentorshipStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/mentorship/stats', userId],
    enabled: !!userId,
  });

  // Mutation to request mentorship
  const requestMutation = useMutation({
    mutationFn: async () => {
      setIsSubmitting(true);
      try {
        const response = await apiRequest({
          url: '/api/mentorship/request',
          method: 'POST', 
          data: {
            menteeId: userId,
            mentorId: mentorId
          }
        });
        return response;
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Mentorship requested',
        description: 'Your mentorship request has been sent successfully.',
        variant: 'default',
      });
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/mentorship/status', userId, mentorId] });
      queryClient.invalidateQueries({ queryKey: ['/api/mentorship/stats', userId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Request failed',
        description: error.message || 'Failed to request mentorship. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Mutation to accept mentorship request
  const acceptMutation = useMutation({
    mutationFn: async () => {
      setIsSubmitting(true);
      try {
        const response = await apiRequest({
          url: '/api/mentorship/accept',
          method: 'POST', 
          data: {
            menteeId: userId,
            mentorId: mentorId
          }
        });
        return response;
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Mentorship accepted',
        description: 'You have successfully accepted the mentorship request.',
        variant: 'default',
      });
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/mentorship/status', userId, mentorId] });
      queryClient.invalidateQueries({ queryKey: ['/api/mentorship/stats', userId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Action failed',
        description: error.message || 'Failed to accept mentorship. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Mutation to decline mentorship request
  const declineMutation = useMutation({
    mutationFn: async () => {
      setIsSubmitting(true);
      try {
        const response = await apiRequest('/api/mentorship/decline', {
          method: 'POST',
          body: JSON.stringify({
            menteeId: userId,
            mentorId: mentorId
          })
        });
        return response;
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Request declined',
        description: 'You have declined the mentorship request.',
        variant: 'default',
      });
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/mentorship/status', userId, mentorId] });
      queryClient.invalidateQueries({ queryKey: ['/api/mentorship/stats', userId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Action failed',
        description: error.message || 'Failed to decline request. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Mutation to cancel mentorship
  const cancelMutation = useMutation({
    mutationFn: async () => {
      setIsSubmitting(true);
      try {
        const response = await apiRequest('/api/mentorship/cancel', {
          method: 'POST',
          body: JSON.stringify({
            menteeId: userId,
            mentorId: mentorId
          })
        });
        return response;
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Mentorship cancelled',
        description: 'The mentorship has been cancelled.',
        variant: 'default',
      });
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/mentorship/status', userId, mentorId] });
      queryClient.invalidateQueries({ queryKey: ['/api/mentorship/stats', userId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Action failed',
        description: error.message || 'Failed to cancel mentorship. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Mutation to renew mentorship
  const renewMutation = useMutation({
    mutationFn: async () => {
      setIsSubmitting(true);
      try {
        const response = await apiRequest('/api/mentorship/renew', {
          method: 'POST',
          body: JSON.stringify({
            menteeId: userId,
            mentorId: mentorId
          })
        });
        return response;
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Mentorship renewed',
        description: 'The mentorship has been renewed for another 30 days.',
        variant: 'default',
      });
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/mentorship/status', userId, mentorId] });
      queryClient.invalidateQueries({ queryKey: ['/api/mentorship/stats', userId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Action failed',
        description: error.message || 'Failed to renew mentorship. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Check if user can request more mentors (limit is 5 active mentors)
  const canRequestMoreMentors = 
    mentorshipStats?.activeMentorsCount < 5 && 
    mentorshipStats?.pendingMentorRequestsCount < 5;

  // Check if user can accept more mentees (limit is 5 active mentees)
  const canAcceptMoreMentees = 
    mentorshipStats?.activeMenteesCount < 5;

  return {
    // Status and stats
    mentorshipStatus: mentorshipStatus as MentorshipStatus,
    mentorshipStats: mentorshipStats as MentorshipStats,
    isLoading: statusLoading || statsLoading,
    isSubmitting,
    
    // Capacity checks
    canRequestMoreMentors,
    canAcceptMoreMentees,
    
    // Actions
    requestMentorship: requestMutation.mutate,
    acceptMentorship: acceptMutation.mutate,
    declineMentorship: declineMutation.mutate,
    cancelMentorship: cancelMutation.mutate,
    renewMentorship: renewMutation.mutate
  };
}