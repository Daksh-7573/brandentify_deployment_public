import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

// Career Capsule functionality has been removed
// This is a stub implementation that provides type definitions for backward compatibility
// and empty implementations that return null values

// Type definitions for Career Capsule data (for compatibility only)
export interface CareerCapsule {
  id: number;
  userId: number;
  title: string;
  goalType: "position_change" | "skill_acquisition" | "promotion" | "industry_switch" | "entrepreneurship" | "relocation" | "education" | "certification" | "custom";
  customGoal: string | null;
  timeframe: number;
  description: string | null;
  industry: string | null;
  isPrivate: boolean;
  overallProgress: number;
  isMuskGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CapsuleYear {
  id: number;
  capsuleId: number;
  yearNumber: number;
  title: string;
  description: string | null;
  completionStatus: number;
  createdAt: string;
  updatedAt: string;
}

export interface CapsuleTask {
  id: number;
  yearId: number;
  title: string;
  description: string | null;
  isCompleted: boolean;
  dueDate: string | null;
  category?: string;
  priority?: number;
  difficulty?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CapsuleJournal {
  id: number;
  yearId: number;
  title: string;
  content: string;
  mood?: string;
  entryDate: string;
  isPrivate?: boolean;
}

export interface MilestoneGenerationResponse {
  success: boolean;
  message: string;
  milestones?: any[];
}

// Hook for fetching user's career capsule - returns null (feature disabled)
export const useUserCareerCapsule = (userId: number) => {
  return useQuery({
    queryKey: ['/api/users', userId, 'career-capsule'],
    queryFn: async () => {
      console.log('Career Capsule functionality has been removed');
      return null;
    },
    enabled: false, // Disable this query entirely
  });
};

// Hook for creating a career capsule - no-op implementation
export const useCreateCareerCapsule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, data }: { userId: number, data: any }) => {
      console.log('Career Capsule functionality has been removed');
      toast({
        title: "Feature Unavailable",
        description: "The Career Capsule feature has been removed.",
        variant: "destructive",
      });
      throw new Error('Career Capsule functionality has been removed');
    },
    onError: () => {
      // Silent error handling as this feature is intentionally disabled
    }
  });
};

// Hook for updating a career capsule - no-op implementation
export const useUpdateCareerCapsule = () => {
  return useMutation({
    mutationFn: async ({ capsuleId, data }: { capsuleId: number, data: any }) => {
      console.log('Career Capsule functionality has been removed');
      toast({
        title: "Feature Unavailable",
        description: "The Career Capsule feature has been removed.",
        variant: "destructive",
      });
      throw new Error('Career Capsule functionality has been removed');
    },
    onError: () => {
      // Silent error handling as this feature is intentionally disabled
    }
  });
};

// Hook for fetching capsule years - returns empty array
export const useCapsuleYears = (capsuleId: number | null) => {
  return useQuery({
    queryKey: ['/api/career-capsules', capsuleId, 'years'],
    queryFn: async () => {
      console.log('Career Capsule functionality has been removed');
      return [] as CapsuleYear[];
    },
    enabled: false, // Disable this query entirely
  });
};

// Empty implementations for all other Career Capsule related hooks
export const useCreateCapsuleYear = () => {
  return useMutation({
    mutationFn: async ({ capsuleId, data }: { capsuleId: number, data: any }) => {
      console.log('Career Capsule functionality has been removed');
      toast({
        title: "Feature Unavailable",
        description: "The Career Capsule feature has been removed.",
        variant: "destructive",
      });
      throw new Error('Career Capsule functionality has been removed');
    },
    onError: () => {
      // Silent error handling
    }
  });
};

export const useUpdateCapsuleYear = () => {
  return useMutation({
    mutationFn: async ({ yearId, data }: { yearId: number, data: any }) => {
      console.log('Career Capsule functionality has been removed');
      throw new Error('Career Capsule functionality has been removed');
    },
    onError: () => {}
  });
};

export const useDeleteCapsuleYear = () => {
  return useMutation({
    mutationFn: async (yearId: number) => {
      console.log('Career Capsule functionality has been removed');
      throw new Error('Career Capsule functionality has been removed');
    },
    onError: () => {}
  });
};

export const useCapsuleTasks = (yearId: number | null) => {
  return useQuery({
    queryKey: ['/api/capsule-years', yearId, 'tasks'],
    queryFn: async () => {
      console.log('Career Capsule functionality has been removed');
      return [] as CapsuleTask[];
    },
    enabled: false,
  });
};

export const useCreateCapsuleTask = () => {
  return useMutation({
    mutationFn: async ({ yearId, data }: { yearId: number, data: any }) => {
      console.log('Career Capsule functionality has been removed');
      throw new Error('Career Capsule functionality has been removed');
    },
    onError: () => {}
  });
};

export const useUpdateCapsuleTask = () => {
  return useMutation({
    mutationFn: async ({ taskId, data }: { taskId: number, data: any }) => {
      console.log('Career Capsule functionality has been removed');
      throw new Error('Career Capsule functionality has been removed');
    },
    onError: () => {}
  });
};

export const useToggleCapsuleTaskCompletion = () => {
  return useMutation({
    mutationFn: async (taskId: number) => {
      console.log('Career Capsule functionality has been removed');
      throw new Error('Career Capsule functionality has been removed');
    },
    onError: () => {}
  });
};

export const useDeleteCapsuleTask = () => {
  return useMutation({
    mutationFn: async (taskId: number) => {
      console.log('Career Capsule functionality has been removed');
      throw new Error('Career Capsule functionality has been removed');
    },
    onError: () => {}
  });
};

export const useCapsuleJournals = (yearId: number | null) => {
  return useQuery({
    queryKey: ['/api/capsule-years', yearId, 'journals'],
    queryFn: async () => {
      console.log('Career Capsule functionality has been removed');
      return [] as CapsuleJournal[];
    },
    enabled: false,
  });
};

export const useCreateCapsuleJournal = () => {
  return useMutation({
    mutationFn: async ({ yearId, data }: { yearId: number, data: any }) => {
      console.log('Career Capsule functionality has been removed');
      throw new Error('Career Capsule functionality has been removed');
    },
    onError: () => {}
  });
};

export const useUpdateCapsuleJournal = () => {
  return useMutation({
    mutationFn: async ({ journalId, data }: { journalId: number, data: any }) => {
      console.log('Career Capsule functionality has been removed');
      throw new Error('Career Capsule functionality has been removed');
    },
    onError: () => {}
  });
};

export const useDeleteCapsuleJournal = () => {
  return useMutation({
    mutationFn: async (journalId: number) => {
      console.log('Career Capsule functionality has been removed');
      throw new Error('Career Capsule functionality has been removed');
    },
    onError: () => {}
  });
};

export const useGenerateCapsuleMilestones = () => {
  return useMutation({
    mutationFn: async ({ capsuleId, yearStart, yearEnd, userData }: { 
      capsuleId: number, 
      yearStart: number, 
      yearEnd: number, 
      userData: any
    }) => {
      console.log('Career Capsule functionality has been removed');
      return { success: false, message: 'Career Capsule functionality has been removed' } as MilestoneGenerationResponse;
    },
    onError: () => {}
  });
};