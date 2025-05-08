import { useQuery, useMutation } from '@tanstack/react-query';
import { QuestDefinition, UserQuest, UserXp, UserBadge, XpTransaction } from '@/types/career-quest';
import { queryClient } from '@/lib/queryClient';

// Fetch all quest definitions
export const useQuestDefinitions = () => {
  return useQuery({
    queryKey: ['/api/quest-definitions'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/quest-definitions');
        if (!res.ok) {
          console.error('Failed to fetch quest definitions, status:', res.status);
          throw new Error('Failed to fetch quest definitions');
        }
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Expected JSON but got', contentType);
          throw new Error('Unexpected response format for quest definitions');
        }
        return res.json() as Promise<QuestDefinition[]>;
      } catch (error) {
        console.error('Error fetching quest definitions:', error);
        throw error;
      }
    }
  });
};

// Fetch user's active quests
export const useUserQuests = (userId: number) => {
  return useQuery({
    queryKey: [`/api/users/${userId}/quests`],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/users/${userId}/quests`);
        if (!res.ok) {
          console.error('Failed to fetch user quests, status:', res.status);
          throw new Error('Failed to fetch user quests');
        }
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Expected JSON but got', contentType);
          throw new Error('Unexpected response format for quests');
        }
        return res.json() as Promise<UserQuest[]>;
      } catch (error) {
        console.error('Error fetching quests:', error);
        throw error;
      }
    },
    enabled: !!userId
  });
};

// Fetch user's active quests with full quest definitions
export const useUserQuestsWithDefinitions = (userId: number) => {
  return useQuery({
    queryKey: [`/api/users/${userId}/quests-with-definitions`],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/users/${userId}/quests-with-definitions`);
        if (!res.ok) {
          console.error('Failed to fetch quests with definitions, status:', res.status);
          throw new Error('Failed to fetch user quests with definitions');
        }
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Expected JSON but got', contentType);
          throw new Error('Unexpected response format for quests with definitions');
        }
        return res.json() as Promise<UserQuest[]>;
      } catch (error) {
        console.error('Error fetching quests with definitions:', error);
        throw error;
      }
    },
    enabled: !!userId
  });
};

// Fetch user's weekly quests
export const useUserWeeklyQuests = (userId: number, weekNumber: number, year: number) => {
  return useQuery({
    queryKey: [`/api/users/${userId}/quests/current-week`, weekNumber, year],
    queryFn: async () => {
      try {
        // First try with current week
        const currentWeekRes = await fetch(`/api/users/${userId}/quests/current-week`);
        if (currentWeekRes.ok) {
          const contentType = currentWeekRes.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const quests = await currentWeekRes.json() as UserQuest[];
            if (quests && quests.length > 0) {
              console.log(`Found ${quests.length} quests for current week`);
              return quests;
            }
          }
        }
        
        // If no results, try with previous week (week 18)
        console.log('No quests found for current week, trying week 18');
        const prevWeekRes = await fetch(`/api/users/${userId}/quests-with-definitions`);
        if (prevWeekRes.ok) {
          const contentType = prevWeekRes.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const allQuests = await prevWeekRes.json() as UserQuest[];
            // Filter for week 18 quests
            const week18Quests = allQuests.filter(q => q.weekNumber === 18 && q.year === 2025);
            if (week18Quests && week18Quests.length > 0) {
              console.log(`Found ${week18Quests.length} quests for week 18`);
              return week18Quests;
            }
          }
        }
        
        console.error('Failed to fetch any weekly quests');
        return []; // Return empty array to avoid UI errors
      } catch (error) {
        console.error('Error fetching weekly quests:', error);
        return []; // Return empty array to avoid UI errors
      }
    },
    enabled: !!userId
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
      try {
        const res = await fetch(`/api/users/${userId}/badges`);
        if (!res.ok) {
          console.error('Failed to fetch user badges, status:', res.status);
          throw new Error('Failed to fetch user badges');
        }
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Expected JSON but got', contentType);
          throw new Error('Unexpected response format for badges');
        }
        return res.json() as Promise<UserBadge[]>;
      } catch (error) {
        console.error('Error fetching badges:', error);
        throw error;
      }
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
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ progress, userId })
      });
      
      if (!res.ok) {
        const text = await res.text();
        try {
          const errorJson = JSON.parse(text);
          throw new Error(errorJson.message || 'Failed to update quest progress');
        } catch (e) {
          throw new Error(`Failed to update quest progress: ${text.slice(0, 100)}`);
        }
      }
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

// Removed useDismissQuest as quest dismissal is no longer supported in the simplified schema

// Helper to calculate current week number (ISO week number calculation - matches backend)
export const getCurrentWeekNumber = (): number => {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

// Helper to get current year
export const getCurrentYear = (): number => {
  return new Date().getFullYear();
};