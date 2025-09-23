import { useQuery, useMutation } from '@tanstack/react-query';
import { QuestDefinition, UserQuest, UserXp, UserBadge, XpTransaction } from '@/types/career-quest';
import { queryClient } from '@/lib/queryClient';

// Social Quest Hooks
export const useSocialQuestDefinitions = () => {
  return useQuery({
    queryKey: ['/api/social-quest-definitions'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/social-quest-definitions');
        if (!res.ok) {
          console.error('Failed to fetch social quest definitions, status:', res.status);
          return [];
        }
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Expected JSON but got', contentType);
          return [];
        }
        return res.json();
      } catch (error) {
        console.error('Error fetching social quest definitions:', error);
        return [];
      }
    }
  });
};

export const useUserSocialQuests = (userId?: number) => {
  return useQuery({
    queryKey: [userId ? `/api/users/${userId}/social-quests` : null],
    queryFn: async () => {
      if (!userId) {
        return [];
      }
      
      try {
        const res = await fetch(`/api/users/${userId}/social-quests`);
        if (!res.ok) {
          console.error('Failed to fetch user social quests, status:', res.status);
          return [];
        }
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Expected JSON but got', contentType);
          return [];
        }
        return res.json();
      } catch (error) {
        console.error('Error fetching user social quests:', error);
        return [];
      }
    },
    enabled: !!userId
  });
};

export const useUserSocialQuestsWithDefinitions = (userId?: number) => {
  return useQuery({
    queryKey: [userId ? `/api/users/${userId}/social-quests-with-definitions` : null],
    queryFn: async () => {
      if (!userId) {
        return [];
      }
      
      try {
        const res = await fetch(`/api/users/${userId}/social-quests-with-definitions`);
        if (!res.ok) {
          console.error('Failed to fetch user social quests with definitions, status:', res.status);
          return [];
        }
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Expected JSON but got', contentType);
          return [];
        }
        return res.json();
      } catch (error) {
        console.error('Error fetching user social quests with definitions:', error);
        return [];
      }
    },
    enabled: !!userId
  });
};

// Combined Quest Hook - integrates both career and social quests
export const useCombinedUserQuests = (userId?: number) => {
  const {
    data: careerQuests,
    isLoading: isLoadingCareer,
    error: careerError,
    refetch: refetchCareer
  } = useUserQuestsWithDefinitions(userId);
  
  const {
    data: socialQuests,
    isLoading: isLoadingSocial,
    error: socialError,
    refetch: refetchSocial
  } = useUserSocialQuestsWithDefinitions(userId);
  
  const isLoading = isLoadingCareer || isLoadingSocial;
  const error = careerError || socialError;
  
  // Combine both quest arrays
  const combinedQuests = [
    ...(careerQuests || []).map((quest: any) => ({ ...quest, questType: 'career' })),
    ...(socialQuests || []).map((quest: any) => ({ ...quest, questType: 'social' }))
  ];
  
  const refetch = () => {
    refetchCareer();
    refetchSocial();
  };
  
  return {
    data: combinedQuests,
    isLoading,
    error,
    refetch
  };
};

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
  const currentWeek = weekNumber || getCurrentWeekNumber();
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

// Fetch user's daily quests (career only)
export const useUserDailyQuests = (userId?: number) => {
  const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  return useQuery({
    queryKey: [userId ? `/api/users/${userId}/quests/current-day` : null, currentDate],
    queryFn: async () => {
      // If no user ID provided, return empty array
      if (!userId) {
        return [] as UserQuest[];
      }
      
      try {
        // Get quests for current day for this user
        const currentDayRes = await fetch(`/api/users/${userId}/quests/current-day`);
        if (currentDayRes.ok) {
          const contentType = currentDayRes.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const quests = await currentDayRes.json() as UserQuest[];
            // Only return ACTIVE quests for the daily tab
            const activeQuests = quests.filter(quest => quest.status === 'active');
            if (activeQuests && activeQuests.length > 0) {
              console.log(`Found ${activeQuests.length} active career quests for current day for user ${userId}`);
              return activeQuests;
            }
          }
        }
        
        console.log(`No active career quests found for user ${userId} for current day`);
        return []; // Return empty array to avoid UI errors
      } catch (error) {
        console.error('Error fetching daily career quests:', error);
        return []; // Return empty array to avoid UI errors
      }
    },
    enabled: !!userId
  });
};

