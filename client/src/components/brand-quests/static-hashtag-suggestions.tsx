import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { QuestType } from '@/types/career-quest';
import { useCurrentUser } from '@/hooks/use-current-user';

interface StaticHashtagSuggestionsProps {
  hashtags?: string[];
  onHashtagClick?: (hashtag: string) => void;
  className?: string;
  questType?: QuestType;
  industry?: string;
  count?: number;
}

// Predefined hashtags for different quest types and industries
const QUEST_TYPE_HASHTAGS: Record<string, string[]> = {
  'pulse_creation': [
    'careerjourney', 'professionallife', 'jobsearch', 'workculture', 'professionalgrowth',
    'careerdevelopment', 'industryleaders', 'mentorship', 'remotework', 'futureofwork',
    'productivity', 'worklifebalance', 'jobopportunity', 'thoughtleadership'
  ],
  'networking': [
    'careernetwork', 'connectprofessionals', 'industryexperts', 'communitybuilding', 
    'professionals', 'professionalnetwork', 'mentorcircle', 'collaborators', 'growthpartners'
  ],
  'visibility': [
    'personalbranding', 'visibility', 'careergoals', 'growthjourney', 'careerlaunch',
    'standout', 'personalbrand', 'professionalvisibility', 'industryvisibility', 'careerpath'
  ],
  'skill_acquisition': [
    'skillsbuilding', 'learning', 'professionaldevelopment', 'expertise', 'continuouslearning',
    'upskilling', 'knowledgegrowth', 'learningjourney', 'skillsofthefuture', 'expertisebuilding'
  ],
  'portfolio': [
    'portfolioshowcase', 'worksamples', 'projects', 'achievements', 'credentials',
    'expertisedisplay', 'showcasework', 'creativity', 'projectportfolio', 'professionaldisplay'
  ],
  'engagement': [
    'communityengagement', 'conversation', 'discuss', 'participate', 'collaborate',
    'industryconversation', 'thoughtexchange', 'professionaldiscussion', 'valuableinsights'
  ],
  'profile': [
    'profileoptimization', 'professionalidentity', 'personalbrand', 'careerprofile', 'digitalidentity',
    'professionalportrait', 'expertstatus', 'profileengagement', 'careerportfolio', 'talentprofile'
  ],
  'services': [
    'professionalservices', 'expertise', 'consultation', 'solutions', 'serviceoffering',
    'professionalsupport', 'strategicpartner', 'industryexpertise', 'consultingservices', 'expertguidance'
  ]
};

// Industry-specific hashtags that can be mixed in based on user's industry
const INDUSTRY_HASHTAGS: Record<string, string[]> = {
  'tech': ['techcareer', 'techtalent', 'techtalk', 'techindustry', 'startup', 'innovation', 'digitaltransformation'],
  'healthcare': ['healthcare', 'healthcareers', 'medical', 'healthinnovation', 'patientcare', 'medicalprofessional'],
  'finance': ['fintech', 'banking', 'investing', 'wealthmanagement', 'financialservices', 'financialplanning'],
  'marketing': ['digitalmarketing', 'marketingpro', 'brandstrategy', 'contentcreation', 'socialmedia', 'marketinginsights'],
  'education': ['edtech', 'teaching', 'education', 'learning', 'academicexcellence', 'highereducation', 'educator'],
  'design': ['designthinking', 'uxdesign', 'creativeprofessional', 'userexperience', 'visualdesign', 'productdesign'],
  'engineering': ['engineering', 'engineeringexcellence', 'technicalleadership', 'systemdesign', 'innovation'],
  'manufacturing': ['manufacturing', 'supplychain', 'operations', 'logistics', 'production', 'quality', 'lean'],
  'creative': ['creative', 'creativecareer', 'contentcreation', 'creativeindustry', 'artwork', 'design', 'mediaproduction']
};

/**
 * A simpler version of HashtagSuggestions that takes static hashtags without making API calls
 * Useful for contexts where we already have the hashtags and don't want to fetch them
 */
export function StaticHashtagSuggestions({
  hashtags,
  onHashtagClick,
  className = '',
  questType,
  industry,
  count = 7
}: StaticHashtagSuggestionsProps) {
  const { user } = useCurrentUser();
  
  // Get user industry from props or current user data
  const userIndustry = industry || user?.industry || 'tech';
  
  // If questType is provided and hashtags are not, use predefined hashtags for that type
  // Also mix in industry-specific hashtags when possible
  const tagsToDisplay = useMemo(() => {
    // If explicit hashtags are provided, use those
    if (hashtags && hashtags.length > 0) {
      return hashtags;
    }
    
    // Start with quest type hashtags if available
    let availableTags: string[] = [];
    if (questType && QUEST_TYPE_HASHTAGS[questType]) {
      availableTags = [...QUEST_TYPE_HASHTAGS[questType]];
    } else {
      // Default to pulse_creation tags if no quest type or hashtags provided
      availableTags = [...QUEST_TYPE_HASHTAGS['pulse_creation']];
    }
    
    // Mix in industry-specific hashtags if available
    const industryTags = INDUSTRY_HASHTAGS[userIndustry] || [];
    if (industryTags.length > 0) {
      availableTags = [...availableTags, ...industryTags];
    }
    
    // Randomize and limit the number of tags
    return shuffle(availableTags).slice(0, count);
  }, [hashtags, questType, userIndustry, count]);
  
  // Helper function to randomize array (Fisher-Yates shuffle)
  function shuffle(array: string[]): string[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
  
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