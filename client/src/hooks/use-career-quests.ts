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
    queryKey: ['/api/user-quests', userId],
    queryFn: async () => {
      const res = await fetch(`/api/user-quests/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch user quests');
      return res.json() as Promise<UserQuest[]>;
    },
    enabled: !!userId
  });
};

// Fetch user's active quests with full quest definitions
export const useUserQuestsWithDefinitions = (userId: number) => {
  return useQuery({
    queryKey: ['/api/user-quests-with-definitions', userId],
    queryFn: async () => {
      const res = await fetch(`/api/user-quests-with-definitions/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch user quests with definitions');
      return res.json() as Promise<UserQuest[]>;
    },
    enabled: !!userId
  });
};

// Fetch user's weekly quests
export const useUserWeeklyQuests = (userId: number, weekNumber: number, year: number) => {
  return useQuery({
    queryKey: ['/api/user-quests/weekly', userId, weekNumber, year],
    queryFn: async () => {
      const res = await fetch(`/api/user-quests/weekly/${userId}/${weekNumber}/${year}`);
      if (!res.ok) throw new Error('Failed to fetch weekly quests');
      return res.json() as Promise<UserQuest[]>;
    },
    enabled: !!userId && !!weekNumber && !!year
  });
};

// Fetch user's XP information
export const useUserXp = (userId: number) => {
  return useQuery({
    queryKey: ['/api/users/:userId/xp', userId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}/xp`);
      if (!res.ok) throw new Error('Failed to fetch user XP');
      return res.json() as Promise<UserXp>;
    },
    enabled: !!userId
  });
};

// Fetch user's badges
export const useUserBadges = (userId: number) => {
  return useQuery({
    queryKey: ['/api/users/:userId/badges', userId],
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
    queryKey: ['/api/users/:userId/xp-transactions', userId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}/xp-transactions`);
      if (!res.ok) throw new Error('Failed to fetch XP transactions');
      return res.json() as Promise<XpTransaction[]>;
    },
    enabled: !!userId
  });
};

// Update quest progress
export const useUpdateQuestProgress = () => {
  return useMutation({
    mutationFn: async ({ 
      questId, 
      progress 
    }: { 
      questId: number; 
      progress: number 
    }) => {
      const res = await fetch(`/api/user-quests/${questId}/progress`, {
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
      queryClient.invalidateQueries({ queryKey: ['/api/users/:userId/quests', data.userId] });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/users/:userId/quests/current-week', data.userId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/user-quests-with-definitions', data.userId] 
      });
      
      // If quest was completed, also invalidate XP and badges
      if (data.status === 'completed') {
        queryClient.invalidateQueries({ queryKey: ['/api/users/:userId/xp', data.userId] });
        queryClient.invalidateQueries({ queryKey: ['/api/users/:userId/badges', data.userId] });
        queryClient.invalidateQueries({ queryKey: ['/api/users/:userId/xp-transactions', data.userId] });
      }
    }
  });
};

// Complete a quest
export const useCompleteQuest = () => {
  return useMutation({
    mutationFn: async ({ 
      questId 
    }: { 
      questId: number 
    }) => {
      const res = await fetch(`/api/user-quests/${questId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) throw new Error('Failed to complete quest');
      return res.json() as Promise<UserQuest>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-quests', data.userId] });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/user-quests/weekly', data.userId, data.weekNumber, data.year] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/user-quests-with-definitions', data.userId] 
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users/:userId/xp', data.userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/:userId/badges', data.userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/:userId/xp-transactions', data.userId] });
    }
  });
};

// Dismiss a quest
export const useDismissQuest = () => {
  return useMutation({
    mutationFn: async ({ 
      questId, 
      reason 
    }: { 
      questId: number; 
      reason?: string 
    }) => {
      const res = await fetch(`/api/user-quests/${questId}/dismiss`, {
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
      queryClient.invalidateQueries({ queryKey: ['/api/user-quests', data.userId] });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/user-quests/weekly', data.userId, data.weekNumber, data.year] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/user-quests-with-definitions', data.userId] 
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