import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Copy, Hash, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { QuestType } from '@/types/career-quest';

// Static hashtag suggestions organized by quest type
const STATIC_HASHTAGS: Record<QuestType, string[]> = {
  pulse_creation: [
    'careerjourney', 'professionalgrowth', 'jobsearch', 'careeradvice', 
    'careertips', 'networking', 'leadership', 'skillbuilding',
    'remotework', 'worklifebalance', 'productivitytips'
  ],
  networking: [
    'networking', 'careerconnections', 'professionalnetwork', 'careergrowth',
    'industryinsights', 'mentorship', 'collaboration', 'thoughtleadership'
  ],
  learning: [
    'continuouslearning', 'upskilling', 'professionaldevelopment', 'onlinelearning',
    'courses', 'certification', 'skillsgap', 'learning', 'growth'
  ],
  portfolio: [
    'portfolio', 'creativework', 'showcase', 'projecthighlight',
    'casestudy', 'design', 'development', 'results'
  ],
  resume: [
    'resume', 'cv', 'jobsearch', 'hireme', 'experience',
    'skills', 'careerhistory', 'achievements'
  ],
  visibility: [
    'personalbranding', 'thoughtleadership', 'industryleader', 'careergrowth',
    'expertise', 'influence', 'contentcreator', 'engagement'
  ],
  profile_update: [
    'profileupdate', 'personalbranding', 'careerpresence', 'professionalimage',
    'aboutme', 'careerjourney', 'expertise', 'opentowork'
  ],
  daily: [
    'dailywin', 'todaysachievement', 'dailygoal', 'productivity',
    'workday', 'professionalgrowth', 'dailyprogress'
  ],
  weekly: [
    'weeklywin', 'weeklyupdate', 'progressreport', 'weeklygoals',
    'achievements', 'professionalgrowth', 'careermilestone'
  ],
  monthly: [
    'monthlyreview', 'monthlyprogress', 'careergoals', 'growthjourney',
    'professionaldevelopment', 'monthlyachievements', 'reflection'
  ]
};

interface StaticHashtagSuggestionsProps {
  questType: QuestType;
  className?: string;
  count?: number;
  showTitle?: boolean;
}

export function StaticHashtagSuggestions({
  questType,
  className = '',
  count = 5,
  showTitle = true
}: StaticHashtagSuggestionsProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  
  // Get relevant hashtags (or fallback to pulse_creation if questType not found)
  const relevantHashtags = STATIC_HASHTAGS[questType] || STATIC_HASHTAGS.pulse_creation;
  
  // Choose a random selection of hashtags based on count
  const getRandomHashtags = () => {
    // Shuffle array using Fisher-Yates algorithm
    const shuffled = [...relevantHashtags].sort(() => 0.5 - Math.random());
    // Get first n elements
    return shuffled.slice(0, Math.min(count, shuffled.length));
  };
  
  const [hashtags, setHashtags] = useState<string[]>(getRandomHashtags());
  
  const refreshHashtags = () => {
    setHashtags(getRandomHashtags());
    setCopied({});
  };
  
  const handleCopy = (hashtag: string) => {
    navigator.clipboard.writeText(hashtag);
    setCopied({...copied, [hashtag]: true});
    
    toast({
      title: "Copied to clipboard",
      description: `Hashtag ${hashtag} copied to clipboard`,
      duration: 2000,
    });
    
    // Reset copied state after 2 seconds
    setTimeout(() => {
      setCopied(prev => ({...prev, [hashtag]: false}));
    }, 2000);
  };
  
  // Generate the color variants based on index
  const getColor = (index: number) => {
    const colors = [
      'bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-300',
      'bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-800 dark:text-green-300',
      'bg-purple-100 hover:bg-purple-200 dark:bg-purple-900 dark:hover:bg-purple-800 text-purple-800 dark:text-purple-300',
      'bg-amber-100 hover:bg-amber-200 dark:bg-amber-900 dark:hover:bg-amber-800 text-amber-800 dark:text-amber-300',
      'bg-pink-100 hover:bg-pink-200 dark:bg-pink-900 dark:hover:bg-pink-800 text-pink-800 dark:text-pink-300',
    ];
    
    return colors[index % colors.length];
  };

  return (
    <div className={`${className}`}>
      {showTitle && (
        <h3 className="text-lg font-medium mb-2">Suggested Hashtags</h3>
      )}
      
      <div className="flex flex-wrap gap-2 mb-3">
        {hashtags.map((hashtag, index) => (
          <Badge
            key={index}
            variant="outline"
            className={`cursor-pointer flex items-center gap-1 ${getColor(index)}`}
            onClick={() => handleCopy(hashtag)}
          >
            <Hash className="h-3 w-3" />
            {hashtag}
            {copied[hashtag] ? (
              <Check className="h-3 w-3 ml-1" />
            ) : (
              <Copy className="h-3 w-3 ml-1 opacity-50" />
            )}
          </Badge>
        ))}
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="mt-2 text-xs" 
        onClick={refreshHashtags}
      >
        <RefreshCw className="h-3 w-3 mr-1" />
        Refresh suggestions
      </Button>
    </div>
  );
}