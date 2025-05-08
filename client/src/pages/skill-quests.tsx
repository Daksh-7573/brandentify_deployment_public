import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/page-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useUserProfile } from '@/hooks/use-user-profile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  useUserQuestsWithDefinitions,
  useUserXp,
  useMarkQuestCompleted
} from '@/hooks/use-career-quests';
import { SkillQuestTracker } from '@/components/career-quests/skill-quest-tracker';
import { UserQuest } from '@/types/career-quest';
import { Link } from 'wouter';
import { XpProgressBar } from '@/components/career-quests/xp-progress-bar';
import { Skeleton } from '@/components/ui/skeleton';

export default function SkillQuestsPage() {
  const { userData } = useUserProfile();
  const userId = userData?.id || 0;
  const [activeTab, setActiveTab] = useState<string>('skill-tracker');
  
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
  
  const markCompleted = useMarkQuestCompleted();
  
  // Find the skill-related quests
  const findQuestByAction = (action: string): UserQuest | undefined => {
    if (!allQuests) return undefined;
    
    return allQuests.find(quest => 
      quest.definition?.targetAction === action && 
      quest.status !== 'completed'
    );
  };
  
  // Get specific skill quests
  const profileQuest = findQuestByAction('add_skill');
  const categoryQuest = findQuestByAction('add_skill_category');
  const industryQuest = findQuestByAction('add_industry_skill');
  const resumeSkillQuest = findQuestByAction('update_resume_skills');
  const projectSkillQuest = findQuestByAction('add_project_technologies');
  
  const handleCompleteQuest = (quest: UserQuest) => {
    if (!quest) return;
    
    markCompleted.mutate({
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
      onError: (error) => {
        toast({
          title: 'Error completing quest',
          description: (error as Error).message,
          variant: 'destructive',
        });
      }
    });
  };
  
  return (
    <PageLayout title="Skill Quests" subtitle="Complete specific skill-related quests to boost your profile and resume">
      <div className="container max-w-5xl mx-auto py-8">
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          <div className="w-full md:w-2/3">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Skill Quests Dashboard</CardTitle>
                <CardDescription>
                  Track and complete skill-specific quests to improve your profile's effectiveness
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
                      monthlyEarned={userXp.currentMonthEarned}
                      lifetimeEarned={userXp.lifetimeEarned}
                      className="mb-6"
                    />
                  )
                )}
              
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="skill-tracker">Skill Tracker</TabsTrigger>
                    <TabsTrigger value="resume-skills">Resume Skills</TabsTrigger>
                    <TabsTrigger value="project-skills">Project Skills</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="skill-tracker" className="space-y-6 mt-6">
                    {isLoadingQuests ? (
                      <Skeleton className="w-full h-[400px]" />
                    ) : (
                      <SkillQuestTracker 
                        profileQuest={profileQuest}
                        categoryQuest={categoryQuest}
                        industryQuest={industryQuest}
                        onCompleteQuest={handleCompleteQuest}
                      />
                    )}
                  </TabsContent>
                  
                  <TabsContent value="resume-skills" className="space-y-6 mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>{resumeSkillQuest?.definition?.title || "Resume Skills Alignment"}</CardTitle>
                        <CardDescription>
                          {resumeSkillQuest?.definition?.description || 
                            "Ensure your resume skills section includes at least 5 skills from your profile"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="bg-muted/30 p-4 rounded-md border">
                          <p className="text-sm">
                            Your resume should include skills relevant to the jobs you're targeting. Using skills from your profile ensures consistency across your professional identity.
                          </p>
                          <div className="mt-4 flex items-center justify-between">
                            <Button size="sm" asChild>
                              <Link href="/resume-editor">Go to Resume Editor</Link>
                            </Button>
                            {resumeSkillQuest && (
                              <Button 
                                size="sm" 
                                onClick={() => handleCompleteQuest(resumeSkillQuest)}
                                disabled={markCompleted.isPending}
                              >
                                Mark as Completed
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <div className="bg-muted/20 p-3 rounded-md border mt-4">
                          <h4 className="text-sm font-medium mb-2">Musk's Tip:</h4>
                          <p className="text-sm text-muted-foreground">
                            {resumeSkillQuest?.definition?.muskTip || 
                              "Your resume skills should align with your profile but be tailored to specific job targets. Include keywords from job descriptions in your industry."}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="project-skills" className="space-y-6 mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>{projectSkillQuest?.definition?.title || "Project Skills Showcase"}</CardTitle>
                        <CardDescription>
                          {projectSkillQuest?.definition?.description || 
                            "Add technologies/skills used in at least one of your portfolio projects"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="bg-muted/30 p-4 rounded-md border">
                          <p className="text-sm">
                            When you add specific technologies to your projects, it helps validate your skill claims and makes your portfolio more credible to recruiters and potential clients.
                          </p>
                          <div className="mt-4 flex items-center justify-between">
                            <Button size="sm" asChild>
                              <Link href="/projects">Go to Projects</Link>
                            </Button>
                            {projectSkillQuest && (
                              <Button 
                                size="sm" 
                                onClick={() => handleCompleteQuest(projectSkillQuest)}
                                disabled={markCompleted.isPending}
                              >
                                Mark as Completed
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <div className="bg-muted/20 p-3 rounded-md border mt-4">
                          <h4 className="text-sm font-medium mb-2">Musk's Tip:</h4>
                          <p className="text-sm text-muted-foreground">
                            {projectSkillQuest?.definition?.muskTip || 
                              "Listing specific technologies used in projects validates your skill claims and helps recruiters find you through skill-based searches."}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          <div className="w-full md:w-1/3">
            <Card>
              <CardHeader>
                <CardTitle>Quest Benefits</CardTitle>
                <CardDescription>Why completing skill quests matters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="text-lg font-semibold">✓</span>
                    <div>
                      <h4 className="text-sm font-medium">Enhanced Visibility</h4>
                      <p className="text-xs text-muted-foreground">
                        Profiles with categorized skills receive 4x more views from recruiters.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <span className="text-lg font-semibold">✓</span>
                    <div>
                      <h4 className="text-sm font-medium">Better Matching</h4>
                      <p className="text-xs text-muted-foreground">
                        Industry-specific skills improve your match rate with relevant job opportunities.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <span className="text-lg font-semibold">✓</span>
                    <div>
                      <h4 className="text-sm font-medium">Professional Credibility</h4>
                      <p className="text-xs text-muted-foreground">
                        Skills tied to projects provide proof of your capabilities beyond simple claims.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <span className="text-lg font-semibold">✓</span>
                    <div>
                      <h4 className="text-sm font-medium">Resume Optimization</h4>
                      <p className="text-xs text-muted-foreground">
                        Align your profile and resume skills to create a consistent professional story.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t mt-4">
                  <h4 className="text-sm font-medium mb-2">Ready to level up?</h4>
                  <Button className="w-full" asChild>
                    <Link href="/profile/edit/skills">Edit Your Skills</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}