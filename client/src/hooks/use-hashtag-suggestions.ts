import { useState, useCallback, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

// Define the response structure
interface HashtagResponse {
  hashtags: string[];
  sources?: string[];
  [key: string]: unknown; // Allow for additional properties
}

// Type guard to check if a response is a valid HashtagResponse
function isHashtagResponse(obj: any): obj is HashtagResponse {
  return obj && typeof obj === 'object' && Array.isArray(obj.hashtags);
}

interface HashtagSuggestionsOptions {
  industry?: string;
  domain?: string;
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
  refreshHashtags: () => Promise<void>;
}

/**
 * Hook to fetch personalized hashtag suggestions from the API
 */
export function useHashtagSuggestions(options: HashtagSuggestionsOptions): HashtagSuggestionsResult {
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    industry,
    domain,
    questType = 'pulse_creation',
    targetAction,
    contentContext,
    count = 5,
    demo = false
  } = options;
  
  const fetchHashtags = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // If the questType is "static" or there's no user context (industry/domain), use static suggestions
      if (questType === 'static' || (!industry && !domain && !demo)) {
        const staticResponse = await apiRequest({ 
          method: 'GET', 
          url: `/api/personalized-hashtags/static/${questType}?count=${count}`
        });
        
        // Parse the response data
        if (isHashtagResponse(staticResponse)) {
          setHashtags(staticResponse.hashtags);
          setSources(staticResponse.sources || ['Content trends']);
        } else {
          setHashtags([]);
          setSources([]);
        }
      } else {
        // Use the personalized or demo endpoint based on the demo flag
        const endpoint = demo ? '/api/personalized-hashtags/demo' : '/api/personalized-hashtags';
        
        const response = await apiRequest({
          method: 'POST', 
          url: endpoint, 
          data: {
            industry,
            domain,
            questType,
            targetAction,
            contentContext,
            count
          }
        });
        
        // Parse the response data
        if (isHashtagResponse(response)) {
          setHashtags(response.hashtags);
          setSources(response.sources || []);
        } else {
          setHashtags([]);
          setSources([]);
        }
      }
    } catch (err) {
      console.error('Error fetching hashtag suggestions:', err);
      setError('Failed to fetch hashtag suggestions');
      
      // Try to use static suggestions as a fallback
      try {
        const staticResponse = await apiRequest({ 
          method: 'GET', 
          url: `/api/personalized-hashtags/static/${questType}?count=${count}` 
        });
        
        // Parse the response data
        if (isHashtagResponse(staticResponse)) {
          setHashtags(staticResponse.hashtags);
          setSources(staticResponse.sources || ['Static suggestions']);
        }
      } catch (fallbackErr) {
        console.error('Error fetching fallback hashtags:', fallbackErr);
      }
    } finally {
      setIsLoading(false);
    }
  }, [industry, domain, questType, targetAction, contentContext, count, demo]);
  
  // Fetch hashtags on mount and when dependencies change
  useEffect(() => {
    fetchHashtags();
  }, [fetchHashtags]);
  
  return {
    hashtags,
    sources,
    isLoading,
    error,
    refreshHashtags: fetchHashtags
  };
}