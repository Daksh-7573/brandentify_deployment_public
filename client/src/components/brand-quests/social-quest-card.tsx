import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useCompleteSocialQuest, usePlatformGuidance } from '@/hooks/use-social-quests';
import { cn } from '@/lib/utils';

interface SocialQuestTask {
  id: number;
  title: string;
  description: string;
  platform: 'brandentifier' | 'linkedin' | 'twitter' | 'instagram' | 'youtube';
  priority: number;
  xpReward: number;
  status: 'active' | 'completed' | 'expired';
  progress: number;
  targetAction: string;
  muskTip: string;
  aiGeneratedContent: string;
  platformRecommendationReason: string;
  platformSpecificData: Record<string, any>;
  assignedAt: string;
  completedAt?: string;
  weekNumber: number;
  year: number;
}

interface SocialQuestCardProps {
  quest: SocialQuestTask;
  userId: number;
}

export function SocialQuestCard({ quest, userId }: SocialQuestCardProps) {
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const completeMutation = useCompleteSocialQuest();
  const platformGuidance = usePlatformGuidance();
  
  const isComplete = quest.status === 'completed';
  const isExpired = quest.status === 'expired';
  const isActive = quest.status === 'active';
  
  const platformInfo = platformGuidance[quest.platform];
  
  const handleComplete = () => {
    completeMutation.mutate({
      questId: quest.id,
      userId: userId
    }, {
      onSuccess: () => {
        toast({
          title: 'Social Quest completed!',
          description: `You've completed "${quest.title}" and earned ${quest.xpReward} XP!`,
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

  const getPlatformAction = () => {
    switch (quest.platform) {
      case 'brandentifier':
        return 'Go to Profile →';
      case 'linkedin':
        return 'Open LinkedIn →';
      case 'twitter':
        return 'Open Twitter/X →';
      case 'instagram':
        return 'Open Instagram →';
      case 'youtube':
        return 'Open YouTube →';
      default:
        return 'Take Action →';
    }
  };

  return (
    <div className="w-full bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-5 shadow-lg transition-all hover:shadow-xl hover:bg-black/30 hover:scale-[1.02] duration-300">
      {/* Platform Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold shadow-lg",
            `bg-gradient-to-br ${platformInfo.color}`
          )}>
            <span className="text-lg">{platformInfo.icon}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{quest.title}</h3>
            <p className="text-xs text-white/60 uppercase tracking-wide font-medium">
              {platformInfo.name} • Priority {quest.priority}
            </p>
          </div>
        </div>
        
        <Badge 
          className={
            isComplete ? "bg-green-500/20 text-green-300 border-green-500/30" : 
            isExpired ? "bg-red-500/20 text-red-300 border-red-500/30" : 
            "bg-blue-500/20 text-blue-300 border-blue-500/30"
          }
        >
          {isComplete ? '✓ Complete' : isExpired ? '⏰ Expired' : '🔥 Active'}
        </Badge>
      </div>

      {/* Quest Description */}
      <p className="text-white/80 text-sm mb-4 leading-relaxed">
        {quest.description}
      </p>

      {/* Platform Focus */}
      <div className="bg-white/5 p-3 rounded-lg border border-white/20 backdrop-blur-md mb-4">
        <div className="flex items-center gap-2 text-sm font-medium mb-1 text-white/90">
          <span className="text-yellow-400">🎯</span>
          <span>Platform Focus</span>
        </div>
        <p className="text-sm text-white/70">{platformInfo.focus}</p>
      </div>

      {/* AI-Generated Content */}
      {quest.aiGeneratedContent && (
        <div className="bg-white/5 p-3 rounded-lg border border-white/20 backdrop-blur-md mb-4">
          <div className="flex items-center gap-2 text-sm font-medium mb-2 text-white">
            <span className="text-purple-400">🤖</span>
            <span>AI Suggestion</span>
          </div>
          <p className="text-sm text-white/80 leading-relaxed">{quest.aiGeneratedContent}</p>
        </div>
      )}

      {/* Musk Tip */}
      {quest.muskTip && (
        <div className="bg-white/5 p-3 rounded-lg border border-white/20 backdrop-blur-md mb-4">
          <div className="flex items-center gap-2 text-sm font-medium mb-2 text-white">
            <span className="text-yellow-400">⚡</span>
            <span>Musk's Tip</span>
          </div>
          <p className="text-sm text-white/80 leading-relaxed">{quest.muskTip}</p>
        </div>
      )}

      {/* Platform Specific Data */}
      {Object.keys(quest.platformSpecificData).length > 0 && (
        <div className="bg-white/5 p-3 rounded-lg border border-white/20 backdrop-blur-md mb-4">
          <div className="flex items-center gap-2 text-sm font-medium mb-2 text-white">
            <span className="text-blue-400">📊</span>
            <span>Task Details</span>
          </div>
          <div className="text-sm text-white/70">
            {Object.entries(quest.platformSpecificData).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                <span>{Array.isArray(value) ? value.join(', ') : String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* XP Reward & Action */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-blue-300 font-medium text-sm">+{quest.xpReward} XP</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-xs text-white/60">
                  {quest.platformRecommendationReason}
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900/90 text-white border-white/10 max-w-xs">
                <p>{quest.platformRecommendationReason}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {isActive && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              onClick={() => setConfirmOpen(true)}
            >
              {getPlatformAction()}
            </Button>
          </div>
        )}
      </div>

      {/* Completion Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="bg-gray-900/90 border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Social Quest</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Are you sure you've completed "{quest.title}" on {platformInfo.name}? 
              You will earn {quest.xpReward} XP for this achievement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 text-white border-white/10 hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleComplete}
              className="bg-white/20 text-white hover:bg-white/30"
              disabled={completeMutation.isPending}
            >
              {completeMutation.isPending ? 'Completing...' : 'Mark Complete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}