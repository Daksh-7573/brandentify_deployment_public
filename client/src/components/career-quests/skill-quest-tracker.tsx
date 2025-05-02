import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useUpdateQuestProgress } from '@/hooks/use-career-quests';
import { UserQuest } from '@/types/career-quest';

// Industry-specific skill suggestions
const industrySkills: Record<string, string[]> = {
  'Healthcare': [
    'Clinical Research', 
    'Medical Device Development', 
    'Regulatory Compliance', 
    'Patient Care', 
    'Health Informatics',
    'Medical Writing',
    'Quality Assurance'
  ],
  'Technology': [
    'Software Development', 
    'Cloud Computing', 
    'Data Analysis', 
    'UI/UX Design', 
    'Cybersecurity',
    'System Architecture',
    'DevOps'
  ],
  'Finance': [
    'Financial Analysis', 
    'Risk Management', 
    'Investment Banking', 
    'Financial Reporting', 
    'Wealth Management',
    'Compliance',
    'Financial Modeling'
  ],
  'Education': [
    'Curriculum Development', 
    'Educational Technology', 
    'Student Assessment', 
    'Classroom Management', 
    'Special Education',
    'Teaching',
    'Educational Research'
  ],
  'Marketing': [
    'Digital Marketing', 
    'Brand Management', 
    'Market Research', 
    'Content Strategy', 
    'Social Media Marketing',
    'SEO/SEM',
    'Marketing Analytics'
  ],
  // More industries as needed
};

// Default skills for when the industry isn't in our list
const defaultSkills = [
  'Project Management',
  'Team Leadership',
  'Communication',
  'Problem Solving',
  'Research',
  'Analysis',
  'Strategy Development'
];

// Skill proficiency levels
const proficiencyLevels = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert'
];

// Skill categories
const skillCategories = [
  'Technical',
  'Soft',
  'Industry-Specific',
  'Domain Knowledge',
  'Tools & Software'
];

interface SkillQuestTrackerProps {
  profileQuest?: UserQuest;
  categoryQuest?: UserQuest;
  industryQuest?: UserQuest;
  onCompleteQuest?: (quest: UserQuest) => void;
}

