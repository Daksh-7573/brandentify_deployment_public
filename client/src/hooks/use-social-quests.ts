import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentWeekNumber, getCurrentYear } from './use-career-quests';

// Social Quest API types
interface SocialQuestTask {
  id: number;
  title: string;
  description: string;
  platform: 'linkedin' | 'twitter' | 'instagram' | 'youtube';
  priority: number;
  xpReward: number;
  status: 'active' | 'completed' | 'expired';
  progress: number;
  targetAction: string;
  muskTip: string;
  aiGeneratedContent: string;
  platformRecommendationReason: string;
  platformSpecificData: Record<string, any>;
  assignedAt: string;
  completedAt?: string;
  weekNumber: number;
  year: number;
}

interface GenerateSocialQuestsResponse {
  success: boolean;
  tasks: SocialQuestTask[];
  platformBreakdown: Record<string, number>;
  message?: string;
  error?: string;
}

// Hook to generate new Social Quests for current week
export function useGenerateSocialQuests(userId?: number) {
  const queryClient = useQueryClient();
  
  return useMutation<GenerateSocialQuestsResponse, Error, { weekNumber?: number; year?: number }>({
    mutationFn: async ({ weekNumber, year }) => {
      if (!userId) throw new Error('User ID is required');
      
      const currentWeek = weekNumber || getCurrentWeekNumber();
      const currentYear = year || getCurrentYear();
      
      const response = await fetch(`/api/social-quests/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          weekNumber: currentWeek,
          year: currentYear
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate social quests');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate social quests cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ['social-quests'] });
    }
  });
}

// Hook to fetch user's Social Quests
export function useSocialQuests(userId?: number, weekNumber?: number, year?: number) {
  const currentWeek = weekNumber || getCurrentWeekNumber();
  const currentYear = year || getCurrentYear();
  
  return useQuery<SocialQuestTask[]>({
    queryKey: ['social-quests', userId, currentWeek, currentYear],
    queryFn: async () => {
      if (!userId) return [];
      
      const response = await fetch(`/api/social-quests/user/${userId}?weekNumber=${currentWeek}&year=${currentYear}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch social quests');
      }
      
      const data = await response.json();
      
      // Valid external platforms only - filter out brandentifier or unknown platforms
      const validPlatforms = ['linkedin', 'twitter', 'instagram', 'youtube'];
      const filteredQuests = (data.quests || []).filter((quest: any) => {
        const platform = quest.platform?.toLowerCase();
        return platform && validPlatforms.includes(platform);
      });
      
      return filteredQuests;
    },
    enabled: !!userId
  });
}

// Hook to complete a Social Quest
export function useCompleteSocialQuest() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, { questId: number; userId: number }>({
    mutationFn: async ({ questId, userId }) => {
      const response = await fetch(`/api/social-quests/${questId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to complete social quest');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-quests'] });
    }
  });
}

// Hook to get platform-specific guidance - EXTERNAL platforms only
export function usePlatformGuidance() {
  const platformData = {
    linkedin: {
      icon: '💼', 
      name: 'LinkedIn',
      color: 'from-blue-600 to-blue-800',
      focus: 'Primary External Platform - Cross-promote your Brandentifier achievements'
    },
    twitter: {
      icon: '🐦',
      name: 'Twitter/X', 
      color: 'from-gray-700 to-black',
      focus: 'Share industry insights and drive traffic to your Brandentifier profile'
    },
    instagram: {
      icon: '📸',
      name: 'Instagram',
      color: 'from-pink-500 to-purple-600', 
      focus: 'Visual content to showcase your professional brand'
    },
    youtube: {
      icon: '🎥',
      name: 'YouTube',
      color: 'from-red-500 to-red-700',
      focus: 'Long-form educational content linking back to Brandentifier'
    }
  };
  
  return platformData;
}

// Hook to fetch weekly Social Quests for user
export function useWeeklySocialQuests(userId?: number) {
  return useQuery<SocialQuestTask[]>({
    queryKey: ['social-quests', 'weekly', userId],
    queryFn: async () => {
      if (!userId) return [];

      const response = await fetch(`/api/social-quests/user/${userId}/weekly`);
      if (!response.ok) {
        throw new Error('Failed to fetch weekly social quests');
      }

      const data = await response.json();
      return data.quests || [];
    },
    enabled: !!userId,
  });
}

// Hook to fetch completed Social Quests for user
export function useCompletedSocialQuests(userId?: number, page = 1, limit = 20) {
  return useQuery<{ quests: SocialQuestTask[], pagination: { page: number, limit: number, hasMore: boolean } }>({
    queryKey: ['social-quests', 'completed', userId, page, limit],
    queryFn: async () => {
      if (!userId) return { quests: [], pagination: { page: 1, limit: 20, hasMore: false } };

      const response = await fetch(`/api/social-quests/user/${userId}/completed?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch completed social quests');
      }

      return response.json();
    },
    enabled: !!userId,
  });
}

// Hook to fetch missed Social Quests for user
export function useMissedSocialQuests(userId?: number, page = 1, limit = 20) {
  return useQuery<{ quests: SocialQuestTask[], pagination: { page: number, limit: number, hasMore: boolean } }>({
    queryKey: ['social-quests', 'missed', userId, page, limit],
    queryFn: async () => {
      if (!userId) return { quests: [], pagination: { page: 1, limit: 20, hasMore: false } };

      const response = await fetch(`/api/social-quests/user/${userId}/missed?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch missed social quests');
      }

      return response.json();
    },
    enabled: !!userId,
  });
}

// Hook to complete a Social Quest
export function useCompleteSocialQuest(userId?: number) {
  const queryClient = useQueryClient();
  
  return useMutation<any, Error, { questId: number }>({
    mutationFn: async ({ questId }) => {
      if (!userId || !questId) throw new Error('User ID and Quest ID are required');
      
      const response = await fetch(`/api/social-quests/user/${userId}/quest/${questId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      if (!response.ok) {
        throw new Error('Failed to complete social quest');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all social quest queries to refresh the lists
      queryClient.invalidateQueries({ queryKey: ['social-quests'] });
    }
  });
}