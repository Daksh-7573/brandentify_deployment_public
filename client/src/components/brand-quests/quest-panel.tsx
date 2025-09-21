import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  useUserCombinedDailyQuests
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
  
  const { 
    data: dailyQuests,
    isLoading: isLoadingDaily,
    error: dailyError,
    refetch: refetchDaily
  } = useUserCombinedDailyQuests(userId);
  
  // Removed allQuests hook - now only using daily quests for cleaner UI

  
  // Removed XP progress functionality since it's now in the parent component

  useEffect(() => {
    const refetchInterval = setInterval(() => {
      refetchDaily();
    }, 60000); // Refetch every minute
    
    return () => clearInterval(refetchInterval);
  }, [refetchDaily]);
  
  useEffect(() => {
    if (dailyError) {
      console.log('Error fetching daily quests:', dailyError);
      toast({
        title: 'Error fetching daily quests',
        description: "We're having trouble loading your quests. Please try again later.",
        variant: 'destructive',
      });
    }
    
    // Removed allError handling since we only use daily quests now

  }, [dailyError, toast]);
  
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
  
  // Removed old quest filtering - now only using daily quests
  
  // Daily quests filtered by type and only show active status (case-insensitive)
  const dailyCareerQuests = (dailyQuests || []).filter(q => {
    const questType = getQuestType(q)?.toLowerCase() || '';
    return q.status?.toLowerCase() === 'active' && !socialQuestTypes.some(type => type.toLowerCase() === questType);
  });
  
  const dailySocialQuests = (dailyQuests || []).filter(q => {
    const questType = getQuestType(q)?.toLowerCase() || '';
    return q.status?.toLowerCase() === 'active' && socialQuestTypes.some(type => type.toLowerCase() === questType);
  });
  
  // Removed completed/expired quest filtering - focus on daily quests only
  
  // Removed skill quest counting - simplified to daily quests only
  

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
              <span className="text-xs">({dailyCareerQuests.length})</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="dark-tabs-trigger flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-2 text-xs sm:text-sm">
              <span className="text-center">Social Quests</span>
              <span className="text-xs">({dailySocialQuests.length})</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="career" className="space-y-3 sm:space-y-4">
            <div className="text-xs sm:text-sm text-white/70 mb-2">
              Professional development quests to build your career foundation
            </div>
            
            {/* Simplified Career Quests - Daily Only */}
            <div className="text-xs text-white/60 mb-2">
              {new Date().toLocaleDateString()} - Today's career quests
            </div>
            {renderQuestsList(dailyCareerQuests, isLoadingDaily)}
          </TabsContent>
          
          <TabsContent value="social" className="space-y-3 sm:space-y-4">
            <div className="text-xs sm:text-sm text-white/70 mb-2">
              Social media quests to amplify your professional brand online
            </div>
            
            {/* Simplified Social Quests - Daily Only */}
            <div className="text-xs text-white/60 mb-2">
              {new Date().toLocaleDateString()} - Today's social media quests
            </div>
            {renderQuestsList(dailySocialQuests, isLoadingDaily)}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}