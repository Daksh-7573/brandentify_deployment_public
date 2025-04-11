import { useQuery } from '@tanstack/react-query';

/**
 * Custom hook to fetch user's education data
 * 
 * @param userId The user id to fetch education for
 * @returns Education data and loading state
 */
export function useEducation(userId: number) {
  const {
    data: educations = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['/api/users', userId, 'educations'],
    queryFn: () => fetch(`/api/users/${userId}/educations`).then(res => {
      if (!res.ok) {
        throw new Error('Failed to fetch education data');
      }
      return res.json();
    }),
    enabled: !!userId,
  });

  return {
    educations,
    isLoading,
    error,
  };
}