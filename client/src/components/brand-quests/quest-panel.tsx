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
import { 
  useGenerateSocialQuests,
  useWeeklySocialQuests,
  useCompletedSocialQuests,
  useMissedSocialQuests,
  useCompleteSocialQuest
} from '@/hooks/use-social-quests';
import { QuestCard } from './quest-card';
import { SocialQuestCard } from './social-quest-card';
import { cn } from '@/lib/utils';

interface QuestPanelProps {
  userId?: number;
  className?: string;
}

export function QuestPanel({ userId, className }: QuestPanelProps) {
  const { toast } = useToast();
  const [mainTabValue, setMainTabValue] = useState('brand-quests');
  const [brandQuestTabValue, setBrandQuestTabValue] = useState('weekly');
  const [socialQuestTabValue, setSocialQuestTabValue] = useState('weekly');
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

  // Social Quests integration (old hook removed - using new weekly/completed/missed hooks)
  
  // New Social Quest hooks for Weekly/Completed/Missed - Force fresh data
  const {
    data: weeklySocialQuests,
    isLoading: isLoadingWeeklySocial,
    error: weeklySocialError,
    refetch: refetchWeeklySocial
  } = useWeeklySocialQuests(userId);
  
  const {
    data: completedSocialQuestsData,
    isLoading: isLoadingCompletedSocial,
    error: completedSocialError,
    refetch: refetchCompletedSocial
  } = useCompletedSocialQuests(userId);
  
  const {
    data: missedSocialQuestsData,
    isLoading: isLoadingMissedSocial,
    error: missedSocialError,
    refetch: refetchMissedSocial
  } = useMissedSocialQuests(userId);
  
  const completeSocialQuestMutation = useCompleteSocialQuest(userId);
  const generateSocialQuestsMutation = useGenerateSocialQuests(userId);
  
  // Removed XP progress functionality since it's now in the parent component

  useEffect(() => {
    // Clear all social quest caches on mount to ensure fresh data
    if (userId) {
      // Clear any stale social quest cache
      const queryClient = (window as any).queryClient;
      if (queryClient) {
        queryClient.removeQueries({ queryKey: ['social-quests'] });
        queryClient.invalidateQueries({ queryKey: ['social-quests'] });
      }
    }
    
    const refetchInterval = setInterval(() => {
      refetchWeekly();
      refetchAll();
      refetchWeeklySocial();
      refetchCompletedSocial();
      refetchMissedSocial();
    }, 60000); // Refetch every minute
    
    return () => clearInterval(refetchInterval);
  }, [userId, refetchWeekly, refetchAll, refetchWeeklySocial, refetchCompletedSocial, refetchMissedSocial]);
  
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

    if (socialError) {
      console.log('Error fetching social quests:', socialError);
      toast({
        title: 'Error fetching social quests',
        description: "We're having trouble loading your social quests. Please try again later.",
        variant: 'destructive',
      });
    }
  }, [weeklyError, allError, socialError, toast]);
  
  // For weekly tab, we'll use the filtered data from the dedicated weekly quests hook
  // For completed and expired tabs, use the data from the all quests hook
  const completedQuests = allQuests?.filter(quest => quest.status === 'completed') || [];
  const expiredQuests = allQuests?.filter(quest => quest.status === 'expired') || [];
  
  // Count skill-related quests
  const skillQuests = allQuests?.filter(quest => {
    const action = quest.definition?.targetAction;
    return action === 'add_skill' || 
           action === 'add_skill_category' ||
           action === 'add_industry_skill' ||
           action === 'update_resume_skills' ||
           action === 'add_project_technologies';
  }) || [];
  
  // Handle generating new Social Quests
  const handleGenerateSocialQuests = () => {
    generateSocialQuestsMutation.mutate(
      { weekNumber: currentWeek, year: currentYear },
      {
        onSuccess: (response) => {
          if (response.success) {
            toast({
              title: 'Social Quests Generated!',
              description: `${response.tasks?.length || 0} personalized tasks created based on your profile.`,
            });
          } else {
            toast({
              title: 'Generation Failed',
              description: response.error || 'Failed to generate social quests. Please try again.',
              variant: 'destructive',
            });
          }
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: `Failed to generate social quests: ${error.message}`,
            variant: 'destructive',
          });
        }
      }
    );
  };

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
        <h2 className="text-lg sm:text-xl font-semibold text-white">Career Quests</h2>
        <p className="text-white/70 text-xs sm:text-sm">Complete quests to increase your influence</p>
      </div>
      
      {/* Main Level Tabs: Brand Quests | Social Quests */}
      <Tabs defaultValue="brand-quests" value={mainTabValue} onValueChange={setMainTabValue}>
        <TabsList className="grid grid-cols-2 mb-3 sm:mb-4 dark-tabs-list border border-white/5 w-full h-auto">
          <TabsTrigger value="brand-quests" className="dark-tabs-trigger flex items-center gap-2 py-2 px-3 text-sm">
            <span>Brand Quests</span>
            <span className="text-xs">({(weeklyQuests?.length || 0) + completedQuests.length + expiredQuests.length})</span>
          </TabsTrigger>
          <TabsTrigger value="social-quests" className="dark-tabs-trigger flex items-center gap-2 py-2 px-3 text-sm">
            <span>Social Quests</span>
            <span className="text-xs">({(weeklySocialQuests?.length || 0) + (completedSocialQuestsData?.quests?.length || 0) + (missedSocialQuestsData?.quests?.length || 0)})</span>
          </TabsTrigger>
        </TabsList>

        {/* Brand Quests Tab Content */}
        <TabsContent value="brand-quests" className="space-y-3 sm:space-y-4">
          {isLoadingWeekly ? (
            <div className="space-y-2 sm:space-y-3">
              <Skeleton className="h-20 sm:h-24 w-full rounded-md bg-gray-800/60" />
              <Skeleton className="h-20 sm:h-24 w-full rounded-md bg-gray-800/60" />
              <Skeleton className="h-20 sm:h-24 w-full rounded-md bg-gray-800/60" />
            </div>
          ) : (
            <Tabs defaultValue="weekly" value={brandQuestTabValue} onValueChange={setBrandQuestTabValue}>
              <TabsList className="grid grid-cols-3 mb-3 sm:mb-4 dark-tabs-list border border-white/5 w-full h-auto">
                <TabsTrigger value="weekly" className="dark-tabs-trigger flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-2 text-xs sm:text-sm">
                  <span className="text-center">Weekly</span>
                  <span className="text-xs">({weeklyQuests?.length || 0})</span>
                </TabsTrigger>
                <TabsTrigger value="completed" className="dark-tabs-trigger flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-2 text-xs sm:text-sm">
                  <span className="text-center">Completed</span>
                  <span className="text-xs">({completedQuests.length})</span>
                </TabsTrigger>
                <TabsTrigger value="expired" className="dark-tabs-trigger flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-2 text-xs sm:text-sm">
                  <span className="text-center">Missed</span>
                  <span className="text-xs">({expiredQuests.length})</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="weekly" className="space-y-3 sm:space-y-4">
                <div className="text-xs sm:text-sm text-white/70 mb-2">
                  Week {currentWeek}, {currentYear} - Weekly quests refresh every Monday
                </div>
                {renderQuestsList(weeklyQuests, isLoadingWeekly)}
              </TabsContent>
              
              <TabsContent value="expired" className="space-y-3 sm:space-y-4">
                <div className="text-xs sm:text-sm text-white/70 mb-2">
                  Quests that expired without completion - missed XP opportunities
                </div>
                {renderQuestsList(expiredQuests, isLoadingAll)}
              </TabsContent>
              
              <TabsContent value="completed" className="space-y-3 sm:space-y-4">
                <div className="text-xs sm:text-sm text-white/70 mb-2">
                  Completed quests that earned you XP rewards
                </div>
                {renderQuestsList(completedQuests, isLoadingAll)}
              </TabsContent>
            </Tabs>
          )}
        </TabsContent>

        {/* Social Quests Tab Content */}
        <TabsContent value="social-quests" className="space-y-3 sm:space-y-4">
          <Tabs defaultValue="weekly" value={socialQuestTabValue} onValueChange={setSocialQuestTabValue}>
            <TabsList className="grid grid-cols-3 mb-3 sm:mb-4 dark-tabs-list border border-white/5 w-full h-auto">
              <TabsTrigger value="weekly" className="dark-tabs-trigger flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-2 text-xs sm:text-sm">
                <span className="text-center">Weekly</span>
                <span className="text-xs">({weeklySocialQuests?.length || 0})</span>
              </TabsTrigger>
              <TabsTrigger value="completed" className="dark-tabs-trigger flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-2 text-xs sm:text-sm">
                <span className="text-center">Completed</span>
                <span className="text-xs">({completedSocialQuestsData?.quests?.length || 0})</span>
              </TabsTrigger>
              <TabsTrigger value="missed" className="dark-tabs-trigger flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-2 text-xs sm:text-sm">
                <span className="text-center">Missed</span>
                <span className="text-xs">({missedSocialQuestsData?.quests?.length || 0})</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Weekly Social Quests Tab */}
            <TabsContent value="weekly" className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center mb-2">
                <div className="text-xs sm:text-sm text-white/70">
                  Week {currentWeek}, {currentYear} - AI-powered external platform tasks
                </div>
                <Button
                  onClick={handleGenerateSocialQuests}
                  disabled={generateSocialQuestsMutation.isPending || !userId}
                  size="sm"
                  className="text-xs bg-blue-600 hover:bg-blue-700 px-2 sm:px-3"
                >
                  {generateSocialQuestsMutation.isPending ? 'Generating...' : 'Generate Quests'}
                </Button>
              </div>
              
              {isLoadingWeeklySocial ? (
                <div className="space-y-2 sm:space-y-3">
                  <Skeleton className="h-32 sm:h-36 w-full rounded-md bg-gray-800/60" />
                  <Skeleton className="h-32 sm:h-36 w-full rounded-md bg-gray-800/60" />
                </div>
              ) : !weeklySocialQuests || weeklySocialQuests.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <h3 className="text-lg font-medium text-white">No Weekly Social Quests</h3>
                  <p className="text-white/70 mt-2 text-sm">
                    Generate personalized tasks to build your cross-platform presence
                  </p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4 mt-4">
                  {weeklySocialQuests.map((quest, index) => (
                    <SocialQuestCard 
                      key={quest.id || index} 
                      quest={quest}
                      userId={userId!}
                      onComplete={(questId) => {
                        completeSocialQuestMutation.mutate(
                          { questId },
                          {
                            onSuccess: () => {
                              toast({
                                title: 'Social Quest Completed!',
                                description: 'Great work! Your cross-platform presence is growing.',
                              });
                            },
                            onError: (error) => {
                              toast({
                                title: 'Error',
                                description: `Failed to complete quest: ${error.message}`,
                                variant: 'destructive',
                              });
                            }
                          }
                        );
                      }}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* Completed Social Quests Tab */}
            <TabsContent value="completed" className="space-y-3 sm:space-y-4">
              <div className="text-xs sm:text-sm text-white/70 mb-2">
                Completed social quests that earned you cross-platform influence
              </div>
              
              {isLoadingCompletedSocial ? (
                <div className="space-y-2 sm:space-y-3">
                  <Skeleton className="h-32 sm:h-36 w-full rounded-md bg-gray-800/60" />
                  <Skeleton className="h-32 sm:h-36 w-full rounded-md bg-gray-800/60" />
                </div>
              ) : !completedSocialQuestsData?.quests || completedSocialQuestsData.quests.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <h3 className="text-lg font-medium text-white">No Completed Social Quests</h3>
                  <p className="text-white/70 mt-2 text-sm">
                    Complete weekly social quests to see them here
                  </p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4 mt-4">
                  {completedSocialQuestsData.quests.map((quest, index) => (
                    <SocialQuestCard 
                      key={quest.id || index} 
                      quest={quest}
                      userId={userId!}
                      showCompletedDate={true}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* Missed Social Quests Tab */}
            <TabsContent value="missed" className="space-y-3 sm:space-y-4">
              <div className="text-xs sm:text-sm text-white/70 mb-2">
                Social quests that expired without completion - missed opportunities
              </div>
              
              {isLoadingMissedSocial ? (
                <div className="space-y-2 sm:space-y-3">
                  <Skeleton className="h-32 sm:h-36 w-full rounded-md bg-gray-800/60" />
                  <Skeleton className="h-32 sm:h-36 w-full rounded-md bg-gray-800/60" />
                </div>
              ) : !missedSocialQuestsData?.quests || missedSocialQuestsData.quests.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <h3 className="text-lg font-medium text-white">No Missed Social Quests</h3>
                  <p className="text-white/70 mt-2 text-sm">
                    Keep up the great work! No missed opportunities yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4 mt-4">
                  {missedSocialQuestsData.quests.map((quest, index) => (
                    <SocialQuestCard 
                      key={quest.id || index} 
                      quest={quest}
                      userId={userId!}
                      showMissedStatus={true}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}