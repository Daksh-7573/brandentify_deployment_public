import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { QuestType } from '@/types/career-quest';

interface StaticHashtagSuggestionsProps {
  hashtags?: string[];
  onHashtagClick?: (hashtag: string) => void;
  className?: string;
  questType?: QuestType;
}

// Predefined hashtags for different quest types
const QUEST_TYPE_HASHTAGS: Record<string, string[]> = {
  'pulse_creation': ['career', 'professional', 'jobsearch', 'worklife', 'experience'],
  'networking': ['connect', 'networking', 'community', 'industry', 'professionals'],
  'visibility': ['personalbranding', 'visibility', 'careergoals', 'growth', 'opportunity'],
  'skill_acquisition': ['skills', 'learning', 'development', 'expertise', 'growth'],
  'portfolio': ['portfolio', 'showcase', 'projects', 'worksamples', 'achievements'],
  'engagement': ['engage', 'community', 'conversation', 'discuss', 'participate'],
  'profile': ['profile', 'professional', 'personal', 'brand', 'identity'],
  'services': ['services', 'offering', 'expertise', 'consultation', 'solutions']
};

/**
 * A simpler version of HashtagSuggestions that takes static hashtags without making API calls
 * Useful for contexts where we already have the hashtags and don't want to fetch them
 */
export function StaticHashtagSuggestions({
  hashtags,
  onHashtagClick,
  className = '',
  questType
}: StaticHashtagSuggestionsProps) {
  
  // If questType is provided and hashtags are not, use predefined hashtags for that type
  const tagsToDisplay = useMemo(() => {
    if (hashtags && hashtags.length > 0) {
      return hashtags;
    }
    
    if (questType && QUEST_TYPE_HASHTAGS[questType]) {
      return QUEST_TYPE_HASHTAGS[questType];
    }
    
    return [];
  }, [hashtags, questType]);
  
  // Handle click on a hashtag
  const handleHashtagClick = (hashtag: string) => {
    if (onHashtagClick) {
      onHashtagClick(hashtag);
    }
  };
  
  // If no hashtags, don't render anything
  if (tagsToDisplay.length === 0) {
    return null;
  }
  
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tagsToDisplay.map((hashtag) => (
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