import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

/**
 * Custom hook to get the latest company a user works for or has worked for
 * @param userId - User ID
 * @param fallbackCompany - Optional fallback company name if no experience data is available
 * @returns The company name from the most recent work experience
 */
export const useCurrentCompany = (userId: string | number | null, fallbackCompany?: string) => {
  const [company, setCompany] = useState<string | null>(fallbackCompany || null);
  const isDemoUser = typeof userId === 'string' && userId.includes('firebase_');
  
  // Use numeric ID for API calls if available
  const userNumericId = typeof userId === 'number' ? userId : null;
  
  console.log("useCurrentCompany - userID:", userId, "userNumericId:", userNumericId, "isDemoUser:", isDemoUser);

  // Fetch user experiences - only enabled for numeric IDs
  const { data: experiences, isLoading: isLoadingExperiences } = useQuery<any[]>({
    queryKey: [userNumericId ? `/api/users/${userNumericId}/experiences` : null],
    enabled: !!userNumericId,
  });

  useEffect(() => {
    // For demo users, provide default values
    if (isDemoUser) {
      if (fallbackCompany) {
        setCompany(fallbackCompany);
      } else {
        // Demo users get a default company
        setCompany("Brandentifier Labs");
      }
      return;
    }
    
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
      setCompany(sortedExperiences[0]?.company || fallbackCompany || null);
    } else {
      // Use fallback company if provided, otherwise null
      setCompany(fallbackCompany || null);
    }
  }, [experiences, isDemoUser, fallbackCompany]);

  return { company, isLoading: isLoadingExperiences };
};