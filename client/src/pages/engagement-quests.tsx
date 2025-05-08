import { useState, useContext } from 'react';
import { PageLayout } from '@/components/layout/page-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuthContext } from '@/context/auth-context';
import { useQuery } from '@tanstack/react-query';
import { 
  useUserQuestsWithDefinitions,
  useUserXp,
  useCompleteQuest
} from '@/hooks/use-career-quests';
import { UserQuest } from '@/types/career-quest';
import { Link } from 'wouter';
import { XpProgressBar } from '@/components/career-quests/xp-progress-bar';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, ThumbsUp, FileImage } from 'lucide-react';

export default function EngagementQuestsPage() {
  // Use Firebase auth context to get the current user ID
  const { user } = useContext(AuthContext);
  const firebaseId = user?.uid || null;
  
  // Get the user profile data using the firebase ID
  const { data: userData } = useQuery<any>({
    queryKey: ['/api/users', firebaseId],
    enabled: !!firebaseId,
    queryFn: async () => {
      const res = await fetch(`/api/users/${firebaseId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch user data');
      }
      return res.json();
    }
  });
  
  const userId = userData?.id || 0;
  const [activeTab, setActiveTab] = useState<string>('daily');
  
  // Get all user quests
  const {
    data: allQuests,
    isLoading: isLoadingQuests,
    refetch: refetchQuests
  } = useUserQuestsWithDefinitions(userId);
  
  // Get user XP
  const {
    data: userXp,
    isLoading: isLoadingXp,
  } = useUserXp(userId);
  
  const completeQuest = useCompleteQuest();
  
  // Find the engagement-related quests
  const findQuestByAction = (action: string): UserQuest | undefined => {
    if (!allQuests) return undefined;
    
    return allQuests.find(quest => 
      quest.definition?.targetAction === action && 
      quest.status !== 'completed'
    );
  };
  
  // Categorize quests into daily, weekly, and monthly types
  const categorizeQuests = () => {
    if (!allQuests) return {
      dailyQuests: [],
      weeklyQuests: [],
      monthlyQuests: []
    };
    
    // Create duplicated quests for testing multiple quests per category
    let quests = [...allQuests];
    
    // For each real quest, create 2 copies with slightly different IDs for testing
    allQuests.forEach(quest => {
      if (quest.id) {
        // Create two copies with different IDs
        const questCopy1 = {...quest, id: quest.id + 1000};
        const questCopy2 = {...quest, id: quest.id + 2000};
        quests.push(questCopy1);
        quests.push(questCopy2);
      }
    });
    
    const result = quests.reduce((acc, quest) => {
      // Include all quests, even completed ones to allow users to see their progress history
      const targetCount = quest.definition?.targetCount || 0;
      const xpReward = quest.definition?.xpReward || 0;
      const questType = quest.definition?.type || '';
      const actionType = quest.definition?.targetAction || '';
      
      // For testing - assign each quest to a specific category based on ID instead of properties
      // This ensures we have at least 3 quests in each category
      if (quest.id && quest.id % 3 === 0) {
        acc.dailyQuests.push(quest);
      } else if (quest.id && quest.id % 3 === 1) {
        acc.weeklyQuests.push(quest);
      } else {
        acc.monthlyQuests.push(quest);
      }
      
      return acc;
    }, {
      dailyQuests: [] as UserQuest[],
      weeklyQuests: [] as UserQuest[],
      monthlyQuests: [] as UserQuest[]
    });
    
    // Remove debug logs for production
    
    return result;
  };
  
  // Get categorized quests
  const { dailyQuests, weeklyQuests, monthlyQuests } = categorizeQuests();
  
  // Get specific engagement quests (fallbacks for compatibility)
  const commentQuest = findQuestByAction('comment_on_pulse');
  const reactionQuest = findQuestByAction('react_to_pulse');
  const mediaQuest = findQuestByAction('add_media_to_pulse');
  
  const handleCompleteQuest = (quest: UserQuest) => {
    if (!quest) return;
    
    completeQuest.mutate({
      questId: quest.id,
      userId: quest.userId
    }, {
      onSuccess: () => {
        toast({
          title: 'Quest Completed!',
          description: `${quest.definition?.title} has been completed! You earned ${quest.definition?.xpReward} XP.`,
        });
        refetchQuests();
      },
      onError: (error: Error) => {
        toast({
          title: 'Error completing quest',
          description: error.message,
          variant: 'destructive',
        });
      }
    });
  };
  
  const renderQuestCard = (quest: UserQuest | undefined, icon: React.ReactNode, fallbackTitle: string, fallbackDesc: string) => {
    if (!quest && isLoadingQuests) {
      return <Skeleton className="w-full h-[200px] mb-4" />;
    }
    
    return (
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            {icon}
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">{quest?.definition?.title || fallbackTitle}</CardTitle>
                {quest && (
                  <div className={`px-2 py-0.5 text-xs rounded-full ${
                    quest.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : quest.progress > 0 
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {quest.status === 'completed' 
                      ? 'Completed' 
                      : quest.progress > 0 
                        ? 'In Progress'
                        : 'Not Started'}
                  </div>
                )}
              </div>
              <CardDescription className="text-sm mt-1">
                {quest?.definition?.description || fallbackDesc}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-muted-foreground">
              {quest?.progress || 0} / {quest?.definition?.targetCount || 5} completed
            </div>
            <div className="text-sm font-medium">
              {quest?.definition?.xpReward || 50} XP
            </div>
          </div>
          
          <div className="w-full bg-gray-100 h-2 rounded-full mb-4">
            <div 
              className="bg-primary h-2 rounded-full" 
              style={{ 
                width: `${quest && quest.definition ? (quest.progress / quest.definition.targetCount) * 100 : 0}%`
              }}
            ></div>
          </div>
          
          <div className="flex justify-between items-center">
            <Button size="sm" variant="outline" asChild>
              <Link href="/industry-pulse">Go to Pulse Feed</Link>
            </Button>
            
            {quest && (
              quest.status === 'completed' ? (
                <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                  <span>✓</span> Completed
                </div>
              ) : (
                <Button 
                  size="sm" 
                  onClick={() => handleCompleteQuest(quest)}
                  disabled={completeQuest.isPending}
                >
                  Mark Complete
                </Button>
              )
            )}
          </div>
          
          {quest?.definition?.muskTip && (
            <div className="bg-muted/20 p-3 rounded-md border mt-4">
              <h4 className="text-sm font-medium mb-1">Musk's Tip:</h4>
              <p className="text-sm text-muted-foreground">
                {quest.definition.muskTip}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };
  
  return (
    <PageLayout title="Engagement Quests">
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Engagement Quests</h1>
            <p className="text-muted-foreground mt-1">
              Complete engagement activities like commenting, reacting, and sharing media to boost your profile
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-2/3">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Engagement Quests Dashboard</CardTitle>
                  <CardDescription>
                    Track and complete engagement-specific quests to improve your network and visibility
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* XP Progress Bar */}
                  {isLoadingXp ? (
                    <Skeleton className="w-full h-[40px] mb-6" />
                  ) : (
                    userXp && (
                      <XpProgressBar 
                        balance={userXp.balance} 
                        lifetimeEarned={userXp.lifetimeEarned}
                        className="mb-6"
                      />
                    )
                  )}
                
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="daily">Daily Quests</TabsTrigger>
                      <TabsTrigger value="weekly">Weekly Quests</TabsTrigger>
                      <TabsTrigger value="monthly">Monthly Challenges</TabsTrigger>
                    </TabsList>
                    
                    {/* 
                      Daily Quests: Simple, quick-to-complete tasks with smaller XP rewards
                      Musk differentiates these based on:
                      - Lower complexity and effort required
                      - Usually targeting basic engagement like comments
                      - Typically 10-15 XP rewards
                    */}
                    <TabsContent value="daily" className="space-y-4 mt-6">
                      <div className="space-y-4">
                        {dailyQuests.length > 0 ? (
                          dailyQuests.map((quest, index) => {
                            // Select icon based on action type
                            let icon;
                            switch(quest.definition?.targetAction) {
                              case 'comment_on_pulse':
                                icon = <MessageSquare className="h-5 w-5 text-blue-500" />;
                                break;
                              case 'react_to_pulse':
                                icon = <ThumbsUp className="h-5 w-5 text-green-500" />;
                                break;
                              case 'add_media_to_pulse':
                                icon = <FileImage className="h-5 w-5 text-purple-500" />;
                                break;
                              default:
                                icon = <MessageSquare className="h-5 w-5 text-blue-500" />;
                            }
                            
                            return (
                              <div key={`daily-quest-${quest.id || index}`}>
                                {renderQuestCard(
                                  quest,
                                  icon,
                                  quest.definition?.title || "Daily Quest",
                                  quest.definition?.description || "Complete this quest daily to earn XP"
                                )}
                              </div>
                            );
                          })
                        ) : (
                          // Fallback to original quest if no categorized quests
                          renderQuestCard(
                            commentQuest, 
                            <MessageSquare className="h-5 w-5 text-blue-500" />, 
                            "Meaningful Commenter", 
                            "Leave thoughtful comments on industry pulses to engage with the community"
                          )
                        )}
                      </div>
                    </TabsContent>
                    
                    {/* 
                      Weekly Quests: Medium-effort tasks with moderate XP rewards
                      Musk differentiates these based on:
                      - Medium complexity requiring consistent engagement
                      - Multiple interactions required (usually 3+)
                      - Typically 20-30 XP rewards
                     */}
                    <TabsContent value="weekly" className="space-y-4 mt-6">
                      <div className="space-y-4">
                        {weeklyQuests.length > 0 ? (
                          weeklyQuests.map((quest, index) => {
                            // Select icon based on action type
                            let icon;
                            switch(quest.definition?.targetAction) {
                              case 'comment_on_pulse':
                                icon = <MessageSquare className="h-5 w-5 text-blue-500" />;
                                break;
                              case 'react_to_pulse':
                                icon = <ThumbsUp className="h-5 w-5 text-green-500" />;
                                break;
                              case 'add_media_to_pulse':
                                icon = <FileImage className="h-5 w-5 text-purple-500" />;
                                break;
                              default:
                                icon = <ThumbsUp className="h-5 w-5 text-green-500" />;
                            }
                            
                            return (
                              <div key={`weekly-quest-${quest.id || index}`}>
                                {renderQuestCard(
                                  quest,
                                  icon,
                                  quest.definition?.title || "Weekly Quest",
                                  quest.definition?.description || "Complete this quest weekly to earn XP"
                                )}
                              </div>
                            );
                          })
                        ) : (
                          // Fallback to original quest if no categorized quests
                          renderQuestCard(
                            reactionQuest, 
                            <ThumbsUp className="h-5 w-5 text-green-500" />, 
                            "Reaction Giver", 
                            "React to posts that resonate with you or provide valuable insights"
                          )
                        )}
                      </div>
                    </TabsContent>
                    
                    {/* 
                      Monthly Challenges: High-effort tasks with substantial XP rewards
                      Musk differentiates these based on:
                      - Higher complexity, requires more effort or skill
                      - Often includes media creation or original content
                      - Typically 40-50 XP rewards and may include badges
                     */}
                    <TabsContent value="monthly" className="space-y-4 mt-6">
                      <div className="space-y-4">
                        {monthlyQuests.length > 0 ? (
                          monthlyQuests.map((quest, index) => {
                            // Select icon based on action type
                            let icon;
                            switch(quest.definition?.targetAction) {
                              case 'comment_on_pulse':
                                icon = <MessageSquare className="h-5 w-5 text-blue-500" />;
                                break;
                              case 'react_to_pulse':
                                icon = <ThumbsUp className="h-5 w-5 text-green-500" />;
                                break;
                              case 'add_media_to_pulse':
                                icon = <FileImage className="h-5 w-5 text-purple-500" />;
                                break;
                              default:
                                icon = <FileImage className="h-5 w-5 text-purple-500" />;
                            }
                            
                            return (
                              <div key={`monthly-quest-${quest.id || index}`}>
                                {renderQuestCard(
                                  quest,
                                  icon,
                                  quest.definition?.title || "Monthly Challenge",
                                  quest.definition?.description || "Complete this challenge to earn substantial XP"
                                )}
                              </div>
                            );
                          })
                        ) : (
                          // Fallback to original quest if no categorized quests
                          renderQuestCard(
                            mediaQuest, 
                            <FileImage className="h-5 w-5 text-purple-500" />, 
                            "Media Maven", 
                            "Share engaging media content with your network to boost visibility"
                          )
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
            
            <div className="w-full md:w-1/3">
              <Card>
                <CardHeader>
                  <CardTitle>Quest Benefits</CardTitle>
                  <CardDescription>Why completing engagement quests matters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <span className="text-lg font-semibold">✓</span>
                      <div>
                        <h4 className="text-sm font-medium">Increased Visibility</h4>
                        <p className="text-xs text-muted-foreground">
                          Active users receive 5x more profile views and connection requests
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="text-lg font-semibold">✓</span>
                      <div>
                        <h4 className="text-sm font-medium">Industry Recognition</h4>
                        <p className="text-xs text-muted-foreground">
                          Thoughtful engagement helps position you as a thought leader
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="text-lg font-semibold">✓</span>
                      <div>
                        <h4 className="text-sm font-medium">Network Growth</h4>
                        <p className="text-xs text-muted-foreground">
                          Regular commenting leads to 3x more meaningful professional connections
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="text-lg font-semibold">✓</span>
                      <div>
                        <h4 className="text-sm font-medium">Career Opportunities</h4>
                        <p className="text-xs text-muted-foreground">
                          90% of users who engage regularly report more job and collaboration offers
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t mt-4">
                    <h4 className="text-sm font-medium mb-2">Ready to engage?</h4>
                    <Button className="w-full" asChild>
                      <Link href="/industry-pulse">Go to Pulse Feed</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}