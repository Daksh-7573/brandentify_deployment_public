import React from 'react';
import { Badge } from '@/components/ui/badge';

interface StaticHashtagSuggestionsProps {
  hashtags: string[];
  onHashtagClick?: (hashtag: string) => void;
  className?: string;
}

/**
 * A simpler version of HashtagSuggestions that takes static hashtags without making API calls
 * Useful for contexts where we already have the hashtags and don't want to fetch them
 */
export function StaticHashtagSuggestions({
  hashtags,
  onHashtagClick,
  className = ''
}: StaticHashtagSuggestionsProps) {
  
  // Handle click on a hashtag
  const handleHashtagClick = (hashtag: string) => {
    if (onHashtagClick) {
      onHashtagClick(hashtag);
    }
  };
  
  // If no hashtags, don't render anything
  if (!hashtags || hashtags.length === 0) {
    return null;
  }
  
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {hashtags.map((hashtag) => (
        <Badge 
          key={hashtag} 
          variant="outline"
          className="cursor-pointer hover:bg-accent transition-colors"
          onClick={() => handleHashtagClick(hashtag)}
        >
          #{hashtag}
        </Badge>
      ))}
    </div>
  );
}