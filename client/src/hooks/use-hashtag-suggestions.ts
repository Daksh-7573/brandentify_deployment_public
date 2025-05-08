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
  
  // Create query string for API call
  const queryParams = new URLSearchParams();
  if (industry) queryParams.append('industry', industry);
  if (domain) queryParams.append('domain', domain);
  if (targetAction) queryParams.append('targetAction', targetAction);
  if (questTitle) queryParams.append('questTitle', questTitle);
  
  const queryString = queryParams.toString();
  
  return useQuery({
    queryKey: ['/api/quests/suggest-hashtags', queryString],
    queryFn: async () => {
      if (!industry && !domain && !questTitle) {
        // Skip API call if no context is provided
        return { hashtags: [] };
      }
      
      const response = await fetch(`/api/quests/suggest-hashtags?${queryString}`);
      if (!response.ok) {
        throw new Error('Failed to fetch hashtag suggestions');
      }
      return response.json();
    },
    enabled: Boolean(industry || domain || questTitle),
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}