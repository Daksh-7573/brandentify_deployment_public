import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { UserQuest, QuestDefinition, getQuestTypeIcon, getQuestStatusLabel, getBadgeLabel } from '@/types/career-quest';
import { useCompleteQuest, useDismissQuest, useUpdateQuestProgress } from '@/hooks/use-career-quests';

interface QuestCardProps {
  quest: UserQuest & {
    questDefinition: QuestDefinition;
  };
  onActionClick?: (quest: UserQuest) => void;
}

export function QuestCard({ quest, onActionClick }: QuestCardProps) {
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [dismissOpen, setDismissOpen] = useState(false);
  
  const completeQuestMutation = useCompleteQuest();
  const dismissQuestMutation = useDismissQuest();
  const updateProgressMutation = useUpdateQuestProgress();
  
  const { questDefinition } = quest;
  const progressPercentage = Math.min(100, Math.floor((quest.progress / questDefinition.targetCount) * 100));
  const isComplete = quest.status === 'completed';
  const isDismissed = quest.status === 'dismissed';
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
          progress: quest.progress + 1
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
      questId: quest.id
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
  
  const handleDismiss = () => {
    dismissQuestMutation.mutate({
      questId: quest.id,
      reason: 'User dismissed'
    }, {
      onSuccess: () => {
        toast({
          title: 'Quest dismissed',
          description: `You've dismissed "${questDefinition.title}".`,
        });
        setDismissOpen(false);
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: `Failed to dismiss quest: ${error.message}`,
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
              isDismissed ? "destructive" : 
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
          <>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setDismissOpen(true)}
            >
              Dismiss
            </Button>
            <Button 
              variant="default" 
              size="sm"
              onClick={handleActionClick}
              disabled={updateProgressMutation.isPending}
            >
              {progressPercentage >= 100 ? 'Complete Quest' : 'Track Progress'}
            </Button>
          </>
        )}
        
        {(isComplete || isDismissed || isExpired) && (
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
                      : isExpired 
                        ? 'Quest expired'
                        : 'Quest dismissed'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isComplete && quest.xpEarned 
                    ? `You earned ${quest.xpEarned} XP and ${quest.badgeEarned ? `the ${getBadgeLabel(quest.badgeEarned)} badge` : 'no badge'}`
                    : isComplete 
                      ? 'Completed successfully'
                      : isExpired 
                        ? 'This quest has expired and is no longer available'
                        : 'You dismissed this quest'}
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
      
      {/* Confirmation Dialog for Dismissal */}
      <AlertDialog open={dismissOpen} onOpenChange={setDismissOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dismiss Quest</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to dismiss this quest? You won't earn any XP or badges for this quest.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDismiss} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Dismiss Quest
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}