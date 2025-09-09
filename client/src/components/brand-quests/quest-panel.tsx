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
  const socialQuestTypes = ['social_post']; // Only platform-specific social media quests
  const careerQuestTypes = ['profile_update', 'pulse_creation', 'networking', 'learning', 'portfolio', 'resume', 'visibility', 'exploration', 'nowboard', 'social_quest']; // Added social_quest to career quests
  
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
  
  // Weekly quests filtered by type and only show active status
  const weeklyCareerQuests = (weeklyQuests || []).filter(q => {
    const questType = getQuestType(q);
    return q.status === 'active' && !socialQuestTypes.includes(questType);
  });
  
  const weeklySocialQuests = (weeklyQuests || []).filter(q => {
    const questType = getQuestType(q);
    return q.status === 'active' && socialQuestTypes.includes(questType);
  });
  
  // Status-based filtering for each category
  const completedCareerQuests = careerQuests.filter(q => q.status === 'completed');
  const expiredCareerQuests = careerQuests.filter(q => q.status === 'expired');
  
  const completedSocialQuests = socialQuests.filter(q => q.status === 'completed');
  const expiredSocialQuests = socialQuests.filter(q => q.status === 'expired');
  
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
              <span className="text-xs">({weeklyCareerQuests.length + completedCareerQuests.length + expiredCareerQuests.length})</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="dark-tabs-trigger flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-2 text-xs sm:text-sm">
              <span className="text-center">Social Quests</span>
              <span className="text-xs">({weeklySocialQuests.length + completedSocialQuests.length + expiredSocialQuests.length})</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="career" className="space-y-3 sm:space-y-4">
            <div className="text-xs sm:text-sm text-white/70 mb-2">
              Professional development quests to build your career foundation
            </div>
            
            {/* Career Quests Sub-tabs */}
            <Tabs defaultValue="weekly" className="w-full">
              <TabsList className="grid grid-cols-3 mb-3 sm:mb-4 dark-tabs-list border border-white/5 w-full h-auto">
                <TabsTrigger value="weekly" className="dark-tabs-trigger flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-1 px-1 sm:px-2 text-xs">
                  <span className="text-center">Weekly</span>
                  <span className="text-xs">({weeklyCareerQuests.length})</span>
                </TabsTrigger>
                <TabsTrigger value="completed" className="dark-tabs-trigger flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-1 px-1 sm:px-2 text-xs">
                  <span className="text-center">Completed</span>
                  <span className="text-xs">({completedCareerQuests.length})</span>
                </TabsTrigger>
                <TabsTrigger value="missed" className="dark-tabs-trigger flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-1 px-1 sm:px-2 text-xs">
                  <span className="text-center">Missed</span>
                  <span className="text-xs">({expiredCareerQuests.length})</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="weekly" className="space-y-3 sm:space-y-4">
                <div className="text-xs text-white/60 mb-2">
                  Week {currentWeek}, {currentYear} - Weekly career quests
                </div>
                {renderQuestsList(weeklyCareerQuests, isLoadingWeekly)}
              </TabsContent>
              
              <TabsContent value="completed" className="space-y-3 sm:space-y-4">
                <div className="text-xs text-white/60 mb-2">
                  Completed career quests that earned you XP
                </div>
                {renderQuestsList(completedCareerQuests, isLoadingAll)}
              </TabsContent>
              
              <TabsContent value="missed" className="space-y-3 sm:space-y-4">
                <div className="text-xs text-white/60 mb-2">
                  Missed career quest opportunities
                </div>
                {renderQuestsList(expiredCareerQuests, isLoadingAll)}
              </TabsContent>
            </Tabs>
          </TabsContent>
          
          <TabsContent value="social" className="space-y-3 sm:space-y-4">
            <div className="text-xs sm:text-sm text-white/70 mb-2">
              Social media quests to amplify your professional brand online
            </div>
            
            {/* Social Quests Sub-tabs */}
            <Tabs defaultValue="weekly" className="w-full">
              <TabsList className="grid grid-cols-3 mb-3 sm:mb-4 dark-tabs-list border border-white/5 w-full h-auto">
                <TabsTrigger value="weekly" className="dark-tabs-trigger flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-1 px-1 sm:px-2 text-xs">
                  <span className="text-center">Weekly</span>
                  <span className="text-xs">({weeklySocialQuests.length})</span>
                </TabsTrigger>
                <TabsTrigger value="completed" className="dark-tabs-trigger flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-1 px-1 sm:px-2 text-xs">
                  <span className="text-center">Completed</span>
                  <span className="text-xs">({completedSocialQuests.length})</span>
                </TabsTrigger>
                <TabsTrigger value="missed" className="dark-tabs-trigger flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-1 px-1 sm:px-2 text-xs">
                  <span className="text-center">Missed</span>
                  <span className="text-xs">({expiredSocialQuests.length})</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="weekly" className="space-y-3 sm:space-y-4">
                <div className="text-xs text-white/60 mb-2">
                  Week {currentWeek}, {currentYear} - Weekly social media quests
                </div>
                {renderQuestsList(weeklySocialQuests, isLoadingWeekly)}
              </TabsContent>
              
              <TabsContent value="completed" className="space-y-3 sm:space-y-4">
                <div className="text-xs text-white/60 mb-2">
                  Completed social quests with platform-specific achievements
                </div>
                {renderQuestsList(completedSocialQuests, isLoadingAll)}
              </TabsContent>
              
              <TabsContent value="missed" className="space-y-3 sm:space-y-4">
                <div className="text-xs text-white/60 mb-2">
                  Missed social media opportunities
                </div>
                {renderQuestsList(expiredSocialQuests, isLoadingAll)}
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}