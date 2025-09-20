import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  useUserQuestsWithDefinitions, 
  useUserWeeklyQuests,
  useUserCombinedDailyQuests,
  getCurrentWeekNumber, 
  getCurrentYear,
  useCombinedUserQuests
} from '@/hooks/use-career-quests';
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
    data: dailyQuests,
    isLoading: isLoadingDaily,
    error: dailyError,
    refetch: refetchDaily
  } = useUserCombinedDailyQuests(userId);
  
  // Use combined quest hook to integrate both career and social quests
  const {
    data: allQuests,
    isLoading: isLoadingAll,
    error: allError,
    refetch: refetchAll
  } = useCombinedUserQuests(userId);

  
  // Removed XP progress functionality since it's now in the parent component

  useEffect(() => {
    const refetchInterval = setInterval(() => {
      refetchDaily();
      refetchAll();
    }, 60000); // Refetch every minute
    
    return () => clearInterval(refetchInterval);
  }, [refetchDaily, refetchAll]);
  
  useEffect(() => {
    if (dailyError) {
      console.log('Error fetching daily quests:', dailyError);
      toast({
        title: 'Error fetching daily quests',
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

  }, [dailyError, allError, toast]);
  
  // Filter quests by type - Expanded social quest types for all platforms
  const socialQuestTypes = [
    'social_post', 'social_quest', 
    'instagram_reel', 'instagram_story', 'instagram_post',
    'linkedin_article', 'linkedin_post', 'linkedin_video',
    'youtube_short', 'youtube_video', 'youtube_community',
    'twitter_thread', 'twitter_post', 'twitter_space',
    'tiktok_video', 'tiktok_duet', 'tiktok_live',
    'facebook_post', 'facebook_story', 'facebook_reel',
    'threads_post', 'threads_reply',
    'pinterest_pin', 'pinterest_board',
    'snapchat_story', 'snapchat_spotlight',
    'discord_message', 'discord_thread',
    'reddit_post', 'reddit_comment',
    'medium_article', 'substack_post',
    'social_media', 'content_creation'
  ]; // Platform-specific social media quests
  const careerQuestTypes = ['profile_update', 'pulse_creation', 'networking', 'learning', 'portfolio', 'resume', 'visibility', 'exploration', 'nowboard']; // Career development quests
  
  // Get quest type from different possible sources in the data with enhanced fallback
  const getQuestType = (quest: any) => {
    // Try multiple sources with fallback
    const type = quest.definition?.type || 
                quest.questDefinition?.type || 
                quest.questType || 
                quest.type || 
                quest.quest_type || 
                quest.quest?.type ||
                'profile_update'; // Safe default
    
    // Ensure we always return a string and handle null/undefined
    return type ? String(type).toLowerCase() : 'profile_update';
  };
  
  // Filter by quest category (case-insensitive)
  const socialQuests = allQuests?.filter(quest => {
    const questType = getQuestType(quest)?.toLowerCase() || '';
    return socialQuestTypes.some(type => type.toLowerCase() === questType);
  }) || [];
  
  const careerQuests = allQuests?.filter(quest => {
    const questType = getQuestType(quest)?.toLowerCase() || '';
    return careerQuestTypes.some(type => type.toLowerCase() === questType) || !socialQuestTypes.some(type => type.toLowerCase() === questType);
  }) || [];
  
  // Daily quests filtered by type and only show active status (case-insensitive)
  const dailyCareerQuests = (dailyQuests || []).filter(q => {
    const questType = getQuestType(q)?.toLowerCase() || '';
    return q.status?.toLowerCase() === 'active' && !socialQuestTypes.some(type => type.toLowerCase() === questType);
  });
  
  const dailySocialQuests = (dailyQuests || []).filter(q => {
    const questType = getQuestType(q)?.toLowerCase() || '';
    return q.status?.toLowerCase() === 'active' && socialQuestTypes.some(type => type.toLowerCase() === questType);
  });
  
  // Status-based filtering for each category (case-insensitive)
  const completedCareerQuests = careerQuests.filter(q => q.status?.toLowerCase() === 'completed');
  const expiredCareerQuests = careerQuests.filter(q => q.status?.toLowerCase() === 'expired');
  
  const completedSocialQuests = socialQuests.filter(q => q.status?.toLowerCase() === 'completed');
  const expiredSocialQuests = socialQuests.filter(q => q.status?.toLowerCase() === 'expired');
  
  // Count skill-related quests
  const skillQuests = allQuests?.filter(quest => {
    const action = quest.definition?.targetAction;
    return action === 'add_skill' || 
           action === 'add_skill_category' ||
           action === 'add_industry_skill' ||
           action === 'update_resume_skills' ||
           action === 'add_project_technologies';
  }) || [];
  

  const renderQuestsList = (quests: typeof dailyQuests, loading: boolean) => {
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
    if (dailyError && !isLoadingDaily) {
      console.log('Error loading quests:', dailyError);
    }
  }, [dailyError, isLoadingDaily]);

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-white">Brand Quests</h2>
        <p className="text-white/70 text-xs sm:text-sm">Complete quests to increase your professional influence</p>
      </div>
      
      {/* Quest Tabs */}
      {isLoadingDaily ? (
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
              <span className="text-xs">({dailyCareerQuests.length + completedCareerQuests.length + expiredCareerQuests.length})</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="dark-tabs-trigger flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-2 text-xs sm:text-sm">
              <span className="text-center">Social Quests</span>
              <span className="text-xs">({dailySocialQuests.length + completedSocialQuests.length + expiredSocialQuests.length})</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="career" className="space-y-3 sm:space-y-4">
            <div className="text-xs sm:text-sm text-white/70 mb-2">
              Professional development quests to build your career foundation
            </div>
            
            {/* Career Quests Sub-tabs */}
            <Tabs defaultValue="today" className="w-full">
              <TabsList className="grid grid-cols-3 mb-3 sm:mb-4 dark-tabs-list border border-white/5 w-full h-auto">
                <TabsTrigger value="today" className="dark-tabs-trigger flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-1 px-1 sm:px-2 text-xs">
                  <span className="text-center">Today</span>
                  <span className="text-xs">({dailyCareerQuests.length})</span>
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
              
              <TabsContent value="today" className="space-y-3 sm:space-y-4">
                <div className="text-xs text-white/60 mb-2">
                  {new Date().toLocaleDateString()} - Today's career quests
                </div>
                {renderQuestsList(dailyCareerQuests, isLoadingDaily)}
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
            <Tabs defaultValue="today" className="w-full">
              <TabsList className="grid grid-cols-3 mb-3 sm:mb-4 dark-tabs-list border border-white/5 w-full h-auto">
                <TabsTrigger value="today" className="dark-tabs-trigger flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-1 px-1 sm:px-2 text-xs">
                  <span className="text-center">Today</span>
                  <span className="text-xs">({dailySocialQuests.length})</span>
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
              
              <TabsContent value="today" className="space-y-3 sm:space-y-4">
                <div className="text-xs text-white/60 mb-2">
                  {new Date().toLocaleDateString()} - Today's social media quests
                </div>
                {renderQuestsList(dailySocialQuests, isLoadingDaily)}
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