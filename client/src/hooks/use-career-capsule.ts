import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

// Type definitions for Career Capsule data
export interface CareerCapsule {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  overallProgress: number;
  startDate: string;
  endDate: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CapsuleYear {
  id: number;
  capsuleId: number;
  year: number;
  title: string;
  description: string | null;
  goalType: "career_growth" | "skill_development" | "financial" | "entrepreneurship" | "well_being" | "other";
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CapsuleTask {
  id: number;
  yearId: number;
  title: string;
  description: string | null;
  isCompleted: boolean;
  dueDate: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CapsuleJournal {
  id: number;
  yearId: number;
  title: string;
  content: string;
  entryDate: string;
  createdAt: Date;
  updatedAt: Date;
}

// Hook for fetching user's career capsule
export const useUserCareerCapsule = (userId: number) => {
  return useQuery({
    queryKey: ['/api/users', userId, 'career-capsule'],
    queryFn: async () => {
      try {
        const response = await apiRequest(`/api/users/${userId}/career-capsule`);
        return response as CareerCapsule;
      } catch (error) {
        // If 404, it means the user doesn't have a career capsule yet
        if ((error as any)?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry on 404
      if ((error as any)?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Hook for creating a career capsule
export const useCreateCareerCapsule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, data }: { userId: number, data: Omit<CareerCapsule, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'overallProgress'> }) => {
      const response = await apiRequest(`/api/users/${userId}/career-capsule`, {
        method: 'POST',
        data,
      });
      return response as CareerCapsule;
    },
    onSuccess: (data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'career-capsule'] });
      toast({
        title: "Success!",
        description: "Your Career Capsule has been created.",
      });
    },
    onError: (error) => {
      console.error("Error creating career capsule:", error);
      toast({
        title: "Error",
        description: "Failed to create Career Capsule. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Hook for updating a career capsule
export const useUpdateCareerCapsule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ capsuleId, data }: { capsuleId: number, data: Partial<CareerCapsule> }) => {
      const response = await apiRequest(`/api/career-capsules/${capsuleId}`, {
        method: 'PUT',
        data,
      });
      return response as CareerCapsule;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', data.userId, 'career-capsule'] });
      toast({
        title: "Success!",
        description: "Your Career Capsule has been updated.",
      });
    },
    onError: (error) => {
      console.error("Error updating career capsule:", error);
      toast({
        title: "Error",
        description: "Failed to update Career Capsule. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Hook for fetching capsule years
export const useCapsuleYears = (capsuleId: number | null) => {
  return useQuery({
    queryKey: ['/api/career-capsules', capsuleId, 'years'],
    queryFn: async () => {
      if (!capsuleId) return [];
      const response = await apiRequest(`/api/career-capsules/${capsuleId}/years`);
      return response as CapsuleYear[];
    },
    enabled: !!capsuleId,
  });
};

// Hook for creating a capsule year
export const useCreateCapsuleYear = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ capsuleId, data }: { capsuleId: number, data: Omit<CapsuleYear, 'id' | 'capsuleId' | 'createdAt' | 'updatedAt' | 'progress'> }) => {
      const response = await apiRequest(`/api/career-capsules/${capsuleId}/years`, {
        method: 'POST',
        data,
      });
      return response as CapsuleYear;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/career-capsules', data.capsuleId, 'years'] });
      toast({
        title: "Success!",
        description: "Year goal added to your Career Capsule.",
      });
    },
    onError: (error) => {
      console.error("Error creating capsule year:", error);
      toast({
        title: "Error",
        description: "Failed to add year goal. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Hook for updating a capsule year
export const useUpdateCapsuleYear = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ yearId, data }: { yearId: number, data: Partial<CapsuleYear> }) => {
      const response = await apiRequest(`/api/capsule-years/${yearId}`, {
        method: 'PUT',
        data,
      });
      return response as CapsuleYear;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/career-capsules', data.capsuleId, 'years'] });
      toast({
        title: "Success!",
        description: "Year goal updated successfully.",
      });
    },
    onError: (error) => {
      console.error("Error updating capsule year:", error);
      toast({
        title: "Error",
        description: "Failed to update year goal. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Hook for deleting a capsule year
export const useDeleteCapsuleYear = () => {
  const queryClient = useQueryClient();
  const [capsuleId, setCapsuleId] = useState<number | null>(null);
  
  return {
    ...useMutation({
      mutationFn: async ({ yearId }: { yearId: number, capsuleId: number }) => {
        const response = await apiRequest(`/api/capsule-years/${yearId}`, {
          method: 'DELETE',
        });
        return response;
      },
      onSuccess: () => {
        if (capsuleId) {
          queryClient.invalidateQueries({ queryKey: ['/api/career-capsules', capsuleId, 'years'] });
        }
        toast({
          title: "Success!",
          description: "Year goal deleted successfully.",
        });
      },
      onError: (error) => {
        console.error("Error deleting capsule year:", error);
        toast({
          title: "Error",
          description: "Failed to delete year goal. Please try again.",
          variant: "destructive",
        });
      },
    }),
    setCapsuleId,
  };
};

// Hook for fetching tasks for a year
export const useCapsuleTasks = (yearId: number | null) => {
  return useQuery({
    queryKey: ['/api/capsule-years', yearId, 'tasks'],
    queryFn: async () => {
      if (!yearId) return [];
      const response = await apiRequest(`/api/capsule-years/${yearId}/tasks`);
      return response as CapsuleTask[];
    },
    enabled: !!yearId,
  });
};

// Hook for creating a task
export const useCreateCapsuleTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ yearId, data }: { yearId: number, data: Omit<CapsuleTask, 'id' | 'yearId' | 'createdAt' | 'updatedAt'> }) => {
      const response = await apiRequest(`/api/capsule-years/${yearId}/tasks`, {
        method: 'POST',
        data,
      });
      return response as CapsuleTask;
    },
    onSuccess: (data, { yearId }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/capsule-years', yearId, 'tasks'] });
      toast({
        title: "Success!",
        description: "Task added successfully.",
      });
    },
    onError: (error) => {
      console.error("Error creating capsule task:", error);
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Hook for updating a task
export const useUpdateCapsuleTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ taskId, data }: { taskId: number, data: Partial<CapsuleTask> }) => {
      const response = await apiRequest(`/api/capsule-tasks/${taskId}`, {
        method: 'PUT',
        data,
      });
      return response as CapsuleTask;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/capsule-years', data.yearId, 'tasks'] });
      toast({
        title: "Success!",
        description: "Task updated successfully.",
      });
    },
    onError: (error) => {
      console.error("Error updating capsule task:", error);
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Hook for toggling task completion
export const useToggleTaskCompletion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ taskId }: { taskId: number }) => {
      const response = await apiRequest(`/api/capsule-tasks/${taskId}/toggle`, {
        method: 'POST',
      });
      return response as CapsuleTask;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/capsule-years', data.yearId, 'tasks'] });
      toast({
        title: "Success!",
        description: data.isCompleted ? "Task marked as completed." : "Task marked as incomplete.",
      });
    },
    onError: (error) => {
      console.error("Error toggling task completion:", error);
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Hook for deleting a task
export const useDeleteCapsuleTask = () => {
  const queryClient = useQueryClient();
  const [yearId, setYearId] = useState<number | null>(null);
  
  return {
    ...useMutation({
      mutationFn: async ({ taskId }: { taskId: number }) => {
        const response = await apiRequest(`/api/capsule-tasks/${taskId}`, {
          method: 'DELETE',
        });
        return response;
      },
      onSuccess: () => {
        if (yearId) {
          queryClient.invalidateQueries({ queryKey: ['/api/capsule-years', yearId, 'tasks'] });
        }
        toast({
          title: "Success!",
          description: "Task deleted successfully.",
        });
      },
      onError: (error) => {
        console.error("Error deleting capsule task:", error);
        toast({
          title: "Error",
          description: "Failed to delete task. Please try again.",
          variant: "destructive",
        });
      },
    }),
    setYearId,
  };
};

// Hook for fetching journals for a year
export const useCapsuleJournals = (yearId: number | null) => {
  return useQuery({
    queryKey: ['/api/capsule-years', yearId, 'journals'],
    queryFn: async () => {
      if (!yearId) return [];
      const response = await apiRequest(`/api/capsule-years/${yearId}/journals`);
      return response as CapsuleJournal[];
    },
    enabled: !!yearId,
  });
};

// Hook for creating a journal
export const useCreateCapsuleJournal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ yearId, data }: { yearId: number, data: Omit<CapsuleJournal, 'id' | 'yearId' | 'createdAt' | 'updatedAt'> }) => {
      const response = await apiRequest(`/api/capsule-years/${yearId}/journals`, {
        method: 'POST',
        data,
      });
      return response as CapsuleJournal;
    },
    onSuccess: (data, { yearId }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/capsule-years', yearId, 'journals'] });
      toast({
        title: "Success!",
        description: "Journal entry added successfully.",
      });
    },
    onError: (error) => {
      console.error("Error creating capsule journal:", error);
      toast({
        title: "Error",
        description: "Failed to add journal entry. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Hook for updating a journal
export const useUpdateCapsuleJournal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ journalId, data }: { journalId: number, data: Partial<CapsuleJournal> }) => {
      const response = await apiRequest(`/api/capsule-journals/${journalId}`, {
        method: 'PUT',
        data,
      });
      return response as CapsuleJournal;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/capsule-years', data.yearId, 'journals'] });
      toast({
        title: "Success!",
        description: "Journal entry updated successfully.",
      });
    },
    onError: (error) => {
      console.error("Error updating capsule journal:", error);
      toast({
        title: "Error",
        description: "Failed to update journal entry. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Hook for deleting a journal
export const useDeleteCapsuleJournal = () => {
  const queryClient = useQueryClient();
  const [yearId, setYearId] = useState<number | null>(null);
  
  return {
    ...useMutation({
      mutationFn: async ({ journalId }: { journalId: number }) => {
        const response = await apiRequest(`/api/capsule-journals/${journalId}`, {
          method: 'DELETE',
        });
        return response;
      },
      onSuccess: () => {
        if (yearId) {
          queryClient.invalidateQueries({ queryKey: ['/api/capsule-years', yearId, 'journals'] });
        }
        toast({
          title: "Success!",
          description: "Journal entry deleted successfully.",
        });
      },
      onError: (error) => {
        console.error("Error deleting capsule journal:", error);
        toast({
          title: "Error",
          description: "Failed to delete journal entry. Please try again.",
          variant: "destructive",
        });
      },
    }),
    setYearId,
  };
};