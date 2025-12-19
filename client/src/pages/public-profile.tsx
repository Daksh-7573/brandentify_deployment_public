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
import { useAuth } from "@/hooks/use-auth";
import { ProfilePageSkeleton } from "@/components/ui/page-skeletons/profile-skeleton";
import { MentorshipButton } from "@/components/shared/mentorship-button";

// Import portfolio templates
import { 
  getPortfolioTemplate, 
  buildPortfolioTemplateProps 
} from "@/components/portfolio/templateRegistry";

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
  tagline?: string | null;
  visionStatement?: string | null;
  missionStatement?: string | null;
  coreValues?: string[] | null;
  uniqueValueProposition?: string | null;
  brandName?: string | null;
  randomProfileLink?: string | null;
  primaryAudience?: string[] | null;
  secondaryAudience?: string[] | null;
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
  const { user } = useAuth(); // Get the current authenticated user
  
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

  // Fetch the user's published portfolio
  const { data: publishedPortfolio, isLoading: isPortfolioDataLoading, error: portfolioError } = useQuery({
    queryKey: [`/api/users/${userData?.id}/portfolio`], 
    queryFn: async () => {
      console.log(`Public profile - Portfolio query triggered. userData:`, userData);
      console.log(`Public profile - userData?.id:`, userData?.id);
      if (!userData?.id) {
        console.log('Public profile - No userData.id, skipping portfolio fetch');
        return null;
      }
      try {
        console.log(`Public profile - Fetching portfolio for user ID: ${userData.id}`);
        console.log(`Public profile - Making API call to: /api/users/${userData.id}/portfolio`);
        const portfolioData = await apiRequest('GET', `/api/users/${userData.id}/portfolio`);
        console.log('Public profile - Portfolio data received:', portfolioData);
        return portfolioData;
      } catch (error) {
        console.error('Error fetching portfolio:', error);
        console.error('Portfolio API call failed with error:', error);
        return null;
      }
    },
    enabled: !!userData?.id,
    retry: false
  });
  
  // Debug logging for portfolio data
  console.log("Public profile debug:");
  console.log("- userData:", userData);
  console.log("- publishedPortfolio:", publishedPortfolio);
  console.log("- portfolioError:", portfolioError);
  console.log("- isPortfolioDataLoading:", isPortfolioDataLoading);

  // Construct portfolio data from all fetched components
  const portfolioData: PortfolioData | null = userData && publishedPortfolio ? {
    layout: publishedPortfolio.layout, // Use the actual portfolio layout
    publicUrl: publishedPortfolio?.publicUrl || null,
    isPublished: publishedPortfolio?.isPublished || false,
    customTitle: publishedPortfolio?.customTitle || userData.name || userData.username,
    customBio: publishedPortfolio?.customBio || '',
    customizationOptions: publishedPortfolio?.customizationOptions || {
      theme: 'colorful',
      showContact: true
    },
    featuredProjects: publishedPortfolio?.featuredProjects || [],
    featuredSkills: publishedPortfolio?.featuredSkills || [],
    featuredExperiences: publishedPortfolio?.featuredExperiences || [],
    skills: userSkills,
    experiences: userExperiences,
    projects: userProjects,
    educations: userEducations,
    services: userServices,
    userData: userData
  } : null;
  
  const isPortfolioLoading = isSkillsLoading || isExperiencesLoading || isProjectsLoading || 
                            isEducationsLoading || isServicesLoading || isPortfolioDataLoading;
  
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
    return <ProfilePageSkeleton />;
  }
  
  // Render the appropriate portfolio template based on user's selected layout
  const renderPortfolio = (portfolioData: PortfolioData) => {
    // Get the current user ID from auth context for mentorship functionality
    const currentUserId = user?.id;
    
    // Build template props using shared helper
    const templateProps = buildPortfolioTemplateProps(
      {
        ...portfolioData.userData,
        name: portfolioData.userData.name || portfolioData.userData.username,
        tagline: portfolioData.userData.tagline || null,
        visionStatement: portfolioData.userData.visionStatement || null,
        missionStatement: portfolioData.userData.missionStatement || null,
        coreValues: portfolioData.userData.coreValues || [],
        uniqueValueProposition: portfolioData.userData.uniqueValueProposition || null,
        brandName: portfolioData.userData.brandName || null,
        primaryAudience: portfolioData.userData.primaryAudience || [],
        secondaryAudience: portfolioData.userData.secondaryAudience || []
      },
      {
        skills: portfolioData.skills,
        experiences: portfolioData.experiences,
        projects: portfolioData.projects,
        educations: portfolioData.educations,
        services: portfolioData.services
      },
      {
        currentUserId: currentUserId
      }
    );
    
    // Get the appropriate template component and render it
    const TemplateComponent = getPortfolioTemplate(portfolioData.layout);
    return <TemplateComponent {...templateProps} />;
  };
  
  // If no portfolio data (user hasn't selected a layout), show a basic profile
  if (!portfolioData || !publishedPortfolio) {
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
                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <h1 className="text-2xl font-bold">{userData?.name || userData?.username}</h1>
                    {userData?.id && user?.id && user.id !== userData.id && (
                      <MentorshipButton 
                        userId={user.id}
                        mentorId={userData.id}
                        size="sm"
                        buttonText="Follow as Mentor"
                      />
                    )}
                  </div>
                  
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
                            href={userData?.randomProfileLink ? `/r/${userData.randomProfileLink}` : `/@${userData?.username}`} 
                            className="text-primary hover:underline"
                          >
                            {userData?.randomProfileLink ? `brandentifier.com/r/${userData.randomProfileLink}` : `brandentifier.com/@${userData?.username}`}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <p className="text-center md:text-left text-muted-foreground">
                      This user hasn't set up a portfolio yet.
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