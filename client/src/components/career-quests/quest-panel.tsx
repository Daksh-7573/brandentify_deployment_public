import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { 
  useUserQuestsWithDefinitions, 
  useUserXp, 
  useUserWeeklyQuests, 
  getCurrentWeekNumber, 
  getCurrentYear
} from '@/hooks/use-career-quests';
import { QuestCard } from './quest-card';
import { XpProgressBar } from './xp-progress-bar';
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
  
  const {
    data: userXp,
    isLoading: isLoadingXp,
    error: xpError
  } = useUserXp(userId);

  useEffect(() => {
    const refetchInterval = setInterval(() => {
      refetchWeekly();
      refetchAll();
    }, 60000); // Refetch every minute
    
    return () => clearInterval(refetchInterval);
  }, [refetchWeekly, refetchAll]);
  
  useEffect(() => {
    if (weeklyError) {
      toast({
        title: 'Error fetching weekly quests',
        description: (weeklyError as Error).message,
        variant: 'destructive',
      });
    }
    
    if (allError) {
      toast({
        title: 'Error fetching quests',
        description: (allError as Error).message,
        variant: 'destructive',
      });
    }
    
    if (xpError) {
      toast({
        title: 'Error fetching XP',
        description: (xpError as Error).message,
        variant: 'destructive',
      });
    }
  }, [weeklyError, allError, xpError, toast]);
  
  const activeQuests = allQuests?.filter(quest => quest.status === 'active') || [];
  const completedQuests = allQuests?.filter(quest => quest.status === 'completed') || [];
  
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
            Check back later for new career quests.
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
  
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-2xl">Career Quests</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <a href="/career-quests">View All</a>
        </Button>
      </CardHeader>
      <CardContent>
        {/* XP Progress Bar */}
        {isLoadingXp ? (
          <Skeleton className="w-full h-[40px] mb-4" />
        ) : (
          userXp && (
            <XpProgressBar 
              balance={userXp.balance} 
              monthlyEarned={userXp.currentMonthEarned}
              lifetimeEarned={userXp.lifetimeEarned}
              className="mb-4"
            />
          )
        )}
        
        <Tabs defaultValue="weekly" value={tabValue} onValueChange={setTabValue}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="weekly">Weekly ({weeklyQuests?.length || 0})</TabsTrigger>
            <TabsTrigger value="active">Active ({activeQuests.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedQuests.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="weekly" className="space-y-4">
            <div className="text-sm text-muted-foreground mb-2">
              Week {currentWeek}, {currentYear} - Weekly quests refresh every Monday
            </div>
            {renderQuestsList(weeklyQuests, isLoadingWeekly)}
          </TabsContent>
          
          <TabsContent value="active" className="space-y-4">
            {renderQuestsList(activeQuests, isLoadingAll)}
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4">
            {renderQuestsList(completedQuests, isLoadingAll)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}