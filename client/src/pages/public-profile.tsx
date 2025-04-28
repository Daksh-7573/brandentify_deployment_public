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
import { ExternalLink, Github, Globe, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Import portfolio templates
import MinimalistPro from "@/components/portfolio/templates/minimalist-pro";
import FreelancerHub from "@/components/portfolio/templates/freelancer-hub";
import TimelineStoryteller2 from "@/components/portfolio/templates/timeline-storyteller-2"; // Timeline Storyteller with comprehensive interactive timeline
import VisualExpert from "@/components/portfolio/templates/visual-expert";
import CorporateExecutive from "@/components/portfolio/templates/corporate-executive";
import { DynamicInnovator } from "@/components/portfolio/templates/dynamic-innovator";
import Animated from "@/components/portfolio/templates/animated";
import AnimatedOdyssey from "@/components/portfolio/templates/animated-odyssey"; // New animated, immersive template with advanced motion effects

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
  domain?: string | null;
  lookingFor: string | null;
  phoneNumber: string | null;
  aboutMe?: string | null;
  whatIOffer?: string | null;
  jobLevel?: string | null;
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
interface PublicProfileProps {
  username?: string;
}

const PublicProfile = ({ username: propUsername }: PublicProfileProps) => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Get username from props or fallback to URL path
  // This handles both wouter params and direct URL access
  let username = propUsername;
  
  // If username wasn't passed as a prop, try to extract it from the URL
  if (!username) {
    const pathname = window.location.pathname;
    username = pathname.startsWith('/@') ? pathname.substring(2) : undefined;
  }
  
  console.log("Public profile page for username:", username);
  
  // Fetch user data by username
  const { data: userData, isLoading: isUserLoading, error: userError } = useQuery<UserData | null>({
    queryKey: ['/api/users/by-username', username],
    queryFn: async () => {
      if (!username) return null;
      try {
        const response = await apiRequest('GET', `/api/users/by-username/${username}`);
        return response as unknown as UserData;
      } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
      }
    },
    enabled: !!username
  });
  
  // Fetch all user data components separately
  const { data: userSkills = [], isLoading: isSkillsLoading } = useQuery({
    queryKey: [`/api/users/${userData?.id}/skills`], 
    queryFn: async () => {
      if (!userData?.id) return [];
      try {
        return await apiRequest('GET', `/api/users/${userData.id}/skills`);
      } catch (error) {
        console.error('Error fetching skills:', error);
        return [];
      }
    },
    enabled: !!userData?.id
  });

  const { data: userExperiences = [], isLoading: isExperiencesLoading } = useQuery({
    queryKey: [`/api/users/${userData?.id}/experiences`], 
    queryFn: async () => {
      if (!userData?.id) return [];
      try {
        return await apiRequest('GET', `/api/users/${userData.id}/experiences`);
      } catch (error) {
        console.error('Error fetching experiences:', error);
        return [];
      }
    },
    enabled: !!userData?.id
  });

  const { data: userProjects = [], isLoading: isProjectsLoading } = useQuery({
    queryKey: [`/api/users/${userData?.id}/projects`], 
    queryFn: async () => {
      if (!userData?.id) return [];
      try {
        return await apiRequest('GET', `/api/users/${userData.id}/projects`);
      } catch (error) {
        console.error('Error fetching projects:', error);
        return [];
      }
    },
    enabled: !!userData?.id
  });

  const { data: userEducations = [], isLoading: isEducationsLoading } = useQuery({
    queryKey: [`/api/users/${userData?.id}/educations`], 
    queryFn: async () => {
      if (!userData?.id) return [];
      try {
        return await apiRequest('GET', `/api/users/${userData.id}/educations`);
      } catch (error) {
        console.error('Error fetching educations:', error);
        return [];
      }
    },
    enabled: !!userData?.id
  });

  const { data: userServices = [], isLoading: isServicesLoading } = useQuery({
    queryKey: [`/api/users/${userData?.id}/services`], 
    queryFn: async () => {
      if (!userData?.id) return [];
      try {
        console.log(`Public profile - Fetching services for user ID: ${userData.id}`);
        const serviceData = await apiRequest('GET', `/api/users/${userData.id}/services`);
        console.log('Public profile - Services data:', serviceData);
        return serviceData;
      } catch (error) {
        console.error('Error fetching services:', error);
        return [];
      }
    },
    enabled: !!userData?.id
  });
  
  // Construct portfolio data from all fetched components
  const portfolioData: PortfolioData | null = userData ? {
    layout: 'animated-odyssey', // Using the new animated-odyssey template
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
    skills: userSkills,
    experiences: userExperiences,
    projects: userProjects,
    educations: userEducations,
    services: userServices,
    userData: userData
  } : null;
  
  const isPortfolioLoading = isSkillsLoading || isExperiencesLoading || isProjectsLoading || 
                            isEducationsLoading || isServicesLoading;
  
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
        id: portfolioData.userData.id,
        name: portfolioData.userData.name || portfolioData.userData.username,
        title: portfolioData.userData.title,
        industry: portfolioData.userData.industry,
        domain: portfolioData.userData.domain || null,
        location: portfolioData.userData.location,
        email: portfolioData.userData.email,
        photoURL: portfolioData.userData.photoURL,
        lookingFor: portfolioData.userData.lookingFor,
        whatIOffer: portfolioData.userData.whatIOffer || null,
        aboutMe: portfolioData.userData.aboutMe || null,
        jobLevel: portfolioData.userData.jobLevel || null
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
      case 'timeline-storyteller-2':
        return <TimelineStoryteller2 {...templateProps} />;
      case 'visual-expert':
        return <VisualExpert {...templateProps} />;
      case 'corporate-executive':
        return <CorporateExecutive {...templateProps} />;
      case 'dynamic-innovator':
        return <DynamicInnovator {...templateProps} />;
      case 'animated':
        // For debugging
        console.log("Animated template userInfo:", templateProps.userInfo);
        
        // Setting a sample 'whatIOffer' text for the Animated template since the DB value is null
        const aboutMeContent = templateProps.userInfo.aboutMe || 
          "I am a passionate professional with a focus on innovation and creativity. My background combines technical expertise with a keen eye for design, allowing me to deliver comprehensive solutions that meet client needs.";
          
        return (
          <Animated 
            name={templateProps.userInfo.name}
            title={templateProps.userInfo.title || ''}
            industry={templateProps.userInfo.industry || ''}
            domain={templateProps.userInfo.domain || ''}
            location={templateProps.userInfo.location || ''}
            photoURL={templateProps.userInfo.photoURL}
            skills={templateProps.userSkills}
            projects={templateProps.userProjects}
            experiences={templateProps.userExperiences}
            educations={templateProps.userEducations}
            services={templateProps.userServices}
            lookingFor={templateProps.userInfo.lookingFor || ''}
            email={templateProps.userInfo.email}
            aboutMe={aboutMeContent}
            whatIOffer={aboutMeContent}
          />
        );
        
      case 'animated-odyssey':
        console.log("Animated Odyssey template userInfo:", templateProps.userInfo);
        
        // Use the same content for aboutMe and whatIOffer if they're null
        const odysseyContent = templateProps.userInfo.aboutMe || templateProps.userInfo.whatIOffer || 
          "I am a passionate professional with a focus on innovation and creativity. My background combines technical expertise with a keen eye for design, allowing me to deliver comprehensive solutions that meet client needs.";
        
        return (
          <AnimatedOdyssey
            name={templateProps.userInfo.name}
            title={templateProps.userInfo.title || ''}
            industry={templateProps.userInfo.industry || ''}
            domain={templateProps.userInfo.domain || ''}
            location={templateProps.userInfo.location || ''}
            photoURL={templateProps.userInfo.photoURL}
            skills={templateProps.userSkills}
            projects={templateProps.userProjects}
            experiences={templateProps.userExperiences}
            educations={templateProps.userEducations}
            services={templateProps.userServices}
            lookingFor={templateProps.userInfo.lookingFor || ''}
            email={templateProps.userInfo.email}
            aboutMe={odysseyContent}
            whatIOffer={odysseyContent}
          />
        );
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
                  
                  {/* Include the personal information section */}
                  <div className="pt-4 pb-2">
                    <div className="bg-background border rounded-lg p-4">
                      <h3 className="text-md font-semibold mb-2">Personal Information</h3>
                      <div className="space-y-2">
                        {/* Email */}
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{userData?.email}</span>
                        </div>
                        
                        {/* Phone Number */}
                        {userData?.phoneNumber ? (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{userData.phoneNumber}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span>No phone number added</span>
                          </div>
                        )}
                        
                        {/* Profile URL */}
                        <div className="flex items-center gap-2 text-sm">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <a 
                            href={`/@${userData?.username}`} 
                            className="text-primary hover:underline"
                          >
                            brandentifier.com/@{userData?.username}
                          </a>
                        </div>
                      </div>
                    </div>
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
  // Special case for full-width templates
  if (portfolioData && (portfolioData.layout === 'animated-odyssey')) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="w-full">
          {renderPortfolio(portfolioData as PortfolioData)}
        </div>
      </div>
    );
  }
  
  // Standard container for other templates
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