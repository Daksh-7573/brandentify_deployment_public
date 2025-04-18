import { useQuery, useMutation } from '@tanstack/react-query';
import { QuestDefinition, UserQuest, UserXp, UserBadge, XpTransaction } from '@/types/career-quest';
import { queryClient } from '@/lib/queryClient';

// Fetch all quest definitions
export const useQuestDefinitions = () => {
  return useQuery({
    queryKey: ['/api/quest-definitions'],
    queryFn: async () => {
      const res = await fetch('/api/quest-definitions');
      if (!res.ok) throw new Error('Failed to fetch quest definitions');
      return res.json() as Promise<QuestDefinition[]>;
    }
  });
};

// Fetch user's active quests
export const useUserQuests = (userId: number) => {
  return useQuery({
    queryKey: [`/api/users/${userId}/quests`],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}/quests`);
      if (!res.ok) throw new Error('Failed to fetch user quests');
      return res.json() as Promise<UserQuest[]>;
    },
    enabled: !!userId
  });
};

// Fetch user's active quests with full quest definitions
export const useUserQuestsWithDefinitions = (userId: number) => {
  return useQuery({
    queryKey: [`/api/users/${userId}/quests-with-definitions`],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}/quests-with-definitions`);
      if (!res.ok) throw new Error('Failed to fetch user quests with definitions');
      return res.json() as Promise<UserQuest[]>;
    },
    enabled: !!userId
  });
};

// Fetch user's weekly quests
export const useUserWeeklyQuests = (userId: number, weekNumber: number, year: number) => {
  return useQuery({
    queryKey: [`/api/users/${userId}/quests/current-week`],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}/quests/current-week?week=${weekNumber}&year=${year}`);
      if (!res.ok) throw new Error('Failed to fetch weekly quests');
      return res.json() as Promise<UserQuest[]>;
    },
    enabled: !!userId && !!weekNumber && !!year
  });
};

// Fetch user's XP information
export const useUserXp = (userId: number) => {
  return useQuery({
    queryKey: [`/api/users/${userId}/xp`],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/users/${userId}/xp`);
        if (!res.ok) {
          console.error('Failed to fetch user XP, status:', res.status);
          throw new Error('Failed to fetch user XP');
        }
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Expected JSON but got', contentType);
          throw new Error('Unexpected response format');
        }
        return res.json() as Promise<UserXp>;
      } catch (error) {
        console.error('Error fetching XP:', error);
        throw error;
      }
    },
    enabled: !!userId
  });
};

// Fetch user's badges
export const useUserBadges = (userId: number) => {
  return useQuery({
    queryKey: [`/api/users/${userId}/badges`],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}/badges`);
      if (!res.ok) throw new Error('Failed to fetch user badges');
      return res.json() as Promise<UserBadge[]>;
    },
    enabled: !!userId
  });
};

// Fetch user's XP transactions
export const useXpTransactions = (userId: number) => {
  return useQuery({
    queryKey: [`/api/users/${userId}/xp-transactions`],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/users/${userId}/xp-transactions`);
        if (!res.ok) {
          console.error('Failed to fetch XP transactions, status:', res.status);
          throw new Error('Failed to fetch XP transactions');
        }
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Expected JSON but got', contentType);
          throw new Error('Unexpected response format for XP transactions');
        }
        return res.json() as Promise<XpTransaction[]>;
      } catch (error) {
        console.error('Error fetching XP transactions:', error);
        throw error;
      }
    },
    enabled: !!userId
  });
};

// Update quest progress
export const useUpdateQuestProgress = () => {
  return useMutation({
    mutationFn: async ({ 
      questId, 
      progress,
      userId 
    }: { 
      questId: number; 
      progress: number;
      userId: number
    }) => {
      const res = await fetch(`/api/users/${userId}/quests/${questId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ progress })
      });
      
      if (!res.ok) throw new Error('Failed to update quest progress');
      return res.json() as Promise<UserQuest>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${data.userId}/quests`] });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/users/${data.userId}/quests/current-week`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/users/${data.userId}/quests-with-definitions`] 
      });
      
      // If quest was completed, also invalidate XP and badges
      if (data.status === 'completed') {
        queryClient.invalidateQueries({ queryKey: [`/api/users/${data.userId}/xp`] });
        queryClient.invalidateQueries({ queryKey: [`/api/users/${data.userId}/badges`] });
        queryClient.invalidateQueries({ queryKey: [`/api/users/${data.userId}/xp-transactions`] });
      }
    }
  });
};

// Complete a quest
export const useCompleteQuest = () => {
  return useMutation({
    mutationFn: async ({ 
      questId,
      userId
    }: { 
      questId: number,
      userId: number
    }) => {
      const res = await fetch(`/api/users/${userId}/quests/${questId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) throw new Error('Failed to complete quest');
      return res.json() as Promise<UserQuest>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${data.userId}/quests`] });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/users/${data.userId}/quests/current-week`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/users/${data.userId}/quests-with-definitions`] 
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${data.userId}/xp`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${data.userId}/badges`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${data.userId}/xp-transactions`] });
    }
  });
};

// Dismiss a quest
export const useDismissQuest = () => {
  return useMutation({
    mutationFn: async ({ 
      questId, 
      reason,
      userId
    }: { 
      questId: number; 
      reason?: string;
      userId: number
    }) => {
      const res = await fetch(`/api/users/${userId}/quests/${questId}/dismiss`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      
      if (!res.ok) throw new Error('Failed to dismiss quest');
      return res.json() as Promise<UserQuest>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${data.userId}/quests`] });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/users/${data.userId}/quests/current-week`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/users/${data.userId}/quests-with-definitions`] 
      });
    }
  });
};

// Helper to calculate current week number
export const getCurrentWeekNumber = (): number => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.floor(diff / oneWeek) + 1;
};

// Helper to get current year
export const getCurrentYear = (): number => {
  return new Date().getFullYear();
};