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
} from '@/hooks/use-career-quests';
import { QuestCard } from './quest-card';
import { cn } from '@/lib/utils';
import { Link } from 'wouter';
import { BadgeCheck, Lightbulb, GraduationCap } from 'lucide-react';

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
  }, [weeklyError, allError, toast]);
  
  const activeQuests = allQuests?.filter(quest => quest.status === 'active') || [];
  const completedQuests = allQuests?.filter(quest => quest.status === 'completed') || [];
  
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
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/skill-quests">
              <GraduationCap className="h-4 w-4 mr-2" />
              Skill Quests
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/career-quests">View All</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Skill Quests Highlight Card */}
        {!isLoadingAll && skillQuests.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 rounded-md border border-blue-100 dark:border-blue-900 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lightbulb className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="font-medium">New Skill Quests Available!</h3>
                <p className="text-sm text-muted-foreground">Complete specific skill quests to boost your profile</p>
              </div>
            </div>
            <Button size="sm" asChild>
              <Link href="/skill-quests">View Skill Quests</Link>
            </Button>
          </div>
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