// Fetch user's daily social quests
export const useUserDailySocialQuests = (userId?: number) => {
  const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  return useQuery({
    queryKey: [userId ? `/api/users/${userId}/social-quests/current-day` : null, currentDate],
    queryFn: async () => {
      // If no user ID provided, return empty array
      if (!userId) {
        return [] as any[];
      }
      
      try {
        // Get social quests for current day for this user
        const currentDayRes = await fetch(`/api/users/${userId}/social-quests/current-day`);
        if (currentDayRes.ok) {
          const contentType = currentDayRes.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const quests = await currentDayRes.json() as any[];
            // Only return ACTIVE quests for the daily tab
            const activeQuests = quests.filter(quest => quest.status === 'active');
            if (activeQuests && activeQuests.length > 0) {
              console.log(`Found ${activeQuests.length} active social quests for current day for user ${userId}`);
              return activeQuests;
            }
          }
        }
        
        console.log(`No active social quests found for user ${userId} for current day`);
        return []; // Return empty array to avoid UI errors
      } catch (error) {
        console.error('Error fetching daily social quests:', error);
        return []; // Return empty array to avoid UI errors
      }
    },
    enabled: !!userId
  });
};

// Combined daily quests (both career and social)
export const useUserCombinedDailyQuests = (userId?: number) => {
  const {
    data: careerQuests,
    isLoading: isLoadingCareer,
    error: careerError,
    refetch: refetchCareer
  } = useUserDailyQuests(userId);
  
  const {
    data: socialQuests,
    isLoading: isLoadingSocial,
    error: socialError,
    refetch: refetchSocial
  } = useUserDailySocialQuests(userId);
  
  const isLoading = isLoadingCareer || isLoadingSocial;
  const error = careerError || socialError;
  
  // Combine both quest arrays
  const combinedQuests = [
    ...(careerQuests || []).map((quest: any) => ({ ...quest, questType: 'career' })),
    ...(socialQuests || []).map((quest: any) => ({ ...quest, questType: 'social' }))
  ];
  
  const refetch = () => {
    refetchCareer();
    refetchSocial();
  };
  
  return {
    data: combinedQuests,
    isLoading,
    error,
    refetch
  };
};

