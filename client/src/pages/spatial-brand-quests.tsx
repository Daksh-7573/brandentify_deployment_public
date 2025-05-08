import React, { useState } from 'react';
import { SpatialPortalLayout, SpatialWindow } from '@/components/spatial/SpatialPortalLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Award, CheckCircle2, Star, Zap, Clock, Calendar, 
  XCircle, ChevronRight, TrendingUp, Medal, Flame
} from 'lucide-react';

// Mock quest data
const mockDailyQuests = [
  {
    id: 1,
    title: 'Create Your First Industry Pulse',
    description: 'Post your first pulse to share your industry insights with the community.',
    progress: 0,
    totalRequired: 1,
    xp: 25,
    status: 'active',
    deadline: 'Today',
    category: 'creation'
  },
  {
    id: 2,
    title: 'React to 3 Pulses',
    description: 'Show appreciation for content by reacting to 3 different pulses.',
    progress: 2,
    totalRequired: 3,
    xp: 15,
    status: 'active',
    deadline: 'Today',
    category: 'engagement'
  },
  {
    id: 3,
    title: 'Comment on a Pulse',
    description: 'Add value to the conversation by commenting on a pulse.',
    progress: 0,
    totalRequired: 1,
    xp: 20,
    status: 'active',
    deadline: 'Today',
    category: 'engagement'
  }
];

const mockWeeklyQuests = [
  {
    id: 4,
    title: 'Meaningful Commenter',
    description: 'Comment on 5 different pulses with thoughtful insights.',
    progress: 2,
    totalRequired: 5,
    xp: 75,
    status: 'active',
    deadline: 'This week',
    category: 'engagement'
  },
  {
    id: 5,
    title: 'Reaction Giver',
    description: 'React to 10 different pulses with meaningful reactions.',
    progress: 4,
    totalRequired: 10,
    xp: 50,
    status: 'active',
    deadline: 'This week',
    category: 'engagement'
  },
  {
    id: 6,
    title: 'Media Maven',
    description: 'Create 3 pulses with media (images or videos) to enhance engagement.',
    progress: 1,
    totalRequired: 3,
    xp: 100,
    status: 'active',
    deadline: 'This week',
    category: 'creation'
  }
];

const mockMonthlyQuests = [
  {
    id: 7,
    title: 'Content Creator',
    description: 'Create 10 high-quality pulses throughout the month.',
    progress: 3,
    totalRequired: 10,
    xp: 300,
    status: 'active',
    deadline: 'This month',
    category: 'creation'
  },
  {
    id: 8,
    title: 'Community Builder',
    description: 'Get 50 reactions on your content from at least 20 different users.',
    progress: 18,
    totalRequired: 50,
    xp: 250,
    status: 'active',
    deadline: 'This month',
    category: 'engagement'
  },
  {
    id: 9,
    title: 'Thought Leader',
    description: 'Have 5 of your pulses receive 10+ comments each.',
    progress: 1,
    totalRequired: 5,
    xp: 350,
    status: 'active',
    deadline: 'This month',
    category: 'leadership'
  }
];

// Completed quests
const mockCompletedQuests = [
  {
    id: 10,
    title: 'First Post',
    description: 'Create your first Industry Pulse post.',
    xp: 30,
    completedDate: '2 days ago',
    category: 'creation'
  },
  {
    id: 11,
    title: 'Conversation Starter',
    description: 'Receive 5 comments on a single pulse.',
    xp: 50,
    completedDate: '1 week ago',
    category: 'engagement'
  }
];

// XP rewards and levels
const userXP = {
  current: 420,
  level: 3,
  nextLevel: 500,
  prevLevel: 300
};

// Helper function for category-based colors
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'creation':
      return 'bg-blue-500/20 text-blue-300 border-blue-500/20';
    case 'engagement':
      return 'bg-purple-500/20 text-purple-300 border-purple-500/20';
    case 'leadership':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/20';
    default:
      return 'bg-gray-500/20 text-gray-300 border-gray-500/20';
  }
};

