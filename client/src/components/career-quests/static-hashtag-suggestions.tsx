import React from 'react';
import { Badge } from '@/components/ui/badge';
import { QuestType } from '@/types/career-quest';

interface StaticHashtagSuggestionsProps {
  hashtags: string[];
  onHashtagClick?: (hashtag: string) => void;
  className?: string;
}

interface QuestTypeHashtagSuggestionsProps {
  questType: QuestType;
  onHashtagClick?: (hashtag: string) => void;
  className?: string;
}

// Mapping of quest types to relevant hashtags
const questTypeHashtags: Partial<Record<QuestType, string[]>> = {
  'pulse_creation': ['career', 'jobsearch', 'opportunity', 'hiring', 'networking'],
  'networking': ['connect', 'mentorship', 'collaboration', 'careeradvice', 'industry'],
  'learning': ['skills', 'education', 'growth', 'certification', 'courses'],
  'visibility': ['portfolio', 'personal_brand', 'thoughtleadership', 'expertise', 'showcase'],
  'profile_update': ['resume', 'experience', 'achievements', 'bio', 'credentials'],
  'portfolio': ['projects', 'showcase', 'worksamples', 'portfolio', 'creative'],
  'resume': ['resume', 'cv', 'jobs', 'experience', 'skills'],
  'daily': ['productivity', 'goals', 'daily', 'progress', 'consistency'],
  'weekly': ['weeklygoals', 'progress', 'career', 'growth', 'milestones'],
  'monthly': ['career', 'milestones', 'goals', 'growth', 'success']
};

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
          className="glass-badge cursor-pointer transition-colors"
          onClick={() => handleHashtagClick(hashtag)}
        >
          #{hashtag}
        </Badge>
      ))}
    </div>
  );
}

/**
 * A version of StaticHashtagSuggestions that takes a quest type and shows relevant hashtags
 * This is used in the quest card to show relevant hashtags for specific quest types
 */
export function StaticHashtagSuggestionsByQuestType({
  questType,
  onHashtagClick,
  className = ''
}: QuestTypeHashtagSuggestionsProps) {
  // Use the questType to get the relevant hashtags
  const hashtags = questTypeHashtags[questType] || [];
  
  // Render the base component with the hashtags
  return (
    <StaticHashtagSuggestions 
      hashtags={hashtags}
      onHashtagClick={onHashtagClick}
      className={className}
    />
  );
}