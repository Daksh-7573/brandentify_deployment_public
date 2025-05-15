import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { UserQuest, QuestDefinition, QuestType, QuestStatus, getQuestTypeIcon, getQuestStatusLabel, getBadgeLabel } from '@/types/career-quest';
import { useCompleteQuest, useUpdateQuestProgress } from '@/hooks/use-career-quests';
import { StaticHashtagSuggestions } from '@/components/brand-quests/static-hashtag-suggestions';

interface QuestCardProps {
  quest: UserQuest;
  onActionClick?: (quest: UserQuest) => void;
}

export function QuestCard({ quest, onActionClick }: QuestCardProps) {
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  
  const completeQuestMutation = useCompleteQuest();
  const updateProgressMutation = useUpdateQuestProgress();
  
  // Handle all possible API data structures:
  // 1. quest.questDefinition (original format)
  // 2. quest.definition (direct DB query format)
  // 3. Flattened properties (direct from new API)
  const questDefinition = quest.questDefinition || quest.definition || {
    id: quest.questDefinitionId,
    title: quest.questTitle || '',
    description: quest.questDescription || '',
    type: (quest.questType as QuestType) || 'pulse_creation',
    targetCount: 1, // Default if not provided
    targetAction: '',
    xpReward: 0,
    badgeReward: undefined,
    // For Musk tips, use any available field that might have it
    muskTip: quest.questMuskTip || quest.muskResponse || '',
    isActive: true,
    createdAt: '',
    updatedAt: ''
  };
  
  // Ensure targetCount has a minimum value of 1 to prevent division by zero
  const targetCount = questDefinition.targetCount || 1;
  const progressPercentage = Math.min(100, Math.floor((quest.progress / targetCount) * 100));
  const isComplete = quest.status === 'completed';
  const isExpired = quest.status === 'expired';
  const isActive = quest.status === 'active';
  
  const handleActionClick = () => {
    if (onActionClick) {
      onActionClick(quest);
    } else {
      // Default action to increment progress by 1
      if (isActive && quest.progress < questDefinition.targetCount) {
        updateProgressMutation.mutate({
          questId: quest.id,
          progress: quest.progress + 1,
          userId: quest.userId
        }, {
          onSuccess: () => {
            toast({
              title: 'Progress updated',
              description: `Progress on "${questDefinition.title}" has been updated.`,
            });
          },
          onError: (error) => {
            toast({
              title: 'Error',
              description: `Failed to update progress: ${error.message}`,
              variant: 'destructive',
            });
          }
        });
      }
    }
  };
  
  const handleComplete = () => {
    completeQuestMutation.mutate({
      questId: quest.id,
      userId: quest.userId
    }, {
      onSuccess: () => {
        toast({
          title: 'Quest completed!',
          description: `You've completed "${questDefinition.title}" and earned ${questDefinition.xpReward} XP!`,
        });
        setConfirmOpen(false);
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: `Failed to complete quest: ${error.message}`,
          variant: 'destructive',
        });
      }
    });
  };
  
  // Get the Musk tip content from any available source in priority order
  const muskTipContent = 
    // First check definition properties
    (typeof quest.definition === 'object' && quest.definition?.muskTip) ||
    // Then check questDefinition
    (typeof quest.questDefinition === 'object' && quest.questDefinition?.muskTip) ||
    // Then check direct properties
    quest.muskTip || 
    questDefinition.muskTip || 
    quest.muskResponse;
  
  return (
    <div className="w-full bg-gray-900/60 backdrop-blur-md border border-white/5 rounded-xl p-5 shadow-md transition-all hover:shadow-lg hover:bg-gray-900/70">
      <div className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xl text-white">{getQuestTypeIcon(questDefinition.type)}</span>
              <h3 className="text-lg font-semibold text-white">{questDefinition.title}</h3>
            </div>
            {questDefinition.badgeReward && (
              <Badge variant="outline" className="ml-7 mt-1 bg-gray-800/80 text-white border-white/10">
                Award: {getBadgeLabel(questDefinition.badgeReward)}
              </Badge>
            )}
          </div>
          <Badge 
            className={
              isComplete ? "bg-white/20 text-white hover:bg-white/30" : 
              isExpired ? "bg-red-500/20 text-white border-red-500/20 hover:bg-red-500/30" : 
              "bg-blue-500/20 text-white border-blue-500/20 hover:bg-blue-500/30"
            }
          >
            {getQuestStatusLabel(quest.status)}
          </Badge>
        </div>
        <p className="ml-7 mt-1 text-white/70 text-sm">
          {questDefinition.description}
        </p>
      </div>
      <div className="py-3">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-white/60 mb-1">
            <span>Progress: {quest.progress} / {questDefinition.targetCount}</span>
            <span>+{questDefinition.xpReward} XP</span>
          </div>
          <Progress value={progressPercentage} className="h-2 bg-gray-800/60" />
          
          {muskTipContent && (
            <div className="mt-3 bg-gray-800/40 p-3 rounded-md border border-white/5">
              <div className="flex items-center gap-2 text-sm font-medium mb-1 text-white">
                <span>⚡</span>
                <span>Musk's Tip</span>
              </div>
              <p className="text-sm text-white/70">{muskTipContent}</p>
              
              {/* Add StaticHashtagSuggestions component for pulse creation quests */}
              {(questDefinition.type === 'pulse_creation' || 
                questDefinition.targetAction === 'create_pulse' || 
                (questDefinition.description && questDefinition.description.toLowerCase().includes('pulse'))) && (
                <div className="mt-3">
                  <div className="text-sm font-medium text-white/70 mb-2">
                    <span className="mr-1">💡</span> Musk's hashtag suggestions:
                  </div>
                  <StaticHashtagSuggestions 
                    questType="pulse_creation"
                    count={7}
                    onHashtagClick={(hashtag) => {
                      navigator.clipboard.writeText(hashtag);
                      toast({
                        title: "Hashtag copied",
                        description: `#${hashtag} copied to clipboard`
                      });
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="pt-3 flex flex-col border-t border-white/5">
        {/* Quest progress info badge */}
        <div className="w-full flex justify-between items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`text-xs rounded px-2 py-1 ${
                  isComplete ? "bg-white/10 text-white" : 
                  isExpired ? "bg-red-500/10 text-white" : 
                  "bg-blue-500/10 text-white"
                }`}>
                  {isComplete 
                    ? `Completed on ${new Date(quest.completedAt || '').toLocaleDateString()}`
                    : isExpired 
                      ? `Missed ${questDefinition.xpReward} XP`
                      : `Auto-tracking: ${quest.progress}/${questDefinition.targetCount} completed`}
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900/90 text-white border-white/10">
                {isComplete && quest.xpEarned 
                  ? `You earned ${quest.xpEarned} XP and ${quest.badgeEarned ? `the ${getBadgeLabel(quest.badgeEarned)} badge` : 'no badge'}`
                  : isComplete 
                    ? 'Completed successfully'
                    : isExpired 
                      ? `This quest expired at the end of week ${quest.weekNumber}. You missed out on earning ${questDefinition.xpReward} XP.`
                      : 'Progress is tracked automatically as you engage with the platform'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Show XP reward for active or expired quests */}
          {!isComplete && (
            <span className="text-xs font-semibold text-white/80">
              {isExpired ? 'Missed ' : 'Reward: '}{questDefinition.xpReward} XP
            </span>
          )}
        </div>
      </div>
      
      {/* Confirmation Dialog for Completion */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Quest</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this quest as complete? You will earn {questDefinition.xpReward} XP
              {questDefinition.badgeReward ? ` and the ${getBadgeLabel(questDefinition.badgeReward)} badge` : ''}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleComplete}>
              Complete Quest
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}