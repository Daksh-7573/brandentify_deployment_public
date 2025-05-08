import React from 'react';
import { useHashtagSuggestions } from '@/hooks/use-hashtag-suggestions';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCcw } from 'lucide-react';

interface HashtagSuggestionsProps {
  questType?: string;
  targetAction?: string;
  contentContext?: string;
  count?: number;
  onHashtagClick?: (hashtag: string) => void;
  className?: string;
}

/**
 * Component to display personalized hashtag suggestions based on user profile and quest context
 */
export function HashtagSuggestions({
  questType = 'pulse_creation',
  targetAction,
  contentContext,
  count = 5,
  onHashtagClick,
  className = ''
}: HashtagSuggestionsProps) {
  const { user } = useCurrentUser();
  const { 
    hashtags, 
    sources, 
    isLoading, 
    error, 
    refreshHashtags 
  } = useHashtagSuggestions({
    industry: user?.industry || undefined,
    domain: user?.domain || undefined,
    questType,
    targetAction,
    contentContext,
    count
  });
  
  // Handle click on a hashtag
  const handleHashtagClick = (hashtag: string) => {
    if (onHashtagClick) {
      onHashtagClick(hashtag);
    }
  };
  
  // If there's an error or no hashtags, don't render anything
  if (error && (!hashtags || hashtags.length === 0)) {
    return null;
  }
  
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-muted-foreground">
          <span className="mr-1">💡</span> Musk's hashtag suggestions
        </div>
        {!isLoading && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={refreshHashtags}
            className="h-6 w-6 p-0 rounded-full"
          >
            <RefreshCcw className="h-3 w-3" />
            <span className="sr-only">Refresh hashtags</span>
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {isLoading ? (
          // Show skeletons while loading
          <>
            {Array.from({ length: count }).map((_, index) => (
              <Skeleton key={`skeleton-${index}`} className="h-6 w-20 rounded-full" />
            ))}
          </>
        ) : (
          // Show hashtags when loaded
          <>
            {hashtags && hashtags.map((hashtag) => (
              <Badge 
                key={hashtag} 
                variant="outline"
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => handleHashtagClick(hashtag)}
              >
                #{hashtag}
              </Badge>
            ))}
          </>
        )}
      </div>
      
      {sources && sources.length > 0 && (
        <div className="text-xs text-muted-foreground">
          Based on: {sources.join(', ')}
        </div>
      )}
    </div>
  );
}