// Assign daily quests to user
export const useAssignDailyQuests = () => {
  return useMutation({
    mutationFn: async ({ userId }: { userId: number }) => {
      const res = await fetch(`/api/users/${userId}/quests/assign-daily`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) {
        const text = await res.text();
        try {
          const errorJson = JSON.parse(text);
          throw new Error(errorJson.message || 'Failed to assign daily quests');
        } catch (e) {
          throw new Error(`Failed to assign daily quests: ${text.slice(0, 100)}`);
        }
      }
      return res.json() as Promise<UserQuest[]>;
    },
    onSuccess: (data, variables) => {
      // Invalidate daily quest cache to show new quests
      queryClient.invalidateQueries({ 
        queryKey: [`/api/users/${variables.userId}/quests/current-day`] 
      });
      // Also invalidate other quest caches
      queryClient.invalidateQueries({ 
        queryKey: [`/api/users/${variables.userId}/quests`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/users/${variables.userId}/quests-with-definitions`] 
      });
    }
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
          balance: 0,
          lifetimeEarned: 0,
          currentMonthEarned: 0
        } as UserXp;
      }
      
      try {
        const res = await fetch(`/api/users/${userId}/xp`);
        if (!res.ok) {
          console.error('Failed to fetch user XP, status:', res.status);
          // Return default XP object on error
          return { 
            balance: 0,
            lifetimeEarned: 0,
            currentMonthEarned: 0
          } as UserXp;
        }
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Expected JSON but got', contentType);
          // Return default XP object on error
          return { 
            balance: 0,
            lifetimeEarned: 0,
            currentMonthEarned: 0
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
        queryKey: [`/api/users/${data.userId}/quests/current-day`] 
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

// Complete a quest with optimistic updates
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
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ earnedXp: 25 })
      });
      
      if (!res.ok) {
        const text = await res.text();
        try {
          const errorJson = JSON.parse(text);
          throw new Error(errorJson.message || 'Failed to complete quest');
        } catch (e) {
          throw new Error(`Failed to complete quest: ${text.slice(0, 100)}`);
        }
      }
      return res.json() as Promise<UserQuest>;
    },
    
    // Optimistic updates for immediate UI feedback
    onMutate: async ({ questId, userId }) => {
      // Cancel all outgoing queries that might interfere
      await queryClient.cancelQueries({ 
        predicate: (query) => 
          query.queryKey[0]?.toString()?.includes(`/api/users/${userId}/quests`) ?? false
      });

      // Snapshot the previous values for rollback
      const previousWeeklyQuests = queryClient.getQueryData([`/api/users/${userId}/quests/current-week`]);
      const previousAllQuests = queryClient.getQueryData([`/api/users/${userId}/quests-with-definitions`]);

      // Get current timestamp
      const completedAt = new Date().toISOString();

      // Optimistically remove from weekly cache immediately
      queryClient.setQueryData([`/api/users/${userId}/quests/current-week`], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        const filtered = old.filter((quest: any) => quest.id !== questId);
        console.log(`[OPTIMISTIC] Removed quest ${questId} from weekly cache. Count: ${old.length} -> ${filtered.length}`);
        console.log(`[OPTIMISTIC] Remaining quest IDs:`, filtered.map((q: any) => q.id));
        return filtered;
      });

      // Optimistically remove from daily cache immediately
      queryClient.setQueryData([`/api/users/${userId}/quests/current-day`], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        const filtered = old.filter((quest: any) => quest.id !== questId);
        console.log(`[OPTIMISTIC] Removed quest ${questId} from daily cache. Count: ${old.length} -> ${filtered.length}`);
        return filtered;
      });

      // Optimistically update in all-quests cache
      queryClient.setQueryData([`/api/users/${userId}/quests-with-definitions`], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((quest: any) => 
          quest.id === questId 
            ? { 
                ...quest, 
                status: 'completed', 
                completedAt,
                xpEarned: quest.questDefinition?.xpReward || quest.xpReward || 0
              }
            : quest
        );
      });

      // Snapshot the previous daily quests for rollback
      const previousDailyQuests = queryClient.getQueryData([`/api/users/${userId}/quests/current-day`]);

      // Return context for potential rollback
      return { previousWeeklyQuests, previousDailyQuests, previousAllQuests, questId, userId };
    },

    // If mutation fails, use the context returned from onMutate to roll back
    onError: (err, variables, context) => {
      if (context) {
        queryClient.setQueryData([`/api/users/${context.userId}/quests/current-week`], context.previousWeeklyQuests);
        queryClient.setQueryData([`/api/users/${context.userId}/quests/current-day`], context.previousDailyQuests);
        queryClient.setQueryData([`/api/users/${context.userId}/quests-with-definitions`], context.previousAllQuests);
      }
    },

    // Always refetch after error or success to ensure consistency
    onSettled: (data, error, variables) => {
      console.log(`[REFETCH] Starting refetch for quest ${variables.questId} completion`);
      
      // Remove any cached data first to force fresh fetch
      queryClient.removeQueries({ queryKey: [`/api/users/${variables.userId}/quests/current-week`] });
      queryClient.removeQueries({ queryKey: [`/api/users/${variables.userId}/quests/current-day`] });
      queryClient.removeQueries({ queryKey: [`/api/users/${variables.userId}/quests-with-definitions`] });
      
      // Then force fresh data fetch
      queryClient.refetchQueries({ 
        queryKey: [`/api/users/${variables.userId}/quests/current-week`],
        type: 'active'
      });
      queryClient.refetchQueries({ 
        queryKey: [`/api/users/${variables.userId}/quests/current-day`],
        type: 'active'
      });
      queryClient.refetchQueries({ 
        queryKey: [`/api/users/${variables.userId}/quests-with-definitions`],
        type: 'active'  
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${variables.userId}/xp`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${variables.userId}/badges`] });
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

// Bucket-based Quest Hooks for Daily/Completed/Missed functionality
export const useUserCareerQuestsByBucket = (userId?: number, bucket?: 'daily' | 'completed' | 'missed') => {
  // Debug logging for hook state
  console.log(`[QUEST HOOK DEBUG] useUserCareerQuestsByBucket called with userId: ${userId}, bucket: ${bucket}`);
  console.log(`[QUEST HOOK DEBUG] Hook enabled: ${!!userId && !!bucket}`);
  
  return useQuery({
    queryKey: [`/api/users/${userId || 0}/quests/bucket/${bucket || 'daily'}`],
    queryFn: async () => {
      console.log(`[QUEST API DEBUG] Starting career quest fetch for userId: ${userId}, bucket: ${bucket}`);
      
      if (!userId || !bucket) {
        console.warn(`[QUEST API DEBUG] Missing parameters - userId: ${userId}, bucket: ${bucket}`);
        return [];
      }
      
      try {
        const url = `/api/users/${userId}/quests/bucket/${bucket}`;
        console.log(`[QUEST API DEBUG] Fetching from: ${url}`);
        
        const res = await fetch(url);
        console.log(`[QUEST API DEBUG] Response status: ${res.status}, ok: ${res.ok}`);
        
        if (!res.ok) {
          console.error(`[QUEST API ERROR] Failed to fetch ${bucket} career quests, status:`, res.status);
          const errorText = await res.text();
          console.error(`[QUEST API ERROR] Error response:`, errorText);
          return [];
        }
        
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error(`[QUEST API ERROR] Expected JSON but got ${contentType}`);
          return [];
        }
        
        const data = await res.json();
        console.log(`[QUEST API SUCCESS] Career quests fetched successfully:`, {
          bucket,
          count: Array.isArray(data) ? data.length : 'Not an array',
          userId
        });
        
        return data;
      } catch (error) {
        console.error(`[QUEST API ERROR] Error fetching ${bucket} career quests:`, error);
        return [];
      }
    },
    enabled: !!userId && !!bucket
  });
};

export const useUserSocialQuestsByBucket = (userId?: number, bucket?: 'daily' | 'completed' | 'missed') => {
  // Debug logging for hook state
  console.log(`[SOCIAL QUEST HOOK DEBUG] useUserSocialQuestsByBucket called with userId: ${userId}, bucket: ${bucket}`);
  console.log(`[SOCIAL QUEST HOOK DEBUG] Hook enabled: ${!!userId && !!bucket}`);
  
  return useQuery({
    queryKey: [`/api/users/${userId || 0}/social-quests/bucket/${bucket || 'daily'}`],
    queryFn: async () => {
      console.log(`[SOCIAL QUEST API DEBUG] Starting social quest fetch for userId: ${userId}, bucket: ${bucket}`);
      
      if (!userId || !bucket) {
        console.warn(`[SOCIAL QUEST API DEBUG] Missing parameters - userId: ${userId}, bucket: ${bucket}`);
        return [];
      }
      
      try {
        const url = `/api/users/${userId}/social-quests/bucket/${bucket}`;
        console.log(`[SOCIAL QUEST API DEBUG] Fetching from: ${url}`);
        
        const res = await fetch(url);
        console.log(`[SOCIAL QUEST API DEBUG] Response status: ${res.status}, ok: ${res.ok}`);
        
        if (!res.ok) {
          console.error(`[SOCIAL QUEST API ERROR] Failed to fetch ${bucket} social quests, status:`, res.status);
          const errorText = await res.text();
          console.error(`[SOCIAL QUEST API ERROR] Error response:`, errorText);
          return [];
        }
        
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error(`[SOCIAL QUEST API ERROR] Expected JSON but got ${contentType}`);
          return [];
        }
        
        const data = await res.json();
        console.log(`[SOCIAL QUEST API SUCCESS] Social quests fetched successfully:`, {
          bucket,
          count: Array.isArray(data) ? data.length : 'Not an array',
          userId
        });
        
        return data;
      } catch (error) {
        console.error(`[SOCIAL QUEST API ERROR] Error fetching ${bucket} social quests:`, error);
        return [];
      }
    },
    enabled: !!userId && !!bucket
  });
};