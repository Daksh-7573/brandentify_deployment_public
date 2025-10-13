import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, MapPin, Briefcase, Heart } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

// Portfolio template imports
import MinimalistPro from "@/components/portfolio/templates/minimalist-pro";
import TimelineStoryteller from "@/components/portfolio/templates/timeline-storyteller-2";
import VisualExpert from "@/components/portfolio/templates/visual-expert";
import FreelancerHub from "@/components/portfolio/templates/freelancer-hub";
import Scholar from "@/components/portfolio/templates/scholar";
import AnimatedOdyssey from "@/components/portfolio/templates/animated-odyssey";
import Animated from "@/components/portfolio/templates/animated";
import DynamicInnovator from "@/components/portfolio/templates/dynamic-innovator";
import CorporateExecutive from "@/components/portfolio/templates/corporate-executive";
import DesignerShowcase from "@/components/portfolio/templates/designer-showcase";
import PhotographerPortfolio from "@/components/portfolio/templates/photographer-portfolio";

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

  // Render loading state for portfolio data only if still loading or no portfolio exists
  if (isPortfolioDataLoading || (isPortfolioLoading && !portfolioData)) {
    console.log("Showing loading state because:", {
      isPortfolioDataLoading,
      isPortfolioLoading,
      hasPortfolioData: !!portfolioData
    });
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

  // If no portfolio data exists but loading is complete, show error
  if (!portfolioData && !isPortfolioDataLoading) {
    console.log("No portfolio data available after loading completed");
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-6 max-w-6xl">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center gap-4">
                <h1 className="text-2xl font-bold">Portfolio Not Available</h1>
                <p className="text-muted-foreground">
                  No published portfolio found for this profile.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render the appropriate portfolio template based on selected layout
  const renderPortfolioTemplate = () => {
    const layout = portfolioData?.layout || 'corporate-executive';
    
    console.log("Rendering portfolio template:");
    console.log("- layout:", layout);
    console.log("- portfolioData:", portfolioData);
    
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
      userSkills: portfolioData?.skills || [],
      userExperiences: portfolioData?.experiences || [],
      userProjects: portfolioData?.projects || [],
      userEducations: portfolioData?.educations || [],
      userServices: portfolioData?.services || []
    };
    
    console.log("Template props prepared:", templateProps);
    console.log("Detailed data for Scholar template:");
    console.log("- userSkills count:", templateProps.userSkills?.length || 0);
    console.log("- userExperiences count:", templateProps.userExperiences?.length || 0);
    console.log("- userProjects count:", templateProps.userProjects?.length || 0);
    console.log("- userEducations count:", templateProps.userEducations?.length || 0);
    console.log("- userServices count:", templateProps.userServices?.length || 0);
    console.log("- Skills data sample:", templateProps.userSkills?.[0]);
    console.log("- Projects data sample:", templateProps.userProjects?.[0]);
    
    switch (layout) {
      case 'minimalist-pro':
      case 'minimalist':
        return <MinimalistPro 
          userInfo={{
            ...templateProps.userInfo,
            jobLevel: templateProps.userInfo.jobLevel || null
          }}
          userSkills={templateProps.userSkills}
          userExperiences={templateProps.userExperiences}
          userProjects={templateProps.userProjects}
          userEducations={templateProps.userEducations}
          userServices={templateProps.userServices}
        />;
      case 'timeline-storyteller-2':
      case 'timeline':
        return <TimelineStoryteller 
          userInfo={{
            ...templateProps.userInfo,
            email: templateProps.userInfo.email || '',
            jobLevel: templateProps.userInfo.jobLevel || null
          }}
          userSkills={templateProps.userSkills}
          userExperiences={templateProps.userExperiences}
          userProjects={templateProps.userProjects}
          userEducations={templateProps.userEducations}
          userServices={templateProps.userServices}
        />;
      case 'visual-expert':
      case 'visual':
        return <VisualExpert 
          userInfo={{
            ...templateProps.userInfo,
            jobLevel: templateProps.userInfo.jobLevel || null
          }}
          userSkills={templateProps.userSkills}
          userExperiences={templateProps.userExperiences}
          userProjects={templateProps.userProjects}
          userEducations={templateProps.userEducations}
          userServices={templateProps.userServices}
        />;
      case 'freelancer-hub':
      case 'freelancer':
        return <FreelancerHub 
          userInfo={{
            ...templateProps.userInfo,
            email: templateProps.userInfo.email || '',
            jobLevel: templateProps.userInfo.jobLevel || null
          }}
          userSkills={templateProps.userSkills}
          userExperiences={templateProps.userExperiences}
          userProjects={templateProps.userProjects}
          userEducations={templateProps.userEducations}
          userServices={templateProps.userServices}
        />;
      case 'scholar':
        return <Scholar 
          userInfo={{
            ...templateProps.userInfo,
            jobLevel: templateProps.userInfo.jobLevel || null
          }}
          userSkills={templateProps.userSkills}
          userExperiences={templateProps.userExperiences}
          userProjects={templateProps.userProjects}
          userEducations={templateProps.userEducations}
          userServices={templateProps.userServices}
        />;
      case 'animated':
        return <Animated 
          name={templateProps.userInfo.name}
          title={templateProps.userInfo.title || ''}
          industry={templateProps.userInfo.industry || ''}
          domain={templateProps.userInfo.domain || ''}
          location={templateProps.userInfo.location || ''}
          email={templateProps.userInfo.email || ''}
          photoURL={templateProps.userInfo.photoURL || ''}
          lookingFor={templateProps.userInfo.lookingFor || ''}
          aboutMe={templateProps.userInfo.aboutMe || ''}
          whatIOffer={templateProps.userInfo.whatIOffer || ''}
          skills={templateProps.userSkills}
          services={templateProps.userServices}
          experiences={templateProps.userExperiences}
          educations={templateProps.userEducations}
          projects={templateProps.userProjects}
          id={templateProps.userInfo.id}
          currentUserId={undefined}
        />;
      case 'dynamic-innovator':
      case 'dynamic':
        return <DynamicInnovator 
          userInfo={templateProps.userInfo}
          userSkills={templateProps.userSkills}
          userExperiences={templateProps.userExperiences}
          userProjects={templateProps.userProjects}
          userEducations={templateProps.userEducations}
          userServices={templateProps.userServices}
        />;
      case 'corporate-executive':
      case 'corporate':
        return <CorporateExecutive 
          userInfo={{
            ...templateProps.userInfo,
            jobLevel: templateProps.userInfo.jobLevel || null
          }}
          userSkills={templateProps.userSkills}
          userExperiences={templateProps.userExperiences}
          userProjects={templateProps.userProjects}
          userEducations={templateProps.userEducations}
          userServices={templateProps.userServices}
        />;
      case 'designer-portfolio':
        return <DesignerShowcase 
          userInfo={templateProps.userInfo}
          userSkills={templateProps.userSkills}
          userExperiences={templateProps.userExperiences}
          userProjects={templateProps.userProjects}
          userEducations={templateProps.userEducations}
          userServices={templateProps.userServices}
        />;
      case 'photographer-portfolio':
        return <PhotographerPortfolio 
          userInfo={templateProps.userInfo}
          userSkills={templateProps.userSkills}
          userExperiences={templateProps.userExperiences}
          userProjects={templateProps.userProjects}
          userEducations={templateProps.userEducations}
          userServices={templateProps.userServices}
        />;
      case 'professional':
      default:
        console.log("Rendering CorporateExecutive template with professional layout");
        return <CorporateExecutive 
          userInfo={{
            ...templateProps.userInfo,
            jobLevel: templateProps.userInfo.jobLevel || null
          }}
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