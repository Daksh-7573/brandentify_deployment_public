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
import { useSocialQuests, useGenerateSocialQuests, useAllSocialQuests } from '@/hooks/use-social-quests';
import { QuestCard } from './quest-card';
import { SocialQuestCard } from './social-quest-card';
import { cn } from '@/lib/utils';

interface QuestPanelProps {
  userId?: number;
  className?: string;
}

export function QuestPanel({ userId, className }: QuestPanelProps) {
  // CRITICAL DEBUG - This should appear in console immediately
  console.log('🔥🔥🔥 BRAND QUEST PANEL COMPONENT LOADED! 🔥🔥🔥');
  console.log('🚀 QuestPanel component rendering, mainTabValue will be logged...');
  console.log('⚡ userId passed to QuestPanel:', userId);
  console.log('🎯 TABS SHOULD BE VISIBLE: Brand Quests | Social Quests');
  console.log('💡 When you click Social Quests, you should see 3 sub-tabs!');
  const { toast } = useToast();
  const [mainTabValue, setMainTabValue] = useState('brand-quests');
  console.log('📊 Current mainTabValue:', mainTabValue);
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

  // Social Quests integration
  const {
    data: socialQuests,
    isLoading: isLoadingSocial,
    error: socialError,
    refetch: refetchSocial
  } = useSocialQuests(userId, currentWeek, currentYear);

  // All Social Quests for status filtering
  const {
    data: allSocialQuests,
    isLoading: isLoadingAllSocial,
    error: allSocialError,
    refetch: refetchAllSocial
  } = useAllSocialQuests(userId);
  
  const generateSocialQuestsMutation = useGenerateSocialQuests(userId);

  // Filter Social Quests by status (similar to Brand Quests)
  const completedSocialQuests = allSocialQuests?.filter(quest => quest.status === 'completed') || [];
  const expiredSocialQuests = allSocialQuests?.filter(quest => quest.status === 'expired') || [];
  
  // Debug logs for Social Quest data
  console.log('allSocialQuests:', allSocialQuests);
  console.log('completedSocialQuests:', completedSocialQuests);
  console.log('expiredSocialQuests:', expiredSocialQuests);
  
  // Removed XP progress functionality since it's now in the parent component

  useEffect(() => {
    const refetchInterval = setInterval(() => {
      refetchWeekly();
      refetchAll();
      refetchSocial();
      refetchAllSocial();
    }, 60000); // Refetch every minute
    
    return () => clearInterval(refetchInterval);
  }, [refetchWeekly, refetchAll, refetchSocial, refetchAllSocial]);
  
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
        <h2 className="text-lg sm:text-xl font-semibold text-white">Brand Quests</h2>
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
            <span className="text-xs">({(socialQuests?.length || 0) + completedSocialQuests.length + expiredSocialQuests.length})</span>
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
          {(() => { console.log('🔥🔥🔥 SOCIAL QUEST TAB CONTENT RENDERING! 🔥🔥🔥'); return null; })()}
          {(() => { console.log('✅ The 3 sub-tabs should be visible below this!'); return null; })()}
          <Tabs defaultValue="weekly" value={socialQuestTabValue} onValueChange={setSocialQuestTabValue}>
            <TabsList className="grid grid-cols-3 mb-3 sm:mb-4 bg-white/20 border-2 border-yellow-400 p-2 rounded-lg w-full h-auto">
              <TabsTrigger value="weekly" className="bg-blue-500 text-white p-2 rounded font-bold flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <span className="text-center">📅 Weekly</span>
                <span className="text-xs">({socialQuests?.length || 0})</span>
              </TabsTrigger>
              <TabsTrigger value="completed" className="bg-green-500 text-white p-2 rounded font-bold flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <span className="text-center">✅ Completed</span>
                <span className="text-xs">({completedSocialQuests.length})</span>
              </TabsTrigger>
              <TabsTrigger value="expired" className="bg-red-500 text-white p-2 rounded font-bold flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <span className="text-center">❌ Missed</span>
                <span className="text-xs">({expiredSocialQuests.length})</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="weekly" className="space-y-3 sm:space-y-4">
              {(isLoadingSocial || isLoadingAllSocial) ? (
                <div className="space-y-2 sm:space-y-3">
                  <Skeleton className="h-20 sm:h-24 w-full rounded-md bg-gray-800/60" />
                  <Skeleton className="h-20 sm:h-24 w-full rounded-md bg-gray-800/60" />
                  <Skeleton className="h-20 sm:h-24 w-full rounded-md bg-gray-800/60" />
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-xs sm:text-sm text-white/70">
                      Week {currentWeek}, {currentYear} - AI-powered social media tasks
                    </div>
                    {(!socialQuests || socialQuests.length === 0) && (
                      <Button
                        size="sm"
                        onClick={handleGenerateSocialQuests}
                        disabled={generateSocialQuestsMutation.isPending}
                        className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs"
                      >
                        {generateSocialQuestsMutation.isPending ? 'Generating...' : '🤖 Generate Tasks'}
                      </Button>
                    )}
                  </div>
                  
                  {!socialQuests || socialQuests.length === 0 ? (
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium text-white">No Social Quests Yet</h3>
                  <p className="text-white/70 mt-2 mb-4">
                    Generate personalized social media tasks based on your profile.
                  </p>
                  <Button
                    onClick={handleGenerateSocialQuests}
                    disabled={generateSocialQuestsMutation.isPending}
                    className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                  >
                    {generateSocialQuestsMutation.isPending ? 'Generating...' : '🚀 Generate Social Quests'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 mt-4">
                  {socialQuests?.map(quest => (
                    quest && quest.id ? (
                      <SocialQuestCard key={quest.id} quest={quest} userId={userId!} />
                    ) : null
                  ))}
                </div>
              )}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="space-y-3 sm:space-y-4">
              <div className="text-xs sm:text-sm text-white/70 mb-2">
                Completed social media tasks that earned you XP rewards
              </div>
              {completedSocialQuests.length === 0 ? (
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium text-white">No completed social quests</h3>
                  <p className="text-white/70 mt-2">
                    Complete weekly social quests to see them here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 mt-4">
                  {completedSocialQuests.map(quest => (
                    quest && quest.id ? (
                      <SocialQuestCard key={quest.id} quest={quest} userId={userId!} />
                    ) : null
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="expired" className="space-y-3 sm:space-y-4">
              <div className="text-xs sm:text-sm text-white/70 mb-2">
                Social quests that expired without completion - missed opportunities
              </div>
              {expiredSocialQuests.length === 0 ? (
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium text-white">No missed social quests</h3>
                  <p className="text-white/70 mt-2">
                    Complete your weekly tasks to avoid missed opportunities.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 mt-4">
                  {expiredSocialQuests.map(quest => (
                    quest && quest.id ? (
                      <SocialQuestCard key={quest.id} quest={quest} userId={userId!} />
                    ) : null
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