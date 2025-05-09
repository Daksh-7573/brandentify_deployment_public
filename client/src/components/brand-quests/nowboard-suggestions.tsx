import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Zap, MessageSquare, ThumbsUp, Bot, RefreshCw, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';

interface NowboardSuggestionsProps {
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

export function NowboardSuggestions({ userId, className, questType }: NowboardSuggestionsProps) {
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
        return <Zap className="h-5 w-5 text-blue-500" />;
      case 'comment':
        return <MessageSquare className="h-5 w-5 text-purple-500" />;
      case 'reaction':
        return <ThumbsUp className="h-5 w-5 text-green-500" />;
      default:
        return <Zap className="h-5 w-5 text-blue-500" />;
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
      <Card className={cn("glass-panel", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Avatar className="h-8 w-8 glass-icon">
              <AvatarFallback className="bg-transparent backdrop-blur-md">
                <Bot className="h-4 w-4 text-primary" />
              </AvatarFallback>
            </Avatar>
            <Skeleton className="h-7 w-48 bg-gray-800/50" />
          </CardTitle>
          <CardDescription><Skeleton className="h-4 w-full bg-gray-800/30" /></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 p-4 glass-card">
                <Skeleton className="h-8 w-8 rounded-full bg-gray-800/50" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-5 w-3/4 bg-gray-800/40" />
                  <Skeleton className="h-4 w-full bg-gray-800/30" />
                  <Skeleton className="h-2 w-full mt-2 bg-gray-800/20" />
                  <Skeleton className="h-5 w-16 mt-1 bg-gray-800/40" />
                </div>
                <Skeleton className="h-8 w-24 bg-gray-800/30" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (isError) {
    return (
      <Card className={cn("glass-panel", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Avatar className="h-8 w-8 glass-icon">
              <AvatarFallback className="bg-transparent backdrop-blur-md">
                <Bot className="h-4 w-4 text-primary" />
              </AvatarFallback>
            </Avatar>
            <span className="text-glow">Nowboard Opportunities</span>
          </CardTitle>
          <CardDescription>
            <div className="flex items-center justify-between">
              <span>Failed to load recommendations</span>
              <Button size="sm" className="glass-button" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" /> Retry
              </Button>
            </div>
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <Card className={cn("glass-panel", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Avatar className="h-8 w-8 glass-icon">
              <AvatarFallback className="bg-transparent backdrop-blur-md">
                <Bot className="h-4 w-4 text-primary" />
              </AvatarFallback>
            </Avatar>
            <span className="text-glow">Nowboard Opportunities</span>
          </CardTitle>
          <CardDescription className="flex justify-between">
            <span>Musk-recommended actions to complete your quests</span>
            <Button size="sm" variant="ghost" className="h-6 p-1 glass-button" onClick={() => refetch()}>
              <RefreshCw className="h-3 w-3" />
            </Button>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="glass-card p-6 text-center text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-3 text-primary/30" />
            <p className="text-text">No suggestions available right now.</p>
            <p className="text-xs mt-2 text-muted-foreground">Check back later for new activities!</p>
            <Button variant="ghost" size="sm" className="mt-4 glass-button" onClick={() => refetch()}>
              <RefreshCw className="h-3 w-3 mr-2" /> Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={cn("glass-panel", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Avatar className="h-8 w-8 glass-icon">
            <AvatarFallback className="bg-transparent backdrop-blur-md">
              <Bot className="h-4 w-4 text-primary" />
            </AvatarFallback>
          </Avatar>
          <span className="text-glow">Nowboard Opportunities</span>
        </CardTitle>
        <CardDescription className="flex justify-between">
          <span>Musk-recommended actions to complete your quests</span>
          <Button size="sm" variant="ghost" className="h-6 p-1 glass-button" onClick={() => refetch()}>
            <RefreshCw className="h-3 w-3" />
          </Button>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((suggestion: NowboardSuggestion) => (
            <div 
              key={suggestion.id} 
              className="flex items-start gap-3 p-4 glass-card hover:border-glow transition-all duration-300 group"
            >
              <div className="mt-1 h-8 w-8 glass-icon flex items-center justify-center flex-shrink-0">
                {getIconForType(suggestion.type)}
              </div>
              <div className="space-y-1 flex-1">
                <h4 className="font-medium text-sm">{suggestion.title}</h4>
                <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                {suggestion.progress !== undefined && suggestion.targetCount !== undefined && (
                  <div className="mt-2 mb-2">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{suggestion.progress}/{suggestion.targetCount}</span>
                    </div>
                    <div className="glass-progress-bg">
                      <div 
                        className="glass-progress-fill" 
                        style={{ width: `${(suggestion.progress / suggestion.targetCount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                <div className="text-xs glass-badge glass-badge-primary inline-flex">
                  +{suggestion.xpValue} XP potential
                </div>
              </div>
              {suggestion.progress === suggestion.targetCount ? (
                <div 
                  className="flex-shrink-0 text-xs glass-badge glass-badge-success flex items-center"
                >
                  Completed <Zap className="ml-1 h-3 w-3" />
                </div>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="flex-shrink-0 text-xs glass-button group-hover:border-primary/50 group-hover:text-primary transition-colors"
                  onClick={() => handleAction(suggestion)}
                >
                  {suggestion.actionText} <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}