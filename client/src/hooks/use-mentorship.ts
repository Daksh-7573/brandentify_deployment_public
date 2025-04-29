import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export type MentorshipRequest = {
  id: number;
  mentorId: number;
  menteeId: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'completed' | 'terminated';
  createdAt: string;
};

export type ActiveMentorship = {
  id: number;
  mentorId: number;
  menteeId: number;
  requestId: number;
  status: 'active' | 'completed' | 'terminated';
  notes: string | null;
  lastActivityAt: string;
  createdAt: string;
  expiresAt: string;
};

export type MentorshipFeedback = {
  id: number;
  mentorshipId: number;
  userId: number;
  rating: number;
  feedback: string;
  createdAt: string;
};

// Get mentorship requests for a mentor
export const useGetMentorRequests = (mentorId?: number) => {
  return useQuery({
    queryKey: ['/api/mentorship/mentor', mentorId],
    queryFn: async () => {
      if (!mentorId) return [];
      const res = await fetch(`/api/mentorship/mentor/${mentorId}`);
      if (!res.ok) throw new Error('Failed to fetch mentor requests');
      return res.json() as Promise<MentorshipRequest[]>;
    },
    enabled: !!mentorId,
  });
};

// Get mentorship requests for a mentee
export const useGetMenteeRequests = (menteeId?: number) => {
  return useQuery({
    queryKey: ['/api/mentorship/mentee', menteeId],
    queryFn: async () => {
      if (!menteeId) return [];
      const res = await fetch(`/api/mentorship/mentee/${menteeId}`);
      if (!res.ok) throw new Error('Failed to fetch mentee requests');
      return res.json() as Promise<MentorshipRequest[]>;
    },
    enabled: !!menteeId,
  });
};

// Get active mentorships for a mentor
export const useGetActiveMentorMentorships = (mentorId?: number) => {
  return useQuery({
    queryKey: ['/api/mentorship/active/mentor', mentorId],
    queryFn: async () => {
      if (!mentorId) return [];
      const res = await fetch(`/api/mentorship/active/mentor/${mentorId}`);
      if (!res.ok) throw new Error('Failed to fetch active mentorships');
      return res.json() as Promise<ActiveMentorship[]>;
    },
    enabled: !!mentorId,
  });
};

// Get active mentorships for a mentee
export const useGetActiveMenteeMentorships = (menteeId?: number) => {
  return useQuery({
    queryKey: ['/api/mentorship/active/mentee', menteeId],
    queryFn: async () => {
      if (!menteeId) return [];
      const res = await fetch(`/api/mentorship/active/mentee/${menteeId}`);
      if (!res.ok) throw new Error('Failed to fetch active mentorships');
      return res.json() as Promise<ActiveMentorship[]>;
    },
    enabled: !!menteeId,
  });
};

// Create a mentorship request
export const useCreateMentorshipRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      mentorId: number;
      menteeId: number;
      message: string;
    }) => {
      const res = await apiRequest('/api/mentorship/request', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          status: 'pending',
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create mentorship request');
      }
      
      return res.json() as Promise<MentorshipRequest>;
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/mentorship/mentor', variables.mentorId] });
      queryClient.invalidateQueries({ queryKey: ['/api/mentorship/mentee', variables.menteeId] });
    },
  });
};

// Update a mentorship request status
export const useUpdateMentorshipRequestStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      requestId,
      status,
    }: {
      requestId: number;
      status: 'accepted' | 'rejected' | 'expired' | 'completed' | 'terminated';
    }) => {
      const res = await apiRequest(`/api/mentorship/request/${requestId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update mentorship request');
      }
      
      return res.json();
    },
    onSuccess: () => {
      // Invalidate all mentorship queries since we don't know which user IDs are affected
      queryClient.invalidateQueries({ queryKey: ['/api/mentorship'] });
    },
  });
};

// Update an active mentorship
export const useUpdateActiveMentorship = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      mentorshipId,
      data,
    }: {
      mentorshipId: number;
      data: { status?: 'accepted' | 'completed' | 'terminated'; notes?: string };
    }) => {
      const res = await apiRequest(`/api/mentorship/active/${mentorshipId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update active mentorship');
      }
      
      return res.json() as Promise<ActiveMentorship>;
    },
    onSuccess: () => {
      // Invalidate all mentorship queries since we don't know which user IDs are affected
      queryClient.invalidateQueries({ queryKey: ['/api/mentorship'] });
    },
  });
};

// Submit feedback for a mentorship
export const useSubmitMentorshipFeedback = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      mentorshipId: number;
      userId: number;
      rating: number;
      feedback: string;
    }) => {
      const res = await apiRequest('/api/mentorship/feedback', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to submit feedback');
      }
      
      return res.json() as Promise<MentorshipFeedback>;
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ['/api/mentorship', variables.mentorshipId, 'feedback'] 
      });
    },
  });
};