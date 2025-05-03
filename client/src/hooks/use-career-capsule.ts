import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

export type GoalType = 'custom' | 'certification' | 'education' | 'position_change' | 'skill_acquisition' | 'promotion' | 'industry_switch' | 'entrepreneurship' | 'relocation';
export type GoalStatus = 'completed' | 'not_started' | 'in_progress' | 'abandoned' | null;
export type SkillPriority = 'high' | 'medium' | 'low';
export type SkillStatus = 'completed' | 'in_progress' | 'not_started';
export type LogEntryType = 'accomplishment' | 'challenge' | 'learning' | 'reflection';

export interface CareerGoal {
  id: number;
  userId: number;
  title: string;
  description: string;
  targetDate: Date;
  goalType: GoalType;
  status: GoalStatus;
  createdAt: Date;
  updatedAt: Date;
  progress: number;
  industryFocus: string;
}

export interface GoalMilestone {
  id: number;
  goalId: number;
  title: string;
  description: string;
  targetDate: Date;
  status: GoalStatus;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}

export interface GoalSkill {
  id: number;
  goalId: number;
  skillName: string;
  description: string;
  priority: SkillPriority;
  status: SkillStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoalProgressLog {
  id: number;
  goalId: number;
  milestoneId: number | null;
  entry: string;
  createdAt: Date;
  entryType: LogEntryType;
}

export interface CareerGoalWithDetails {
  goal: CareerGoal;
  milestones: GoalMilestone[];
  skills: GoalSkill[];
  progressLogs: GoalProgressLog[];
}

// Hook for Career Capsule
export const useCareerCapsule = (userId: number | string) => {
  const queryClient = useQueryClient();

  // Helper to invalidate goal-related queries
  const invalidateGoalQueries = () => {
    queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/career-capsule`] });
  };

  // Get all career goals for a user
  const useGoals = () => {
    return useQuery({
      queryKey: [`/api/users/${userId}/career-capsule`],
      enabled: !!userId,
      refetchOnWindowFocus: true,
      staleTime: 1000, // Consider data stale after 1 second
      retry: 2,
      retryDelay: 1000,
    });
  };

  // Get a specific career goal with all related data
  const useGoalDetails = (goalId: number) => {
    return useQuery({
      queryKey: [`/api/career-goals/${goalId}`],
      enabled: !!goalId,
    });
  };

  // Create a new career goal
  const useCreateGoal = () => {
    return useMutation({
      mutationFn: (goalData: Omit<CareerGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'progress'>) => {
        return apiRequest('POST', `/api/users/${userId}/career-capsule`, {
          ...goalData, 
          userId
        });
      },
      onSuccess: () => {
        toast({
          title: 'Career goal created',
          description: 'Your career goal has been successfully created.',
        });
        invalidateGoalQueries();
      },
      onError: (error: any) => {
        toast({
          title: 'Failed to create career goal',
          description: error.message || 'An error occurred while creating the career goal.',
          variant: 'destructive',
        });
      },
    });
  };

  // Update a career goal
  const useUpdateGoal = (goalId: number) => {
    return useMutation({
      mutationFn: (goalData: Partial<CareerGoal>) => {
        return apiRequest('PATCH', `/api/career-goals/${goalId}`, goalData);
      },
      onSuccess: () => {
        toast({
          title: 'Career goal updated',
          description: 'Your career goal has been successfully updated.',
        });
        queryClient.invalidateQueries({ queryKey: [`/api/career-goals/${goalId}`] });
        invalidateGoalQueries();
      },
      onError: (error: any) => {
        toast({
          title: 'Failed to update career goal',
          description: error.message || 'An error occurred while updating the career goal.',
          variant: 'destructive',
        });
      },
    });
  };

  // Delete a career goal
  const useDeleteGoal = () => {
    return useMutation({
      mutationFn: (goalId: number) => {
        return apiRequest('DELETE', `/api/career-goals/${goalId}`);
      },
      onSuccess: () => {
        toast({
          title: 'Career goal deleted',
          description: 'Your career goal has been successfully deleted.',
        });
        invalidateGoalQueries();
      },
      onError: (error: any) => {
        toast({
          title: 'Failed to delete career goal',
          description: error.message || 'An error occurred while deleting the career goal.',
          variant: 'destructive',
        });
      },
    });
  };
  
  // Delete a career capsule
  const useDeleteCapsule = () => {
    return useMutation({
      mutationFn: (capsuleId: number) => {
        return apiRequest('DELETE', `/api/career-capsules/${capsuleId}`);
      },
      onSuccess: () => {
        toast({
          title: 'Career capsule deleted',
          description: 'Your career capsule has been successfully deleted.',
        });
        // Invalidate both paths to ensure UI updates properly
        invalidateGoalQueries();
        queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/career-goals`] });
        queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/career-capsule`] });
      },
      onError: (error: any) => {
        toast({
          title: 'Failed to delete career capsule',
          description: error.message || 'An error occurred while deleting the career capsule.',
          variant: 'destructive',
        });
      },
    });
  };

  // Create a milestone for a career goal
  const useCreateMilestone = (goalId: number) => {
    return useMutation({
      mutationFn: (milestoneData: Omit<GoalMilestone, 'id' | 'goalId' | 'order' | 'createdAt' | 'updatedAt' | 'completedAt'>) => {
        return apiRequest('POST', `/api/career-goals/${goalId}/milestones`, {
          ...milestoneData,
          goalId
        });
      },
      onSuccess: () => {
        toast({
          title: 'Milestone created',
          description: 'Your milestone has been successfully created.',
        });
        queryClient.invalidateQueries({ queryKey: [`/api/career-goals/${goalId}`] });
      },
      onError: (error: any) => {
        toast({
          title: 'Failed to create milestone',
          description: error.message || 'An error occurred while creating the milestone.',
          variant: 'destructive',
        });
      },
    });
  };

  // Update a milestone
  const useUpdateMilestone = (milestoneId: number, goalId: number) => {
    return useMutation({
      mutationFn: (milestoneData: Partial<GoalMilestone>) => {
        return apiRequest('PATCH', `/api/goal-milestones/${milestoneId}`, milestoneData);
      },
      onSuccess: () => {
        toast({
          title: 'Milestone updated',
          description: 'Your milestone has been successfully updated.',
        });
        queryClient.invalidateQueries({ queryKey: [`/api/career-goals/${goalId}`] });
      },
      onError: (error: any) => {
        toast({
          title: 'Failed to update milestone',
          description: error.message || 'An error occurred while updating the milestone.',
          variant: 'destructive',
        });
      },
    });
  };

  // Delete a milestone
  const useDeleteMilestone = (goalId: number) => {
    return useMutation({
      mutationFn: (milestoneId: number) => {
        return apiRequest('DELETE', `/api/goal-milestones/${milestoneId}`);
      },
      onSuccess: () => {
        toast({
          title: 'Milestone deleted',
          description: 'Your milestone has been successfully deleted.',
        });
        queryClient.invalidateQueries({ queryKey: [`/api/career-goals/${goalId}`] });
      },
      onError: (error: any) => {
        toast({
          title: 'Failed to delete milestone',
          description: error.message || 'An error occurred while deleting the milestone.',
          variant: 'destructive',
        });
      },
    });
  };

  // Create a skill for a career goal
  const useCreateSkill = (goalId: number) => {
    return useMutation({
      mutationFn: (skillData: Omit<GoalSkill, 'id' | 'goalId' | 'createdAt' | 'updatedAt'>) => {
        return apiRequest('POST', `/api/career-goals/${goalId}/skills`, {
          ...skillData,
          goalId
        });
      },
      onSuccess: () => {
        toast({
          title: 'Skill added',
          description: 'Your skill has been successfully added to the career goal.',
        });
        queryClient.invalidateQueries({ queryKey: [`/api/career-goals/${goalId}`] });
      },
      onError: (error: any) => {
        toast({
          title: 'Failed to add skill',
          description: error.message || 'An error occurred while adding the skill.',
          variant: 'destructive',
        });
      },
    });
  };

  // Update a skill
  const useUpdateSkill = (skillId: number, goalId: number) => {
    return useMutation({
      mutationFn: (skillData: Partial<GoalSkill>) => {
        return apiRequest('PATCH', `/api/goal-skills/${skillId}`, skillData);
      },
      onSuccess: () => {
        toast({
          title: 'Skill updated',
          description: 'Your skill has been successfully updated.',
        });
        queryClient.invalidateQueries({ queryKey: [`/api/career-goals/${goalId}`] });
      },
      onError: (error: any) => {
        toast({
          title: 'Failed to update skill',
          description: error.message || 'An error occurred while updating the skill.',
          variant: 'destructive',
        });
      },
    });
  };

  // Delete a skill
  const useDeleteSkill = (goalId: number) => {
    return useMutation({
      mutationFn: (skillId: number) => {
        return apiRequest('DELETE', `/api/goal-skills/${skillId}`);
      },
      onSuccess: () => {
        toast({
          title: 'Skill deleted',
          description: 'Your skill has been successfully deleted from the career goal.',
        });
        queryClient.invalidateQueries({ queryKey: [`/api/career-goals/${goalId}`] });
      },
      onError: (error: any) => {
        toast({
          title: 'Failed to delete skill',
          description: error.message || 'An error occurred while deleting the skill.',
          variant: 'destructive',
        });
      },
    });
  };

  // Add a progress log entry
  const useCreateProgressLog = (goalId: number) => {
    return useMutation({
      mutationFn: (logData: Omit<GoalProgressLog, 'id' | 'goalId' | 'createdAt'>) => {
        return apiRequest('POST', `/api/career-goals/${goalId}/progress-logs`, {
          ...logData,
          goalId
        });
      },
      onSuccess: () => {
        toast({
          title: 'Progress logged',
          description: 'Your progress has been successfully logged.',
        });
        queryClient.invalidateQueries({ queryKey: [`/api/career-goals/${goalId}`] });
      },
      onError: (error: any) => {
        toast({
          title: 'Failed to log progress',
          description: error.message || 'An error occurred while logging your progress.',
          variant: 'destructive',
        });
      },
    });
  };

  // Delete a progress log entry
  const useDeleteProgressLog = (goalId: number) => {
    return useMutation({
      mutationFn: (logId: number) => {
        return apiRequest('DELETE', `/api/goal-progress-logs/${logId}`);
      },
      onSuccess: () => {
        toast({
          title: 'Progress log deleted',
          description: 'Your progress log has been successfully deleted.',
        });
        queryClient.invalidateQueries({ queryKey: [`/api/career-goals/${goalId}`] });
      },
      onError: (error: any) => {
        toast({
          title: 'Failed to delete progress log',
          description: error.message || 'An error occurred while deleting the progress log.',
          variant: 'destructive',
        });
      },
    });
  };

  // Generate AI milestones for a career capsule
  const useGenerateMilestones = (capsuleId: number) => {
    return useMutation({
      mutationFn: (options?: { 
        goalType?: string; 
        customGoal?: string; 
        timeframe?: number; 
        industry?: string; 
        description?: string;
        useModel?: 'openai' | 'anthropic';
      }) => {
        return apiRequest('POST', `/api/career-capsules/${capsuleId}/generate-milestones`, options || {});
      },
      onSuccess: () => {
        toast({
          title: 'Milestones generated',
          description: 'Musk AI has successfully generated milestones for your career goal.',
        });
        queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/career-capsule`] });
      },
      onError: (error: any) => {
        toast({
          title: 'Failed to generate milestones',
          description: error.message || 'An error occurred while generating milestones with Musk AI.',
          variant: 'destructive',
        });
      },
    });
  };

  return {
    useGoals,
    useGoalDetails,
    useCreateGoal,
    useUpdateGoal,
    useDeleteGoal,
    useDeleteCapsule,
    useCreateMilestone,
    useUpdateMilestone,
    useDeleteMilestone,
    useCreateSkill,
    useUpdateSkill,
    useDeleteSkill,
    useCreateProgressLog,
    useDeleteProgressLog,
    useGenerateMilestones,
  };
};