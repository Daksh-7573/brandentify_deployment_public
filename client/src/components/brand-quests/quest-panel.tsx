import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  userId: number;
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
        description: "We'll try to recover your data. You can also try using demo mode.",
        variant: 'destructive',
      });
    }
    
    if (allError) {
      console.log('Error fetching all quests:', allError);
      toast({
        title: 'Error fetching quests',
        description: "We'll try to recover your data. You can also try using demo mode.",
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
  
  const forceDemoMode = () => {
    // Set demo user ID in local storage
    localStorage.setItem('demo_user_id', '1');
    toast({
      title: "Switched to Demo Mode",
      description: "Using demo user to show quests",
      duration: 3000,
    });
    // Redirect to brand quests with demo flag
    window.location.href = '/brand-quests?demo=true';
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl">Brand Quests</CardTitle>
      </CardHeader>
      <CardContent>
        {(weeklyError || !weeklyQuests || weeklyQuests.length === 0) && !isLoadingWeekly ? (
          <div className="p-4 my-4 rounded-md text-center space-y-4">
            <p className="text-muted-foreground">
              {weeklyError ? 
                "There was an error loading your quests." : 
                "No quests available for this week yet."}
            </p>
            <Button 
              variant="default" 
              size="sm"
              onClick={forceDemoMode}
            >
              Try Demo Mode Instead
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="weekly" value={tabValue} onValueChange={setTabValue}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="weekly">Weekly ({weeklyQuests?.length || 0})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedQuests.length})</TabsTrigger>
              <TabsTrigger value="expired">Missed ({expiredQuests.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="weekly" className="space-y-4">
              <div className="text-sm text-muted-foreground mb-2">
                Week {currentWeek}, {currentYear} - Weekly quests refresh every Monday
              </div>
              {renderQuestsList(weeklyQuests, isLoadingWeekly)}
            </TabsContent>
            
            <TabsContent value="expired" className="space-y-4">
              <div className="text-sm text-muted-foreground mb-2">
                Quests that expired without completion - missed XP opportunities
              </div>
              {renderQuestsList(expiredQuests, isLoadingAll)}
            </TabsContent>
            
            <TabsContent value="completed" className="space-y-4">
              <div className="text-sm text-muted-foreground mb-2">
                Completed quests that earned you XP rewards
              </div>
              {renderQuestsList(completedQuests, isLoadingAll)}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}