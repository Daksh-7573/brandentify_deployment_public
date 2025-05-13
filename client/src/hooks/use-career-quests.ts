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
export const useUserQuests = (userId?: number) => {
  return useQuery({
    queryKey: [userId ? `/api/users/${userId}/quests` : null],
    queryFn: async () => {
      if (!userId) {
        return [] as UserQuest[]; // Return empty array if no user ID provided
      }
      
      try {
        const res = await fetch(`/api/users/${userId}/quests`);
        if (!res.ok) {
          console.error('Failed to fetch user quests, status:', res.status);
          return [] as UserQuest[]; // Return empty array on error to avoid UI crashes
        }
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Expected JSON but got', contentType);
          return [] as UserQuest[]; // Return empty array on error to avoid UI crashes
        }
        return res.json() as Promise<UserQuest[]>;
      } catch (error) {
        console.error('Error fetching quests:', error);
        return [] as UserQuest[]; // Return empty array on error to avoid UI crashes
      }
    },
    enabled: !!userId
  });
};

// Fetch user's active quests with full quest definitions
export const useUserQuestsWithDefinitions = (userId?: number) => {
  return useQuery({
    queryKey: [userId ? `/api/users/${userId}/quests-with-definitions` : null],
    queryFn: async () => {
      if (!userId) {
        return [] as UserQuest[]; // Return empty array if no user ID
      }
      
      try {
        const res = await fetch(`/api/users/${userId}/quests-with-definitions`);
        if (!res.ok) {
          console.error('Failed to fetch quests with definitions, status:', res.status);
          return [] as UserQuest[]; // Return empty array on error
        }
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Expected JSON but got', contentType);
          return [] as UserQuest[]; // Return empty array on error
        }
        return res.json() as Promise<UserQuest[]>;
      } catch (error) {
        console.error('Error fetching quests with definitions:', error);
        return [] as UserQuest[]; // Return empty array on error
      }
    },
    enabled: !!userId
  });
};

// Fetch user's weekly quests
export const useUserWeeklyQuests = (userId?: number, weekNumber?: number, year?: number) => {
  const currentWeek = weekNumber || getCurrentWeekNumber(new Date());
  const currentYear = year || getCurrentYear();
  
  return useQuery({
    queryKey: [userId ? `/api/users/${userId}/quests/current-week` : null, currentWeek, currentYear],
    queryFn: async () => {
      // If no user ID provided, return empty array
      if (!userId) {
        return [] as UserQuest[];
      }
      
      try {
        // Get quests for current week for this user
        const currentWeekRes = await fetch(`/api/users/${userId}/quests/current-week`);
        if (currentWeekRes.ok) {
          const contentType = currentWeekRes.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const quests = await currentWeekRes.json() as UserQuest[];
            // Only return ACTIVE quests for the weekly tab
            const activeQuests = quests.filter(quest => quest.status === 'active');
            if (activeQuests && activeQuests.length > 0) {
              console.log(`Found ${activeQuests.length} active quests for current week for user ${userId}`);
              return activeQuests;
            }
          }
        }
        
        console.log(`No active quests found for user ${userId} in current week`);
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
export const useUserXp = (userId?: number) => {
  return useQuery({
    queryKey: [userId ? `/api/users/${userId}/xp` : null],
    queryFn: async () => {
      if (!userId) {
        // Return default XP object if no user ID provided
        return { 
          total: 0,
          level: 0,
          nextLevelXp: 100,
          currentLevelXp: 0,
          progressToNextLevel: 0
        } as UserXp;
      }
      
      try {
        const res = await fetch(`/api/users/${userId}/xp`);
        if (!res.ok) {
          console.error('Failed to fetch user XP, status:', res.status);
          // Return default XP object on error
          return { 
            total: 0,
            level: 0,
            nextLevelXp: 100,
            currentLevelXp: 0,
            progressToNextLevel: 0
          } as UserXp;
        }
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Expected JSON but got', contentType);
          // Return default XP object on error
          return { 
            total: 0,
            level: 0,
            nextLevelXp: 100,
            currentLevelXp: 0,
            progressToNextLevel: 0
          } as UserXp;
        }
        return res.json() as Promise<UserXp>;
      } catch (error) {
        console.error('Error fetching XP:', error);
        // Return default XP object on error
        return { 
          total: 0,
          level: 0,
          nextLevelXp: 100,
          currentLevelXp: 0,
          progressToNextLevel: 0
        } as UserXp;
      }
    },
    enabled: !!userId
  });
};

// Fetch user's badges
export const useUserBadges = (userId?: number) => {
  return useQuery({
    queryKey: [userId ? `/api/users/${userId}/badges` : null],
    queryFn: async () => {
      if (!userId) {
        return [] as UserBadge[]; // Return empty array if no user ID
      }
      
      try {
        const res = await fetch(`/api/users/${userId}/badges`);
        if (!res.ok) {
          console.error('Failed to fetch user badges, status:', res.status);
          return [] as UserBadge[]; // Return empty array on error
        }
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Expected JSON but got', contentType);
          return [] as UserBadge[]; // Return empty array on error
        }
        return res.json() as Promise<UserBadge[]>;
      } catch (error) {
        console.error('Error fetching badges:', error);
        return [] as UserBadge[]; // Return empty array on error
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