export function SkillQuestTracker({ 
  profileQuest, 
  categoryQuest, 
  industryQuest,
  onCompleteQuest 
}: SkillQuestTrackerProps) {
  const { toast } = useToast();
  const { userData, userSkills, isLoading } = useUserProfile();
  const updateProgressMutation = useUpdateQuestProgress();
  
  const [activeTab, setActiveTab] = useState<string>('industry');
  
  // Get suggested skills based on the user's industry
  const getUserIndustry = () => {
    return userData?.industry || 'Technology';
  };
  
  const getSuggestedSkills = () => {
    const userIndustry = getUserIndustry();
    return industrySkills[userIndustry] || defaultSkills;
  };
  
  // Count how many skills the user has with categories
  const getCategorizedSkillsCount = () => {
    if (!userSkills) return 0;
    
    return userSkills.filter(skill => {
      if (typeof skill === 'string') return false;
      return !!skill.category;
    }).length;
  };
  
  // Count industry-specific skills
  const getIndustrySkillsCount = () => {
    if (!userSkills) return 0;
    
    const suggestedSkills = getSuggestedSkills().map(s => s.toLowerCase());
    
    return userSkills.filter(skill => {
      const skillName = typeof skill === 'string' ? skill.toLowerCase() : skill.name.toLowerCase();
      return suggestedSkills.some(s => skillName.includes(s));
    }).length;
  };
  
  // Calculate progress for different quests
  const getProfileQuestProgress = () => {
    if (!profileQuest) return 0;
    return Math.min(100, (profileQuest.progress / (profileQuest.definition?.targetCount || 1)) * 100);
  };
  
  const getCategoryQuestProgress = () => {
    if (!categoryQuest) return 0;
    const categorizedCount = getCategorizedSkillsCount();
    const targetCount = categoryQuest.definition?.targetCount || 1;
    return Math.min(100, (categorizedCount / targetCount) * 100);
  };
  
  const getIndustryQuestProgress = () => {
    if (!industryQuest) return 0;
    const industryCount = getIndustrySkillsCount();
    const targetCount = industryQuest.definition?.targetCount || 1;
    return Math.min(100, (industryCount / targetCount) * 100);
  };
  
  // Handle tracking progress
  const handleTrackIndustryProgress = () => {
    if (!industryQuest) return;
    
    const industryCount = getIndustrySkillsCount();
    
    updateProgressMutation.mutate({
      questId: industryQuest.id,
      progress: industryCount,
      userId: industryQuest.userId
    }, {
      onSuccess: () => {
        toast({
          title: 'Progress updated',
          description: `You've added ${industryCount} industry-specific skills.`,
        });
        
        if (industryCount >= (industryQuest.definition?.targetCount || 3) && onCompleteQuest) {
          onCompleteQuest(industryQuest);
        }
      }
    });
  };
  
  const handleTrackCategoryProgress = () => {
    if (!categoryQuest) return;
    
    const categorizedCount = getCategorizedSkillsCount();
    
    updateProgressMutation.mutate({
      questId: categoryQuest.id,
      progress: categorizedCount,
      userId: categoryQuest.userId
    }, {
      onSuccess: () => {
        toast({
          title: 'Progress updated',
          description: `You've categorized ${categorizedCount} skills.`,
        });
        
        if (categorizedCount >= (categoryQuest.definition?.targetCount || 5) && onCompleteQuest) {
          onCompleteQuest(categoryQuest);
        }
      }
    });
  };
  
  // Check skill status
  const renderSkillStatus = (skillName: string) => {
    const hasSkill = userSkills?.some(skill => {
      const name = typeof skill === 'string' ? skill : skill.name;
      return name.toLowerCase() === skillName.toLowerCase();
    });
    
    return hasSkill ? (
      <CheckCircle2 className="h-5 w-5 text-green-500" />
    ) : (
      <AlertCircle className="h-5 w-5 text-amber-500" />
    );
  };

  // Render category status
  const renderCategoryStatus = (category: string) => {
    const hasCategory = userSkills?.some(skill => {
      if (typeof skill === 'string') return false;
      return skill.category?.toLowerCase() === category.toLowerCase();
    });
    
    return hasCategory ? (
      <CheckCircle2 className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-gray-300" />
    );
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Skill Quest Tracker</CardTitle>
        <CardDescription>
          Track your progress on skill-related career quests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="industry">Industry Skills</TabsTrigger>
            <TabsTrigger value="categories">Skill Categories</TabsTrigger>
          </TabsList>
          
          <TabsContent value="industry" className="space-y-4">
            <div className="p-4 border rounded-md bg-muted/30 space-y-3">
              <h3 className="font-semibold">Industry: {userData?.industry || 'Not specified'}</h3>
              
              {industryQuest && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Quest Progress: {getIndustrySkillsCount()} / {industryQuest.definition?.targetCount || 3}</span>
                    <span>+{industryQuest.definition?.xpReward || 0} XP</span>
                  </div>
                  <Progress value={getIndustryQuestProgress()} className="h-2" />
                </div>
              )}
              
              <div className="text-sm text-muted-foreground mt-2">
                Add at least {industryQuest?.definition?.targetCount || 3} of these suggested industry-specific skills to your profile:
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
              {getSuggestedSkills().map((skill, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center gap-2">
                    {renderSkillStatus(skill)}
                    <span>{skill}</span>
                  </div>
                  <Badge variant="outline">{proficiencyLevels[Math.floor(Math.random() * proficiencyLevels.length)]}</Badge>
                </div>
              ))}
            </div>
            
            <div className="bg-muted/30 p-3 rounded-md border mt-4">
              <h4 className="text-sm font-medium mb-2">Musk's Tip:</h4>
              <p className="text-sm text-muted-foreground">
                {industryQuest?.definition?.muskTip || 
                  "Add skills that are specific to your industry and accurately rate your proficiency. Recruiters often search for these industry-specific keywords."}
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="categories" className="space-y-4">
            <div className="p-4 border rounded-md bg-muted/30 space-y-3">
              <h3 className="font-semibold">Skill Categories</h3>
              
              {categoryQuest && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Quest Progress: {getCategorizedSkillsCount()} / {categoryQuest.definition?.targetCount || 5}</span>
                    <span>+{categoryQuest.definition?.xpReward || 0} XP</span>
                  </div>
                  <Progress value={getCategoryQuestProgress()} className="h-2" />
                </div>
              )}
              
              <div className="text-sm text-muted-foreground mt-2">
                Organize your skills into these categories to make your profile more structured:
              </div>
            </div>
            
            <div className="space-y-2 mt-2">
              {skillCategories.map((category, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-2">
                    {renderCategoryStatus(category)}
                    <span>{category}</span>
                  </div>
                  <Badge variant="outline">
                    {userSkills?.filter(skill => {
                      if (typeof skill === 'string') return false;
                      return skill.category?.toLowerCase() === category.toLowerCase();
                    }).length || 0} skills
                  </Badge>
                </div>
              ))}
            </div>
            
            <div className="bg-muted/30 p-3 rounded-md border mt-4">
              <h4 className="text-sm font-medium mb-2">Musk's Tip:</h4>
              <p className="text-sm text-muted-foreground">
                {categoryQuest?.definition?.muskTip || 
                  "Balanced professionals showcase both technical and soft skills. Technical skills show what you can do, soft skills show how you work with others."}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <Button
          variant="outline"
          onClick={() => setActiveTab(activeTab === 'industry' ? 'categories' : 'industry')}
        >
          Switch View
        </Button>
        
        <Button
          onClick={activeTab === 'industry' ? handleTrackIndustryProgress : handleTrackCategoryProgress}
          disabled={updateProgressMutation.isPending || isLoading}
        >
          Track Progress
        </Button>
      </CardFooter>
    </Card>
  );
}