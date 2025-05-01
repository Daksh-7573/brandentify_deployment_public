/**
 * Enhanced hook for managing shadow resume data with strong persistence guarantees
 */

import { useState, useEffect, useMemo } from 'react';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

// Custom hook for loading shadow resume data with enhanced caching and fallback mechanisms
export function useShadowResume(userId: string | number | undefined, options?: UseQueryOptions<any, Error>) {
  const enabled = !!userId;
  
  // Add state for cached form data from localStorage
  const [cachedFormData, setCachedFormData] = useState<any>(null);
  
  // Attempt to get locally cached data on initial load
  useEffect(() => {
    if (userId) {
      try {
        // First try the resume-specific cache
        const resumeData = JSON.parse(localStorage.getItem(`shadow_resume_data_${userId}`) || 'null');
        if (resumeData?.resume?.id) {
          const resumeId = resumeData.resume.id;
          const formData = localStorage.getItem(`resume_form_${resumeId}`);
          
          if (formData) {
            const parsedForm = JSON.parse(formData);
            console.log(`Found cached form data for resume ${resumeId}`, parsedForm);
            setCachedFormData(parsedForm);
            return;
          }
        }
        
        // Then try the user-specific latest cache
        const latestFormData = localStorage.getItem(`resume_form_latest_${userId}`);
        if (latestFormData) {
          const parsedLatest = JSON.parse(latestFormData);
          console.log(`Found latest cached form data for user ${userId}`, parsedLatest);
          setCachedFormData(parsedLatest);
          return;
        }
      } catch (error) {
        console.error('Error loading cached resume data:', error);
      }
    }
  }, [userId]);
  
  const query = useQuery({
    queryKey: ['/api/users', userId, 'shadow-resume'],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      console.log(`Fetching shadow resume data for user ${userId}`);
      
      try {
        // Get the shadow resume for the user
        const response = await fetch(`/api/users/${userId}/shadow-resume`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to load resume data');
        }
        
        const data = await response.json();
        
        // Store the successfully fetched data in localStorage for offline/backup access
        if (data?.resume) {
          try {
            localStorage.setItem(`shadow_resume_data_${userId}`, JSON.stringify(data));
            console.log(`Cached shadow resume data for user ${userId}`);
            
            // If we have form data in the response but not in local storage, cache it
            if (data.form && data.resume.id) {
              localStorage.setItem(`resume_form_${data.resume.id}`, JSON.stringify(data.form));
              console.log(`Cached form data for resume ${data.resume.id}`);
            }
          } catch (error) {
            console.error('Error caching resume data:', error);
          }
        }
        
        return data;
      } catch (error) {
        console.error('Error fetching shadow resume data:', error);
        
        // If we have cached data, use it as a fallback
        try {
          const cachedData = JSON.parse(localStorage.getItem(`shadow_resume_data_${userId}`) || 'null');
          if (cachedData?.resume) {
            console.log('Using cached shadow resume data as fallback');
            return cachedData;
          }
        } catch (e) {
          console.error('Error reading cached data:', e);
        }
        
        throw error;
      }
    },
    enabled,
    ...options,
  });
  
  // Combine API data with cached data if necessary
  const data = query.data;
  
  // If we have API data but no form, and we have cached form data, combine them
  const enhancedData = useMemo(() => {
    if (data?.resume && !data.form && cachedFormData) {
      console.log('Using cached form data with API resume data');
      return {
        ...data,
        form: cachedFormData,
      };
    }
    return data;
  }, [data, cachedFormData]);
  
  // Check if we have metadata that contains form data
  const [metadataFormData, setMetadataFormData] = useState<any>(null);
  
  useEffect(() => {
    if (data?.resume?.metadata && !data.form) {
      try {
        const parsedMetadata = JSON.parse(data.resume.metadata as string);
        console.log('Found form data in resume metadata field', parsedMetadata);
        setMetadataFormData(parsedMetadata);
        
        // Cache this form data for future use
        if (data.resume.id) {
          localStorage.setItem(`resume_form_${data.resume.id}`, JSON.stringify(parsedMetadata));
        }
      } catch (e) {
        console.error('Failed to parse resume metadata', e);
      }
    }
  }, [data?.resume?.metadata, data?.form, data?.resume?.id]);
  
  // Enhanced log for debugging the data flow
  console.log('Shadow Resume Data Processing:', {
    hasAPIForm: !!data?.form,
    hasEnhancedForm: !!enhancedData?.form,
    hasMetadataForm: !!metadataFormData,
    hasCachedForm: !!cachedFormData
  });
  
  // Combine all the data sources with proper prioritization:
  // 1. Form data from API response (highest priority)
  // 2. Parsed metadata from resume.metadata
  // 3. Cached form data from localStorage
  const combinedData = useMemo(() => {
    // If API already provides form data, use it (highest priority)
    if (data?.form) {
      console.log('Using form data directly from API response');
      return data;
    }
    
    // If we have API data with resume but no form data, add form data from other sources
    if (data?.resume) {
      // Try to use metadata form data first
      if (metadataFormData) {
        console.log('Using form data from resume metadata');
        return {
          ...data,
          form: metadataFormData
        };
      }
      
      // Then try cached form data
      if (cachedFormData) {
        console.log('Using cached form data from localStorage');
        return {
          ...data,
          form: cachedFormData
        };
      }
    }
    
    // Return whatever we have from the API as fallback
    return query.data;
  }, [data, query.data, metadataFormData, cachedFormData]);
  
  // Return the query with potentially enhanced data
  return {
    ...query,
    data: combinedData,
    cachedFormData,
    metadataFormData,
    hasFormData: !!(
      (combinedData?.form) || 
      (data?.form) || 
      (metadataFormData) ||
      (cachedFormData)
    )
  };
}