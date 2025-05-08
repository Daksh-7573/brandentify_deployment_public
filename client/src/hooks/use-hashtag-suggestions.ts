import { useQuery } from '@tanstack/react-query';

export interface HashtagSuggestionsParams {
  industry?: string;
  domain?: string;
  targetAction?: string;
  questTitle?: string;
}

/**
 * Hook to fetch hashtag suggestions for quests
 * 
 * @param params Parameters for hashtag suggestions
 * @returns Query result with hashtag suggestions
 */
export function useHashtagSuggestions(params: HashtagSuggestionsParams) {
  const { industry, domain, targetAction, questTitle } = params;
  
  // Remove any undefined or empty strings
  const filteredParams: Record<string, string> = {};
  if (industry) filteredParams.industry = industry;
  if (domain) filteredParams.domain = domain;
  if (targetAction) filteredParams.targetAction = targetAction;
  if (questTitle) filteredParams.questTitle = questTitle;
  
  // Create query string for API call
  const queryParams = new URLSearchParams();
  Object.entries(filteredParams).forEach(([key, value]) => {
    queryParams.append(key, value);
  });
  
  const queryString = queryParams.toString();
  const hasValidParams = Object.keys(filteredParams).length > 0;
  
  return useQuery({
    queryKey: ['/api/quests/suggest-hashtags', queryString],
    queryFn: async () => {
      if (!hasValidParams) {
        // Skip API call if no context is provided
        return { hashtags: [] };
      }
      
      try {
        const response = await fetch(`/api/quests/suggest-hashtags?${queryString}`);
        if (!response.ok) {
          console.error('Failed to fetch hashtag suggestions:', response.status, response.statusText);
          return { hashtags: [] }; // Return empty set instead of failing
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching hashtag suggestions:', error);
        return { hashtags: [] }; // Return empty set on error
      }
    },
    enabled: hasValidParams,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    retry: 1, // Only retry once to avoid excessive API calls
  });
}