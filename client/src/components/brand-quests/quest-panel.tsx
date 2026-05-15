import { useEffect, useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  useUserCombinedDailyQuests,
  useUserCareerQuestsByBucket,
  useUserSocialQuestsByBucket,
  useCareerQuestBucketCounts,
  useSocialQuestBucketCounts,
  useInstantQuests,
  useAssignDailyQuests
} from '@/hooks/use-career-quests';
import { QuestCard } from './quest-card';
import { InstantQuestCard } from './instant-quest-card';
import { cn } from '@/lib/utils';
import { WeeklyQuestCalendar } from '@/components/WeeklyQuestCalendar';

interface QuestPanelProps {
  userId?: number;
  className?: string;
}

export function QuestPanel({ userId, className }: QuestPanelProps) {
  const { toast } = useToast();
  const [tabValue, setTabValue] = useState('career');
  const [careerSubTab, setCareerSubTab] = useState('daily');
  const [socialSubTab, setSocialSubTab] = useState('daily');
  const hasAttemptedAssignment = useRef(false);
  
  // Quest assignment mutations
  const assignDailyQuests = useAssignDailyQuests();
  
  // Bucket-based quest hooks for Career quests
  const { 
    data: currentCareerQuests = [], 
    isLoading: isLoadingCurrentCareer 
  } = useUserCareerQuestsByBucket(userId, careerSubTab as 'daily' | 'completed' | 'missed');

  // Bucket-based quest hooks for Social quests  
  const { 
    data: currentSocialQuests = [], 
    isLoading: isLoadingCurrentSocial 
  } = useUserSocialQuestsByBucket(userId, socialSubTab as 'daily' | 'completed' | 'missed');

  // Fetch bucket counts for all tabs upfront
  const { counts: careerCounts } = useCareerQuestBucketCounts(userId);
  const { counts: socialCounts } = useSocialQuestBucketCounts(userId);
  
  // Auto-assign or backfill daily quests through the unified scheduler route.
  useEffect(() => {
    if (!userId || hasAttemptedAssignment.current) return;
    
    const needsQuestBackfill = 
      careerSubTab === 'daily' && 
      (currentCareerQuests.length === 0 || currentSocialQuests.length === 0) &&
      !isLoadingCurrentCareer && 
      !isLoadingCurrentSocial;
    
    if (needsQuestBackfill && !assignDailyQuests.isPending) {
      console.log(`[QUEST PANEL] Backfilling daily quests for user ${userId}`);
      hasAttemptedAssignment.current = true;

      assignDailyQuests.mutate({ userId, force: true }, {
        onSuccess: (data) => {
          const totalQuests = Array.isArray(data) ? data.length : 0;
          toast({
            title: "Daily Quests Assigned!",
            description: totalQuests > 0 ? `${totalQuests} quests were refreshed for today` : 'Your quest list was refreshed',
          });
        },
        onError: (error) => {
          console.error(`[QUEST PANEL] Failed to assign quests:`, error);
          toast({
            title: "Quest Assignment Failed",
            description: error instanceof Error ? error.message : "Could not load your daily quests",
            variant: "destructive"
          });
        }
      });
    }
  }, [userId, currentCareerQuests, currentSocialQuests, isLoadingCurrentCareer, isLoadingCurrentSocial, careerSubTab, assignDailyQuests, toast]);

  // Fetch instant quests (trending opportunities) by type
  // DISABLED: Instant quests temporarily disabled for improvements - will re-enable in future
  // const { data: careerInstantQuests = [], isLoading: isLoadingCareerInstant } = useInstantQuests(userId, 'career');
  // const { data: socialInstantQuests = [], isLoading: isLoadingSocialInstant } = useInstantQuests(userId, 'social');
  const careerInstantQuests: any[] = [];
  const socialInstantQuests: any[] = [];
  const isLoadingCareerInstant = false;
  const isLoadingSocialInstant = false;

  // Combined loading states
  const isLoadingDaily = isLoadingCurrentCareer || isLoadingCurrentSocial;
  
  // Removed allQuests hook - now only using daily quests for cleaner UI

  
  // Removed XP progress functionality since it's now in the parent component

  // Removed refetch interval since bucket queries auto-refetch
  
  // Removed error handling since bucket queries have their own error handling
  
  // Current quest data is already available from the dynamic hooks above

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
  
  // Remove duplicate filtering since we now use bucket-based hooks directly
  
  // Removed completed/expired quest filtering - focus on daily quests only
  
  // Removed skill quest counting - simplified to daily quests only
  

  const renderQuestsList = (quests: any[], loading: boolean) => {
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
          <p className="text-gray-400 mt-2">
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
  
  // Removed error logging since bucket queries handle their own errors

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white">Brand Quests</h2>
        <p className="text-gray-400 text-sm">Complete quests to increase your professional influence</p>
      </div>

      <div className="mb-4">
        <WeeklyQuestCalendar userId={userId} />
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
          <TabsList className="grid grid-cols-2 mb-4 bg-white/5 border border-white/10 rounded-xl p-1.5 h-14 w-full">
            <TabsTrigger value="career" className="rounded-lg data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-white/5 h-full font-bold text-gray-400 transition-all flex items-center gap-2 text-sm">
              <span>Career Quests</span>
              <span className="text-xs opacity-70">({careerCounts.daily + careerCounts.completed + careerCounts.missed})</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="rounded-lg data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-white/5 h-full font-bold text-gray-400 transition-all flex items-center gap-2 text-sm">
              <span>Social Quests</span>
              <span className="text-xs opacity-70">({socialCounts.daily + socialCounts.completed + socialCounts.missed})</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="career" className="space-y-3 sm:space-y-4">
            <div className="text-xs sm:text-sm text-white/70 mb-2">
              Professional development quests to build your career foundation
            </div>
            
            {/* Career Quest Sub-tabs for Daily/Completed/Missed */}
            <Tabs value={careerSubTab} onValueChange={setCareerSubTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-3 bg-white/5 border border-white/10 rounded-xl p-1.5 h-12 w-full">
                <TabsTrigger value="daily" className="rounded-lg data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-white/5 h-full font-bold text-gray-400 transition-all text-xs flex items-center gap-1">
                  <span>Daily</span>
                  <span className="opacity-70">({careerCounts.daily})</span>
                </TabsTrigger>
                <TabsTrigger value="completed" className="rounded-lg data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-white/5 h-full font-bold text-gray-400 transition-all text-xs flex items-center gap-1">
                  <span>Completed</span>
                  <span className="opacity-70">({careerCounts.completed})</span>
                </TabsTrigger>
                <TabsTrigger value="missed" className="rounded-lg data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-white/5 h-full font-bold text-gray-400 transition-all text-xs flex items-center gap-1">
                  <span>Missed</span>
                  <span className="opacity-70">({careerCounts.missed})</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="daily">
                <div className="text-xs text-gray-400 mb-3">
                  {new Date().toLocaleDateString()} - Today's career quests
                </div>
                
                {/* Show career instant quests (trending opportunities) first */}
                {isLoadingCareerInstant ? (
                  <div className="mb-4">
                    <Skeleton className="w-full h-[180px] rounded-md" />
                  </div>
                ) : careerInstantQuests && careerInstantQuests.length > 0 ? (
                  <div className="mb-4 space-y-3">
                    <div className="text-xs font-semibold text-yellow-400/90 uppercase tracking-wide flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                      Trending Now
                    </div>
                    {careerInstantQuests.map((quest: any) => (
                      <InstantQuestCard key={quest.id} quest={quest} />
                    ))}
                  </div>
                ) : null}
                
                {/* Regular career quests */}
                {renderQuestsList(currentCareerQuests, isLoadingDaily)}
              </TabsContent>
              
              <TabsContent value="completed">
                <div className="text-xs text-white/60 mb-2">Recently completed career quests</div>
                {renderQuestsList(currentCareerQuests, isLoadingDaily)}
              </TabsContent>
              
              <TabsContent value="missed">
                <div className="text-xs text-white/60 mb-2">Missed or expired career quests</div>
                {renderQuestsList(currentCareerQuests, isLoadingDaily)}
              </TabsContent>
            </Tabs>
          </TabsContent>
          
          <TabsContent value="social" className="space-y-3 sm:space-y-4">
            <div className="text-xs sm:text-sm text-white/70 mb-2">
              Social media quests to amplify your professional brand online
            </div>
            
            {/* Social Quest Sub-tabs for Daily/Completed/Missed */}
            <Tabs value={socialSubTab} onValueChange={setSocialSubTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-2 dark-tabs-list border border-white/5 w-full h-auto">
                <TabsTrigger value="daily" className="dark-tabs-trigger flex flex-col sm:flex-row items-center gap-1 py-1 px-2 text-xs">
                  <span>Daily</span>
                  <span className="text-xs">({socialCounts.daily})</span>
                </TabsTrigger>
                <TabsTrigger value="completed" className="dark-tabs-trigger flex flex-col sm:flex-row items-center gap-1 py-1 px-2 text-xs">
                  <span>Completed</span>
                  <span className="text-xs">({socialCounts.completed})</span>
                </TabsTrigger>
                <TabsTrigger value="missed" className="dark-tabs-trigger flex flex-col sm:flex-row items-center gap-1 py-1 px-2 text-xs">
                  <span>Missed</span>
                  <span className="text-xs">({socialCounts.missed})</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="daily">
                <div className="text-xs text-white/60 mb-2">
                  {new Date().toLocaleDateString()} - Today's social media quests
                </div>
                
                {/* Show social instant quests (trending opportunities) first */}
                {isLoadingSocialInstant ? (
                  <div className="mb-4">
                    <Skeleton className="w-full h-[180px] rounded-md" />
                  </div>
                ) : socialInstantQuests && socialInstantQuests.length > 0 ? (
                  <div className="mb-4 space-y-3">
                    <div className="text-xs font-semibold text-yellow-400/90 uppercase tracking-wide flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                      Trending Now
                    </div>
                    {socialInstantQuests.map((quest: any) => (
                      <InstantQuestCard key={quest.id} quest={quest} />
                    ))}
                  </div>
                ) : null}
                
                {/* Regular social quests */}
                {renderQuestsList(currentSocialQuests, isLoadingDaily)}
              </TabsContent>
              
              <TabsContent value="completed">
                <div className="text-xs text-white/60 mb-2">Recently completed social quests</div>
                {renderQuestsList(currentSocialQuests, isLoadingDaily)}
              </TabsContent>
              
              <TabsContent value="missed">
                <div className="text-xs text-white/60 mb-2">Missed or expired social quests</div>
                {renderQuestsList(currentSocialQuests, isLoadingDaily)}
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}