/**
 * Hook for managing resume generation and status
 */

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ResumeStatus {
  hasGeneratedResume: boolean;
  resumeUrl: string | null;
  resumeGeneratedAt: string | null;
}

/**
 * Hook to check resume status and manage resume operations
 */
export function useResume(userId: number | string | undefined | null) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const numericUserId = typeof userId === 'string' ? parseInt(userId) : userId;
  
  // Only query if we have a valid userId
  const enabled = numericUserId !== undefined && numericUserId !== null && !isNaN(Number(numericUserId));

  // Query resume status
  const { data: resumeStatus, isLoading, error } = useQuery({
    queryKey: ['/api/resume/status', numericUserId],
    enabled,
    queryFn: async () => {
      try {
        const response = await apiRequest(`/api/resume/status/${numericUserId}`, {
          method: 'GET'
        });
        return response as ResumeStatus;
      } catch (error) {
        console.error('Error fetching resume status:', error);
        return {
          hasGeneratedResume: false,
          resumeUrl: null,
          resumeGeneratedAt: null
        } as ResumeStatus;
      }
    }
  });

  // Mutation to check eligibility
  const eligibilityMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/resume/check-eligibility/${numericUserId}`, {
        method: 'GET'
      }) as Promise<{ eligible: boolean }>;
    }
  });

  // Mutation to generate resume
  const generateMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      try {
        return await apiRequest(`/api/resume/generate/${numericUserId}`, {
          method: 'POST'
        }) as { message: string; resumeUrl: string };
      } catch (error) {
        console.error('Error generating resume:', error);
        throw error;
      } finally {
        setIsGenerating(false);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Resume Generated',
        description: 'Your resume was generated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/resume/status', numericUserId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Resume Generation Failed',
        description: error.message || 'Something went wrong while generating your resume. Please try again.',
        variant: 'destructive'
      });
    }
  });

  /**
   * Checks if user is eligible to generate a resume and generates one if eligible
   */
  const generateResume = async () => {
    try {
      // First check eligibility
      const result = await eligibilityMutation.mutateAsync();
      
      if (result.eligible) {
        // If eligible, generate the resume
        await generateMutation.mutateAsync();
      } else {
        toast({
          title: 'Cannot Generate Resume',
          description: 'You need at least one work experience and one skill to generate a resume.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error in resume generation flow:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again later.',
        variant: 'destructive'
      });
    }
  };

  return {
    resumeStatus,
    isLoading,
    isGenerating: isGenerating || generateMutation.isPending || eligibilityMutation.isPending,
    error,
    generateResume,
    hasError: !!error
  };
}