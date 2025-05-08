import { useState, useEffect } from 'react';
import { useCurrentUser } from '@/hooks/use-current-user';

interface UseHashtagSuggestionsOptions {
  industry?: string;
  questType?: string;
  targetAction?: string;
  contentContext?: string;
  count?: number;
  demo?: boolean;
}

interface HashtagSuggestionsResult {
  hashtags: string[];
  sources: string[];
  isLoading: boolean;
  error: string | null;
  refreshHashtags: () => void;
}

/**
 * Hook to fetch personalized hashtag suggestions
 */
export function useHashtagSuggestions({
  industry,
  questType = 'pulse_creation',
  targetAction,
  contentContext,
  count = 5,
  demo = false
}: UseHashtagSuggestionsOptions = {}): HashtagSuggestionsResult {
  const { user } = useCurrentUser();
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Function to fetch hashtags from the API
  const fetchHashtags = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use demo endpoint if specified
      const endpoint = demo 
        ? '/api/personalized-hashtags/demo' 
        : '/api/personalized-hashtags';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          industry: industry || user?.industry,
          domain: user?.domain,
          questType,
          targetAction,
          contentContext,
          count
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch hashtags: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.hashtags && Array.isArray(data.hashtags)) {
        setHashtags(data.hashtags);
        
        if (data.sources && Array.isArray(data.sources)) {
          setSources(data.sources);
        } else {
          setSources([]);
        }
      } else {
        setHashtags([]);
        setSources([]);
      }
    } catch (err) {
      console.error('Error fetching hashtags:', err);
      setError('Failed to load hashtag suggestions.');
      setHashtags([]);
      setSources([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch hashtags when dependencies change
  useEffect(() => {
    fetchHashtags();
  }, [user, industry, questType, targetAction, contentContext, count, demo]);
  
  return {
    hashtags,
    sources,
    isLoading,
    error,
    refreshHashtags: fetchHashtags
  };
}