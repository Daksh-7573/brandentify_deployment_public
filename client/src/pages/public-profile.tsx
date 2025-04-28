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
    
    // Check all possible formats:
    // 1. /@username - remove the @ symbol
    if (pathname.startsWith('/@')) {
      username = pathname.substring(2);
    } 
    // 2. /profile/username - extract from /profile/ path
    else if (pathname.startsWith('/profile/') && pathname.length > 9) {
      username = pathname.substring(9);
    }
    // 3. /username - direct username as path
    else if (pathname.startsWith('/') && pathname.length > 1) {
      username = pathname.substring(1);
    }
    
    console.log("Username extracted from URL path:", username, "from pathname:", pathname);
  }
  
  // Enhanced debugging for better tracking
  console.log("Public profile page for username:", username);
  console.log("Current window.location.pathname:", window.location.pathname);
  console.log("Route params received in public-profile component:", { username });
  
  // Add direct output to help debug the component
  useEffect(() => {
    console.log("PublicProfile component mounted with username:", username);
    document.title = `Profile | ${username || 'User'}`;
    
    // Debug message directly in DOM
    const debugDiv = document.createElement('div');
    debugDiv.style.position = 'fixed';
    debugDiv.style.top = '0';
    debugDiv.style.left = '0';
    debugDiv.style.backgroundColor = 'rgba(255,0,0,0.7)';
    debugDiv.style.color = 'white';
    debugDiv.style.padding = '10px';
    debugDiv.style.zIndex = '9999';
    debugDiv.innerHTML = `Debug: Profile page loading for username: ${username || 'undefined'}`;
    document.body.appendChild(debugDiv);
    
    return () => {
      if (document.body.contains(debugDiv)) {
        document.body.removeChild(debugDiv);
      }
    };
  }, [username]);
  
  // Fetch user data by username
  const { data: userData, isLoading: isUserLoading, error: userError } = useQuery<UserData | null>({
    queryKey: ['/api/users/by-username', username],
    queryFn: async () => {
      if (!username) {
        console.error("[public-profile] No username provided for API request");
        return null;
      }
      
      console.log(`[public-profile] Attempting to fetch user data for username: ${username}`);
      try {
        // API request with detailed error handling
        const response = await apiRequest('GET', `/api/users/by-username/${username}`);
        
        console.log('[public-profile] User data API response:', response);
        
        // Detailed validation of the response
        if (!response) {
          console.error('[public-profile] API returned empty response for username:', username);
          return null;
        }
        
        if (typeof response !== 'object') {
          console.error('[public-profile] API returned non-object response:', response);
          return null;
        }
        
        // Add a div to the DOM with the API response for debugging
        const debugEl = document.createElement('div');
        debugEl.id = 'debug-api-response';
        debugEl.style.position = 'fixed';
        debugEl.style.bottom = '0';
        debugEl.style.left = '0';
        debugEl.style.right = '0';
        debugEl.style.backgroundColor = 'rgba(0,0,0,0.8)';
        debugEl.style.color = 'white';
        debugEl.style.padding = '10px';
        debugEl.style.fontSize = '12px';
        debugEl.style.maxHeight = '200px';
        debugEl.style.overflow = 'auto';
        debugEl.style.zIndex = '10000';
        debugEl.style.fontFamily = 'monospace';
        debugEl.innerHTML = `<strong>API Response for username ${username}:</strong><br/>${JSON.stringify(response, null, 2)}`;
        document.body.appendChild(debugEl);
        
        // Type-safe access to fields
        console.log('[public-profile] whatIOffer value:', response.whatIOffer || '(not provided)');
        console.log('[public-profile] aboutMe value:', response.aboutMe || '(not provided)');
        
        return response as unknown as UserData;
      } catch (error) {
        console.error('[public-profile] Error fetching user data:', error);
        // Add error details to the page
        const errorEl = document.createElement('div');
        errorEl.style.position = 'fixed';
        errorEl.style.top = '50%';
        errorEl.style.left = '50%';
        errorEl.style.transform = 'translate(-50%, -50%)';
        errorEl.style.backgroundColor = 'rgba(255,0,0,0.9)';
        errorEl.style.color = 'white';
        errorEl.style.padding = '20px';
        errorEl.style.borderRadius = '8px';
        errorEl.style.zIndex = '10000';
        errorEl.innerHTML = `<h3>Error loading profile</h3><p>${error.message || 'Unknown error'}</p>`;
        document.body.appendChild(errorEl);
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
    layout: 'visual-expert', // Default to visual-expert template
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
        // jobLevel is not defined in the UserData type, but some components may expect it
        jobLevel: (portfolioData.userData as any).jobLevel || null
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
        // Pass the values directly to match the Animated component's expected props
        return <Animated 
          name={templateProps.userInfo.name}
          title={templateProps.userInfo.title || ''}
          industry={templateProps.userInfo.industry || ''}
          domain={templateProps.userInfo.domain || ''}
          location={templateProps.userInfo.location || ''}
          photoURL={templateProps.userInfo.photoURL}
          email={templateProps.userInfo.email}
          lookingFor={templateProps.userInfo.lookingFor || ''}
          aboutMe={templateProps.userInfo.aboutMe}
          whatIOffer={templateProps.userInfo.whatIOffer}
          skills={templateProps.userSkills}
          projects={templateProps.userProjects}
          experiences={templateProps.userExperiences}
          educations={templateProps.userEducations}
          services={templateProps.userServices}
        />;
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
                            href={`/${userData?.username}`} 
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
  try {
    // Forcibly add debug info to DOM
    const debugInfoExists = document.getElementById('profile-debug-info');
    if (!debugInfoExists) {
      const debugInfo = document.createElement('div');
      debugInfo.id = 'profile-debug-info';
      debugInfo.style.position = 'fixed';
      debugInfo.style.top = '50px';
      debugInfo.style.right = '10px';
      debugInfo.style.backgroundColor = 'rgba(0,0,0,0.8)';
      debugInfo.style.color = 'white';
      debugInfo.style.padding = '10px';
      debugInfo.style.borderRadius = '4px';
      debugInfo.style.zIndex = '9999';
      debugInfo.style.maxWidth = '300px';
      debugInfo.style.fontSize = '12px';
      debugInfo.style.fontFamily = 'monospace';
      
      let debugContent = `
        <h3>Profile Debug Info</h3>
        <p>Username: ${username || 'null'}</p>
        <p>User ID: ${userData?.id || 'null'}</p>
        <p>Layout: ${portfolioData?.layout || 'null'}</p>
        <p>Skills: ${userSkills?.length || 0}</p>
        <p>Experiences: ${userExperiences?.length || 0}</p>
        <p>Projects: ${userProjects?.length || 0}</p>
        <p>Educations: ${userEducations?.length || 0}</p>
        <p>Services: ${userServices?.length || 0}</p>
      `;
      
      debugInfo.innerHTML = debugContent;
      document.body.appendChild(debugInfo);
      
      // Make sure we catch any rendering errors and display them
      window.addEventListener('error', (e) => {
        console.error('Runtime error caught:', e);
        const errorDiv = document.createElement('div');
        errorDiv.style.position = 'fixed';
        errorDiv.style.top = '0';
        errorDiv.style.left = '0';
        errorDiv.style.width = '100%';
        errorDiv.style.backgroundColor = 'red';
        errorDiv.style.color = 'white';
        errorDiv.style.padding = '10px';
        errorDiv.style.zIndex = '10000';
        errorDiv.textContent = `Error: ${e.message} at ${e.filename}:${e.lineno}`;
        document.body.appendChild(errorDiv);
      });
    }
  
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-6">
          {portfolioData ? renderPortfolio(portfolioData as PortfolioData) : 
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-center p-8 border rounded-lg bg-background">
                <p className="text-xl mb-4">Error loading portfolio data</p>
                <p className="text-muted-foreground">Unable to render portfolio for user {username}</p>
              </div>
            </div>
          }
        </div>
      </div>
    );
  } catch (error) {
    // Emergency fallback if the component fails to render
    console.error("Fatal error rendering profile:", error);
    
    // Add error directly to the DOM
    const errorEl = document.createElement('div');
    errorEl.style.position = 'fixed';
    errorEl.style.top = '0';
    errorEl.style.left = '0';
    errorEl.style.width = '100%';
    errorEl.style.height = '100%';
    errorEl.style.backgroundColor = '#fff';
    errorEl.style.padding = '20px';
    errorEl.style.zIndex = '10000';
    errorEl.innerHTML = `
      <h1 style="color: red; font-size: 24px;">Error Rendering Profile</h1>
      <p style="margin-top: 10px;">${error.message || 'Unknown error'}</p>
      <div style="margin-top: 20px;">
        <h3>Debug Information:</h3>
        <pre style="background: #f0f0f0; padding: 10px; overflow: auto;">
        Username: ${username || 'null'}
        Portfolio Data: ${JSON.stringify(portfolioData, null, 2)}
        </pre>
      </div>
      <div style="margin-top: 20px;">
        <a href="/" style="color: blue;">Return to home page</a>
      </div>
    `;
    document.body.appendChild(errorEl);
    
    // Return fallback component
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-red-500 mb-4">Error Rendering Profile</h1>
          <p>An unexpected error occurred while rendering this profile.</p>
          <a href="/" className="text-primary hover:underline mt-4 inline-block">Return to home page</a>
        </div>
      </div>
    );
  }
};

export default PublicProfile;