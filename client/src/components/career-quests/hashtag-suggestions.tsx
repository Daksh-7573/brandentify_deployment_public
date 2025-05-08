import { useHashtagSuggestions } from '@/hooks/use-hashtag-suggestions';
import { Badge } from '@/components/ui/badge';
import { UserQuest } from '@/types/career-quest';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface HashtagSuggestionsProps {
  quest: UserQuest;
  maxToShow?: number;
}

export function HashtagSuggestions({ quest, maxToShow = 5 }: HashtagSuggestionsProps) {
  // Get toast for notifications
  const { toast } = useToast();
  
  // Get quest information from different possible formats
  const questDefinition = quest.questDefinition || quest.definition || {
    title: quest.questTitle || '',
    type: quest.questType || 'pulse_creation',
    targetAction: quest.targetAction || '',
    industry: quest.industry || '',
    domain: quest.domain || ''
  };
  
  // Extract user information from quest
  const userIndustry = quest.industry || '';
  const userDomain = quest.domain || '';
  
  // Fetch hashtag suggestions based on quest and user context
  const { data, isLoading, isError } = useHashtagSuggestions({
    industry: userIndustry || questDefinition.industry,
    domain: userDomain || questDefinition.domain,
    targetAction: typeof questDefinition.targetAction === 'string' ? questDefinition.targetAction : '',
    questTitle: questDefinition.title
  });
  
  // Skip rendering if there's no data and we're not loading
  if (isError || (!isLoading && (!data || !data.hashtags || data.hashtags.length === 0))) {
    return null;
  }
  
  // Show limited number of hashtags
  const hashtags = data?.hashtags?.slice(0, maxToShow) || [];
  
  // Handle hashtag click to copy to clipboard
  const handleHashtagClick = (hashtag: string) => {
    // Copy to clipboard
    navigator.clipboard.writeText(hashtag)
      .then(() => {
        // Show a toast notification for user feedback
        toast({
          title: "Hashtag copied",
          description: `"${hashtag}" is now in your clipboard`,
          duration: 2000, // 2 seconds
        });
      })
      .catch((err) => {
        console.error('Failed to copy hashtag to clipboard:', err);
        toast({
          title: "Copy failed",
          description: "Could not copy hashtag to clipboard",
          variant: "destructive",
        });
      });
  };
  
  return (
    <div className="mt-1 space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <span className="text-sm">✨</span>
        <span>Musk's hashtag suggestions:</span>
      </div>
      
      <div className="flex flex-wrap gap-1.5">
        {isLoading ? (
          // Skeleton loaders for loading state
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton 
              key={`skeleton-${i}`}
              className="h-6 w-16 rounded-full"
            />
          ))
        ) : (
          // Actual hashtags
          hashtags.map((hashtag: string, index: number) => (
            <Badge 
              key={`hashtag-${index}`} 
              variant="outline"
              className="text-xs font-normal bg-muted/40 cursor-pointer hover:bg-muted/60 transition-colors"
              onClick={() => handleHashtagClick(hashtag)}
              title="Click to copy"
            >
              {hashtag}
            </Badge>
          ))
        )}
      </div>
    </div>
  );
}