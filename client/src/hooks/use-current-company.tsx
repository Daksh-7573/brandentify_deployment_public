import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

/**
 * Custom hook to get the latest company a user works for or has worked for
 * @param userId - User ID
 * @returns The company name from the most recent work experience
 */
export const useCurrentCompany = (userId: string | number | null) => {
  const [company, setCompany] = useState<string | null>(null);

  // Fetch user experiences
  const { data: experiences, isLoading: isLoadingExperiences } = useQuery<any[]>({
    queryKey: [userId ? `/api/users/${userId}/experiences` : null],
    enabled: !!userId,
  });

  useEffect(() => {
    // If experiences are loaded, find the most recent one
    if (experiences && experiences.length > 0) {
      // Sort experiences by start date (most recent first) and prioritize current positions
      const sortedExperiences = [...experiences].sort((a, b) => {
        // Current positions first
        if (a.isCurrent && !b.isCurrent) return -1;
        if (!a.isCurrent && b.isCurrent) return 1;
        
        // Then by start date (most recent first)
        const aDate = new Date(a.startDate);
        const bDate = new Date(b.startDate);
        return bDate.getTime() - aDate.getTime();
      });
      
      // Get company from the most recent experience
      setCompany(sortedExperiences[0]?.company || null);
    } else {
      setCompany(null);
    }
  }, [experiences]);

  return { company, isLoading: isLoadingExperiences };
};