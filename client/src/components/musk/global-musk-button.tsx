import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import MuskButton from "./musk-button";
import { useLocation } from "wouter";

export default function GlobalMuskButton() {
  const { isAuthenticated, user } = useAuth();
  const [location] = useLocation();
  const [contextData, setContextData] = useState<any>({
    page: 'global',
    userId: 0,
    data: {}
  });

  // Fetch user data for context enrichment when authenticated
  const userId = user?.id ? Number(user.id) : 0;

  // Fetch user profile data
  const { data: userData } = useQuery({
    queryKey: ['/api/users', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await apiRequest('GET', `/api/users/${userId}`);
      if (response instanceof Response) {
        try {
          return await response.json();
        } catch (error) {
          console.error("Error parsing user data response:", error);
          return null;
        }
      }
      return response;
    },
    enabled: !!userId && isAuthenticated
  });

  // Fetch work experiences
  const { data: experiences = [] } = useQuery({
    queryKey: ['/api/users', userId, 'experiences'],
    queryFn: async () => {
      if (!userId) return [];
      const response = await apiRequest('GET', `/api/users/${userId}/experiences`);
      if (response instanceof Response) {
        try {
          return await response.json();
        } catch (error) {
          console.error("Error parsing experiences response:", error);
          return [];
        }
      }
      return Array.isArray(response) ? response : [];
    },
    enabled: !!userId && isAuthenticated,
    staleTime: 30000,
  });

  // Fetch education
  const { data: educations = [] } = useQuery({
    queryKey: ['/api/users', userId, 'educations'],
    queryFn: async () => {
      if (!userId) return [];
      const response = await apiRequest('GET', `/api/users/${userId}/educations`);
      if (response instanceof Response) {
        try {
          return await response.json();
        } catch (error) {
          console.error("Error parsing educations response:", error);
          return [];
        }
      }
      return Array.isArray(response) ? response : [];
    },
    enabled: !!userId && isAuthenticated,
    staleTime: 30000,
  });

  // Fetch skills
  const { data: skills = [] } = useQuery({
    queryKey: ['/api/users', userId, 'skills'],
    queryFn: async () => {
      if (!userId) return [];
      const response = await apiRequest('GET', `/api/users/${userId}/skills`);
      if (response instanceof Response) {
        try {
          return await response.json();
        } catch (error) {
          console.error("Error parsing skills response:", error);
          return [];
        }
      }
      return Array.isArray(response) ? response : [];
    },
    enabled: !!userId && isAuthenticated,
    staleTime: 30000,
  });

  // Fetch projects
  const { data: projects = [] } = useQuery({
    queryKey: ['/api/users', userId, 'projects'],
    queryFn: async () => {
      if (!userId) return [];
      const response = await apiRequest('GET', `/api/users/${userId}/projects`);
      if (response instanceof Response) {
        try {
          return await response.json();
        } catch (error) {
          console.error("Error parsing projects response:", error);
          return [];
        }
      }
      return Array.isArray(response) ? response : [];
    },
    enabled: !!userId && isAuthenticated,
    staleTime: 30000,
  });

  // Update context data when user data is loaded - with memoization to prevent infinite loops
  useEffect(() => {
    // Only update when meaningful data changes and avoid infinite loops from response objects
    if (isAuthenticated && userData) {
      try {
        // Get current page from location
        const currentPage = location.startsWith('/') ? location.substring(1) : location;
        const page = currentPage || 'home';
        
        // Extract only the needed data and create stable references
        const userDataExtract = userData && typeof userData === 'object' ? {
          id: userData.id,
          name: userData.name,
          title: userData.title,
          location: userData.location,
          industry: userData.industry,
          domain: userData.domain
        } : null;
        
        // Create stable versions of array data
        const stableExperiences = Array.isArray(experiences) ? experiences.map(exp => ({
          id: exp.id,
          title: exp.title,
          company: exp.company,
          startDate: exp.startDate,
          endDate: exp.endDate
        })) : [];
        
        const stableEducations = Array.isArray(educations) ? educations.map(edu => ({
          id: edu.id,
          institution: edu.institution,
          degree: edu.degree,
          startDate: edu.startDate,
          endDate: edu.endDate
        })) : [];
        
        const stableSkills = Array.isArray(skills) ? skills.map(skill => ({
          id: skill.id,
          name: skill.name,
          level: skill.level
        })) : [];
        
        const stableProjects = Array.isArray(projects) ? projects.map(proj => ({
          id: proj.id,
          title: proj.title,
          description: proj.description,
          category: proj.category
        })) : [];
        
        // Use the stable data for the context
        setContextData({
          page,
          userId,
          data: {
            userData: userDataExtract,
            experiences: stableExperiences,
            educations: stableEducations,
            skills: stableSkills,
            projects: stableProjects
          }
        });
      } catch (error) {
        console.error("Error processing data for GlobalMuskButton:", error);
      }
    }
  }, [isAuthenticated, location, userId]);
  
  // Separate effect to handle data updates - this prevents the infinite loop
  // by not making the main effect dependent on all data changes
  useEffect(() => {
    if (isAuthenticated && userData && 
        contextData.userId === userId && 
        contextData.data.userData) {
      // Update only when we have stable data and it's meaningfully changed
      setContextData(prev => ({
        ...prev,
        data: {
          ...prev.data,
          userData: prev.data.userData ? {
            ...prev.data.userData,
            // Only update specific fields that might change
            title: userData.title || prev.data.userData.title,
            location: userData.location || prev.data.userData.location,
          } : null,
          experiences: Array.isArray(experiences) ? experiences.map(exp => ({
            id: exp.id,
            title: exp.title,
            company: exp.company,
            startDate: exp.startDate,
            endDate: exp.endDate
          })) : prev.data.experiences,
          educations: Array.isArray(educations) ? educations.map(edu => ({
            id: edu.id,
            institution: edu.institution,
            degree: edu.degree,
            startDate: edu.startDate,
            endDate: edu.endDate
          })) : prev.data.educations,
          skills: Array.isArray(skills) ? skills.map(skill => ({
            id: skill.id,
            name: skill.name,
            level: skill.level
          })) : prev.data.skills,
          projects: Array.isArray(projects) ? projects.map(proj => ({
            id: proj.id,
            title: proj.title,
            description: proj.description,
            category: proj.category
          })) : prev.data.projects
        }
      }));
    }
  }, [userData, experiences, educations, skills, projects]);

  // Don't show on auth or landing pages
  if (!isAuthenticated || location === '/' || location === '/auth' || location === '/verify-email') {
    return null;
  }

  return <MuskButton context={contextData} initialOpen={false} />;
}