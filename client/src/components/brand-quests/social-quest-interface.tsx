import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { SocialQuestCard } from './social-quest-card';
import { useToast } from '@/hooks/use-toast';
import { 
  useWeeklySocialQuests,
  useCompletedSocialQuests,
  useMissedSocialQuests,
  useCompleteSocialQuest
} from '@/hooks/use-social-quests';
import { 
  getCurrentWeekNumber, 
  getCurrentYear
} from '@/hooks/use-career-quests';

interface SocialQuestInterfaceProps {
  userId?: number;
  className?: string;
}

export function SocialQuestInterface({ userId, className }: SocialQuestInterfaceProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('weekly');
  const currentWeek = getCurrentWeekNumber();
  const currentYear = getCurrentYear();
  
  // Hooks for different quest states
  const {
    data: weeklySocialQuests,
    isLoading: isLoadingWeekly,
    error: weeklyError,
    refetch: refetchWeekly
  } = useWeeklySocialQuests(userId);
  
  const {
    data: completedSocialQuestsData,
    isLoading: isLoadingCompleted,
    error: completedError,
    refetch: refetchCompleted
  } = useCompletedSocialQuests(userId);
  
  const {
    data: missedSocialQuestsData,
    isLoading: isLoadingMissed,
    error: missedError,
    refetch: refetchMissed
  } = useMissedSocialQuests(userId);
  
  const completeSocialQuestMutation = useCompleteSocialQuest(userId);

  // Handle quest completion
  const handleCompleteQuest = (questId: number) => {
    completeSocialQuestMutation.mutate(
      { questId },
      {
        onSuccess: () => {
          toast({
            title: 'Social Quest Completed!',
            description: 'Great work! Your cross-platform presence is growing.',
          });
          refetchWeekly();
          refetchCompleted();
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
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-3">
      <Skeleton className="h-32 w-full rounded-md bg-gray-800/60" />
      <Skeleton className="h-32 w-full rounded-md bg-gray-800/60" />
      <Skeleton className="h-32 w-full rounded-md bg-gray-800/60" />
    </div>
  );

  // Empty state component
  const EmptyState = ({ title, description }: { title: string; description: string }) => (
    <div className="text-center py-8">
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-white/70 text-sm">{description}</p>
    </div>
  );

  return (
    <div className={className}>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white mb-1">✨ NEW Social Quests ✨</h2>
        <p className="text-white/70 text-sm">🔥 Brand new 3-tab weekly progression system - NO Generate Tasks button!</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4 dark-tabs-list border border-white/5 w-full h-auto">
          <TabsTrigger 
            value="weekly" 
            className="dark-tabs-trigger flex flex-col items-center gap-1 py-2 px-2 text-sm"
          >
            <span>Weekly</span>
            <span className="text-xs">({weeklySocialQuests?.length || 0})</span>
          </TabsTrigger>
          <TabsTrigger 
            value="completed" 
            className="dark-tabs-trigger flex flex-col items-center gap-1 py-2 px-2 text-sm"
          >
            <span>Completed</span>
            <span className="text-xs">({completedSocialQuestsData?.quests?.length || 0})</span>
          </TabsTrigger>
          <TabsTrigger 
            value="missed" 
            className="dark-tabs-trigger flex flex-col items-center gap-1 py-2 px-2 text-sm"
          >
            <span>Missed</span>
            <span className="text-xs">({missedSocialQuestsData?.quests?.length || 0})</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Weekly Social Quests Tab */}
        <TabsContent value="weekly" className="space-y-4">
          <div className="text-sm text-white/70 mb-3">
            Week {currentWeek}, {currentYear} - AI-powered external platform tasks
          </div>
          
          {isLoadingWeekly ? (
            <LoadingSkeleton />
          ) : !weeklySocialQuests || weeklySocialQuests.length === 0 ? (
            <EmptyState 
              title="Generating Your Weekly Social Quests"
              description="AI is creating personalized tasks to build your cross-platform presence. Auto-loading your personalized weekly quests..."
            />
          ) : (
            <div className="space-y-4">
              {weeklySocialQuests.map((quest, index) => (
                <SocialQuestCard 
                  key={quest.id || index} 
                  quest={quest}
                  userId={userId!}
                  onComplete={() => handleCompleteQuest(quest.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Completed Social Quests Tab */}
        <TabsContent value="completed" className="space-y-4">
          <div className="text-sm text-white/70 mb-3">
            Completed social quests that earned you cross-platform influence
          </div>
          
          {isLoadingCompleted ? (
            <LoadingSkeleton />
          ) : !completedSocialQuestsData?.quests || completedSocialQuestsData.quests.length === 0 ? (
            <EmptyState 
              title="No Completed Social Quests"
              description="Complete weekly social quests to see them here"
            />
          ) : (
            <div className="space-y-4">
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
        <TabsContent value="missed" className="space-y-4">
          <div className="text-sm text-white/70 mb-3">
            Social quests that expired without completion - missed opportunities
          </div>
          
          {isLoadingMissed ? (
            <LoadingSkeleton />
          ) : !missedSocialQuestsData?.quests || missedSocialQuestsData.quests.length === 0 ? (
            <EmptyState 
              title="No Missed Social Quests"
              description="Great job! You haven't missed any social quests recently"
            />
          ) : (
            <div className="space-y-4">
              {missedSocialQuestsData.quests.map((quest, index) => (
                <SocialQuestCard 
                  key={quest.id || index} 
                  quest={quest}
                  userId={userId!}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}