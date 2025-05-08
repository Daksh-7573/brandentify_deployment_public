import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Zap, MessageSquare, ThumbsUp, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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
  icon: React.ReactNode;
}

export function NowboardSuggestions({ userId, className, questType }: NowboardSuggestionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // In a real implementation, these would come from an API based on user context and active quests
  // For now we'll use static suggestions that could help with quest completion
  const suggestions: NowboardSuggestion[] = [
    {
      id: 1,
      type: 'pulse',
      title: 'Create a Pulse about your recent project',
      description: 'Share your recent work to make progress on your "Content Creator" quest',
      actionText: 'Create Pulse',
      xpValue: 25,
      icon: <Zap className="h-5 w-5 text-blue-500" />
    },
    {
      id: 2,
      type: 'comment',
      title: 'Comment on trending industry discussions',
      description: 'Professionals in Healthcare are discussing new research. Join the conversation to complete your "Meaningful Commenter" quest',
      actionText: 'View Conversations',
      xpValue: 15,
      icon: <MessageSquare className="h-5 w-5 text-purple-500" />
    },
    {
      id: 3,
      type: 'reaction',
      title: 'React to content from your industry',
      description: 'Show appreciation for quality content to progress on your "Engagement" quest',
      actionText: 'Find Content',
      xpValue: 10,
      icon: <ThumbsUp className="h-5 w-5 text-green-500" />
    }
  ];
  
  // Filter suggestions based on questType if specified
  const filteredSuggestions = questType 
    ? suggestions.filter(s => {
        if (questType === 'pulse_creation' && s.type === 'pulse') return true;
        if (questType === 'engagement' && (s.type === 'comment' || s.type === 'reaction')) return true;
        return false;
      })
    : suggestions;
    
  const handleAction = (suggestion: NowboardSuggestion) => {
    setIsLoading(true);
    
    // Simulate loading for demo purposes
    setTimeout(() => {
      setIsLoading(false);
      
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
    }, 500);
  };
  
  if (isLoading) {
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
  
  if (filteredSuggestions.length === 0) {
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
        <CardDescription>Musk-recommended actions to complete your quests</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {filteredSuggestions.map(suggestion => (
            <div 
              key={suggestion.id} 
              className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-primary/20 hover:bg-accent/20 transition-colors group"
            >
              <div className="mt-1 h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center flex-shrink-0">
                {suggestion.icon}
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