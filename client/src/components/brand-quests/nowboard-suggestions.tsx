import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Zap, MessageSquare, ThumbsUp, Bot, RefreshCw } from 'lucide-react';
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
          xpValue: 25
        },
        {
          id: 2,
          type: 'comment',
          title: 'Comment on trending industry discussions',
          description: 'Professionals in Healthcare are discussing new research. Join the conversation!',
          actionText: 'View Conversations',
          xpValue: 15
        },
        {
          id: 3,
          type: 'reaction',
          title: 'React to content from your industry',
          description: 'Show appreciation for quality content to progress on your quest',
          actionText: 'Find Content',
          xpValue: 10
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
      const response = await fetch('/api/nowboard-recommendations/track-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          questId: suggestion.relatedQuestId,
          actionType: suggestion.type
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to track progress');
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
      <Card className={cn(className)}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </AvatarFallback>
            </Avatar>
            <Skeleton className="h-7 w-48" />
          </CardTitle>
          <CardDescription><Skeleton className="h-4 w-full" /></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (isError) {
    return (
      <Card className={cn(className)}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </AvatarFallback>
            </Avatar>
            <span>Nowboard Opportunities</span>
          </CardTitle>
          <CardDescription>
            <div className="flex items-center justify-between">
              <span>Failed to load recommendations</span>
              <Button size="sm" variant="ghost" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" /> Retry
              </Button>
            </div>
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  if (!data || data.length === 0) {
    return null;
  }
  
  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10">
              <Bot className="h-4 w-4 text-primary" />
            </AvatarFallback>
          </Avatar>
          <span>Nowboard Opportunities</span>
        </CardTitle>
        <CardDescription className="flex justify-between">
          <span>Musk-recommended actions to complete your quests</span>
          <Button size="sm" variant="ghost" className="h-6 p-1" onClick={() => refetch()}>
            <RefreshCw className="h-3 w-3" />
          </Button>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map(suggestion => (
            <div 
              key={suggestion.id} 
              className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-primary/20 hover:bg-accent/20 transition-colors group"
            >
              <div className="mt-1 h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center flex-shrink-0">
                {getIconForType(suggestion.type)}
              </div>
              <div className="space-y-1 flex-1">
                <h4 className="font-medium text-sm">{suggestion.title}</h4>
                <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                <div className="text-xs text-amber-600 font-semibold">
                  +{suggestion.xpValue} XP potential
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="flex-shrink-0 text-xs group-hover:border-primary/50 group-hover:text-primary transition-colors"
                onClick={() => handleAction(suggestion)}
              >
                {suggestion.actionText} <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}