import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
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
  const [tabValue, setTabValue] = useState('weekly');
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
          <h3 className="text-lg font-medium">No quests available</h3>
          <p className="text-muted-foreground mt-2">
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
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white">Brand Quests</h2>
        <p className="text-white/70 text-sm">Complete quests to increase your influence</p>
      </div>
      
      {isLoadingWeekly ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-md bg-gray-800/60" />
          <Skeleton className="h-24 w-full rounded-md bg-gray-800/60" />
          <Skeleton className="h-24 w-full rounded-md bg-gray-800/60" />
        </div>
      ) : (
        <Tabs defaultValue="weekly" value={tabValue} onValueChange={setTabValue}>
          <TabsList className="grid grid-cols-3 mb-4 neo-glass-tabs bg-gray-900/40 border border-white/5">
            <TabsTrigger value="weekly" className="text-white hover:text-gray-200">
              Weekly ({weeklyQuests?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-white hover:text-gray-200">
              Completed ({completedQuests.length})
            </TabsTrigger>
            <TabsTrigger value="expired" className="text-white hover:text-gray-200">
              Missed ({expiredQuests.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="weekly" className="space-y-4">
            <div className="text-sm text-white/70 mb-2">
              Week {currentWeek}, {currentYear} - Weekly quests refresh every Monday
            </div>
            {renderQuestsList(weeklyQuests, isLoadingWeekly)}
          </TabsContent>
          
          <TabsContent value="expired" className="space-y-4">
            <div className="text-sm text-white/70 mb-2">
              Quests that expired without completion - missed XP opportunities
            </div>
            {renderQuestsList(expiredQuests, isLoadingAll)}
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4">
            <div className="text-sm text-white/70 mb-2">
              Completed quests that earned you XP rewards
            </div>
            {renderQuestsList(completedQuests, isLoadingAll)}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}