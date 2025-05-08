import React, { useState } from 'react';
import { SpatialPortalLayout, SpatialWindow } from '@/components/spatial/SpatialPortalLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useCurrentUser } from '@/hooks/use-current-user';
import { 
  Plus, Target, CheckCircle2, CircleDashed, Trophy, 
  Award, BarChart, Calendar, ChevronRight, Sparkles
} from 'lucide-react';

// Mock data for goals
const mockGoals = [
  {
    id: 1,
    title: 'Software Engineering Lead',
    goalType: 'position_change',
    timeframe: 2,
    description: 'Move from senior developer to engineering lead role',
    progress: 65,
    isPrivate: false,
    milestones: [
      { id: 1, title: 'Complete leadership training', isCompleted: true },
      { id: 2, title: 'Lead a cross-functional project', isCompleted: true },
      { id: 3, title: 'Mentor two junior developers', isCompleted: true },
      { id: 4, title: 'Participate in architectural decisions', isCompleted: false },
      { id: 5, title: 'Demonstrate technical leadership in meetings', isCompleted: false }
    ],
    skills: [
      { id: 1, name: 'Leadership', level: 'Intermediate' },
      { id: 2, name: 'System Architecture', level: 'Advanced' },
      { id: 3, name: 'Team Management', level: 'Beginner' }
    ]
  },
  {
    id: 2,
    title: 'Data Science Certification',
    goalType: 'certification',
    timeframe: 1,
    description: 'Obtain professional data science certification',
    progress: 30,
    isPrivate: false,
    milestones: [
      { id: 6, title: 'Complete data science fundamentals course', isCompleted: true },
      { id: 7, title: 'Build portfolio of 3 data science projects', isCompleted: false },
      { id: 8, title: 'Study advanced statistical methods', isCompleted: false },
      { id: 9, title: 'Pass practice exams with 80%+ score', isCompleted: false }
    ],
    skills: [
      { id: 4, name: 'Machine Learning', level: 'Intermediate' },
      { id: 5, name: 'Python', level: 'Advanced' },
      { id: 6, name: 'Statistics', level: 'Intermediate' }
    ]
  }
];

// Mock data for insights
const mockInsights = [
  {
    id: 1,
    title: 'Leadership Skills on the Rise',
    description: 'Leadership skills are trending 34% higher in tech job postings compared to last year.',
    category: 'Skill Trend'
  },
  {
    id: 2,
    title: 'Certification Impact',
    description: 'Professionals with data science certifications see a 28% higher interview rate.',
    category: 'Career Insight'
  }
];

// Mock data for career suggestions
const mockSuggestions = [
  {
    id: 1,
    title: 'Engineering Manager',
    match: 85,
    company: 'Meta',
    skills: ['Leadership', 'System Architecture', 'Agile']
  },
  {
    id: 2,
    title: 'Senior Data Scientist',
    match: 78,
    company: 'Netflix',
    skills: ['Python', 'Machine Learning', 'Statistics']
  }
];

// Type for Goal
interface Goal {
  id: number;
  title: string;
  goalType: string;
  timeframe: number;
  description: string;
  progress: number;
  isPrivate: boolean;
  milestones: Array<{
    id: number;
    title: string;
    isCompleted: boolean;
  }>;
  skills: Array<{
    id: number;
    name: string;
    level: string;
  }>;
}

