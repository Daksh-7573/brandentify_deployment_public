import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, MapPin, Briefcase, Heart } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

// Portfolio template imports
import MinimalistPro from "@/components/portfolio/templates/minimalist-pro";
import TimelineStoryteller from "@/components/portfolio/templates/timeline-storyteller";
import VisualExpert from "@/components/portfolio/templates/visual-expert";
import FreelancerHub from "@/components/portfolio/templates/freelancer-hub";
import Scholar from "@/components/portfolio/templates/scholar";
import AnimatedOdyssey from "@/components/portfolio/templates/animated-odyssey";
import DynamicInnovator from "@/components/portfolio/templates/dynamic-innovator";
import CorporateExecutive from "@/components/portfolio/templates/corporate-executive";

interface UserData {
  id: number;
  username: string;
  name: string | null;
  email?: string | null;
  brandName: string;
  photoURL: string | null;
  title: string | null;
  aboutMe: string | null;
  location: string | null;
  industry: string | null;
  domain: string | null;
  lookingFor: string | null;
  whatIOffer: string | null;
  selectedPortfolioLayout: string;
  visitingCardType: string | null;
  jobLevel?: string | null;
  createdAt: string;
}

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

interface BrandProfileProps {
  brandName: string;
}

export default function BrandProfile({ brandName }: BrandProfileProps) {
  console.log(`[BrandProfile] Loading profile for brand name: ${brandName}`);

  // Fetch user data by brand name
  const { data: userData, isLoading: isUserLoading, error: userError } = useQuery({
    queryKey: [`/api/users/brand/${brandName}`],
    enabled: !!brandName,
  }) as { data: UserData | undefined, isLoading: boolean, error: any };

  // Fetch user's profile data once we have the user ID
  const { data: userSkills = [], isLoading: isSkillsLoading } = useQuery({
    queryKey: [`/api/users/${userData?.id}/skills`],
    enabled: !!userData?.id,
  });

  const { data: userExperiences = [], isLoading: isExperiencesLoading } = useQuery({
    queryKey: [`/api/users/${userData?.id}/experiences`],
    enabled: !!userData?.id,
  });

  const { data: userProjects = [], isLoading: isProjectsLoading } = useQuery({
    queryKey: [`/api/users/${userData?.id}/projects`],
    enabled: !!userData?.id,
  });

  const { data: userEducations = [], isLoading: isEducationsLoading } = useQuery({
    queryKey: [`/api/users/${userData?.id}/educations`],
    enabled: !!userData?.id,
  });

  const { data: userServices = [], isLoading: isServicesLoading } = useQuery({
    queryKey: [`/api/users/${userData?.id}/services`],
    enabled: !!userData?.id,
  });

  // Fetch the user's published portfolio
  const { data: publishedPortfolio, isLoading: isPortfolioDataLoading, error: portfolioError } = useQuery({
    queryKey: [`/api/users/${userData?.id}/portfolio`], 
    queryFn: async () => {
      console.log(`Brand profile - Portfolio query triggered. userData:`, userData);
      console.log(`Brand profile - userData?.id:`, userData?.id);
      if (!userData?.id) {
        console.log('Brand profile - No userData.id, skipping portfolio fetch');
        return null;
      }
      try {
        console.log(`Brand profile - Fetching portfolio for user ID: ${userData.id}`);
        console.log(`Brand profile - Making API call to: /api/users/${userData.id}/portfolio`);
        
        const response = await fetch(`/api/users/${userData.id}/portfolio`);
        console.log('Brand profile - Raw response:', response);
        
        if (!response.ok) {
          console.error('Brand profile - API response not ok:', response.status, response.statusText);
          return null;
        }
        
        const portfolioData = await response.json();
        console.log('Brand profile - Portfolio data received:', portfolioData);
        return portfolioData;
      } catch (error) {
        console.error('Brand profile - Error fetching portfolio:', error);
        console.error('Brand profile - Portfolio API call failed with error:', error);
        return null;
      }
    },
    enabled: !!userData?.id,
    retry: false
  });

  // Debug logging for portfolio data
  console.log("Brand profile debug:");
  console.log("- userData:", userData);
  console.log("- publishedPortfolio:", publishedPortfolio);
  console.log("- portfolioError:", portfolioError);
  console.log("- isPortfolioDataLoading:", isPortfolioDataLoading);

  // Construct portfolio data from all fetched components
  const portfolioData: PortfolioData | null = userData && publishedPortfolio ? {
    layout: publishedPortfolio.layout, // Use the actual portfolio layout from database
    publicUrl: publishedPortfolio.publicUrl,
    isPublished: publishedPortfolio.isPublished,
    customTitle: publishedPortfolio.customTitle || userData.name || userData.username,
    customBio: publishedPortfolio.customBio || userData.aboutMe || '',
    customizationOptions: publishedPortfolio.customizationOptions || {
      theme: 'colorful',
      showContact: true
    },
    featuredProjects: publishedPortfolio.featuredProjects || [],
    featuredSkills: publishedPortfolio.featuredSkills || [],
    featuredExperiences: publishedPortfolio.featuredExperiences || [],
    skills: Array.isArray(userSkills) ? userSkills : [],
    experiences: Array.isArray(userExperiences) ? userExperiences : [],
    projects: Array.isArray(userProjects) ? userProjects : [],
    educations: Array.isArray(userEducations) ? userEducations : [],
    services: Array.isArray(userServices) ? userServices : [],
    userData: userData
  } : null;

  const isPortfolioLoading = isSkillsLoading || isExperiencesLoading || isProjectsLoading || 
                            isEducationsLoading || isServicesLoading || isPortfolioDataLoading;

  console.log("Portfolio data construction:");
  console.log("- userData exists:", !!userData);
  console.log("- publishedPortfolio exists:", !!publishedPortfolio);
  console.log("- portfolioData result:", !!portfolioData);
  console.log("- isPortfolioLoading:", isPortfolioLoading);

  // Handle loading state
  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-6 max-w-6xl">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  // Handle user not found
  if (userError || !userData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-6 max-w-6xl">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center gap-4">
                <User className="h-16 w-16 text-muted-foreground" />
                <h1 className="text-2xl font-bold">Profile Not Found</h1>
                <p className="text-muted-foreground">
                  The profile URL "{brandName}" doesn't exist or has been removed.
                </p>
                <Button onClick={() => window.location.href = '/'}>
                  Return to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render loading state for portfolio data
  if (isPortfolioLoading || !portfolioData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-6 max-w-6xl">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  // Render the appropriate portfolio template based on selected layout
  const renderPortfolioTemplate = () => {
    const layout = portfolioData.layout;
    
    // Prepare data for portfolio templates
    const templateProps = {
      userInfo: {
        id: userData.id,
        name: userData.name || userData.username,
        title: userData.title,
        industry: userData.industry,
        domain: userData.domain,
        location: userData.location,
        email: userData.email || null,
        photoURL: userData.photoURL,
        lookingFor: userData.lookingFor,
        jobLevel: userData.jobLevel,
        aboutMe: userData.aboutMe,
        whatIOffer: userData.whatIOffer
      },
      userSkills: portfolioData.skills,
      userExperiences: portfolioData.experiences,
      userProjects: portfolioData.projects,
      userEducations: portfolioData.educations,
      userServices: portfolioData.services
    };
    
    switch (layout) {
      case 'minimalist':
        return <MinimalistPro 
          userInfo={templateProps.userInfo}
          userSkills={templateProps.userSkills}
          userExperiences={templateProps.userExperiences}
          userProjects={templateProps.userProjects}
          userEducations={templateProps.userEducations}
          userServices={templateProps.userServices}
        />;
      case 'timeline':
        return <TimelineStoryteller 
          userInfo={templateProps.userInfo}
          userSkills={templateProps.userSkills}
          userExperiences={templateProps.userExperiences}
          userProjects={templateProps.userProjects}
          userEducations={templateProps.userEducations}
          userServices={templateProps.userServices}
        />;
      case 'visual':
        return <VisualExpert 
          userInfo={templateProps.userInfo}
          userSkills={templateProps.userSkills}
          userExperiences={templateProps.userExperiences}
          userProjects={templateProps.userProjects}
          userEducations={templateProps.userEducations}
          userServices={templateProps.userServices}
        />;
      case 'freelancer':
        return <FreelancerHub 
          userInfo={templateProps.userInfo}
          userSkills={templateProps.userSkills}
          userExperiences={templateProps.userExperiences}
          userProjects={templateProps.userProjects}
          userEducations={templateProps.userEducations}
          userServices={templateProps.userServices}
        />;
      case 'scholar':
        return <Scholar 
          userInfo={templateProps.userInfo}
          userSkills={templateProps.userSkills}
          userExperiences={templateProps.userExperiences}
          userProjects={templateProps.userProjects}
          userEducations={templateProps.userEducations}
          userServices={templateProps.userServices}
        />;
      case 'animated':
        return <AnimatedOdyssey 
          name={templateProps.userInfo.name}
          title={templateProps.userInfo.title || ''}
          industry={templateProps.userInfo.industry || ''}
          domain={templateProps.userInfo.domain || ''}
          location={templateProps.userInfo.location || ''}
          email={templateProps.userInfo.email || ''}
          photoURL={templateProps.userInfo.photoURL || ''}
          lookingFor={templateProps.userInfo.lookingFor || ''}
          jobLevel={templateProps.userInfo.jobLevel || ''}
          aboutMe={templateProps.userInfo.aboutMe || ''}
        />;
      case 'dynamic':
        return <DynamicInnovator 
          userInfo={templateProps.userInfo}
          userSkills={templateProps.userSkills}
          userExperiences={templateProps.userExperiences}
          userProjects={templateProps.userProjects}
          userEducations={templateProps.userEducations}
          userServices={templateProps.userServices}
        />;
      case 'corporate':
        return <CorporateExecutive 
          userInfo={templateProps.userInfo}
          userSkills={templateProps.userSkills}
          userExperiences={templateProps.userExperiences}
          userProjects={templateProps.userProjects}
          userEducations={templateProps.userEducations}
          userServices={templateProps.userServices}
        />;
      case 'professional':
      default:
        return <CorporateExecutive 
          userInfo={templateProps.userInfo}
          userSkills={templateProps.userSkills}
          userExperiences={templateProps.userExperiences}
          userProjects={templateProps.userProjects}
          userEducations={templateProps.userEducations}
          userServices={templateProps.userServices}
        />;
    }
  };

  return renderPortfolioTemplate();
}