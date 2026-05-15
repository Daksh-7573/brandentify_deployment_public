import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Target, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  TrendingUp,
  Award,
  Zap,
  Lightbulb,
  ListTodo,
  BarChart3,
  Lock,
  RotateCcw
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { QuestStatus } from '@/types/career-quest';

// Enhanced quest definition with all new fields
interface EnhancedQuestDefinition {
  id: number;
  title: string;
  description: string;
  type: string;
  category: string;
  xpReward: number;
  targetCount: number;
  targetAction: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  estimatedTimeMinutes: number;
  deliverableFormat?: string;
  quantityValue?: number;
  quantityType?: string;
  platformConstraints?: string;
  guidanceSnippet?: string;
  muskTip?: string;
  // New enhanced fields
  objective?: string;
  whyThisMatters?: string;
  stepByStepInstructions?: string[];
  expectedOutcome?: string;
  successCriteria?: string[];
  autoTrackingConditions?: string[];
  estimatedImpact?: string;
  skillArea?: string;
}

interface EnhancedUserQuest {
  id: number;
  userId: number;
  questDefinitionId: number;
  status: QuestStatus;
  progress: number;
  isCompleted: boolean;
  xpEarned?: number;
  assignedAt: Date;
  completedAt?: Date;
  completionPercentage: number;
  lastTrackedAt?: Date;
  autoCompleted?: boolean;
  trackedActivities?: any[];
  // Joined definition
  questDefinition?: EnhancedQuestDefinition;
  definition?: EnhancedQuestDefinition;
}

interface EnhancedQuestCardProps {
  quest: EnhancedUserQuest;
  onViewDetails?: (quest: EnhancedUserQuest) => void;
}

