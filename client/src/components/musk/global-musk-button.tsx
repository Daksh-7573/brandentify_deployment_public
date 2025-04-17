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
      return response;
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
      return response;
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
      return response;
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
      return response;
    },
    enabled: !!userId && isAuthenticated,
    staleTime: 30000,
  });

  // Update context data when user data is loaded
  useEffect(() => {
    if (isAuthenticated && userData) {
      // Get current page from location
      const currentPage = location.startsWith('/') ? location.substring(1) : location;
      const page = currentPage || 'home';
      
      setContextData({
        page,
        userId,
        data: {
          userData,
          experiences: experiences || [],
          educations: educations || [],
          skills: skills || [],
          projects: projects || []
        }
      });
    }
  }, [isAuthenticated, userData, location, userId, experiences, educations, skills, projects]);

  // Don't show on auth or landing pages
  if (!isAuthenticated || location === '/' || location === '/auth' || location === '/verify-email') {
    return null;
  }

  return <MuskButton context={contextData} initialOpen={false} />;
}