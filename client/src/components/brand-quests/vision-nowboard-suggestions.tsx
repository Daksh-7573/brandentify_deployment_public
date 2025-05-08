import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  VisionCard, 
  VisionCardHeader, 
  VisionCardTitle, 
  VisionCardDescription, 
  VisionCardContent,
  VisionCardFooter
} from '@/components/ui/vision-card';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Zap, MessageSquare, ThumbsUp, Bot, RefreshCw, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';

interface VisionNowboardSuggestionsProps {
  userId: number;
  className?: string;
  questType?: string;
}

// Types of suggestions Musk can make
type SuggestionType = 'pulse' | 'comment' | 'reaction';

interface NowboardSuggestion {
  id: number;
  type: SuggestionType;
  title: string;
  description: string;
  actionText: string;
  relatedQuestId?: number;
  xpValue: number;
  targetId?: number; // ID of pulse or content to interact with
  progress?: number; // Current progress count
  targetCount?: number; // Target count to complete
}

export function VisionNowboardSuggestions({ userId, className, questType }: VisionNowboardSuggestionsProps) {
  const [loadingAction, setLoadingAction] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Fetch recommendations from API
  const { 
    data, 
    isLoading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ['nowboard-recommendations', userId, questType],
    queryFn: async () => {
      const endpoint = `/api/nowboard-recommendations?userId=${userId}${questType ? `&questType=${questType}` : ''}`;
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      const data = await response.json();
      return data.recommendations;
    },
    // Fallback to demo data if API fails in development
    placeholderData: () => {
      return [
        {
          id: 1,
          type: 'pulse',
          title: 'Create a Pulse about your recent project',
          description: 'Share your recent work to make progress on your "Content Creator" quest',
          actionText: 'Create Pulse',
          xpValue: 25,
          progress: 1,
          targetCount: 3,
          relatedQuestId: 101
        },
        {
          id: 2,
          type: 'comment',
          title: 'Comment on trending industry discussions',
          description: 'Professionals in Healthcare are discussing new research. Join the conversation!',
          actionText: 'View Conversations',
          xpValue: 15,
          progress: 2,
          targetCount: 5,
          relatedQuestId: 102
        },
        {
          id: 3,
          type: 'reaction',
          title: 'React to content from your industry',
          description: 'Show appreciation for quality content to progress on your quest',
          actionText: 'Find Content',
          xpValue: 10,
          progress: 0,
          targetCount: 3,
          relatedQuestId: 103
        }
      ] as NowboardSuggestion[];
    }
  });
  
  // Get icon based on suggestion type
  const getIconForType = (type: SuggestionType) => {
    switch (type) {
      case 'pulse':
        return <Zap className="h-5 w-5 text-[#4F8CFF]" />;
      case 'comment':
        return <MessageSquare className="h-5 w-5 text-[#3ED7C2]" />;
      case 'reaction':
        return <ThumbsUp className="h-5 w-5 text-[#4ADE80]" />;
      default:
        return <Zap className="h-5 w-5 text-[#4F8CFF]" />;
    }
  };
    
  // Track quest progress when taking an action
  const trackProgress = async (suggestion: NowboardSuggestion) => {
    if (!suggestion.relatedQuestId) return;
    
    try {
      // Calculate the new progress
      const currentProgress = suggestion.progress || 0;
      const targetCount = suggestion.targetCount || 1;
      const newProgress = Math.min(currentProgress + 1, targetCount);
      
      const response = await fetch('/api/nowboard-recommendations/track-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          questId: suggestion.relatedQuestId,
          actionType: suggestion.type,
          progress: newProgress,
          targetCount: targetCount,
          completed: newProgress >= targetCount
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to track progress');
      }
      
      // Show completion toast if quest is completed
      if (newProgress >= targetCount) {
        toast({
          title: 'Quest Completed!',
          description: `You've earned ${suggestion.xpValue} XP for completing this quest.`,
          variant: 'default',
        });
      }
      
      // Refetch suggestions to update progress
      refetch();
      
    } catch (error) {
      console.error('Error tracking progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to track quest progress',
        variant: 'destructive',
      });
    }
  };
  
  const handleAction = (suggestion: NowboardSuggestion) => {
    setLoadingAction(true);
    
    // Track progress for this action
    trackProgress(suggestion).finally(() => {
      setLoadingAction(false);
      
      // Navigate based on the suggestion type
      switch (suggestion.type) {
        case 'pulse':
          navigate('/create-pulse');
          break;
        case 'comment':
        case 'reaction':
          navigate('/industry-pulse');
          break;
        default:
          navigate('/industry-pulse');
      }
      
      // Show toast confirmation
      toast({
        title: 'Suggestion Applied',
        description: `You're on your way to earning ${suggestion.xpValue} XP!`,
        variant: 'default',
      });
    });
  };
  
  if (isLoading || loadingAction) {
    return (
      <VisionCard className={cn(className)} variant="dark" hover="subtle">
        <VisionCardHeader className="pb-2">
          <VisionCardTitle className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/20 border border-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </AvatarFallback>
            </Avatar>
            <Skeleton className="h-7 w-48 bg-white/10" />
          </VisionCardTitle>
          <VisionCardDescription><Skeleton className="h-4 w-full bg-white/10" /></VisionCardDescription>
        </VisionCardHeader>
        <VisionCardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/5">
                <Skeleton className="h-8 w-8 rounded-full bg-white/10" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-5 w-3/4 bg-white/10" />
                  <Skeleton className="h-4 w-full bg-white/10" />
                </div>
                <Skeleton className="h-8 w-24 bg-white/10" />
              </div>
            ))}
          </div>
        </VisionCardContent>
      </VisionCard>
    );
  }
  
  if (isError) {
    return (
      <VisionCard className={cn(className)} variant="dark" hover="subtle">
        <VisionCardHeader className="pb-2">
          <VisionCardTitle className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/20 border border-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </AvatarFallback>
            </Avatar>
            <span>Nowboard Opportunities</span>
          </VisionCardTitle>
          <VisionCardDescription>
            <div className="flex items-center justify-between">
              <span>Failed to load recommendations</span>
              <Button size="sm" variant="outline" onClick={() => refetch()} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <RefreshCw className="h-4 w-4 mr-2" /> Retry
              </Button>
            </div>
          </VisionCardDescription>
        </VisionCardHeader>
      </VisionCard>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <VisionCard className={cn(className)} variant="dark" hover="subtle">
        <VisionCardHeader className="pb-2">
          <VisionCardTitle className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/20 border border-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </AvatarFallback>
            </Avatar>
            <span>Nowboard Opportunities</span>
          </VisionCardTitle>
          <VisionCardDescription className="flex justify-between">
            <span>Musk-recommended actions to complete your quests</span>
            <Button size="sm" variant="ghost" className="h-6 p-1 text-white/70 hover:text-white" onClick={() => refetch()}>
              <RefreshCw className="h-3 w-3" />
            </Button>
          </VisionCardDescription>
        </VisionCardHeader>
        <VisionCardContent>
          <div className="text-center py-6 text-white/50">
            <Lightbulb className="h-10 w-10 mx-auto mb-2 opacity-20" />
            <p>No suggestions available right now.</p>
            <p className="text-xs mt-1">Check back later for new activities!</p>
          </div>
        </VisionCardContent>
      </VisionCard>
    );
  }
  
  return (
    <VisionCard className={cn(className)} variant="dark" hover="subtle">
      <VisionCardHeader className="pb-2">
        <VisionCardTitle className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/20 border border-primary/10">
              <Bot className="h-4 w-4 text-primary" />
            </AvatarFallback>
          </Avatar>
          <span>Nowboard Opportunities</span>
        </VisionCardTitle>
        <VisionCardDescription className="flex justify-between">
          <span>Musk-recommended actions to complete your quests</span>
          <Button size="sm" variant="ghost" className="h-6 p-1 text-white/70 hover:text-white" onClick={() => refetch()}>
            <RefreshCw className="h-3 w-3" />
          </Button>
        </VisionCardDescription>
      </VisionCardHeader>
      <VisionCardContent>
        <div className="space-y-3">
          {data.map((suggestion: NowboardSuggestion) => (
            <div 
              key={suggestion.id} 
              className="flex items-start gap-3 p-3 rounded-lg border border-white/10 bg-white/5 hover:border-primary/20 hover:bg-white/10 transition-colors group"
            >
              <div className="mt-1 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
                {getIconForType(suggestion.type)}
              </div>
              <div className="space-y-1 flex-1">
                <h4 className="font-medium text-sm text-white">{suggestion.title}</h4>
                <p className="text-xs text-white/70">{suggestion.description}</p>
                {suggestion.progress !== undefined && suggestion.targetCount !== undefined && (
                  <div className="mt-1 mb-1">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-white/50">Progress</span>
                      <span className="font-medium text-white/90">{suggestion.progress}/{suggestion.targetCount}</span>
                    </div>
                    <Progress 
                      value={(suggestion.progress / suggestion.targetCount) * 100}
                      className={cn(
                        "h-1.5", 
                        suggestion.progress === 0 
                          ? "bg-white/5 [&>div]:bg-white/20" 
                          : suggestion.progress < suggestion.targetCount 
                            ? "bg-amber-950/20 [&>div]:bg-amber-500/80" 
                            : "bg-green-950/20 [&>div]:bg-green-500/80"
                      )}
                    />
                  </div>
                )}
                <div className="text-xs text-amber-400/80 font-semibold">
                  +{suggestion.xpValue} XP potential
                </div>
              </div>
              {suggestion.progress === suggestion.targetCount ? (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="flex-shrink-0 text-xs text-green-400 cursor-default bg-green-950/20 border border-green-500/20"
                  disabled
                >
                  Completed <Zap className="ml-1 h-3 w-3" />
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-shrink-0 text-xs bg-white/5 border-white/20 text-white/90 group-hover:border-primary/50 group-hover:text-primary-foreground transition-colors hover:bg-primary/20"
                  onClick={() => handleAction(suggestion)}
                >
                  {suggestion.actionText} <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </VisionCardContent>
    </VisionCard>
  );
}