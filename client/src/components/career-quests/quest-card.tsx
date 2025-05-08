import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { UserQuest, QuestDefinition, QuestType, getQuestTypeIcon, getQuestStatusLabel, getBadgeLabel } from '@/types/career-quest';
import { useCompleteQuest, useUpdateQuestProgress } from '@/hooks/use-career-quests';

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
    type: (quest.questType as QuestType) || 'profile_update',
    targetCount: 1, // Default if not provided
    targetAction: '',
    xpReward: 0,
    badgeReward: undefined,
    muskTip: quest.muskResponse || '',  // Custom tip or response from Musk
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
      } else if (progressPercentage >= 100) {
        // If progress is at 100%, show completion dialog
        setConfirmOpen(true);
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
      onError: (error: Error) => {
        toast({
          title: 'Error',
          description: `Failed to complete quest: ${error.message}`,
          variant: 'destructive',
        });
      }
    });
  };
  
  return (
    <Card className="w-full shadow-md transition-all hover:shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">{getQuestTypeIcon(questDefinition.type)}</span>
              <CardTitle className="text-lg">{questDefinition.title}</CardTitle>
            </div>
            {questDefinition.badgeReward && (
              <Badge variant="outline" className="ml-7 mt-1">
                Award: {getBadgeLabel(questDefinition.badgeReward)}
              </Badge>
            )}
          </div>
          <Badge 
            variant={
              isComplete ? "default" : 
              isExpired ? "outline" : 
              "secondary"
            }
          >
            {getQuestStatusLabel(quest.status)}
          </Badge>
        </div>
        <CardDescription className="ml-7 mt-1">
          {questDefinition.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground mb-1">
            <span>Progress: {quest.progress} / {questDefinition.targetCount}</span>
            <span>+{questDefinition.xpReward} XP</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          
          {questDefinition.muskTip && (
            <div className="mt-3 bg-muted/50 p-3 rounded-md border border-muted">
              <div className="flex items-center gap-2 text-sm font-medium mb-1">
                <span>⚡</span>
                <span>Musk's Tip</span>
              </div>
              <p className="text-sm text-muted-foreground">{questDefinition.muskTip}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-1 flex justify-between">
        {isActive && (
          <div className="w-full flex justify-end">
            <Button 
              variant="default" 
              size="sm"
              onClick={handleActionClick}
              disabled={updateProgressMutation.isPending || completeQuestMutation.isPending}
            >
              {progressPercentage >= 100 ? 'Complete Quest' : 'Track Progress'}
            </Button>
          </div>
        )}
        
        {(isComplete || isExpired) && (
          <div className="w-full flex justify-end">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="w-full"
                    disabled
                  >
                    {isComplete 
                      ? `Completed on ${new Date(quest.completedAt || '').toLocaleDateString()}`
                      : 'Quest expired'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isComplete && quest.xpEarned 
                    ? `You earned ${quest.xpEarned} XP and ${quest.badgeEarned ? `the ${getBadgeLabel(quest.badgeEarned)} badge` : 'no badge'}`
                    : isComplete 
                      ? 'Completed successfully'
                      : 'This quest has expired and is no longer available'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </CardFooter>
      
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