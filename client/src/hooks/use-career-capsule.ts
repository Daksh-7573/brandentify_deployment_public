import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

// Type definitions for Career Capsule data
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
  createdAt: string;
  updatedAt: string;
}

export interface CapsuleJournal {
  id: number;
  yearId: number;
  title: string;
  content: string;
  entryDate: string;
  createdAt: string;
  updatedAt: string;
}

// Hook for fetching user's career capsule
export const useUserCareerCapsule = (userId: number) => {
  return useQuery({
    queryKey: ['/api/users', userId, 'career-capsule'],
    queryFn: async () => {
      try {
        console.log(`Fetching career capsule for user ID: ${userId}`);
        
        if (!userId || userId <= 0) {
          console.log("Invalid user ID for career capsule fetch:", userId);
          return null;
        }
        
        // Force a direct network request, bypassing the cache
        const response = await fetch(`/api/users/${userId}/career-capsule`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        // Handle 404 specifically
        if (response.status === 404) {
          console.log(`No career capsule found for user ${userId}`);
          return null;
        }
        
        // Handle other error status codes
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error fetching career capsule: ${response.status} ${errorText}`);
          throw new Error(`Server error: ${response.status}`);
        }
        
        // Parse the JSON response
        const data = await response.json();
        console.log("Career capsule API response:", data);
        
        // Be more forgiving with response validation
        if (!data) {
          console.log("Empty career capsule response");
          return null;
        }
        
        return data as CareerCapsule;
      } catch (error) {
        console.error("Error fetching career capsule:", error);
        return null; // Return null instead of throwing to avoid breaking the UI
      }
    },
    // Reduce stale time to ensure we get fresh data
    staleTime: 0,
    // Newer version uses gcTime instead of cacheTime
    gcTime: 0,
    // Only enable the query if userId is valid
    enabled: !!userId && userId > 0,
    // Refresh data more frequently 
    refetchInterval: 5000, // Refetch every 5 seconds
    refetchOnWindowFocus: true,
  });
};

// Hook for creating a career capsule
export const useCreateCareerCapsule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, data }: { userId: number, data: Omit<CareerCapsule, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'overallProgress'> }) => {
      console.log(`Creating career capsule for user ID: ${userId}`, data);
      
      if (!userId || userId <= 0) {
        console.error("Invalid user ID for career capsule creation:", userId);
        throw new Error("Invalid user ID");
      }
      
      // Use fetch directly to ensure we're not affected by caching issues
      const response = await fetch(`/api/users/${userId}/career-capsule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error creating career capsule: ${response.status} ${errorText}`);
        throw new Error(`Server error: ${response.status}`);
      }
      
      // Parse the response JSON
      const createdCapsule = await response.json();
      console.log("Career capsule creation response:", createdCapsule);
      
      // After successful creation, immediately fetch the capsule to ensure we have the latest data
      console.log("Fetching updated capsule data after creation");
      const freshDataResponse = await fetch(`/api/users/${userId}/career-capsule`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!freshDataResponse.ok) {
        console.warn("Failed to fetch fresh capsule data after creation, using creation response");
        return createdCapsule as CareerCapsule;
      }
      
      const freshData = await freshDataResponse.json();
      console.log("Fresh career capsule data after creation:", freshData);
      
      // Return the freshly fetched data
      return freshData as CareerCapsule;
    },
    onSuccess: (data, { userId }) => {
      console.log("Successfully created career capsule:", data);
      // Force cache invalidation and refetch
      queryClient.removeQueries({ queryKey: ['/api/users', userId, 'career-capsule'] });
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
      const response = await apiRequest({
        url: `/api/career-capsules/${capsuleId}`,
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
      console.log(`Fetching year goals for capsule ID: ${capsuleId}`);
      
      if (!capsuleId) {
        console.log("No capsule ID provided, returning empty array");
        return [];
      }
      
      try {
        const response = await apiRequest({
          url: `/api/career-capsules/${capsuleId}/years`,
          method: 'GET'
        });
        
        console.log("Year goals API response:", response);
        
        // Check if we got a valid array
        if (!response || !Array.isArray(response)) {
          console.log("Invalid year goals response (not an array):", response);
          return [];
        }
        
        return response as CapsuleYear[];
      } catch (error) {
        console.error(`Error fetching year goals for capsule ${capsuleId}:`, error);
        return [];
      }
    },
    enabled: !!capsuleId,
    staleTime: 30000, // Data remains fresh for 30 seconds
  });
};

// Hook for creating a capsule year
export const useCreateCapsuleYear = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ capsuleId, data }: { 
      capsuleId: number, 
      data: { 
        year?: number; 
        yearNumber?: number;
        title: string; 
        description: string | null;
        goalType: string;
      } 
    }) => {
      console.log(`Creating year goal for capsule ID: ${capsuleId}`, data);
      
      // Validate capsuleId
      if (!capsuleId || isNaN(capsuleId)) {
        console.error("Invalid capsule ID for creating year goal:", capsuleId);
        throw new Error("Invalid capsule ID. Please create a Career Capsule first.");
      }
      
      // Ensure we're sending the expected server-side field names
      const serverData = {
        ...data,
        yearNumber: data.yearNumber || data.year || 1, // Make sure 'yearNumber' is included with a fallback
        goalType: data.goalType || 'milestone', // Ensure goalType is always set
      };
      
      console.log(`Sending year goal data to server:`, serverData);
      
      const response = await apiRequest({
        url: `/api/career-capsules/${capsuleId}/years`,
        method: 'POST',
        data: serverData,
      });
      
      console.log("Year goal creation response:", response);
      
      // Be more flexible in validation for year goal creation
      if (!response) {
        console.error("Empty year goal creation response");
        throw new Error("Empty server response when creating year goal");
      }
      
      return response as CapsuleYear;
    },
    onSuccess: (data) => {
      console.log("Successfully created year goal:", data);
      // Immediately invalidate the cache to force a fresh fetch
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
        description: "Failed to add year goal. Please make sure you've created a Career Capsule first.",
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
      const response = await apiRequest({
        url: `/api/capsule-years/${yearId}`,
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
        const response = await apiRequest({
          url: `/api/capsule-years/${yearId}`,
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
      const response = await apiRequest({
        url: `/api/capsule-years/${yearId}/tasks`,
        method: 'GET'
      });
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
      const response = await apiRequest({
        url: `/api/capsule-years/${yearId}/tasks`,
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
      const response = await apiRequest({
        url: `/api/capsule-tasks/${taskId}`,
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
      const response = await apiRequest({
        url: `/api/capsule-tasks/${taskId}/toggle`,
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
        const response = await apiRequest({
          url: `/api/capsule-tasks/${taskId}`,
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
      const response = await apiRequest({
        url: `/api/capsule-years/${yearId}/journals`,
        method: 'GET'
      });
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
      const response = await apiRequest({
        url: `/api/capsule-years/${yearId}/journals`,
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
      const response = await apiRequest({
        url: `/api/capsule-journals/${journalId}`,
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
        const response = await apiRequest({
          url: `/api/capsule-journals/${journalId}`,
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

// Types for AI milestone generation
export interface MilestoneGenerationOptions {
  goalType?: string;
  customGoal?: string;
  timeframe?: number;
  industry?: string;
  description?: string;
  useModel?: 'openai' | 'anthropic';
}

export interface MilestoneGenerationResponse {
  success: boolean;
  message: string;
  data?: CapsuleYear[];
}

// Hook for generating AI milestones for a career capsule
export const useGenerateCapsuleMilestones = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      capsuleId, 
      options 
    }: { 
      capsuleId: number, 
      options: MilestoneGenerationOptions 
    }) => {
      const response = await apiRequest({
        url: `/api/career-capsules/${capsuleId}/generate-milestones`,
        method: 'POST',
        data: options,
      });
      return response as MilestoneGenerationResponse;
    },
    onSuccess: (data, { capsuleId }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/career-capsules', capsuleId, 'years'] });
      toast({
        title: "Success!",
        description: "AI-powered career milestones generated successfully.",
      });
    },
    onError: (error) => {
      console.error("Error generating capsule milestones:", error);
      toast({
        title: "Error",
        description: "Failed to generate career milestones. Please try again.",
        variant: "destructive",
      });
    },
  });
};