export function EnhancedQuestCard({ quest, onViewDetails }: EnhancedQuestCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showProgressAnimation, setShowProgressAnimation] = useState(false);
  
  // Get definition from either source
  const definition = quest.questDefinition || quest.definition;
  
  if (!definition) {
    return <div className="p-4 text-gray-400">Loading quest details...</div>;
  }
  
  const progressPercentage = quest.completionPercentage || 
    Math.min(100, Math.floor((quest.progress / definition.targetCount) * 100));
  
  const isComplete = quest.isCompleted || quest.status === 'completed';
  const isActive = quest.status === 'active' && !isComplete;
  const isLocked = quest.status === 'locked';
  
  // Difficulty badge color
  const difficultyColors = {
    beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
    intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    advanced: 'bg-red-500/20 text-red-400 border-red-500/30'
  };
  
  // Category icon mapping
  const categoryIcons: Record<string, React.ReactNode> = {
    networking: <Zap className="w-4 h-4" />,
    profile: <Award className="w-4 h-4" />,
    career: <TrendingUp className="w-4 h-4" />,
    portfolio: <Sparkles className="w-4 h-4" />,
    social: <BarChart3 className="w-4 h-4" />
  };
  
  // Format tracking conditions for display
  const formatTrackingCondition = (condition: string): string => {
    const formatMap: Record<string, string> = {
      'pulse_created': 'Create a pulse',
      'post_liked': 'Like a post',
      'post_commented': 'Comment on a post',
      'connection_request_sent': 'Send connection request',
      'connection_accepted': 'Connection accepted',
      'profile_field_updated': 'Update profile field',
      'work_experience_added': 'Add work experience',
      'skill_added': 'Add skill',
      'career_goal_created': 'Create career goal',
      'milestone_completed': 'Complete milestone',
      'smart_connect_used': 'Use Smart Connect',
      'search_performed': 'Perform search',
      'resume_updated': 'Update resume'
    };
    return formatMap[condition] || condition.replace(/_/g, ' ');
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-xl border backdrop-blur-xl transition-all duration-300 ${
        isComplete 
          ? 'bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border-green-500/30' 
          : isActive
          ? 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/8'
          : 'bg-white/5 border-white/10 opacity-75'
      }`}
    >
      {/* Progress animation overlay */}
      <AnimatePresence>
        {showProgressAnimation && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-20 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Zap className="w-12 h-12 text-yellow-400" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Completion badge */}
      {isComplete && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-green-500/30 text-green-300 border-green-500/40">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        </div>
      )}
      
      {/* Locked overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="text-center">
            <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <span className="text-gray-400 text-sm">Complete previous quests to unlock</span>
          </div>
        </div>
      )}
      
      {/* Main card content */}
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg bg-white/5 ${isComplete ? 'text-green-400' : 'text-blue-400'}`}>
              {categoryIcons[definition.category] || <Target className="w-4 h-4" />}
            </div>
            <div>
              <h3 className={`font-semibold text-sm ${isComplete ? 'text-green-300 line-through' : 'text-white'}`}>
                {definition.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={`text-xs ${difficultyColors[definition.difficultyLevel]}`}>
                  {definition.difficultyLevel}
                </Badge>
                <Badge variant="outline" className="text-xs bg-white/5 text-gray-300 border-white/10">
                  {definition.xpReward} XP
                </Badge>
              </div>
            </div>
          </div>
        </div>
        
        {/* Short description */}
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {definition.description}
        </p>
        
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-400">Progress</span>
            <span className="text-xs font-medium text-white">{progressPercentage}%</span>
          </div>
          <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={`absolute h-full rounded-full ${
                isComplete 
                  ? 'bg-gradient-to-r from-green-500 to-green-400' 
                  : 'bg-gradient-to-r from-blue-500 to-blue-400'
              }`}
            />
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">
              {quest.progress} / {definition.targetCount} {definition.quantityType || 'actions'}
            </span>
            {quest.autoCompleted && (
              <span className="text-xs text-green-400 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Auto-completed
              </span>
            )}
          </div>
        </div>
        
        {/* Auto-tracking indicator */}
        {isActive && definition.autoTrackingConditions && (
          <div className="flex items-center gap-2 mb-3 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Auto-tracking active</span>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <AlertCircle className="w-3 h-3 text-gray-500" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-xs">
                    Progress updates automatically when you perform tracked actions:
                    {definition.autoTrackingConditions.slice(0, 3).map(c => 
                      ` ${formatTrackingCondition(c)}`
                    ).join(',')}
                    {definition.autoTrackingConditions.length > 3 && '...'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
        
        {/* Expand button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-white hover:bg-white/5"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              View Details & Instructions
            </>
          )}
        </Button>
        
        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-white/10 space-y-4">
                
                {/* Objective */}
                {definition.objective && (
                  <div>
                    <h4 className="text-xs font-semibold text-white mb-2 flex items-center gap-2">
                      <Target className="w-3 h-3 text-blue-400" />
                      Objective
                    </h4>
                    <p className="text-sm text-gray-300">{definition.objective}</p>
                  </div>
                )}
                
                {/* Why This Matters */}
                {definition.whyThisMatters && (
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
                    <h4 className="text-xs font-semibold text-blue-300 mb-2 flex items-center gap-2">
                      <Lightbulb className="w-3 h-3" />
                      Why This Matters
                    </h4>
                    <p className="text-sm text-gray-300">{definition.whyThisMatters}</p>
                  </div>
                )}
                
                {/* Step-by-Step Instructions */}
                {definition.stepByStepInstructions && definition.stepByStepInstructions.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-white mb-2 flex items-center gap-2">
                      <ListTodo className="w-3 h-3 text-yellow-400" />
                      Step-by-Step Instructions
                    </h4>
                    <ol className="space-y-2">
                      {definition.stepByStepInstructions.map((step, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium text-white">
                            {index + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                
                {/* Success Criteria */}
                {definition.successCriteria && definition.successCriteria.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-white mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-green-400" />
                      Success Criteria
                    </h4>
                    <ul className="space-y-1">
                      {definition.successCriteria.map((criterion, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5" />
                          <span>{criterion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Expected Outcome */}
                {definition.expectedOutcome && (
                  <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3">
                    <h4 className="text-xs font-semibold text-green-300 mb-2">
                      Expected Outcome
                    </h4>
                    <p className="text-sm text-gray-300">{definition.expectedOutcome}</p>
                  </div>
                )}
                
                {/* Skill Area */}
                {definition.skillArea && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-300 border-purple-500/30">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {definition.skillArea}
                    </Badge>
                  </div>
                )}
                
                {/* Metadata */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {definition.estimatedTimeMinutes} min
                  </div>
                  {definition.deliverableFormat && (
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <BarChart3 className="w-3 h-3" />
                      {definition.deliverableFormat}
                    </div>
                  )}
                  {quest.lastTrackedAt && (
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <RotateCcw className="w-3 h-3" />
                      Last updated: {new Date(quest.lastTrackedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
                
                {/* Musk Tip */}
                {definition.muskTip && (
                  <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg p-3">
                    <h4 className="text-xs font-semibold text-orange-300 mb-2 flex items-center gap-2">
                      <Sparkles className="w-3 h-3" />
                      Musk Tip
                    </h4>
                    <p className="text-sm text-gray-300 italic">"{definition.muskTip}"</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default EnhancedQuestCard;
