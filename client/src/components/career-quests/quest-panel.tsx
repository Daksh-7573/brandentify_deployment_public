import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useFeatureAccess } from '@/hooks/use-feature-access';
import { Lock } from 'lucide-react';
import { 
  useUserQuestsWithDefinitions, 
  useUserWeeklyQuests,
  useUserDailyQuests,
  useUserDailySocialQuests,
  getCurrentWeekNumber, 
  getCurrentYear
} from '@/hooks/use-career-quests';
import { QuestCard } from './quest-card';
import { cn } from '@/lib/utils';

interface QuestPanelProps {
  userId: number;
  className?: string;
}

export function QuestPanel({ userId, className }: QuestPanelProps) {
  const { toast } = useToast();
  const { isPremium, canAccessQuestType } = useFeatureAccess();
  const [tabValue, setTabValue] = useState('today');
  const currentWeek = getCurrentWeekNumber();
  const currentYear = getCurrentYear();
  
  // Check social quest access
  const canAccessSocialQuests = canAccessQuestType('social').hasAccess;
  
  const { 
    data: dailyCareerQuests,
    isLoading: isLoadingDaily,
    error: dailyError,
    refetch: refetchDaily
  } = useUserDailyQuests(userId);
  
  const { 
    data: dailySocialQuests,
    isLoading: isLoadingSocial,
    error: socialError,
    refetch: refetchSocial
  } = useUserDailySocialQuests(userId);
  
  const {
    data: allQuests,
    isLoading: isLoadingAll,
    error: allError,
    refetch: refetchAll
  } = useUserQuestsWithDefinitions(userId);
  
  // Combine daily career and social quests (filtered by access)
  const dailyQuests = [
    ...(dailyCareerQuests || []),
    ...(canAccessSocialQuests ? (dailySocialQuests || []) : [])
  ];
  
  // Removed XP progress functionality since it's now in the parent component

  useEffect(() => {
    const refetchInterval = setInterval(() => {
      refetchDaily();
      refetchSocial();
      refetchAll();
    }, 60000); // Refetch every minute
    
    return () => clearInterval(refetchInterval);
  }, [refetchDaily, refetchSocial, refetchAll]);
  
  useEffect(() => {
    if (dailyError) {
      toast({
        title: 'Error fetching daily career quests',
        description: (dailyError as Error).message,
        variant: 'destructive',
      });
    }
    
    if (socialError) {
      toast({
        title: 'Error fetching daily social quests',
        description: (socialError as Error).message,
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
  }, [dailyError, socialError, allError, toast]);
  
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
  
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl">Brand Quests</CardTitle>
        {!canAccessSocialQuests && (
          <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded text-sm flex items-start gap-2">
            <Lock className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <span className="text-amber-600">Social media quests available in Premium tier</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        
        <Tabs defaultValue="today" value={tabValue} onValueChange={setTabValue}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="today">Today ({dailyQuests?.length || 0})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedQuests.length})</TabsTrigger>
            <TabsTrigger value="expired">Missed ({expiredQuests.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="today" className="space-y-4">
            <div className="text-sm text-muted-foreground mb-2">
              {new Date().toLocaleDateString()} - Today's quests for your career growth
            </div>
            {renderQuestsList(dailyQuests, isLoadingDaily || isLoadingSocial)}
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
      </CardContent>
    </Card>
  );
}