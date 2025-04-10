import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";
import { ExternalLink, Github, Linkedin, Mail, MapPin, Twitter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Import portfolio templates
import MinimalistPro from "@/components/portfolio/templates/minimalist-pro";
import FreelancerHub from "@/components/portfolio/templates/freelancer-hub";
import TimelineStoryteller from "@/components/portfolio/templates/timeline-storyteller";
import VisualExpert from "@/components/portfolio/templates/visual-expert";
import CorporateExecutive from "@/components/portfolio/templates/corporate-executive";
import { DynamicInnovator } from "@/components/portfolio/templates/dynamic-innovator";

// Type for our user data
interface UserData {
  id: number;
  username: string;
  name: string | null;
  email: string;
  photoURL: string | null;
  title: string | null;
  location: string | null;
  industry: string | null;
  lookingFor: string | null;
}

// Type for portfolio data
interface PortfolioData {
  layout: string;
  publicUrl: string | null;
  isPublished: boolean;
  customTitle: string;
  customBio: string;
  customizationOptions: {
    theme: string;
    showContact: boolean;
  };
  featuredProjects: any[];
  featuredSkills: any[];
  featuredExperiences: any[];
  skills: any[];
  experiences: any[];
  projects: any[];
  educations: any[];
  services: any[];
  userData: UserData;
}

// Public Profile Component
const PublicProfile = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Get username from URL parameters
  // For now, let's extract it from the pathname as wouter doesn't have useParams
  const pathname = window.location.pathname;
  const username = pathname.startsWith('/@') ? pathname.substring(2) : null;
  
  // Fetch user data by username
  const { data: userData, isLoading: isUserLoading, error: userError } = useQuery<UserData | null>({
    queryKey: ['/api/users/by-username', username],
    queryFn: async () => {
      if (!username) return null;
      try {
        const response = await apiRequest('GET', `/api/users/by-username/${username}`);
        return response as UserData;
      } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
      }
    },
    enabled: !!username
  });
  
  // Fetch portfolio data if we have a user
  const { data: portfolioData, isLoading: isPortfolioLoading } = useQuery<PortfolioData | null>({
    queryKey: ['/api/portfolio', userData?.id],
    queryFn: async () => {
      if (!userData?.id) return null;
      try {
        const response = await apiRequest('GET', `/api/portfolio/${userData.id}`);
        return response as PortfolioData;
      } catch (error) {
        console.error('Error fetching portfolio:', error);
        // Return a default portfolio structure with user data
        return {
          layout: 'visual-expert',
          publicUrl: null,
          isPublished: true,
          customTitle: userData.name || userData.username,
          customBio: '',
          customizationOptions: {
            theme: 'colorful',
            showContact: true
          },
          featuredProjects: [],
          featuredSkills: [],
          featuredExperiences: [],
          skills: [],
          experiences: [],
          projects: [],
          educations: [],
          services: [],
          userData: userData
        } as PortfolioData;
      }
    },
    enabled: !!userData?.id
  });
  
  // If there's no username or if there's an error, show not found
  useEffect(() => {
    if (!username) {
      navigate('/not-found');
    }
    
    if (userError) {
      toast({
        title: "Profile not found",
        description: "We couldn't find a user with that username.",
        variant: "destructive"
      });
      navigate('/not-found');
    }
  }, [username, userError, navigate, toast]);
  
  // Loading state
  if (isUserLoading || isPortfolioLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-6 max-w-6xl">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-60" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Render the appropriate portfolio template based on user's selected layout
  const renderPortfolio = (portfolioData: PortfolioData) => {
    // Map our portfolio data to the format each template expects
    const templateProps = {
      userInfo: {
        name: portfolioData.userData.name || portfolioData.userData.username,
        title: portfolioData.userData.title,
        industry: portfolioData.userData.industry,
        domain: null,
        location: portfolioData.userData.location,
        email: portfolioData.userData.email,
        photoURL: portfolioData.userData.photoURL,
        lookingFor: portfolioData.userData.lookingFor,
        jobLevel: null
      },
      userSkills: portfolioData.skills || [],
      userExperiences: portfolioData.experiences || [],
      userProjects: portfolioData.projects || [],
      userEducations: portfolioData.educations || [],
      userServices: portfolioData.services || []
    };
    
    switch (portfolioData.layout) {
      case 'minimalist-pro':
        return <MinimalistPro {...templateProps} />;
      case 'freelancer-hub':
        return <FreelancerHub {...templateProps} />;
      case 'timeline-storyteller':
        return <TimelineStoryteller {...templateProps} />;
      case 'visual-expert':
        return <VisualExpert {...templateProps} />;
      case 'corporate-executive':
        return <CorporateExecutive {...templateProps} />;
      case 'dynamic-innovator':
        return <DynamicInnovator {...templateProps} />;
      default:
        return <VisualExpert {...templateProps} />;
    }
  };
  
  // If no portfolio data, show a basic profile
  if (!portfolioData || !portfolioData.isPublished) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-6 max-w-6xl">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center md:flex-row md:items-start gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={userData?.photoURL || undefined} alt={userData?.name || userData?.username} />
                  <AvatarFallback>{userData?.name?.[0] || userData?.username?.[0] || '?'}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2 text-center md:text-left">
                  <h1 className="text-2xl font-bold">{userData?.name || userData?.username}</h1>
                  
                  {userData?.title && (
                    <p className="text-lg text-muted-foreground">{userData.title}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {userData?.location && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1" />
                        {userData.location}
                      </div>
                    )}
                    
                    {userData?.industry && (
                      <Badge variant="outline">{userData.industry}</Badge>
                    )}
                  </div>
                  
                  <div className="pt-4">
                    <p className="text-center md:text-left text-muted-foreground">
                      This user hasn't published their portfolio yet.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  // Return the portfolio
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-6">
        {renderPortfolio(portfolioData as PortfolioData)}
      </div>
    </div>
  );
};

export default PublicProfile;