const GoalCard: React.FC<{ goal: Goal }> = ({ goal }) => {
  const completedMilestones = goal.milestones.filter(m => m.isCompleted).length;
  const totalMilestones = goal.milestones.length;
  
  // Map goal type to user-friendly text
  const goalTypeMap: Record<string, string> = {
    position_change: 'Position Change',
    certification: 'Certification',
    skill_acquisition: 'Skill Acquisition',
    promotion: 'Promotion',
    industry_switch: 'Industry Switch',
    custom: 'Custom Goal'
  };
  
  return (
    <Card className="bg-white/10 border-white/20 overflow-hidden">
      <CardHeader className="pb-2 relative">
        <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-blue-500 to-purple-600" />
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-400" />
              {goal.title}
            </CardTitle>
            <div className="flex gap-2 mt-1">
              <Badge variant="outline" className="border-white/20 text-gray-300">
                {goalTypeMap[goal.goalType] || goal.goalType}
              </Badge>
              <Badge variant="outline" className="border-white/20 text-gray-300">
                {goal.timeframe} {goal.timeframe === 1 ? 'year' : 'years'}
              </Badge>
            </div>
          </div>
          <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-300 text-sm mb-4">{goal.description}</p>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h4 className="text-white text-sm font-medium">Overall Progress</h4>
              <span className="text-gray-300 text-sm">{goal.progress}%</span>
            </div>
            <Progress value={goal.progress} className="h-2 bg-white/10" />
          </div>
          
          <div>
            <h4 className="text-white text-sm font-medium mb-2">Key Milestones</h4>
            <div className="space-y-2">
              {goal.milestones.slice(0, 3).map(milestone => (
                <div key={milestone.id} className="flex items-center gap-2">
                  {milestone.isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <CircleDashed className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${milestone.isCompleted ? 'text-gray-300 line-through' : 'text-white'}`}>
                    {milestone.title}
                  </span>
                </div>
              ))}
              {goal.milestones.length > 3 && (
                <div className="text-sm text-blue-400 pl-6 hover:underline cursor-pointer">
                  +{goal.milestones.length - 3} more milestones
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="text-white text-sm font-medium mb-2">Key Skills</h4>
            <div className="flex flex-wrap gap-2">
              {goal.skills.map(skill => (
                <Badge key={skill.id} className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border-none">
                  {skill.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const SpatialCareerCapsulePage: React.FC = () => {
  const { user } = useCurrentUser();
  const [activeGoals, setActiveGoals] = useState<Goal[]>(mockGoals);
  const [isInsightsOpen, setInsightsOpen] = useState(true);
  const [isSuggestionsOpen, setSuggestionsOpen] = useState(true);
  const [isAchievementsOpen, setAchievementsOpen] = useState(true);
  
  return (
    <SpatialPortalLayout title="Career Capsule">
      {/* Main content panel - Career Goals */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Career Capsule</h1>
            <p className="text-gray-300 text-sm">Your digital career roadmap powered by Musk AI</p>
          </div>
          <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
            <Plus className="h-4 w-4 mr-2" /> Create Goal
          </Button>
        </div>
        
        <Separator className="bg-white/10" />
        
        <div className="space-y-6">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-400" /> Active Goals
          </h2>
          
          <div className="grid grid-cols-1 gap-6">
            {activeGoals.map(goal => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>
      </div>
      
      {/* Career Insights Panel */}
      <SpatialWindow
        title="Career Insights"
        isOpen={isInsightsOpen}
        initialPosition={{ x: 450, y: -100, z: -10 }}
        width="300px"
        scale={0.9}
        onClose={() => setInsightsOpen(false)}
      >
        <div className="space-y-4">
          {mockInsights.map(insight => (
            <Card key={insight.id} className="bg-white/5 border-white/10">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <BarChart className="h-4 w-4 text-blue-400" />
                  <Badge variant="outline" className="border-white/20 text-gray-300 text-xs">
                    {insight.category}
                  </Badge>
                </div>
                <CardTitle className="text-white text-base">{insight.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm">{insight.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </SpatialWindow>
      
      {/* Job Suggestions Panel */}
      <SpatialWindow
        title="Career Matches"
        isOpen={isSuggestionsOpen}
        initialPosition={{ x: -450, y: 50, z: -15 }}
        width="300px"
        scale={0.9}
        onClose={() => setSuggestionsOpen(false)}
      >
        <div className="space-y-4">
          {mockSuggestions.map(suggestion => (
            <div key={suggestion.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="flex justify-between items-start">
                <h3 className="text-white font-medium">{suggestion.title}</h3>
                <Badge className="bg-green-500/20 hover:bg-green-500/30 text-green-300 border-none">
                  {suggestion.match}% Match
                </Badge>
              </div>
              <p className="text-gray-400 text-sm">{suggestion.company}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {suggestion.skills.map((skill, idx) => (
                  <Badge key={idx} variant="outline" className="border-white/20 text-gray-300 text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-2 text-blue-400 hover:bg-white/10 hover:text-blue-300">
                View Details
              </Button>
            </div>
          ))}
        </div>
      </SpatialWindow>
      
      {/* Achievements Panel */}
      <SpatialWindow
        title="Recent Achievements"
        isOpen={isAchievementsOpen}
        initialPosition={{ x: 0, y: -300, z: -5 }}
        width="300px"
        scale={0.8}
        onClose={() => setAchievementsOpen(false)}
      >
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-amber-500/20 to-yellow-600/20 p-3 rounded-lg border border-amber-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium">Leadership Milestone</h3>
                <p className="text-gray-300 text-xs">Completed 3/5 leadership milestones</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 p-3 rounded-lg border border-blue-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium">Skill Mastery</h3>
                <p className="text-gray-300 text-xs">Python skill reached Advanced level</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-500/20 to-green-600/20 p-3 rounded-lg border border-emerald-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium">Goal Progress</h3>
                <p className="text-gray-300 text-xs">Career Capsule updated with 2 goals</p>
              </div>
            </div>
          </div>
        </div>
      </SpatialWindow>
    </SpatialPortalLayout>
  );
};

export default SpatialCareerCapsulePage;