import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  useUserQuestsWithDefinitions, 
  useUserWeeklyQuests, 
  getCurrentWeekNumber, 
  getCurrentYear
} from '@/hooks/use-career-quests'; // We'll keep using the same hooks for now
import { QuestCard } from './quest-card';
import { cn } from '@/lib/utils';

interface QuestPanelProps {
  userId?: number;
  className?: string;
}

export function QuestPanel({ userId, className }: QuestPanelProps) {
  const { toast } = useToast();
  const [tabValue, setTabValue] = useState('career');
  const currentWeek = getCurrentWeekNumber();
  const currentYear = getCurrentYear();
  
  const { 
    data: weeklyQuests,
    isLoading: isLoadingWeekly,
    error: weeklyError,
    refetch: refetchWeekly
  } = useUserWeeklyQuests(userId, currentWeek, currentYear);
  
  const {
    data: allQuests,
    isLoading: isLoadingAll,
    error: allError,
    refetch: refetchAll
  } = useUserQuestsWithDefinitions(userId);

  
  // Removed XP progress functionality since it's now in the parent component

  useEffect(() => {
    const refetchInterval = setInterval(() => {
      refetchWeekly();
      refetchAll();
    }, 60000); // Refetch every minute
    
    return () => clearInterval(refetchInterval);
  }, [refetchWeekly, refetchAll]);
  
  useEffect(() => {
    if (weeklyError) {
      console.log('Error fetching weekly quests:', weeklyError);
      toast({
        title: 'Error fetching weekly quests',
        description: "We're having trouble loading your quests. Please try again later.",
        variant: 'destructive',
      });
    }
    
    if (allError) {
      console.log('Error fetching all quests:', allError);
      toast({
        title: 'Error fetching quests',
        description: "We're having trouble loading your quests. Please try again later.",
        variant: 'destructive',
      });
    }

  }, [weeklyError, allError, toast]);
  
  // Filter quests by type
  const socialQuestTypes = ['social_post', 'social_quest'];
  const careerQuestTypes = ['profile_update', 'pulse_creation', 'networking', 'learning', 'portfolio', 'resume', 'visibility', 'exploration', 'nowboard'];
  
  // Get quest type from different possible sources in the data
  const getQuestType = (quest: any) => {
    return quest.definition?.type || quest.questDefinition?.type || quest.questType || quest.type;
  };
  
  // Filter by quest category
  const socialQuests = allQuests?.filter(quest => {
    const questType = getQuestType(quest);
    return socialQuestTypes.includes(questType);
  }) || [];
  
  const careerQuests = allQuests?.filter(quest => {
    const questType = getQuestType(quest);
    return careerQuestTypes.includes(questType) || !socialQuestTypes.includes(questType);
  }) || [];
  
  // Also include weekly quests in career category for now
  const activeCareerQuests = [...careerQuests.filter(q => q.status === 'active'), ...(weeklyQuests || []).filter(q => {
    const questType = getQuestType(q);
    return !socialQuestTypes.includes(questType);
  })];
  
  const activeSocialQuests = [...socialQuests.filter(q => q.status === 'active'), ...(weeklyQuests || []).filter(q => {
    const questType = getQuestType(q);
    return socialQuestTypes.includes(questType);
  })];
  
  // Count skill-related quests
  const skillQuests = allQuests?.filter(quest => {
    const action = quest.definition?.targetAction;
    return action === 'add_skill' || 
           action === 'add_skill_category' ||
           action === 'add_industry_skill' ||
           action === 'update_resume_skills' ||
           action === 'add_project_technologies';
  }) || [];
  

  const renderQuestsList = (quests: typeof weeklyQuests, loading: boolean) => {
    if (loading) {
      return (
        <div className="space-y-4 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-[220px] rounded-md" />
          ))}
        </div>
      );
    }
    
    if (!quests || quests.length === 0) {
      return (
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-white">No quests available</h3>
          <p className="text-white/70 mt-2">
            Check back later for new brand quests.
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4 mt-4">
        {quests.map(quest => (
          <QuestCard key={quest.id} quest={quest} />
        ))}
      </div>
    );
  };
  
  // Log errors for debugging purposes
  useEffect(() => {
    if (weeklyError && !isLoadingWeekly) {
      console.log('Error loading quests:', weeklyError);
    }
  }, [weeklyError, isLoadingWeekly]);

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-white">Brand Quests</h2>
        <p className="text-white/70 text-xs sm:text-sm">Complete quests to increase your professional influence</p>
      </div>
      
      {/* Quest Tabs */}
      {isLoadingWeekly ? (
        <div className="space-y-2 sm:space-y-3">
          <Skeleton className="h-20 sm:h-24 w-full rounded-md bg-gray-800/60" />
          <Skeleton className="h-20 sm:h-24 w-full rounded-md bg-gray-800/60" />
          <Skeleton className="h-20 sm:h-24 w-full rounded-md bg-gray-800/60" />
        </div>
      ) : (
        <Tabs defaultValue="career" value={tabValue} onValueChange={setTabValue}>
          <TabsList className="grid grid-cols-2 mb-3 sm:mb-4 dark-tabs-list border border-white/5 w-full h-auto">
            <TabsTrigger value="career" className="dark-tabs-trigger flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-2 text-xs sm:text-sm">
              <span className="text-center">Career Quests</span>
              <span className="text-xs">({activeCareerQuests.length})</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="dark-tabs-trigger flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-2 text-xs sm:text-sm">
              <span className="text-center">Social Quests</span>
              <span className="text-xs">({activeSocialQuests.length})</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="career" className="space-y-3 sm:space-y-4">
            <div className="text-xs sm:text-sm text-white/70 mb-2">
              Professional development quests to build your career foundation
            </div>
            {renderQuestsList(activeCareerQuests, isLoadingAll || isLoadingWeekly)}
          </TabsContent>
          
          <TabsContent value="social" className="space-y-3 sm:space-y-4">
            <div className="text-xs sm:text-sm text-white/70 mb-2">
              Social media quests to amplify your professional brand online
            </div>
            {renderQuestsList(activeSocialQuests, isLoadingAll || isLoadingWeekly)}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}