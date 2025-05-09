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
import { HashtagSuggestions } from '../career-quests/hashtag-suggestions'; // Update path when we move this component
import { StaticHashtagSuggestionsByQuestType } from '../career-quests/static-hashtag-suggestions'; // Update path when we move this component

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
    <Card className="w-full glass-card transition-all duration-300 hover:border-glow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="glass-icon w-8 h-8 flex items-center justify-center text-xl">
                {getQuestTypeIcon(questDefinition.type)}
              </div>
              <CardTitle className="text-lg text-glow">{questDefinition.title}</CardTitle>
            </div>
            {questDefinition.badgeReward && (
              <div className="glass-badge ml-10 mt-2 inline-block">
                Award: {getBadgeLabel(questDefinition.badgeReward)}
              </div>
            )}
          </div>
          <div className={`glass-badge ${
            isComplete ? "glass-badge-success" : 
            isExpired ? "glass-badge-error" : 
            "glass-badge-primary"
          }`}>
            {getQuestStatusLabel(quest.status)}
          </div>
        </div>
        <CardDescription className="ml-10 mt-1">
          {questDefinition.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Progress: {quest.progress} / {questDefinition.targetCount}</span>
            <span className="glass-badge glass-badge-primary">+{questDefinition.xpReward} XP</span>
          </div>
          <div className="glass-progress-bg">
            <div 
              className="glass-progress-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          {muskTipContent && (
            <div className="mt-4 glass-panel-dark p-4 rounded-md">
              <div className="flex items-center gap-2 text-sm font-medium mb-2">
                <div className="glass-icon w-6 h-6 flex items-center justify-center">⚡</div>
                <span className="text-primary text-glow">Musk's Tip</span>
              </div>
              <p className="text-sm text-muted-foreground ml-8">{muskTipContent}</p>
              
              {/* Display static hashtag suggestions for active quests related to content creation */}
              {isActive && ['pulse_creation', 'networking', 'visibility'].includes(questDefinition.type) && (
                <div className="mt-2 ml-8">
                  <StaticHashtagSuggestionsByQuestType questType={questDefinition.type as QuestType} />
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-1 flex justify-between">
        {isActive && (
          <>
            <div className="w-4"></div> {/* Spacer to maintain layout without dismiss button */}
            <Button 
              className="glass-button"
              size="sm"
              onClick={handleActionClick}
              disabled={updateProgressMutation.isPending}
            >
              {progressPercentage >= 100 ? 'Complete Quest' : 'Track Progress'}
            </Button>
          </>
        )}
        
        {(isComplete || isExpired) && (
          <div className="w-full flex justify-end">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    className={`glass-button w-full ${isExpired ? "bg-red-900/20" : "bg-green-900/20"}`}
                    size="sm"
                    disabled
                  >
                    {isComplete 
                      ? `Completed on ${new Date(quest.completedAt || '').toLocaleDateString()}`
                      : isExpired 
                        ? `Missed ${questDefinition.xpReward} XP`
                        : 'Quest status'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="glass-toast">
                  {isComplete && quest.xpEarned 
                    ? `You earned ${quest.xpEarned} XP and ${quest.badgeEarned ? `the ${getBadgeLabel(quest.badgeEarned)} badge` : 'no badge'}`
                    : isComplete 
                      ? 'Completed successfully'
                      : isExpired 
                        ? `This quest expired at the end of week ${quest.weekNumber}. You missed out on earning ${questDefinition.xpReward} XP.`
                        : 'Quest status'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </CardFooter>
      
      {/* Confirmation Dialog for Completion */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="glass-modal">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-glow">Complete Quest</AlertDialogTitle>
            <AlertDialogDescription className="text-text">
              Are you sure you want to mark this quest as complete? You will earn {questDefinition.xpReward} XP
              {questDefinition.badgeReward ? ` and the ${getBadgeLabel(questDefinition.badgeReward)} badge` : ''}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="glass-button">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleComplete}
              className="glass-button bg-primary/20 hover:bg-primary/30"
            >
              Complete Quest
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}