// Helper function for calculating progress percentage
const getProgressPercentage = (progress: number, total: number) => {
  return Math.round((progress / total) * 100);
};

// Quest Card Component
interface QuestCardProps {
  quest: {
    id: number;
    title: string;
    description: string;
    progress?: number;
    totalRequired?: number;
    xp: number;
    status?: string;
    deadline?: string;
    category: string;
    completedDate?: string;
  };
}

const QuestCard: React.FC<QuestCardProps> = ({ quest }) => {
  const isCompleted = quest.status === 'completed' || quest.completedDate;
  const isActive = quest.status === 'active';
  const progressPercentage = quest.progress && quest.totalRequired 
    ? getProgressPercentage(quest.progress, quest.totalRequired)
    : 0;
  
  return (
    <Card className="bg-white/5 border-white/10 overflow-hidden transition-all duration-300 hover:bg-white/10">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Star className="h-4 w-4 text-blue-400" />
              </div>
            )}
            <div>
              <CardTitle className="text-white text-lg">{quest.title}</CardTitle>
              <div className="flex gap-2 items-center mt-1">
                <Badge variant="outline" className={`${getCategoryColor(quest.category)}`}>
                  {quest.category}
                </Badge>
                {isCompleted ? (
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-400" />
                    {quest.completedDate}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {quest.deadline}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center bg-blue-500/10 text-blue-300 font-medium px-2 py-1 rounded text-sm">
            <Zap className="h-3 w-3 mr-1" />
            {quest.xp} XP
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-2">
        <p className="text-gray-300 text-sm">{quest.description}</p>
        
        {!isCompleted && quest.progress !== undefined && quest.totalRequired !== undefined && (
          <div className="mt-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-white text-xs">Progress</span>
              <span className="text-gray-400 text-xs">{quest.progress}/{quest.totalRequired}</span>
            </div>
            <Progress 
              value={progressPercentage} 
              className={`h-2 bg-white/10 ${progressPercentage === 100 ? "bg-green-500" : "bg-blue-500"}`}
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-1">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-white hover:bg-white/10 text-xs w-full"
        >
          {isCompleted ? "View Details" : "Start Quest"} 
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

const SpatialBrandQuestsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("daily");
  const [isStatsOpen, setStatsOpen] = useState(true);
  const [isRewardsOpen, setRewardsOpen] = useState(true);
  const [isCompletedOpen, setCompletedOpen] = useState(true);
  
  return (
    <SpatialPortalLayout title="Brand Quests">
      {/* Main quests panel */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Award className="h-6 w-6 text-purple-400" /> Brand Quests
            </h1>
            <p className="text-gray-300 text-sm">Complete quests to earn XP and improve your visibility</p>
          </div>
        </div>
        
        <Tabs
          defaultValue="daily"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="bg-white/5 border border-white/10 p-1">
            <TabsTrigger
              value="daily"
              className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400"
            >
              Daily Quests
            </TabsTrigger>
            <TabsTrigger
              value="weekly"
              className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400"
            >
              Weekly Quests
            </TabsTrigger>
            <TabsTrigger
              value="monthly"
              className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400"
            >
              Monthly Challenges
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockDailyQuests.map(quest => (
                <motion.div 
                  key={quest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: quest.id * 0.1 }}
                >
                  <QuestCard quest={quest} />
                </motion.div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="weekly" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockWeeklyQuests.map(quest => (
                <motion.div 
                  key={quest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (quest.id - 3) * 0.1 }}
                >
                  <QuestCard quest={quest} />
                </motion.div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="monthly" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockMonthlyQuests.map(quest => (
                <motion.div 
                  key={quest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (quest.id - 6) * 0.1 }}
                >
                  <QuestCard quest={quest} />
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Stats Panel */}
      <SpatialWindow
        title="Your XP Stats"
        isOpen={isStatsOpen}
        initialPosition={{ x: 450, y: -100, z: -10 }}
        width="300px"
        scale={0.9}
        onClose={() => setStatsOpen(false)}
      >
        <div className="space-y-4">
          <div className="relative bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-lg p-4 border border-blue-500/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Medal className="h-5 w-5 text-amber-400" />
                <h3 className="text-white font-medium">Level {userXP.level}</h3>
              </div>
              <span className="text-white text-sm">{userXP.current} XP</span>
            </div>
            
            <div className="mb-2">
              <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                <span>Level {userXP.level}</span>
                <span>Level {userXP.level + 1}</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                  style={{ 
                    width: `${((userXP.current - userXP.prevLevel) / (userXP.nextLevel - userXP.prevLevel)) * 100}%` 
                  }}
                />
              </div>
            </div>
            <div className="text-xs text-gray-400 text-center">
              {userXP.nextLevel - userXP.current} XP until Level {userXP.level + 1}
            </div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h3 className="text-white font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-400" />
              Weekly Progress
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="text-gray-300">Quests Completed</span>
                  <span className="text-white">3/12</span>
                </div>
                <Progress value={25} className="h-2 bg-white/10" />
              </div>
              <div>
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="text-gray-300">XP Earned</span>
                  <span className="text-white">120/450</span>
                </div>
                <Progress value={26.67} className="h-2 bg-white/10" />
              </div>
            </div>
          </div>
        </div>
      </SpatialWindow>
      
      {/* Rewards Panel */}
      <SpatialWindow
        title="Quest Rewards"
        isOpen={isRewardsOpen}
        initialPosition={{ x: -450, y: 50, z: -15 }}
        width="300px"
        scale={0.9}
        onClose={() => setRewardsOpen(false)}
      >
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-amber-500/20 to-yellow-600/20 rounded-lg p-4 border border-amber-500/20">
            <h3 className="text-white font-medium mb-2">Unlocked Benefits</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Enhanced Visibility</p>
                  <p className="text-gray-400 text-xs">Your content gets 2x the visibility in feeds</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Engagement Boost</p>
                  <p className="text-gray-400 text-xs">Your comments get highlighted in discussions</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-gray-700/30 to-gray-800/30 rounded-lg p-4 border border-gray-700/30">
            <h3 className="text-white font-medium mb-2">Next Reward Tier</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-gray-500/20 flex items-center justify-center flex-shrink-0">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Featured Content</p>
                  <p className="text-gray-400 text-xs">Chance to get featured on the landing page</p>
                  <p className="text-xs text-blue-400 mt-1">Unlocks at Level 5</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-gray-500/20 flex items-center justify-center flex-shrink-0">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Custom Badge</p>
                  <p className="text-gray-400 text-xs">Unique profile badge showing your dedication</p>
                  <p className="text-xs text-blue-400 mt-1">Unlocks at Level 5</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SpatialWindow>
      
      {/* Completed Quests Panel */}
      <SpatialWindow
        title="Completed Quests"
        isOpen={isCompletedOpen}
        initialPosition={{ x: 0, y: -300, z: -5 }}
        width="300px"
        scale={0.8}
        onClose={() => setCompletedOpen(false)}
      >
        <div className="space-y-3">
          {mockCompletedQuests.map(quest => (
            <div 
              key={quest.id}
              className="bg-white/5 rounded-lg p-3 border border-white/10 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{quest.title}</p>
                  <p className="text-gray-400 text-xs">{quest.completedDate}</p>
                </div>
              </div>
              <div className="flex items-center px-2 py-1 bg-blue-500/10 text-blue-300 rounded text-xs">
                <Zap className="h-3 w-3 mr-1" />
                {quest.xp} XP
              </div>
            </div>
          ))}
          
          <Button 
            variant="ghost" 
            size="sm"
            className="w-full text-white hover:bg-white/10 text-xs"
          >
            View All Completed Quests
          </Button>
        </div>
      </SpatialWindow>
    </SpatialPortalLayout>
  );
};

// Fix for Lucide icon not defined
const Lock = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export default SpatialBrandQuestsPage;